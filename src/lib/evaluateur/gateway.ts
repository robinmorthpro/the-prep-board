// Appels de l'évaluateur à la passerelle Lovable AI (serveur uniquement).
export const DEFAULT_EVAL_MODEL = "google/gemini-3.7-flash";

const BASE = "https://ai.gateway.lovable.dev/v1";
const RUN_ID = "X-Lovable-AIG-Run-ID";

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
async function callMessages(f: Fetcher, key: string, model: string, system: string, messages: Message[]) {
  const res = await f(`${BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model,
      max_tokens: 16000,
      // Claude Sonnet 5 refuse le paramètre temperature (400) : non envoyé.
      stream: true,
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
      let ev: { type?: string; delta?: { type?: string; text?: string; stop_reason?: string }; error?: { message?: string } };
      try {
        ev = JSON.parse(data);
      } catch {
        continue;
      }
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") text += ev.delta.text ?? "";
      if (ev.type === "message_delta" && ev.delta?.stop_reason) stop = ev.delta.stop_reason;
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
  opts: { json?: boolean } = {},
): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(401, "LOVABLE_API_KEY manquante");
  return model.startsWith("anthropic/")
    ? callMessages(f, key, model, system, messages)
    : callChat(f, key, model, system, messages, opts.json !== false);
}
