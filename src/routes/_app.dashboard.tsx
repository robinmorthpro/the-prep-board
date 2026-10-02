import type { ComponentType, ReactNode } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import heroImg from "@/assets/site/repetition.jpg";
import boardImg from "@/assets/site/hec-jouy.jpg";
import infoImg from "@/assets/site/campus-paris.jpg";
import prepImg from "@/assets/site/table-entretien.jpg";
import trainImg from "@/assets/site/hero-oral.jpg";
import resImg from "@/assets/site/amphi-vide.jpg";

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

  const firstName = profile?.first_name?.trim();
  const prepRatio = prepParts.length ? prepCompleted / prepParts.length : 0;
  const trainRatio = trainParts.length ? trainCompleted / trainParts.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] text-white">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: "60% 30%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,18,32,0.95) 0%, rgba(11,18,32,0.82) 45%, rgba(11,18,32,0.35) 100%)",
          }}
        />
        <div className="relative p-6 md:p-12">
          <div className="flex max-w-[760px] flex-col gap-5">
            <h1 className="m-0 text-[36px] font-medium leading-[1.02] tracking-[-0.045em] text-white md:text-[56px]">
              {firstName
                ? `${firstName}, bienvenue dans votre espace de préparation`
                : "Bienvenue dans votre espace de préparation"}
            </h1>
            <p className="m-0 text-[17px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">
              Le contenu de la préparation a été pensé par nos experts des oraux de motivation. Tout a été fait pour vous prendre par la main et vous guider jusqu'à ce que vous soyez prêt à réussir tous vos oraux.
            </p>
            <p className="m-0 text-[17px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">
              Travaillez les sections les unes après les autres et ne passez à la suite que quand vous considérez avoir achevé le travail sur celle en cours.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <PhotoCard
          to="/mon-tableau-de-bord"
          image={boardImg}
          marker={<CardIcon>{BOARD_ICON}</CardIcon>}
          title="Tableau de bord"
          text="Vos priorités du moment et votre niveau par thème d'entretien."
          action="Ouvrir"
        />
        <PhotoCard
          to="/informations-personnelles"
          image={infoImg}
          marker={<CardIcon>{USER_ICON}</CardIcon>}
          title="Informations personnelles"
          text="Les réponses à cette section permettront de personnaliser la suite de votre préparation."
          action="Ouvrir"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard
          step={1}
          image={prepImg}
          title="Je me prépare"
          to="/je-me-prepare"
          subtitle="Les 5 modules pour structurer votre profil et votre dossier."
          expanded={expanded === "prep"}
          onToggle={() => toggle("prep")}
          status={`${prepCompleted}/${prepParts.length} modules achevés`}
          done={prepCompleted === prepParts.length}
          ratio={prepRatio}
        />
        <SectionCard
          step={2}
          image={trainImg}
          title="Je m'entraîne"
          to="/je-m-entraine"
          subtitle="Questions clés et simulations complètes pour le jour J."
          expanded={expanded === "train"}
          onToggle={() => toggle("train")}
          status={`${trainCompleted}/${trainParts.length} modules achevés`}
          done={trainCompleted === trainParts.length}
          ratio={trainRatio}
          locked={!prepReadyForTraining}
          lockedReason="Commencez par 'Je me prépare' (au moins 3 modules) avant de vous entraîner."
        />
        <SectionCard
          step={3}
          image={resImg}
          title="Ressources théoriques"
          to="/ressources"
          subtitle="Les attentes du jury, réunies au même endroit."
          expanded={expanded === "resources"}
          onToggle={() => toggle("resources")}
          status={`${RESOURCE_SECTIONS.length} fiches`}
        />
      </div>

      {expanded === "prep" && (
        <div className="grid gap-4 md:grid-cols-2">
          {prepParts.map((part) => renderModuleCard(part))}
        </div>
      )}

      {expanded === "train" && (
        <div className="grid gap-4 md:grid-cols-2">
          {trainParts.map((part) => renderModuleCard(part))}
        </div>
      )}

      {expanded === "resources" && (
        <div className="grid gap-4 md:grid-cols-2">
          {RESOURCE_SECTIONS.map((section) => (
            <Card key={section.key} className="flex flex-col gap-4 rounded-[24px] border-0 p-7 shadow-none">
              <div className="flex items-start justify-between gap-3">
                <BookOpen className="size-5 shrink-0 text-accent" />
                <Badge variant="secondary">Fiche</Badge>
              </div>
              <div>
                <h2 className="text-[26px] font-medium leading-[1.1] tracking-[-0.035em]">
                  <Link to="/ressources" className="transition-colors hover:text-accent">
                    {section.title}
                  </Link>
                </h2>
                <p className="mt-2 text-[18px] leading-relaxed text-muted-foreground">{section.description}</p>
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
        className={`relative flex flex-col gap-4 overflow-hidden rounded-[24px] border-0 p-7 shadow-none ${
          unlocked ? "" : "opacity-80"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] text-[18px] font-semibold ${
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
          <h2 className="flex items-start gap-2 text-[26px] font-medium leading-[1.1] tracking-[-0.035em]">
            {PartIcon ? <PartIcon className="mt-1 size-5 shrink-0 text-accent" /> : null}
            {unlocked ? (
              <Link to={part.path} className="transition-colors hover:text-accent">
                {part.title}
              </Link>
            ) : (
              part.title
            )}
          </h2>
          <p className="mt-1.5 text-[18px] leading-relaxed text-muted-foreground">{part.subtitle}</p>
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

const BOARD_ICON = <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />;
const USER_ICON = (
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </>
);

function CardIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CardPhoto({ image, marker }: { image: string; marker: ReactNode }) {
  return (
    <div className="relative h-[200px]">
      <img src={image} alt="" className="block size-full object-cover" />
      <span className="absolute left-5 top-5 inline-flex size-11 items-center justify-center rounded-[14px] bg-[var(--ink)] text-[20px] font-semibold text-white">
        {marker}
      </span>
    </div>
  );
}

function PhotoCard({
  to,
  image,
  marker,
  title,
  text,
  action,
}: {
  to: string;
  image: string;
  marker: ReactNode;
  title: string;
  text: string;
  action: string;
}) {
  return (
    <Link to={to} className="group flex flex-col overflow-hidden rounded-[24px] bg-white text-[var(--ink)]">
      <CardPhoto image={image} marker={marker} />
      <div className="flex flex-1 flex-col gap-[14px] p-7">
        <h2 className="mt-1.5 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[32px]">{title}</h2>
        <p className="m-0 text-[18px] text-[var(--graphite)]">{text}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[17px] font-semibold group-hover:text-[var(--bleu)]">
          {action}
          <Arrow />
        </span>
      </div>
    </Link>
  );
}

function SectionCard({
  step,
  image,
  title,
  to,
  subtitle,
  status,
  done,
  ratio,
  expanded,
  onToggle,
  locked,
  lockedReason,
}: {
  step: number;
  image: string;
  title: string;
  to: string;
  subtitle: string;
  status: string;
  done?: boolean;
  ratio?: number;
  expanded: boolean;
  onToggle: () => void;
  locked?: boolean;
  lockedReason?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[24px] bg-white text-[var(--ink)] ${
        expanded ? "ring-2 ring-[var(--ciel)]" : ""
      } ${locked ? "opacity-70" : ""}`}
    >
      <CardPhoto image={image} marker={step} />
      <div className="flex flex-1 flex-col gap-[14px] p-7">
        <span className={`text-[16px] font-semibold ${done ? "text-[var(--success)]" : "text-[var(--graphite)]"}`}>
          {done ? (
            <span className="mr-1.5 inline-flex align-[-3px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l5 5 9-10" />
              </svg>
            </span>
          ) : null}
          {status}
        </span>
        {ratio !== undefined ? (
          <div className="h-1.5 rounded-full bg-[var(--paper)]">
            <div
              className="h-full rounded-full bg-[var(--ciel)]"
              style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }}
            />
          </div>
        ) : (
          <div className="h-1.5" />
        )}
        <h2 className="mt-1.5 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[32px]">
          {locked ? (
            <span className="flex items-center gap-2">
              <Lock className="size-5 text-muted-foreground" />
              {title}
            </span>
          ) : (
            <Link to={to} className="transition-colors hover:text-[var(--bleu)]">
              {title}
            </Link>
          )}
        </h2>
        <p className="m-0 text-[18px] text-[var(--graphite)]">{subtitle}</p>
        {locked && lockedReason ? (
          <p className="flex items-center gap-2 text-[15px] text-[var(--graphite)]">
            <Lock className="size-4 shrink-0" />
            {lockedReason}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          disabled={locked}
          className={`mt-auto inline-flex items-center gap-2 self-start pt-2 text-[17px] font-semibold ${
            locked ? "cursor-not-allowed text-[var(--graphite)]" : "hover:text-[var(--bleu)]"
          }`}
        >
          {locked ? "Bientôt disponible" : expanded ? "Replier" : "Voir les sous-sections"}
          <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>
            <Arrow />
          </span>
        </button>
      </div>
    </div>
  );
}
