import type { GrilleDef, NiveauOuNonObserve } from "./bareme";
import type { NiveauxParCase } from "./calcul";

const NIVEAUX = ["N4", "N3", "N2", "N1", "non observé"];

/** Normalisation : espaces, apostrophes ’/' et guillemets. Rien d'autre. */
export function normaliser(s: string): string {
  return s
    .replace(/[\u2019\u2018\u02BC]/g, "'")
    .replace(/[«»\u201C\u201D\u201E]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export type SortieValidee = {
  niveaux: NiveauxParCase;
  entretien_interrompu: boolean;
  brut: Record<string, unknown>;
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isStrArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

/** Extrait l'objet JSON d'une réponse (tolère un bloc ```json autour). */
export function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(t);
}

export function validerSortie(
  text: string,
  attendu: { grilleKey: string; grille: GrilleDef; transcription: string; textesEvaluateur: string },
): { ok: true; sortie: SortieValidee } | { ok: false; erreurs: string[]; brut: unknown } {
  let data: unknown;
  try {
    data = parseJson(text);
  } catch {
    return { ok: false, erreurs: ["La réponse n'est pas un JSON valide."], brut: null };
  }
  if (!isObj(data)) return { ok: false, erreurs: ["La réponse doit être un objet JSON."], brut: data };
  const d = data as { grille?: unknown; entretien_interrompu?: unknown; criteres?: unknown };
  const erreurs: string[] = [];
  if (d.grille !== attendu.grilleKey) erreurs.push(`« grille » vaut ${JSON.stringify(d.grille)} au lieu de "${attendu.grilleKey}".`);
  if (typeof d.entretien_interrompu !== "boolean") erreurs.push("« entretien_interrompu » doit être true ou false.");

  const transcription = normaliser(attendu.transcription);
  const textes = normaliser(attendu.textesEvaluateur);
  const niveaux: NiveauxParCase = {};
  const criteres = d.criteres;
  if (!isObj(criteres)) {
    erreurs.push("« criteres » est absent ou n'est pas un objet.");
  } else {
    const attendus = new Set(attendu.grille.criteres.map((c) => c.cle));
    for (const k of Object.keys(criteres)) if (!attendus.has(k)) erreurs.push(`Critère en trop : « ${k} ».`);
    for (const critere of attendu.grille.criteres) {
      const co = criteres[critere.cle];
      if (!isObj(co)) {
        erreurs.push(`Critère manquant : « ${critere.cle} ».`);
        continue;
      }
      const casesAttendues = new Set(critere.cases.map((c) => c.cle));
      for (const k of Object.keys(co)) if (!casesAttendues.has(k)) erreurs.push(`Case en trop : « ${critere.cle}.${k} ».`);
      niveaux[critere.cle] = {};
      for (const c of critere.cases) {
        const id = `${critere.cle}.${c.cle}`;
        const v0 = co[c.cle];
        if (!isObj(v0)) {
          erreurs.push(`Case manquante : « ${id} ».`);
          continue;
        }
        const v = v0 as { niveau?: unknown; justification?: unknown; citations?: unknown; manque_pour_n4?: unknown };
        if (typeof v.niveau !== "string" || !NIVEAUX.includes(v.niveau)) {
          erreurs.push(`« ${id} » : niveau ${JSON.stringify(v.niveau)} invalide (N4, N3, N2, N1 ou « non observé »).`);
        } else {
          niveaux[critere.cle]![c.cle] = v.niveau as NiveauOuNonObserve;
        }
        if (typeof v.justification !== "string") erreurs.push(`« ${id} » : « justification » doit être un texte.`);
        if (!isStrArray(v.citations)) {
          erreurs.push(`« ${id} » : « citations » doit être une liste de textes.`);
        } else {
          for (const q of v.citations) {
            if (!transcription.includes(normaliser(q))) erreurs.push(`« ${id} » : citation introuvable mot pour mot dans la transcription : « ${q} ».`);
          }
        }
        if (!isStrArray(v.manque_pour_n4)) {
          erreurs.push(`« ${id} » : « manque_pour_n4 » doit être une liste de textes.`);
        } else {
          if ((v.niveau === "N4" || v.niveau === "non observé") && v.manque_pour_n4.length > 0) {
            erreurs.push(`« ${id} » : « manque_pour_n4 » doit être [] pour un ${v.niveau}.`);
          }
          for (const m of v.manque_pour_n4) {
            if (!textes.includes(normaliser(m))) erreurs.push(`« ${id} » : morceau de « manque_pour_n4 » introuvable mot pour mot dans les textes de l'évaluateur : « ${m} ».`);
          }
        }
      }
    }
  }
  if (erreurs.length) return { ok: false, erreurs, brut: data };
  return { ok: true, sortie: { niveaux, entretien_interrompu: d.entretien_interrompu as boolean, brut: data } };
}
