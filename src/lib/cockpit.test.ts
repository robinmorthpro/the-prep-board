import { describe, expect, it } from "vitest";
import {
  canonicalQuestionStats,
  completedSimulationLabel,
  computePriorities,
  computeThemeScores,
  isValidCompletedSimulation,
  questionCountByTheme,
  workProgress,
} from "./cockpit";
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
    expect(completedSimulationLabel(1)).toBe("1 simulation complète achevée");
    expect(completedSimulationLabel(2)).toBe("2 simulations complètes achevées");
  });
});

describe("décompte des questions par thème", () => {
  const answer = (question_id: string, feedback: string) => ({
    id: question_id,
    question_id,
    answer: "",
    ai_feedback: feedback,
    status: "done",
  });

  it("ne compte que les questions clés canoniques rattachées explicitement à un thème", () => {
    const totals = questionCountByTheme();
    expect(totals).toEqual({
      "Connaissance écoles": 10,
      "Introspection et récit personnel": 13,
      "Projet professionnel": 6,
      "Projection vers le futur": 7,
      "Aisance orale": 8,
    });
  });

  it("ignore les réponses aux questions d'entraînement par école (mots EDHEC, cartes emlyon…)", () => {
    const scores = computeThemeScores(
      [answer("edhec-mot-1", "## Verdict\nValidé"), answer("emlyon-projet-1", "## Verdict\nValidé")],
      [],
    );
    expect(scores.every((theme) => theme.worked === 0 && theme.toRework === 0)).toBe(true);
  });

  it("compte une réponse canonique dans son thème", () => {
    const scores = computeThemeScores([answer("presentez-vous", "## Verdict\nÀ retravailler")], []);
    expect(scores.find((theme) => theme.theme === "Introspection et récit personnel")).toMatchObject({
      worked: 1,
      toRework: 1,
    });
  });
});
describe("ordre des priorités", () => {
  it("place toujours les priorités importantes avant les consolidations", async () => {
    const { computePriorities } = await import("./cockpit");
    const out = computePriorities({
      profile: null, career: null, sheets: [], experiences: [], newsTopics: [], supports: [], answers: [],
      sessions: [session(0.2, "1")], themeScores: computeThemeScores([], [session(0.2, "1")]),
    } as never);
    const ranks = out.map((p) => ({ bloquant: 0, important: 1, consolidation: 2 })[p.level]);
    expect(ranks).toEqual([...ranks].sort());
  });
});

describe("périmètre canonique de tous les objectifs du tableau de bord", () => {
  const answer = (question_id: string, verdict = "Validé") => ({
    id: question_id, question_id, answer: "Ma réponse", ai_feedback: `## Verdict\n${verdict}`, status: "done",
  });
  const career = {
    user_id: "test", job_or_field: "Finance", sector: "", description: "Description", company_role: "Rôle",
    job_names: "Métiers", qualities: "Qualités", news: "", companies: "", extra_info: "", deepened: true,
  };

  it("exclut les questions école du compteur corrigé et conserve l'objectif de 10 questions canoniques", () => {
    const work = workProgress({ profile: null, sheets: [], experiences: [], newsTopics: [], supports: [], sessions: [],
      answers: [answer("presentez-vous"), answer("edhec-mot-1"), answer("emlyon-projet-1")],
    });
    expect(work.find((item) => item.id === "questions")).toMatchObject({ done: 1, target: 10 });
  });

  it("ne crée pas de priorité de reprise pour une question école", () => {
    const out = computePriorities({ profile: { part1_completed: true } as never, career, sheets: [], experiences: [],
      newsTopics: [], supports: [{ status: "submitted" } as never], sessions: [], themeScores: [],
      answers: [answer("edhec-mot-1", "À retravailler")],
    });
    expect(out.some((item) => item.id === "questions-rework")).toBe(false);
    expect(out.some((item) => item.id === "questions")).toBe(true);
  });

  it("les questions école ne permettent pas d'atteindre l'objectif canonique", () => {
    const out = computePriorities({ profile: { part1_completed: true } as never, career, sheets: [], experiences: [],
      newsTopics: [], supports: [{ status: "submitted" } as never], sessions: [], themeScores: [],
      answers: Array.from({ length: 10 }, (_, i) => answer(`edhec-mot-${i}`)),
    });
    expect(out.some((item) => item.id === "questions")).toBe(true);
  });

  it("compte une question canonique une seule fois même si elle est travaillée pour plusieurs écoles", () => {
    const answers = [answer("pourquoi-notre-ecole"), answer("pourquoi-notre-ecole")];
    const scores = computeThemeScores(answers, []);
    expect(scores.find((theme) => theme.theme === "Connaissance écoles")?.worked).toBe(1);
    expect(workProgress({ profile: null, sheets: [], experiences: [], newsTopics: [], supports: [], sessions: [], answers })
      .find((item) => item.id === "questions")?.done).toBe(1);
  });

  it("utilise un total de 44 pour le parcours et exclut les réponses école des états démarré, corrigé, validé et à reprendre", () => {
    expect(canonicalQuestionStats([
      answer("presentez-vous"), answer("pourquoi-notre-ecole", "À retravailler"),
      answer("edhec-mot-1"), answer("emlyon-projet-1", "À retravailler"),
    ])).toEqual({ total: 44, started: 2, corrected: 2, validated: 1, toRework: 1 });
  });

  it("compte seulement la question canonique à reprendre dans la priorité", () => {
    const out = computePriorities({ profile: { part1_completed: true } as never, career, sheets: [], experiences: [],
      newsTopics: [], supports: [{ status: "submitted" } as never], sessions: [], themeScores: [],
      answers: [answer("presentez-vous", "À retravailler"), answer("edhec-mot-1", "À retravailler")],
    });
    expect(out.some((item) => item.id === "questions-rework")).toBe(true);
    expect(canonicalQuestionStats([answer("presentez-vous", "À retravailler"), answer("edhec-mot-1", "À retravailler")])
      .toRework).toBe(1);
  });
});
