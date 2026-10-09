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
export function citationTrouvee(citation: string, sources: string): boolean {
  const morceaux = citation
    .split(/\[(?:…|\.\.\.)\]/)
    .map((m) => normaliser(m).replace(/^[\s.,;:!?…]+|[\s.,;:!?…]+$/g, ""))
    .filter(Boolean);
  if (!morceaux.length) return true;
  return morceaux.every((m) => sources.includes(m));
}

/**
 * Dans chaque ligne VERBATIMS, retire les éléments (séparés par « // ») dont
 * une citation « … » est introuvable dans la transcription ou le document remis.
 */
export function filtrerVerbatims(text: string, transcription: string, document = ""): { text: string; retirees: string[] } {
  const sources = normaliser(`${transcription}\n${document}`);
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
      const ok = quotes.every((q) => citationTrouvee(q, sources));
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
