import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listExperiencesTool from "./tools/list-experiences";
import listInterviewSessionsTool from "./tools/list-interview-sessions";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "vivaldi-oral-coach",
  title: "The Prepboard Oral Coach",
  version: "0.1.0",
  instructions:
    "Outils The Prepboard : accès en lecture à la préparation aux oraux du candidat connecté (profil et projet professionnel, expériences et anecdotes, entretiens simulés et débriefs).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listExperiencesTool, listInterviewSessionsTool] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
