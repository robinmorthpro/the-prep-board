import {
  DebriefHeader,
  InterviewDebrief,
  InterviewTranscript,
  positioningInfo,
} from "@/components/vivaldi/InterviewDebrief";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ConversationProvider } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Volume2, VolumeX, Play, RotateCcw, Trash2, ChevronDown, ChevronRight, Mic, Square, Download, Send, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { IntroPanel } from "@/components/vivaldi/StartPanel";
import { useSession } from "@/hooks/useSession";
import { useJuryAgent } from "@/hooks/useJuryAgent";
import { supabase } from "@/integrations/supabase/client";
import { debriefInterview } from "@/lib/ai.functions";
import {
  useCareerProject,
  useExperiences,
  useInterviewSessions,
  useNewsTopics,
  useProfile,
  useSchoolSheets,
} from "@/lib/vivaldi-queries";
import { INTERVIEW_VARIANTS, type InterviewVariant } from "@/lib/interview-kb";
import {
  buildFirstMessage,
  buildClermontImpactVariables,
  difficultiesFor,
  EMLYON_CARDS_PHRASE,
  getSchoolInterviewConfig,
  phaseScheduleFor,
  promptFor,
  simulatedMinutes,
  type PhaseTiming,
} from "@/lib/school-interviews";
import {
  CLERMONT_AXIS_OFFER_RE,
  INVITATION_RE,
  isImposedQuestionAsked,
  juryTurnRescueDue,
  NO_ANSWER_STEPS,
  noAnswerStepDue,
  normalizeInterviewText,
} from "@/lib/interview-text";

import { extractSupportText } from "@/lib/support-text.functions";
import { InterviewBriefDialog } from "@/components/vivaldi/InterviewBriefDialog";
import { juryAgentStatus } from "@/lib/elevenlabs.functions";
import { difficultyBlock } from "@/lib/elevenlabs-agent-prompt";

import { downloadInterviewPdf } from "@/lib/transcript-pdf";
import type { InterviewTurn } from "@/lib/vivaldi-queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PartNav } from "@/components/vivaldi/PartNav";
import { schoolLogo } from "@/lib/school-logos";
import { schoolPhotoOrFallback } from "@/components/vivaldi/school-photos";
import { pickGemPersona } from "@/lib/gem-kb";
import { pickEssecSituation } from "@/lib/essec-kb";
import { drawEmlyonCards } from "@/lib/emlyon-kb";
import { pickEdhecWord } from "@/lib/edhec-kb";
import { drawMontpellierSituations, type MontpellierSituation } from "@/lib/montpellier-kb";
import { drawKedgeCards } from "@/lib/kedge-kb";
import { INSEEC_IMAGES, type InseecImage } from "@/lib/inseec-kb";
import type { ImpactAxis } from "@/lib/esc-clermont-kb";



export const Route = createFileRoute("/_app/partie-8")({
  head: () => ({
    meta: [
      { title: "Module 7 - Mon entraînement illimité | The Prepboard" },
      { name: "description", content: "Simulation d'entretien en conditions réelles, jury en voix off et débrief IA." },
      { property: "og:title", content: "Je m'entraîne à l'oral sans limite | The Prepboard" },
      { property: "og:description", content: "Entretien complet simulé pour les oraux BCE et Ecricome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Part7Page,
});

type Turn = InterviewTurn;
/** Libellé du format d'entretien tel qu'il est présenté au candidat. */
function formatLabel(format?: string | null) {
  return format === "special" ? "Format spécifique de l'école" : "Entretien classique";
}

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

/** « 18 septembre 2026 - 17:04 », tel qu'affiché dans le bandeau du débrief. */
function sessionDate(iso?: string | null) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} - ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}


/** Libellé lisible du niveau de difficulté joué. */
function difficultyLabel(code?: string | null) {
  return INTERVIEW_VARIANTS.find((v) => v.code === code)?.label ?? "Entretien classique - jury neutre";
}

/** Attitude du jury seule (« jury neutre »), sans répéter le format de l'entretien. */
function juryLabel(code?: string | null) {
  const parts = difficultyLabel(code).split(/\s+[-–-]\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}

/** Percentile relevé dans le débrief du jury (format « P67 - … »). */
function percentileOf(debrief?: string | null) {
  const m = debrief?.match(/\bP(\d{1,3})\b/);
  return m ? `P${m[1]}` : null;
}

/** Le SDK ElevenLabs exige que `useConversation` soit sous son provider. */
function PillToggle({
  on,
  disabled,
  onClick,
  children,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-3 rounded-full bg-[#E6EEFF] py-[10px] pl-[10px] pr-[18px] text-[17px] font-medium text-[var(--ink)] disabled:opacity-60 md:text-[20px]"
    >
      <span className={`relative inline-block h-[26px] w-[44px] rounded-full transition-colors ${on ? "bg-[#2E46C8]" : "bg-[#AEB8C9]"}`}>
        <span className={`absolute top-[3px] size-5 rounded-full bg-white transition-all ${on ? "right-[3px]" : "left-[3px]"}`} />
      </span>
      {children}
    </button>
  );
}

function Part7Page() {
  return (
    <ConversationProvider>
      <Part7 />
    </ConversationProvider>
  );
}

function Part7() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: career } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);
  const { data: newsTopics = [] } = useNewsTopics(user?.id);
  const readSupport = useServerFn(extractSupportText);

  const askDebrief = useServerFn(debriefInterview);

  const queryClient = useQueryClient();
  const { data: sessions = [] } = useInterviewSessions(user?.id);
  // Un entretien n'apparaît dans l'historique qu'une fois terminé (débrief produit).
  const finishedSessions = useMemo(() => sessions.filter((s) => Boolean(s.debrief)), [sessions]);
  const [openSession, setOpenSession] = useState<string | null>(null);
  const [historySchool, setHistorySchool] = useState<string | null>(null);
  const historySchools = useMemo(() => {
    const map = new Map<string, number>();
    finishedSessions.forEach((s) => {
      const key = s.school || "École non précisée";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([school, count]) => ({ school, count }));
  }, [finishedSessions]);
  const visibleSessions = useMemo(
    () =>
      historySchool
        ? finishedSessions.filter((s) => (s.school || "École non précisée") === historySchool)
        : [],
    [finishedSessions, historySchool],
  );

  const [variant, setVariant] = useState<InterviewVariant>("classique");
  const [school, setSchool] = useState("");
  // Mode de passation : à l'oral (jury vocal) ou à l'écrit (utile pour tester
  // un entretien complet sans micro : le jury répond en texte).
  const [mode, setMode] = useState<"voice" | "text">("voice");
  // MODE TEST ÉCRIT — paliers de silence forcés à l'écrit (à retirer avec le mode écrit).
  const [testSilenceEnabled, setTestSilenceEnabled] = useState(false);
  const [draft, setDraft] = useState("");
  // Le format, la durée, le déroulé et le support exigé découlent de l'école choisie.
  const config = useMemo(() => getSchoolInterviewConfig(school), [school]);
  const hasDifficulties = difficultiesFor(config).length > 0;

  const checkAgent = useServerFn(juryAgentStatus);
  const { data: agentState } = useQuery({
    queryKey: ["jury_agent_status", school],
    enabled: !!user && !!school,
    queryFn: () => checkAgent({ data: { school } }),
  });

  const [briefOpen, setBriefOpen] = useState(false);
  const [support, setSupport] = useState<{ path: string; label: string; text: string } | null>(null);
  const supportRef = useRef<{ path: string; label: string; text: string } | null>(null);
  const inseecImageRef = useRef<InseecImage | null>(null);
  // Entretien coupé en cours de route : le transcript reste exploitable.
  const [interrupted, setInterrupted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "debriefing" | "done">("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  // emlyon : les 4 cartes sont tirées côté app et affichées à l'écran pendant
  // l'épreuve des cartes uniquement (après la présentation, avant l'échange libre).
  const [emlyonCards, setEmlyonCards] = useState<ReturnType<typeof drawEmlyonCards> | null>(null);
  const [cardsStage, setCardsStage] = useState<"before" | "cards" | "after">("before");
  // KEDGE : les 5 cartes du Révélateur sont tirées côté app et restent
  // affichées du début à la fin de l'entretien.
  const [kedgeCards, setKedgeCards] = useState<ReturnType<typeof drawKedgeCards> | null>(null);
  // EDHEC : le mot imposé est tiré côté app et affiché pendant la présentation
  // improvisée uniquement, jusqu'à la bascule vers l'entretien individuel.
  const [edhecWord, setEdhecWord] = useState<string | null>(null);
  const [edhecStage, setEdhecStage] = useState<"word" | "after">("word");
  const [edhecScreenPhase, setEdhecScreenPhase] = useState<"hidden" | "preparing" | "presenting">("hidden");
  const [edhecPrepRemaining, setEdhecPrepRemaining] = useState(59);
  const [edhecPresentationRemaining, setEdhecPresentationRemaining] = useState(240);
  // Montpellier BS : les situations sont tirées côté app ; le candidat choisit
  // lui-même celle qu'il développe, et le jury en est informé par le contexte.
  const [mbsPool, setMbsPool] = useState<ReturnType<typeof drawMontpellierSituations> | null>(null);
  const [mbsUsed, setMbsUsed] = useState<Set<string>>(new Set());
  const [mbsActive, setMbsActive] = useState<MontpellierSituation | null>(null);
  const mbsActiveRef = useRef<MontpellierSituation | null>(null);
  // INSEEC : un seul choix d'image en partie 1 ; le bloc disparaît dès que le
  // jury annonce le passage à l'entretien classique (partie 2).
  const [inseecChosen, setInseecChosen] = useState<InseecImage | null>(null);
  const [inseecDone, setInseecDone] = useState(false);
  // ESC Clermont BS : l'axe retenu détermine l'une des trois questions tirées
  // avant le démarrage et déjà transmises au jury.
  // L'écoute souple de l'axe ne s'arme qu'après que le jury a proposé le
  // choix (« choisissez un axe ») : un « profit » dit dans le pitch ne
  // déclenche rien.
  const clermontAxisOfferedRef = useRef(false);
  const clermontAxisSentRef = useRef(false);
  const clermontAxisRef = useRef<ImpactAxis | null>(null);
  const clermontQuestionsRef = useRef<Record<ImpactAxis, string>>({ people: "", planet: "", profit: "" });
  const clermontRescueDoneRef = useRef(false);
  // emlyon : consigne du tirage en attente de vérification sur la prise de
  // parole suivante du jury (secours envoyé une seule fois).
  const emlyonCardsInstructionRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState("");
  const [closed, setClosed] = useState(false);
  const closedRef = useRef(false);
  closedRef.current = closed;
  const [complete, setComplete] = useState(true);
  const sessionIdRef = useRef<string | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const questionRef = useRef("");
  questionRef.current = question;
  const askedAtRef = useRef<string | null>(null);
  const [phaseTimings, setPhaseTimings] = useState<PhaseTiming[]>([]);
  const phaseTimingsRef = useRef<PhaseTiming[]>([]);
  // Deux prises de parole du jury à la suite sont concaténées en un seul tour.
  const answeredSinceRef = useRef(true);
  // emlyon : l'épreuve des cartes est déclenchée par l'application.
  const emlyonTriggeredRef = useRef(false);
  // emlyon : on repère le tour où le jury a demandé la présentation.
  const emlyonPresentationAskedRef = useRef(false);
  // Secours limité quand le jury rend la main sans poser de question.
  const mainRenduRef = useRef(0);
  // Nombre de prises de parole du jury (le tout premier message ne déclenche
  // jamais le secours « main rendue »).
  const juryMessageCountRef = useRef(0);
  // Une consigne de régie vient d'être envoyée : le jury enchaîne, pas de secours.
  const nudgeSentRef = useRef(false);
  // Le secours n'est armé qu'après 4 s sans nouveau message du jury.
  const handRescueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Filet unique : le jury doit parler après une réponse du candidat OU après
  // une consigne envoyée par l'application.
  const lastAnswerAtRef = useRef<number | null>(null);
  const lastNudgeAtRef = useRef<number | null>(null);
  const lastJuryAtRef = useRef<number | null>(null);
  const juryTurnRescuedForRef = useRef<number | null>(null);

  // Paliers de silence du candidat déjà déclenchés depuis sa dernière réponse.
  const noAnswerStepsDoneRef = useRef(0);
  // Début du silence du candidat : première prise de parole du jury depuis sa
  // dernière réponse. Les relances du jury ne repoussent pas les paliers.
  const silenceSinceRef = useRef<number | null>(null);
  // Dernière phase démarrée par l'application : les 30 s qui suivent sont un
  // temps de réflexion accordé, sans relance de silence.
  const lastPhaseStartAtRef = useRef<number | null>(null);
  // État de pause du palier au tour précédent, pour repartir proprement.
  const silencePausedRef = useRef(false);
  // Arrêt volontaire (« Terminer l'entretien ») : onDisconnect ne doit alors
  // ni toaster ni marquer l'entretien comme interrompu.
  const voluntaryStopRef = useRef(false);
  // Valeurs courantes des phases spéciales, lisibles depuis le minuteur.
  const edhecStageRef = useRef<"word" | "after">("word");
  edhecStageRef.current = edhecStage;
  const edhecScreenPhaseRef = useRef<"hidden" | "preparing" | "presenting">("hidden");
  edhecScreenPhaseRef.current = edhecScreenPhase;
  const cardsStageRef = useRef<"before" | "cards" | "after">("before");
  cardsStageRef.current = cardsStage;

  const schoolOptions = useMemo(() => {
    const fromSheets = sheets.map((s) => s.school).filter(Boolean);
    const targets = profile?.target_schools ?? [];
    return Array.from(new Set([...fromSheets, ...targets]));
  }, [sheets, profile]);

  useEffect(() => {
    if (!school && schoolOptions.length) setSchool(schoolOptions[0]!);
  }, [school, schoolOptions]);

  // Chronomètre de l'entretien, calé sur la durée simulée de l'école.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running" || config.school !== "EDHEC" || edhecScreenPhase !== "preparing") return;
    if (edhecPrepRemaining <= 0) {
      setEdhecScreenPhase("presenting");
      setEdhecPresentationRemaining(240);
      // La présentation EDHEC est mesurée depuis la fin de la préparation.
      startPhase("edhec-presentation", "Présentation EDHEC");
      return;
    }
    const id = setTimeout(() => setEdhecPrepRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(id);
  }, [config.school, edhecPrepRemaining, edhecScreenPhase, phase]);

  useEffect(() => {
    if (phase !== "running" || config.school !== "EDHEC" || edhecScreenPhase !== "presenting") return;
    if (edhecPresentationRemaining <= 0) return;
    const id = setTimeout(() => setEdhecPresentationRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(id);
  }, [config.school, edhecPresentationRemaining, edhecScreenPhase, phase]);


  const context = useMemo(() => {
    const sheet = sheets.find((s) => s.school === school);
    const sheetItems = (sheet?.items ?? []).filter((i) => (i.name ?? "").trim() || (i.description ?? "").trim());
    return {
      school: school || "école non précisée",
      studentName: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Candidat",
      prepa: [profile?.prepa_class, profile?.prepa_lycee].filter(Boolean).join(" - "),
      careerProject: career
        ? [
            `Métier / domaine : ${career.job_or_field}`,
            `Intitulés de poste visés : ${career.job_names}`,
            `Secteur : ${career.sector}`,
            `Description : ${career.description}`,
            `Rôle en entreprise : ${career.company_role}`,
            `Entreprises cibles : ${career.companies}`,
            `Qualités : ${career.qualities}`,
            `Actualité : ${career.news}`,
            `Informations complémentaires : ${career.extra_info}`,
          ]
            .filter((l) => l.split(" : ")[1]?.trim())
            .join("\n")
        : "",
      schoolSheet: sheet
        ? [
            `Baseline : ${sheet.baseline}`,
            `Création : ${sheet.founded_year} - Direction : ${sheet.director}`,
            `Campus : ${sheet.campuses}`,
            ...sheetItems.map(
              (i) =>
                `- ${i.kind} : ${i.name}\n  Ce qu'il en sait : ${i.description}\n  Pourquoi ça l'intéresse : ${i.why}`,
            ),
            sheet.generic_other ? `Autres éléments retenus : ${sheet.generic_other}` : "",
          ]
            .filter((l) => l.trim())
            .join("\n")
        : "",
      experiences: experiences
        .filter((e) => (e.name ?? "").trim() && ((e.context ?? "").trim() || (e.anecdotes ?? []).length))
        .map((e) => {
          const anecdotes = (e.anecdotes ?? [])
            .filter((a) => (a.detail ?? "").trim())
            .map(
              (a) =>
                `  • ${a.title ? `${a.title} : ` : ""}${a.detail} / ce que ça dit : ${a.learning} / lien : ${a.link}`,
            )
            .join("\n");
          return [
            `- ${e.name} (${e.category}, ${e.start_date} → ${e.end_date})`,
            e.context ? `Contexte : ${e.context}` : "",
            anecdotes ? `Anecdotes travaillées :\n${anecdotes}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n"),
      newsTopics: newsTopics
        .filter((t) => (t.title ?? "").trim())
        .map((t) =>
          [
            `- ${t.title}${t.event_date ? ` (${t.event_date})` : ""}`,
            t.why_important ? `Pourquoi c'est important : ${t.why_important}` : "",
            t.stakes ? `Enjeux : ${t.stakes}` : "",
            t.personal_interest ? `Pourquoi ça l'intéresse : ${t.personal_interest}` : "",
            t.interview_link ? `Lien à faire en entretien : ${t.interview_link}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        )
        .join("\n\n"),
    };
  }, [school, profile, career, sheets, experiences, newsTopics]);

  // Le jury ne reçoit AUCUN élément des modules : comme le jour J, il n'a que
  // le document remis par le candidat. Le débrief, lui, garde `context` complet.



  async function persist(nextTurns: Turn[], status: string, debriefText = "") {
    if (!user) return;
    try {
      if (!sessionIdRef.current) {
        const insertPayload = {
          user_id: user.id,
          school,
          format: config.format,
          difficulty: hasDifficulties ? variant : "",
          turns: nextTurns,
          status,
          debrief: debriefText,
          support_path: supportRef.current?.path ?? "",
          support_label: supportRef.current?.label ?? "",
          support_text: supportRef.current?.text ?? "",
          inseec_image: inseecImageRef.current?.description ?? "",
          phase_timings: phaseTimingsRef.current,
        };
        const { data, error } = await supabase
          .from("interview_sessions")
          .insert(insertPayload)

          .select("id")
          .single();
        if (error) throw error;
        sessionIdRef.current = data.id;
      } else {
        const { error } = await supabase
          .from("interview_sessions")
          .update({ turns: nextTurns, phase_timings: phaseTimingsRef.current, status, debrief: debriefText, updated_at: new Date().toISOString() })
          .eq("id", sessionIdRef.current);
        if (error) throw error;
      }
      void queryClient.invalidateQueries({ queryKey: ["interview_sessions", user.id] });
    } catch (error) {
      console.error(error);
    }
  }

  async function removeSession(id: string) {
    const { error } = await supabase.from("interview_sessions").delete().eq("id", id);
    if (error) {
      toast.error("Suppression impossible.");
      return;
    }
    if (sessionIdRef.current === id) sessionIdRef.current = null;
    void queryClient.invalidateQueries({ queryKey: ["interview_sessions", user?.id] });
    toast.success("Entraînement supprimé.");
  }

  /** Consigne de régie envoyée par l'application : le jury enchaîne aussitôt. */
  function sendNudge(instruction: string, options?: { rescue: boolean }) {
    nudgeSentRef.current = true;
    // La relance du filet ne crée pas une nouvelle occasion de rattrapage.
    if (!options?.rescue) lastNudgeAtRef.current = Date.now();
    if (handRescueTimerRef.current) {
      clearTimeout(handRescueTimerRef.current);
      handRescueTimerRef.current = null;
    }
    agent.nudge(instruction);
  }

  /**
   * Démarrage de phase décidé par l'application. On mémorise l'instant : les
   * 30 s qui suivent sont un temps de réflexion accordé au candidat, sans
   * relance de silence.
   */
  function startPhase(id: string, label: string) {
    lastPhaseStartAtRef.current = Date.now();
    agent.markPhaseStart(id, label);
  }


  function showEdhecPresentationTimer() {
    if (edhecScreenPhaseRef.current !== "preparing") return;
    setEdhecScreenPhase("presenting");
    setEdhecPresentationRemaining(240);
    startPhase("edhec-presentation", "Présentation EDHEC");
  }

  // Les prises de parole qui rendent légitimement la main sans question sont
  // listées dans INVITATION_RE (`@/lib/interview-text`).


  /** Le jury vient de parler : on affiche sa question et on détecte la clôture. */
  function handleJuryQuestion(text: string) {
    juryMessageCountRef.current += 1;
    lastJuryAtRef.current = Date.now();
    // Début du silence du candidat : seule la PREMIÈRE prise de parole du jury
    // depuis sa dernière réponse compte, sinon les relances repoussent les paliers.
    if (silenceSinceRef.current === null) silenceSinceRef.current = Date.now();
    const normalized = normalizeInterviewText(text);
    // Le jury enchaîne parfois transition puis question en deux messages :
    // tout nouveau message annule le secours en attente.
    if (handRescueTimerRef.current) {
      clearTimeout(handRescueTimerRef.current);
      handRescueTimerRef.current = null;
    }
    // Tant que le candidat n'a pas répondu, les prises de parole du jury
    // s'ajoutent au même tour au lieu de s'écraser.
    const merged = !answeredSinceRef.current && questionRef.current ? `${questionRef.current}\n${text}` : text;
    if (answeredSinceRef.current) askedAtRef.current = new Date().toISOString();
    answeredSinceRef.current = false;
    setQuestion(merged);
    questionRef.current = merged;
    if (juryMessageCountRef.current > 1 && /nous passons maintenant a l'entretien individuel/.test(normalized)) {
      setEdhecStage("after");
      agent.markPhaseEnd("edhec-presentation");
    }
    if (juryMessageCountRef.current > 1 && /nous avons termine avec les (4|quatre) cartes/.test(normalized)) setCardsStage("after");
    else if (juryMessageCountRef.current > 1 && /passons maintenant au tirage de vos (4|quatre) cartes/.test(normalized)) setCardsStage((s) => (s === "before" ? "cards" : s));
    // INSEEC : le jury annonce la partie 2 → le bloc image disparaît pour de bon.
    if (juryMessageCountRef.current > 1 && /passons maintenant a l'entretien classique/.test(normalized)) setInseecDone(true);
    // Montpellier BS : le jury propose de changer de situation → retour à la grille.
    if (juryMessageCountRef.current > 1 && /passer a une autre situation/.test(normalized) && mbsActiveRef.current) {
      const doneId = mbsActiveRef.current.id;
      setMbsUsed((prev) => new Set(prev).add(doneId));
      mbsActiveRef.current = null;
      setMbsActive(null);
    }
    // ESC Clermont BS : le jury a proposé le choix de l'axe → on arme
    // l'écoute souple de la réponse du candidat.
    if (config.school === "ESC Clermont BS" && CLERMONT_AXIS_OFFER_RE.test(normalized)) {
      clermontAxisOfferedRef.current = true;
    }
    // ESC Clermont BS — vérification puis secours : la question Impact tirée par
    // l'application doit être posée mot pour mot. On la compare au message du
    // jury (40 premiers caractères normalisés) ; sinon on la redemande une seule
    // fois, une fois le jury silencieux.
    if (config.school === "ESC Clermont BS" && !clermontRescueDoneRef.current && juryMessageCountRef.current > 1) {
      const detectedAxis = detectImpactAxis(normalized);
      const axis = clermontAxisRef.current ?? detectedAxis;
      if (axis) {
        if (detectedAxis && !clermontAxisSentRef.current) {
          clermontAxisSentRef.current = true;
          clermontAxisRef.current = detectedAxis;
          startPhase("clermont-impact", "Question Impact");
        }
        const question = clermontQuestionsRef.current[axis];
        clermontRescueDoneRef.current = true;
        if (question && !isImposedQuestionAsked(question, normalized)) {
          sendNudge(
            `Pose maintenant, mot pour mot, sans l'introduire ni la commenter, la question suivante : « ${question} »`,
          );
        }
      }
    }
    // emlyon — secours : le tirage des cartes n'a pas été annoncé.
    if (config.school === "emlyon" && emlyonCardsInstructionRef.current && juryMessageCountRef.current > 1) {
      const instruction = emlyonCardsInstructionRef.current;
      emlyonCardsInstructionRef.current = null;
      // Même mécanisme de vérification que pour la question Impact Clermont.
      if (!isImposedQuestionAsked(EMLYON_CARDS_PHRASE, normalized)) sendNudge(instruction);
    }
    // emlyon : on repère la demande de présentation pour déclencher les cartes
    // à la bonne réponse (le premier message se termine par « c'est clair ? »).
    if (config.school === "emlyon" && juryMessageCountRef.current > 1 && /presentez-vous|presentation/.test(normalized)) {
      emlyonPresentationAskedRef.current = true;
    }
    // EDHEC : l'écran gère seul la minute de préparation, le jury reste muet.
    if (
      config.school === "EDHEC" &&
      juryMessageCountRef.current === 1 &&
      edhecStageRef.current === "word"
    ) {
      setEdhecScreenPhase("preparing");
      setEdhecPrepRemaining(59);
      setEdhecPresentationRemaining(240);
    }
    if (juryMessageCountRef.current > 1 && /bonne continuation/.test(normalized)) {
      const closingAllowed = elapsed >= simulatedMinutes(config) * 60 - 180 || agent.closingSent;
      if (closingAllowed) {
        setClosed(true);
        return;
      }
      console.info("[jury vocal] phrase de clôture ignorée avant la fenêtre autorisée");
    }
    const nudgeJustSent = nudgeSentRef.current;
    nudgeSentRef.current = false;
    // Le jury ne doit jamais rendre la main sans question : secours limité,
    // et jamais sur une prise de parole qui rend légitimement la main.
    const eligible =
      text.trim().length > 8 &&
      !text.includes("?") &&
      mainRenduRef.current < 3 &&
      juryMessageCountRef.current > 1 &&
      !nudgeJustSent &&
      !INVITATION_RE.test(normalized) &&
      // EDHEC : phase silencieuse tant que la transition n'a pas eu lieu.
      !(config.school === "EDHEC" && edhecStageRef.current !== "after") &&
      // GEM : exposé du candidat, le jury n'a pas encore à poser de question.
      !(config.school === "GEM (Grenoble EM)" && turnsRef.current.length === 0);
    if (eligible) {
      // Le jury enchaîne parfois transition puis question : on attend 4 s à
      // l'oral. En mode écrit, il n'enchaîne pas : 1,5 s suffit.
      handRescueTimerRef.current = setTimeout(() => {
        handRescueTimerRef.current = null;
        if (closedRef.current || answeredSinceRef.current) return;
        mainRenduRef.current += 1;
        sendNudge(
          "Tu viens de rendre la main sans poser de question. Pose immédiatement ta question suivante, en une phrase, sans revenir sur ce que tu as déjà dit.",
        );
      }, mode === "text" ? 1500 : 4000);
    }
  }

  /** Le candidat vient de finir sa prise de parole : le fil est complété. */
  function handleCandidateAnswer(text: string) {
    // EDHEC : si le candidat commence avant la fin de la préparation, l'écran
    // passe immédiatement au compteur de présentation. Le jury reste silencieux.
    if (config.school === "EDHEC") showEdhecPresentationTimer();
    const nextTurns: Turn[] = [
      ...turnsRef.current,
      {
        question: questionRef.current,
        answer: text,
        askedAt: askedAtRef.current ?? new Date().toISOString(),
        answeredAt: new Date().toISOString(),
      },
    ];
    turnsRef.current = nextTurns;
    setTurns(nextTurns);
    answeredSinceRef.current = true;
    lastAnswerAtRef.current = Date.now();
    // Le candidat a parlé : les paliers de silence repartent de zéro.
    noAnswerStepsDoneRef.current = 0;
    silenceSinceRef.current = null;
    void persist(nextTurns, "running");

    // ESC Clermont BS : l'axe est repéré dans la réponse du candidat ; le jury
    // le confirme, puis l'application lui transmet la question par nudge.
    // L'écoute n'est armée qu'après que le jury a proposé le choix de l'axe.
    if (config.school === "ESC Clermont BS" && clermontAxisOfferedRef.current && !clermontAxisSentRef.current) {
      const axis = detectImpactAxis(normalizeInterviewText(text), true);
      if (axis) {
        clermontAxisSentRef.current = true;
        clermontAxisRef.current = axis;
        startPhase("clermont-impact", "Question Impact");
      }
    }

    // emlyon : l'épreuve des 4 cartes est lancée par l'application dès la fin
    // de la présentation, jamais laissée à l'initiative du jury. Le premier
    // message se terminant par « est-ce que c'est clair ? », on attend la
    // réponse à la demande de présentation (secours : le 2e tour).
    // La consigne part en mise à jour contextuelle AVANT cette réponse : le jury
    // l'a donc en main quand il rédige, et ne peut plus poser une question puis
    // annoncer le tirage derrière.
    const answeredPresentation =
      emlyonPresentationAskedRef.current && /presentez-vous|presentation/.test(normalizeInterviewText(questionRef.current));
    if (config.school === "emlyon" && !emlyonTriggeredRef.current) {
      if (answeredPresentation || (!emlyonPresentationAskedRef.current && nextTurns.length >= 2)) {
        triggerEmlyonCards();
      }
    }
  }

  /** emlyon : lancement de l'épreuve des cartes, décidé par l'application. */
  function triggerEmlyonCards() {
    emlyonTriggeredRef.current = true;
    setCardsStage("cards");
    startPhase("emlyon-cartes", "Épreuve des 4 cartes");
    const instruction =
      `Ta prochaine prise de parole commence par cette phrase et ne contient aucune autre question avant : La présentation est terminée. Dis maintenant, mot pour mot : « ${EMLYON_CARDS_PHRASE} » puis énonce les quatre questions tirées (Expérience, Personnalité, Projet, Créativité) telles qu'elles figurent dans ta conduite, sans les reformuler, et laisse le candidat choisir son ordre.`;
    emlyonCardsInstructionRef.current = instruction;
    agent.queueInstruction(instruction, { before: true });
  }

  const agent = useJuryAgent({
    onQuestion: handleJuryQuestion,
    onAnswer: handleCandidateAnswer,
    onError: (message) => toast.error(message),
    // Coupure côté ElevenLabs avant la première question : on ne laisse pas
    // l'écran tourner indéfiniment sur « Connexion vocale en cours ».
    onDisconnect: () => {
      // Arrêt volontaire ou entretien déjà clos : ce n'est pas une coupure.
      if (voluntaryStopRef.current || closedRef.current) return;
      if (turnsRef.current.length === 0) {
        setPhase("idle");
        toast.error("Le jury vocal s'est déconnecté avant de démarrer. Relancez l'entretien.");
        return;
      }
      setInterrupted(true);
      toast.error(
        "La connexion au jury a été interrompue. Votre entretien est conservé : cliquez sur « Obtenir mon débrief ».",
      );
    },
  });

  // Filet unique « c'est au jury de parler » : le jury doit reprendre la parole
  // après une réponse du candidat OU après une consigne de l'application. On ne
  // relance jamais quand c'est le candidat qu'on attend.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const rescue = juryTurnRescueDue({
        lastAnswerAt: lastAnswerAtRef.current,
        lastNudgeAt: lastNudgeAtRef.current,
        lastJuryAt: lastJuryAtRef.current,
        now: Date.now(),
        jurySpeaking: agent.jurySpeaking,
        closed: closedRef.current,
        rescuedForAt: juryTurnRescuedForRef.current,
        mode,
      });
      if (!rescue) return;
      juryTurnRescuedForRef.current = rescue.at;
      console.warn("[jury vocal] tour vide rattrapé");
      // La relance elle-même ne crée pas une nouvelle occasion de rattrapage.
      sendNudge(rescue.nudge, { rescue: true });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, mode, agent.jurySpeaking]);


  // Candidat muet, à l'oral uniquement : trois relances du jury, jamais de
  // clôture automatique. Les écrans de préparation et les 30 s qui suivent un
  // démarrage de phase décidé par l'application suspendent les paliers.
  useEffect(() => {
    // MODE TEST ÉCRIT : `testSilenceEnabled` permet de vérifier les paliers à
    // l'écrit ; à retirer avec le mode écrit.
    const silenceEnabled = mode === "voice" || testSilenceEnabled;
    if (phase !== "running" || !silenceEnabled) return;
    const id = setInterval(() => {
      const now = Date.now();
      const phaseStartAt = lastPhaseStartAtRef.current;
      const paused =
        // Écrans de préparation ou de sélection affichés.
        cardsStageRef.current === "cards" ||
        edhecScreenPhaseRef.current === "preparing" ||
        // Réflexion accordée après un démarrage de phase décidé par l'application.
        (phaseStartAt !== null && now - phaseStartAt < 30_000);
      // Fin de pause : le compteur repart de zéro, pas de rafale de relances.
      if (silencePausedRef.current && !paused) {
        silenceSinceRef.current = null;
        noAnswerStepsDoneRef.current = 0;
      }
      silencePausedRef.current = paused;
      const step = noAnswerStepDue({
        enabled: silenceEnabled,
        silenceSince: silenceSinceRef.current,
        lastJuryAt: lastJuryAtRef.current,
        lastAnswerAt: lastAnswerAtRef.current,
        now,
        jurySpeaking: agent.jurySpeaking,
        closed: closedRef.current,
        paused,
        stepsDone: noAnswerStepsDoneRef.current,
      });
      if (step === null) return;
      noAnswerStepsDoneRef.current = step + 1;
      console.warn(`[jury vocal] candidat silencieux : palier ${step + 1}`);
      sendNudge(NO_ANSWER_STEPS[step]!.instruction);
    }, 1000);
    return () => clearInterval(id);
  }, [phase, mode, testSilenceEnabled, agent.jurySpeaking]);



  /**
   * Repère l'axe retenu (insensible casse/accents). Côté jury, la phrase
   * verbatim est attendue ; côté candidat (`loose`), le seul nom de l'axe
   * suffit, pour ne jamais rester bloqué si le jury ne confirme pas.
   */
  function detectImpactAxis(t: string, loose = false): ImpactAxis | null {
    if (!loose && !/l'axe retenu est/.test(t)) return null;
    if (t.includes("people")) return "people";
    if (t.includes("planet")) return "planet";
    if (t.includes("profit")) return "profit";
    return null;
  }

  /**
   * Démarrage de l'entretien, déclenché depuis le popup de structure.
   * Le support éventuel est enregistré, lu côté serveur (extraction fidèle du
   * texte), puis transmis au jury comme texte — plus aucun fichier n'est envoyé
   * à l'agent vocal.
   */
  async function start(supportFile: File | null, articleId: string | null = null, imageId: string | null = null) {
    if (!school) {
      toast.error("Choisissez l'école sur laquelle vous passez l'entretien.");
      return;
    }
    if (config.comingSoon) {
      toast.error("Cette école n'est pas encore disponible en simulation.");
      return;
    }
    const articleOptions = config.support?.articleOptions;
    const chosenArticle = articleOptions?.find((a) => a.id === articleId) ?? null;
    // INSEEC : l'image est choisie dans le popup, avant le démarrage.
    const chosenImage = config.imageOptions?.find((i) => i.id === imageId) ?? null;
    if (config.imageOptions && !chosenImage) {
      toast.error("Choisissez votre image avant de démarrer.");
      return;
    }
    if (config.requiresUpload && !supportFile && !chosenArticle) {
      toast.error(
        articleOptions
          ? "Choisissez un article avant de démarrer."
          : `Déposez votre ${config.support?.label ?? "support"} avant de démarrer.`,
      );
      return;
    }
    sessionIdRef.current = null;
    voluntaryStopRef.current = false;
    turnsRef.current = [];
    setTurns([]);
    setQuestion("");
    setDraft("");
    askedAtRef.current = null;
    setDebrief("");
    setClosed(false);
    setPhaseTimings([]);
    phaseTimingsRef.current = [];
    setInterrupted(false);
    answeredSinceRef.current = true;
    lastAnswerAtRef.current = null;
    noAnswerStepsDoneRef.current = 0;
    silenceSinceRef.current = null;
    lastPhaseStartAtRef.current = null;
    silencePausedRef.current = false;
    lastJuryAtRef.current = null;
    juryTurnRescuedForRef.current = null;
    lastNudgeAtRef.current = null;

    emlyonTriggeredRef.current = false;
    emlyonPresentationAskedRef.current = false;
    emlyonCardsInstructionRef.current = null;
    clermontAxisOfferedRef.current = false;
    clermontAxisSentRef.current = false;
    clermontAxisRef.current = null;
    clermontQuestionsRef.current = { people: "", planet: "", profit: "" };
    clermontRescueDoneRef.current = false;
    juryMessageCountRef.current = 0;
    nudgeSentRef.current = false;
    if (handRescueTimerRef.current) {
      clearTimeout(handRescueTimerRef.current);
      handRescueTimerRef.current = null;
    }
    mainRenduRef.current = 0;
    setElapsed(0);
    setBusy(true);
    try {
      let uploaded: { path: string; label: string; text: string } | null = null;
      // Cas « article choisi dans notre liste » (TBS) : aucun fichier, l'article
      // est transmis au jury en texte (titre, source, date, résumé).
      if (chosenArticle) {
        uploaded = {
          path: `article:${chosenArticle.id}`,
          label: `${config.support?.label ?? "Article de presse"} — ${chosenArticle.title}`,
          text: `Titre : ${chosenArticle.title}\nSource : ${chosenArticle.source}\nDate : ${chosenArticle.date}\nURL : ${chosenArticle.url}\n\nRésumé : ${chosenArticle.summary}`,
        };
      } else if (supportFile && user) {
        const ext = supportFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("interview-supports")
          .upload(path, supportFile, { contentType: supportFile.type || "application/octet-stream" });
        if (error) throw new Error("Votre document n'a pas pu être enregistré. Réessayez.");
        const label = config.support?.label ?? "Support d'entretien";
        // Lecture fidèle du document côté serveur : le jury reçoit du texte.
        const read = await readSupport({ data: { path, label } });
        if (!read.text) toast.warning("Votre document n'a pas pu être relu entièrement : le jury s'appuiera surtout sur votre oral.");
        uploaded = { path, label, text: read.text };
      }
      setSupport(uploaded);
      supportRef.current = uploaded;

      // Tous les tirages spéciaux sont aléatoires et synchrones : ils sont
      // résolus avant le démarrage de l'agent pour ne jamais lui transmettre
      // une variable dynamique vide.
      const gemPersona = config.school === "GEM (Grenoble EM)" ? pickGemPersona() : "";
      const essecSituation = config.school === "ESSEC" ? pickEssecSituation() : null;
      const emlyonDraw = config.school === "emlyon" ? drawEmlyonCards() : null;
      setEmlyonCards(emlyonDraw);
      setCardsStage("before");
      const kedgeDraw = config.school === "KEDGE" ? drawKedgeCards() : null;
      setKedgeCards(kedgeDraw);
      const edhecDraw = config.school === "EDHEC" ? pickEdhecWord() : null;
      const clermontVariables = buildClermontImpactVariables(config.school);
      clermontQuestionsRef.current = {
        people: clermontVariables.clermont_q_people,
        planet: clermontVariables.clermont_q_planet,
        profit: clermontVariables.clermont_q_profit,
      };
      setEdhecWord(edhecDraw);
      setEdhecStage("word");
      setEdhecScreenPhase("hidden");
      setEdhecPrepRemaining(59);
      setEdhecPresentationRemaining(240);
      setMbsPool(config.school === "Montpellier BS" ? drawMontpellierSituations() : null);
      setMbsUsed(new Set());
      mbsActiveRef.current = null;
      setMbsActive(null);
      setInseecChosen(chosenImage);
      inseecImageRef.current = chosenImage;
      setInseecDone(false);
      clermontAxisOfferedRef.current = false;
      clermontAxisSentRef.current = false;

      await agent.start({
        school,
        textOnly: mode === "text",
        prompt: promptFor(config, variant),
        firstMessage: buildFirstMessage(config, {
          firstName: profile?.first_name ?? null,
          edhecWord: edhecDraw,
          articleTitle: chosenArticle?.title ?? null,
          inseecImage: chosenImage?.shortLabel ?? null,
        }),
        // Session ElevenLabs : durée simulée + 10 minutes de marge.
        maxDurationSeconds: (simulatedMinutes(config) + 10) * 60,
        totalMinutes: simulatedMinutes(config),
        // Les bascules de phase sont ordonnées par l'application dans les repères de temps.
        phaseSchedule: phaseScheduleFor(config),
        onPhaseTimingsChange: (next) => {
          phaseTimingsRef.current = next;
          setPhaseTimings(next);
        },

        dynamicVariables: {
          school: context.school || "école non précisée",
          student_name: context.studentName || "le candidat",
          // Aucun élément des modules n'est transmis au jury : ces variables
          // restent vides (l'agent les référence encore dans son prompt de
          // secours, on doit donc les fournir).
          prepa: "",
          career_project: "",
          school_sheet: "",
          experiences: "",
          news_topics: "",
          support_text: uploaded?.text || "",
          // L'agent ElevenLabs référence {{difficulty_block}} : on l'alimente même
          // quand le prompt complet est injecté en override.
          difficulty_block: hasDifficulties ? difficultyBlock(variant) : "Entretien standard, jury neutre.",
          gem_persona: gemPersona,
          situation_enonce: essecSituation ?? "",
          inseec_image: chosenImage
            ? `Image choisie par le candidat pour se présenter : ${chosenImage.shortLabel}. Description : ${chosenImage.description}`
            : "",
          card_experience: emlyonDraw?.experience ?? "",
          card_personnalite: emlyonDraw?.personnalite ?? "",
          card_projet: emlyonDraw?.projet ?? "",
          card_creativite: emlyonDraw?.creativite ?? "",
          edhec_mot: edhecDraw ?? "",
          kedge_odd: kedgeDraw?.odd ?? "",
          kedge_autoportrait: kedgeDraw?.autoportrait ?? "",
          kedge_action: kedgeDraw?.action ?? "",
          kedge_pensee: kedgeDraw?.pensee ?? "",
          kedge_esprit: kedgeDraw?.esprit ?? "",
          ...clermontVariables,
        },
      });
      setBriefOpen(false);
      setPhase("running");
      void persist([], "running");
    } catch (error) {
      // Micro refusé, réseau, agent non configuré : on reste sur l'écran de départ.
      setPhase("idle");
      toast.error(
        error instanceof Error
          ? error.message
          : "Le jury vocal n'a pas pu démarrer (micro refusé, réseau ou service indisponible).",
      );
    } finally {
      setBusy(false);
    }
  }


  /**
   * Mode écrit : la réponse tapée est ajoutée au fil puis transmise au jury,
   * exactement comme une prise de parole.
   */
  function sendDraft() {
    const text = draft.trim();
    if (!text) return;
    handleCandidateAnswer(text);
    agent.sendWrittenAnswer(text);
    setDraft("");
  }

  /** Fin de l'entretien : débrief complet si la clôture a eu lieu, sinon incomplet. */
  async function finish() {
    // Arrêt volontaire : la déconnexion qui suit ne doit déclencher ni toast
    // d'interruption ni état « interrompu ».
    voluntaryStopRef.current = true;
    await agent.stop();
    const finalTurns = turnsRef.current;
    if (!finalTurns.length) {
      toast.error("Répondez au moins une fois avant de terminer.");
      return;
    }
    const complete = closed;
    setQuestion("");
    setPhase("debriefing");
    void persist(finalTurns, "debriefing");
    setBusy(true);
    try {
      const res = await askDebrief({
        data: {
          context,
          turns: finalTurns,
          variant,
          complete,
          phaseTimings: phaseTimingsRef.current,
          ...(support ? { support } : {}),
          ...(inseecImageRef.current
            ? {
                inseecImage: `image choisie par le candidat pour se présenter : ${inseecImageRef.current.shortLabel}. Description : ${inseecImageRef.current.description}`,
              }
            : {}),
        },
      });

      setDebrief(res.debrief);
      setComplete(complete);
      setPhase("done");
      void persist(finalTurns, complete ? "done" : "stopped", res.debrief);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Débrief indisponible.");
      setPhase("running");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div>
      <PartNav prev="/partie-7" className="mb-6" />
      <PartHeader
        step="Module 7"
        title="Mon entraînement illimité"
      />

      <IntroPanel title="C'est maintenant le moment de s'entraîner sans limite !">
          <p>
            Choisissez une école et simulez un entretien comme le jour J ! Le jury écoute votre réponse et rebondit en
            conditions réelles. L'évaluation n'arrive qu'à la fin que quand vous cliquez sur « Terminer l'entretien »
          </p>
          <p>
            Pour un premier entraînement, nous vous conseillons de choisir l'entretien de découverte, avec un jury un peu
            plus aidant. Basculez ensuite vers les entretiens classiques, qui vous mettront face aux exigences du jour J.
          </p>
          <p>
            Le transcript de l'entretien est enregistré automatiquement pendant l'entretien : vous pourrez l'exporter en
            PDF à la fin, et le retrouver dans l'historique.
          </p>
      </IntroPanel>


      <Card className="flex flex-col gap-6 border-0 p-6 md:px-10 md:py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-[10px]">
            <Label className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">École passée</Label>
            <Select value={school} onValueChange={setSchool} disabled={phase === "running" || phase === "debriefing"}>
              <SelectTrigger className="h-auto min-h-14 rounded-[14px] border-[rgba(11,18,32,0.2)] bg-white px-4 text-[18px] md:text-[20px]">
                <SelectValue placeholder="Choisir une école" />
              </SelectTrigger>
              <SelectContent>
                {schoolOptions.map((s) => {
                  const soon = Boolean(getSchoolInterviewConfig(s).comingSoon);
                  return (
                    <SelectItem key={s} value={s} disabled={soon}>
                      {soon ? `${s} — bientôt disponible` : s}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-[10px]">
            <Label className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">Format de l'école</Label>
            <p className="m-0 text-[18px] font-medium text-[var(--bleu-texte,#2E46C8)] md:text-[20px]">{formatLabel(config.format)}</p>
            <p className="m-0 text-[16px] text-[var(--gris-doux)]">
              {simulatedMinutes(config)} min simulées
              {agentState?.usesFallback ? " · jury classique en attendant le jury dédié" : ""}
            </p>
          </div>

          <div className={hasDifficulties ? "flex flex-col gap-[10px]" : "hidden"}>

            <Label className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">Difficulté</Label>
            <Select
              value={variant}
              onValueChange={(v) => setVariant(v as InterviewVariant)}
              disabled={phase === "running" || phase === "debriefing"}
            >
              <SelectTrigger className="h-auto min-h-14 rounded-[14px] border-[rgba(11,18,32,0.2)] bg-white px-4 text-[18px] md:text-[20px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_VARIANTS.map((v) => (
                  <SelectItem key={v.code} value={v.code}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* MODE TEST ÉCRIT — à retirer après les tests (avec l'état `mode`,
              `draft`, `sendDraft`, la zone de saisie et `textOnly`). */}
          <PillToggle
            on={mode === "text"}
            disabled={phase === "running" || phase === "debriefing"}
            onClick={() => setMode(mode === "text" ? "voice" : "text")}
          >
            {mode === "text" ? "Mode test : écrit" : "Mode test : oral"}
          </PillToggle>
          {mode === "text" ? (
            <PillToggle on={testSilenceEnabled} onClick={() => setTestSilenceEnabled((v) => !v)}>
              {testSilenceEnabled ? "Paliers de silence : actifs" : "Paliers de silence : inactifs"}
            </PillToggle>
          ) : null}
          {/* FIN MODE TEST ÉCRIT */}


          {mode === "voice" ? (
            <PillToggle on={!agent.muted} onClick={() => void agent.toggleMute()}>
              {!agent.muted ? "Voix du jury active" : "Voix du jury coupée"}
            </PillToggle>
          ) : null}


          {phase === "idle" || phase === "done" ? (
            <Button type="button" size="lg" className="md:ml-auto" onClick={() => setBriefOpen(true)} disabled={busy || !school || Boolean(config.comingSoon)}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : phase === "done" ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
              {phase === "done" ? "Refaire un entretien" : "Démarrer l'entretien"}
            </Button>
          ) : null}

        </div>
        {!schoolOptions.length ? (
          <p className="m-0 text-[16px] text-[var(--gris-doux)]">
            Renseignez d'abord vos écoles visées (module 1) ou une fiche école (module 3).
          </p>
        ) : null}
      </Card>

      <InterviewBriefDialog
        open={briefOpen}
        onOpenChange={(next) => {
          if (!busy) setBriefOpen(next);
        }}
        config={config}
        school={school}
        fallbackAgent={Boolean(agentState?.usesFallback)}
        busy={busy}
        onStart={(file, articleId, imageId) => void start(file, articleId, imageId)}
      />



      {phase === "running" || phase === "debriefing" ? (
        <Card className="mt-6 overflow-hidden rounded-[28px] border-0 p-0">
          <div className="relative flex items-center gap-4 overflow-hidden bg-[var(--ink)] px-6 py-6 text-white md:px-10 md:py-7">
            <img
              src={schoolPhotoOrFallback(school)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover opacity-45"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(11,18,32,0.98) 0%, rgba(11,18,32,0.8) 55%, rgba(11,18,32,0.4) 100%)" }} />
            {schoolLogo(school) ? (
              <img
                src={schoolLogo(school)}
                alt={`Logo ${school}`}
                className="relative size-[52px] shrink-0 rounded-[12px] bg-white object-contain p-1"
                loading="lazy"
              />
            ) : null}
            <div className="relative min-w-0">
              <p className="m-0 text-[26px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">{school}</p>
              <p className="m-0 mt-1 text-[15px] text-[#D3DAE6] md:text-[17px]">
                {[formatLabel(config.format), hasDifficulties ? difficultyLabel(variant) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="px-6 md:px-10">
          <div className="flex flex-col items-start gap-3 py-7">
            <span className="inline-flex items-center gap-[14px] text-[32px] font-semibold tracking-[-0.03em] tabular-nums md:text-[44px]">
              <span className="size-[14px] rounded-full bg-[#F0605D] shadow-[0_0_0_6px_rgba(240,96,93,0.15)]" />
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
              <span className="font-medium text-[#8A94A6]"> / {simulatedMinutes(config)}:00</span>
            </span>
            <span className="relative h-[6px] w-full overflow-hidden rounded-full bg-[var(--paper,#F2F4F7)]">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-[#2E46C8]"
                style={{ width: `${Math.min(100, (elapsed / Math.max(1, simulatedMinutes(config) * 60)) * 100)}%` }}
              />
            </span>
          </div>

          <div className="flex flex-col gap-4 border-t border-[rgba(11,18,32,0.1)] py-8">
          <div className="flex items-start gap-4 rounded-[20px] bg-[#F2F4F7] p-5 md:gap-6 md:p-8">
            <span className="inline-flex size-12 flex-none items-center justify-center rounded-full bg-[#E6EEFF] text-[#2E46C8] md:size-14">
              {agent.jurySpeaking ? <Volume2 className="size-6 animate-pulse" /> : <Volume2 className="size-6" />}
            </span>
            <div className="flex flex-1 flex-col gap-3">
              <p className="m-0 text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">Le jury</p>
              {busy && !question ? (
                <p className="m-0 flex items-center gap-2 text-[17px] text-[var(--gris-doux)]">
                  <Loader2 className="size-4 animate-spin" /> Connexion au jury…
                </p>
              ) : (
                <p className="m-0 whitespace-pre-line text-[22px] font-medium leading-[1.3] tracking-[-0.03em] md:text-[32px]">{question || "…"}</p>
              )}
            </div>
          </div>

          {edhecWord && edhecStage === "word" && phase === "running" ? (
            <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white p-5 md:p-7">
              <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">Votre mot tiré au sort</p>
              <p className="mt-3 text-[20px] font-medium leading-[1.35] tracking-[-0.015em] md:text-[24px]">{edhecWord}</p>
              {edhecScreenPhase !== "hidden" ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <span className="rounded-full bg-[#E6EEFF] px-4 py-2 text-[17px] font-semibold tabular-nums">
                    {edhecScreenPhase === "preparing" ? "Préparation" : "À vous"} : {formatCountdown(
                      edhecScreenPhase === "preparing" ? edhecPrepRemaining : edhecPresentationRemaining,
                    )}
                  </span>
                  {edhecScreenPhase === "preparing" ? (
                    <Button type="button" size="sm" variant="outline" onClick={showEdhecPresentationTimer}>
                      Je suis prêt, je commence
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">4 minutes de présentation</span>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {emlyonCards && cardsStage === "cards" && phase === "running" ? (
            <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white p-5 md:p-7">
              <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">Vos 4 cartes</p>
              <ul className="mt-3 space-y-3 text-[17px] leading-[1.5] md:text-[19px]">
                {[
                  { theme: "Expérience", q: emlyonCards.experience },
                  { theme: "Personnalité", q: emlyonCards.personnalite },
                  { theme: "Projet", q: emlyonCards.projet },
                  { theme: "Créativité", q: emlyonCards.creativite },
                ].map((c) => (
                  <li key={c.theme}>
                    <span className="font-semibold">{c.theme} : </span>
                    {c.q}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {mbsPool && phase === "running" ? (
            <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white p-5 md:p-7">
              {mbsActive ? (
                <>
                  <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">
                    Votre situation en cours
                  </p>
                  <p className="mt-3 text-[20px] font-medium leading-[1.35] tracking-[-0.015em] md:text-[24px]">{mbsActive.text}</p>
                </>
              ) : (
                <>
                  <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">
                    Choisissez une situation
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(() => {
                      const remaining = mbsPool.drawn.filter((s) => !mbsUsed.has(s.id));
                      const shown =
                        remaining.length > 0 ? remaining : mbsPool.rest.filter((s) => !mbsUsed.has(s.id));
                      return shown.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            mbsActiveRef.current = s;
                            setMbsActive(s);
                            agent.notifyContext(
                              `Le candidat vient de choisir à l'écran la situation suivante à développer : "${s.text}". Attends qu'il commence à raconter, puis creuse normalement (concret, recul) sur cette situation précise.`,
                            );
                          }}
                          className="rounded-[18px] border border-[rgba(11,18,32,0.1)] bg-[#F2F4F7] p-5 text-left text-[17px] leading-[1.4] transition hover:border-[#2E46C8]"
                        >
                          {s.text}
                        </button>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          ) : null}

          {config.school === "KEDGE" && phase === "running" && kedgeCards ? (
            <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white p-5 md:p-7">
              <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">Vos cartes</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Trait d'Union", value: kedgeCards.odd },
                  { label: "Autoportrait", value: kedgeCards.autoportrait },
                  { label: "Trait d'Action", value: kedgeCards.action },
                  { label: "Trait de Pensée", value: kedgeCards.pensee },
                  { label: "Trait d'Esprit", value: kedgeCards.esprit },
                ].map((c) => (
                  <div key={c.label} className="flex flex-col gap-2 rounded-[18px] border border-[rgba(11,18,32,0.1)] bg-[#F2F4F7] p-5">
                    <dt className="text-[17px] font-bold text-[var(--ink)]">{c.label}</dt>
                    <dd className="m-0 text-[19px] font-medium leading-[1.35] tracking-[-0.015em] md:text-[22px]">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {config.school === "INSEEC Grande École" && phase === "running" && !inseecDone && inseecChosen ? (
            <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white p-5 md:p-7">
              <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#2E46C8] md:text-[20px]">Votre image choisie</p>
              <img
                src={inseecChosen.path}
                alt={inseecChosen.description}
                className="mt-4 w-full max-w-lg rounded-[18px] object-cover"
              />
              <p className="mt-3 text-[16px] leading-snug text-[var(--gris-doux)]">{inseecChosen.description}</p>
            </div>
          ) : null}

          {phase === "running" ? (
            <div className="flex flex-col gap-4">
              {mode === "text" ? (
                <div className="mb-4">
                  <Label className="flex items-center gap-2 text-[18px] font-semibold text-[var(--ink)]">
                    <Keyboard className="size-4" /> Votre réponse écrite
                  </Label>
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        sendDraft();
                      }
                    }}
                    rows={5}
                    placeholder="Tapez votre réponse au jury, puis envoyez-la."
                    className="mt-2"
                    disabled={!agent.connected}
                  />
                  <Button
                    type="button"
                    className="mt-3"
                    onClick={sendDraft}
                    disabled={!agent.connected || !draft.trim()}
                  >
                    <Send className="size-4" /> Envoyer ma réponse
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-col gap-4 rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-white px-5 py-6 md:px-8 md:py-7">
                <span className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">
                  {interrupted ? (
                    <>
                      <AlertTriangle className="size-4 text-accent" /> L'entretien a été interrompu. Vos échanges sont
                      conservés : obtenez votre débrief sur ce qui a été dit.
                    </>
                  ) : mode === "text" ? (
                    agent.connected ? (
                      <>
                        <Keyboard className="size-4 text-accent" /> Entretien à l'écrit : le jury lit vos réponses et
                        rebondit par écrit.
                      </>
                    ) : (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Connexion au jury en cours…
                      </>
                    )
                  ) : agent.jurySpeaking ? (
                    <>
                      <Volume2 className="size-4 animate-pulse text-accent" /> Le jury parle - vous pouvez lui couper la
                      parole.
                    </>
                  ) : agent.connected ? (
                    <>
                      <Mic className="size-4 text-accent" /> Le jury vous écoute : parlez normalement, il rebondit tout
                      seul.
                    </>
                  ) : (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Connexion vocale en cours…
                    </>
                  )}
                </span>
              </div>
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
              {closed ? (
                <p className="m-0 flex-1 text-[16px] text-[#2E46C8] md:text-[17px]">
                  La clôture est passée : cliquez sur « Terminer l'entretien » pour accéder à votre évaluation complète.
                </p>
              ) : (
                <p className="m-0 flex-1 text-[16px] text-[var(--gris-doux)] md:text-[17px]">
                  Si vous terminez maintenant, l'évaluation sera produite mais signalée comme incomplète.
                </p>
              )}
                <button
                  type="button"
                  onClick={finish}
                  disabled={busy}
                  className="inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-[var(--ink)] px-7 py-4 text-[18px] font-semibold text-white shadow-[0_10px_24px_rgba(11,18,32,0.18)] disabled:opacity-60 md:px-8 md:py-5 md:text-[20px]"
                >
                  <span className="inline-block size-[14px] rounded-[3px] bg-[#F0605D]" />
                  {interrupted ? "Obtenir mon débrief" : "Terminer l'entretien"}
                </button>
              </div>
            </div>
          ) : (
            <p className="m-0 flex items-center gap-2 border-t border-[rgba(11,18,32,0.1)] pt-6 text-[17px] text-[var(--gris-doux)]">
              <Loader2 className="size-4 animate-spin" /> Le jury rédige votre débrief…
            </p>
          )}
          </div>
          </div>
        </Card>
      ) : null}

      {debrief ? (
        <div className="mt-6 flex flex-col gap-6">
          {!complete ? (
            <p className="m-0 rounded-[14px] border border-destructive/40 bg-destructive/5 px-4 py-3 text-[15px] text-destructive md:text-[16px]">
              Évaluation incomplète : vous avez interrompu l'entretien avant la clôture.
            </p>
          ) : null}
          <DebriefHeader
            school={school}
            logo={schoolLogo(school)}
            date={sessionDate(turns[0]?.askedAt ?? new Date().toISOString())}
            difficultyLabel={juryLabel(hasDifficulties ? variant : undefined)}
            percentile={positioningInfo(debrief).value}
            percentileLabel={positioningInfo(debrief).label}
            onExport={() =>
              downloadInterviewPdf({
                school,
                formatLabel: formatLabel(config.format),
                difficultyLabel: hasDifficulties ? difficultyLabel(variant) : undefined,
                createdAt: turns[0]?.askedAt ?? new Date().toISOString(),
                turns,
                debrief,
                complete,
              })
            }
          />
          <InterviewDebrief text={debrief} positioningInBanner />
          {turns.length ? <InterviewTranscript turns={turns} /> : null}
        </div>
      ) : null}

      {finishedSessions.length ? (
        <Card className="mt-6 p-6 md:p-8">
          <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">
            Historique de mes entretiens
          </h2>
          <p className="mt-2 text-[16px] text-[var(--gris-doux)] md:text-[17px]">
            Retrouve chacun de tes entraînements avec son feedback détaillé, ton classement en percentile et son fil complet.
          </p>
          {!historySchool ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {historySchools.map(({ school, count }) => (
                <button
                  key={school}
                  type="button"
                  onClick={() => setHistorySchool(school)}
                  className="flex items-center gap-3 rounded-[14px] border border-[rgba(11,18,32,0.1)] bg-white p-4 text-left transition hover:border-[var(--bleu-texte)]"
                >
                  {schoolLogo(school) ? (
                    <img
                      src={schoolLogo(school)}
                      alt={`Logo ${school}`}
                      className="size-10 shrink-0 rounded-[10px] bg-white object-contain p-1"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block truncate text-[17px] font-medium text-[var(--ink)] md:text-[18px]">{school}</span>
                    <span className="block text-[14px] text-[var(--gris-doux)] md:text-[15px]">
                      {count} entretien{count > 1 ? "s" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setHistorySchool(null)}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary"
              >
                <ChevronRight className="size-3 rotate-180" />
                Toutes les écoles
              </button>
              <div className="mt-3 flex items-center gap-3 border-b border-border/60 pb-4">
                {schoolLogo(historySchool) ? (
                  <img
                    src={schoolLogo(historySchool)}
                    alt={`Logo ${historySchool}`}
                    className="size-10 shrink-0 rounded-md border border-border/60 bg-white object-contain p-1"
                    loading="lazy"
                  />
                ) : null}
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg text-primary">{historySchool}</h3>
                  <p className="text-xs text-muted-foreground">
                    {visibleSessions.length} entretien{visibleSessions.length > 1 ? "s" : ""} enregistré
                    {visibleSessions.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {visibleSessions.map((s) => {
                  const percentile = percentileOf(s.debrief);

                  const open = openSession === s.id;
                  return (
                    <li
                      key={s.id}
                      className={`rounded-[3px] border ${
                        open ? "border-primary/60 shadow-[var(--shadow-card)]" : "border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 p-3">
                        <button
                          type="button"
                          className="flex flex-1 flex-wrap items-center gap-2 text-left"
                          onClick={() => setOpenSession(open ? null : s.id)}
                        >
                          {open ? (
                            <ChevronDown className="size-4 shrink-0" />
                          ) : (
                            <ChevronRight className="size-4 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-primary">
                            {new Date(s.created_at).toLocaleString("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {percentile ? (
                            <span className="shrink-0 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                              Percentile {percentile}
                            </span>
                          ) : null}
                          <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                            {formatLabel(s.format)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {s.status === "done" ? "entretien achevé" : "entretien interrompu"}
                          </span>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Exporter le transcript en PDF"
                          onClick={() =>
                            downloadInterviewPdf({
                              school: s.school,
                              formatLabel: formatLabel(s.format),
                              difficultyLabel: s.difficulty ? difficultyLabel(s.difficulty) : undefined,
                              createdAt: s.created_at,
                              turns: s.turns ?? [],
                              debrief: s.debrief,
                              complete: s.status === "done",
                            })
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSession(s.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                      {open ? (
                        <div className="space-y-4 border-t border-border/60 p-4">
                          <DebriefHeader
                            school={s.school}
                            logo={schoolLogo(s.school)}
                            date={new Date(s.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                            formatLabel={formatLabel(s.format)}
                            difficultyLabel={juryLabel(s.difficulty)}
                            percentile={positioningInfo(s.debrief).value}
                            percentileLabel={positioningInfo(s.debrief).label}
                          />
                          {s.debrief ? (
                            <InterviewDebrief
                              text={s.debrief}
                              difficulty={difficultyLabel(s.difficulty)}
                              positioningInBanner
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">Pas de débrief : entretien interrompu.</p>
                          )}
                          <InterviewTranscript turns={s.turns ?? []} />
                        </div>
                      ) : null}

                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      ) : null}
      <PartNav prev="/partie-7" className="mt-10" />
    </div>
  );
}
