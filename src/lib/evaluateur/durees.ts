import { BAREME } from "./bareme";
import type { PenaliteAppliquee } from "./calcul";

export type TimingEnregistre = {
  phaseId: string;
  startedAt: string;
  transitionDetectedAt?: string;
  kind?: "phase" | "monologue";
};

export type ControleDuree = {
  partie: string;
  type: "trop_court" | "trop_long";
  seuil_s: number;
  duree_mesuree_s: number | null;
  appliquee: boolean;
  raison: string;
};

/**
 * Partie du barème → mesures enregistrées par l'app (phase_timings), par ordre
 * de préférence : le monologue du candidat d'abord, puis la phase chronométrée.
 */
const MESURES: Record<string, Record<string, string[]>> = {
  tbs: { article: ["tbs-article-monologue", "tbs-article"] },
  gem: { expose: ["gem-expose-monologue", "gem-expose"], interview_inversee: ["gem-inversee"] },
  emlyon: { cartes: ["emlyon-cartes"] },
  kedge: { autoportrait: ["kedge-autoportrait-monologue", "kedge-autoportrait"] },
  edhec: { presentation_mot: ["edhec-presentation"] },
  essec: { presentation_longue: ["essec-presentation"] },
  clermont: { question_impact: ["clermont-impact"] },
  inseec: { image: ["inseec-image-monologue", "inseec-image"] },
  em_strasbourg: { pitch: [] },
};

/** Durées mesurées par le code et pénalités qui en découlent. Dans le doute : aucune pénalité. */
export function mesurerPenalites(
  grille: string,
  timings: TimingEnregistre[],
): { penalites: PenaliteAppliquee[]; controles: ControleDuree[] } {
  const seuils = BAREME.regles.penalites_duree.seuils_par_grille[grille] ?? [];
  const controles: ControleDuree[] = [];
  const parties = new Set<string>();
  for (const s of seuils) {
    const ids = MESURES[grille]?.[s.partie] ?? [];
    const timing = ids
      .map((id) => timings.find((t) => t.phaseId === id && t.transitionDetectedAt))
      .find(Boolean);
    if (!timing?.transitionDetectedAt) {
      controles.push({ partie: s.partie, type: s.type, seuil_s: s.seuil_s, duree_mesuree_s: null, appliquee: false, raison: "durée non mesurée : aucune pénalité" });
      continue;
    }
    const duree = (new Date(timing.transitionDetectedAt).getTime() - new Date(timing.startedAt).getTime()) / 1000;
    if (!Number.isFinite(duree) || duree < 0) {
      controles.push({ partie: s.partie, type: s.type, seuil_s: s.seuil_s, duree_mesuree_s: null, appliquee: false, raison: "horodatages incohérents : aucune pénalité" });
      continue;
    }
    const hors = s.type === "trop_court" ? duree < s.seuil_s : duree > s.seuil_s;
    // Une pénalité par partie au plus.
    const appliquee = hors && !parties.has(s.partie);
    if (appliquee) parties.add(s.partie);
    controles.push({
      partie: s.partie,
      type: s.type,
      seuil_s: s.seuil_s,
      duree_mesuree_s: Math.round(duree),
      appliquee,
      raison: appliquee ? "hors seuil" : hors ? "partie déjà pénalisée" : "durée conforme",
    });
  }
  const penalites = controles
    .filter((c) => c.appliquee)
    .map((c) => ({ partie: c.partie, type: c.type, duree_mesuree_s: c.duree_mesuree_s!, seuil_s: c.seuil_s }));
  return { penalites, controles };
}
