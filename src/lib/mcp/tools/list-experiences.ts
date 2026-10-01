import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_experiences",
  title: "Lister les expériences",
  description:
    "Liste les expériences travaillées par le candidat connecté (catégorie, récit, anecdotes, statut, feedback IA).",
  inputSchema: {
    category: z.string().trim().min(1).optional().describe("Filtre optionnel sur la catégorie."),
    limit: z.number().int().min(1).max(50).optional().describe("Nombre maximum de résultats (défaut 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    let query = supabaseForUser(ctx)
      .from("experiences")
      .select("id, name, category, status, story_title, story, anecdotes, ai_feedback, updated_at")
      .order("updated_at", { ascending: false })
      .limit(limit ?? 20);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
