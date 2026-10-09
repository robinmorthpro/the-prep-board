import bareme from "./bareme.json";

export type Niveau = "N4" | "N3" | "N2" | "N1";
export type NiveauOuNonObserve = Niveau | "non observé";

export type CaseDef = { cle: string; nom: string; points: Record<Niveau, number> };
export type CritereDef = { cle: string; nom: string; total: number; cases: CaseDef[] };
export type GrilleDef = { criteres: CritereDef[]; total_brut: number };
export type SeuilDuree = { partie: string; type: "trop_court" | "trop_long"; seuil_s: number; seuil: string };
export type LignePercentile = { note: number; percentile: number };

type Bareme = {
  niveaux: string[];
  grilles: Record<string, GrilleDef>;
  ecoles: Record<string, string>;
  ecoles_hors_configuration: Record<string, string>;
  regles: { penalites_duree: { valeur: number; seuils_par_grille: Record<string, SeuilDuree[]> } };
  percentile: { table: LignePercentile[] };
};

export const BAREME = bareme as unknown as Bareme;

/**
 * Anciens noms d'école encore présents dans des sessions enregistrées, absents
 * du barème. Correspondance dans le code : le barème n'est jamais modifié.
 */
const ALIAS_ECOLES: Record<string, string> = {
  "La Rochelle BS": "Excelia BS (La Rochelle)",
};

/** Clé de grille pour un nom d'école enregistré dans interview_sessions.school. */
export function grilleKeyForSchool(school: string): string | null {
  const name = ALIAS_ECOLES[school] ?? school;
  const key = BAREME.ecoles[name] ?? BAREME.ecoles_hors_configuration[name];
  return typeof key === "string" && BAREME.grilles[key] ? key : null;
}

/** Fichier d'école : `ecoles/<clé>.md`, les tirets bas devenant des tirets. */
export function schoolFileForGrille(grille: string): string {
  return `${grille.replace(/_/g, "-")}.md`;
}
