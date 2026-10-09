import { describe, expect, it } from "vitest";
import { computeThemeScores } from "./cockpit";
import type { InterviewSession } from "./vivaldi-queries";

function session(score: number, createdAt: string, overrides: Partial<InterviewSession["evaluation"]> = {}): InterviewSession {
  return {
    id: createdAt,
    school: "ESCP",
    difficulty: "classique",
    format: "classique",
    turns: [],
    debrief: "",
    status: "done",
    percentile: 50,
    feedback_evaluation_id: createdAt,
    created_at: createdAt,
    evaluation: {
      id: createdAt,
      status: "ok",
      interrupted: false,
      final_score: 10,
      percentile: 50,
      grille: "classique",
      criterion_points: {},
      case_points: {
        presentation: { presentation: score },
        experiences: { recit: score, recul: score, projection: score },
        projet: { connaissance: score, lien_ecole: score, lien_soi: score },
        ecole: { case1: score, case2: score, case3: score, case4: score },
        destabilisantes: { contestation: score, imprevu: score },
        conduite: { repondre: score, piloter: score },
        clarte: { structure: score, langage: score },
      },
      ...overrides,
    },
  };
}

describe("radar des simulations complètes", () => {
  it("ne fournit aucune valeur avec 0 simulation", () => {
    expect(computeThemeScores([], []).every((theme) => theme.score === null)).toBe(true);
  });

  it("utilise la seule simulation disponible", () => {
    expect(computeThemeScores([], [session(1, "1")]).map((theme) => theme.score)).toEqual([33, 33, 33, 33, 33]);
  });

  it("moyenne les 2 simulations disponibles", () => {
    expect(computeThemeScores([], [session(3, "2"), session(0, "1")]).map((theme) => theme.score)).toEqual([
      50, 50, 50, 50, 50,
    ]);
  });

  it("ne retient que les 3 dernières simulations", () => {
    expect(
      computeThemeScores([], [session(3, "4"), session(3, "3"), session(3, "2"), session(0, "1")]).map(
        (theme) => theme.score,
      ),
    ).toEqual([100, 100, 100, 100, 100]);
  });

  it("ignore une simulation interrompue et les cases non observées", () => {
    const valid = session(3, "2");
    if (valid.evaluation) valid.evaluation.case_points.ecole.case1 = null;
    const interrupted = session(0, "1", { interrupted: true });
    expect(computeThemeScores([], [valid, interrupted]).map((theme) => theme.score)).toEqual([100, 100, 100, 100, 100]);
  });
});