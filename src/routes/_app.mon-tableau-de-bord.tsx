import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/vivaldi/PageHero";
import {
  ArrowRight,
  Flag,
  Gauge,
  ListChecks,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODULE_BANNERS } from "@/components/vivaldi/module-banners";
import { useSession } from "@/hooks/useSession";
import {
  computePriorities,
  computeThemeScores,
  completedSimulationLabel,
  workProgress,
  isValidCompletedSimulation,
  canonicalQuestionStats,
  type Priority,
  type ThemeScore,
} from "@/lib/cockpit";
import {
  isSheetFinished,
  isSupportComplete,
  useCareerProject,
  useExperiences,
  useInterviewSessions,
  useInterviewSupports,
  useNewsTopics,
  useProfile,
  useQuestionAnswers,
  useSchoolSheets,
} from "@/lib/vivaldi-queries";

export const Route = createFileRoute("/_app/mon-tableau-de-bord")({
  head: () => ({
    meta: [
      { title: "Mon tableau de bord - The Prepboard" },
      {
        name: "description",
        content:
          "Votre cockpit de préparation : priorités du moment, niveau par thème d'entretien et indice de préparation.",
      },
      { property: "og:title", content: "Mon tableau de bord - The Prepboard" },
      {
        property: "og:description",
        content: "Suivez votre niveau par thème d'entretien et ce qu'il reste à travailler avant les oraux.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CockpitPage,
});

const LEVEL_STYLE: Record<Priority["level"], { label: string; className: string }> = {
  bloquant: { label: "Bloquant", className: "bg-destructive text-destructive-foreground" },
  important: { label: "Prioritaire", className: "bg-amber-500 text-amber-950" },
  consolidation: { label: "Consolidation", className: "bg-muted text-muted-foreground" },
};

/** Percentile moyen à partir duquel une école est marquée « Prêt ». */
const READY_PERCENTILE = 60;

function CockpitPage() {
  const [themeSchool, setThemeSchool] = useState("");
  const { user } = useSession();
  const { data: profile = null } = useProfile(user?.id);
  const { data: career = null } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);
  const { data: newsTopics = [] } = useNewsTopics(user?.id);
  const { data: supports = [] } = useInterviewSupports(user?.id);
  const { data: answers = [] } = useQuestionAnswers(user?.id);
  const { data: sessions = [] } = useInterviewSessions(user?.id);

  const themeScores = computeThemeScores(answers, sessions);
  const priorities = computePriorities({
    profile,
    career,
    sheets,
    experiences,
    newsTopics,
    supports,
    answers,
    sessions,
    themeScores,
  });

  const { corrected: correctedQuestions, validated: validatedQuestions } = canonicalQuestionStats(answers);
  const doneSessions = sessions.filter(isValidCompletedSimulation);
  const percentiles = doneSessions
    .map((session) => session.percentile ?? session.evaluation?.percentile ?? null)
    .filter((value): value is number => typeof value === "number");
  const bestPercentile = percentiles.length ? Math.max(...percentiles) : null;
  const lastPercentile = percentiles[0] ?? null;
  const trend =
    percentiles.length >= 2 ? (percentiles[0] ?? 0) - (percentiles[percentiles.length - 1] ?? 0) : null;
  const firstScore = doneSessions[doneSessions.length - 1]?.evaluation?.final_score;
  const lastScore = doneSessions[0]?.evaluation?.final_score;
  const scoreChange =
    typeof firstScore === "number" && typeof lastScore === "number" ? lastScore - firstScore : null;

  const objectives = [profile?.choice_1, profile?.choice_2, profile?.choice_3].filter(
    (c): c is string => !!c && c.trim().length > 0,
  );


  const sessionSchools = [...new Set(doneSessions.map((s) => s.school))].sort();
  const schoolThemeScores = themeSchool
    ? computeThemeScores(answers, sessions.filter((s) => s.school === themeSchool))
    : themeScores;
  const schoolResults = sessionSchools.map((school) => {
    const values = doneSessions
      .filter((x) => x.school === school)
      .map((x) => x.percentile ?? x.evaluation?.percentile ?? null)
      .filter((v): v is number => typeof v === "number");
    const avg = values.length ? Math.round(values.reduce((t, v) => t + v, 0) / values.length) : null;
    return { school, avg, ready: (avg ?? 0) >= READY_PERCENTILE };
  }).filter((r): r is { school: string; avg: number; ready: boolean } => r.avg !== null);
  const work = workProgress({ profile, sheets, experiences, newsTopics, supports, answers, sessions });
  const selectedSchool = themeSchool ? schoolResults.find((r) => r.school === themeSchool) : null;
  const selectedSchoolCount = themeSchool
    ? doneSessions.filter((x) => x.school === themeSchool).length
    : 0;
  const [mainPriority, ...otherPriorities] = priorities;

  return (
    <div>
      <PageHero image={MODULE_BANNERS["Tableau"]} eyebrow="Cockpit de progression" title="Mon tableau de bord">
        Ce que vous avez fait, ce qu'il reste à faire, et vos résultats.
      </PageHero>

      {/* Mon travail */}
      <Card className="p-6 rounded-[24px] border-0 shadow-none">
        <div className="flex items-center gap-2">
          <Gauge className="size-5 text-accent" aria-hidden />
          <h2 className="text-[1.65rem] leading-snug">Mon travail</h2>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((w) => {
            const ok = w.complete ?? w.done >= w.target;
            return (
              <li key={w.id}>
                <Link to={w.to} className="block rounded-[16px] bg-muted/50 p-4 transition-colors hover:bg-muted">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{w.label}</span>
                    <Badge className={ok ? "bg-success text-success-foreground" : "bg-amber-500 text-amber-950"}>
                      {ok ? "Terminé" : "À compléter"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-display text-2xl font-bold text-primary">{w.done}</span> / {w.targetLabel ?? `${w.target} attendu${w.target > 1 ? "s" : ""}`}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border" aria-hidden>
                    <div className={`h-full rounded-full ${ok ? "bg-success" : "bg-accent"}`} style={{ width: `${ok ? 100 : Math.min(100, (w.done / w.target) * 100)}%` }} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* À faire */}
      <Card className="mt-8 p-6 rounded-[24px] border-0 shadow-none" aria-labelledby="a-faire">
        <div className="flex items-center gap-2">
          <ListChecks className="size-5 text-accent" aria-hidden />
          <h2 id="a-faire" className="text-[1.65rem] leading-snug">À faire</h2>
        </div>
        {!mainPriority ? (
          <p className="mt-4 text-base text-muted-foreground">
            Tout est à jour : continuez à enchaîner des simulations complètes pour entretenir votre niveau.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {[mainPriority, ...otherPriorities].map((p, i) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Badge className={`w-fit ${LEVEL_STYLE[p.level].className}`}>{LEVEL_STYLE[p.level].label}</Badge>
                  <p className="text-base font-medium">{p.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.reason}</p>
                </div>
                <Button asChild variant={i === 0 ? "default" : "outline"} size="sm">
                  <Link to={p.to}>
                    {p.cta}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Mes résultats */}
      <section className="mt-8">
        <Card className="p-6 rounded-[24px] border-0 shadow-none">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-accent" aria-hidden />
            <h2 className="text-[1.65rem] leading-snug">Mes résultats aux simulations</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {trend !== null && scoreChange !== null
              ? Math.abs(scoreChange) >= 1
                ? `Évolution : ${trend >= 0 ? "+" : ""}${trend} percentiles entre votre première et votre dernière simulation.`
                : "Niveau stable sur vos simulations."
              : "Passez au moins deux simulations complètes pour voir votre progression."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label htmlFor="filtre-ecole" className="text-sm text-muted-foreground">École</label>
            <select
              id="filtre-ecole"
              value={themeSchool}
              onChange={(e) => setThemeSchool(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Toutes les écoles</option>
              {sessionSchools.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
            {selectedSchool ? (
              <Badge className={selectedSchool.ready ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                {selectedSchool.ready ? "Prêt" : "À retravailler"}
              </Badge>
            ) : null}
            {selectedSchool ? (
              <span className="flex items-center gap-2 rounded-full bg-muted/50 py-1 pl-3 pr-1 text-sm">
                Moyenne : P{selectedSchool.avg} (percentile) sur {selectedSchoolCount} entretien{selectedSchoolCount > 1 ? "s" : ""} achevé{selectedSchoolCount > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Le percentile mesure votre position : P80 signifie que votre note est meilleure que celle de 80 % des candidats. Ce n'est pas une note sur 100. Les barres par thème ci-dessous, elles, sont notées sur 100 (part des points obtenus).
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {schoolThemeScores.map((s) => (
              <ThemeRow key={s.theme} score={s} />
            ))}
          </ul>
        </Card>


      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm leading-snug text-muted-foreground">{label}</p>
    </div>
  );
}

function ThemeRow({ score }: { score: ThemeScore }) {
  const value = score.score;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base">{score.theme}</span>
        <span className="font-mono text-sm text-muted-foreground">
          {value === null ? "-" : `${value}/100`}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${value === null ? "bg-border" : value < 55 ? "bg-destructive" : value < 75 ? "bg-amber-500" : "bg-success"}`}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {score.worked}/{score.total} question(s) clé(s) travaillée(s)
        {score.toRework > 0 ? ` · ${score.toRework} à retravailler` : ""}
      </p>
    </li>
  );
}
