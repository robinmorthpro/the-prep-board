/** Normalisation unique pour toutes les détections de phrases du jury. */
export function normalizeInterviewText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Retire la charge vide d'un appel d'outil parfois préfixée au message du jury. */
export function cleanJuryMessage(text: string) {
  return text.replace(/^\s*\{\s*\}\s*/, "").trim();
}

/**
 * Prises de parole du jury qui rendent légitimement la main SANS question :
 * invitations explicites à parler et phrases imposées par la conduite d'une
 * école. Elles n'arment jamais le secours « main rendue ». La regex s'applique
 * toujours au texte normalisé (`normalizeInterviewText`).
 */
export const INVITATION_RE =
  /je vous ecoute|nous vous ecoutons|a vous de jouer|a vous|presentez-vous|je vous invite a vous presenter|bon courage|je vous laisse|allez-y|l'axe retenu est|quelle carte souhaitez-vous|il vous reste une minute|racontez|parlez-moi|presentez|decrivez|expliquez|developpez|dites-moi|donnez-moi|choisissez un axe|par laquelle voulez-vous commencer|m'interroger|votre synthese|une petite mise en situation|quelques secondes pour reflechir|voici vos cinq cartes|tirage de vos (4|quatre) cartes|termine avec les (4|quatre) cartes|citez|nommez|convainquez-moi|vendez-moi|justifiez|resumez|comparez|imaginez/;

/**
 * ESC Clermont BS : la détection souple de l'axe dans la réponse du candidat
 * ne s'active qu'APRÈS que le jury a proposé le choix (« choisissez un axe »,
 * texte normalisé). Avant, un « profit » prononcé dans le pitch ne doit rien
 * déclencher.
 */
export const CLERMONT_AXIS_OFFER_RE = /choisissez un axe/;

/**
 * La question imposée transmise par l'application a-t-elle été posée mot pour
 * mot ? On compare les 40 premiers caractères normalisés : c'est assez pour
 * distinguer la vraie question d'une question inventée par le jury.
 */
export function isImposedQuestionAsked(question: string, juryText: string) {
  const needle = normalizeInterviewText(question).slice(0, 40);
  if (!needle) return false;
  return normalizeInterviewText(juryText).includes(needle);
}

/** Marqueurs explicites d'une réponse « à sec ». */
const DRY_ANSWER_RE =
  /je ne sais pas|je sais pas|rien a ajouter|rien d'autre|pas d'avis|je ne vois pas|aucune idee|pas vraiment d'avis|je n'ai pas d'autre/;

/**
 * Réponse « sèche » du candidat : moins de 6 mots (ElevenLabs découpe la parole
 * à chaque pause, les fragments courts sont fréquents), ou formule explicite
 * d'épuisement du sujet. Sert à décider côté application (jamais côté jury)
 * d'une bascule anticipée après 3 réponses sèches consécutives.
 */
export function isDryAnswer(text: string) {
  const normalized = normalizeInterviewText(text);
  if (!normalized) return true;
  const words = normalized.split(" ").filter(Boolean).length;
  if (words < 6) return true;
  // Le marqueur explicite ne compte que sur une réponse courte : dans une
  // phrase développée, « je ne vois pas… » est un vrai argument, pas un aveu.
  if (words <= 12 && DRY_ANSWER_RE.test(normalized)) return true;
  return false;
}

const NOTHING_TO_ADD_RE =
  /rien (d'autre )?a ajouter|fait le tour|j'ai tout dit|c'est tout(?! a fait)|rien d'autre|pas d'autre chose|non merci|plus de questions?/;
const NEGATIVE_START_RE = /^(non|pas vraiment|pas specialement|je ne pense pas|je ne crois pas|je crois pas|je pense pas)\b/;
/** Réponse négative à « Avez-vous autre chose à ajouter sur cette partie ? ». */
export function isNothingToAdd(text: string) {
  const normalized = normalizeInterviewText(text);
  const words = normalized.split(" ").filter(Boolean).length;
  if (!normalized) return false;
  // La branche explicite ne compte que sur une réponse courte : « c'est tout
  // à fait ça » ou « rien d'autre qu'une solution : … » développent au contraire.
  if (words <= 12 && NOTHING_TO_ADD_RE.test(normalized)) return true;
  return words <= 6 && NEGATIVE_START_RE.test(normalized);
}

/**
 * Délai avant le rattrapage d'un tour de jury manquant, selon le mode.
 * À l'oral comme à l'écrit : 3 s. Mesuré sur le banc, 10 à 18 % des réponses du
 * candidat ne sont suivies d'aucun texte du jury (le repère de temps envoyé juste
 * après la réponse est traité par le modèle comme son tour) ; attendre 5 s à
 * l'oral laissait un blanc trop long avant la relance.
 */
export const EMPTY_TURN_DELAY_MS = { text: 3_000, voice: 3_000 } as const;

/** Relance envoyée quand le jury n'a pas repris la parole après le candidat. */
export const EMPTY_TURN_NUDGE =
  "Tu n'as pas repris la parole après la réponse du candidat. Pose maintenant ta question suivante, en une phrase. Tu ne parles jamais à la place du candidat.";

/** Relance envoyée quand le jury n'a pas réagi à une consigne de l'application. */
export const IGNORED_NUDGE_NUDGE =
  "Tu n'as pas répondu à la consigne précédente. Reprends la parole maintenant, en une phrase, par une question au candidat.";

/**
 * Filet unique « c'est au jury de parler » : le jury doit reprendre la parole
 * après une réponse du candidat OU après une consigne envoyée par
 * l'application. Le rattrapage ne se déclenche jamais quand c'est le candidat
 * qu'on attend (le jury a parlé en dernier) : il a le droit de réfléchir aussi
 * longtemps qu'il veut. Une seule relance par occasion.
 */
export function juryTurnRescueDue(state: {
  /** Horodatage (ms) de la dernière réponse du candidat. */
  lastAnswerAt: number | null;
  /** Horodatage (ms) de la dernière consigne envoyée par l'application. */
  lastNudgeAt: number | null;
  /** Horodatage (ms) de la dernière prise de parole du jury. */
  lastJuryAt: number | null;
  now: number;
  jurySpeaking: boolean;
  closed: boolean;
  /** Occasion déjà rattrapée (au plus une relance par occasion). */
  rescuedForAt: number | null;
  mode: "text" | "voice";
}): { at: number; nudge: string } | null {
  const { lastAnswerAt, lastNudgeAt, lastJuryAt, now, jurySpeaking, closed, rescuedForAt, mode } = state;
  if (closed || jurySpeaking) return null;
  const answerAt = lastAnswerAt ?? -1;
  const nudgeAt = lastNudgeAt ?? -1;
  const at = Math.max(answerAt, nudgeAt);
  if (at < 0) return null;
  // Le jury a parlé après : ce n'est pas un tour manquant.
  if (lastJuryAt !== null && lastJuryAt >= at) return null;
  if (rescuedForAt === at) return null;
  if (now - at < EMPTY_TURN_DELAY_MS[mode]) return null;
  return { at, nudge: nudgeAt >= answerAt ? IGNORED_NUDGE_NUDGE : EMPTY_TURN_NUDGE };
}


/**
 * Candidat muet, À L'ORAL UNIQUEMENT : trois relances du jury (10 s, 20 s,
 * 30 s), et rien de plus — l'application ne clôt JAMAIS l'entretien d'elle-même,
 * un candidat peut légitimement rester muet longtemps pendant qu'il prépare un
 * sujet. En mode écrit, rien de tout cela : taper une réponse prend du temps.
 */
export const NO_ANSWER_STEPS = [
  {
    afterMs: 10_000,
    instruction:
      "Le candidat n'a pas répondu depuis dix secondes. Relance-le en une phrase courte et bienveillante, sans répéter ta question à l'identique.",
  },
  {
    afterMs: 20_000,
    instruction: "Toujours aucune réponse. Reformule autrement, plus simplement, en une phrase.",
  },
  {
    afterMs: 30_000,
    instruction:
      "Le candidat ne répond plus depuis trente secondes. Demande-lui, avec bienveillance, s'il souhaite poursuivre l'entretien ou l'arrêter maintenant.",
  },
] as const;

/**
 * Prochain palier à déclencher (index dans `NO_ANSWER_STEPS`), ou `null`.
 * Les paliers sont ancrés sur le DÉBUT du silence (`silenceSince`) : les
 * relances du jury entre deux paliers ne repoussent donc pas les suivants.
 * Ne s'arme que lorsque les paliers sont actifs, que le JURY a parlé en dernier,
 * qu'il se tait, et hors période de préparation/réflexion accordée (`paused`).
 */
export function noAnswerStepDue(state: {
  /**
   * Paliers actifs : la route passe `mode === "voice" || testSilenceEnabled`.
   * La bascule de test écrite est à retirer avec le MODE TEST ÉCRIT.
   */
  enabled: boolean;
  /** Début du silence : première prise de parole du jury depuis la dernière réponse. */
  silenceSince: number | null;
  /** Horodatage (ms) de la dernière prise de parole du jury. */
  lastJuryAt: number | null;
  /** Horodatage (ms) de la dernière réponse du candidat. */
  lastAnswerAt: number | null;
  now: number;
  jurySpeaking: boolean;
  closed: boolean;
  /** Préparation ou réflexion accordée : aucun palier ne se déclenche. */
  paused: boolean;
  /** Nombre de paliers déjà déclenchés depuis la dernière réponse. */
  stepsDone: number;
}): number | null {
  const { enabled, silenceSince, lastJuryAt, lastAnswerAt, now, jurySpeaking, closed, paused, stepsDone } = state;
  if (!enabled || closed || jurySpeaking || paused) return null;
  if (lastJuryAt === null || silenceSince === null) return null;
  // Le candidat a parlé après le jury : ce n'est pas un silence du candidat.
  if (lastAnswerAt !== null && lastAnswerAt >= lastJuryAt) return null;
  const elapsed = now - silenceSince;
  for (let index = NO_ANSWER_STEPS.length - 1; index >= stepsDone; index -= 1) {
    if (elapsed >= NO_ANSWER_STEPS[index]!.afterMs) return index;
  }
  return null;
}

/** Un envoi vers l'agent : mise à jour contextuelle ou prise de parole candidat. */
export type AgentSend = { kind: "context" | "user"; text: string };

/**
 * Ordre d'envoi autour d'une réponse du candidat, en mode écrit : TOUTES les
 * mises à jour contextuelles (consignes « avant », repère de temps du moteur,
 * consignes en file) partent AVANT le message du candidat.
 * Mesuré sur le banc : un repère envoyé APRÈS la réponse est traité par le
 * modèle comme son propre tour et le jury reste muet une fois sur dix ; envoyé
 * avant, zéro silence sur 139 réponses, pilotage des parties intact.
 * Le contenu du repère est calculé exactement comme avant (`onCandidateAnswer`
 * sur le texte et l'horodatage de la réponse) : seul l'ordre d'envoi change.
 */
export function buildAnswerSendPlan(state: {
  /** Consignes à transmettre avant la réponse (déjà préfixées si besoin). */
  before: string[];
  /** Réponse du candidat, ou `null` à l'oral (elle est déjà partie). */
  answer: string | null;
  /** Repère de temps et consignes en file : eux aussi avant la réponse. */
  after: string[];
}): AgentSend[] {
  const { before, answer, after } = state;
  return [
    ...before.map((text) => ({ kind: "context" as const, text })),
    ...after.map((text) => ({ kind: "context" as const, text })),
    ...(answer === null ? [] : [{ kind: "user" as const, text: answer }]),
  ];
}
