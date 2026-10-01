import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Profil du candidat",
  description:
    "Récupère le profil de préparation du candidat connecté (identité, parcours, écoles visées) ainsi que son projet professionnel.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const [profile, career] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", ctx.getUserId()!).maybeSingle(),
      supabase.from("career_projects").select("*").eq("user_id", ctx.getUserId()!).maybeSingle(),
    ]);
    const error = profile.error ?? career.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { profile: profile.data, careerProject: career.data };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
