/**
 * MOTEUR DE PHASES — module pur (aucune dépendance à React, ElevenLabs,
 * Date.now ni console). Le temps est toujours passé en paramètre (`at`, en ms).
 *
 * Règles reprises telles quelles :
 * - les repères de temps ne partent qu'après une réponse du candidat ;
 * - phase en cours, puis ordre de bascule dès que la phase suivante est due ;
 *   l'ordre est répété jusqu'à détection de sa phrase, avec le garde-fou
 *   « forcée après 2 repères, sans malus » ;
 * - un step sans `startMinute` ni `relativeToPhaseId` n'est jamais dû par le
 *   temps : il ne démarre que par `markPhaseStart` ou par détection ;
 * - bascule anticipée décidée par l'APPLICATION seulement (3 réponses sèches,
 *   ou réponse négative à « autre chose à ajouter ») ;
 * - `anticipee` = bascule avant l'échéance ET ordonnée par l'application ;
 * - à Y−2 la clôture part une seule fois, puis plus aucune consigne de phase.
 */
import { isDryAnswer, isNothingToAdd, normalizeInterviewText } from "./interview-text";

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
import { ADD_QUESTION, getSchoolInterviewConfig, secondReplyFor } from "./school-interviews";
import type { MonologueMeasure, PhaseStep, PhaseTiming } from "./school-interviews";

/** Préfixe de toutes les consignes internes envoyées au jury par l'application. */
export const REGIE_PREFIX = "[RÉGIE — consigne interne, ne jamais la lire ni la mentionner]";

/** Vrai pour un message de régie : il ne doit jamais apparaître dans le fil. */
export function isRegieMessage(text: string) {
  return text.trim().startsWith("[RÉGIE");
}

/** Rappel ajouté à la fin de CHAQUE repère : le jury ne rend jamais la main sans question. */
/** Phrase de passage aux situations de Montpellier (texte normalisé). */
export const MONTPELLIER_PASSAGE_RE = /merci\W*passons maintenant aux situations\W*a vous de choisir celle qui vous inspire/;

export const END_WITH_QUESTION = "Termine ta prochaine prise de parole par une question.";
/** Après la réponse du candidat à la question de clôture. */
export const EXIT_PHRASE_INSTRUCTION =
  "S'il t'a posé une question, réponds-y en une ou deux phrases, sans rien inventer sur l'école, puis dis la phrase de sortie. Sinon, dis seulement la phrase de sortie.";
/** Message de la moitié de l'échange libre (texte commun). */
export const THEME_REMINDER =
  "Seconde moitié de l'échange libre. Avant la fin, au moins 3 expériences, la personnalité, le projet, les 4 points de l'école (pourquoi une école de commerce, pourquoi celle-ci, ce qu'il apportera, sa connaissance de l'école) et l'actualité doivent tous avoir été abordés. N'aborde que ceux qui manquent, un à la fois, en partant de ses réponses, sans jamais citer cette liste. L'entretien continue jusqu'à la consigne de clôture.";
/** GEM, TBS, Clermont : la même phrase sans « et l'actualité ». */
export const THEME_REMINDER_WITHOUT_NEWS =
  "Seconde moitié de l'échange libre. Avant la fin, au moins 3 expériences, la personnalité, le projet, les 4 points de l'école (pourquoi une école de commerce, pourquoi celle-ci, ce qu'il apportera, sa connaissance de l'école) doivent tous avoir été abordés. N'aborde que ceux qui manquent, un à la fois, en partant de ses réponses, sans jamais citer cette liste. L'entretien continue jusqu'à la consigne de clôture.";
export const MONTPELLIER_THEME_REMINDER =
  "Seconde moitié de l'échange libre. Avant la fin, au moins 3 expériences, la personnalité et la question d'actualité doivent avoir été abordées. N'aborde que ce qui manque, un à la fois, en partant de ses réponses, sans jamais citer cette liste. L'entretien continue jusqu'à la consigne de clôture.";

/** Questions de clôture, tirées au sort au début de l'entretien. */
export const CLOSING_QUESTIONS = {
  A: "L'entretien touche à sa fin, avez-vous quelque chose à ajouter avant de terminer l'entretien ou une question à poser au jury ?",
  B: "Vous avez le mot de la fin : un seul mot.",
  C: "Quelle question auriez-vous aimé qu'on vous pose ?",
} as const;
export type ClosingVariant = keyof typeof CLOSING_QUESTIONS;

export function pickClosingVariant(random: () => number = Math.random): ClosingVariant {
  const keys = Object.keys(CLOSING_QUESTIONS) as ClosingVariant[];
  return keys[Math.min(keys.length - 1, Math.floor(random() * keys.length))]!;
}

/** Consigne de clôture, commune à toutes les clôtures. */
export function closingInstruction(question: string): string {
  return `Pose maintenant, mot pour mot, la question de clôture : « ${question} ». Tu diras la phrase de sortie après la réponse du candidat.`;
}

/** Phrase de sortie reconnue (ancienne et nouvelle), sur texte normalisé. */
export const EXIT_SENTENCE_RE = /bonne continuation|l'entretien est desormais termine/;

/** ESSEC, fin du cas avec plus de 2 minutes restantes. */
export const ESSEC_RETOUR_LIBRE =
  "Remercie le candidat et mets un terme au cas. La mise en situation est terminée. Reviens à l'échange libre jusqu'à la consigne de clôture : aborde un point pas encore traité, sans nouvelle mise en situation.";
/** ESSEC, fin du cas dans les 2 dernières minutes. */
export function essecSortieCloture(question: string): string {
  return `Remercie le candidat et mets un terme au cas. La mise en situation est terminée. ${closingInstruction(question)}`;
}

/** EDHEC : consigne jointe au repère qui suit le passage à l'entretien individuel. */
export const EDHEC_INDIVIDUEL = "Ne reprends jamais le mot tiré.";
/** Phrase de passage EDHEC (texte normalisé). */
export const EDHEC_PASSAGE_RE = /nous passons maintenant a l'entretien individuel/;

/** GEM : le candidat clôt lui-même l'interview inversée (texte normalisé). */
export const GEM_FIN_INVERSEE_RE =
  /(?:je n'ai|j'ai) plus (?:de |d'autres? )?questions?\b(?! sur)|je n'ai pas d'autres? questions?\b(?! sur)|j'ai fait le tour|ca repond a mes questions|cela repond a mes questions|je pense avoir fait le tour|c'est tout pour moi|c'est bon pour moi/;

/** Parties dont le repère garde le compte à rebours « encore environ N min ». */
const COUNTDOWN_STEPS = ["emlyon-cartes", "clermont-impact"];

/** Réponse assez longue pour être déjà la présentation (environ 60 mots). */
export const PRESENTATION_MIN_WORDS = 60;

/**
 * Fonction PURE de la file de consignes (utilisée par `withQueuedInstructions`
 * dans le hook) : quand une consigne part, le repère est réduit au temps écoulé ;
 * si le moteur envoie au même moment un ORDRE de bascule, celui-ci est
 * prioritaire et la consigne reste en file pour le repère suivant.
 */
export function applyQueuedInstructions(opts: {
  updates: string[];
  queued: string[];
  marker: { kind: MarkerKind; timeOnly: string } | null;
}): { updates: string[]; remaining: string[] } {
  const { updates, queued, marker } = opts;
  if (!queued.length) return { updates, remaining: [] };
  if (marker?.kind === "switch") return { updates, remaining: queued };
  const first = marker ? `${REGIE_PREFIX} ${marker.timeOnly}` : updates[0];
  const rest = updates.slice(1);
  return {
    updates: [...(first ? [first] : []), ...rest, ...queued.map((instruction) => `${REGIE_PREFIX} ${instruction}`)],
    remaining: [],
  };
}

export type MarkerKind = "ongoing" | "switch" | "none";

export type MarkerInfo = {
  kind: MarkerKind;
  /** Repère réduit au temps écoulé, sans consigne de phase. */
  timeOnly: string;
};

export type EngineEvent = {
  at: number;
  type:
    | "switch-ordered"
    | "early-ordered-dry"
    | "early-ordered-candidate-closed"
    | "early-ordered-nothing-to-add"
    | "phase-confirmed"
    | "unordered-switch"
    | "improvised-switch"
    | "recovered-switch"
    | "forced-after-2-markers"
    | "closing"
    | "exit-phrase"
    | "early-ordered-candidate-closed"
    | "second-reply-skipped";
  phaseId?: string;
};

/** Question autorisée au jury : c'est la réponse du candidat qui décide. */
const ADD_QUESTION_RE = /autre chose a ajouter|d'autres questions a me poser/;

/**
 * Un repère ponctuel « sautable » (GEM : « il vous reste une minute ») n'est
 * sauté que si l'entrée suivante est due depuis plus d'une minute : avec des
 * tours de parole longs, les deux échéances tombent au même moment et le
 * candidat perdrait sa minute de synthèse, qui fait partie du format officiel.
 */
const SKIP_GRACE_MS = 60_000;
const IMPROVISED_SWITCH_RE =
  /(?:^|[.!?,]\s*|:\s*)(?:merci[,.]?\s*)?(?:passons (?:maintenant )?a (?:la|l'|notre|votre)|nous passons (?:maintenant )?a|parlons maintenant de|changeons de sujet|deuxieme partie|partie 2|la discussion)\b/;

/** Amorce de passage : le jury annonce qu'il quitte la partie en cours. */
const TRANSITION_LEAD =
  "(?:nous passons|on passe|passons|allons maintenant passer|allons passer|je vous propose de passer|passer maintenant|changeons|nous enchainons|enchainons)";
/** Cible du passage : la partie visée. */
const TRANSITION_TARGET =
  "(?:a la (?:suite|seconde|deuxieme|troisieme|derniere) partie|a la partie (?:2|3|suivante)|a la discussion|a l'entretien (?:classique|individuel)|a l'echange (?:libre|classique|plus libre|plus classique)|a l'interview inversee|aux cartes|a la conclusion|de sujet)";

/**
 * Détection GÉNÉRIQUE de transition, commune à toutes les écoles : une amorce de
 * passage suivie, à moins de 60 caractères, d'une cible de partie. Les `detect`
 * propres à chaque école restent, en complément précis.
 */
export const TRANSITION_RE = new RegExp(`\\b${TRANSITION_LEAD}\\b[\\s\\S]{0,60}?\\b${TRANSITION_TARGET}\\b`);
/** R1 bis : même détection, sans la cible « de sujet » (jamais un changement de partie). */
const TRANSITION_PART_RE = new RegExp(
  `\\b${TRANSITION_LEAD}\\b[\\s\\S]{0,60}?\\b${TRANSITION_TARGET.replace("|de sujet)", ")")}\\b`,
);

type MonologueState = {
  measure: MonologueMeasure;
  startedAt: number;
  /** Début encore affinable par la fin de la parole du jury (oral). */
  awaitingSpeechEnd: boolean;
  answers: number;
  lastAnswerEnd: number | null;
  closed: boolean;
  /** Fin retenue de la mesure, une fois fermée. */
  closedAt?: number;
};

export class PhaseEngine {
  private readonly schedule: PhaseStep[];
  private readonly monologues: MonologueMeasure[];
  private readonly totalMinutes: number;
  private readonly startedAt: number;
  private readonly school: string;

  private phaseIndex = 0;
  private pendingIndex: number | null = null;
  private pendingMarkerCount = 0;
  /**
   * Instant où l'ORDRE de bascule a été envoyé. La phase précédente est mesurée
   * jusqu'à cet instant, jamais jusqu'au moment où le jury finit par obéir.
   */
  private pendingOrderedAt: number | null = null;
  private dryAnswerCount = 0;
  private addQuestionAsked = false;
  private earlyOrdered = false;
  /**
   * « Anticipée » retenu lors d'une bascule vers une entrée dont le temps est
   * compté dans la phase précédente : il s'applique à la bascule qui fermera
   * réellement le chronomètre de cette phase.
   */
  private carriedAnticipee = false;
  private juryMessageCount = 0;
  private lastAnswerEnd: number | null = null;
  private phaseStartedAt: Record<string, number> = {};
  private timingList: PhaseTiming[] = [];
  private monologueStates: MonologueState[] = [];
  private closing = false;
  /** Rattrapages déjà envoyés par phase : au plus deux, ensuite on laisse passer. */
  private recoveryCount: Record<string, number> = {};
  private eventList: EngineEvent[] = [];
  private lastMarkerValue: MarkerInfo | null = null;
  private themeReminderSent = false;
  private readonly variables: Record<string, string>;
  private readonly hasSecondReply: boolean;
  /** Montpellier : le repère qui suit la phrase de passage aux situations. */
  private omitNextQuestion = false;
  private readonly closingQuestion: string;
  private answerCount = 0;
  private lastJuryMessageAt: number | null = null;
  /** Consignes jointes au repère qui suit la PROCHAINE réponse du candidat. */
  private attachments: { text: string; afterAnswer: number }[] = [];
  /** Montpellier : un repère d'au moins 20 min a été envoyé (fin des situations). */
  private montpellierLateMarkerSent = false;
  /** La deuxième réplique n'est plus attendue : le candidat s'est déjà présenté. */
  private secondReplySkipped = false;
  /** R3 : nombre de messages du jury au moment de la clôture. */
  private closingJuryCount = 0;
  /** R3 : la question de clôture est déjà posée dans le message qui a clos. */
  private closingAskedAtTrigger = false;
  /** R9 : fin de la dernière prise de parole du jury (oral). */
  private lastJurySpeechEndAt: number | null = null;

  constructor(opts: {
    school: string;
    schedule: PhaseStep[];
    monologues: MonologueMeasure[];
    totalMinutes: number;
    startedAt: number;
    /** Variables dynamiques de la session (cartes emlyon tirées…). */
    variables?: Record<string, string>;
    /** L'école a une deuxième réplique imposée (déduit de l'école par défaut). */
    hasSecondReply?: boolean;
    /** Question de clôture tirée au sort (variante A par défaut). */
    closingQuestion?: string | undefined;
  }) {
    this.closingQuestion = opts.closingQuestion ?? CLOSING_QUESTIONS.A;
    this.school = opts.school;
    this.variables = opts.variables ?? {};
    this.schedule = opts.schedule;
    this.monologues = opts.monologues;
    this.totalMinutes = opts.totalMinutes;
    this.startedAt = opts.startedAt;
    this.hasSecondReply = opts.hasSecondReply ?? Boolean(secondReplyFor(getSchoolInterviewConfig(opts.school)));
    const first = this.schedule[0];
    if (first) {
      this.phaseStartedAt[first.id] = this.startedAt;
      this.openPhaseTiming(first, this.startedAt);
    }
  }

  get timings(): PhaseTiming[] {
    return this.timingList.map((timing) => ({ ...timing }));
  }

  get closingSent(): boolean {
    return this.closing;
  }

  get events(): EngineEvent[] {
    return [...this.eventList];
  }

  /**
   * Nature du dernier repère produit par `onCandidateAnswer` :
   * - "switch" : il porte un ORDRE de bascule (il est prioritaire, une consigne
   *   de l'application doit attendre le repère suivant) ;
   * - "ongoing" : il ne fait que rappeler la phase en cours ;
   * - "none" : clôture, aucune consigne de phase.
   * `timeOnly` est le texte du repère réduit au temps écoulé.
   */
  get lastMarker(): MarkerInfo | null {
    return this.lastMarkerValue ? { ...this.lastMarkerValue } : null;
  }

  // ---------------------------------------------------------------- entrées

  /**
   * Prise de parole du jury : détections, question « à ajouter », fin de monologue.
   * Renvoie les consignes à envoyer IMMÉDIATEMENT au jury (rattrapage) : le jury
   * a annoncé un changement de partie que l'application n'a pas ordonné.
   */
  onJuryMessage(text: string, at: number): string[] {
    this.juryMessageCount += 1;
    this.lastJuryMessageAt = at;
    this.closeOpenMonologues(at);
    this.startMonologues((measure) => "juryMessage" in measure.start && measure.start.juryMessage === this.juryMessageCount, at);
    // Aucune détection sur le tout premier message du jury.
    if (this.juryMessageCount <= 1) return [];
    const normalized = normalizeInterviewText(text);
    if (this.school === "Montpellier BS" && MONTPELLIER_PASSAGE_RE.test(normalized)) this.omitNextQuestion = true;
    if (this.school === "EDHEC" && EDHEC_PASSAGE_RE.test(normalized)) this.attachToNextAnswer(EDHEC_INDIVIDUEL);
    const currentStep = this.schedule[this.phaseIndex];
    if (currentStep?.closeOnExit?.test(normalized)) {
      // ESSEC : le cas se termine avec plus de 2 minutes restantes → retour à
      // l'échange libre, sans clôture (D27).
      if (this.school === "ESSEC" && !EXIT_SENTENCE_RE.test(normalized) && this.remainingMs(at) > 120_000) {
        const nextIndex = this.phaseIndex + 1;
        if (this.schedule[nextIndex]) this.confirmPhase(nextIndex, at, false);
        return [];
      }
      // ESSEC : le jury a déjà dit « La mise en situation est terminée » et posé
      // sa question de clôture : aucune seconde consigne de clôture.
      // ESSEC, dans les 2 dernières minutes : le jury a déjà dit « La mise en
      // situation est terminée » avec une question, ou a déjà posé la question
      // tirée : aucune seconde consigne de clôture.
      // Seule la question TIRÉE compte comme posée ; une autre question du jury
      // n'en tient pas lieu : la consigne de clôture part alors (question tirée).
      const asked = this.containsClosingQuestion(normalized);
      if (asked) {
        this.markClosingWithoutInstruction(at, true);
        return [];
      }
      return this.closeImmediately(at, false);
    }
    let detectedIndex: number | null = null;
    let improvised = false;
    if (this.pendingIndex !== null) {
      const detect = this.schedule[this.pendingIndex]?.detect;
      if (!detect || detect.test(normalized) || TRANSITION_PART_RE.test(normalized)) detectedIndex = this.pendingIndex;
    } else {
      const nextIndex = this.phaseIndex + 1;
      const next = this.schedule[nextIndex];
      // R1 : sans ordre en attente, depuis une partie libre ou une partie que le
      // jury peut quitter seul (`allowEarlyPhrase`), seule la regex `detect` d'une
      // partie suivante à `allowEarly` vaut bascule ; les formules génériques
      // (« Passons à… », « Parlons maintenant de… ») sont ignorées, avant comme
      // après l'échéance : c'est l'ordre de l'application qui fait foi.
      const freeNow = Boolean(currentStep?.freeExchange || currentStep?.silentMarkers);
      const nextDue = next ? this.dueAtFor(next) : null;
      const genericAllowed = !freeNow && !currentStep?.allowEarlyPhrase;
      if (next?.allowEarly && (next.detect?.test(normalized) || (genericAllowed && TRANSITION_PART_RE.test(normalized))))
        detectedIndex = nextIndex;
      if (
        detectedIndex === null &&
        genericAllowed &&
        next &&
        nextDue !== null &&
        !next.detect?.test(normalized) &&
        (IMPROVISED_SWITCH_RE.test(normalized) || TRANSITION_PART_RE.test(normalized))
      ) {
        detectedIndex = nextIndex;
        improvised = true;
      }
    }
    if (this.schedule[this.phaseIndex]?.dryEarlySwitch && ADD_QUESTION_RE.test(normalized)) {
      this.addQuestionAsked = true;
    }
    if (detectedIndex === null) return [];
    const next = this.schedule[detectedIndex]!;
    const dueAt = this.dueAtFor(next);
    // Transition annoncée AVANT l'échéance et sans ordre de l'application :
    // on garde la phase en cours (et sa mesure) et on remet le jury dedans.
    // Les phases où le jury a le droit de sortir en avance (cartes terminées,
    // mise en situation épuisée) : confirmation directe, jamais de rattrapage,
    // que la transition soit la phrase attendue ou une reformulation.
    const earlyPhraseAllowed = Boolean(this.schedule[this.phaseIndex]?.allowEarlyPhrase);
    const orderedBefore = this.pendingIndex !== null || this.earlyOrdered;
    const unordered =
      this.pendingIndex === null && dueAt !== null && at < dueAt && !this.earlyOrdered && !earlyPhraseAllowed;
    if (unordered) {
      const recovery = this.tryRecover(at);
      if (recovery) return [recovery];
    }
    this.confirmPhase(detectedIndex, at, false, improvised);
    if (next.closeOnEnter && this.remainingMs(at) <= 120_000) return this.closeImmediately(at, this.containsClosingQuestion(normalized));
    if (next.closeOnEnter) return [];
    if (!orderedBefore && next.earlyEnterInstruction && dueAt !== null && at < dueAt) {
      // emlyon (D22) : jamais seule après la transition du jury, jointe au
      // repère qui suit la réponse suivante du candidat.
      this.attachToNextAnswer(this.fill(next.earlyEnterInstruction, at));
    }
    return [];
  }

  /** La question de clôture tirée figure dans ce texte (25 premiers caractères). */
  private containsClosingQuestion(normalized: string): boolean {
    const q = normalizeInterviewText(this.closingQuestion).slice(0, 25);
    return Boolean(q) && normalized.includes(q);
  }

  /** R3 : la question de clôture a été posée après la consigne de clôture. */
  private closingQuestionAsked(): boolean {
    return this.closingAskedAtTrigger || this.juryMessageCount > this.closingJuryCount;
  }

  private setClosing(at: number, askedAtTrigger: boolean) {
    this.closing = true;
    this.closingJuryCount = this.juryMessageCount;
    this.closingAskedAtTrigger = askedAtTrigger;
    this.pendingIndex = null;
    this.pendingMarkerCount = 0;
    this.pendingOrderedAt = null;
    this.attachments = [];
    this.record("closing", at);
  }

  private attachToNextAnswer(text: string) {
    if (this.attachments.some((item) => item.text === text)) return;
    this.attachments.push({ text, afterAnswer: this.answerCount });
  }

  /** Consignes jointes devenues dues (une réponse du candidat a suivi). */
  private takeAttachments(): string[] {
    const due = this.attachments.filter((item) => this.answerCount > item.afterAnswer);
    this.attachments = this.attachments.filter((item) => this.answerCount <= item.afterAnswer);
    return due.map((item) => item.text);
  }

  private remainingMs(at: number): number {
    return this.startedAt + this.totalMinutes * 60_000 - at;
  }

  /** Consigne de rattrapage, tant que la limite de deux par phase n'est pas atteinte. */
  private tryRecover(at: number): string | null {
    const current = this.schedule[this.phaseIndex];
    if (!current) return null;
    // D9 : jamais de rattrapage pendant une partie libre.
    if (current.freeExchange || current.silentMarkers) return null;
    const used = this.recoveryCount[current.id] ?? 0;
    if (used >= 2) return null;
    this.recoveryCount[current.id] = used + 1;
    this.record("recovered-switch", at, current.id);
    return `Tu viens d'annoncer un changement de partie alors que ce n'est pas le moment. Reprends immédiatement la partie en cours, ${current.topic ?? current.name}, sans mentionner ce changement ni t'excuser : ${current.recoveryAction ?? "pose une nouvelle question sur ce sujet."}`;
  }

  /** Remplit les variables connues seulement à l'exécution. */
  private fill(text: string, at?: number): string {
    if (text.includes("{essec_sortie}")) {
      const remaining = at === undefined ? 0 : this.remainingMs(at);
      text = text.replaceAll(
        "{essec_sortie}",
        remaining > 120_000 ? ESSEC_RETOUR_LIBRE : essecSortieCloture(this.closingQuestion),
      );
    }
    if (text.includes("{question_cloture}")) text = text.replaceAll("{question_cloture}", this.closingQuestion);
    if (!text.includes("{cartes_emlyon}")) return text;
    const v = this.variables;
    const cards = [
      ["Expérience", v["card_experience"]],
      ["Personnalité", v["card_personnalite"]],
      ["Projet", v["card_projet"]],
      ["Créativité", v["card_creativite"]],
    ]
      .filter(([, question]) => question)
      .map(([label, question]) => `${label} (« ${question} »)`);
    return text.replaceAll("{cartes_emlyon}", cards.length ? cards.join(", ") : "Expérience, Personnalité, Projet, Créativité");
  }

  /** Oral uniquement : la parole du jury s'arrête, le monologue démarre vraiment ici. */
  onJuryFinishedSpeaking(at: number): void {
    this.lastJurySpeechEndAt = at;
    for (const state of this.monologueStates) {
      if (state.closed || state.answers > 0 || !state.awaitingSpeechEnd) continue;
      state.awaitingSpeechEnd = false;
      state.startedAt = at;
      const timing = this.timingList.find((item) => item.phaseId === state.measure.id);
      if (timing) timing.startedAt = new Date(at).toISOString();
    }
  }

  /**
   * Fin de réponse du candidat (MODE ÉCRIT) : enregistre la réponse et renvoie
   * les consignes à envoyer (repère des parties imposées, ordre de bascule,
   * message de la moitié, consignes jointes, clôture).
   */
  onCandidateAnswer(text: string, at: number): string[] {
    this.applyCandidateAnswer(text, at);
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    return this.buildMarker(at, this.elapsedMinutes(at), true);
  }

  /**
   * Fin de réponse du candidat À L'ORAL, quand le repère a déjà été pré-envoyé
   * en fin de prise de parole du jury (`markerAtJuryTurnEnd`). On ne renvoie
   * ici que ce qui dépend de cette réponse : un ordre de bascule (anticipée ou
   * devenue due), la clôture, le message de la moitié et les consignes jointes.
   */
  onCandidateAnswerAfterPreSentMarker(text: string, at: number): string[] {
    const pendingBefore = this.pendingIndex;
    this.applyCandidateAnswer(text, at);
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    const elapsed = this.elapsedMinutes(at);
    // Réponse à la question de clôture : consigne de sortie (D3), une fois.
    if (this.closing) return this.buildMarker(at, elapsed, true);
    const closingDue = elapsed >= this.totalMinutes - 2;
    const switchDue = !closingDue && !this.closing && this.pendingIndex === null && this.nextSwitchDue(at, elapsed);
    if (this.pendingIndex === pendingBefore && !closingDue && !switchDue) {
      // Le repère pré-envoyé reste la référence : seules les consignes propres à
      // cette réponse partent (message de la moitié, consignes jointes).
      const extras = [...this.midpointNow(at, elapsed), ...this.takeAttachments()];
      return extras.length ? [`${REGIE_PREFIX} ${extras.join(" ")}`] : [];
    }
    return this.buildMarker(at, elapsed, true);
  }

  /**
   * ORAL — repère valable à l'instant où le jury finit de parler : même repère
   * que `onCandidateAnswer` au même instant, sans les consignes qui dépendent de
   * la réponse suivante (message de la moitié, consignes jointes).
   */
  markerAtJuryTurnEnd(at: number): string[] {
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    return this.buildMarker(at, this.elapsedMinutes(at), false);
  }

  private elapsedMinutes(at: number) {
    return Math.floor((at - this.startedAt) / 60_000);
  }

  /** Enregistrement d'une réponse du candidat, sans aucun envoi. */
  private applyCandidateAnswer(text: string, at: number) {
    this.answerCount += 1;
    this.lastAnswerEnd = at;
    // D8 : la réponse à « Est-ce que c'est clair pour vous ? » est déjà la
    // présentation : la deuxième réplique n'est plus attendue et la mesure de
    // la présentation (ou du pitch) porte sur cette réponse.
    if (
      this.hasSecondReply &&
      this.juryMessageCount === 1 &&
      this.answerCount === 1 &&
      countWords(text) >= PRESENTATION_MIN_WORDS
    ) {
      this.secondReplySkipped = true;
      this.record("second-reply-skipped", at);
      this.startMonologues(
        (measure) => "juryMessage" in measure.start && measure.start.juryMessage === 2,
        // R9 : à l'oral, la mesure part de la fin de la parole du jury.
        this.lastJurySpeechEndAt !== null && this.lastJuryMessageAt !== null && this.lastJurySpeechEndAt >= this.lastJuryMessageAt
          ? this.lastJurySpeechEndAt
          : (this.lastJuryMessageAt ?? this.startedAt),
      );
      for (const state of this.monologueStates) {
        if (state.closed || state.answers > 0) continue;
        state.awaitingSpeechEnd = false;
      }
    }
    for (const state of this.monologueStates) {
      if (state.closed) continue;
      state.answers += 1;
      state.awaitingSpeechEnd = false;
      state.lastAnswerEnd = at;
    }
    if (this.totalMinutes <= 0) return;
    const current = this.schedule[this.phaseIndex];
    // D7 : GEM, le candidat clôt lui-même l'interview inversée → synthèse.
    if (current?.id === "gem-inversee" && this.pendingIndex === null) {
      const normalized = normalizeInterviewText(text);
      // R4 : seule une formule de fin clôt l'interview inversée.
      if (GEM_FIN_INVERSEE_RE.test(normalized)) {
        this.orderEarlySwitch(at, "early-ordered-candidate-closed");
        return;
      }
    }
    if (current?.dryEarlySwitch) {
      // GEM : pendant l'interview inversée, les questions courtes du candidat
      // ne comptent jamais comme réponses « à sec ».
      if (isDryAnswer(text) && current.id !== "gem-inversee") this.dryAnswerCount += 1;
      else this.dryAnswerCount = 0;
      if (this.dryAnswerCount >= 3) this.orderEarlySwitch(at, "early-ordered-dry");
      if (this.addQuestionAsked) {
        this.addQuestionAsked = false;
        if (isNothingToAdd(text)) this.orderEarlySwitch(at, "early-ordered-nothing-to-add");
      }
    } else {
      this.dryAnswerCount = 0;
    }
  }

  /** Vrai si la deuxième réplique n'est plus attendue (D8). */
  get secondReplyWasSkipped(): boolean {
    return this.secondReplySkipped;
  }

  /** Partie libre en cours (ou école sans parties) : aucun repère après les réponses. */
  private inFreePart(): boolean {
    if (!this.schedule.length) return true;
    const current = this.schedule[this.phaseIndex];
    return Boolean(current?.freeExchange || current?.silentMarkers);
  }

  private buildMarker(at: number, elapsed: number, withExtras: boolean): string[] {
    const timeOnly = `Temps écoulé : ${elapsed} min.`;
    // La question de clôture a déjà été demandée : cette réponse est celle du
    // candidat à la question de clôture → le jury répond puis dit la phrase de sortie.
    if (this.closing) {
      this.lastMarkerValue = { kind: "none", timeOnly };
      if (!withExtras) return [];
      if (this.eventList.some((event) => event.type === "exit-phrase")) return [];
      if (!this.closingQuestionAsked()) return [];
      this.record("exit-phrase", at);
      return [`${REGIE_PREFIX} ${EXIT_PHRASE_INSTRUCTION}`];
    }
    // Dans les deux dernières minutes, la clôture l'emporte sur tout le reste.
    if (elapsed >= this.totalMinutes - 2) {
      // ESSEC, pendant le cas : la consigne met aussi un terme au cas (R6).
      const inCase = this.school === "ESSEC" && this.currentPhaseId === "essec-situation-1";
      this.setClosing(at, false);
      this.lastMarkerValue = { kind: "none", timeOnly };
      return [`${REGIE_PREFIX} ${inCase ? essecSortieCloture(this.closingQuestion) : closingInstruction(this.closingQuestion)}`];
    }
    const advanced = this.advance(at, elapsed);
    const extras = withExtras ? [...this.midpointNow(at, elapsed, advanced.kind), ...this.takeAttachments()] : [];
    const join = (text: string) => [text, ...extras].filter(Boolean).join(" ");
    if (advanced.kind === "switch") {
      this.lastMarkerValue = { kind: "switch", timeOnly };
      const step = this.pendingIndex !== null ? this.schedule[this.pendingIndex] : undefined;
      const filled = this.fill(advanced.text, at);
      // R6 : une consigne qui contient la question de clôture part seule.
      if (filled.includes(this.closingQuestion)) {
        const instruction = filled.replace(/^\s*Phase en cours : [^.]*\.\s*/, "").trim();
        this.setClosing(at, false);
        this.lastMarkerValue = { kind: "none", timeOnly };
        return [`${REGIE_PREFIX} ${instruction}`];
      }
      const suffix = step?.omitEndWithQuestion || this.omitQuestionNow() ? "" : ` ${END_WITH_QUESTION}`;
      return [`${REGIE_PREFIX} ${join(`${timeOnly}${filled}${suffix}`)}`];
    }
    // D1 : partie libre ou école sans parties → aucun repère après les réponses,
    // sauf Montpellier pendant les situations (ses règles lisent le temps écoulé).
    const montpellierMarker = this.school === "Montpellier BS" && !this.montpellierLateMarkerSent;
    if (this.inFreePart() && !montpellierMarker) {
      this.lastMarkerValue = null;
      return extras.length ? [`${REGIE_PREFIX} ${extras.join(" ")}`] : [];
    }
    if (montpellierMarker && elapsed >= 20) this.montpellierLateMarkerSent = true;
    this.lastMarkerValue = { kind: "ongoing", timeOnly };
    const markerText = this.schedule.length ? advanced.text : timeOnly;
    const step = this.schedule[this.phaseIndex];
    const suffix = step?.omitEndWithQuestion || this.omitQuestionNow() ? "" : ` ${END_WITH_QUESTION}`;
    return [`${REGIE_PREFIX} ${join(`${this.fill(markerText, at)}${suffix}`)}`];
  }

  /**
   * Repères sans « Termine ta prochaine prise de parole par une question » :
   * avant la deuxième réplique, pendant la présentation EDHEC et le pitch
   * d'EM Strasbourg, et juste après la phrase de passage de Montpellier.
   */
  private omitQuestionNow(): boolean {
    if (this.omitNextQuestion) {
      this.omitNextQuestion = false;
      return true;
    }
    if (this.hasSecondReply && this.juryMessageCount < 2 && !this.secondReplySkipped) return true;
    const open = (id: string) => !this.monologueStates.some((st) => st.measure.id === id && st.closed);
    if (this.school === "EDHEC" && open("edhec-presentation")) return true;
    if (this.school === "EM Strasbourg" && open("em-strasbourg-pitch")) return true;
    return false;
  }

  private markClosingWithoutInstruction(at: number, askedAtTrigger = false) {
    if (this.closing) return;
    this.setClosing(at, askedAtTrigger);
  }

  /** Identifiant de la phase en cours (vide sans déroulé). */
  get currentPhaseId(): string | null {
    return this.schedule[this.phaseIndex]?.id ?? null;
  }

  /** Question de clôture tirée pour cet entretien. */
  get closingQuestionText(): string {
    return this.closingQuestion;
  }

  private closeImmediately(at: number, askedAtTrigger = false): string[] {
    if (this.closing) return [];
    this.setClosing(at, askedAtTrigger);
    return [closingInstruction(this.closingQuestion)];
  }

  /** Message unique de la moitié de l'échange libre (D2), s'il est dû maintenant. */
  private midpointNow(at: number, elapsed: number, kind: MarkerKind = "ongoing"): string[] {
    if (this.themeReminderSent || this.closing || kind === "switch") return [];
    if (!this.inFreePart()) return [];
    const threshold = this.freeExchangeReminderAt();
    if (at < threshold || elapsed >= this.totalMinutes - 2) return [];
    this.themeReminderSent = true;
    const text =
      this.school === "Montpellier BS"
        ? MONTPELLIER_THEME_REMINDER
        : ["GEM (Grenoble EM)", "TBS Education", "ESC Clermont BS"].includes(this.school)
          ? THEME_REMINDER_WITHOUT_NEWS
          : THEME_REMINDER;
    return [text];
  }

  private freeExchangeReminderAt(): number {
    // EDHEC : moitié de l'entretien individuel, qui suit la présentation.
    if (this.school === "EDHEC") {
      const pres = this.monologueStates.find((st) => st.measure.id === "edhec-presentation" && st.closed);
      if (!pres?.closedAt) return Number.POSITIVE_INFINITY;
      const end = this.startedAt + this.totalMinutes * 60_000;
      return pres.closedAt + (end - pres.closedAt) / 2;
    }
    // R7 : ESSEC, de la fin de la présentation au début du cas (35e minute).
    if (this.school === "ESSEC") {
      const pres = this.monologueStates.find((st) => st.measure.id === "essec-presentation" && st.closed);
      const cas = this.schedule.find((step) => step.id === "essec-situation-1");
      const casAt = cas ? this.dueAtFor(cas) : null;
      if (!pres?.closedAt || casAt === null) return Number.POSITIVE_INFINITY;
      return pres.closedAt + (casAt - pres.closedAt) / 2;
    }
    const eligible = this.schedule.filter((step) => step.freeExchange);
    if (!eligible.length) return this.startedAt + (this.totalMinutes * 60_000) / 2;
    const spans = eligible.flatMap((step) => {
      const index = this.schedule.indexOf(step);
      const start = this.phaseStartedAt[step.id] ?? this.dueAtFor(step);
      const end = this.schedule[index + 1] ? this.dueAtFor(this.schedule[index + 1]!) : this.startedAt + this.totalMinutes * 60_000;
      return start !== null && end !== null && end > start ? [{ start, end }] : [];
    });
    if (!spans.length) return this.startedAt + (this.totalMinutes * 60_000) / 2;
    const total = spans.reduce((sum, span) => sum + span.end - span.start, 0);
    const target = total / 2;
    let traversed = 0;
    for (const span of spans) {
      const length = span.end - span.start;
      if (traversed + length >= target) return span.start + target - traversed;
      traversed += length;
    }
    return spans[spans.length - 1]!.end;
  }

  /**
   * Début de phase déclenché par un ÉVÉNEMENT de l'application (question Impact
   * Clermont, tirage des cartes emlyon, fin du compte à rebours EDHEC).
   */
  markPhaseStart(phaseId: string, at: number, label?: string): void {
    const startedMonologue = this.startMonologues(
      (measure) => ("event" in measure.start && measure.start.event === phaseId) || measure.id === phaseId,
      at,
    );
    const index = this.schedule.findIndex((step) => step.id === phaseId);
    if (index >= 0) {
      this.phaseStartedAt[phaseId] = at;
      if (index > this.phaseIndex) {
        this.confirmPhase(index, at, true);
        return;
      }
      const step = this.schedule[index]!;
      this.openPhaseTiming(step, at);
      this.startMonologues((measure) => "stepId" in measure.start && measure.start.stepId === phaseId, at);
      return;
    }
    if (!startedMonologue && label && !this.timingList.some((timing) => timing.phaseId === phaseId)) {
      this.timingList.push({
        phaseId,
        label,
        startedAt: new Date(at).toISOString(),
        anticipee: false,
        kind: "phase",
      });
    }
  }

  /**
   * La mesure d'une phase ouverte part de cet instant (emlyon : première prise
   * de parole du candidat sur la première carte). Sans effet sur le déroulé.
   */
  markMeasureStart(phaseId: string, at: number): void {
    const timing = this.timingList.find((item) => item.phaseId === phaseId && item.kind !== "monologue");
    if (timing && !timing.transitionDetectedAt) timing.startedAt = new Date(at).toISOString();
  }

  markPhaseEnd(phaseId: string, at: number): void {
    for (const state of this.monologueStates) {
      if (state.closed) continue;
      const measure = state.measure;
      const matches = measure.id === phaseId || ("event" in measure.start && measure.start.event === phaseId);
      if (matches) this.closeMonologue(state, state.lastAnswerEnd ?? at);
    }
    const timing = this.timingList.find((item) => item.phaseId === phaseId && item.kind !== "monologue");
    if (timing && !timing.transitionDetectedAt) timing.transitionDetectedAt = new Date(at).toISOString();
  }

  // ------------------------------------------------------------ état interne

  private record(type: EngineEvent["type"], at: number, phaseId?: string) {
    this.eventList.push(phaseId ? { at, type, phaseId } : { at, type });
  }

  private orderEarlySwitch(at: number, type: "early-ordered-dry" | "early-ordered-nothing-to-add" | "early-ordered-candidate-closed") {
    if (this.pendingIndex !== null) return;
    const next = this.schedule[this.phaseIndex + 1];
    if (!next) return;
    this.pendingIndex = this.phaseIndex + 1;
    this.pendingMarkerCount = 0;
    this.pendingOrderedAt = at;
    this.earlyOrdered = true;
    this.record(type, at, next.id);
  }

  private openPhaseTiming(step: PhaseStep, at: number) {
    if (!step.timing) return;
    if (this.timingList.some((timing) => timing.phaseId === step.id)) return;
    this.timingList.push({
      phaseId: step.id,
      label: step.name,
      startedAt: new Date(at).toISOString(),
      anticipee: false,
      kind: "phase",
    });
  }

  private confirmPhase(detectedIndex: number, at: number, forced = false, improvised = false) {
    const current = this.schedule[this.phaseIndex];
    const next = this.schedule[detectedIndex];
    if (!current || !next) return;
    const dueAt = this.dueAtFor(next);
    const early = !forced && dueAt !== null && at < dueAt;
    const anticipee = early && this.earlyOrdered;
    if (improvised) this.record("improvised-switch", at, next.id);
    else if (early && !this.earlyOrdered) this.record("unordered-switch", at, next.id);
    // La durée mesurée ne dépend pas du moment où le jury obéit : si un ordre de
    // bascule avait été envoyé, la phase précédente s'arrête à l'instant de l'ordre.
    const endAt = this.pendingOrderedAt !== null ? Math.min(this.pendingOrderedAt, at) : at;
    if (next.timingBelongsToPrevious) {
      // Le temps de l'entrée visée appartient à la phase en cours : on ne ferme
      // pas son chronomètre ici, mais on retient un éventuel « anticipée » pour
      // la bascule qui le fermera vraiment.
      this.carriedAnticipee = this.carriedAnticipee || anticipee;
      // « Anticipée » est visible immédiatement, comme avant, même si le
      // chronomètre reste ouvert jusqu'à la bascule suivante.
      if (this.carriedAnticipee) {
        const owner = this.timingOwner(this.phaseIndex) ?? current;
        const open = this.timingList.find((timing) => timing.phaseId === owner.id && timing.kind !== "monologue");
        if (open && !open.transitionDetectedAt) open.anticipee = true;
      }
    } else {
      // La phase qui détient le chronomètre : on remonte les entrées dont le
      // temps est compté dans la précédente (GEM : la minute de synthèse).
      const owner = this.timingOwner(this.phaseIndex) ?? current;
      const startedAt = this.phaseStartedAt[owner.id];
      const ownerAnticipee = anticipee || this.carriedAnticipee;
      const existing = this.timingList.find((timing) => timing.phaseId === owner.id && timing.kind !== "monologue");
      if (existing && !existing.transitionDetectedAt) {
        existing.transitionDetectedAt = new Date(endAt).toISOString();
        existing.anticipee = ownerAnticipee;
      } else if (!existing && startedAt && owner.timing) {
        this.timingList.push({
          phaseId: owner.id,
          label: owner.name,
          startedAt: new Date(startedAt).toISOString(),
          transitionDetectedAt: new Date(endAt).toISOString(),
          anticipee: ownerAnticipee,
          kind: "phase",
        });
      }
      this.carriedAnticipee = false;
    }
    this.phaseIndex = detectedIndex;
    this.pendingIndex = null;
    this.pendingMarkerCount = 0;
    this.pendingOrderedAt = null;
    this.dryAnswerCount = 0;
    this.addQuestionAsked = false;
    this.earlyOrdered = false;
    if (!this.phaseStartedAt[next.id]) this.phaseStartedAt[next.id] = at;
    this.openPhaseTiming(next, this.phaseStartedAt[next.id]!);
    this.startMonologues((measure) => "stepId" in measure.start && measure.start.stepId === next.id, at);
    this.record("phase-confirmed", at, next.id);
  }

  private dueAtFor(step: PhaseStep): number | null {
    // Phase démarrée par un ÉVÉNEMENT de l'application : jamais due par le temps.
    if (step.startMinute === undefined && !step.relativeToPhaseId) return null;
    const absolute = step.startMinute === undefined ? 0 : this.startedAt + step.startMinute * 60_000;
    if (!step.relativeToPhaseId) return this.capDueAt(step, absolute);
    const relativeStart = this.phaseStartedAt[step.relativeToPhaseId];
    if (!relativeStart) {
      if (!step.fallbackRelativeToPhaseId) return null;
      const fallbackStart = this.phaseStartedAt[step.fallbackRelativeToPhaseId];
      if (!fallbackStart) return null;
      return this.capDueAt(step, Math.max(absolute, fallbackStart + (step.fallbackAfterMinutes ?? 0) * 60_000));
    }
    return this.capDueAt(step, Math.max(absolute, relativeStart + (step.afterMinutes ?? 0) * 60_000));
  }

  /**
   * Phase qui détient le chronomètre à partir d'un index : on remonte les
   * entrées marquées `timingBelongsToPrevious`.
   */
  private timingOwner(index: number): PhaseStep | undefined {
    let i = index;
    while (i > 0 && this.schedule[i]?.timingBelongsToPrevious) i -= 1;
    return this.schedule[i];
  }

  /** Butoir d'échéance : jamais au-delà de `latestAfterMinutes` après la phase visée. */
  private capDueAt(step: PhaseStep, dueAt: number): number {
    if (!step.latestRelativeToPhaseId) return dueAt;
    const start = this.phaseStartedAt[step.latestRelativeToPhaseId];
    if (!start) return dueAt;
    return Math.min(dueAt, start + (step.latestAfterMinutes ?? 0) * 60_000);
  }

  private ongoingText(index: number, at: number, elapsed: number): string {
    const step = this.schedule[index];
    if (!step) return "";
    const next = this.schedule[index + 1];
    const dueAt = next ? this.dueAtFor(next) : null;
    // Compte à rebours : seulement pour les cartes emlyon (D1) et la question
    // Impact de Clermont, dont la conduite s'appuie sur « encore environ 2 min ».
    const remaining =
      dueAt === null || !COUNTDOWN_STEPS.includes(step.id) ? "" : ` encore environ ${Math.max(1, Math.ceil((dueAt - at) / 60_000))} min`;
    const frame = step.freeExchange
      ? `Tu es dans « ${step.topic ?? step.name} »${remaining} : ne change pas de partie.`
      : `INTERDICTION DE CHANGER DE PARTIE. Tu es en « ${step.topic ?? step.name} »${remaining}. ${step.ongoingRule ?? "Ta prochaine prise de parole doit être une relance sur ce sujet, jamais une transition."}`;
    return `${frame} Temps écoulé : ${elapsed} min. ${step.ongoing}${this.addQuestionSuffix(step, dueAt, at)}`;
  }

  /**
   * Question « autre chose à ajouter » : dernier recours, autorisé seulement
   * dans les 40 % finaux du temps de la phase (échéance calculable requise).
   */
  private addQuestionSuffix(step: PhaseStep, dueAt: number | null, at: number): string {
    if (!step.addQuestionAllowed || dueAt === null) return "";
    const phaseStart = this.phaseStartedAt[step.id] ?? this.startedAt;
    const duration = dueAt - phaseStart;
    if (duration <= 0) return "";
    return dueAt - at <= 0.4 * duration ? ` ${ADD_QUESTION}` : "";
  }

  /**
   * Vrai si la bascule suivante est DUE à cet instant, sans rien modifier : même
   * règles que `advance` (entrée sautable, échéance, butoir de fin d'entretien).
   */
  private nextSwitchDue(at: number, elapsed: number): boolean {
    if (!this.schedule.length) return false;
    let candidate = this.phaseIndex + 1;
    let next = this.schedule[candidate];
    if (next?.skippable && !this.earlyOrdered) {
      const after = this.schedule[candidate + 1];
      const afterDue = after ? this.dueAtFor(after) : null;
      if (afterDue !== null && at >= afterDue + SKIP_GRACE_MS) next = after;
    }
    if (!next) return false;
    const dueAt = this.dueAtFor(next);
    if (dueAt === null || at < dueAt) return false;
    const tooLate =
      next.latestStartBeforeEndMinutes !== undefined && elapsed >= this.totalMinutes - next.latestStartBeforeEndMinutes;
    return !tooLate;
  }

  /** Avance l'état des phases, puis rend le texte du repère (phase ou bascule). */
  private advance(at: number, elapsed: number): { text: string; kind: MarkerKind } {
    if (!this.schedule.length) {
      return { text: `Temps écoulé : ${elapsed} min.`, kind: "ongoing" };
    }
    const index = this.phaseIndex;
    let candidate = this.pendingIndex ?? index + 1;
    let next = this.schedule[candidate];
    if (next?.skippable && !this.earlyOrdered) {
      const after = this.schedule[candidate + 1];
      const afterDue = after ? this.dueAtFor(after) : null;
      if (afterDue !== null && at >= afterDue + SKIP_GRACE_MS) {
        candidate += 1;
        next = after;
        this.pendingIndex = null;
        this.pendingOrderedAt = null;
      }
    }
    if (this.pendingIndex === null && next) {
      const dueAt = this.dueAtFor(next);
      const tooLate =
        next.latestStartBeforeEndMinutes !== undefined &&
        elapsed >= this.totalMinutes - next.latestStartBeforeEndMinutes;
      if (dueAt !== null && at >= dueAt && !tooLate) {
        this.pendingIndex = candidate;
        this.pendingOrderedAt = at;
        this.record("switch-ordered", at, next.id);
      }
    }
    const pending = this.pendingIndex;
    if (pending !== null) {
      // Garde-fou : ordre non suivi après 2 repères de plus → la phase suivante
      // est considérée comme commencée, sans malus.
      this.pendingMarkerCount += 1;
      if (this.pendingMarkerCount > 2 && !this.schedule[pending]?.disableForcedTransition) {
        const forcedStep = this.schedule[pending]!;
        this.confirmPhase(pending, at, true);
        this.record("forced-after-2-markers", at, forcedStep.id);
        return { text: this.ongoingText(pending, at, elapsed), kind: "ongoing" };
      }
      const step = this.schedule[pending]!;
      const instruction =
        (this.earlyOrdered ? step.earlySwitchInstruction : undefined) ?? step.switchInstruction ?? "";
      const text = ` Phase en cours : ${this.schedule[index]!.topic ?? this.schedule[index]!.name}. ${instruction}`.trimEnd();
      return { text, kind: "switch" };
    }
    return { text: this.ongoingText(index, at, elapsed), kind: "ongoing" };
  }

  // -------------------------------------------------------------- monologues

  private startMonologues(match: (measure: MonologueMeasure) => boolean, at: number): boolean {
    let started = false;
    for (const measure of this.monologues) {
      if (!match(measure)) continue;
      if (this.monologueStates.some((state) => state.measure.id === measure.id)) continue;
      this.monologueStates.push({
        measure,
        startedAt: at,
        awaitingSpeechEnd: true,
        answers: 0,
        lastAnswerEnd: null,
        closed: false,
      });
      this.timingList.push({
        phaseId: measure.id,
        label: measure.label,
        startedAt: new Date(at).toISOString(),
        anticipee: false,
        kind: "monologue",
      });
      started = true;
    }
    return started;
  }

  /**
   * Fin du monologue = fin de la DERNIÈRE réponse du candidat avant que le jury
   * reprenne la parole (ses fragments consécutifs sont donc cumulés).
   */
  private closeOpenMonologues(at: number) {
    for (const state of this.monologueStates) {
      if (state.closed || state.answers === 0) continue;
      this.closeMonologue(state, state.lastAnswerEnd ?? at);
    }
  }

  private closeMonologue(state: MonologueState, end: number) {
    state.closed = true;
    state.closedAt = end;
    const timing = this.timingList.find((item) => item.phaseId === state.measure.id);
    if (timing && !timing.transitionDetectedAt) timing.transitionDetectedAt = new Date(end).toISOString();
  }
}
