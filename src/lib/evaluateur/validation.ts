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

/** Pour manque_pour_n4 uniquement : retire `**` et les accents graves, `<br>` → espace, puis normaliser(). */
export function normaliserTextes(s: string): string {
  return normaliser(s.replace(/\*\*/g, "").replace(/`/g, "").replace(/<br\s*\/?>/gi, " "));
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

export type MorceauRetire = { case: string; morceau: string; champ?: "manque_pour_n4" | "citations" };

/** Séparateurs de coupure acceptés dans une citation. */
const COUPURE_RE = /\s*(?:\[\s*…\s*\]|\[\s*\.\.\.\s*\]|…|\.\.\.)\s*/;
const minuscules = (t: string) => t.toLocaleLowerCase("fr");

/**
 * Cherche une citation dans la transcription (déjà normalisée), sans tenir compte
 * des majuscules. Une citation coupée par « … », « ... », « […] » ou « [...] » est
 * vérifiée morceau par morceau, dans l'ordre. Renvoie le texte exact de la
 * transcription (morceaux joints par « […] »), ou null si introuvable.
 */
export function retrouverCitation(transcriptionNormalisee: string, citation: string): string | null {
  const morceaux = normaliser(citation).split(COUPURE_RE).map((m) => m.trim()).filter(Boolean);
  if (!morceaux.length) return null;
  const bas = minuscules(transcriptionNormalisee);
  const memeLongueur = bas.length === transcriptionNormalisee.length;
  let depuis = 0;
  const exacts: string[] = [];
  for (const m of morceaux) {
    const i = bas.indexOf(minuscules(m), depuis);
    if (i < 0) return null;
    exacts.push(memeLongueur ? transcriptionNormalisee.slice(i, i + m.length) : m);
    depuis = i + m.length;
  }
  return exacts.join(" […] ");
}

export function validerSortie(
  text: string,
  attendu: { grilleKey: string; grille: GrilleDef; transcription: string; textesEvaluateur: string; dernierEssai?: boolean },
):
  | { ok: true; sortie: SortieValidee }
  | { ok: false; erreurs: string[]; brut: unknown; bloquant: true }
  | { ok: false; erreurs: string[]; brut: unknown; bloquant: false; sortieNettoyee: SortieValidee; retires: MorceauRetire[] } {
  let data: unknown;
  try {
    data = parseJson(text);
  } catch {
    return { ok: false, erreurs: ["La réponse n'est pas un JSON valide."], brut: null, bloquant: true };
  }
  if (!isObj(data)) return { ok: false, erreurs: ["La réponse doit être un objet JSON."], brut: data, bloquant: true };
  const d = data as { grille?: unknown; entretien_interrompu?: unknown; criteres?: unknown };
  const erreurs: string[] = [];
  const manques: string[] = [];
  const retires: MorceauRetire[] = [];
  const citationsIntrouvables: MorceauRetire[] = [];
  /** Citations retrouvées : texte exact de la transcription, par case. */
  const citationsExactes: Record<string, string[]> = {};
  if (d.grille !== attendu.grilleKey) erreurs.push(`« grille » vaut ${JSON.stringify(d.grille)} au lieu de "${attendu.grilleKey}".`);
  if (typeof d.entretien_interrompu !== "boolean") erreurs.push("« entretien_interrompu » doit être true ou false.");

  const transcription = normaliser(attendu.transcription);
  const textes = normaliserTextes(attendu.textesEvaluateur);
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
          const exactes: string[] = [];
          for (const q of v.citations) {
            const exact = retrouverCitation(transcription, q);
            if (exact !== null) exactes.push(exact);
            else citationsIntrouvables.push({ case: id, morceau: q, champ: "citations" });
          }
          citationsExactes[id] = exactes;
        }
        if (!isStrArray(v.manque_pour_n4)) {
          erreurs.push(`« ${id} » : « manque_pour_n4 » doit être une liste de textes.`);
        } else {
          if ((v.niveau === "N4" || v.niveau === "non observé") && v.manque_pour_n4.length > 0) {
            erreurs.push(`« ${id} » : « manque_pour_n4 » doit être [] pour un ${v.niveau}.`);
          }
          for (const m of v.manque_pour_n4) {
            if (!textes.includes(normaliserTextes(m))) {
              retires.push({ case: id, morceau: m, champ: "manque_pour_n4" });
              manques.push(`« ${id} » : morceau de « manque_pour_n4 » introuvable mot pour mot dans les textes de l'évaluateur : « ${m} ».`);
            }
          }
        }
      }
    }
  }
  const erreursCitations = citationsIntrouvables.map(
    (c) => `« ${c.case} » : citation introuvable mot pour mot dans la transcription : « ${c.morceau} ».`,
  );
  // Citation introuvable : bloquante au premier essai, retirée (avertissement) au dernier.
  if (erreurs.length || (erreursCitations.length && !attendu.dernierEssai)) {
    return { ok: false, erreurs: [...erreurs, ...erreursCitations, ...manques], brut: data, bloquant: true };
  }
  // Sortie : citations remplacées par le texte exact de la transcription (introuvables retirées).
  const nettoye = JSON.parse(JSON.stringify(data)) as {
    criteres: Record<string, Record<string, { manque_pour_n4: string[]; citations: string[] }>>;
  };
  for (const [id, exactes] of Object.entries(citationsExactes)) {
    const [cr, ca] = id.split(".") as [string, string];
    nettoye.criteres[cr]![ca]!.citations = exactes;
  }
  if (manques.length || erreursCitations.length) {
    // Non bloquant : on retire seulement les morceaux introuvables (niveaux intacts).
    for (const r of retires) {
      const [cr, ca] = r.case.split(".") as [string, string];
      const cell = nettoye.criteres[cr]![ca]!;
      cell.manque_pour_n4 = cell.manque_pour_n4.filter((m) => m !== r.morceau);
    }
    retires.push(...citationsIntrouvables);
    return {
      ok: false,
      erreurs: [...erreursCitations, ...manques],
      brut: data,
      bloquant: false,
      retires,
      sortieNettoyee: { niveaux, entretien_interrompu: d.entretien_interrompu as boolean, brut: nettoye },
    };
  }
  return { ok: true, sortie: { niveaux, entretien_interrompu: d.entretien_interrompu as boolean, brut: nettoye } };
}
