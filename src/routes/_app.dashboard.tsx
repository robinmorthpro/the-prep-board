import type { ComponentType } from "react";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  Gem,
  Lock,
  UserCircle,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Newspaper,
  MessageCircleQuestion,
  Mic,
  FileSignature,
  LayoutList,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { MODULE_BANNERS } from "@/components/vivaldi/module-banners";

import { useSession } from "@/hooks/useSession";
import { PARTS, PREP_PARTS, TRAIN_PARTS, TEST_MODE_PREMIUM_FREE, KEY_QUESTIONS, KNOWLEDGE, moduleNumber } from "@/lib/vivaldi-data";
import {
  computeProgress,
  useNewsTopics,
  isSheetFinished,
  isCareerDeepened,
  useCareerProject,
  useExperiences,
  useProfile,
  useSchoolSheets,
  useQuestionAnswers,
  useInterviewSessions,
  useInterviewSupports,
  isSupportComplete,
} from "@/lib/vivaldi-queries";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Mon parcours - The Prepboard" },
      { name: "description", content: "Visualisez les 8 étapes de votre préparation aux oraux et ce qu'il reste à débloquer." },
      { property: "og:title", content: "Mon parcours - The Prepboard" },
      { property: "og:description", content: "Suivez votre progression vers les oraux BCE et Ecricome." },
    ],
  }),
  component: Dashboard,
});

const PART_ICONS: Record<number, ComponentType<{ className?: string }>> = {
  1: UserCircle,
  2: Briefcase,
  3: GraduationCap,
  4: FolderOpen,
  5: Newspaper,
  6: FileSignature,
  7: MessageCircleQuestion,
  8: Mic,
};

const RESOURCE_SECTIONS = [
  { key: "personal", title: KNOWLEDGE.personal.title, description: "Comment se présenter et raconter qui vous êtes." },
  { key: "career", title: KNOWLEDGE.career.title, description: "Construire et défendre votre projet professionnel." },
  { key: "schools", title: KNOWLEDGE.schools.title, description: "Ce que chaque école attend de vous." },
  { key: "experiences", title: KNOWLEDGE.experiences.title, description: "Raconter vos expériences avec méthode." },
];

type ExpandedSection = "prep" | "train" | "resources" | null;

function Dashboard() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);
  const { data: career = null } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: newsTopics = [] } = useNewsTopics(user?.id);
  const { data: answers = [] } = useQuestionAnswers(user?.id);
  const { data: sessions = [] } = useInterviewSessions(user?.id);
  const { data: supports = [] } = useInterviewSupports(user?.id);

  const [expanded, setExpanded] = useState<ExpandedSection>(null);

  const progress = computeProgress(profile ?? null, experiences, career, sheets, newsTopics);
  const finishedSheets = sheets.filter(isSheetFinished).length;
  const submittedPct = Math.round(progress.submittedRatio * 100);
  const workedQuestions = answers.filter((a) => (a.answer ?? "").trim().length > 0).length;
  const finishedInterviews = sessions.filter((s) => s.status === "done").length;
  const totalKeyQuestions = KEY_QUESTIONS.length;
  const finishedSupports = supports.filter(isSupportComplete).length;

  const detail: Record<number, string> = {
    1: profile?.part1_completed ? "Informations complétées" : "À compléter",
    2: isCareerDeepened(career) ? "Projet professionnel travaillé" : "À travailler",
    3: `${finishedSheets} fiche(s) école terminée(s) sur ${sheets.length}`,
    4: `${submittedPct} % des expériences validées (75 % requis)`,
    5: `${progress.finishedNews} sujet(s) d'actualité terminé(s) sur ${newsTopics.length} (1 requis)`,
    6: `${finishedSupports} support(s) d'entretien terminé(s)`,
    7: `${workedQuestions} question(s) clé(s) travaillée(s)`,
    8: `${finishedInterviews} entretien(s) complet(s) passé(s)`,
  };

  const prepParts = PREP_PARTS;
  const trainParts = TRAIN_PARTS;

  const prepCompleted = prepParts.filter((p) => progress.unlocked[p.id]).length;
  const trainCompleted = trainParts.filter((p) => progress.unlocked[p.id]).length;

  // L'utilisateur peut s'entraîner s'il a déjà commencé, ou s'il a achevé au moins 3 modules de préparation.
  const hasStartedTraining = workedQuestions > 0 || finishedInterviews > 0 || trainCompleted > 0;
  const prepReadyForTraining = prepCompleted >= 3 || hasStartedTraining;

  const toggle = (section: ExpandedSection) => {
    setExpanded((current) => (current === section ? null : section));
  };

  return (
    <div>
      <header className="relative mb-8 overflow-hidden bg-ink">
        <img
          src={MODULE_BANNERS["Tableau"]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Dashboard de préparation</p>
          <h1 className="mt-2 max-w-3xl text-4xl text-primary-foreground">
            Bienvenue{profile?.first_name ? ` ${profile.first_name}` : ""} dans votre espace de préparation
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80">
            Le contenu de la préparation a été pensé par nos experts des oraux de motivation. Tout a été fait pour vous prendre par la main et vous guider jusqu'à ce que vous soyez prêt à réussir tous vos oraux.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
            Travaillez les sections les une après les autres et ne passez à la suite que quand vous considérez avoir achevé le travail sur celle en cours.
          </p>
        </div>
      </header>

      <Link
        to="/mon-tableau-de-bord"
        className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
      >
        <span>
          <span className="block text-[1.35rem] leading-snug">Mon tableau de bord</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Vos priorités du moment et votre niveau par thème d'entretien.
          </span>
        </span>
        <span className="label-mono shrink-0 text-[11px] text-accent">Ouvrir</span>
      </Link>

      <div className="grid gap-5 md:grid-cols-3">

        <SectionCard
          id="prep"
          step={1}
          icon={LayoutList}
          title="Je me prépare"
          to="/je-me-prepare"
          subtitle="Les 5 modules pour structurer votre profil et votre dossier."
          expanded={expanded === "prep"}
          onToggle={() => toggle("prep")}
          badge={`${prepCompleted}/${prepParts.length} modules achevés`}
        />
        <SectionCard
          id="train"
          step={2}
          icon={Mic}
          title="Je m'entraîne"
          to="/je-m-entraine"
          subtitle="Questions clés et simulations complètes pour le jour J."
          expanded={expanded === "train"}
          onToggle={() => toggle("train")}
          badge={`${trainCompleted}/${trainParts.length} modules achevés`}
          locked={!prepReadyForTraining}
          lockedReason="Commencez par 'Je me prépare' (au moins 3 modules) avant de vous entraîner."
        />
        <SectionCard
          id="resources"
          step={3}
          icon={BookOpen}
          title="Ressources théoriques"
          to="/ressources"
          subtitle="Les attentes du jury, réunies au même endroit."
          expanded={expanded === "resources"}
          onToggle={() => toggle("resources")}
          badge={`${RESOURCE_SECTIONS.length} fiches`}
        />
      </div>

      {expanded === "prep" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {prepParts.map((part) => renderModuleCard(part))}
        </div>
      )}

      {expanded === "train" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {trainParts.map((part) => renderModuleCard(part))}
        </div>
      )}

      {expanded === "resources" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {RESOURCE_SECTIONS.map((section) => (
            <Card
              key={section.key}
              className="relative flex flex-col gap-4 overflow-hidden p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-accent" />
              <div className="flex items-start justify-between gap-3">
                <BookOpen className="size-5 shrink-0 text-accent" />
                <Badge variant="secondary">Fiche</Badge>
              </div>
              <div>
                <h2 className="text-[1.65rem] leading-snug">
                  <Link to="/ressources" className="transition-colors hover:text-accent">
                    {section.title}
                  </Link>
                </h2>
                <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{section.description}</p>
              </div>
              <div className="mt-auto pt-1">
                <Button asChild>
                  <Link to="/ressources">Consulter la fiche</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  function renderModuleCard(part: (typeof PARTS)[number]) {
    const unlocked = progress.unlocked[part.id];
    const premiumLocked = part.premium && !progress.isPremium && !TEST_MODE_PREMIUM_FREE;
    const PartIcon = PART_ICONS[part.id];
    return (
      <Card
        key={part.id}
        className={`relative flex flex-col gap-4 overflow-hidden p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)] ${
          unlocked ? "" : "opacity-80"
        }`}
      >
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-[3px] ${unlocked ? "bg-accent" : "bg-border"}`}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display text-base font-bold ${
                unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {moduleNumber(part.id)}
            </span>
            <p className="label-mono text-[11px]">Module {moduleNumber(part.id)}</p>
          </div>
          {unlocked && part.id === 8 ? (
            <Badge variant="secondary">
              {finishedInterviews} entretien{finishedInterviews > 1 ? "s" : ""} achevé{finishedInterviews > 1 ? "s" : ""}
            </Badge>
          ) : unlocked && part.id === 7 ? (
            workedQuestions >= totalKeyQuestions ? (
              <Badge className="bg-success text-success-foreground">
                <Check className="size-3" /> Achevé
              </Badge>
            ) : (
              <Badge variant="secondary">
                {workedQuestions}/{totalKeyQuestions} questions terminées
              </Badge>
            )
          ) : unlocked && part.id === 6 ? (
            <Badge variant="secondary">
              {finishedSupports} support{finishedSupports > 1 ? "s" : ""} terminé{finishedSupports > 1 ? "s" : ""}
            </Badge>
          ) : unlocked ? (
            <Badge className="bg-success text-success-foreground">
              <Check className="size-3" /> Achevé
            </Badge>
          ) : premiumLocked ? (
            <Badge className="bg-premium text-premium-foreground">
              <Gem className="size-3" /> Premium
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Lock className="size-3" /> Verrouillé
            </Badge>
          )}
        </div>
        <div>
          <h2 className="flex items-start gap-2 text-[1.65rem] leading-snug">
            {PartIcon ? <PartIcon className="mt-1 size-5 shrink-0 text-accent" /> : null}
            {unlocked ? (
              <Link to={part.path} className="transition-colors hover:text-accent">
                {part.title}
              </Link>
            ) : (
              part.title
            )}
          </h2>
          <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{part.subtitle}</p>
        </div>
        {!unlocked ? <p className="text-base text-muted-foreground">{detail[part.id]}</p> : null}
        <div className="mt-auto pt-1">
          {unlocked ? (
            <Button asChild>
              <Link to={part.path}>{part.id === 8 ? "Je simule mes oraux" : "Je travaille ce module"}</Link>
            </Button>
          ) : premiumLocked && progress.premiumRequirementsMet ? (
            <Button variant="outline" asChild>
              <Link to="/premium">Débloquer la formule complète</Link>
            </Button>
          ) : (
            <Button variant="ghost" disabled>
              {detail[part.id]}
            </Button>
          )}
        </div>
      </Card>
    );
  }
}

function SectionCard({
  id,
  step,
  icon: Icon,
  title,
  to,
  subtitle,
  badge,
  expanded,
  onToggle,
  locked,
  lockedReason,
}: {
  id: ExpandedSection;
  step: number;
  icon: ComponentType<{ className?: string }>;
  title: string;
  to: string;
  subtitle: string;
  badge: string;
  expanded: boolean;
  onToggle: () => void;
  locked?: boolean;
  lockedReason?: string;
}) {
  return (
    <div
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border p-6 text-left shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)] ${
        expanded ? "border-accent/50 bg-accent/5" : "border-border bg-card"
      } ${locked ? "opacity-70" : ""}`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] transition-colors ${expanded ? "bg-accent" : locked ? "bg-border" : "bg-border group-hover:bg-accent/50"}`}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display text-base font-bold ${
              locked ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {step}
          </span>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              locked ? "bg-muted/70 text-muted-foreground" : "bg-accent/10 text-accent"
            }`}
          >
            <Icon className="size-5" />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{badge}</Badge>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Replier les sous-sections" : "Voir les sous-sections"}
            disabled={locked}
            className={`rounded-md p-1.5 transition-colors ${
              locked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
            }`}
          >
            {expanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        </div>
      </div>
      <div>
        <h2 className="text-[1.65rem] leading-snug">
          {locked ? (
            <span className="flex items-center gap-2">
              <Lock className="size-5 text-muted-foreground" />
              {title}
            </span>
          ) : (
            <Link
              to={to}
              className="flex items-center gap-2 transition-colors hover:text-accent"
            >
              {title}
            </Link>
          )}
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      {locked && lockedReason ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          {lockedReason}
        </p>
      ) : null}
      <div className="mt-auto pt-1">
        <button
          type="button"
          onClick={onToggle}
          disabled={locked}
          className={`inline-flex items-center gap-2 text-sm font-medium ${
            locked ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:text-accent"
          }`}
        >
          {locked ? "Bientôt disponible" : expanded ? "Replier" : "Voir les sous-sections"}
          <ChevronRight className={`size-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>
    </div>
  );
}
