// Appels de l'évaluateur à la passerelle Lovable AI (serveur uniquement).
export const DEFAULT_EVAL_MODEL = "google/gemini-3.7-flash";

const BASE = "https://ai.gateway.lovable.dev/v1";
/** Limite de jetons de sortie de l'évaluateur, tous modèles (Claude dépassait 16 000). */
export const EVAL_MAX_OUTPUT_TOKENS = 32000;
const RUN_ID = "X-Lovable-AIG-Run-ID";
/**
 * Claude, évaluateur seulement : niveau d'effort de la réflexion adaptative.
 * La passerelle refuse un budget en jetons pour Sonnet 5 (« thinking.type.enabled
 * is not supported ») : on borne la réflexion par `output_config.effort`.
 */
export const CLAUDE_EVAL_EFFORT: Effort = "medium";
export type Effort = "low" | "medium" | "high";

/** Jetons du dernier appel Claude (réflexion / texte), lus dans le flux. */
export const dernierUsageClaude = { sortie: 0, reflexion: 0, texte: 0, stop: "" as string | undefined };

export type Message = { role: "user" | "assistant"; content: string };

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Réutilise l'identifiant de run émis par la passerelle entre les appels d'une même évaluation. */
export function createRunIdFetch() {
  let runId: string | undefined;
  return async (url: string, init: RequestInit) => {
    const headers = new Headers(init.headers);
    if (runId) headers.set(RUN_ID, runId);
    const res = await fetch(url, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

type Fetcher = ReturnType<typeof createRunIdFetch>;

async function fail(res: Response): Promise<never> {
  const text = await res.text();
  console.error(`Évaluateur : passerelle ${res.status}: ${text.slice(0, 500)}`);
  throw new GatewayError(res.status, `Erreur IA (${res.status}).`);
}

/** Gemini et autres modèles chat : /v1/chat/completions, température 0, JSON imposé. */
async function callChat(f: Fetcher, key: string, model: string, system: string, messages: Message[], jsonOut = true) {
  const res = await f(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: EVAL_MAX_OUTPUT_TOKENS,
      ...(jsonOut ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) await fail(res);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

/**
 * Claude : /v1/messages natif, en flux. Ni température (refusée par Sonnet 5)
 * ni schéma imposé (grammaire jugée trop grande par la passerelle) : le JSON
 * est exigé par format-sortie.md et vérifié par le code.
 */
async function callMessages(f: Fetcher, key: string, model: string, system: string, messages: Message[], effort?: Effort) {
  const res = await f(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model,
      max_tokens: EVAL_MAX_OUTPUT_TOKENS,
      // Claude Sonnet 5 refuse le paramètre temperature (400) : non envoyé.
      stream: true,
      ...(effort ? { thinking: { type: "adaptive" }, output_config: { effort } } : {}),
      system,
      messages,
    }),
  });
  if (!res.ok || !res.body) await fail(res);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let stop: string | undefined;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const data = frame
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .join("");
      if (!data) continue;
      let ev: {
        type?: string;
        delta?: { type?: string; text?: string; stop_reason?: string };
        usage?: { output_tokens?: number; output_tokens_details?: { thinking_tokens?: number } };
        error?: { message?: string };
      };
      try {
        ev = JSON.parse(data);
      } catch {
        continue;
      }
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") text += ev.delta.text ?? "";
      if (ev.type === "message_delta" && ev.delta?.stop_reason) stop = ev.delta.stop_reason;
      if (ev.type === "message_delta" && ev.usage) {
        const sortie = ev.usage.output_tokens ?? 0;
        const reflexion = ev.usage.output_tokens_details?.thinking_tokens ?? 0;
        Object.assign(dernierUsageClaude, { sortie, reflexion, texte: sortie - reflexion, stop: ev.delta?.stop_reason ?? stop });
      }
      if (ev.type === "error") throw new GatewayError(500, ev.error?.message ?? "Erreur IA (flux).");
    }
  }
  if (stop === "refusal") throw new GatewayError(403, "Le modèle a refusé de répondre.");
  return text;
}

export async function callEvaluator(
  f: Fetcher,
  model: string,
  system: string,
  messages: Message[],
  _schema?: unknown,
  opts: { json?: boolean; effort?: Effort | null } = {},
): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(401, "LOVABLE_API_KEY manquante");
  return model.startsWith("anthropic/")
    ? // Évaluateur (JSON) : réflexion bornée ; rédacteur et autres appels texte : inchangés.
      callMessages(f, key, model, system, messages, opts.effort === null ? undefined : (opts.effort ?? (opts.json !== false ? CLAUDE_EVAL_EFFORT : undefined)))
    : callChat(f, key, model, system, messages, opts.json !== false);
}
