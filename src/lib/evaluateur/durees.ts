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
 * Partie du barème → mesures enregistrées par l'app (phase_timings) :
 * `parole` = temps de parole du candidat seul (monologue), `partie` = toute la
 * partie, relances du jury comprises. Le champ « mesure » du barème décide (D11).
 */
const MESURES: Record<string, Record<string, { parole?: string; partie?: string }>> = {
  tbs: { article: { parole: "tbs-article-monologue", partie: "tbs-article" } },
  gem: { expose: { parole: "gem-expose-monologue", partie: "gem-expose" }, interview_inversee: { partie: "gem-inversee" } },
  emlyon: { cartes: { partie: "emlyon-cartes" } },
  kedge: { autoportrait: { parole: "kedge-autoportrait-monologue", partie: "kedge-autoportrait" } },
  edhec: { presentation_mot: { parole: "edhec-presentation" } },
  essec: { presentation_longue: { parole: "essec-presentation" } },
  clermont: { question_impact: { partie: "clermont-impact" } },
  inseec: { image: { parole: "inseec-image-monologue", partie: "inseec-image" } },
  em_strasbourg: { pitch: { parole: "em-strasbourg-pitch" } },
};

/** Identifiants à lire, dans l'ordre, selon le champ « mesure » du barème. */
export function mesuresPour(grille: string, partie: string, mesure: string | undefined): string[] {
  const m = MESURES[grille]?.[partie];
  if (!m) return [];
  const paroleSeule = (mesure ?? "").startsWith("temps de parole du candidat seul");
  // R14 : seule la mesure demandée ; si elle n'existe pas, aucune pénalité.
  const id = paroleSeule ? m.parole : m.partie;
  return id ? [id] : [];
}

/** Durées mesurées par le code et pénalités qui en découlent. Dans le doute : aucune pénalité. */
export function mesurerPenalites(
  grille: string,
  timings: TimingEnregistre[],
): { penalites: PenaliteAppliquee[]; controles: ControleDuree[] } {
  const seuils = BAREME.regles.penalites_duree.seuils_par_grille[grille] ?? [];
  const controles: ControleDuree[] = [];
  const parties = new Set<string>();
  for (const s of seuils) {
    const ids = mesuresPour(grille, s.partie, s.mesure);
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
