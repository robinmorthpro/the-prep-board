import { afterEach, describe, expect, it } from "vitest";
import { AiProviderError, geminiChat } from "./providers";

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("geminiChat", () => {
  afterEach(() => {
    delete process.env["GEMINI_API_KEY"];
  });

  it("traduit les messages de l'app au format Google et renvoie le texte sans la réflexion", async () => {
    process.env["GEMINI_API_KEY"] = "cle-de-test";
    let url = "";
    let init: RequestInit = {};
    const text = await geminiChat({
      model: "google/gemini-3.7-flash",
      json: true,
      messages: [
        { role: "system", content: "Consigne" },
        { role: "user", content: [{ type: "text", text: "Lis" }, { type: "file", file: { filename: "a.webm", file_data: "data:audio/webm;base64,QUJD" } }] },
        { role: "assistant", content: "Déjà dit" },
      ],
      fetcher: async (u, i) => {
        url = u;
        init = i;
        return reply({ candidates: [{ content: { parts: [{ text: "pensée", thought: true }, { text: "{\"ok\":" }, { text: "true}" }] } }] });
      },
    });
    expect(text).toBe('{"ok":true}');
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("cle-de-test");
    const body = JSON.parse(String(init.body));
    expect(body.systemInstruction).toEqual({ parts: [{ text: "Consigne" }] });
    expect(body.contents).toEqual([
      { role: "user", parts: [{ text: "Lis" }, { inlineData: { mimeType: "audio/webm", data: "QUJD" } }] },
      { role: "model", parts: [{ text: "Déjà dit" }] },
    ]);
    expect(body.generationConfig).toEqual({ temperature: 0, responseMimeType: "application/json" });
  });

  it("signale une clé manquante ou une erreur de Google avec son code", async () => {
    await expect(geminiChat({ model: "gemini-3.7-flash", messages: [] })).rejects.toMatchObject({ status: 401 });
    process.env["GEMINI_API_KEY"] = "cle-de-test";
    const error = await geminiChat({ model: "gemini-3.7-flash", messages: [], fetcher: async () => reply({}, 429) }).catch((e) => e);
    expect(error).toBeInstanceOf(AiProviderError);
    expect(error.status).toBe(429);
  });
});
