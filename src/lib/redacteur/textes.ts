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

/** Sections communes de criteres.md : en-tête puis « ## Nom » → texte de la section. */
function sectionsCommunes(): { entete: string; sections: Map<string, string> } {
  const morceaux = criteres.split(/\n(?=## )/);
  const entete = morceaux[0]!;
  const sections = new Map<string, string>();
  for (const m of morceaux.slice(1)) sections.set(m.split("\n")[0]!.replace(/^##\s+/, "").trim(), m);
  return { entete, sections };
}

/** Ordre du « Feedback détaillé » donné par le bloc de l'école. */
export function ordreDuBloc(bloc: string): string[] {
  const i = bloc.indexOf("## Ordre des sections");
  if (i < 0) return [];
  const suite = bloc.slice(i).split("\n").slice(1);
  const out: string[] = [];
  for (const l of suite) {
    if (/^## /.test(l)) break;
    const m = l.match(/^\s*\d+\.\s+(.+?)\s*$/);
    if (m) out.push(m[1]!);
  }
  return out;
}

/** Ligne « Ouverture sur le monde : … » du bloc GEM, qui remplace la section commune. */
function ligneOuvertureGem(bloc: string): string | null {
  const l = bloc.split("\n").find((x) => /^-\s*Ouverture sur le monde : /.test(x));
  return l ? l.replace(/^-\s*/, "") : null;
}

/**
 * D19 — critères communs envoyés dans l'ordre du bloc de l'école : une section
 * propre à l'école remplace la commune, un critère absent de l'ordre n'est pas envoyé.
 */
export function criteresPourEcole(school: string): string {
  const file = blocFileForSchool(school);
  const bloc = file ? BLOCS[file]! : "";
  const ordre = ordreDuBloc(bloc);
  if (!ordre.length) return criteres;
  const { entete, sections } = sectionsCommunes();
  const titresBloc = bloc.split("\n").filter((l) => /^## /.test(l)).map((l) => l.replace(/^##\s+/, "").trim());
  const parts: string[] = [entete];
  for (const nom of ordre) {
    const commune = sections.get(nom);
    if (!commune) continue; // critère propre à l'école : décrit dans son bloc
    if (titresBloc.some((t) => t.startsWith(`${nom} (`))) continue; // section propre qui remplace la commune
    if (school === "GEM (Grenoble EM)" && nom === "Ouverture sur le monde") {
      const ligne = ligneOuvertureGem(bloc);
      if (ligne) {
        parts.push(`## Ouverture sur le monde\n\n${ligne}\n`);
        continue;
      }
    }
    parts.push(commune);
  }
  return parts.map((p) => p.replace(/\n+$/, "\n")).join("\n");
}

export function systemPromptRedacteur(opts: {
  school: string;
  supportLabel?: string | null;
  hasSupport: boolean;
  inseecImage?: string | null;
}): string {
  const file = blocFileForSchool(opts.school);
  const parts = [commun, criteresPourEcole(opts.school)];
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
