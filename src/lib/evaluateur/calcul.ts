import { BAREME, type GrilleDef, type LignePercentile, type NiveauOuNonObserve } from "./bareme";

export type NiveauxParCase = Record<string, Record<string, NiveauOuNonObserve>>;

export type PenaliteAppliquee = {
  partie: string;
  type: "trop_court" | "trop_long";
  duree_mesuree_s: number;
  seuil_s: number;
};

export type ResultatCalcul = {
  interrompu: boolean;
  points_par_case: Record<string, Record<string, number | null>>;
  points_par_critere: Record<string, number | null>;
  criteres_non_notes: string[];
  diviseur: number | null;
  note_sur_20: number | null;
  note_finale: number | null;
  percentile: number | null;
};

/** Percentile : ligne inférieure de la table, borné entre P1 et P99. */
export function percentileFor(note: number, table: LignePercentile[] = BAREME.percentile.table): number {
  let p = 1;
  for (const ligne of [...table].sort((a, b) => a.note - b.note)) {
    if (note >= ligne.note) p = ligne.percentile;
  }
  return Math.min(99, Math.max(1, p));
}

/** Calcul pur, sans IA, selon `ordre_de_calcul` du barème. */
export function calculerNote(
  grille: GrilleDef,
  niveaux: NiveauxParCase,
  options: { interrompu: boolean; penalites: PenaliteAppliquee[]; valeurPenalite?: number },
): ResultatCalcul {
  const points_par_case: ResultatCalcul["points_par_case"] = {};
  const points_par_critere: ResultatCalcul["points_par_critere"] = {};
  const criteres_non_notes: string[] = [];
  let maxNonEvalue = 0;
  let somme = 0;

  for (const critere of grille.criteres) {
    const pc: Record<string, number | null> = {};
    points_par_case[critere.cle] = pc;
    let total = 0;
    let evaluees = 0;
    for (const c of critere.cases) {
      const niveau = niveaux[critere.cle]?.[c.cle];
      if (!niveau || niveau === "non observé") {
        pc[c.cle] = null;
        maxNonEvalue += Math.max(...Object.values(c.points));
        continue;
      }
      const pts = c.points[niveau];
      pc[c.cle] = pts;
      total += pts;
      evaluees += 1;
    }
    if (evaluees === 0) {
      points_par_critere[critere.cle] = null;
      criteres_non_notes.push(critere.cle);
    } else {
      const note = Math.max(0, total);
      points_par_critere[critere.cle] = note;
      somme += note;
    }
  }

  if (options.interrompu) {
    return { interrompu: true, points_par_case, points_par_critere, criteres_non_notes, diviseur: null, note_sur_20: null, note_finale: null, percentile: null };
  }

  const diviseur = grille.total_brut - maxNonEvalue;
  if (diviseur <= 0) {
    return { interrompu: false, points_par_case, points_par_critere, criteres_non_notes, diviseur, note_sur_20: null, note_finale: null, percentile: null };
  }
  const note_sur_20 = (somme * 20) / diviseur;
  const valeur = options.valeurPenalite ?? Math.abs(BAREME.regles.penalites_duree.valeur);
  const note_finale = Math.max(0, note_sur_20 - valeur * options.penalites.length);
  return {
    interrompu: false,
    points_par_case,
    points_par_critere,
    criteres_non_notes,
    diviseur,
    note_sur_20,
    note_finale,
    percentile: percentileFor(note_finale),
  };
}
