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

/** Message système : commun + école + format de sortie, séparés par une ligne vide. */
export function systemPromptFor(grille: string): string | null {
  const ecole = ECOLES[schoolFileForGrille(grille)];
  if (ecole === undefined) return null;
  return [commun, ecole, formatSortie].join("\n\n");
}
