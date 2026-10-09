import { describe, expect, it, vi } from "vitest";
import { BAREME } from "./bareme";

const reponses: string[] = [];
vi.mock("./gateway", () => ({
  DEFAULT_EVAL_MODEL: "google/gemini-3.7-flash",
  createRunIdFetch: () => fetch,
  callEvaluator: vi.fn(async () => reponses.shift()!),
}));

const { evaluerSession } = await import("./run");

const grille = BAREME.grilles["classique"]!;
const citation = "je suis en deuxième année de prépa ECG";
function sortieAvecManqueInvente() {
  const criteres = Object.fromEntries(
    grille.criteres.map((c) => [
      c.cle,
      Object.fromEntries(c.cases.map((x) => [x.cle, { niveau: "N4", justification: "ok", manque_pour_n4: [] as string[], citations: [citation] }])),
    ]),
  );
  const c0 = grille.criteres[0]!;
  criteres[c0.cle]![c0.cases[0]!.cle] = { niveau: "N3", justification: "ok", manque_pour_n4: ["un morceau inventé de toutes pièces"], citations: [citation] };
  return JSON.stringify({ grille: "classique", entretien_interrompu: false, criteres, penalites: [], remarques: "" });
}

describe("manque_pour_n4 introuvable : non bloquant après le nouvel appel", () => {
  it("deux appels, statut ok, morceau retiré, avertissement enregistré", async () => {
    reponses.push(sortieAvecManqueInvente(), sortieAvecManqueInvente());
    const c0 = grille.criteres[0]!;
    const r = await evaluerSession(
      {
        id: "s", user_id: "u", school: "NEOMA", status: "done", phase_timings: [], support_text: null, inseec_image: null,
        turns: [{ question: "Présentez-vous.", answer: "Bonjour, je suis en deuxième année de prépa ECG au lycée du Parc." }],
      },
      { triggeredBy: "test" },
    );
    expect(r.status).toBe("ok");
    expect(r.attempts).toBe(2);
    const cell = (r.raw_output as any).criteres[c0.cle][c0.cases[0]!.cle];
    expect(cell.manque_pour_n4).toEqual([]);
    expect(cell.niveau).toBe("N3");
    expect(r.warnings).toEqual([{ type: "manque_pour_n4_retire", case: `${c0.cle}.${c0.cases[0]!.cle}`, morceau: "un morceau inventé de toutes pièces" }]);
    expect(r.score_20).not.toBeNull();
  });
});
