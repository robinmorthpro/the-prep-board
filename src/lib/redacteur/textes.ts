// Textes du rédacteur, chargés tels quels (octet pour octet).
import commun from "./textes/redacteur-commun.md?raw";
import criteres from "./textes/criteres.md?raw";
import clermont from "./textes/ecoles/clermont.md?raw";
import ecolesADocument from "./textes/ecoles/ecoles-a-document.md?raw";
import edhec from "./textes/ecoles/edhec.md?raw";
import emStrasbourg from "./textes/ecoles/em-strasbourg.md?raw";
import emlyon from "./textes/ecoles/emlyon.md?raw";
import essec from "./textes/ecoles/essec.md?raw";
import gem from "./textes/ecoles/gem.md?raw";
import inseec from "./textes/ecoles/inseec.md?raw";
import kedge from "./textes/ecoles/kedge.md?raw";
import montpellier from "./textes/ecoles/montpellier.md?raw";
import tbs from "./textes/ecoles/tbs.md?raw";

const BLOCS: Record<string, string> = {
  "clermont.md": clermont,
  "ecoles-a-document.md": ecolesADocument,
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

/** École (nom enregistré, comme dans le barème) → fichier de bloc. Les autres écoles n'ont pas de bloc. */
const BLOC_PAR_ECOLE: Record<string, string> = {
  ESSEC: "essec.md",
  emlyon: "emlyon.md",
  EDHEC: "edhec.md",
  "GEM (Grenoble EM)": "gem.md",
  "TBS Education": "tbs.md",
  "ESC Clermont BS": "clermont.md",
  KEDGE: "kedge.md",
  "INSEEC Grande École": "inseec.md",
  "Montpellier BS": "montpellier.md",
  "EM Strasbourg": "em-strasbourg.md",
  ESCP: "ecoles-a-document.md",
  NEOMA: "ecoles-a-document.md",
  SKEMA: "ecoles-a-document.md",
  "EM Normandie": "ecoles-a-document.md",
  "BSB (Burgundy School of Business)": "ecoles-a-document.md",
};

export function blocFileForSchool(school: string): string | null {
  return BLOC_PAR_ECOLE[school] ?? null;
}

export function systemPromptRedacteur(opts: {
  school: string;
  supportLabel?: string | null;
  hasSupport: boolean;
  inseecImage?: string | null;
}): string {
  const file = blocFileForSchool(opts.school);
  const parts = [commun, criteres];
  if (file) parts.push(BLOCS[file]!);
  if (opts.hasSupport) {
    parts.push(
      `DOCUMENT REMIS (${opts.supportLabel ?? ""}) : son contenu t'est transmis dans le bloc « CONTENU DU SUPPORT ». Tu relèves ce qui y figurait et que le candidat n'a pas dit à l'oral ; tu peux le citer, en disant que la citation vient du document.`,
    );
  }
  if ((opts.inseecImage ?? "").trim()) {
    parts.push(
      `IMAGE CHOISIE PAR LE CANDIDAT POUR SE PRÉSENTER : ${opts.inseecImage!.trim()}. Ce n'est jamais un support préparé en amont : traite-la uniquement comme le déclencheur officiel de la présentation par l'image INSEEC, et cite-la ainsi dans le débrief si nécessaire.`,
    );
  }
  return parts.join("\n\n");
}
