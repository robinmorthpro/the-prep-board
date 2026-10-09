import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { juryAgentSignedUrl, juryAgentToken } from "@/lib/elevenlabs.functions";
import { monologueMeasuresFor, type PhaseStep, type PhaseTiming } from "@/lib/school-interviews";
import { PhaseEngine, REGIE_PREFIX, applyQueuedInstructions, isRegieMessage, type EngineEvent } from "@/lib/phase-engine";
import { buildAnswerSendPlan, cleanJuryMessage } from "@/lib/interview-text";

// La logique de phases vit dans le moteur pur `@/lib/phase-engine` : ce hook ne
// fait que lui transmettre les événements et envoyer ce qu'il renvoie.
export { REGIE_PREFIX, isRegieMessage };

type StartOptions = {
  /** École passée : elle détermine l'agent joint côté serveur. */
  school: string;
  /** null = on laisse le prompt configuré dans l'agent ElevenLabs. */
  prompt: string | null;
  firstMessage: string | null;
  dynamicVariables: Record<string, string>;
  /** Durée maximale de session (minutes simulées + 10), en secondes. */
  maxDurationSeconds?: number;
  /** Minutes réellement simulées : sert aux repères de temps envoyés au jury. */
  totalMinutes?: number;
  /**
   * Calendrier de phases piloté par l'application : chaque repère de temps
   * rappelle la phase en cours, ou ordonne la bascule jusqu'à ce que la phrase
   * de transition verbatim soit détectée dans une prise de parole du jury.
   */
  phaseSchedule?: PhaseStep[] | null;
  onPhaseTimingsChange?: (timings: PhaseTiming[]) => void;
  /**
   * Mode écrit (tests) : aucune voix, aucun micro. Le candidat tape ses
   * réponses, le jury répond en texte. Les réponses sont ajoutées au fil par
   * l'appelant : on ignore alors les éventuels échos côté ElevenLabs.
   */
  textOnly?: boolean;
};



const CONNECTION_TIMEOUT_MS = 15_000;

type PendingConnection = {
  resolve: () => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

/**
 * Traduit en français les erreurs brutes remontées par ElevenLabs.
 * Le message d'origine part toujours en console pour le diagnostic.
 */
export function humanVoiceError(raw: unknown) {
  const text =
    typeof raw === "string" ? raw : raw instanceof Error ? raw.message : raw ? String(raw) : "";
  if (text) console.error("[jury vocal]", text);
  const t = text.toLowerCase();
  if (/quota|credit|insufficient_balance|payment/.test(t)) {
    return "Le service de simulation est momentanément indisponible, réessayez plus tard.";
  }
  if (/unauthorized|401|invalid api key|authentication/.test(t)) {
    return "Le jury n'a pas pu être joint (problème d'accès au service). Réessayez plus tard.";
  }
  if (/agent.*not.*found|404/.test(t)) {
    return "Le jury de cette école n'est pas disponible pour le moment.";
  }
  if (/max.?duration|session.?time/.test(t)) {
    return "La durée maximale de l'entretien est atteinte : terminez l'entretien pour obtenir votre débrief.";
  }
  if (/network|websocket|connection|timeout|ice|transport/.test(t)) {
    return "La connexion au jury a été interrompue. Vérifiez votre réseau puis réessayez.";
  }
  if (/microphone|permission|notallowed/.test(t)) {
    return "Le microphone n'est pas accessible : autorisez-le dans votre navigateur puis réessayez.";
  }
  return "Le service de simulation est momentanément indisponible, réessayez plus tard.";
}

/**
 * Jury vocal temps réel : connexion WebRTC directe avec l'agent ElevenLabs.
 * Le jury parle, écoute en continu, rebondit et peut être interrompu ; il n'y a
 * plus ni bouton « question suivante » ni attente entre les tours.
 *
 * Les questions du jury et les réponses du candidat sont remontées au fur et à
 * mesure pour reconstituer le fil de l'entretien, envoyé ensuite au débrief.
 */
export function useJuryAgent({
  onQuestion,
  onAnswer,
  onError,
  onDisconnect,
  onCandidateVoice,
}: {
  onQuestion: (text: string) => void;
  onAnswer: (text: string) => void;
  onError?: (message: string) => void;
  onDisconnect?: () => void;
  /** Le micro détecte la voix du candidat (oral uniquement). */
  onCandidateVoice?: () => void;
}) {
  const getToken = useServerFn(juryAgentToken);
  /** MODE TEST ÉCRIT (à retirer après les tests). */
  const getSignedUrl = useServerFn(juryAgentSignedUrl);
  const [muted, setMuted] = useState(false);
  const cbRef = useRef({ onQuestion, onAnswer, onError, onDisconnect, onCandidateVoice });
  const textOnlyRef = useRef(false);
  const pendingConnectionRef = useRef<PendingConnection | null>(null);
  /** Moteur de phases : seul détenteur de l'état des phases et des durées. */
  const engineRef = useRef<PhaseEngine | null>(null);
  const loggedEventsRef = useRef(0);
  const onPhaseTimingsChangeRef = useRef<StartOptions["onPhaseTimingsChange"]>(undefined);
  const [closingSent, setClosingSent] = useState(false);
  /**
   * Consignes de l'application en attente : elles partent DANS le repère qui
   * suit la prochaine réponse du candidat, jamais pendant qu'il réfléchit.
   */
  const queuedInstructionsRef = useRef<string[]>([]);
  /**
   * Consignes de type « ta prochaine prise de parole doit être X » : elles
   * partent en mise à jour contextuelle AVANT la réponse du candidat.
   */
  const beforeInstructionsRef = useRef<string[]>([]);
  /** Mode courant du jury : une consigne immédiate ne doit pas le couper. */
  const juryModeRef = useRef<"speaking" | "listening">("listening");
  const pendingNudgesRef = useRef<string[]>([]);
  /**
   * ORAL — un repère de temps a déjà été pré-envoyé et le candidat n'a pas
   * encore répondu depuis : on ne pré-envoie donc rien de plus (les prises de
   * parole du jury dues à une relance ou à un rattrapage ne doivent pas
   * déclencher de repères en rafale).
   */
  const preSentMarkerRef = useRef(false);
  cbRef.current = { onQuestion, onAnswer, onError, onDisconnect, onCandidateVoice };

  const settlePendingConnection = useCallback((error?: Error) => {
    const pending = pendingConnectionRef.current;
    if (!pending) return;
    clearTimeout(pending.timeoutId);
    pendingConnectionRef.current = null;
    if (error) pending.reject(error);
    else pending.resolve();
  }, []);

  /** Journalise les nouveaux événements du moteur et publie les durées. */
  const syncEngine = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const events = engine.events;
    for (const event of events.slice(loggedEventsRef.current)) logEngineEvent(event);
    loggedEventsRef.current = events.length;
    onPhaseTimingsChangeRef.current?.(engine.timings);
    setClosingSent(engine.closingSent);
  }, []);
  const syncEngineRef = useRef(syncEngine);
  syncEngineRef.current = syncEngine;

  const sendUpdatesRef = useRef<(updates: string[]) => void>(() => {});
  const nudgeRef = useRef<(instruction: string) => void>(() => {});
  const sendRegieNowRef = useRef<(instruction: string) => void>(() => {});

  /**
   * Ajoute les consignes en attente au repère qui suit la réponse du candidat.
   * Quand une consigne part, le repère est réduit au temps écoulé : la consigne
   * ne doit jamais être noyée dans un rappel de phase. Si le moteur envoie au
   * même moment un ORDRE de bascule, celui-ci est prioritaire et la consigne
   * reste en file pour le repère suivant.
   */
  const withQueuedInstructions = useCallback((updates: string[]) => {
    const result = applyQueuedInstructions({
      updates,
      queued: queuedInstructionsRef.current,
      marker: engineRef.current?.lastMarker ?? null,
    });
    queuedInstructionsRef.current = result.remaining;
    return result.updates;
  }, []);
  const withQueuedRef = useRef(withQueuedInstructions);
  withQueuedRef.current = withQueuedInstructions;

  /** Vide la file « avant » et renvoie les consignes prêtes à être envoyées. */
  const takeBeforeInstructions = useCallback(() => {
    const queued = beforeInstructionsRef.current;
    if (!queued.length) return [];
    beforeInstructionsRef.current = [];
    return queued.map((instruction) => `${REGIE_PREFIX} ${instruction}`);
  }, []);
  const takeBeforeRef = useRef(takeBeforeInstructions);
  takeBeforeRef.current = takeBeforeInstructions;

  const conversation = useConversation({
    onConnect: () => settlePendingConnection(),
    onVadScore: ({ vadScore }: { vadScore: number }) => {
      if (vadScore > 0.5) cbRef.current.onCandidateVoice?.();
    },
    onModeChange: ({ mode }: { mode: string }) => {
      juryModeRef.current = mode === "speaking" ? "speaking" : "listening";
      // Le jury vient de finir de parler : c'est le vrai début d'un monologue,
      // et le moment où une consigne différée peut enfin partir sans le couper.
      if (mode === "listening") {
        const engine = engineRef.current;
        engine?.onJuryFinishedSpeaking(Date.now());
        // ORAL — repère PRÉ-ENVOYÉ : à l'oral les mots du candidat arrivent trop
        // tard pour envoyer quoi que ce soit avant sa réponse. Le repère part
        // donc ici, dès que le jury se tait : au plus un par réponse du candidat,
        // jamais pendant que le jury parle, jamais après la clôture.
        if (engine && !textOnlyRef.current && !preSentMarkerRef.current && !engine.closingSent) {
          const updates = engine.markerAtJuryTurnEnd(Date.now());
          if (updates.length) {
            preSentMarkerRef.current = true;
            sendUpdatesRef.current(updates);
          }
          syncEngineRef.current();
        }
        const pending = pendingNudgesRef.current;
        pendingNudgesRef.current = [];
        for (const instruction of pending) sendRegieNowRef.current(instruction);
      }
    },
    onMessage: (message: unknown) => {
      const m = message as {
        type?: string;
        source?: string;
        message?: string;
        agent_response_event?: { agent_response?: string };
        user_transcription_event?: { user_transcript?: string };
      };
      const rawAgentText = m.agent_response_event?.agent_response ?? (m.source === "ai" ? m.message : undefined);
      const agentText = rawAgentText === undefined ? undefined : cleanJuryMessage(rawAgentText);
      const userText = m.user_transcription_event?.user_transcript ?? (m.source === "user" ? m.message : undefined);
      // Une consigne de régie ne doit jamais apparaître dans le fil, ni côté
      // jury (il ne doit pas la répéter) ni côté candidat (ce n'est pas lui).
      if (agentText?.trim() && !isRegieMessage(agentText)) {
        const recoveries = engineRef.current?.onJuryMessage(agentText, Date.now()) ?? [];
        syncEngineRef.current();
        // Rattrapage : consigne immédiate, envoyée dès que le jury se tait.
        for (const instruction of recoveries) nudgeRef.current(instruction);
        cbRef.current.onQuestion(agentText.trim());
      }
      else if (userText?.trim() && !textOnlyRef.current && !isRegieMessage(userText)) {
        cbRef.current.onAnswer(userText.trim());
        // Le repère de temps est déjà parti (fin de la prise de parole du jury).
        // Le moteur enregistre la réponse ; on n'envoie ici que ce qui dépend de
        // son CONTENU : un ordre de bascule anticipée nouvellement déclenché,
        // et les consignes déclenchées par la réponse.
        preSentMarkerRef.current = false;
        const updates =
          engineRef.current?.onCandidateAnswerAfterPreSentMarker(userText.trim(), Date.now()) ?? [];
        const before = takeBeforeRef.current();
        sendUpdatesRef.current([...before, ...withQueuedRef.current(updates)]);
        syncEngineRef.current();
      }
    },
    onError: (error: unknown) => {
      const message = humanVoiceError(error);
      settlePendingConnection(new Error(message));
      cbRef.current.onError?.(message);
    },
    onDisconnect: (details) => {
      engineRef.current = null;
      setClosingSent(false);
      const message =
        details.reason === "error"
          ? humanVoiceError(details.message || details.closeReason || "connection closed")
          : "La connexion au jury a été interrompue.";
      settlePendingConnection(new Error(message));
      cbRef.current.onDisconnect?.();
    },
  });

  const sendUpdates = useCallback(
    (updates: string[]) => {
      for (const update of updates) {
        try {
          conversation.sendContextualUpdate(update);
        } catch {
          /* session fermée */
        }
      }
    },
    [conversation],
  );
  sendUpdatesRef.current = sendUpdates;

  const sendRegieNow = useCallback(
    (instruction: string) => {
      try {
        conversation.sendUserMessage(`${REGIE_PREFIX} ${instruction}`);
      } catch (error) {
        console.error("[jury vocal] consigne de régie non transmise", error);
      }
    },
    [conversation],
  );
  sendRegieNowRef.current = sendRegieNow;

  /**
   * Consigne interne adressée au jury. Elle passe par une prise de parole
   * candidat (donc le jury reprend la parole), mais n'est jamais affichée ni
   * enregistrée : le prompt lui interdit d'y faire allusion.
   * À l'oral, elle attend que le jury ait fini de parler : une consigne envoyée
   * pendant sa prise de parole l'interromprait.
   */
  const nudge = useCallback(
    (instruction: string) => {
      if (!textOnlyRef.current && juryModeRef.current === "speaking") {
        pendingNudgesRef.current.push(instruction);
        return;
      }
      sendRegieNow(instruction);
    },
    [sendRegieNow],
  );
  nudgeRef.current = nudge;

  /**
   * Consigne de l'application transmise DANS le repère qui suit la prochaine
   * réponse du candidat : elle ne peut donc jamais devancer sa réponse.
   * Avec `{ before: true }`, elle part au contraire en mise à jour contextuelle
   * JUSTE AVANT la réponse du candidat : le jury l'a déjà quand il rédige, il ne
   * peut donc plus poser une question puis annoncer la bascule derrière.
   */
  const queueInstruction = useCallback((instruction: string, opts?: { before?: boolean }) => {
    if (opts?.before) beforeInstructionsRef.current.push(instruction);
    else queuedInstructionsRef.current.push(instruction);
  }, []);

  const start = useCallback(
    async (opts: StartOptions) => {
      const textOnly = Boolean(opts.textOnly);
      textOnlyRef.current = textOnly;
      queuedInstructionsRef.current = [];
      beforeInstructionsRef.current = [];
      pendingNudgesRef.current = [];
      preSentMarkerRef.current = false;
      juryModeRef.current = "listening";

      if (!textOnly) {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Le microphone n'est pas disponible dans ce navigateur.");
        }

        // Déclenche explicitement la permission dans le geste utilisateur, puis
        // libère aussitôt ce flux : le SDK ouvre ensuite son propre flux WebRTC.
        const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissionStream.getTracks().forEach((track) => track.stop());
      }


      // MODE TEST ÉCRIT : le mode sans audio passe par une URL signée WebSocket,
      // la connexion WebRTC par jeton exigeant un flux audio.
      const session = textOnly
        ? await getSignedUrl({ data: { school: opts.school } })
        : await getToken({ data: { school: opts.school } });
      const usesFallback = session.usesFallback;

      const agentOverrides: Record<string, unknown> = { language: "fr" };
      if (opts.prompt) agentOverrides['prompt'] = { prompt: opts.prompt };
      if (opts.firstMessage) agentOverrides['firstMessage'] = opts.firstMessage;

      const overrides: Record<string, unknown> = { agent: agentOverrides };
      if (opts.maxDurationSeconds) {
        overrides['conversation'] = { max_duration_seconds: opts.maxDurationSeconds };
      }


      // Le moteur est créé AVANT l'ouverture de la session : le premier message
      // du jury peut arriver dès la connexion et doit être compté (les mesures
      // TBS/GEM/INSEEC/ESSEC sont calées sur le 1er ou le 2e message du jury).
      onPhaseTimingsChangeRef.current = opts.onPhaseTimingsChange;
      loggedEventsRef.current = 0;
      setClosingSent(false);
      engineRef.current = new PhaseEngine({
        school: opts.school,
        schedule: opts.phaseSchedule ?? [],
        monologues: monologueMeasuresFor(opts.school),
        totalMinutes: opts.totalMinutes ?? 0,
        startedAt: Date.now(),
        variables: opts.dynamicVariables,
      });

      try {
        await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          pendingConnectionRef.current = null;
          conversation.endSession();
          reject(new Error("Le jury vocal ne répond pas. Vérifiez votre réseau puis réessayez."));
        }, CONNECTION_TIMEOUT_MS);
        pendingConnectionRef.current = { resolve, reject, timeoutId };

        const sessionConfig = textOnly
          ? {
              signedUrl: (session as { signedUrl: string }).signedUrl,
              connectionType: "websocket" as const,
              textOnly: true,
              dynamicVariables: opts.dynamicVariables,
              overrides: overrides as never,
            }
          : {
              conversationToken: (session as { token: string }).token,
              connectionType: "webrtc" as const,
              dynamicVariables: opts.dynamicVariables,
              overrides: overrides as never,
            };
        conversation.startSession(sessionConfig);
        });
      } catch (error) {
        // Connexion impossible : le moteur ne doit pas survivre à l'échec.
        engineRef.current = null;
        throw error;
      }
      syncEngine();

      return { usesFallback };
    },
    [conversation, getToken, getSignedUrl, syncEngine],
  );

  /**
   * Début de phase déclenché par un ÉVÉNEMENT DE L'APPLICATION (question Impact
   * Clermont, tirage des cartes emlyon, fin du compte à rebours EDHEC) : le
   * début est l'instant de l'événement, jamais la détection d'une phrase du jury.
   */
  const markPhaseStart = useCallback((phaseId: string, label: string) => {
    engineRef.current?.markPhaseStart(phaseId, Date.now(), label);
    syncEngineRef.current();
  }, []);

  const markPhaseEnd = useCallback((phaseId: string) => {
    engineRef.current?.markPhaseEnd(phaseId, Date.now());
    syncEngineRef.current();
  }, []);


  const stop = useCallback(async () => {
    engineRef.current = null;
    queuedInstructionsRef.current = [];
    beforeInstructionsRef.current = [];
    pendingNudgesRef.current = [];
    preSentMarkerRef.current = false;
    setClosingSent(false);
    try {
      await conversation.endSession();
    } catch {
      /* session déjà fermée */
    }
  }, [conversation]);

  useEffect(
    () => () => {
      const pending = pendingConnectionRef.current;
      if (pending) clearTimeout(pending.timeoutId);
    },
    [],
  );


  /**
   * Transmet une information contextuelle au jury sans déclencher de réponse
   * (ex. : le candidat vient de choisir une situation à l'écran).
   */
  const notifyContext = useCallback(
    (message: string) => {
      try {
        conversation.sendContextualUpdate(message);
      } catch {
        /* session non démarrée */
      }
    },
    [conversation],
  );

  /** Mode écrit : envoie la réponse tapée par le candidat comme prise de parole. */
  const sendWrittenAnswer = useCallback(
    async (text: string) => {
      // TOUTES les mises à jour contextuelles (consignes « avant », repère de
      // temps, consignes en file) partent AVANT le message du candidat, puis une
      // courte pause de 300 ms. Un repère envoyé après la réponse est traité par
      // le modèle comme son tour : le jury reste alors muet.
      const updates = engineRef.current?.onCandidateAnswer(text, Date.now()) ?? [];
      const plan = buildAnswerSendPlan({
        before: takeBeforeInstructions(),
        answer: text,
        after: withQueuedInstructions(updates),
      });
      for (const send of plan.filter((item) => item.kind === "context")) sendUpdates([send.text]);
      syncEngine();
      const answer = plan.find((item) => item.kind === "user");
      if (!answer) return;
      if (plan.length > 1) await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        conversation.sendUserMessage(answer.text);
      } catch (error) {
        console.error("[jury vocal] réponse écrite non transmise", error);
      }
    },
    [conversation, withQueuedInstructions, takeBeforeInstructions, sendUpdates, syncEngine],
  );

  const toggleMute = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    try {
      await conversation.setVolume({ volume: next ? 0 : 1 });
    } catch {
      /* session non démarrée */
    }
  }, [conversation, muted]);

  return {
    status: conversation.status,
    connected: conversation.status === "connected",
    jurySpeaking: conversation.isSpeaking,
    muted,
    toggleMute,
    start,
    stop,
    notifyContext,
    nudge,
    queueInstruction,
    sendWrittenAnswer,
    closingSent,
    markPhaseStart,
    markPhaseEnd,
  };
}

/** Trace lisible des décisions du moteur de phases. */
function logEngineEvent(event: EngineEvent) {
  const suffix = event.phaseId ? ` (${event.phaseId})` : "";
  switch (event.type) {
    case "switch-ordered":
      console.info(`[jury vocal] bascule ordonnée par l'application${suffix}`);
      break;
    case "early-ordered-dry":
      console.info(`[jury vocal] 3 réponses sèches consécutives : bascule anticipée ordonnée par l'application${suffix}`);
      break;
    case "early-ordered-nothing-to-add":
      console.info(`[jury vocal] le candidat n'a rien à ajouter : bascule ordonnée par l'application${suffix}`);
      break;
    case "unordered-switch":
      console.warn("[jury vocal] bascule non ordonnée par l'application : phase confirmée sans malus");
      break;
    case "improvised-switch":
      console.warn("[jury vocal] transition improvisée détectée : phase confirmée sans malus");
      break;
    case "recovered-switch":
      console.warn(`[jury vocal] changement de partie annoncé trop tôt : rattrapage envoyé${suffix}`);
      break;
    case "forced-after-2-markers":
      console.info(`[jury vocal] bascule non détectée après 2 repères : phase considérée comme commencée${suffix}`);
      break;
    case "phase-confirmed":
      console.info(`[jury vocal] phase confirmée${suffix}`);
      break;
    case "closing":
      console.info("[jury vocal] clôture demandée au jury");
      break;
  }
}
