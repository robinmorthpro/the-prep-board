import { describe, expect, it } from "vitest";
import { candidateName, completedModules, countCompleted, formatScore, overview, schoolOptions, validSessions, type CandidateData } from "./pilotage";

const session = (school: string, score: number | null, opts: { status?: string; evalStatus?: string; interrupted?: boolean; date?: string } = {}) => ({
  id: `${school}-${score}-${opts.date ?? "2026-10-10"}`,
  school,
  difficulty: null,
  turns: [],
  debrief: "",
  status: opts.status ?? "done",
  percentile: null,
  feedback_evaluation_id: "e",
  created_at: opts.date ?? "2026-10-10T10:00:00Z",
  evaluation: { status: opts.evalStatus ?? "ok", interrupted: opts.interrupted ?? false, final_score: score },
});

const candidate = (over: Omit<Partial<CandidateData>, "profile"> & { profile?: Record<string, unknown> } = {}): CandidateData =>
  ({
    email: null,
    experiences: [],
    career: null,
    sheets: [],
    news: [],
    supports: [],
    answers: [],
    sessions: [],
    ...over,
    profile: { id: Math.random().toString(36), first_name: "", last_name: "", full_name: "", target_schools: [], part1_completed: false, ...(over.profile ?? {}) },
  }) as unknown as CandidateData;

describe("completedModules", () => {
  it("un compte vide n'a aucun module terminé", () => {
    expect(countCompleted(candidate())).toBe(0);
  });

  // Mêmes seuils que le tableau de bord du candidat (workProgress) : 10 questions clés corrigées,
  // 3 simulations valides, au moins 4 expériences soumises (et 75 % d'entre elles).
  const QUESTIONS = [
    "pourquoi-ecole-commerce", "pourquoi-notre-ecole", "qu-est-ce-que-notre-ecole-va-vous-apporter",
    "quelle-est-la-devise-notre-ecole", "quelles-sont-les-valeurs-notre-ecole", "maire-ville-ecole",
    "tissu-economique-ville-region", "apport-ecole", "entre-notre-ecole-et-une-autre-que-choisissez-vous",
    "que-feriez-vous-si-vous-etiez-refuse-dans-notre-ecole",
  ];
  const corrected = (id: string) => ({ question_id: id, answer: "Ma réponse", ai_feedback: "## Verdict\nÀ perfectionner" });
  const exp = (status: string) => ({ status, context: "", story: "", anecdotes: [] });

  it("compte les informations personnelles, les questions clés et les simulations valides", () => {
    const c = candidate({
      profile: { part1_completed: true },
      answers: QUESTIONS.map(corrected) as never,
      sessions: [session("ESSEC", 12), session("EDHEC", 13), session("KEDGE", 11)] as never,
    });
    const done = completedModules(c);
    expect(done[1]).toBe(true);
    expect(done[7]).toBe(true);
    expect(done[8]).toBe(true);
    expect(done[2]).toBe(false);
  });

  it("en dessous des seuils du tableau de bord, le module n'est pas terminé", () => {
    const c = candidate({
      answers: QUESTIONS.slice(0, 9).map(corrected) as never,
      sessions: [session("ESSEC", 12), session("EDHEC", 13)] as never,
    });
    expect(completedModules(c)[7]).toBe(false);
    expect(completedModules(c)[8]).toBe(false);
  });

  it("une même question travaillée deux fois ne compte qu'une fois", () => {
    const c = candidate({ answers: [...QUESTIONS.slice(0, 9), QUESTIONS[0]!].map(corrected) as never });
    expect(completedModules(c)[7]).toBe(false);
  });

  it("une simulation interrompue ou non notée ne compte pas", () => {
    const c = candidate({
      sessions: [session("ESSEC", 12), session("EDHEC", 13), session("KEDGE", 11, { interrupted: true }), session("GEM", null, { status: "stopped" })] as never,
    });
    expect(completedModules(c)[8]).toBe(false);
  });

  it("les expériences comptent à partir de 4 soumises, et 75 % d'entre elles", () => {
    expect(completedModules(candidate({ experiences: [exp("submitted"), exp("submitted"), exp("submitted"), exp("submitted"), exp("draft")] as never }))[4]).toBe(true);
    expect(completedModules(candidate({ experiences: [exp("submitted"), exp("submitted"), exp("submitted"), exp("draft")] as never }))[4]).toBe(false);
  });

  it("donne le même avancement que le tableau de bord du candidat", () => {
    const c = candidate({ answers: QUESTIONS.map(corrected) as never });
    expect(completedModules(c)[7]).toBe(true);
    expect(countCompleted(c)).toBe(1);
  });
});

describe("overview", () => {
  const a = candidate({ profile: { target_schools: ["ESSEC"] }, sessions: [session("ESSEC", 12), session("EDHEC", 14)] as never });
  const b = candidate({ sessions: [session("EDHEC", 10), session("EDHEC", 9, { evalStatus: "error" })] as never });
  const c = candidate();

  it("calcule inscrits, entretiens valides et note moyenne", () => {
    const o = overview([a, b, c]);
    expect(o.candidateCount).toBe(3);
    expect(o.interviewCount).toBe(3);
    expect(o.averageScore).toBe(12);
  });

  it("classe les écoles par note moyenne avec le nombre d'entretiens", () => {
    expect(overview([a, b, c]).schools).toEqual([
      { name: "ESSEC", average: 12, count: 1 },
      { name: "EDHEC", average: 12, count: 2 },
    ]);
  });

  it("filtre par école : candidats concernés et entretiens de cette école seulement", () => {
    const o = overview([a, b, c], "ESSEC");
    expect(o.candidateCount).toBe(1);
    expect(o.interviewCount).toBe(1);
    expect(o.averageScore).toBe(12);
  });

  it("donne le pourcentage de complétion de chaque module", () => {
    const d = candidate({ profile: { part1_completed: true }, sessions: [session("ESSEC", 12), session("EDHEC", 13), session("KEDGE", 11)] as never });
    const o = overview([a, b, c, d]);
    expect(o.completion.find((m) => m.id === 8)?.percent).toBe(25);
    expect(o.completion.find((m) => m.id === 1)?.percent).toBe(25);
    expect(o.completion.find((m) => m.id === 3)?.percent).toBe(0);
  });

  it("ne divise pas par zéro sans candidat", () => {
    const o = overview([]);
    expect(o.averageScore).toBeNull();
    expect(o.completion.every((m) => m.percent === 0)).toBe(true);
  });
});

describe("outils d'affichage", () => {
  it("trie les entretiens du plus récent au plus ancien", () => {
    const c = candidate({ sessions: [session("ESSEC", 10, { date: "2026-10-01T00:00:00Z" }), session("EDHEC", 11, { date: "2026-10-05T00:00:00Z" })] as never });
    expect(validSessions(c).map((s) => s.school)).toEqual(["EDHEC", "ESSEC"]);
  });

  it("liste les écoles visées ou passées, sans doublon", () => {
    expect(schoolOptions([candidate({ profile: { target_schools: ["KEDGE", "ESSEC"] }, sessions: [session("ESSEC", 12)] as never })])).toEqual(["ESSEC", "KEDGE"]);
  });

  it("affiche le prénom et le nom, sinon le nom complet, sinon un libellé neutre", () => {
    expect(candidateName({ first_name: "Inès", last_name: "Morel" } as never)).toBe("Inès Morel");
    expect(candidateName({ full_name: "Hugo Lambert" } as never)).toBe("Hugo Lambert");
    expect(candidateName({} as never)).toBe("Candidat sans nom");
  });

  it("formate les notes à la française", () => {
    expect(formatScore(12.345)).toBe("12,3");
    expect(formatScore(null)).toBe("—");
  });
});
