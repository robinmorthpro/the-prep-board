// Appels directs aux fournisseurs d'IA (serveur uniquement), sans la passerelle Lovable :
// - Google Gemini : note de l'évaluateur, retours des modules, transcription de la voix, lecture des supports ;
// - Anthropic Claude : rédacteur du feedback.
// Les clés sont lues dans les variables d'environnement (GEMINI_API_KEY, ANTHROPIC_API_KEY), jamais dans le code.
import Anthropic from "@anthropic-ai/sdk";

export class AiProviderError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Contenu au format « chat » déjà utilisé par l'app (texte, image ou fichier en data URL). */
export type ChatPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; file: { file_data: string; filename?: string } };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | ChatPart[] };

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

function dataUrlPart(url: string): GeminiPart {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(url);
  if (!match) throw new AiProviderError(400, "Fichier illisible pour l'IA.");
  return { inlineData: { mimeType: match[1]!, data: match[2]! } };
}

function toGeminiParts(content: ChatMessage["content"]): GeminiPart[] {
  if (typeof content === "string") return [{ text: content }];
  return content.map((part) => {
    if (part.type === "text") return { text: part.text };
    if (part.type === "image_url") return dataUrlPart(part.image_url.url);
    return dataUrlPart(part.file.file_data);
  });
}

function textOf(content: ChatMessage["content"]): string {
  return typeof content === "string"
    ? content
    : content.map((part) => (part.type === "text" ? part.text : "")).join("\n");
}

/** Gemini (API Google native) : renvoie le texte de la réponse. */
export async function geminiChat(opts: {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  json?: boolean;
  maxOutputTokens?: number;
  fetcher?: (url: string, init: RequestInit) => Promise<Response>;
}): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new AiProviderError(401, "GEMINI_API_KEY manquante");
  const model = opts.model.replace(/^google\//, "");
  const system = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => textOf(m.content))
    .join("\n\n");
  const contents = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: toGeminiParts(m.content) }));
  const body = {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0,
      ...(opts.maxOutputTokens ? { maxOutputTokens: opts.maxOutputTokens } : {}),
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  const res = await (opts.fetcher ?? fetch)(`${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
    throw new AiProviderError(res.status, `Erreur IA (${res.status}).`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  };
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("");
}

let anthropicClient: Anthropic | null = null;

function anthropic(): Anthropic {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) throw new AiProviderError(401, "ANTHROPIC_API_KEY manquante");
  anthropicClient ??= new Anthropic({ apiKey: key });
  return anthropicClient;
}

/**
 * Claude (API Anthropic), en flux pour les longues réponses. Mêmes réglages qu'avec la passerelle :
 * pas de température (refusée par Sonnet 5), réflexion adaptative bornée par l'effort seulement si demandé.
 */
export async function claudeMessages(opts: {
  model: string;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens: number;
  effort?: "low" | "medium" | "high";
}): Promise<{ text: string; stop: string | undefined; outputTokens: number }> {
  const model = opts.model.replace(/^anthropic\//, "");
  try {
    const stream = anthropic().messages.stream({
      model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: opts.messages,
      ...(opts.effort ? { thinking: { type: "adaptive" as const }, output_config: { effort: opts.effort } } : {}),
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") throw new AiProviderError(403, "Le modèle a refusé de répondre.");
    const text = message.content.map((block) => (block.type === "text" ? block.text : "")).join("");
    return { text, stop: message.stop_reason ?? undefined, outputTokens: message.usage.output_tokens };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic ${error.status}: ${error.message.slice(0, 500)}`);
      throw new AiProviderError(error.status ?? 500, `Erreur IA (${error.status ?? "réseau"}).`);
    }
    throw error;
  }
}
