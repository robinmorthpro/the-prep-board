import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextBlock, contextSchema } from "@/lib/ai.functions";

/** Rédige le feedback d'une session de l'utilisateur à partir d'une de ses évaluations « ok ». */
export const redigerFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        evaluationId: z.string().uuid(),
        context: contextSchema,
        model: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { redigerFeedbackSession } = await import("./redacteur/run");
    const [{ data: session }, { data: ev }] = await Promise.all([
      context.supabase
        .from("interview_sessions")
        .select("id, school, difficulty, turns, support_label, support_text, inseec_image, tirages")
        .eq("id", data.sessionId)
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("interview_evaluations")
        .select("id, grille, status, raw_output, case_points, unrated_criteria, penalties, interrupted, percentile")
        .eq("id", data.evaluationId)
        .eq("session_id", data.sessionId)
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    if (!session || !ev) throw new Error("Session ou évaluation introuvable.");
    const r = await redigerFeedbackSession(session, ev as never, contextBlock(data.context), { model: data.model });
    // R13 : l'alerte des mots internes est enregistrée avec l'évaluation liée au feedback
    // (champ JSON existant). Propriété de la session et de l'évaluation vérifiée ci-dessus.
    if (r.alertes.length) {
      const { avertissementsAvecAlertes } = await import("./redacteur/run");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: courant } = await supabaseAdmin.from("interview_evaluations").select("warnings").eq("id", ev.id).maybeSingle();
      const { error } = await supabaseAdmin
        .from("interview_evaluations")
        .update({ warnings: avertissementsAvecAlertes((courant?.warnings ?? []) as unknown[], r.alertes) as never })
        .eq("id", ev.id);
      if (error) console.error("Rédacteur : alerte non enregistrée", error.message);
    }
    return { debrief: r.debrief, percentile: r.percentile, attempts: r.attempts, duration_ms: r.duration_ms, alertes: r.alertes };
  });
