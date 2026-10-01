import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CLASSIQUE_AGENT_ENV, getSchoolInterviewConfig } from "@/lib/school-interviews";

/**
 * Agent réellement joignable pour une école donnée.
 * - agent dédié déclaré → on le prend ;
 * - agent dédié pas encore créé → repli sur l'agent classique partagé, signalé
 *   au candidat dans le popup de structure (jamais de blocage).
 */
function resolveAgent(school: string) {
  const config = getSchoolInterviewConfig(school);
  const dedicated = process.env[config.agentIdEnv];
  const shared = process.env[CLASSIQUE_AGENT_ENV];
  const usesFallback = !dedicated && config.agentIdEnv !== CLASSIQUE_AGENT_ENV;
  return { config, agentId: dedicated ?? shared, usesFallback };
}

/**
 * État de l'agent pour une école, consulté avant le démarrage pour afficher
 * l'avertissement de repli dans le popup de structure.
 */
export const juryAgentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ school: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { agentId, usesFallback } = resolveAgent(data.school);
    return { available: Boolean(agentId), usesFallback };
  });

/**
 * Jeton de session vocale temps réel (WebRTC) pour l'agent jury.
 * La clé API ElevenLabs reste côté serveur : le navigateur ne reçoit qu'un
 * jeton à durée de vie courte, plus l'identifiant de l'agent à joindre.
 */
export const juryAgentToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ school: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["ELEVENLABS_API_KEY"];
    if (!apiKey) throw new Error("La voix temps réel n'est pas configurée (clé ElevenLabs manquante).");

    const { agentId, usesFallback } = resolveAgent(data.school);
    if (!agentId) {
      throw new Error(
        "Aucun agent vocal n'est déclaré pour le moment. Enregistrez l'identifiant de l'agent classique.",
      );
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`ElevenLabs token ${res.status}: ${body}`);
      throw new Error(`Connexion au jury vocal impossible (${res.status}).`);
    }
    const json = (await res.json()) as { token?: string };
    if (!json.token) throw new Error("Jeton de session vocale absent de la réponse ElevenLabs.");
    return { token: json.token, agentId, usesFallback };
  });

/**
 * MODE TEST ÉCRIT (à retirer après les tests) : URL signée WebSocket.
 * Le mode sans audio n'est pas accepté sur la connexion WebRTC ; il faut une
 * URL signée. La clé API reste côté serveur, l'URL est à durée de vie courte.
 */
export const juryAgentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ school: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["ELEVENLABS_API_KEY"];
    if (!apiKey) throw new Error("La voix temps réel n'est pas configurée (clé ElevenLabs manquante).");

    const { agentId, usesFallback } = resolveAgent(data.school);
    if (!agentId) throw new Error("Aucun agent n'est déclaré pour cette école.");

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error(`ElevenLabs signed-url ${res.status}: ${body}`);
      throw new Error(`Connexion au jury écrit impossible (${res.status}).`);
    }
    const json = (await res.json()) as { signed_url?: string };
    if (!json.signed_url) throw new Error("URL signée absente de la réponse ElevenLabs.");
    return { signedUrl: json.signed_url, agentId, usesFallback };
  });
