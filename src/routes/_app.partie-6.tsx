import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Download,
  FileUp,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { IntroPanel } from "@/components/vivaldi/StartPanel";
import { PartNav } from "@/components/vivaldi/PartNav";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { AiFeedback } from "@/components/vivaldi/AiFeedback";
import { OralAnswer } from "@/components/vivaldi/OralAnswer";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { reviewProjectiveCv, reviewSupport } from "@/lib/ai.functions";
import { isSameInput, rememberInput } from "@/lib/feedback-cache";
import { downloadProjectiveCvPdf } from "@/lib/projective-cv-pdf";
import { schoolLogo } from "@/lib/school-logos";
import {
  PROJECTIVE_CV,
  PROJECTIVE_CV_SCHOOL,
  SUPPORTS_THEORY_SECTIONS,
  SUPPORT_SCHOOL_NAMES,
  supportForSchool,
  type SupportSchool,
} from "@/lib/supports-kb";
import {
  EMPTY_PROJECTIVE_CV,
  useCareerProject,
  useExperiences,
  useInterviewSupports,
  useProfile,
  useSchoolSheets,
  type InterviewSupport,
  type ProjectiveCv,
  type ProjectiveCvExperience,
} from "@/lib/vivaldi-queries";

type VerdictLevel = "Validé" | "À perfectionner" | "À retravailler";

const hasCurrentCvFeedbackFormat = (text: string) =>
  /\[(?:Cohérence|Coherence)\]/i.test(text) && /\[Connaissance\]/i.test(text);

function parseVerdict(feedback: string): VerdictLevel {
  const match = feedback.match(/## Verdict\n\s*(Validé|À perfectionner|À retravailler)/i);
  return (match?.[1] as VerdictLevel) ?? "À retravailler";
}

function verdictBadge(level: VerdictLevel) {
  if (level === "Validé") return <Badge className="bg-success text-success-foreground">Validé</Badge>;
  if (level === "À perfectionner") return <Badge className="bg-amber-500 text-white">À perfectionner</Badge>;
  return <Badge variant="destructive">À retravailler</Badge>;
}

export const Route = createFileRoute("/_app/partie-6")({
  head: () => ({
    meta: [
      { title: "Module 5 - Mes supports d'entretien | The Prepboard" },
      {
        name: "description",
        content:
          "Préparez le questionnaire de chaque école qui en demande un, ainsi que le CV projectif de SKEMA, avec la correction du jury IA.",
      },
      { property: "og:title", content: "Je prépare mes supports d'entretien | The Prepboard" },
      {
        property: "og:description",
        content: "Questionnaires d'école et CV projectif : le premier contact avec le jury, travaillé et corrigé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Part6,
});

function Part6() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: supports = [] } = useInterviewSupports(user?.id);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  /** Écoles présentées par l'étudiant (module 1) qui demandent un support. */
  const concerned = useMemo(() => {
    const presented = [
      profile?.choice_1,
      profile?.choice_2,
      profile?.choice_3,
      ...(profile?.target_schools ?? []),
    ].filter((s): s is string => Boolean(s && s.trim()));
    const unique = Array.from(new Set(presented));
    return SUPPORT_SCHOOL_NAMES.filter((s) => unique.includes(s));
  }, [profile]);

  const done = supports.filter((s) => s.status === "submitted" && concerned.includes(s.school)).length;
  const supportFor = (school: string) => supports.find((s) => s.school === school) ?? null;

  if (selectedSchool) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => setSelectedSchool(null)}>
          <ArrowLeft className="size-4" /> Tous mes supports
        </Button>
        {selectedSchool === PROJECTIVE_CV_SCHOOL ? (
          <ProjectiveCvWorkspace key={selectedSchool} existing={supportFor(selectedSchool)} />
        ) : (
          <QuestionnaireWorkspace
            key={selectedSchool}
            kb={supportForSchool(selectedSchool)!}
            existing={supportFor(selectedSchool)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <PartNav prev="/partie-5" next="/partie-7" className="mb-6" />
      <PartHeader step="Module 5" title="Mes supports d'entretien">
        <div className="mt-4">
          <TheoryDialog
            title="Les supports de l'entretien"
            intro="Une partie des écoles demande un support écrit remis au jury : le plus souvent un questionnaire, et pour SKEMA un CV projectif. C'est votre premier contact avec le jury."
            sections={SUPPORTS_THEORY_SECTIONS}
          />
        </div>
      </PartHeader>

      <IntroPanel>
          <p>
            Seules les écoles que vous présentez et qui demandent un support apparaissent ci-dessous. Modifiez vos
            écoles dans le module 1 si la liste vous semble incomplète.
          </p>
          <p>
            The Prepboard ne vérifie pas l'exactitude de ce que vous écrivez : le jury IA évalue le respect des attendus de
            l'école, la précision, le calibrage et les perches tendues.
          </p>
      </IntroPanel>


      {concerned.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Aucune de vos écoles présentées ne demande de support écrit. Si vous ajoutez l'ESCP, NEOMA, Rennes
            School of Business, ICN Business School ou SKEMA dans le module 1, leur support apparaîtra ici.
          </p>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {done} support{done > 1 ? "s" : ""} terminé{done > 1 ? "s" : ""} sur {concerned.length}.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {concerned.map((school) => {
              const support = supportFor(school);
              const isCv = school === PROJECTIVE_CV_SCHOOL;
              const kb = supportForSchool(school);
              const logo = schoolLogo(school);
              const feedback = support?.ai_feedback ?? "";
              return (
                <button
                  key={school}
                  type="button"
                  onClick={() => setSelectedSchool(school)}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 text-left shadow-[var(--shadow-card)] transition hover:border-accent/60 hover:shadow-[var(--shadow-lift)]"
                >
                  {logo ? (
                    <img src={logo} alt={`Logo ${school}`} className="size-12 shrink-0 object-contain" loading="lazy" />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold">{school}</span>
                    <span className="block text-xs text-muted-foreground">
                      {isCv ? "CV projectif" : `Questionnaire - ${kb?.questions.length ?? 0} questions`}
                    </span>
                  </span>
                  {support?.status === "submitted" && feedback ? (
                    verdictBadge(parseVerdict(feedback))
                  ) : (
                    <Badge variant="secondary">Non commencé</Badge>
                  )}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <PartNav prev="/partie-5" next="/partie-7" className="mt-10" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Données transverses utilisées par le jury IA                        */
/* ------------------------------------------------------------------ */

function useStudentContext() {
  const { user } = useSession();
  const { data: career } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);

  const careerDetails = career
    ? [
        career.job_or_field && `Métiers ou domaine visé : ${career.job_or_field}`,
        career.sector && `Secteurs : ${career.sector}`,
        career.description && `Description : ${career.description}`,
        career.company_role && `Rôle en entreprise : ${career.company_role}`,
        career.qualities && `Qualités mobilisées : ${career.qualities}`,
        career.companies && `Entreprises repérées : ${career.companies}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  const schoolNotes = sheets
    .map((s) =>
      [
        `École : ${s.school}`,
        s.baseline && `Baseline : ${s.baseline}`,
        s.campuses && `Campus : ${s.campuses}`,
        ...(s.items ?? []).map((i) => `- ${i.kind} : ${i.name} - ${i.why}`),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const experiencesSummary = experiences
    .map((e) =>
      [`Expérience : ${e.name} (${e.category})`, e.context && `Contexte : ${e.context}`]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  return {
    careerProject: career?.job_or_field ?? "",
    careerDetails,
    schoolNotes,
    experiencesSummary,
  };
}

type SupportPatch = {
  answers?: Record<string, string>;
  cv?: ProjectiveCv;
  status?: string;
  ai_feedback?: string;
};

/** Enregistrement / création de la fiche support d'une école. */
function useSupportPersist(school: string, kind: "questionnaire" | "cv", existing: InterviewSupport | null) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const idRef = useRef(existing?.id ?? null);

  useEffect(() => {
    if (existing?.id) idRef.current = existing.id;
  }, [existing?.id]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["interview_supports", user?.id] });

  async function persist(patch: SupportPatch) {
    if (!user) return;
    const row = JSON.parse(JSON.stringify(patch)) as Record<string, never>;
    if (idRef.current) {
      const { error } = await supabase.from("interview_supports").update(row).eq("id", idRef.current);
      if (error) throw error;
      return;
    }
    const { data, error } = await supabase
      .from("interview_supports")
      .insert({ user_id: user.id, school, kind, ...row })
      .select("id")
      .single();
    if (error) throw error;
    idRef.current = data.id;
  }

  return { persist, invalidate, id: idRef };
}

/* ------------------------------------------------------------------ */
/* Questionnaire d'école                                               */
/* ------------------------------------------------------------------ */

function QuestionnaireWorkspace({ kb, existing }: { kb: SupportSchool; existing: InterviewSupport | null }) {
  const context = useStudentContext();
  const review = useServerFn(reviewSupport);
  const { persist, invalidate } = useSupportPersist(kb.school, "questionnaire", existing);

  const [answers, setAnswers] = useState<Record<string, string>>(existing?.answers ?? {});
  const [feedback, setFeedback] = useState(existing?.ai_feedback ?? "");
  const logo = schoolLogo(kb.school);

  const set = (id: string, value: string) => setAnswers((a) => ({ ...a, [id]: value }));

  // Auto-enregistrement silencieux, comme dans les modules 4 et 5.
  const snapshot = JSON.stringify(answers);
  const lastSaved = useRef(JSON.stringify(existing?.answers ?? {}));
  useEffect(() => {
    if (snapshot === lastSaved.current) return;
    const t = setTimeout(() => {
      lastSaved.current = snapshot;
      persist({ answers }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const filled = kb.questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const signature = () => ({ answers, career: context.careerDetails, schools: context.schoolNotes });

  const submit = useMutation({
    mutationFn: async () => {
      if (isSameInput("support", kb.school, signature(), Boolean(feedback))) {
        await persist({ answers, status: "submitted" });
        return null;
      }
      const res = await review({
        data: {
          school: kb.school,
          schoolIntro: kb.intro,
          questions: kb.questions.map((q) => ({
            label: q.label,
            space: q.space ?? "",
            advice: q.advice,
            answer: answers[q.id] ?? "",
          })),
          ...context,
        },
      });
      await persist({ answers, status: "submitted", ai_feedback: res.feedback });
      rememberInput("support", kb.school, signature());
      setFeedback(res.feedback);
      return res.feedback;
    },
    onSuccess: (result) => {
      toast.success(
        result === null ? "Votre support n'a pas changé : l'analyse du jury reste la même." : "Le jury IA a relu votre support.",
      );
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4 p-6">
        {logo ? <img src={logo} alt={`Logo ${kb.school}`} className="size-14 shrink-0 object-contain" /> : null}
        <div className="min-w-0 flex-1">
          <p className="label-mono text-[11px]">Questionnaire</p>
          <h1 className="text-3xl">{kb.school}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {filled}/{kb.questions.length} question(s) rédigée(s)
          </p>
        </div>
        {feedback ? verdictBadge(parseVerdict(feedback)) : <Badge variant="secondary">Non commencé</Badge>}
      </Card>

      <Card className="p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">{kb.intro}</p>
      </Card>

      <div className="space-y-5">
        {kb.questions.map((q, i) => (
          <Card key={q.id} className="space-y-3 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Question {i + 1}</p>
              <p className="mt-1 font-medium text-foreground">{q.label}</p>
              {q.space ? <p className="mt-1 text-xs text-muted-foreground">Espace laissé par l'école : {q.space}</p> : null}
            </div>
            <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Attendus : </span>
              {q.advice}
            </div>
            <div className="space-y-2">
              <Label htmlFor={q.id}>Ma réponse</Label>
              <Textarea
                id={q.id}
                rows={4}
                value={answers[q.id] ?? ""}
                placeholder="J'écris ma réponse à la première personne, en phrases complètes."
                onChange={(e) => set(q.id, e.target.value)}
              />
              <OralAnswer
                label="Dicter cette réponse"
                onTranscript={(text) => set(q.id, [answers[q.id] ?? "", text].filter(Boolean).join(" ").trim())}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-6">
        <Button className="gap-2" onClick={() => submit.mutate()} disabled={submit.isPending}>
          {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Faire évaluer mon support
        </Button>
        {feedback ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => submit.mutate()} disabled={submit.isPending}>
            <RotateCcw className="size-4" />
            Relancer l'analyse
          </Button>
        ) : null}
        <span className="text-xs text-muted-foreground">Vos réponses sont enregistrées automatiquement.</span>
      </Card>

      {feedback ? (
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Le retour du jury</h2>
            {verdictBadge(parseVerdict(feedback))}
          </div>
          <AiFeedback text={feedback} />
        </Card>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CV projectif SKEMA                                                  */
/* ------------------------------------------------------------------ */

const EMPTY_CV_EXPERIENCE: ProjectiveCvExperience = {
  period: "",
  role: "",
  company: "",
  place: "",
  missions: "",
  future: true,
};

function cvToText(cv: ProjectiveCv) {
  return [
    `Titre : ${cv.headline || "(vide)"}`,
    `Nom : ${cv.full_name || "(vide)"}`,
    `Identité : ${cv.identity || "(vide)"}`,
    `Coordonnées projetées : ${cv.contact || "(vide)"}`,
    `Formation réelle (déjà suivie) :\n${cv.formation || "(vide)"}`,
    `Formation projetée (SKEMA et au-delà) :\n${cv.formation_future || "(vide)"}`,
    `Parcours professionnel :\n${
      cv.experiences.length
        ? [...cv.experiences.filter((e) => !e.future), ...cv.experiences.filter((e) => e.future)]
            .map(
              (e) =>
                `${e.future ? "[PROJETÉ]" : "[RÉEL]"} ${e.period} - ${e.role} - ${e.company} (${e.place})\nMissions :\n${e.missions}`,
            )
            .join("\n\n")
        : "(vide)"
    }`,
    `Langues : ${cv.languages || "(vide)"}`,
    `Compétences : ${cv.skills || "(vide)"}`,
    `Vie associative :\n${cv.associations || "(vide)"}`,
    `Informations complémentaires :\n${cv.extras || "(vide)"}`,
  ].join("\n\n");
}

function hasCvBuilderContent(cv: ProjectiveCv) {
  const fields = [
    cv.headline,
    cv.full_name,
    cv.identity,
    cv.contact,
    cv.formation,
    cv.formation_future,
    cv.languages,
    cv.skills,
    cv.associations,
    cv.extras,
    ...cv.experiences.flatMap((experience) => [
      experience.period,
      experience.role,
      experience.company,
      experience.place,
      experience.missions,
    ]),
  ];
  return fields.some((value) => value.trim().length > 0);
}

function ProjectiveCvWorkspace({ existing }: { existing: InterviewSupport | null }) {
  const context = useStudentContext();
  const review = useServerFn(reviewProjectiveCv);
  const { persist, invalidate } = useSupportPersist(PROJECTIVE_CV_SCHOOL, "cv", existing);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const [cv, setCv] = useState<ProjectiveCv>(existing?.cv ?? EMPTY_PROJECTIVE_CV);
  const [feedback, setFeedback] = useState(existing?.ai_feedback ?? "");
  const [mode, setMode] = useState<"choice" | "upload" | "build">("choice");
  const [uploading, setUploading] = useState(false);
  const [uploadReviewed, setUploadReviewed] = useState(false);
  const logo = schoolLogo(PROJECTIVE_CV_SCHOOL);
  const builderHasContent = hasCvBuilderContent(cv);
  // Aucun retour affiche tant que l etudiant n a rien soumis dans le mode courant.
  const showFeedback = Boolean(
    feedback && (mode === "build" ? builderHasContent : mode === "upload" ? uploadReviewed : false),
  );

  const set = (patch: Partial<ProjectiveCv>) => setCv((c) => ({ ...c, ...patch }));
  const setExp = (index: number, patch: Partial<ProjectiveCvExperience>) =>
    setCv((c) => ({
      ...c,
      experiences: c.experiences.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));

  const snapshot = JSON.stringify(cv);
  const lastSaved = useRef(JSON.stringify(existing?.cv ?? EMPTY_PROJECTIVE_CV));
  useEffect(() => {
    if (snapshot === lastSaved.current) return;
    const t = setTimeout(() => {
      lastSaved.current = snapshot;
      persist({ cv }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const submit = useMutation({
    mutationFn: async (payload?: { fileBase64: string; fileName: string; fileMimeType: string }) => {
      if (!payload && !builderHasContent) {
        throw new Error("Commencez à remplir votre CV projectif avant de demander son évaluation.");
      }
      const signature = { cv, uploaded: payload?.fileName ?? "" };
      const unchangedSavedCv = JSON.stringify(cv) === JSON.stringify(existing?.cv ?? EMPTY_PROJECTIVE_CV);
      const currentFormat = hasCurrentCvFeedbackFormat(feedback);
      if (
        !payload &&
        currentFormat &&
        (unchangedSavedCv || isSameInput("cv-projectif", PROJECTIVE_CV_SCHOOL, signature, Boolean(feedback)))
      ) {
        await persist({ cv, status: "submitted" });
        return null;
      }
      const priorVerdict = !payload && unchangedSavedCv && feedback ? parseVerdict(feedback) : undefined;
      const res = await review({
        data: {
          cvText: cvToText(cv),
          fileBase64: payload?.fileBase64 ?? "",
          fileName: payload?.fileName ?? "cv-projectif.pdf",
          fileMimeType: payload?.fileMimeType ?? "application/pdf",
          careerProject: context.careerProject,
          careerDetails: context.careerDetails,
          schoolNotes: context.schoolNotes,
          priorVerdict,
        },
      });
      await persist({ cv, status: "submitted", ai_feedback: res.feedback });
      if (!payload) rememberInput("cv-projectif", PROJECTIVE_CV_SCHOOL, signature);
      setFeedback(res.feedback);
      return res.feedback;
    },
    onSuccess: (result) => {
      toast.success(
        result === null ? "Votre CV n'a pas changé : l'analyse du jury reste la même." : "Le jury IA a relu votre CV projectif.",
      );
      invalidate();
      // Le retour du jury est affiché sous l espace de travail : on y amène l etudiant.
      requestAnimationFrame(() => feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Fichier trop lourd (8 Mo maximum).");
      return;
    }
    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
      await submit.mutateAsync({
        fileBase64: btoa(binary),
        fileName: file.name,
        fileMimeType: file.type || "application/pdf",
      });
      setUploadReviewed(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lecture du fichier impossible.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4 p-6">
        {logo ? <img src={logo} alt="Logo SKEMA" className="size-14 shrink-0 object-contain" /> : null}
        <div className="min-w-0 flex-1">
          <p className="label-mono text-[11px]">CV projectif</p>
          <h1 className="text-3xl">{PROJECTIVE_CV_SCHOOL}</h1>
        </div>
        {feedback ? verdictBadge(parseVerdict(feedback)) : <Badge variant="secondary">Non commencé</Badge>}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <TheoryDialog
          title="Comment bien construire son CV projectif ?"
          intro={PROJECTIVE_CV.intro}
          sections={[
            { title: "Ce que le jury vérifie", points: PROJECTIVE_CV.rules },
            { title: "Les rubriques attendues", points: PROJECTIVE_CV.sections },
          ]}
          label="Comment bien construire son CV projectif ?"
        />
        {mode !== "choice" ? (
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setMode("choice")}>
            <ArrowLeft className="size-4" /> Revenir au choix
          </Button>
        ) : null}
      </div>


      {mode === "choice" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className="rounded-lg border border-border bg-card p-6 text-left shadow-[var(--shadow-card)] transition hover:border-accent/60 hover:shadow-[var(--shadow-lift)]"
          >
            <FileUp className="size-5 text-accent" />
            <span className="mt-3 block text-lg font-semibold">Je fais corriger mon CV projectif</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Vous avez déjà votre CV : importez-le (PDF ou image) et le jury IA l'analyse.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("build")}
            className="rounded-lg border border-border bg-card p-6 text-left shadow-[var(--shadow-card)] transition hover:border-accent/60 hover:shadow-[var(--shadow-lift)]"
          >
            <Sparkles className="size-5 text-accent" />
            <span className="mt-3 block text-lg font-semibold">Je construis mon CV projectif</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Vous le remplissez rubrique par rubrique, puis vous le téléchargez en PDF.
            </span>
          </button>
        </div>
      ) : null}

      {mode === "upload" ? (
        <Card className="space-y-3 p-6">
          <h2 className="text-2xl">Je fais corriger mon CV projectif</h2>
          <p className="text-sm text-muted-foreground">
            Importez-le (PDF ou image) : le jury IA l'analyse avec les mêmes exigences que SKEMA.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
            }}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInput.current?.click()}
            disabled={uploading || submit.isPending}
          >
            {uploading || submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
            Importer mon CV et le faire évaluer
          </Button>
        </Card>
      ) : null}

      {mode === "build" ? (
        <Card className="space-y-5 p-6">
        <div>
          <h2 className="text-2xl">Je construis mon CV projectif</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Remplissez au fil de votre réflexion : vous pourrez télécharger le CV en PDF, les éléments projetés en
            rouge et les éléments réels en bleu.
          </p>
        </div>

        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">En-tête</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cv-name">Nom et prénom</Label>
              <Input id="cv-name" value={cv.full_name} onChange={(e) => set({ full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-headline">Titre du CV - mon poste dans 10 ans</Label>
              <Input
                id="cv-headline"
                value={cv.headline}
                placeholder="Ex. : Chef de produit senior, secteur du luxe - Milan"
                onChange={(e) => set({ headline: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-identity">Identité projetée</Label>
              <Input
                id="cv-identity"
                value={cv.identity}
                placeholder="Ex. : né le 24/03/2006 (30 ans), permis B"
                onChange={(e) => set({ identity: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-contact">Coordonnées projetées</Label>
              <Input
                id="cv-contact"
                value={cv.contact}
                placeholder="Ex. : prenom.nom@lentreprise.com · Milan, Italie"
                onChange={(e) => set({ contact: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Formation</p>
          <div className="space-y-1.5">
            <Label htmlFor="cv-formation">Formation réelle - déjà suivie</Label>
            <p className="text-xs text-muted-foreground">Une ligne par étape : lycée, prépa.</p>
            <Textarea
              id="cv-formation"
              rows={3}
              value={cv.formation}
              placeholder={"2024-2026 : CPGE ECG - Lycée …\n2024 : Baccalauréat général, mention …"}
              onChange={(e) => set({ formation: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cv-formation-future">Formation projetée - à SKEMA et au-delà</Label>
            <p className="text-xs text-muted-foreground">
              Parcours SKEMA nommé précisément (campus, master, césures), doubles diplômes.
            </p>
            <Textarea
              id="cv-formation-future"
              rows={3}
              value={cv.formation_future}
              placeholder={"2026-2029 : Programme Grande École SKEMA - M1 campus …, M2 MSc …\n2028 : double diplôme …"}
              onChange={(e) => set({ formation_future: e.target.value })}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Parcours professionnel</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => set({ experiences: [...cv.experiences, { ...EMPTY_CV_EXPERIENCE }] })}
            >
              <Plus className="size-4" />
              Ajouter une expérience
            </Button>
          </div>
          {cv.experiences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ajoutez vos expériences réelles passées (stages, jobs) et vos expériences projetées, du plus récent au
              plus ancien.
            </p>
          ) : null}
          <div className="space-y-4">
            {cv.experiences.map((exp, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={!exp.future ? "default" : "outline"}
                      onClick={() => setExp(i, { future: false })}
                    >
                      Réelle
                    </Button>
                    <Button
                      size="sm"
                      variant={exp.future ? "default" : "outline"}
                      onClick={() => setExp(i, { future: true })}
                    >
                      Projetée
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => set({ experiences: cv.experiences.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="size-4" />
                    Supprimer
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={exp.period}
                    placeholder="Ex. : depuis janv. 2037"
                    onChange={(e) => setExp(i, { period: e.target.value })}
                  />
                  <Input
                    value={exp.role}
                    placeholder="Intitulé du poste"
                    onChange={(e) => setExp(i, { role: e.target.value })}
                  />
                  <Input
                    value={exp.company}
                    placeholder="Entreprise et division"
                    onChange={(e) => setExp(i, { company: e.target.value })}
                  />
                  <Input value={exp.place} placeholder="Ville, pays" onChange={(e) => setExp(i, { place: e.target.value })} />
                </div>
                <Textarea
                  rows={3}
                  value={exp.missions}
                  placeholder={"Une mission précise par ligne\nEx. : gestion d'un portefeuille de … marques sur …"}
                  onChange={(e) => setExp(i, { missions: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Langues, compétences et engagements
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cv-languages">Langues</Label>
              <Textarea id="cv-languages" rows={3} value={cv.languages} onChange={(e) => set({ languages: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-skills">Compétences</Label>
              <Textarea id="cv-skills" rows={3} value={cv.skills} onChange={(e) => set({ skills: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-assos">Vie associative (réelle et projetée)</Label>
              <Textarea id="cv-assos" rows={3} value={cv.associations} onChange={(e) => set({ associations: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cv-extras">Informations complémentaires</Label>
              <Textarea id="cv-extras" rows={3} value={cv.extras} onChange={(e) => set({ extras: e.target.value })} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="gap-2"
            onClick={() => submit.mutate(undefined)}
            disabled={submit.isPending || !builderHasContent}
            title={!builderHasContent ? "Commencez à remplir votre CV projectif" : undefined}
          >
            {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Faire évaluer mon CV projectif
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => downloadProjectiveCvPdf(cv)}>
            <Download className="size-4" />
            Télécharger mon CV en PDF
          </Button>
          <span className="text-xs text-muted-foreground">Vos informations sont enregistrées automatiquement.</span>
        </div>
        </Card>
      ) : null}

      {showFeedback ? (
        <Card ref={feedbackRef} className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Votre CV projectif</h2>
            {verdictBadge(parseVerdict(feedback))}
          </div>
          <AiFeedback text={feedback} />
        </Card>
      ) : null}
    </div>
  );
}
