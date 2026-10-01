import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_interview_sessions",
  title: "Lister les entretiens simulés",
  description:
    "Liste les entretiens simulés du candidat connecté (école, format, difficulté, statut) avec le débrief et, en option, les échanges.",
  inputSchema: {
    includeTurns: z.boolean().optional().describe("Inclure les échanges mot pour mot (défaut false)."),
    limit: z.number().int().min(1).max(20).optional().describe("Nombre maximum de sessions (défaut 5)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ includeTurns, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    const columns = includeTurns
      ? "id, school, format, difficulty, status, debrief, turns, created_at"
      : "id, school, format, difficulty, status, debrief, created_at";
    const { data, error } = await supabaseForUser(ctx)
      .from("interview_sessions")
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(limit ?? 5);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
