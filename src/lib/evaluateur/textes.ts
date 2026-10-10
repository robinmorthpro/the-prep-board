// Textes de l'évaluateur, chargés tels quels (octet pour octet).
import commun from "./textes/commun.md?raw";
import formatSortie from "./textes/format-sortie.md?raw";
import classique from "./textes/ecoles/classique.md?raw";
import clermont from "./textes/ecoles/clermont.md?raw";
import edhec from "./textes/ecoles/edhec.md?raw";
import emStrasbourg from "./textes/ecoles/em-strasbourg.md?raw";
import emlyon from "./textes/ecoles/emlyon.md?raw";
import essec from "./textes/ecoles/essec.md?raw";
import gem from "./textes/ecoles/gem.md?raw";
import inseec from "./textes/ecoles/inseec.md?raw";
import kedge from "./textes/ecoles/kedge.md?raw";
import montpellier from "./textes/ecoles/montpellier.md?raw";
import tbs from "./textes/ecoles/tbs.md?raw";
import { schoolFileForGrille } from "./bareme";

const ECOLES: Record<string, string> = {
  "classique.md": classique,
  "clermont.md": clermont,
  "edhec.md": edhec,
  "em-strasbourg.md": emStrasbourg,
  "emlyon.md": emlyon,
  "essec.md": essec,
  "gem.md": gem,
  "inseec.md": inseec,
  "kedge.md": kedge,
  "montpellier.md": montpellier,
  "tbs.md": tbs,
};

/** Sections du texte commun consacrées à un critère absent de la grille (D20). */
const SECTIONS_ABSENTES: Record<string, string[]> = {
  tbs: ["### 5.5 Ouverture sur le monde"],
  clermont: ["### 5.5 Ouverture sur le monde"],
  montpellier: ["### 5.3 Projet professionnel", "### 5.4 École"],
};

/** Texte commun sans les sections des critères absents de la grille de l'école. */
export function communPour(grille: string): string {
  let texte = commun;
  for (const titre of SECTIONS_ABSENTES[grille] ?? []) {
    const debut = texte.indexOf(`\n${titre}`);
    if (debut < 0) throw new Error(`Section introuvable dans le texte commun : ${titre}`);
    const suite = texte.slice(debut + 1).search(/\n#{2,3} /);
    const fin = suite < 0 ? texte.length : debut + 1 + suite;
    texte = texte.slice(0, debut) + texte.slice(fin);
  }
  return texte;
}

/** Message système : commun + école + format de sortie, séparés par une ligne vide. */
export function systemPromptFor(grille: string): string | null {
  const ecole = ECOLES[schoolFileForGrille(grille)];
  if (ecole === undefined) return null;
  return [communPour(grille), ecole, formatSortie].join("\n\n");
}
