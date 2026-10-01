import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Anecdote } from "./vivaldi-data";
import { TEST_MODE_PREMIUM_FREE } from "./vivaldi-data";

export type Profile = {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  prepa_class: string;
  prepa_lycee: string;
  acquisition_channel: string;
  expectations: string[];
  expectations_other: string;
  other_prep: string;
  target_schools: string[];
  choice_1: string;
  choice_2: string;
  choice_3: string;
  plan: string;
  part1_completed: boolean;
  part2_completed: boolean;
};

export type Experience = {
  id: string;
  category: string;
  name: string;
  start_date: string;
  end_date: string;
  context: string;
  story_title: string;
  story: string;
  anecdotes: Anecdote[];
  status: string;
  ai_feedback: string;
};

export type CareerProject = {
  user_id: string;
  job_or_field: string;
  sector: string;
  description: string;
  company_role: string;
  job_names: string;
  qualities: string;
  news: string;
  companies: string;
  extra_info: string;
  deepened: boolean;
};

export const SHEET_ITEM_KINDS = [
  "Master ou spécialisation",
  "Association",
  "Université étrangère ou double diplôme",
  "Entreprise partenaire",
  "Autre",
] as const;

export type SheetItemKind = (typeof SHEET_ITEM_KINDS)[number];

export type SheetItem = {
  id: string;
  kind: SheetItemKind;
  name: string;
  description: string;
  url: string;
  why: string;
};

export type SchoolSheet = {
  id: string;
  school: string;
  items: SheetItem[];
  baseline: string;
  founded_year: string;
  director: string;
  campuses: string;
  generic_other: string;
  masters: string;
  master_url: string;
  why_master: string;
  associations: string;
  why_association: string;
  exchanges: string;
  why_exchange: string;
  partners: string;
  why_partner: string;
  specifics: string;
  why_specific: string;
  finished: boolean;
};

export type NewsTopic = {
  id: string;
  title: string;
  event_date: string;
  urls: string[];
  why_important: string;
  stakes: string;
  causes: string;
  consequences: string;
  personal_interest: string;
  interview_link: string;
  status: string;
  ai_feedback: string;
};

export function useNewsTopics(userId?: string) {
  return useQuery({
    queryKey: ["news_topics", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_topics")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as NewsTopic[];
    },
  });
}

/** Un sujet d'actualité est complet quand l'analyse et l'appropriation personnelle sont là. */
export function newsTopicMissingFields(t: NewsTopic) {
  const checks: Array<[string, string | null | undefined]> = [
    ["nom de l'événement", t.title],
    ["date de l'événement", t.event_date],
    ["au moins un lien", (t.urls ?? []).filter((u) => (u ?? "").trim()).join("")],
    ["pourquoi c'est important", t.why_important],
    ["les enjeux", t.stakes],
    ["les causes", t.causes],
    ["les conséquences possibles", t.consequences],
    ["pourquoi ça m'intéresse", t.personal_interest],
    ["le lien à faire en entretien", t.interview_link],
  ];
  return checks.filter(([, v]) => !(v ?? "").trim()).map(([label]) => label);
}

export function isNewsTopicComplete(t: NewsTopic) {
  return newsTopicMissingFields(t).length === 0;
}

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useExperiences(userId?: string) {
  return useQuery({
    queryKey: ["experiences", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("user_id", userId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Experience[];
    },
  });
}

export function useCareerProject(userId?: string) {
  return useQuery({
    queryKey: ["career", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_projects")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as CareerProject | null;
    },
  });
}

export function useSchoolSheets(userId?: string) {
  return useQuery({
    queryKey: ["sheets", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_sheets")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        items: Array.isArray(row.items) ? (row.items as unknown as SheetItem[]) : [],
      })) as SchoolSheet[];
    },
  });
}

/** Champs obligatoires d'un élément spécifique. */
export function itemMissingFields(i: SheetItem) {
  const checks: Array<[string, string | null | undefined]> = [
    ["Nom exact", i.name],
    ["Description et informations", i.description],
    ["URL de référence", i.url],
    ["Pourquoi cela m'intéresse", i.why],
  ];
  return checks.filter(([, v]) => !(v ?? "").trim()).map(([label]) => label);
}

/** Une école est finie quand le socle générique est rempli et qu'au moins 3 éléments spécifiques sont complets. */
export function sheetMissingFields(s: SchoolSheet) {
  const checks: Array<[string, string | null | undefined]> = [
    ["Baseline / slogan", s.baseline],
    ["Année de création", s.founded_year],
    ["Nom du directeur ou de la directrice", s.director],
    ["Campus", s.campuses],
  ];
  const missing = checks.filter(([, v]) => !(v ?? "").trim()).map(([label]) => label);
  const items = s.items ?? [];
  const complete = items.filter((i) => itemMissingFields(i).length === 0);
  if (complete.length < 3) {
    missing.push(`Au moins 3 éléments spécifiques complets (${complete.length}/3 pour l'instant)`);
  }
  items.forEach((i, idx) => {
    const gaps = itemMissingFields(i);
    if (gaps.length > 0) missing.push(`Élément ${idx + 1} (${i.kind}) : ${gaps.join(", ")}`);
  });
  return missing;
}


export function isSheetFinished(s: SchoolSheet) {
  return sheetMissingFields(s).length === 0;
}


export function isCareerDeepened(c: CareerProject | null) {
  if (!c) return false;
  return [c.job_or_field, c.description, c.company_role, c.job_names, c.qualities].every((v) => (v ?? "").trim().length > 0);
}

export function isExperienceComplete(e: Experience) {
  const anecdotesOk =
    Array.isArray(e.anecdotes) &&
    e.anecdotes.filter((a) => a?.detail?.trim() && a?.learning?.trim() && a?.link?.trim()).length >= 3;
  return !!e.context.trim() && !!e.story.trim() && anecdotesOk;
}

export type Progress = {
  unlocked: Record<number, boolean>;
  submittedRatio: number;
  finishedSheets: number;
  finishedNews: number;
  isPremium: boolean;
  premiumRequirementsMet: boolean;
};

export function computeProgress(
  profile: Profile | null,
  experiences: Experience[],
  career: CareerProject | null,
  sheets: SchoolSheet[],
  newsTopics: NewsTopic[] = [],
): Progress {
  const finishedSheets = sheets.filter(isSheetFinished).length;
  const submitted = experiences.filter((e) => e.status === "submitted").length;
  const submittedRatio = experiences.length ? submitted / experiences.length : 0;
  const isPremium = profile?.plan === "premium";

  const p2 = !!profile?.part1_completed;
  const p3 = p2 && isCareerDeepened(career);
  const p4 = p3 && finishedSheets >= 1;
  const p5 = p4 && experiences.length > 0 && submittedRatio >= 0.75;
  const finishedNews = newsTopics.filter((t) => t.status === "submitted" && isNewsTopicComplete(t)).length;
  const premiumRequirementsMet = p5 && finishedNews >= 1;
  // TEST : parties 6 et 7 ouvertes sans prérequis (à reverrouiller avant les tests utilisateurs
  // en remettant `premiumRequirementsMet && (isPremium || TEST_MODE_PREMIUM_FREE)`).
  const premiumOpen = true;

  return {
    unlocked: { 1: true, 2: p2, 3: p3, 4: p4, 5: p5, 6: premiumOpen, 7: premiumOpen, 8: premiumOpen },
    submittedRatio,
    finishedSheets,
    finishedNews,
    isPremium,
    premiumRequirementsMet,
  };
}

/* ------------------------------------------------------------------ */
/* Module 6 - supports d'entretien (questionnaires + CV projectif)     */
/* ------------------------------------------------------------------ */

export type ProjectiveCvExperience = {
  period: string;
  role: string;
  company: string;
  place: string;
  missions: string;
  future: boolean;
};

export type ProjectiveCv = {
  headline: string;
  full_name: string;
  identity: string;
  contact: string;
  /** Formation déjà suivie (réelle) : lycée, prépa. */
  formation: string;
  /** Formation projetée : parcours SKEMA, masters, doubles diplômes. */
  formation_future: string;
  experiences: ProjectiveCvExperience[];
  languages: string;
  skills: string;
  associations: string;
  extras: string;
};

export const EMPTY_PROJECTIVE_CV: ProjectiveCv = {
  headline: "",
  full_name: "",
  identity: "",
  contact: "",
  formation: "",
  formation_future: "",
  experiences: [],
  languages: "",
  skills: "",
  associations: "",
  extras: "",
};

export type InterviewSupport = {
  id: string;
  school: string;
  kind: "questionnaire" | "cv";
  answers: Record<string, string>;
  cv: ProjectiveCv;
  ai_feedback: string;
  status: string;
};

export function useInterviewSupports(userId?: string) {
  return useQuery({
    queryKey: ["interview_supports", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_supports")
        .select("id, school, kind, answers, cv, ai_feedback, status")
        .eq("user_id", userId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        answers: (row.answers ?? {}) as Record<string, string>,
        cv: { ...EMPTY_PROJECTIVE_CV, ...((row.cv ?? {}) as Partial<ProjectiveCv>) },
      })) as InterviewSupport[];
    },
  });
}

/** Un support est terminé quand il a été soumis au jury IA. */
export function isSupportComplete(s: InterviewSupport) {
  return s.status === "submitted";
}

/** Champs manquants d'un CV projectif (mêmes exigences que le support SKEMA). */
export function projectiveCvMissingFields(cv: ProjectiveCv) {
  const checks: Array<[string, string]> = [
    ["Titre du CV (poste occupé dans 10 ans)", cv.headline],
    ["Nom et prénom", cv.full_name],
    ["Coordonnées projetées", cv.contact],
    ["Formation réelle (lycée, prépa)", cv.formation],
    ["Formation projetée (parcours SKEMA)", cv.formation_future],
    ["Langues", cv.languages],
  ];
  const missing = checks.filter(([, v]) => !(v ?? "").trim()).map(([label]) => label);
  const filled = cv.experiences.filter((e) => e.role.trim() && e.missions.trim());
  if (filled.length < 3) missing.push(`Au moins 3 expériences détaillées (${filled.length}/3 pour l'instant)`);
  if (!cv.experiences.some((e) => e.future)) missing.push("Au moins une expérience projetée (future)");
  if (!cv.experiences.some((e) => !e.future)) missing.push("Au moins une expérience réelle déjà vécue");
  return missing;
}

export type QuestionAnswer = {
  id: string;
  question_id: string;
  answer: string;
  ai_feedback: string;
  status: string;
  school?: string;
};

export function useQuestionAnswers(userId?: string) {
  return useQuery({
    queryKey: ["question_answers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_answers")
        .select("*")
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuestionAnswer[];
    },
  });
}

export type QuestionAttempt = {
  id: string;
  question_id: string;
  answer: string;
  ai_feedback: string;
  created_at: string;
  school?: string;
};

export function useQuestionAttempts(userId?: string, questionId?: string) {
  return useQuery({
    queryKey: ["question_attempts", userId, questionId],
    enabled: !!userId && !!questionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_attempts")
        .select("*")
        .eq("user_id", userId!)
        .eq("question_id", questionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuestionAttempt[];
    },
  });
}

/** Tous les passages de l'étudiant, toutes questions confondues (pour les statuts du menu). */
export function useAllQuestionAttempts(userId?: string) {
  return useQuery({
    queryKey: ["question_attempts", userId, "all"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_attempts")
        .select("id,question_id,answer,ai_feedback,created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuestionAttempt[];
    },
  });
}

/** Un tour d'entretien, horodaté (ISO) pour reconstituer le transcript. */
export type InterviewTurn = {
  question: string;
  answer: string;
  askedAt?: string;
  answeredAt?: string;
};

export type InterviewSession = {
  id: string;
  school: string;
  difficulty: string | null;
  format?: string | null;
  turns: InterviewTurn[];
  debrief: string;
  status: string;
  created_at: string;
};

/** Historique des entraînements du module 7, du plus récent au plus ancien. */
export function useInterviewSessions(userId?: string) {
  return useQuery({
    queryKey: ["interview_sessions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("id, school, difficulty, format, turns, debrief, status, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as InterviewSession[];
    },
  });
}
