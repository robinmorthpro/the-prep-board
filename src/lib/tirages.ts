// Ce que l'application a tiré pendant un entretien (colonne interview_sessions.tirages).
import type { EmlyonCarteTiree } from "./emlyon-kb";

export type Tirages = {
  emlyon_cartes?: EmlyonCarteTiree[];
  kedge_cartes?: { nom: string; texte: string }[];
  edhec_mot?: string;
  montpellier_situations?: string[];
  essec_situation?: { enonce: string; competence: string };
  clermont_impact?: { axe: string; question: string };
  tbs_article?: string;
  gem_personnage?: string;
  /** Question de clôture tirée au sort (D4). */
  question_cloture?: { variante: "A" | "B" | "C"; texte: string };
};

export function lireTirages(raw: unknown): Tirages {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Tirages) : {};
}

/** Lignes des cartes emlyon avec leur critère (partagées par l'évaluateur et le rédacteur). */
export function lignesCartesEmlyon(t: Tirages): string[] {
  return (t.emlyon_cartes ?? []).map((c) => `- Carte ${c.pile} : « ${c.question} » (critère : ${c.critere})`);
}

/** Bloc « CE QUE L'APPLICATION A TIRÉ » pour le rédacteur ; vide si rien n'a été tiré. */
export function blocTirages(raw: unknown): string {
  const t = lireTirages(raw);
  const l: string[] = [];
  l.push(...lignesCartesEmlyon(t));
  for (const c of t.kedge_cartes ?? []) l.push(`- Carte ${c.nom} : « ${c.texte} »`);
  if (t.edhec_mot) l.push(`- Mot imposé : « ${t.edhec_mot} »`);
  for (const s of t.montpellier_situations ?? []) l.push(`- Situation choisie : « ${s} »`);
  if (t.essec_situation) l.push(`- Mise en situation : « ${t.essec_situation.enonce} » — compétence visée : ${t.essec_situation.competence}`);
  if (t.clermont_impact) l.push(`- Question Impact (axe ${t.clermont_impact.axe}) : « ${t.clermont_impact.question} »`);
  if (t.tbs_article) l.push(`- Article : « ${t.tbs_article} »`);
  if (t.gem_personnage) l.push(`- Personnage de l'interview inversée : ${t.gem_personnage.replace(/\n/g, " ")}`);
  const cloture = blocClotureTiree(t);
  if (cloture) l.push(`- ${cloture}`);
  return l.length ? ["CE QUE L'APPLICATION A TIRÉ", ...l].join("\n") : "";
}

/** « Question de clôture tirée : A « … » » ; vide si rien n'a été tiré. */
export function blocClotureTiree(raw: unknown): string {
  const q = lireTirages(raw).question_cloture;
  return q ? `Question de clôture tirée : ${q.variante} « ${q.texte} »` : "";
}

/** Bloc des cartes emlyon et de la question de clôture pour l'évaluateur. */
export function blocCartesEvaluateur(raw: unknown): string {
  const l = lignesCartesEmlyon(lireTirages(raw));
  const cartes = l.length ? ["Cartes tirées (critère où chaque carte se note) :", ...l].join("\n") : "";
  return [cartes, blocClotureTiree(raw)].filter(Boolean).join("\n\n");
}
