import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/vivaldi/PageHero";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Flag,
  Gauge,
  ListChecks,
  Mic,
  Sparkles,
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
  isValidCompletedSimulation,
  radarData,
  readinessScore,
  verdictOf,
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
  important: { label: "Prioritaire", className: "bg-amber-500 text-white" },
  consolidation: { label: "Consolidation", className: "bg-muted text-muted-foreground" },
};

function CockpitPage() {
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
  const readiness = readinessScore({ profile, career, sheets, experiences, newsTopics, supports, themeScores });

  const correctedQuestions = answers.filter((a) => verdictOf(a.ai_feedback) !== null).length;
  const validatedQuestions = answers.filter((a) => verdictOf(a.ai_feedback) === "Validé").length;
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

  const scored = themeScores.filter((s) => s.score !== null);
  const strongest = [...scored].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const weakest = [...scored].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

  return (
    <div>
      <PageHero image={MODULE_BANNERS["Tableau"]} eyebrow="Cockpit de progression" title="Mon tableau de bord">
        Où vous en êtes, ce qu'il faut travailler maintenant, et votre niveau thème par thème d'après les
        corrections du jury IA.
      </PageHero>

      {/* Indice de préparation + repères chiffrés */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="relative flex flex-col gap-4 overflow-hidden p-6 rounded-[24px] border-0 shadow-none">
          <div className="flex items-center gap-2">
            <Gauge className="size-5 text-accent" />
            <p className="text-[15px] font-semibold text-[var(--bleu-texte)]">Indice de préparation</p>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-primary">{readiness}</span>
            <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(readiness, 100)}%` }} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {readiness < 35
              ? "Vous êtes au tout début : concentrez-vous sur les modules de préparation."
              : readiness < 65
                ? "Bonne base de dossier. Il vous manque du volume d'entraînement oral."
                : readiness < 85
                  ? "Vous êtes en bonne voie : consolidez vos thèmes fragiles et enchaînez les simulations."
                  : "Vous êtes prêt : entretenez le niveau avec des simulations régulières."}
          </p>
        </Card>

        <Card className="relative overflow-hidden p-6 rounded-[24px] border-0 shadow-none lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" />
            <p className="text-[15px] font-semibold text-[var(--bleu-texte)]">Mes repères</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Metric value={`${correctedQuestions}`} label="questions clés corrigées" />
            <Metric value={`${validatedQuestions}`} label="réponses validées par le jury IA" />
            <Metric
              value={`${doneSessions.length}`}
              label={`simulation${doneSessions.length > 1 ? "s" : ""} complète${doneSessions.length > 1 ? "s" : ""} achevée${doneSessions.length > 1 ? "s" : ""}`}
            />
            <Metric
              value={bestPercentile ? `P${bestPercentile}` : "-"}
              label={
                lastPercentile
                  ? `meilleur percentile (dernier : P${lastPercentile})`
                  : "meilleur percentile en simulation"
              }
            />
          </div>
          {trend !== null && scoreChange !== null ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Évolution sur vos simulations :{" "}
              {Math.abs(scoreChange) >= 1 ? (
                <>
                  <span className={trend >= 0 ? "font-medium text-success" : "font-medium text-destructive"}>
                    {trend >= 0 ? "+" : ""}
                    {trend} percentiles
                  </span>{" "}
                  entre votre première et votre dernière simulation.
                </>
              ) : (
                "Niveau stable."
              )}
            </p>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Passez au moins deux simulations complètes pour visualiser votre progression.
            </p>
          )}
        </Card>
      </div>

      {/* À travailler en priorité */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="size-5 text-accent" />
          <h2 className="text-[1.65rem] leading-snug">À travailler en priorité</h2>
        </div>
        {priorities.length === 0 ? (
          <Card className="p-6 rounded-[24px] border-0 shadow-none">
            <p className="text-base text-muted-foreground">
              Tout est à jour : continuez à enchaîner des simulations complètes pour entretenir votre niveau.
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {priorities.map((p, index) => {
              const style = LEVEL_STYLE[p.level];
              return (
                <Card
                  key={p.id}
                  className="relative flex flex-col gap-3 overflow-hidden p-6 rounded-[24px] border-0 shadow-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <Badge className={style.className}>{style.label}</Badge>
                  </div>
                  <h3 className="text-[1.35rem] leading-snug">
                    <Link to={p.to} className="transition-colors hover:text-accent">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">{p.reason}</p>
                  <div className="mt-auto pt-1">
                    <Button asChild variant={p.level === "consolidation" ? "outline" : "default"}>
                      <Link to={p.to}>
                        {p.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Radar par thème */}
      <section className="mt-8 grid gap-5 lg:grid-cols-5">
        <Card className="relative overflow-hidden p-6 rounded-[24px] border-0 shadow-none lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Compass className="size-5 text-accent" />
              <h2 className="text-[1.65rem] leading-snug">Mon niveau par thème de l'entretien</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-accent" /> Mon niveau
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary" /> Objectif
              </span>
            </div>
          </div>
          <div className="mt-4 h-[340px] w-full">
            {!scored.length ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-base text-muted-foreground">
                Passez une simulation complète pour voir votre niveau par thème.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData(themeScores)} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="short" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Objectif"
                  dataKey="objectif"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.08}
                />
                <Radar
                  name="Mon niveau"
                  dataKey="score"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.28}
                />
              </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {`Chaque thème combine vos scores aux 3 dernières simulations complètes.
Écoles = critère École
Introspection = Présentation, Expériences et personnalité
Projet pro = Projet professionnel
Futur = votre projection
Aisance orale = Conduite de l’échange, Clarté, Gestion des situations déstabilisantes.
L’ouverture sur le monde et les épreuves propres à certaines écoles comptent dans votre percentile affiché à la fin de chaque entretien, mais ne sont pas affichés dans ce graphique.`}
          </p>
        </Card>

        <Card className="relative overflow-hidden p-6 rounded-[24px] border-0 shadow-none lg:col-span-2">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-accent" />
            <p className="text-[15px] font-semibold text-[var(--bleu-texte)]">Détail par thème</p>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {themeScores.map((s) => (
              <ThemeRow key={s.theme} score={s} />
            ))}
          </ul>
          {weakest && strongest ? (
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              Point fort : <span className="font-medium text-foreground">{strongest.theme}</span>. Point de
              vigilance : <span className="font-medium text-foreground">{weakest.theme}</span>.
            </p>
          ) : (
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              Passez une simulation complète pour voir votre niveau par thème.
            </p>
          )}
        </Card>
      </section>

      {/* Objectifs + prochaines actions */}
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="relative overflow-hidden p-6 rounded-[24px] border-0 shadow-none">
          <div className="flex items-center gap-2">
            <Flag className="size-5 text-accent" />
            <h2 className="text-[1.65rem] leading-snug">Mes objectifs</h2>
          </div>
          {objectives.length ? (
            <ol className="mt-4 flex flex-col gap-2">
              {objectives.map((school, i) => (
                <li key={school} className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-3 text-base">
                    <span className="font-mono text-xs text-accent">Choix {i + 1}</span>
                    {school}
                  </span>
                  {sheets.some((s) => s.school === school && isSheetFinished(s)) ? (
                    <Badge className="bg-success text-success-foreground">Fiche prête</Badge>
                  ) : (
                    <Badge variant="secondary">Fiche à finir</Badge>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-base text-muted-foreground">
              Renseignez vos écoles de cœur dans vos informations personnelles pour piloter votre préparation école
              par école.
            </p>
          )}
          <div className="mt-5">
            <Button variant="outline" asChild>
              <Link to="/informations-personnelles">Mettre à jour mes objectifs</Link>
            </Button>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 rounded-[24px] border-0 shadow-none">
          <div className="flex items-center gap-2">
            <Mic className="size-5 text-accent" />
            <h2 className="text-[1.65rem] leading-snug">Mon entraînement</h2>
          </div>
          <ul className="mt-4 flex flex-col gap-3 text-base">
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Supports d'entretien terminés</span>
              <span className="font-medium">{supports.filter(isSupportComplete).length}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Fiches écoles terminées</span>
              <span className="font-medium">{sheets.filter(isSheetFinished).length}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Réponses à retravailler</span>
              <span className="flex items-center gap-2 font-medium">
                {answers.filter((a) => verdictOf(a.ai_feedback) === "À retravailler").length}
                {answers.some((a) => verdictOf(a.ai_feedback) === "À retravailler") ? (
                  <AlertTriangle className="size-4 text-destructive" />
                ) : null}
              </span>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/partie-7">Questions clés</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/partie-8">Simulation complète</Link>
            </Button>
          </div>
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
