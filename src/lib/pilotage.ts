// Calculs de l'espace admin « Pilotage » : fonctions pures, testées dans pilotage.test.ts.
import { PARTS } from "@/lib/vivaldi-data";
import {
  isCareerDeepened,
  type Profile,
  type CareerProject,
  type Experience,
  type InterviewSession,
  type InterviewSupport,
  type NewsTopic,
  type QuestionAnswer,
  type SchoolSheet,
} from "@/lib/vivaldi-queries";
import { isValidCompletedSimulation, workProgress } from "@/lib/cockpit";

export const MODULES = PARTS.map((p) => ({ id: p.id, title: p.title }));

export type CandidateData = {
  profile: Profile;
  email: string | null;
  experiences: Experience[];
  career: CareerProject | null;
  sheets: SchoolSheet[];
  news: NewsTopic[];
  supports: InterviewSupport[];
  answers: QuestionAnswer[];
  sessions: InterviewSession[];
};

/** Module 3 à 8 → élément d'avancement du tableau de bord apprenant (`workProgress`). */
const WORK_ITEM_OF_MODULE: Record<number, string> = {
  3: "fiches",
  4: "experiences",
  5: "actu",
  6: "supports",
  7: "questions",
  8: "simulations",
};

/**
 * Un module est terminé selon les mêmes seuils que le tableau de bord du candidat :
 * l'admin et le candidat voient le même avancement.
 */
export function completedModules(c: CandidateData): Record<number, boolean> {
  const work = workProgress({
    profile: c.profile,
    sheets: c.sheets,
    experiences: c.experiences,
    newsTopics: c.news,
    supports: c.supports,
    answers: c.answers,
    sessions: c.sessions,
  });
  const reached = (id: string) => {
    const item = work.find((w) => w.id === id);
    // Même règle que le tableau de bord du candidat : « complete » prime quand il est fourni.
    return !!item && (item.complete ?? item.done >= item.target);
  };
  const done: Record<number, boolean> = {
    1: !!c.profile.part1_completed,
    2: isCareerDeepened(c.career),
  };
  for (const [module, id] of Object.entries(WORK_ITEM_OF_MODULE)) done[Number(module)] = reached(id);
  return done;
}

export function countCompleted(c: CandidateData) {
  return Object.values(completedModules(c)).filter(Boolean).length;
}

/** Entretiens achevés et notés, les plus récents d'abord, éventuellement pour une seule école. */
export function validSessions(c: CandidateData, school?: string | null) {
  return c.sessions
    .filter(isValidCompletedSimulation)
    .filter((s) => !school || s.school === school)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function scoreOf(s: InterviewSession): number | null {
  const v = s.evaluation?.final_score;
  return typeof v === "number" ? v : v == null ? null : Number(v);
}

export function average(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function candidateName(p: Profile) {
  const name = [p.first_name, p.last_name].filter((v) => (v ?? "").trim()).join(" ").trim();
  return name || p.full_name?.trim() || "Candidat sans nom";
}

export function overview(candidates: CandidateData[], school?: string | null) {
  const visible = school
    ? candidates.filter((c) => (c.profile.target_schools ?? []).includes(school) || c.sessions.some((s) => s.school === school))
    : candidates;
  const sessions = visible.flatMap((c) => validSessions(c, school));
  const scores = sessions.map(scoreOf).filter((v): v is number => v != null);

  const bySchool = new Map<string, number[]>();
  for (const c of candidates) {
    for (const s of validSessions(c)) {
      const v = scoreOf(s);
      if (v == null) continue;
      bySchool.set(s.school, [...(bySchool.get(s.school) ?? []), v]);
    }
  }
  const schools = [...bySchool.entries()]
    .map(([name, values]) => ({ name, average: average(values)!, count: values.length }))
    .sort((a, b) => b.average - a.average);

  const completion = MODULES.map((m) => ({
    ...m,
    percent: visible.length ? Math.round((visible.filter((c) => completedModules(c)[m.id]).length / visible.length) * 100) : 0,
  }));

  return {
    candidates: visible,
    candidateCount: visible.length,
    interviewCount: sessions.length,
    averageScore: average(scores),
    schools,
    completion,
  };
}

/** Écoles proposées dans le filtre : celles visées par les candidats ou déjà passées en entretien. */
export function schoolOptions(candidates: CandidateData[]) {
  const set = new Set<string>();
  for (const c of candidates) {
    (c.profile.target_schools ?? []).forEach((s) => s && set.add(s));
    c.sessions.forEach((s) => s.school && set.add(s.school));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

export function formatScore(v: number | null) {
  return v == null ? "—" : v.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
