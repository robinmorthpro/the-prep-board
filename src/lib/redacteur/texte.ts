// Traitement par le code du texte rendu par le rédacteur (fonctions pures).
import { normaliser } from "../evaluateur/validation";

export const SECTIONS = [
  "## Ce que ce classement signifie",
  "## Feedback général",
  "## Feedback détaillé",
  "## À retravailler en priorité",
] as const;

export const LIGNE_INTERROMPU = "Entretien interrompu : pas de note ni de percentile. Voici un retour sur ce que vous avez fait.";

export type ReviewItem = { feedback: string; verbatims: string[] };
export type ReviewPart = {
  title: string;
  /** Citations globales de l'ancien format. */
  verbatims: string[];
  /** Texte Markdown de l'ancien format, ou texte libre du nouveau format. */
  feedback: string;
  /** Remarques et citations associées du nouveau format. */
  items: ReviewItem[];
  format: "legacy" | "attached";
};

export function lignePercentile(p: number): string {
  return `P${p} - vous faites mieux que ${p} % des candidats (± 5 percentiles).`;
}

/** Problèmes de structure qui justifient un nouvel appel. */
export function controlerTexte(text: string): string[] {
  const erreurs: string[] = [];
  for (const s of SECTIONS) {
    if (!text.split("\n").some((l) => l.trim() === s)) erreurs.push(`Section manquante : « ${s} ».`);
  }
  if (/\bP\d+\b/.test(text)) erreurs.push("Le texte contient « P » suivi d'un nombre : la ligne du percentile est écrite par le code, ne l'écris pas.");
  return erreurs;
}

/**
 * D13 — mots internes interdits dans le feedback (hors lignes VERBATIMS, qui
 * citent la transcription). Renvoie les mots trouvés.
 */
const MOTS_INTERNES: { mot: string; re: RegExp }[] = [
  { mot: "zone rouge", re: /\bzone rouge\b/i },
  { mot: "zone grise", re: /\bzone grise\b/i },
  { mot: "zone verte", re: /\bzone verte\b/i },
  { mot: "zone bleue", re: /\bzone bleue\b/i },
  { mot: "code de critère", re: /\bC(?:[1-9]|1[01])\b/ },
  { mot: "N1 à N4", re: /\bN[1-4]\b/ },
  { mot: "ce qui vous coûte des points", re: /ce qui vous co[uû]te des points/i },
  { mot: "points (note)", re: /\b\d+(?:[,.]\d+)?\s*points?\b|\b(?:perd(?:re|u|ez)?|gagn(?:er|é|ez)|co[uû]te(?:nt)?|retir(?:er|é)s?)\s+(?:des\s+|de\s+|\d+\s+)?points?\b|\bpoints? perdus?\b/i },
  { mot: "grille", re: /\bgrilles?\b/i },
  { mot: "case", re: /\bcases?\b/i },
  { mot: "score", re: /\bscores?\b/i },
  { mot: "seuil", re: /\bseuils?\b/i },
  { mot: "percentile", re: /\bpercentiles?\b/i },
];

export function motsInternes(text: string): string[] {
  const corps = text
    .split("\n")
    .filter((l) => !/^\s*(?:[-*]\s+)?\**VERBATIMS?\**\s*:/i.test(l))
    .join("\n");
  return MOTS_INTERNES.filter((m) => m.re.test(corps)).map((m) => m.mot);
}

/** D15 — tranche du percentile et expression attendue dans « Ce que ce classement signifie ». */
export function trancheAttendue(percentile: number): string {
  if (percentile <= 24) return "en danger";
  if (percentile <= 60) return "dans la moyenne";
  if (percentile <= 87) return "au-dessus de la moyenne";
  return "très haut";
}

/** Texte de la section « Ce que ce classement signifie ». */
function sectionClassement(text: string): string {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim() === SECTIONS[0]);
  if (i < 0) return "";
  const fin = lines.findIndex((l, j) => j > i && /^##\s/.test(l.trim()));
  return lines.slice(i + 1, fin < 0 ? undefined : fin).join("\n");
}

/** Erreur si la phrase du classement ne correspond pas à la tranche du percentile. */
export function controlerClassement(text: string, percentile: number | null, interrompu: boolean): string[] {
  if (interrompu || percentile === null) return [];
  const attendue = trancheAttendue(percentile);
  const section = sectionClassement(text).toLowerCase().replace(/[\u2010-\u2014]/g, "-");
  const ok = attendue === "dans la moyenne" ? /dans la moyenne/.test(section) && !/au-dessus de la moyenne/.test(section) : section.includes(attendue);
  return ok ? [] : [`La section « Ce que ce classement signifie » doit dire « ${attendue} » (tranche du percentile reçu).`];
}

/** Insère la ligne du percentile (ou d'entretien interrompu) juste sous le titre de la première section. */
export function insererPercentile(text: string, percentile: number | null, interrompu: boolean): string {
  const ligne = interrompu || percentile === null ? LIGNE_INTERROMPU : lignePercentile(percentile);
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.trim() === SECTIONS[0]);
  if (i < 0) return `${SECTIONS[0]}\n${ligne}\n${text}`;
  lines.splice(i + 1, 0, ligne);
  return lines.join("\n");
}

/** Une citation (éventuellement coupée par […]) existe-t-elle mot pour mot dans les sources ? */
/**
 * Forme comparable d'une citation et de sa source : sans différence de casse,
 * de points de suspension (« … » ou « ... ») ni d'espaces autour des guillemets
 * (« mot » ou "mot"). Les mots eux-mêmes doivent rester identiques.
 */
export function formeCitation(s: string): string {
  return normaliser(s)
    .toLowerCase()
    .replace(/…/g, "...")
    .replace(/"\s+/g, '"')
    .replace(/\s+"/g, '"');
}

export function citationTrouvee(citation: string, sources: string): boolean {
  const source = formeCitation(sources);
  const morceaux = citation
    .split(/\[(?:…|\.\.\.)\]/)
    .map((m) => formeCitation(m).replace(/^[\s.,;:!?]+|[\s.,;:!?]+$/g, "").replace(/^\.+|\.+$/g, ""))
    .filter(Boolean);
  if (!morceaux.length) return true;
  return morceaux.every((m) => source.includes(m));
}

/**
 * Dans chaque ligne VERBATIMS, retire les éléments (séparés par « // ») dont
 * une citation « … » est introuvable dans la transcription ou le document remis.
 */
export function filtrerVerbatims(
  text: string,
  transcription: string,
  document = "",
  /** D14 : paroles du candidat et du jury, séparées. */
  parRole?: { candidat: string; jury: string },
): { text: string; retirees: string[] } {
  const sources = normaliser(`${transcription}\n${document}`);
  const candidat = parRole ? normaliser(`${parRole.candidat}\n${document}`) : sources;
  const jury = parRole ? normaliser(parRole.jury) : sources;
  const retirees: string[] = [];
  const out = text.split("\n").flatMap((line) => {
    const m = line.match(/^(\s*(?:[-*]\s+)?\**VERBATIMS?\**\s*:\s*\**\s*)(.*)$/i);
    if (!m) return line;
    const prefix = m[1];
    const content = m[2];
    if (prefix === undefined || content === undefined) return line;
    const items = content.split(/\s*\/\/\s*/).filter((x) => x.trim());
    const gardes = items.filter((item) => {
      const quotes = [...item.matchAll(/«\s*([^»]*?)\s*»/g)].flatMap((q) => (q[1] === undefined ? [] : [q[1]]));
      // « Vous : » doit venir d'une réponse du candidat, « Jury : » d'une question du jury.
      const role = /\bVous\s*:\s*«/.test(item) ? candidat : /\bJury\s*:\s*«/.test(item) ? jury : sources;
      const ok = quotes.every((q) => citationTrouvee(q, role));
      if (!ok) retirees.push(item.trim());
      return ok;
    });
    return gardes.length ? `${prefix}${gardes.join(" // ")}` : [];
  });
  return { text: out.join("\n"), retirees };
}

function citations(value: string): string[] {
  return value
    .split("//")
    .map((citation) => citation.trim())
    .filter(Boolean);
}

/** Analyse les critères des anciens feedbacks et ceux où chaque citation suit sa remarque. */
export function parseReview(block: string): ReviewPart[] {
  const parts: ReviewPart[] = [];
  for (const chunk of block.split(/\n(?=###\s)/)) {
    const lines = chunk.split("\n");
    const first = lines[0] ?? "";
    if (!/^###\s/.test(first)) continue;
    const title = first.replace(/^###\s*/, "").trim().replace(/^\d+\s*[.)\u2022-]\s*/, "").trim();
    const legacy = lines.some((line) => /^\s*\**FEEDBACK\**\s*:/i.test(line));

    if (legacy) {
      const verbatims: string[] = [];
      let feedback = "";
      let field: "verbatims" | "feedback" | null = null;
      for (const raw of lines.slice(1)) {
        const line = raw.replace(/^[-*]\s*/, "").trim();
        const marker = line.match(/^\**(VERBATIMS?|FEEDBACK)\**\s*:\s*(.*)$/i);
        if (marker) {
          const name = marker[1] ?? "";
          const value = (marker[2] ?? "").trim();
          field = /^VERBATIM/i.test(name) ? "verbatims" : "feedback";
          if (field === "verbatims") verbatims.push(...citations(value));
          else feedback = value;
          continue;
        }
        if (!raw.trim()) continue;
        if (field === "verbatims") verbatims.push(...citations(line));
        else feedback = feedback ? `${feedback}\n${raw.trim()}` : raw.trim();
      }
      parts.push({ title, verbatims, feedback, items: [], format: "legacy" });
      continue;
    }

    const items: ReviewItem[] = [];
    const freeText: string[] = [];
    let current: ReviewItem | undefined;
    for (const raw of lines.slice(1)) {
      const marker = raw.match(/^\s*(?:[-*]\s+)?\**VERBATIMS?\**\s*:\s*\**\s*(.*)$/i);
      if (marker) {
        if (current) current.verbatims.push(...citations(marker[1] ?? ""));
        continue;
      }
      const bullet = raw.match(/^\s*[-*]\s+(.+)$/);
      if (bullet?.[1] !== undefined) {
        current = { feedback: bullet[1].trim(), verbatims: [] };
        items.push(current);
        continue;
      }
      if (!raw.trim()) continue;
      if (current) current.feedback = `${current.feedback}\n${raw.trim()}`;
      else freeText.push(raw.trim());
    }
    parts.push({ title, verbatims: [], feedback: freeText.join("\n"), items, format: "attached" });
  }
  return parts;
}
