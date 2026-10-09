// Traitement par le code du texte rendu par le rédacteur (fonctions pures).
import { normaliser } from "../evaluateur/validation";

export const SECTIONS = [
  "## Ce que ce classement signifie",
  "## Feedback général",
  "## Feedback détaillé",
  "## À retravailler en priorité",
] as const;

export const LIGNE_INTERROMPU = "Entretien interrompu : pas de note ni de percentile. Voici un retour sur ce que vous avez fait.";

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
  const out = text.split("\n").map((line) => {
    const m = line.match(/^(\**VERBATIMS?\**\s*:\s*)(.*)$/i);
    if (!m) return line;
    const items = m[2]!.split(/\s*\/\/\s*/).filter((x) => x.trim());
    const gardes = items.filter((item) => {
      const quotes = [...item.matchAll(/«\s*([^»]*?)\s*»/g)].map((q) => q[1]!);
      const ok = quotes.every((q) => citationTrouvee(q, sources));
      if (!ok) retirees.push(item.trim());
      return ok;
    });
    return `${m[1]}${gardes.join(" // ")}`;
  });
  return { text: out.join("\n"), retirees };
}
