// Données de l'espace admin « Pilotage » : rôle admin, lecture de tous les candidats, temps réel.
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  CareerProject,
  Experience,
  InterviewSession,
  InterviewSupport,
  NewsTopic,
  Profile,
  QuestionAnswer,
  SchoolSheet,
  SheetItem,
} from "@/lib/vivaldi-queries";
import type { CandidateData } from "@/lib/pilotage";

/** Vrai si le compte connecté a le rôle admin (vérifié par la base, pas par l'interface). */
export function useIsAdmin(userId?: string) {
  return useQuery({
    queryKey: ["is_admin", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });
}

async function all<T>(table: string, columns = "*"): Promise<T[]> {
  const { data, error } = await supabase.from(table as never).select(columns);
  if (error) throw error;
  return (data ?? []) as unknown as T[];
}

const groupBy = <T extends { user_id: string }>(rows: T[]) => {
  const map = new Map<string, T[]>();
  for (const r of rows) map.set(r.user_id, [...(map.get(r.user_id) ?? []), r]);
  return map;
};

/** Tous les candidats (comptes non admin) avec leurs données. Les règles de la base n'autorisent cette lecture qu'à l'admin. */
export function usePilotageData() {
  return useQuery({
    queryKey: ["pilotage"],
    queryFn: async (): Promise<CandidateData[]> => {
      const [profiles, roles, emails, experiences, careers, sheets, news, supports, answers, sessions, evaluations] =
        await Promise.all([
          all<Profile>("profiles"),
          all<{ user_id: string; role: string }>("user_roles", "user_id, role"),
          supabase.rpc("admin_emails" as never).then(({ data, error }) => {
            if (error) throw error;
            return (data ?? []) as unknown as { user_id: string; email: string }[];
          }),
          all<Experience & { user_id: string }>("experiences"),
          all<CareerProject & { user_id: string }>("career_projects"),
          all<SchoolSheet & { user_id: string }>("school_sheets"),
          all<NewsTopic & { user_id: string }>("news_topics"),
          all<InterviewSupport & { user_id: string }>("interview_supports"),
          all<QuestionAnswer & { user_id: string }>("question_answers"),
          all<Omit<InterviewSession, "evaluation"> & { user_id: string }>(
            "interview_sessions",
            "id, user_id, school, difficulty, format, debrief, status, percentile, feedback_evaluation_id, created_at",
          ),
          all<{ id: string; status: string; interrupted: boolean; final_score: number | null }>(
            "interview_evaluations",
            "id, status, interrupted, final_score",
          ),
        ]);

      const admins = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));
      const emailOf = new Map(emails.map((e) => [e.user_id, e.email]));
      const evalById = new Map(evaluations.map((e) => [e.id, e]));
      const exp = groupBy(experiences);
      const car = groupBy(careers);
      const sh = groupBy(sheets);
      const nw = groupBy(news);
      const sup = groupBy(supports);
      const ans = groupBy(answers);
      const ses = groupBy(sessions);

      return profiles
        .filter((p) => !admins.has(p.id))
        .map((p) => ({
          profile: p,
          email: emailOf.get(p.id) ?? null,
          experiences: exp.get(p.id) ?? [],
          career: car.get(p.id)?.[0] ?? null,
          sheets: (sh.get(p.id) ?? []).map((s) => ({
            ...s,
            items: Array.isArray(s.items) ? (s.items as unknown as SheetItem[]) : [],
          })),
          news: nw.get(p.id) ?? [],
          supports: sup.get(p.id) ?? [],
          answers: ans.get(p.id) ?? [],
          sessions: (ses.get(p.id) ?? []).map((s) => ({
            ...s,
            turns: [],
            evaluation: s.feedback_evaluation_id
              ? ((evalById.get(s.feedback_evaluation_id) as unknown as InterviewSession["evaluation"]) ?? null)
              : null,
          })),
        }));
    },
  });
}

/** Recharge le pilotage à chaque inscription, entretien ou évaluation (Supabase Realtime). */
export function usePilotageRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["pilotage"] });
    const channel = supabase
      .channel("pilotage-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "interview_sessions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "interview_evaluations" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
