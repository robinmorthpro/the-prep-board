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
import { isDryAnswer, isImposedQuestionAsked, isNothingToAdd, normalizeInterviewText } from "./interview-text";
import { ADD_QUESTION } from "./school-interviews";
import type { MonologueMeasure, PhaseStep, PhaseTiming } from "./school-interviews";

/** Préfixe de toutes les consignes internes envoyées au jury par l'application. */
export const REGIE_PREFIX = "[RÉGIE — consigne interne, ne jamais la lire ni la mentionner]";

/** Vrai pour un message de régie : il ne doit jamais apparaître dans le fil. */
export function isRegieMessage(text: string) {
  return text.trim().startsWith("[RÉGIE");
}

/** Rappel ajouté à la fin de CHAQUE repère : le jury ne rend jamais la main sans question. */
export const END_WITH_QUESTION = "Termine ta prochaine prise de parole par une question.";
export const THEME_REMINDER =
  "Rappel : d'ici la fin de l'entretien, les cinq thèmes (expériences, personnalité, projet, école, ouverture) doivent tous avoir été abordés. L'entretien continue jusqu'à la consigne de clôture.";
export const MONTPELLIER_THEME_REMINDER =
  "Rappel : d'ici la fin de l'entretien, les expériences, la personnalité et l'ouverture doivent avoir été abordées. L'entretien continue jusqu'à la consigne de clôture.";

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
    | "early-ordered-nothing-to-add"
    | "phase-confirmed"
    | "unordered-switch"
    | "improvised-switch"
    | "recovered-switch"
    | "forced-after-2-markers"
    | "closing";
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

type MonologueState = {
  measure: MonologueMeasure;
  startedAt: number;
  /** Début encore affinable par la fin de la parole du jury (oral). */
  awaitingSpeechEnd: boolean;
  answers: number;
  lastAnswerEnd: number | null;
  closed: boolean;
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

  constructor(opts: {
    school: string;
    schedule: PhaseStep[];
    monologues: MonologueMeasure[];
    totalMinutes: number;
    startedAt: number;
  }) {
    this.school = opts.school;
    this.schedule = opts.schedule;
    this.monologues = opts.monologues;
    this.totalMinutes = opts.totalMinutes;
    this.startedAt = opts.startedAt;
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
    this.closeOpenMonologues(at);
    this.startMonologues((measure) => "juryMessage" in measure.start && measure.start.juryMessage === this.juryMessageCount, at);
    // Aucune détection sur le tout premier message du jury.
    if (this.juryMessageCount <= 1) return [];
    const normalized = normalizeInterviewText(text);
    const currentStep = this.schedule[this.phaseIndex];
    if (currentStep?.closeOnExit?.test(normalized)) return this.closeImmediately(at);
    let detectedIndex: number | null = null;
    let improvised = false;
    if (this.pendingIndex !== null) {
      const detect = this.schedule[this.pendingIndex]?.detect;
      if (!detect || detect.test(normalized) || TRANSITION_RE.test(normalized)) detectedIndex = this.pendingIndex;
    } else {
      const nextIndex = this.phaseIndex + 1;
      const next = this.schedule[nextIndex];
      if (next?.allowEarly && (next.detect?.test(normalized) || TRANSITION_RE.test(normalized))) detectedIndex = nextIndex;
      if (
        detectedIndex === null &&
        next &&
        this.dueAtFor(next) !== null &&
        !next.detect?.test(normalized) &&
        (IMPROVISED_SWITCH_RE.test(normalized) || TRANSITION_RE.test(normalized))
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
    const unordered =
      this.pendingIndex === null && dueAt !== null && at < dueAt && !this.earlyOrdered && !earlyPhraseAllowed;
    if (unordered) {
      const recovery = this.tryRecover(at);
      if (recovery) return [recovery];
    }
    this.confirmPhase(detectedIndex, at, false, improvised);
    return next.closeOnEnter ? this.closeImmediately(at) : [];
  }

  /** Consigne de rattrapage, tant que la limite de deux par phase n'est pas atteinte. */
  private tryRecover(at: number): string | null {
    const current = this.schedule[this.phaseIndex];
    if (!current) return null;
    const used = this.recoveryCount[current.id] ?? 0;
    if (used >= 2) return null;
    this.recoveryCount[current.id] = used + 1;
    this.record("recovered-switch", at, current.id);
    return `Tu viens d'annoncer un changement de partie alors que ce n'est pas le moment. Reprends immédiatement la partie en cours, ${current.topic ?? current.name}, sans mentionner ce changement ni t'excuser : pose une nouvelle question sur ce sujet.`;
  }

  /** Oral uniquement : la parole du jury s'arrête, le monologue démarre vraiment ici. */
  onJuryFinishedSpeaking(at: number): void {
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
   * le repère de temps à envoyer. Inchangé.
   */
  onCandidateAnswer(text: string, at: number): string[] {
    this.applyCandidateAnswer(text, at);
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    return this.buildMarker(at, this.elapsedMinutes(at));
  }

  /**
   * Fin de réponse du candidat À L'ORAL, quand le repère de temps a déjà été
   * pré-envoyé en fin de prise de parole du jury (`markerAtJuryTurnEnd`).
   * La réponse est enregistrée exactement comme en écrit (réponses sèches,
   * « rien à ajouter », mesures de monologue) mais on ne renvoie un repère QUE
   * si cette réponse vient de déclencher un ORDRE de bascule anticipée : lui
   * dépend du contenu de la réponse et n'était donc pas dans le repère pré-envoyé.
   */
  onCandidateAnswerAfterPreSentMarker(text: string, at: number): string[] {
    const pendingBefore = this.pendingIndex;
    this.applyCandidateAnswer(text, at);
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    const elapsed = this.elapsedMinutes(at);
    // Clôture due pendant la réponse : elle part juste après, sinon elle n'arriverait
    // qu'à la fin de la prise de parole suivante du jury, soit une question trop tard.
    const closingDue = !this.closing && elapsed >= this.totalMinutes - 2;
    // Bascule devenue DUE pendant la réponse du candidat : l'ordre part juste
    // après, sans attendre la fin de la prise de parole suivante du jury (sinon
    // la bascule arriverait une question trop tard).
    const switchDue = !closingDue && !this.closing && this.pendingIndex === null && this.nextSwitchDue(at, elapsed);
    if (this.pendingIndex === pendingBefore && !closingDue && !switchDue) {
      // On NE remet PAS lastMarkerValue à null : le repère pré-envoyé reste la
      // référence, pour que les consignes en file attendent bien le repère suivant.
      return [];
    }
    return this.buildMarker(at, elapsed);
  }

  /**
   * ORAL — repère valable à l'instant où le jury finit de parler : exactement le
   * même repère que produirait `onCandidateAnswer` au même instant (ordre de
   * bascule répété jusqu'à détection, forçage après 2 repères, clôture à Y−2
   * prioritaire). Le comptage des repères se fait donc bien là où le repère est
   * réellement envoyé.
   */
  markerAtJuryTurnEnd(at: number): string[] {
    if (this.totalMinutes <= 0) {
      this.lastMarkerValue = null;
      return [];
    }
    return this.buildMarker(at, this.elapsedMinutes(at));
  }

  private elapsedMinutes(at: number) {
    return Math.floor((at - this.startedAt) / 60_000);
  }

  /** Enregistrement d'une réponse du candidat, sans aucun envoi. */
  private applyCandidateAnswer(text: string, at: number) {
    this.lastAnswerEnd = at;
    for (const state of this.monologueStates) {
      if (state.closed) continue;
      state.answers += 1;
      state.awaitingSpeechEnd = false;
      state.lastAnswerEnd = at;
    }
    if (this.totalMinutes <= 0) return;
    const current = this.schedule[this.phaseIndex];
    if (current?.dryEarlySwitch) {
      if (isDryAnswer(text)) this.dryAnswerCount += 1;
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


  private buildMarker(at: number, elapsed: number): string[] {
    // Dans les deux dernières minutes, la clôture l'emporte : aucune bascule.
    const closing = elapsed >= this.totalMinutes - 2;
    const advanced = closing ? { text: "", kind: "none" as MarkerKind } : this.advance(at, elapsed);
    const timeOnly = `Temps écoulé : ${elapsed} min sur ${this.totalMinutes} min.`;
    this.lastMarkerValue = { kind: advanced.kind, timeOnly };
    const reminder = this.themeReminder(at, elapsed, advanced.kind);
    const markerText = advanced.kind === "ongoing" ? `${advanced.text}${reminder}` : `${timeOnly}${advanced.text}`;
    const updates = [`${REGIE_PREFIX} ${markerText} ${END_WITH_QUESTION}`];
    if (!this.closing && closing) {
      this.closing = true;
      this.pendingIndex = null;
      this.pendingMarkerCount = 0;
      this.pendingOrderedAt = null;
      this.record("closing", at);
      updates.push(
        `${REGIE_PREFIX} Il reste 2 minutes : pose maintenant ta question de clôture puis la phrase de sortie. ${END_WITH_QUESTION}`,
      );
    }
    return updates;
  }

  private closeImmediately(at: number): string[] {
    if (this.closing) return [];
    this.closing = true;
    this.pendingIndex = null;
    this.pendingMarkerCount = 0;
    this.pendingOrderedAt = null;
    this.record("closing", at);
    return [`Pose maintenant ta question de clôture puis la phrase de sortie. ${END_WITH_QUESTION}`];
  }

  /** Rappel unique aux deux tiers du temps cumulé des phases éligibles. */
  private themeReminder(at: number, elapsed: number, kind: MarkerKind): string {
    if (this.themeReminderSent || this.closing || kind !== "ongoing") return "";
    const current = this.schedule[this.phaseIndex];
    const isFreeExchange = this.schedule.length === 0 || current?.freeExchange === true;
    if (!isFreeExchange) return "";
    const threshold = this.freeExchangeReminderAt();
    if (at < threshold || elapsed >= this.totalMinutes - 2) return "";
    this.themeReminderSent = true;
    const text = this.school === "Montpellier BS" ? MONTPELLIER_THEME_REMINDER : THEME_REMINDER;
    return ` ${text}`;
  }

  private freeExchangeReminderAt(): number {
    const eligible = this.schedule.filter((step) => step.freeExchange);
    if (!eligible.length) return this.startedAt + (this.totalMinutes * 2 * 60_000) / 3;
    const spans = eligible.flatMap((step) => {
      const index = this.schedule.indexOf(step);
      const start = this.phaseStartedAt[step.id] ?? this.dueAtFor(step);
      const end = this.schedule[index + 1] ? this.dueAtFor(this.schedule[index + 1]!) : this.startedAt + this.totalMinutes * 60_000;
      return start !== null && end !== null && end > start ? [{ start, end }] : [];
    });
    if (!spans.length) return this.startedAt + (this.totalMinutes * 2 * 60_000) / 3;
    const total = spans.reduce((sum, span) => sum + span.end - span.start, 0);
    const target = (total * 2) / 3;
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

  private orderEarlySwitch(at: number, type: "early-ordered-dry" | "early-ordered-nothing-to-add") {
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
    const remaining = dueAt === null ? "" : ` encore environ ${Math.max(1, Math.ceil((dueAt - at) / 60_000))} min`;
    return `INTERDICTION DE CHANGER DE PARTIE. Tu es en « ${step.topic ?? step.name} »${remaining}. Ta prochaine prise de parole doit être une relance sur ce sujet, jamais une transition. Temps écoulé : ${elapsed} min sur ${this.totalMinutes} min. ${step.ongoing}${this.addQuestionSuffix(step, dueAt, at)}`;
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
      return { text: `Temps écoulé : ${elapsed} min sur ${this.totalMinutes} min.`, kind: "ongoing" };
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
      if (this.pendingMarkerCount > 2) {
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
    const timing = this.timingList.find((item) => item.phaseId === state.measure.id);
    if (timing && !timing.transitionDetectedAt) timing.transitionDetectedAt = new Date(end).toISOString();
  }
}
