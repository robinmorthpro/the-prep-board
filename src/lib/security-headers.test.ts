import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, withSecurityHeaders } from "./security-headers";

describe("withSecurityHeaders", () => {
  it("ajoute les en-têtes de sécurité en gardant le statut, le type et le corps", async () => {
    const r = withSecurityHeaders(new Response("<p>ok</p>", { status: 404, headers: { "content-type": "text/html" } }));
    expect(r.status).toBe(404);
    expect(r.headers.get("content-type")).toBe("text/html");
    expect(await r.text()).toBe("<p>ok</p>");
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) expect(r.headers.get(name)).toBe(value);
  });

  it("n'écrase pas un en-tête déjà posé", () => {
    const r = withSecurityHeaders(new Response("", { headers: { "Referrer-Policy": "no-referrer" } }));
    expect(r.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("autorise le micro pour le site lui-même, pour les entretiens vocaux", () => {
    expect(SECURITY_HEADERS["Permissions-Policy"]).toContain("microphone=(self)");
  });
});
