import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SESSION_COLUMNS = "id, user_id, school, status, turns, phase_timings, support_text, inseec_image, tirages";

/**
 * Évaluation en coulisses d'un entretien de l'utilisateur connecté : rien n'est
 * affiché, le résultat est seulement enregistré dans interview_evaluations.
 */
export const evaluateInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ sessionId: z.string().uuid(), model: z.string().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { evaluerSession } = await import("./evaluateur/run");
    const { data: session, error } = await context.supabase
      .from("interview_sessions")
      .select(SESSION_COLUMNS)
      .eq("id", data.sessionId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || !session) return { ok: false as const };
    const row = await evaluerSession(session, { model: data.model, triggeredBy: "auto" });
    const { data: saved, error: insertError } = await context.supabase
      .from("interview_evaluations")
      .insert(row as never)
      .select("id, status")
      .single();
    if (insertError) {
      console.error("Évaluateur : enregistrement impossible", insertError.message);
      return { ok: false as const };
    }
    return { ok: true as const, id: saved.id, status: saved.status };
  });

/** Outil de test réservé aux administrateurs : relance N fois l'évaluation d'une session. */
export const rerunEvaluation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ sessionId: z.string().uuid(), model: z.string().optional(), n: z.number().int().min(1).max(10).default(1) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Accès réservé aux administrateurs.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { evaluerSession } = await import("./evaluateur/run");
    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select(SESSION_COLUMNS)
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error || !session) throw new Error("Session introuvable.");
    const results = [];
    for (let i = 0; i < data.n; i++) {
      const row = await evaluerSession(session, { model: data.model, triggeredBy: "admin" });
      const { data: saved } = await supabaseAdmin
        .from("interview_evaluations")
        .insert(row as never)
        .select("id")
        .single();
      results.push({
        id: saved?.id ?? null,
        status: row.status,
        attempts: row.attempts,
        errors: row.errors,
        final_score: row.final_score,
        score_20: row.score_20,
        percentile: row.percentile,
        criterion_points: row.criterion_points as Record<string, number | null>,
        duration_ms: row.duration_ms,
      });
      if (row.status === "invalide" && row.attempts === 1 && row.errors.some((e) => /Erreur IA \((402|403|401|404)\)/.test(e))) break;
    }
    return { model: data.model?.trim() || "google/gemini-3.7-flash", results };
  });
