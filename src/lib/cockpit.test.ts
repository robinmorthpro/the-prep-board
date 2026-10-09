import { describe, expect, it } from "vitest";
import { computePriorities, computeThemeScores, isValidCompletedSimulation } from "./cockpit";
import { BAREME } from "./evaluateur/bareme";
import type { InterviewSession } from "./vivaldi-queries";

function session(ratio: number, createdAt: string, overrides: Record<string, unknown> = {}): InterviewSession {
  const grid = BAREME.grilles["classique"];
  if (!grid) throw new Error("Grille classique introuvable");
  const casePoints = Object.fromEntries(
    grid.criteres.map((criterion) => [
      criterion.cle,
      Object.fromEntries(
        criterion.cases.map((caseDef) => [caseDef.cle, Math.max(...Object.values(caseDef.points)) * ratio]),
      ),
    ]),
  );
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
      case_points: casePoints,
      ...overrides,
    },
  };
}

describe("radar des simulations complètes", () => {
  it("ne fournit aucune valeur avec 0 simulation", () => {
    expect(computeThemeScores([], []).every((theme) => theme.score === null)).toBe(true);
  });

  it("utilise la seule simulation disponible", () => {
    expect(computeThemeScores([], [session(1 / 3, "1")]).map((theme) => theme.score)).toEqual([33, 33, 33, 33, 33]);
  });

  it("moyenne les 2 simulations disponibles", () => {
    expect(computeThemeScores([], [session(1, "2"), session(0, "1")]).map((theme) => theme.score)).toEqual([
      50, 50, 50, 50, 50,
    ]);
  });

  it("ne retient que les 3 dernières simulations", () => {
    expect(
      computeThemeScores([], [session(1, "4"), session(1, "3"), session(1, "2"), session(0, "1")]).map(
        (theme) => theme.score,
      ),
    ).toEqual([100, 100, 100, 100, 100]);
  });

  it("ignore une simulation interrompue et les cases non observées", () => {
    const valid = session(1, "2");
    const schoolCases = valid.evaluation?.case_points["ecole"];
    if (schoolCases) schoolCases["case1"] = null;
    const interrupted = session(0, "1", { interrupted: true });
    expect(computeThemeScores([], [valid, interrupted]).map((theme) => theme.score)).toEqual([100, 100, 100, 100, 100]);
  });
});

describe("compteur des simulations complètes", () => {
  it("ne compte que les simulations achevées, non interrompues et avec une évaluation valide", () => {
    const valid = session(1, "valid");
    const interrupted = session(1, "interrupted", { interrupted: true });
    const invalid = session(1, "invalid", { status: "error" });
    const stopped = { ...session(1, "stopped"), status: "stopped" };

    expect([valid, interrupted, invalid, stopped].filter(isValidCompletedSimulation)).toEqual([valid]);
  });

  it("accorde au singulier la priorité quand une seule simulation est valide", () => {
    const priorities = computePriorities({
      profile: { part1_completed: true, target_schools: [] } as never,
      career: { job_or_field: "Conseil", description: "Projet", company_role: "Consultant", job_names: "Consultant", qualities: "Analyse" } as never,
      sheets: [],
      experiences: [],
      newsTopics: [],
      supports: [],
      answers: [],
      sessions: [session(1, "valid"), session(1, "interrupted", { interrupted: true })],
      themeScores: computeThemeScores([], [session(1, "valid")]),
    });

    expect(priorities.find((priority) => priority.id === "simulations")?.reason).toContain(
      "1 simulation complète achevée",
    );
  });
});