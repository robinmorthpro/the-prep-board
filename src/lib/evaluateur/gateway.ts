// Appels de l'évaluateur et du rédacteur aux fournisseurs d'IA (serveur uniquement).
// Depuis le 18/10 : appels directs à Google (Gemini) et à Anthropic (Claude), sans la passerelle Lovable.
// Mêmes modèles et mêmes réglages qu'aux tours de test : seul le branchement change.
import { AiProviderError, claudeMessages, geminiChat } from "@/lib/ai/providers";

export const DEFAULT_EVAL_MODEL = "google/gemini-3.7-flash";

/** Limite de jetons de sortie de l'évaluateur, tous modèles (Claude dépassait 16 000). */
export const EVAL_MAX_OUTPUT_TOKENS = 32000;
/**
 * Claude, évaluateur seulement : niveau d'effort de la réflexion adaptative.
 * Sonnet 5 refuse un budget en jetons : on borne la réflexion par `output_config.effort`.
 */
export const CLAUDE_EVAL_EFFORT: Effort = "medium";
export type Effort = "low" | "medium" | "high";

/** Jetons du dernier appel Claude (sortie totale), pour le banc d'essai. */
export const dernierUsageClaude = { sortie: 0, reflexion: 0, texte: 0, stop: "" as string | undefined };

export type Message = { role: "user" | "assistant"; content: string };

export class GatewayError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Conservé pour les appelants : un simple `fetch` (l'identifiant de run était propre à la passerelle Lovable). */
export function createRunIdFetch() {
  return (url: string, init: RequestInit) => fetch(url, init);
}

type Fetcher = ReturnType<typeof createRunIdFetch>;

export async function callEvaluator(
  f: Fetcher,
  model: string,
  system: string,
  messages: Message[],
  _schema?: unknown,
  opts: { json?: boolean; effort?: Effort | null } = {},
): Promise<string> {
  try {
    if (model.startsWith("anthropic/")) {
      // Évaluateur (JSON) : réflexion bornée ; rédacteur et autres appels texte : sans réflexion imposée.
      const effort = opts.effort === null ? undefined : (opts.effort ?? (opts.json !== false ? CLAUDE_EVAL_EFFORT : undefined));
      const r = await claudeMessages({ model, system, messages, maxTokens: EVAL_MAX_OUTPUT_TOKENS, ...(effort ? { effort } : {}) });
      Object.assign(dernierUsageClaude, { sortie: r.outputTokens, reflexion: 0, texte: r.outputTokens, stop: r.stop });
      return r.text;
    }
    return await geminiChat({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0,
      json: opts.json !== false,
      maxOutputTokens: EVAL_MAX_OUTPUT_TOKENS,
      fetcher: f,
    });
  } catch (error) {
    if (error instanceof AiProviderError) throw new GatewayError(error.status, error.message);
    throw error;
  }
}
