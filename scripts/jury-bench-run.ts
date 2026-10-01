/**
 * BANC D'ESSAI AUTOMATIQUE DU JURY
 *
 * Un candidat SCRIPTÉ passe un entretien complet face au VRAI agent ElevenLabs,
 * avec exactement le prompt, le premier message, les variables dynamiques et le
 * moteur de phases de l'application. On joue la même campagne avec l'ANCIENNE et
 * la NOUVELLE version du prompt, puis on compare les mesures.
 *
 * Ce script ne modifie RIEN dans l'application et n'écrit RIEN en base : il ne
 * lit que du code existant et n'écrit que sous `scripts/bench-output/`.
 *
 * Usage :
 *   bun scripts/jury-bench-run.ts                  → les deux versions, 4 écoles
 *   bun scripts/jury-bench-run.ts --version=new    → une seule version
 *   bun scripts/jury-bench-run.ts --report         → rapport seul, depuis les fils déjà enregistrés
 *
 * ---------------------------------------------------------------------------
 * CE QUI EST RECOPIÉ DE `src/routes/_app.partie-8.tsx` (non exporté là-bas) :
 *  1. la construction de l'objet `dynamicVariables` (bloc `agent.start({...})`) ;
 *  2. les arguments passés à `buildFirstMessage` ;
 *  3. l'ordre des tirages (GEM, ESSEC, emlyon, KEDGE, EDHEC, Clermont) ;
 *  4. la fusion des prises de parole du jury tant que le candidat n'a pas
 *     répondu (`handleJuryQuestion`) ;
 *  5. le secours « main rendue sans question » et ses conditions d'éligibilité ;
 *  6. la détection de la phrase de clôture (« bonne continuation ») ;
 *  7. EDHEC : passage à l'écran de préparation après le 1er message du jury,
 *     puis `markPhaseStart("edhec-presentation")`, et fin de phase à la
 *     détection de « nous passons maintenant à l'entretien individuel ».
 * Le reste (prompt, premier message, moteur de phases, plan d'envoi, nettoyage
 * des messages) est importé tel quel depuis `src/`.
 * ---------------------------------------------------------------------------
 */
import { PhaseEngine, REGIE_PREFIX, isRegieMessage } from "../src/lib/phase-engine";
import { buildAnswerSendPlan, cleanJuryMessage, normalizeInterviewText, INVITATION_RE } from "../src/lib/interview-text";
import {
  CLASSIQUE_AGENT_ENV,
  buildClermontImpactVariables,
  buildFirstMessage,
  difficultiesFor,
  getSchoolInterviewConfig,
  monologueMeasuresFor,
  phaseScheduleFor,
  promptFor,
  simulatedMinutes,
} from "../src/lib/school-interviews";
import { difficultyBlock } from "../src/lib/elevenlabs-agent-prompt";
import { buildAgentIdentity } from "../src/lib/elevenlabs-agent-prompt";
import { pickGemPersona } from "../src/lib/gem-kb";
import { pickEssecSituation } from "../src/lib/essec-kb";
import { drawEmlyonCards } from "../src/lib/emlyon-kb";
import { pickEdhecWord } from "../src/lib/edhec-kb";
import { drawKedgeCards } from "../src/lib/kedge-kb";
import { measureJuryBench, benchDurationMinutes, type BenchTurn } from "../src/lib/jury-bench";
import { KEY_QUESTIONS } from "../src/lib/vivaldi-data";
import type { InterviewVariant } from "../src/lib/interview-kb";

// ------------------------------------------------------------------ réglages

/** Écoles du banc : trois formats spécifiques + un format classique nu. */
const SCHOOLS = ["ESSEC", "KEDGE", "EDHEC", "ICN Business School"] as const;
/** Horloge virtuelle : durée attribuée à chaque prise de parole. */
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const speechMs = (text: string, wpm: number) => (words(text) / wpm) * 60_000;
/** Silence à respecter après la dernière phrase du jury avant de répondre. */
const IDLE_MS = 3_500;
/** Attente maximale d'une prise de parole du jury. */
const TURN_TIMEOUT_MS = 60_000;
const OUT_DIR = "scripts/bench-output";
const QUESTION_BANK = KEY_QUESTIONS.map((q) => q.question);
const OLD_COMMIT = "70fa9ac86db79218027439f958d9b4524621d384";

/**
 * Trois versions comparées : `old` = prompt d'origine (V0), `new` = prompt
 * d'hier (V1), `v2` = prompt courant (V2, après correction du tic de reprise).
 */
type Version = "old" | "new" | "v2";
const VERSIONS = ["old", "new", "v2"] as const;
const LABELS: Record<Version, string> = {
  old: "V0 origine",
  new: "V1 hier",
  v2: "V2 aujourd'hui",
};

// ----------------------------------------------------------------- outillage

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Exécute `fn` avec un `Math.random` déterministe, puis restaure l'original. */
function withSeed<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  Math.random = seeded(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

/** Graine fixe par école : les mêmes tirages pour les deux versions. */
function seedFor(school: string) {
  let hash = 2166136261;
  for (const char of school) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------- URL signée (même logique
// que `juryAgentSignedUrl` dans src/lib/elevenlabs.functions.ts)

function resolveAgent(school: string) {
  const config = getSchoolInterviewConfig(school);
  const dedicated = process.env[config.agentIdEnv];
  const shared = process.env[CLASSIQUE_AGENT_ENV];
  const usesFallback = !dedicated && config.agentIdEnv !== CLASSIQUE_AGENT_ENV;
  return { config, agentId: dedicated ?? shared, usesFallback };
}

async function signedUrlFor(school: string) {
  const apiKey = process.env["ELEVENLABS_API_KEY"];
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY absente de l'environnement.");
  const { agentId } = resolveAgent(school);
  if (!agentId) throw new Error(`Aucun agent déclaré pour ${school}.`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey } },
  );
  if (!res.ok) throw new Error(`URL signée refusée (${res.status}) : ${await res.text()}`);
  const json = (await res.json()) as { signed_url?: string };
  if (!json.signed_url) throw new Error("URL signée absente de la réponse ElevenLabs.");
  return json.signed_url;
}

// ------------------------------------------------------- prompts des 2 versions

function variantFor(school: string): InterviewVariant {
  const config = getSchoolInterviewConfig(school);
  const available = difficultiesFor(config);
  if (!available.length) return "classique";
  return available.includes("classique") ? "classique" : available[0]!;
}

/** Prompts de la version courante, école par école. */
function newPrompts() {
  const out: Record<string, string> = {};
  for (const school of SCHOOLS) {
    const config = getSchoolInterviewConfig(school);
    const prompt = promptFor(config, variantFor(school));
    if (!prompt) throw new Error(`Aucun prompt maison pour ${school}.`);
    out[school] = prompt;
  }
  return out;
}

/**
 * Prompts de l'ancienne version : worktree git temporaire sur `OLD_COMMIT`,
 * appel du `buildJuryAgentPrompt` de l'époque avec les mêmes arguments.
 */
async function oldPrompts() {
  const worktree = "/tmp/jury-bench-old";
  const specPath = "/tmp/jury-bench-specs.json";
  const outPath = "/tmp/jury-bench-old-prompts.json";
  const specs = SCHOOLS.map((school) => {
    const config = getSchoolInterviewConfig(school);
    // Même assemblage que `promptFor` : note d'ouverture + conduite de l'école.
    const conduct = [openingNoteOf(config), config.conductNote].filter(Boolean).join("\n\n");
    return {
      school,
      variant: variantFor(school),
      durationMinutes: simulatedMinutes(config),
      conductNote: conduct,
    };
  });
  await Bun.write(specPath, JSON.stringify(specs, null, 2));
  await run(["rm", "-rf", worktree]);
  await run(["git", "worktree", "add", "--detach", worktree, OLD_COMMIT]);
  try {
    await run(["cp", "scripts/jury-bench-old-prompt-dump.ts", `${worktree}/scripts/`]);
    await run(["bun", "scripts/jury-bench-old-prompt-dump.ts", specPath, outPath], worktree);
    return (await Bun.file(outPath).json()) as Record<string, string>;
  } finally {
    await run(["git", "worktree", "remove", "--force", worktree]);
  }
}

/** `openingNote` n'est pas exportée pour tous les cas : on la réimporte. */
import { openingNote as openingNoteOf } from "../src/lib/school-interviews";

async function run(cmd: string[], cwd?: string) {
  const proc = Bun.spawn(cmd, { cwd: cwd ?? process.cwd(), stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0 && cmd[0] !== "rm") throw new Error(`${cmd.join(" ")} → code ${code}\n${out}\n${err}`);
  return out;
}

// ---------------------------------------------- variables et premier message
// (recopié de `src/routes/_app.partie-8.tsx`, bloc `agent.start`)

type Setup = {
  firstMessage: string;
  dynamicVariables: Record<string, string>;
  totalMinutes: number;
  schedule: ReturnType<typeof phaseScheduleFor>;
};

function setupFor(school: string, run = 1): Setup {
  const config = getSchoolInterviewConfig(school);
  // Graine fixe par école ET par passage : chaque passage tire des variables
  // différentes, mais toujours les mêmes d'une campagne à l'autre.
  const seed = run === 1 ? seedFor(school) : (Math.imul(seedFor(school) ^ run, 2654435761) >>> 0);
  const draws = withSeed(seed, () => ({
    gemPersona: config.school === "GEM (Grenoble EM)" ? pickGemPersona() : "",
    essec: config.school === "ESSEC" ? pickEssecSituation() : null,
    emlyon: config.school === "emlyon" ? drawEmlyonCards() : null,
    kedge: config.school === "KEDGE" ? drawKedgeCards() : null,
    edhec: config.school === "EDHEC" ? pickEdhecWord() : null,
    clermont: buildClermontImpactVariables(config.school),
  }));
  const variant = variantFor(school);
  const hasDifficulties = difficultiesFor(config).length > 0;
  return {
    totalMinutes: simulatedMinutes(config),
    schedule: phaseScheduleFor(config),
    firstMessage: buildFirstMessage(config, {
      firstName: "Camille",
      edhecWord: draws.edhec,
      articleTitle: null,
      inseecImage: null,
    }),
    dynamicVariables: {
      school: config.school,
      student_name: "Camille Perrin",
      prepa: "",
      career_project: "",
      school_sheet: "",
      experiences: "",
      news_topics: "",
      support_text: "",
      difficulty_block: hasDifficulties ? difficultyBlock(variant) : "Entretien standard, jury neutre.",
      gem_persona: draws.gemPersona,
      situation_enonce: draws.essec ?? "",
      inseec_image: "",
      card_experience: draws.emlyon?.experience ?? "",
      card_personnalite: draws.emlyon?.personnalite ?? "",
      card_projet: draws.emlyon?.projet ?? "",
      card_creativite: draws.emlyon?.creativite ?? "",
      edhec_mot: draws.edhec ?? "",
      kedge_odd: draws.kedge?.odd ?? "",
      kedge_autoportrait: draws.kedge?.autoportrait ?? "",
      kedge_action: draws.kedge?.action ?? "",
      kedge_pensee: draws.kedge?.pensee ?? "",
      kedge_esprit: draws.kedge?.esprit ?? "",
      ...draws.clermont,
    },
  };
}

// ------------------------------------------------------------- candidat script

type CandidateScript = { clear: string; ready: string; presentation: string; answers: string[] };
type CandidateProfile = { name: string; behavior: string; background: string };

function cleanCandidateSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?/g, "").replace(/```/g, ""))
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*(?:[-*+] |\d+[.)]\s+)/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function candidateScript(): Promise<CandidateScript> {
  return (await Bun.file("scripts/bench-candidate.json").json()) as CandidateScript;
}

async function candidateProfile(name: "proactif" | "passif") {
  const profiles = (await Bun.file("scripts/bench-candidate-profiles.json").json()) as Record<string, CandidateProfile>;
  return profiles[name]!;
}

async function aiCandidate(profile: CandidateProfile, school: string, jury: string, transcript: BenchTurn[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY absente de l'environnement.");
  const history = transcript.slice(-10).flatMap((turn) => [
    { role: "user", content: turn.question },
    { role: "assistant", content: turn.answer },
  ]);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      temperature: 0.45,
      messages: [
        { role: "system", content: `Vous jouez ${profile.name}, élève français de prépa à l'oral d'admission de ${school}. ${profile.behavior}\nProfil fixe : ${profile.background}\nRépondez réellement à la dernière question du jury, y compris exercice ou mise en situation. Langage oral naturel, 60 à 250 mots, sans didascalies. Répondez en texte oral pur : aucun markdown, aucun gras, aucun italique, aucune liste, aucun titre. Ne sortez jamais du personnage.` },
        ...history,
        { role: "user", content: jury },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Passerelle Lovable AI ${res.status}: ${await res.text()}`);
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const answer = json.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("Réponse vide du candidat IA.");
  return cleanCandidateSpeech(answer);
}

async function subscription() {
  const key = process.env["ELEVENLABS_API_KEY"];
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key ?? "" } });
  return res.ok ? await res.json() as Record<string, unknown> : { error: `${res.status} ${await res.text()}` };
}

/** Réponse d'ouverture attendue par la question d'accueil de l'école. */
function openingReply(firstMessage: string, script: CandidateScript) {
  const normalized = normalizeInterviewText(firstMessage);
  if (/est-ce que c'est clair/.test(normalized)) return script.clear;
  if (/etes-vous pret|etes-vous prete|pret a commencer/.test(normalized)) return script.ready;
  return null;
}

// ---------------------------------------------------------- un entretien joué

/**
 * Ordre d'envoi autour de la réponse du candidat :
 * - "before" (DÉFAUT, mode écrit actuel de l'application) : repère de temps et
 *   consignes en file envoyés en mise à jour contextuelle AVANT la réponse,
 *   courte pause de 300 ms, puis la réponse ;
 * - "after" (ancien ordre, conservé pour comparaison) : la réponse d'abord, le
 *   repère ensuite.
 * Le contenu est calculé exactement de la même façon (`onCandidateAnswer`) :
 * seul l'ordre d'envoi change.
 */
/**
 * - "oral" : enchaînement EXACT de `useJuryAgent` à l'oral (option A) :
 *   fin de prise de parole du jury → `onJuryFinishedSpeaking` puis
 *   `markerAtJuryTurnEnd` (au plus un par réponse) en mise à jour contextuelle,
 *   puis la réponse en message utilisateur, puis ce que renvoie
 *   `onCandidateAnswerAfterPreSentMarker` (ordre devenu dû, bascule anticipée,
 *   clôture) en mise à jour contextuelle.
 */
type SendOrder = "after" | "before" | "oral";

type Interview = {
  school: string;
  version: Version;
  /** Ordre d'envoi utilisé (les fils historiques n'en ont pas : "after"). */
  order?: SendOrder;
  /** Numéro de passage quand plusieurs entretiens sont joués par école. */
  run?: number;
  turns: BenchTurn[];
  juryMessages: string[];
  applicationMessages?: { at: number; timestamp: string; kind: "contextual_update" | "user_message"; text: string }[];
  closed: boolean;
  /** Événements du moteur de phases (contrôle du pilotage des parties). */
  events?: { at: number; type: string; phaseId?: string }[];
  /** Mode oral : une entrée par réponse, vrai si un envoi a suivi la réponse. */
  afterSends?: boolean[];
  /** Code et motif de fermeture du WebSocket, pour diagnostic. */
  closeInfo?: string;
};

async function playInterview(
  school: string,
  version: Version,
  prompt: string,
  script: CandidateScript | CandidateProfile,
  order: SendOrder = "before",
  run = 1,
  realistic = false,
): Promise<Interview> {
  const config = getSchoolInterviewConfig(school);
  const setup = setupFor(school, run);
  const signedUrl = await signedUrlFor(school);

  // Horloge VIRTUELLE : le moteur de phases ne voit jamais le temps réel.
  const t0 = Date.parse("2026-01-06T09:00:00.000Z");
  let now = t0;
  const engine = new PhaseEngine({
    school,
    schedule: setup.schedule ?? [],
    monologues: monologueMeasuresFor(school),
    totalMinutes: setup.totalMinutes,
    startedAt: t0,
  });

  const turns: BenchTurn[] = [];
  const juryMessages: string[] = [];
  const applicationMessages: NonNullable<Interview["applicationMessages"]> = [];
  let currentQuestion = "";
  let askedAt = new Date(t0).toISOString();
  let answered = true;
  let juryCount = 0;
  let closed = false;
  let lastMessageAt = 0;
  let mainRendue = 0;
  let handRescuePending: string | null = null;
  let edhecStage: "word" | "after" = "word";
  let edhecPhaseStarted = false;
  let nudgeJustSent = false;
  /** Mode oral : un repère pré-envoyé au plus par réponse du candidat. */
  let preSentMarker = false;
  /** Mode oral : vrai si un envoi a suivi la réponse, une entrée par réponse. */
  const afterSends: boolean[] = [];

  const socket = new WebSocket(`${signedUrl}${signedUrl.includes("?") ? "&" : "?"}source=js_sdk&version=bench`);
  const send = (payload: unknown) => socket.send(JSON.stringify(payload));
  const sendUser = (text: string) => send({ type: "user_message", text });
  const sendContext = (text: string) => {
    applicationMessages.push({ at: now, timestamp: new Date(now).toISOString(), kind: "contextual_update", text });
    send({ type: "contextual_update", text });
  };
  const sendRegieNow = (instruction: string) => {
    nudgeJustSent = true;
    const text = `${REGIE_PREFIX} ${instruction}`;
    applicationMessages.push({ at: now, timestamp: new Date(now).toISOString(), kind: "user_message", text });
    sendUser(text);
  };

  let closeInfo = "";
  socket.addEventListener("close", (event) => {
    const e = event as CloseEvent;
    closeInfo = `${e.code} ${e.reason}`;
  });
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => reject(new Error("WebSocket en erreur à l'ouverture.")));
  });

  // Mêmes surcharges que l'application (cf. `useJuryAgent.start`), traduites
  // dans le format brut du protocole (le SDK fait la même conversion).
  send({
    type: "conversation_initiation_client_data",
    conversation_config_override: {
      agent: { prompt: { prompt }, first_message: setup.firstMessage, language: "fr" },
      conversation: { text_only: true },
    },
    dynamic_variables: setup.dynamicVariables,
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String((event as MessageEvent).data)) as Record<string, any>;
    if (message["type"] === "ping") {
      send({ type: "pong", event_id: message["ping_event"]?.event_id });
      return;
    }
    if (message["type"] !== "agent_response") return;
    const raw = message["agent_response_event"]?.agent_response as string | undefined;
    if (!raw?.trim()) return;
    const text = cleanJuryMessage(raw).trim();
    if (!text || isRegieMessage(text)) return;

    now += speechMs(text, 150);
    lastMessageAt = Date.now();
    juryCount += 1;
    juryMessages.push(text);
    const normalized = normalizeInterviewText(text);
    handRescuePending = null;

    const recoveries = engine.onJuryMessage(text, now);
    // Le jury est « silencieux » en mode écrit : la consigne part aussitôt.
    for (const instruction of recoveries) sendRegieNow(instruction);

    currentQuestion = !answered && currentQuestion ? `${currentQuestion}\n${text}` : text;
    if (answered) askedAt = new Date(now).toISOString();
    answered = false;

    // EDHEC (recopié de la route) : fin de la présentation imposée.
    if (juryCount > 1 && /nous passons maintenant a l'entretien individuel/.test(normalized)) {
      edhecStage = "after";
      engine.markPhaseEnd("edhec-presentation", now);
    }
    if (juryCount > 1 && /bonne continuation/.test(normalized)) {
      const elapsedSeconds = (now - t0) / 1000;
      if (elapsedSeconds >= setup.totalMinutes * 60 - 180 || engine.closingSent) closed = true;
    }
    // Secours « main rendue sans question » (recopié de la route).
    const justNudged = nudgeJustSent;
    nudgeJustSent = false;
    const eligible =
      text.length > 8 &&
      !text.includes("?") &&
      mainRendue < 3 &&
      juryCount > 1 &&
      !justNudged &&
      !INVITATION_RE.test(normalized) &&
      !(config.school === "EDHEC" && edhecStage !== "after");
    if (eligible) {
      handRescuePending =
        "Tu viens de rendre la main sans poser de question. Pose immédiatement ta question suivante, en une phrase, sans revenir sur ce que tu as déjà dit.";
    }
  });

  /** Attend que le jury ait fini de parler (silence de `IDLE_MS`). */
  async function waitForJury() {
    const deadline = Date.now() + TURN_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(500);
      if (socket.readyState > 1) return;
      if (lastMessageAt && Date.now() - lastMessageAt >= IDLE_MS) return;
    }
  }

  const queue: string[] = [];
  if (!realistic) {
    const fixed = script as CandidateScript;
    const opening = openingReply(setup.firstMessage, fixed);
    if (opening) queue.push(opening);
    queue.push(fixed.presentation, ...fixed.answers);
  }

  let sent = 0;
  while ((now - t0) / 60_000 <= setup.totalMinutes + 10 && !closed && socket.readyState <= 1) {
    await waitForJury();
    if (closed || socket.readyState > 1) break;
    // Le jury a rendu la main sans question : consigne immédiate, puis on
    // attend sa nouvelle prise de parole avant de répondre.
    if (handRescuePending) {
      const instruction = handRescuePending;
      handRescuePending = null;
      mainRendue += 1;
      sendRegieNow(instruction);
      continue;
    }
    // EDHEC : une minute de préparation, puis début de la présentation.
    if (config.school === "EDHEC" && !edhecPhaseStarted && juryCount >= 1) {
      edhecPhaseStarted = true;
      now += 60_000;
      engine.markPhaseStart("edhec-presentation", now, "Présentation EDHEC");
    }
    const answer = realistic
      ? await aiCandidate(script as CandidateProfile, school, currentQuestion || setup.firstMessage, turns)
      : queue[Math.min(sent, queue.length - 1)]!;
    sent += 1;
    if (order === "oral") {
      // ORAL (option A) : le jury vient de se taire. Fin de prise de parole,
      // puis repère PRÉ-ENVOYÉ, au plus un par réponse du candidat, jamais
      // après la clôture.
      engine.onJuryFinishedSpeaking(now);
      if (!preSentMarker && !engine.closingSent) {
        const pre = engine.markerAtJuryTurnEnd(now);
        if (pre.length) {
          preSentMarker = true;
          for (const item of pre) sendContext(item);
        }
      }
      now += speechMs(answer, 140);
      turns.push({ question: currentQuestion, answer, askedAt, answeredAt: new Date(now).toISOString() });
      currentQuestion = "";
      answered = true;
      sendUser(answer);
      // Juste après la réponse : seulement ce qui dépend de son contenu ou est
      // devenu dû pendant la réponse (ordre de bascule, bascule anticipée, clôture).
      preSentMarker = false;
      const after = engine.onCandidateAnswerAfterPreSentMarker(answer, now);
      afterSends.push(after.length > 0);
      for (const item of after) sendContext(item);
      lastMessageAt = 0;
      continue;
    }
    now += speechMs(answer, 140);
    turns.push({ question: currentQuestion, answer, askedAt, answeredAt: new Date(now).toISOString() });
    currentQuestion = "";
    answered = true;
    const updates = engine.onCandidateAnswer(answer, now);
    if (order === "before") {
      // Mode écrit actuel de l'application : plan d'envoi de `buildAnswerSendPlan`
      // (toutes les mises à jour contextuelles d'abord), pause de 300 ms, réponse.
      const plan = buildAnswerSendPlan({ before: [], answer, after: updates });
      for (const item of plan.filter((send) => send.kind === "context")) sendContext(item.text);
      await sleep(300);
      sendUser(answer);
    } else {
      // Ancien ordre, conservé pour comparaison : la réponse, puis le repère.
      sendUser(answer);
      for (const item of updates) sendContext(item);
    }
    lastMessageAt = 0;
  }

  try {
    socket.close(1000, "fin du banc");
  } catch {
    /* déjà fermé */
  }
  return {
    school,
    version,
    order,
    run,
    turns,
    juryMessages,
    applicationMessages,
    closed,
    events: engine.events.map((event) => ({ at: event.at, type: event.type, phaseId: event.phaseId })),
    afterSends,
    closeInfo,
  };
}

// ------------------------------------------------------ mesure des exemples

/** Les six exemples de ton du prompt courant, extraits du bloc EXEMPLES DE TON. */
function toneExamples() {
  const identity = buildAgentIdentity(25);
  const block = identity.split("EXEMPLES DE TON")[1]?.split("CE QUE TU NE FAIS JAMAIS")[0] ?? "";
  return [...block.matchAll(/«\s*([^»]+?)\s*»/g)].map((m) => m[1]!).filter((s) => s.split(/\s+/).length > 5);
}

const wordsOf = (text: string) =>
  normalizeInterviewText(text)
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/.test(w));

/** Similarité de Jaccard sur les mots. */
function similarity(a: string, b: string) {
  const setA = new Set(wordsOf(a));
  const setB = new Set(wordsOf(b));
  if (!setA.size || !setB.size) return 0;
  let common = 0;
  for (const word of setA) if (setB.has(word)) common += 1;
  return common / (setA.size + setB.size - common);
}

type ExampleReuse = { maxima: number[]; reused: number };

/** Réutilisation des exemples de ton : similarité max par prise de parole. */
function exampleReuse(juryTexts: string[], examples: string[]): ExampleReuse {
  const maxima = juryTexts.map((text) => Math.max(0, ...examples.map((example) => similarity(text, example))));
  return { maxima, reused: maxima.filter((value) => value >= 0.6).length };
}

// ------------------------------------------------------------------- rapport

type Row = {
  school: string;
  juryTurns: number;
  qualityFaults: { excerpt: string; index: number }[];
  doubleQuestions: number;
  longTurns: number;
  reused: number;
  median: number;
  p90: number;
  shortShare: number;
  richShare: number;
  wordShare: number;
  formulaOpenerShare: number;
  pointingRepriseShare: number;
  openers: { opener: string; count: number; share: number }[];
  openerRepeats: number;
  repeatedQuestions: number;
  minutes: number;
};

function rowFor(interview: Interview, examples: string[]): Row {
  const metrics = measureJuryBench(interview.turns, QUESTION_BANK);
  const juryTexts = interview.turns.map((turn) => turn.question).filter((text) => text.trim());
  return {
    school: interview.school,
    juryTurns: metrics.juryTurns,
    qualityFaults: metrics.qualityCommentTurns,
    doubleQuestions: metrics.doubleQuestionTurns.length,
    longTurns: metrics.longTurns.length,
    reused: exampleReuse(juryTexts, examples).reused,
    median: metrics.juryTurnLength.median,
    p90: metrics.juryTurnLength.p90,
    shortShare: metrics.juryTurnLength.shortShare,
    richShare: metrics.juryTurnLength.richShare,
    wordShare: metrics.juryWordShare,
    formulaOpenerShare: metrics.formulaOpenerShare,
    pointingRepriseShare: metrics.pointingRepriseShare,
    openers: metrics.openerRepeats,
    openerRepeats: metrics.openerRepeats.length,
    repeatedQuestions: metrics.repeatedQuestions.length,
    minutes: benchDurationMinutes(interview.turns),
  };
}

const pct = (value: number) => `${Math.round(value * 100)}%`;
const pct1 = (value: number) => `${(value * 100).toFixed(1)}%`;
const per100 = (count: number, turns: number) => (turns ? (count * 100) / turns : 0).toFixed(1);
const avg = (values: number[], weights: number[]) => {
  const total = weights.reduce((a, b) => a + b, 0);
  if (!total) return 0;
  return values.reduce((sum, value, index) => sum + value * weights[index]!, 0) / total;
};

function aggregate(rows: Row[]) {
  const turns = rows.reduce((sum, row) => sum + row.juryTurns, 0);
  const weights = rows.map((row) => row.juryTurns);
  // Amorces les plus répétées, toutes écoles confondues.
  const openerCounts = new Map<string, number>();
  for (const row of rows) {
    for (const opener of row.openers) {
      openerCounts.set(opener.opener, (openerCounts.get(opener.opener) ?? 0) + opener.count);
    }
  }
  const topOpeners = [...openerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([opener, count]) => ({ opener, count, share: turns ? count / turns : 0 }));
  return {
    turns,
    faults: rows.reduce((sum, row) => sum + row.qualityFaults.length, 0),
    doubles: rows.reduce((sum, row) => sum + row.doubleQuestions, 0),
    longs: rows.reduce((sum, row) => sum + row.longTurns, 0),
    reused: rows.reduce((sum, row) => sum + row.reused, 0),
    median: avg(rows.map((r) => r.median), weights),
    p90: avg(rows.map((r) => r.p90), weights),
    shortShare: avg(rows.map((r) => r.shortShare), weights),
    richShare: avg(rows.map((r) => r.richShare), weights),
    wordShare: avg(rows.map((r) => r.wordShare), weights),
    formulaOpenerShare: avg(rows.map((r) => r.formulaOpenerShare), weights),
    pointingRepriseShare: avg(rows.map((r) => r.pointingRepriseShare), weights),
    topOpeners,
    openerRepeats: rows.reduce((sum, row) => sum + row.openerRepeats, 0),
    repeatedQuestions: rows.reduce((sum, row) => sum + row.repeatedQuestions, 0),
  };
}

function printReport(byVersion: Record<Version, Row[]>) {
  const agg = {
    old: aggregate(byVersion.old),
    new: aggregate(byVersion.new),
    v2: aggregate(byVersion.v2),
  } as Record<Version, ReturnType<typeof aggregate>>;
  const line = (label: string, a: string, b: string, c: string) =>
    `${label.padEnd(34)}| ${a.padStart(12)} | ${b.padStart(12)} | ${c.padStart(12)}`;
  const trio = (fn: (a: ReturnType<typeof aggregate>) => string) => [fn(agg.old), fn(agg.new), fn(agg.v2)] as const;
  const width = 80;
  console.log("\n" + "=".repeat(width));
  console.log("RAPPORT V0 ORIGINE / V1 HIER / V2 AUJOURD'HUI — agrégé sur les 4 écoles");
  console.log("=".repeat(width));
  console.log(line("", "V0 origine", "V1 hier", "V2 aujourd'hui"));
  console.log("-".repeat(width));
  console.log(line("Prises de parole du jury", ...trio((a) => String(a.turns))));
  console.log(line("Jugements de qualité /100", ...trio((a) => per100(a.faults, a.turns))));
  console.log(line("Questions à tiroir /100", ...trio((a) => per100(a.doubles, a.turns))));
  console.log(line("Tours > 60 mots /100", ...trio((a) => per100(a.longs, a.turns))));
  console.log(line("Reprises d'un exemple /100", ...trio((a) => per100(a.reused, a.turns))));
  console.log(line("Formules d'accueil", ...trio((a) => pct1(a.formulaOpenerShare))));
  console.log(line("Reprises désignatives", ...trio((a) => pct1(a.pointingRepriseShare))));
  console.log(line("Longueur médiane (mots)", ...trio((a) => a.median.toFixed(1))));
  console.log(line("Longueur p90 (mots)", ...trio((a) => a.p90.toFixed(1))));
  console.log(line("Part < 15 mots", ...trio((a) => pct(a.shortShare))));
  console.log(line("Part ≥ 40 mots", ...trio((a) => pct(a.richShare))));
  console.log(line("Part de parole du jury", ...trio((a) => pct(a.wordShare))));
  console.log(line("Questions reposées (total)", ...trio((a) => String(a.repeatedQuestions))));
  for (let rank = 0; rank < 3; rank += 1) {
    console.log(
      line(
        `Amorce répétée n°${rank + 1}`,
        ...trio((a) => {
          const item = a.topOpeners[rank];
          return item ? `${item.opener} ${pct(item.share)}` : "—";
        }),
      ),
    );
  }

  for (const version of VERSIONS) {
    console.log("\n" + "-".repeat(width));
    console.log(`DÉTAIL PAR ÉCOLE — ${LABELS[version]}`);
    console.log("-".repeat(width));
    for (const row of byVersion[version]) {
      console.log(
        `${row.school.padEnd(22)}| ${String(row.juryTurns).padStart(2)} tours | ${row.minutes.toFixed(1)} min | ` +
          `qualité ${row.qualityFaults.length} | tiroir ${row.doubleQuestions} | >60 mots ${row.longTurns} | ` +
          `exemples ${row.reused} | formules ${pct(row.formulaOpenerShare)} | désignatives ${pct(row.pointingRepriseShare)} | ` +
          `médiane ${row.median.toFixed(1)} | p90 ${row.p90.toFixed(1)} | ` +
          `<15m ${pct(row.shortShare)} | ≥40m ${pct(row.richShare)} | parole ${pct(row.wordShare)} | ` +
          `amorces ${row.openerRepeats} | reposées ${row.repeatedQuestions}`,
      );
    }
  }

  console.log("\n" + "-".repeat(width));
  console.log("JUGEMENTS DE QUALITÉ RELEVÉS (avec extrait)");
  console.log("-".repeat(width));
  let any = false;
  for (const version of VERSIONS) {
    for (const row of byVersion[version]) {
      for (const fault of row.qualityFaults) {
        any = true;
        console.log(`${LABELS[version].padEnd(14)} | ${row.school} | tour ${fault.index} : « ${fault.excerpt} »`);
      }
    }
  }
  if (!any) console.log("Aucun jugement de qualité relevé.");
  console.log("=".repeat(width));
}

// ------------------------------------- expérience « ordre d'envoi du repère »

/** Deux entretiens par école et par mode : 4 écoles × 2 modes × 2 = 16. */
const ORDER_RUNS = 2;
const ORDER_LABELS: Record<SendOrder, string> = {
  after: "repère APRÈS (app actuelle)",
  before: "repère AVANT la réponse",
  oral: "enchaînement ORAL (option A)",
};

type OrderRow = {
  school: string;
  order: SendOrder;
  run: number;
  answers: number;
  silentTurns: number;
  silentShare: number;
  ordered: number;
  confirmed: number;
  unordered: number;
  closing: boolean;
  metrics: ReturnType<typeof measureJuryBench>;
  faults: { excerpt: string; index: number }[];
};

function orderRowFor(interview: Interview): OrderRow {
  const metrics = measureJuryBench(interview.turns, QUESTION_BANK);
  const events = interview.events ?? [];
  const count = (types: string[]) => events.filter((event) => types.includes(event.type)).length;
  return {
    school: interview.school,
    order: interview.order ?? "after",
    run: interview.run ?? 1,
    answers: interview.turns.length,
    silentTurns: metrics.silentTurns,
    silentShare: metrics.silentShare,
    ordered: count(["switch-ordered", "early-ordered-dry", "early-ordered-nothing-to-add"]),
    confirmed: count(["phase-confirmed"]),
    unordered: count(["unordered-switch", "improvised-switch", "forced-after-2-markers"]),
    closing: events.some((event) => event.type === "closing"),
    metrics,
    faults: metrics.qualityCommentTurns,
  };
}

function printOrderReport(byOrder: Record<SendOrder, OrderRow[]>) {
  const width = 92;
  const orders: SendOrder[] = ["after", "before"];
  const sum = (rows: OrderRow[], pick: (row: OrderRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
  const line = (label: string, a: string, b: string) => `${label.padEnd(36)}| ${a.padStart(22)} | ${b.padStart(22)}`;
  const duo = (fn: (rows: OrderRow[]) => string) => [fn(byOrder.after), fn(byOrder.before)] as const;

  console.log("\n" + "=".repeat(width));
  console.log("SILENCES DU JURY — ordre d'envoi du repère de temps (prompt V2, 4 écoles × 2 entretiens)");
  console.log("=".repeat(width));
  console.log(line("", ORDER_LABELS.after, ORDER_LABELS.before));
  console.log("-".repeat(width));
  console.log(line("Réponses du candidat", ...duo((rows) => String(sum(rows, (r) => r.answers)))));
  console.log(line("Silences du jury", ...duo((rows) => String(sum(rows, (r) => r.silentTurns)))));
  console.log(
    line(
      "Part de silences",
      ...duo((rows) => {
        const answers = sum(rows, (r) => r.answers);
        return answers ? pct1(sum(rows, (r) => r.silentTurns) / answers) : "—";
      }),
    ),
  );

  console.log("\n" + "-".repeat(width));
  console.log("SILENCES PAR ÉCOLE");
  console.log("-".repeat(width));
  for (const school of SCHOOLS) {
    for (const order of orders) {
      const rows = byOrder[order].filter((row) => row.school === school);
      const answers = sum(rows, (r) => r.answers);
      const silent = sum(rows, (r) => r.silentTurns);
      console.log(
        `${school.padEnd(22)}| ${ORDER_LABELS[order].padEnd(28)}| ${String(answers).padStart(2)} réponses | ` +
          `${String(silent).padStart(2)} silences | ${answers ? pct1(silent / answers) : "—"}`,
      );
    }
  }

  console.log("\n" + "-".repeat(width));
  console.log("PILOTAGE DES PARTIES (moteur de phases), entretien par entretien");
  console.log("-".repeat(width));
  for (const order of orders) {
    for (const row of byOrder[order]) {
      console.log(
        `${ORDER_LABELS[order].padEnd(28)}| ${row.school.padEnd(22)}| passage ${row.run} | ` +
          `ordonnées ${row.ordered} | confirmées ${row.confirmed} | non ordonnées ${row.unordered} | ` +
          `clôture ${row.closing ? "oui" : "non"}`,
      );
    }
  }

  console.log("\n" + "-".repeat(width));
  console.log("INDICATEURS DE STYLE (contrôle : l'ordre d'envoi ne doit rien dégrader)");
  console.log("-".repeat(width));
  const turnsOf = (rows: OrderRow[]) => sum(rows, (r) => r.metrics.juryTurns);
  const weighted = (rows: OrderRow[], pick: (row: OrderRow) => number) => {
    const weights = rows.map((row) => row.metrics.juryTurns);
    return avg(rows.map(pick), weights);
  };
  console.log(line("", ORDER_LABELS.after, ORDER_LABELS.before));
  console.log(line("Prises de parole du jury", ...duo((rows) => String(turnsOf(rows)))));
  console.log(
    line("Jugements de qualité /100", ...duo((rows) => per100(sum(rows, (r) => r.faults.length), turnsOf(rows)))),
  );
  console.log(
    line(
      "Questions à tiroir /100",
      ...duo((rows) => per100(sum(rows, (r) => r.metrics.doubleQuestionTurns.length), turnsOf(rows))),
    ),
  );
  console.log(line("Formules d'accueil", ...duo((rows) => pct1(weighted(rows, (r) => r.metrics.formulaOpenerShare)))));
  console.log(
    line("Reprises désignatives", ...duo((rows) => pct1(weighted(rows, (r) => r.metrics.pointingRepriseShare)))),
  );
  console.log(line("Longueur médiane (mots)", ...duo((rows) => weighted(rows, (r) => r.metrics.juryTurnLength.median).toFixed(1))));
  console.log(line("Part < 15 mots", ...duo((rows) => pct(weighted(rows, (r) => r.metrics.juryTurnLength.shortShare)))));
  console.log(line("Part ≥ 40 mots", ...duo((rows) => pct(weighted(rows, (r) => r.metrics.juryTurnLength.richShare)))));
  console.log(line("Part de parole du jury", ...duo((rows) => pct(weighted(rows, (r) => r.metrics.juryWordShare)))));

  console.log("\n" + "-".repeat(width));
  console.log("JUGEMENTS DE QUALITÉ RELEVÉS");
  console.log("-".repeat(width));
  let any = false;
  for (const order of orders) {
    for (const row of byOrder[order]) {
      for (const fault of row.faults) {
        any = true;
        console.log(`${ORDER_LABELS[order].padEnd(28)}| ${row.school} (passage ${row.run}) | tour ${fault.index} : « ${fault.excerpt} »`);
      }
    }
  }
  if (!any) console.log("Aucun jugement de qualité relevé.");
  console.log("=".repeat(width));
}

function orderPathFor(order: SendOrder, school: string, run: number) {
  return `${OUT_DIR}/order-${order}-${school.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-${run}.json`;
}

/** Campagne « ordre d'envoi » : prompt V2, mêmes écoles, mêmes graines. */
async function runOrderExperiment(reportOnly: boolean) {
  const script = await candidateScript();
  const prompts = newPrompts();
  const byOrder: Record<SendOrder, OrderRow[]> = { after: [], before: [] };
  const orders: SendOrder[] = ["after", "before"];
  // Les écoles sont jouées EN PARALLÈLE (agents distincts ou partagés côté
  // ElevenLabs, entretiens indépendants) ; les passages restent séquentiels.
  const collected = await Promise.all(
    SCHOOLS.map(async (school) => {
      const rows: OrderRow[] = [];
      for (const order of orders) {
        for (let run = 1; run <= ORDER_RUNS; run += 1) {
          const path = orderPathFor(order, school, run);
          let interview: Interview;
          const existing = reportOnly || (await Bun.file(path).exists());
          if (existing) {
            interview = (await Bun.file(path).json()) as Interview;
          } else {
            console.log(`→ ${order} · ${school} · passage ${run} : entretien en cours…`);
            interview = await playInterview(school, "v2", prompts[school]!, script, order, run);
            await Bun.write(path, JSON.stringify(interview, null, 2));
            const metrics = measureJuryBench(interview.turns, QUESTION_BANK);
            console.log(
              `✓ ${order} · ${school} · passage ${run} : ${interview.turns.length} réponses, ` +
                `${metrics.silentTurns} silences, clôture ${interview.closed ? "oui" : "non"}`,
            );
          }
          rows.push(orderRowFor(interview));
        }
      }
      return rows;
    }),
  );
  for (const rows of collected.flat()) byOrder[rows.order].push(rows);
  printOrderReport(byOrder);
}

// ------------------------- campagne « nouveau mode écrit de l'application »

/** Deux entretiens par école, ordre d'envoi de l'application (repère avant). */
const APP_RUNS = 2;

function appPathFor(school: string, run: number) {
  return `${OUT_DIR}/app-${school.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-${run}.json`;
}

function printAppReport(rows: OrderRow[]) {
  const width = 92;
  const sum = (list: OrderRow[], pick: (row: OrderRow) => number) => list.reduce((t, r) => t + pick(r), 0);
  const turns = sum(rows, (r) => r.metrics.juryTurns);
  const weighted = (pick: (row: OrderRow) => number) =>
    avg(rows.map(pick), rows.map((row) => row.metrics.juryTurns));
  const answers = sum(rows, (r) => r.answers);
  const silent = sum(rows, (r) => r.silentTurns);

  console.log("\n" + "=".repeat(width));
  console.log("BANC — NOUVEAU MODE ÉCRIT DE L'APPLICATION (repère avant la réponse), prompt V2");
  console.log("=".repeat(width));
  console.log(`Réponses du candidat : ${answers}`);
  console.log(`Silences du jury     : ${silent} (${answers ? pct1(silent / answers) : "—"})`);

  console.log("\n" + "-".repeat(width));
  console.log("SILENCES PAR ÉCOLE");
  console.log("-".repeat(width));
  for (const school of SCHOOLS) {
    const list = rows.filter((row) => row.school === school);
    const a = sum(list, (r) => r.answers);
    const s = sum(list, (r) => r.silentTurns);
    console.log(`${school.padEnd(24)}| ${String(a).padStart(2)} réponses | ${String(s).padStart(2)} silences | ${a ? pct1(s / a) : "—"}`);
  }

  console.log("\n" + "-".repeat(width));
  console.log("PILOTAGE DES PARTIES, entretien par entretien");
  console.log("-".repeat(width));
  for (const row of rows) {
    console.log(
      `${row.school.padEnd(24)}| passage ${row.run} | ordonnées ${row.ordered} | confirmées ${row.confirmed} | ` +
        `non ordonnées ${row.unordered} | clôture ${row.closing ? "oui" : "non"}`,
    );
  }

  console.log("\n" + "-".repeat(width));
  console.log("INDICATEURS DE STYLE");
  console.log("-".repeat(width));
  const line = (label: string, value: string) => `${label.padEnd(36)}| ${value.padStart(12)}`;
  console.log(line("Prises de parole du jury", String(turns)));
  console.log(line("Jugements de qualité /100", per100(sum(rows, (r) => r.faults.length), turns)));
  console.log(line("Questions à tiroir /100", per100(sum(rows, (r) => r.metrics.doubleQuestionTurns.length), turns)));
  console.log(line("Formules d'accueil", pct1(weighted((r) => r.metrics.formulaOpenerShare))));
  console.log(line("Reprises désignatives", pct1(weighted((r) => r.metrics.pointingRepriseShare))));
  console.log(line("Longueur médiane (mots)", weighted((r) => r.metrics.juryTurnLength.median).toFixed(1)));
  console.log(line("Longueur p90 (mots)", weighted((r) => r.metrics.juryTurnLength.p90).toFixed(1)));
  console.log(line("Part < 15 mots", pct(weighted((r) => r.metrics.juryTurnLength.shortShare))));
  console.log(line("Part ≥ 40 mots", pct(weighted((r) => r.metrics.juryTurnLength.richShare))));
  console.log(line("Part de parole du jury", pct(weighted((r) => r.metrics.juryWordShare))));

  console.log("\n" + "-".repeat(width));
  console.log("JUGEMENTS DE QUALITÉ RELEVÉS");
  console.log("-".repeat(width));
  let any = false;
  for (const row of rows) {
    for (const fault of row.faults) {
      any = true;
      console.log(`${row.school} (passage ${row.run}) | tour ${fault.index} : « ${fault.excerpt} »`);
    }
  }
  if (!any) console.log("Aucun jugement de qualité relevé.");
  console.log("=".repeat(width));
}

/** Campagne « app » : 4 écoles × 2 entretiens, écoles jouées en parallèle. */
async function runAppCampaign(reportOnly: boolean) {
  const script = await candidateScript();
  const prompts = newPrompts();
  const collected = await Promise.all(
    SCHOOLS.map(async (school) => {
      const rows: OrderRow[] = [];
      for (let run = 1; run <= APP_RUNS; run += 1) {
        const path = appPathFor(school, run);
        let interview: Interview;
        if (reportOnly || (await Bun.file(path).exists())) {
          interview = (await Bun.file(path).json()) as Interview;
        } else {
          console.log(`→ ${school} · passage ${run} : entretien en cours…`);
          interview = await playInterview(school, "v2", prompts[school]!, script, "before", run);
          await Bun.write(path, JSON.stringify(interview, null, 2));
          const metrics = measureJuryBench(interview.turns, QUESTION_BANK);
          console.log(
            `✓ ${school} · passage ${run} : ${interview.turns.length} réponses, ${metrics.silentTurns} silences, ` +
              `clôture ${interview.closed ? "oui" : "non"}`,
          );
        }
        rows.push(orderRowFor(interview));
      }
      return rows;
    }),
  );
  printAppReport(collected.flat());
}


// ------------------------- campagne « enchaînement ORAL » (option A)

/** Passages par école pour la campagne orale. */
const ORAL_RUNS = 4;

type OralRow = OrderRow & {
  /** Réponses suivies d'un envoi (ordre dû, bascule anticipée, clôture). */
  withAfterSend: number;
  /** Silences du jury qui suivent une réponse AVEC envoi après la réponse. */
  silentAfterSend: number;
  /** Silences du jury qui suivent une réponse SANS envoi après la réponse. */
  silentNoSend: number;
  forced: number;
};

function oralRowFor(interview: Interview): OralRow {
  const base = orderRowFor(interview);
  const afterSends = interview.afterSends ?? [];
  const events = interview.events ?? [];
  let silentAfterSend = 0;
  let silentNoSend = 0;
  interview.turns.forEach((turn, index) => {
    if ((turn.question ?? "").trim()) return;
    // Le tour muet d'indice `index` suit la réponse d'indice `index - 1`.
    if (index > 0 && afterSends[index - 1]) silentAfterSend += 1;
    else silentNoSend += 1;
  });
  return {
    ...base,
    withAfterSend: afterSends.filter(Boolean).length,
    silentAfterSend,
    silentNoSend,
    forced: events.filter((event) => event.type === "forced-after-2-markers").length,
  };
}

function oralPathFor(school: string, run: number) {
  return `${OUT_DIR}/oralseq-${school.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}-${run}.json`;
}

function printOralReport(rows: OralRow[]) {
  const width = 118;
  const sum = (pick: (row: OralRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
  const turns = sum((r) => r.metrics.juryTurns);
  const weighted = (pick: (row: OralRow) => number) => {
    const total = sum((r) => r.metrics.juryTurns);
    return total ? sum((r) => pick(r) * r.metrics.juryTurns) / total : 0;
  };

  console.log("\n" + "=".repeat(width));
  console.log("BANC JURY — ENCHAÎNEMENT ORAL (option A), prompt V2, 4 écoles × 4 entretiens");
  console.log("=".repeat(width));
  console.log(
    "école".padEnd(22) +
      "| pas. | rép. | muets | dont apr. envoi | dont sans envoi | envois après rép. | phases conf. | forcées",
  );
  console.log("-".repeat(width));
  for (const row of rows) {
    console.log(
      `${row.school.padEnd(22)}|  ${row.run}   |  ${String(row.answers).padStart(2)}  |   ${String(row.silentTurns).padStart(2)}  |` +
        `        ${String(row.silentAfterSend).padStart(2)}       |        ${String(row.silentNoSend).padStart(2)}       |` +
        `         ${String(row.withAfterSend).padStart(2)}        |      ${String(row.confirmed).padStart(2)}      |    ${row.forced}`,
    );
  }
  console.log("-".repeat(width));
  const answers = sum((r) => r.answers);
  const silent = sum((r) => r.silentTurns);
  console.log(
    `${"TOTAL".padEnd(22)}|      |  ${String(answers).padStart(2)} |   ${String(silent).padStart(2)}  |` +
      `        ${String(sum((r) => r.silentAfterSend)).padStart(2)}       |        ${String(sum((r) => r.silentNoSend)).padStart(2)}       |` +
      `         ${String(sum((r) => r.withAfterSend)).padStart(2)}        |      ${String(sum((r) => r.confirmed)).padStart(2)}      |    ${sum((r) => r.forced)}`,
  );
  console.log(`Silences : ${silent} sur ${answers} réponses (${pct1(answers ? silent / answers : 0)}).`);
  console.log("Rappel : « order-after » 12 muets / 143 réponses (8,4 %) ; « order-before » 0 / 139 (0,0 %).");

  console.log("\n" + "-".repeat(width));
  console.log("INDICATEURS DE STYLE (total)");
  console.log("-".repeat(width));
  const line = (label: string, value: string) => `${label.padEnd(36)}| ${value.padStart(12)}`;
  console.log(line("Prises de parole du jury", String(turns)));
  console.log(line("Jugements de qualité /100", per100(sum((r) => r.faults.length), turns)));
  console.log(line("Questions à tiroir /100", per100(sum((r) => r.metrics.doubleQuestionTurns.length), turns)));
  console.log(line("formulaOpenerShare", pct1(weighted((r) => r.metrics.formulaOpenerShare))));
  console.log(line("pointingRepriseShare", pct1(weighted((r) => r.metrics.pointingRepriseShare))));
  console.log(line("Longueur médiane (mots)", weighted((r) => r.metrics.juryTurnLength.median).toFixed(1)));
  console.log(line("Longueur p90 (mots)", weighted((r) => r.metrics.juryTurnLength.p90).toFixed(1)));
  console.log(line("Longueur max (mots)", String(Math.max(...rows.map((r) => r.metrics.juryTurnLength.max)))));
  console.log(line("Part < 15 mots", pct(weighted((r) => r.metrics.juryTurnLength.shortShare))));
  console.log(line("Part ≥ 40 mots", pct(weighted((r) => r.metrics.juryTurnLength.richShare))));
  console.log(line("Part de parole du jury", pct(weighted((r) => r.metrics.juryWordShare))));
  console.log(line("openerRepeats (amorces ≥ 2)", String(sum((r) => r.metrics.openerRepeats.length))));
  console.log(line("repeatedQuestions", String(sum((r) => r.metrics.repeatedQuestions.length))));
  const openers = new Map<string, number>();
  for (const row of rows)
    for (const opener of row.metrics.openerRepeats)
      openers.set(opener.opener, (openers.get(opener.opener) ?? 0) + opener.count);
  const top = [...openers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [opener, count] of top)
    console.log(line("  amorce", `« ${opener} » ×${count} (${pct1(turns ? count / turns : 0)})`));

  console.log("\n" + "-".repeat(width));
  console.log("JUGEMENTS DE QUALITÉ RELEVÉS");
  console.log("-".repeat(width));
  let any = false;
  for (const row of rows)
    for (const fault of row.faults) {
      any = true;
      console.log(`${row.school} (passage ${row.run}) | tour ${fault.index} : « ${fault.excerpt} »`);
    }
  if (!any) console.log("Aucun jugement de qualité relevé.");
  console.log("=".repeat(width));
}

/** 16 entretiens (4 écoles × 4 passages) joués EN PARALLÈLE. */
async function runOralSequence(reportOnly: boolean) {
  const script = await candidateScript();
  const prompts = newPrompts();
  const jobs: Promise<OralRow>[] = [];
  for (const school of SCHOOLS)
    for (let run = 1; run <= ORAL_RUNS; run += 1)
      jobs.push(
        (async () => {
          const path = oralPathFor(school, run);
          let interview: Interview;
          if (reportOnly || (await Bun.file(path).exists())) {
            interview = (await Bun.file(path).json()) as Interview;
          } else {
            interview = await playInterview(school, "v2", prompts[school]!, script, "oral", run);
            await Bun.write(path, JSON.stringify(interview, null, 2));
            console.log(
              `✓ oral · ${school} · passage ${run} : ${interview.turns.length} réponses` +
                (interview.closeInfo ? ` (socket ${interview.closeInfo})` : ""),
            );
          }
          return oralRowFor(interview);
        })(),
      );
  const rows = await Promise.all(jobs);
  printOralReport(
    rows.sort((a, b) => (a.school === b.school ? a.run - b.run : SCHOOLS.indexOf(a.school as any) - SCHOOLS.indexOf(b.school as any))),
  );
}

async function runRealisticEssec() {
  await Bun.spawn(["mkdir", "-p", OUT_DIR]).exited;
  const profile = await candidateProfile("proactif");
  const config = getSchoolInterviewConfig("ESSEC");
  const prompt = promptFor(config, "classique");
  if (!prompt) throw new Error("Prompt ESSEC absent.");
  const before = await subscription();
  const interview = await playInterview("ESSEC", "v2", prompt, profile, "oral", 1, true);
  const after = await subscription();
  const output = { profile: "proactif", difficulty: "classique", subscriptionBefore: before, subscriptionAfter: after, ...interview };
  const path = `${OUT_DIR}/realistic-essec-proactif-classique-2.json`;
  await Bun.write(path, JSON.stringify(output, null, 2));
  const events = interview.events ?? [];
  const situationStart = events.find((event) => event.type === "phase-confirmed" && event.phaseId === "essec-situation-1")?.at;
  const situationEnd = events.find((event) => event.type === "phase-confirmed" && event.phaseId === "essec-sortie")?.at;
  const t0 = Date.parse("2026-01-06T09:00:00.000Z");
  console.log(JSON.stringify({
    output: path,
    simulatedMinutes: benchDurationMinutes(interview.turns),
    juryTurns: interview.juryMessages.length,
    candidateTurns: interview.turns.length,
    silentJuryTurns: interview.turns.filter((turn) => !turn.question.trim()).length,
    situationStartMinute: situationStart ? (situationStart - t0) / 60_000 : null,
    situationEndMinute: situationEnd ? (situationEnd - t0) / 60_000 : null,
    closed: interview.closed,
    subscriptionBefore: before,
    subscriptionAfter: after,
  }, null, 2));
}


// ---------------------------------------------------------------------- main

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--realistic-essec")) {
    await runRealisticEssec();
    return;
  }
  // Enchaînement ORAL (option A) : fils `oralseq-<école>-<passage>.json`.
  if (args.includes("--sequence") || args.includes("--sequence=oral")) {
    await runOralSequence(args.includes("--report"));
    return;
  }
  // Campagne « nouveau mode écrit de l'application » : fils `app-<école>-<passage>.json`.
  if (args.includes("--app-campaign")) {
    await Bun.spawn(["mkdir", "-p", OUT_DIR]).exited;
    await runAppCampaign(args.includes("--report"));
    return;
  }
  // Expérience « ordre d'envoi du repère » : campagne à part, fils libellés
  // `order-<mode>-<école>-<passage>.json`, aucun fil existant écrasé.
  if (args.includes("--order-experiment")) {
    await Bun.spawn(["mkdir", "-p", OUT_DIR]).exited;
    await runOrderExperiment(args.includes("--report"));
    return;
  }
  // Versions à jouer réellement (appels à l'agent) ; les autres sont relues
  // depuis les fils déjà enregistrés sous `scripts/bench-output/`.
  const play = (args.find((a) => a.startsWith("--play="))?.split("=")[1] ?? "v2")
    .split(",")
    .filter(Boolean) as Version[];
  const examples = toneExamples();


  console.log(`Clé ElevenLabs : ${process.env["ELEVENLABS_API_KEY"] ? "présente" : "ABSENTE"}`);
  for (const school of SCHOOLS) {
    const { agentId, usesFallback } = resolveAgent(school);
    console.log(
      `Agent ${school.padEnd(22)}: ${agentId ? "disponible" : "ABSENT"}${usesFallback ? " (repli sur l'agent classique)" : ""}`,
    );
  }
  console.log(`Exemples de ton extraits du prompt : ${examples.length}`);

  await Bun.spawn(["mkdir", "-p", OUT_DIR]).exited;
  const script = await candidateScript();
  const prompts: Record<Version, Record<string, string>> = { new: {}, v2: newPrompts(), old: {} };
  if (play.includes("old")) prompts.old = await oldPrompts();
  if (play.includes("new")) prompts.new = newPrompts();

  for (const version of play) {
    for (const school of SCHOOLS) {
      const prompt = prompts[version][school]!;
      console.log(
        `Prompt ${version} ${school} : « 25 mots » ${/25 mots/.test(prompt) ? "présent" : "absent"} · ` +
          `« EXEMPLES DE TON » ${/EXEMPLES DE TON/.test(prompt) ? "présent" : "absent"} · ` +
          `« Vous avez parlé de » ${/Vous avez parlé de/.test(prompt) ? "présent" : "absent"} · ${prompt.length} caractères`,
      );
    }
  }

  const byVersion: Record<Version, Row[]> = { old: [], new: [], v2: [] };
  for (const version of VERSIONS) {
    const results = !play.includes(version)
      ? await Promise.all(
          SCHOOLS.map(async (school) => (await Bun.file(pathFor(version, school)).json()) as Interview),
        )
      : await Promise.all(
          SCHOOLS.map(async (school) => {
            console.log(`→ ${version} · ${school} : entretien en cours…`);
            const interview = await playInterview(school, version, prompts[version][school]!, script);
            await Bun.write(pathFor(version, school), JSON.stringify(interview, null, 2));
            console.log(
              `✓ ${version} · ${school} : ${interview.turns.length} tours, clôture ${interview.closed ? "oui" : "non"}`,
            );
            return interview;
          }),
        );
    byVersion[version] = results.map((interview) => rowFor(interview, examples));
  }

  printReport(byVersion);
}

function pathFor(version: Version, school: string) {
  return `${OUT_DIR}/${version}-${school.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.json`;
}

await main();
