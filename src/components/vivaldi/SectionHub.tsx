import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/vivaldi/PageHero";

import { useSession } from "@/hooks/useSession";
import { PARTS, TEST_MODE_PREMIUM_FREE, KEY_QUESTIONS, moduleNumber } from "@/lib/vivaldi-data";
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

export interface SectionHubProps {
  title: string;
  subtitle: string;
  banner: string;
  parts: (typeof PARTS)[number][];
}

export function SectionHub({ title, subtitle, banner, parts }: SectionHubProps) {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);
  const { data: career = null } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: newsTopics = [] } = useNewsTopics(user?.id);
  const { data: answers = [] } = useQuestionAnswers(user?.id);
  const { data: sessions = [] } = useInterviewSessions(user?.id);
  const { data: supports = [] } = useInterviewSupports(user?.id);

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

  return (
    <div>
      <PageHero image={banner} eyebrow="Dashboard de préparation" title={title}>
        {subtitle}
      </PageHero>

      <div className="grid gap-5 md:grid-cols-2">{parts.map((part) => renderModuleCard(part))}</div>
    </div>
  );

  function renderModuleCard(part: (typeof PARTS)[number]) {
    const unlocked = progress.unlocked[part.id];
    const premiumLocked = part.premium && !progress.isPremium && !TEST_MODE_PREMIUM_FREE;
    const PartIcon = PART_ICONS[part.id];
    return (
      <Card
        key={part.id}
        className={`relative flex flex-col gap-4 overflow-hidden p-6 rounded-[24px] border-0 shadow-none ${
          unlocked ? "" : "opacity-80"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-display text-base font-bold ${
                unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {moduleNumber(part.id)}
            </span>
            <p className="text-[15px] font-semibold text-[var(--bleu-texte)]">Module {moduleNumber(part.id)}</p>
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
