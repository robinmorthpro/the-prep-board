// Secours « Tu viens de rendre la main sans poser de question » : quand il ne
// doit PAS partir (fonction pure, partagée par l'écran d'entretien et le banc).
import { EXIT_SENTENCE_RE, MONTPELLIER_PASSAGE_RE, TRANSITION_RE } from "./phase-engine";
import { INVITATION_RE, normalizeInterviewText } from "./interview-text";

export const MAIN_RENDUE_NUDGE =
  "Tu viens de rendre la main sans poser de question. Pose immédiatement ta question suivante, en une phrase, sans revenir sur ce que tu as déjà dit.";

/** Phrases imposées hors calendrier (cartes, situations). Texte normalisé. */
const PHRASES_IMPOSEES_RE =
  /passer a une autre situation|merci pour ce recit|il nous reste (une|trois|deux|[123]) cartes?|derniere carte|laquelle voulez-vous traiter|quelle carte souhaitez-vous|nous avons termine avec les (4|quatre) cartes|nous passons maintenant a/;

export function mainRendueBloquee(opts: {
  /** Texte normalisé de la prise de parole du jury. */
  normalized: string;
  /** Phrases imposées du calendrier de l'école (transitions). */
  phrases?: (string | undefined)[];
  /** Question de clôture tirée. */
  closingQuestion?: string | undefined;
  /** La consigne de clôture est partie. */
  closingSent?: boolean;
  /** Partie en cours (moteur de phases). */
  phaseId?: string | null;
}): boolean {
  const n = opts.normalized;
  if (INVITATION_RE.test(n)) return true;
  if (EXIT_SENTENCE_RE.test(n) || opts.closingSent) return true;
  if (opts.closingQuestion) {
    const q = normalizeInterviewText(opts.closingQuestion).slice(0, 30);
    if (q && n.includes(q)) return true;
  }
  if (opts.phaseId === "gem-inversee" || opts.phaseId === "gem-minute") return true;
  if (MONTPELLIER_PASSAGE_RE.test(n) || PHRASES_IMPOSEES_RE.test(n) || TRANSITION_RE.test(n)) return true;
  for (const phrase of opts.phrases ?? []) {
    if (!phrase) continue;
    const p = normalizeInterviewText(phrase).slice(0, 30);
    if (p && n.includes(p)) return true;
  }
  return false;
}
