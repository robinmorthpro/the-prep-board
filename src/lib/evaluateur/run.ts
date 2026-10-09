// Évaluation d'une session : appel IA, vérifications, calcul. Serveur uniquement.
import { BAREME, grilleKeyForSchool, type GrilleDef } from "./bareme";
import { calculerNote } from "./calcul";
import { mesurerPenalites, type TimingEnregistre } from "./durees";
import { callEvaluator, createRunIdFetch, DEFAULT_EVAL_MODEL, type Message } from "./gateway";
import { systemPromptFor } from "./textes";
import { repliques, transcriptionHorodatee, type TourEnregistre } from "./transcription";
import { validerSortie } from "./validation";

export type SessionPourEvaluation = {
  id: string;
  user_id: string;
  school: string;
  status: string;
  turns: unknown;
  phase_timings: unknown;
  support_text: string | null;
  inseec_image: string | null;
};

export type LigneEvaluation = {
  session_id: string;
  user_id: string;
  model: string;
  grille: string;
  status: "ok" | "invalide";
  attempts: number;
  errors: string[];
  raw_output: unknown;
  raw_text: string;
  case_points: unknown;
  criterion_points: unknown;
  unrated_criteria: string[];
  penalties: unknown;
  interrupted: boolean;
  score_20: number | null;
  final_score: number | null;
  percentile: number | null;
  duration_ms: number;
  triggered_by: string;
};

/** Schéma JSON strict de la sortie attendue pour une grille (Claude). */
export function schemaFor(grilleKey: string, grille: GrilleDef) {
  const caseSchema = {
    type: "object",
    additionalProperties: false,
    required: ["niveau", "justification", "manque_pour_n4", "citations"],
    properties: {
      niveau: { type: "string", enum: BAREME.niveaux },
      justification: { type: "string" },
      manque_pour_n4: { type: "array", items: { type: "string" } },
      citations: { type: "array", items: { type: "string" } },
    },
  };
  const criteres = Object.fromEntries(
    grille.criteres.map((c) => [
      c.cle,
      {
        type: "object",
        additionalProperties: false,
        required: c.cases.map((x) => x.cle),
        properties: Object.fromEntries(c.cases.map((x) => [x.cle, caseSchema])),
      },
    ]),
  );
  return {
    type: "object",
    additionalProperties: false,
    required: ["grille", "entretien_interrompu", "criteres", "penalites", "remarques"],
    properties: {
      grille: { type: "string", enum: [grilleKey] },
      entretien_interrompu: { type: "boolean" },
      criteres: { type: "object", additionalProperties: false, required: Object.keys(criteres), properties: criteres },
      penalites: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["partie", "duree_mesuree", "seuil"],
          properties: { partie: { type: "string" }, duree_mesuree: { type: "string" }, seuil: { type: "string" } },
        },
      },
      remarques: { type: "string" },
    },
  };
}

export function userMessageFor(session: SessionPourEvaluation): string {
  const parts = [`École : ${session.school}`, "", "Transcription :", transcriptionHorodatee((session.turns ?? []) as TourEnregistre[])];
  if ((session.support_text ?? "").trim()) parts.push("", "Document remis par le candidat :", session.support_text!.trim());
  if ((session.inseec_image ?? "").trim()) parts.push("", "Image INSEEC choisie par le candidat :", session.inseec_image!.trim());
  return parts.join("\n");
}

export async function evaluerSession(
  session: SessionPourEvaluation,
  opts: { model?: string | undefined; triggeredBy: string },
): Promise<LigneEvaluation> {
  const started = Date.now();
  const model = opts.model?.trim() || DEFAULT_EVAL_MODEL;
  const base = {
    session_id: session.id,
    user_id: session.user_id,
    model,
    triggered_by: opts.triggeredBy,
    case_points: {},
    criterion_points: {},
    unrated_criteria: [] as string[],
    penalties: [] as unknown,
    score_20: null,
    final_score: null,
    percentile: null,
  };
  const grilleKey = grilleKeyForSchool(session.school);
  const system = grilleKey ? systemPromptFor(grilleKey) : null;
  if (!grilleKey || !system) {
    return { ...base, grille: grilleKey ?? "", status: "invalide", attempts: 0, errors: [`École sans grille : « ${session.school} ».`], raw_output: null, raw_text: "", interrupted: session.status !== "done", duration_ms: Date.now() - started };
  }
  const grille = BAREME.grilles[grilleKey]!;
  const turns = (session.turns ?? []) as TourEnregistre[];
  const transcription = repliques(turns).map((r) => r.texte).join("\n");
  const schema = schemaFor(grilleKey, grille);
  const f = createRunIdFetch();
  const messages: Message[] = [{ role: "user", content: userMessageFor(session) }];

  let attempts = 0;
  let rawText = "";
  let erreurs: string[] = [];
  let brut: unknown = null;
  for (let i = 0; i < 2; i++) {
    attempts++;
    try {
      rawText = await callEvaluator(f, model, system, messages, schema);
    } catch (e) {
      erreurs = [e instanceof Error ? e.message : String(e)];
      break; // erreur de passerelle : pas de nouvel appel immédiat
    }
    const v = validerSortie(rawText, { grilleKey, grille, transcription, textesEvaluateur: system });
    if (v.ok) {
      const { penalites, controles } = mesurerPenalites(grilleKey, (session.phase_timings ?? []) as TimingEnregistre[]);
      const interrompu = v.sortie.entretien_interrompu || session.status !== "done";
      const r = calculerNote(grille, v.sortie.niveaux, { interrompu, penalites });
      return {
        ...base,
        grille: grilleKey,
        status: "ok",
        attempts,
        errors: i > 0 ? erreurs : [],
        raw_output: v.sortie.brut,
        raw_text: rawText,
        case_points: r.points_par_case,
        criterion_points: r.points_par_critere,
        unrated_criteria: r.criteres_non_notes,
        penalties: { appliquees: penalites, controles },
        interrupted: r.interrompu,
        score_20: r.note_sur_20,
        final_score: r.note_finale,
        percentile: r.percentile,
        duration_ms: Date.now() - started,
      };
    }
    erreurs = v.erreurs;
    brut = v.brut;
    if (i === 0) {
      messages.push(
        { role: "assistant", content: rawText },
        { role: "user", content: `Ta sortie contient des erreurs. Corrige-les et rends de nouveau l'objet JSON complet :\n- ${erreurs.join("\n- ")}` },
      );
    }
  }
  return { ...base, grille: grilleKey, status: "invalide", attempts, errors: erreurs, raw_output: brut, raw_text: rawText, interrupted: session.status !== "done", duration_ms: Date.now() - started };
}
