import { AiFeedback } from "@/components/vivaldi/AiFeedback";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  History,
  Loader2,
  RotateCcw,
  School,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { PartNav } from "@/components/vivaldi/PartNav";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { questionSections } from "@/lib/theory";
import { OralAnswer } from "@/components/vivaldi/OralAnswer";
import { schoolPhotoOrFallback } from "@/components/vivaldi/school-photos";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { reviewAnswer } from "@/lib/ai.functions";
import { isSameInput, rememberInput } from "@/lib/feedback-cache";
import { KEY_QUESTION_THEMES, KEY_QUESTIONS, type KeyQuestion } from "@/lib/vivaldi-data";
import {
  useAllQuestionAttempts,
  useCareerProject,
  useExperiences,
  useProfile,
  useQuestionAnswers,
  useQuestionAttempts,
  type QuestionAnswer,
  type QuestionAttempt,
} from "@/lib/vivaldi-queries";

type VerdictLevel = "Validé" | "À perfectionner" | "À retravailler";

/** Statut affiché dans le menu des questions. */
type QuestionStatus = "Non commencé" | "À revoir" | "À perfectionner" | "Validé";

const THEME_EMOJI: Record<string, string> = {
  Présentation: "👋",
  "Questions sur vous": "🙋",
  "École de commerce": "🎓",
  "Votre futur": "🚀",
  Actualité: "📰",
  "Région de l'école": "📍",
  Management: "🧭",
  "Questions déstabilisantes": "🎲",
  Conclusion: "🏁",
  "Clermont SB": "🌱",
  "EDHEC BS": "🗣️",
  "emlyon BS": "🃏",
  "ESSEC BS": "🎭",
};

/** Emoji des sous-parties (axes Clermont, cartes emlyon, compétences ESSEC). */
const SUB_THEME_EMOJI: Record<string, string> = {
  People: "🤝",
  Planet: "🌍",
  Profit: "💰",
  Expérience: "💼",
  Personnalité: "🙋",
  Projet: "🚀",
  Créativité: "💡",
  "Sens des valeurs et intégrité": "⚖️",
  "Compétences collectives": "🤝",
  "Capacités entrepreneuriales": "💼",
  "Capacités d'organisation": "🗂️",
};

/** Thèmes dont les questions portent sur une école précise : on demande laquelle. */
const SCHOOL_SPECIFIC_THEMES = ["École de commerce", "Région de l'école"];

/** Thèmes réservés aux candidats qui présentent une école donnée. */
const SCHOOL_RESERVED_THEMES: Record<string, string> = {
  "Clermont SB": "ESC Clermont BS",
  "EDHEC BS": "EDHEC",
  "emlyon BS": "emlyon",
  "ESSEC BS": "ESSEC",
};


function isSchoolSpecific(question: KeyQuestion) {
  return SCHOOL_SPECIFIC_THEMES.includes(question.theme);
}

/**
 * Regroupe les questions d'un thème par sous-partie (ordre d'apparition).
 * Un thème sans sous-partie renvoie un seul groupe sans intitulé.
 */
function groupQuestions(questions: KeyQuestion[]): { subTheme?: string | undefined; questions: KeyQuestion[] }[] {
  if (!questions.some((q) => q.subTheme)) return [{ questions }];
  const groups: { subTheme?: string | undefined; questions: KeyQuestion[] }[] = [];
  questions.forEach((q) => {
    const key = q.subTheme;
    const existing = groups.find((g) => g.subTheme === key);
    if (existing) existing.questions.push(q);
    else groups.push({ subTheme: key, questions: [q] });
  });
  return groups;
}


function parseVerdict(feedback: string): VerdictLevel {
  const match = feedback.match(/## Verdict\n\s*(Validé|À perfectionner|À retravailler)/i);
  return (match?.[1] as VerdictLevel) ?? "À retravailler";
}

function verdictBadge(level: VerdictLevel) {
  if (level === "Validé") {
    return <Badge className="bg-success text-success-foreground">Validé</Badge>;
  }
  if (level === "À perfectionner") {
    return <Badge className="bg-amber-500 text-white">À perfectionner</Badge>;
  }
  return <Badge variant="destructive">À retravailler</Badge>;
}

function statusFromVerdict(level: VerdictLevel): QuestionStatus {
  if (level === "Validé") return "Validé";
  if (level === "À perfectionner") return "À perfectionner";
  return "À revoir";
}

const STATUS_RANK: Record<QuestionStatus, number> = {
  "Non commencé": 0,
  "À revoir": 1,
  "À perfectionner": 2,
  Validé: 3,
};

function statusBadge(status: QuestionStatus) {
  if (status === "Validé") return <Badge className="bg-success text-success-foreground">Validé</Badge>;
  if (status === "À perfectionner") return <Badge className="bg-amber-500 text-white">À perfectionner</Badge>;
  if (status === "À revoir") return <Badge variant="destructive">À revoir</Badge>;
  return <Badge variant="secondary">Non commencé</Badge>;
}

export const Route = createFileRoute("/_app/partie-7")({
  head: () => ({
    meta: [
      { title: "Module 7 - Mon entraînement sur les questions clés | The Prepboard" },
      { name: "description", content: "Entraînement question par question, à l'oral, avec correction IA." },
      { property: "og:title", content: "Je m'entraîne à l'oral sur les questions clés | The Prepboard" },
      { property: "og:description", content: "Les questions clés des oraux CPGE, travaillées une par une." },
    ],
  }),
  component: Part6,
});

function Part6() {
  const { user } = useSession();
  const { data: answers = [] } = useQuestionAnswers(user?.id);
  const { data: attempts = [] } = useAllQuestionAttempts(user?.id);
  const { data: profile } = useProfile(user?.id);
  /** Écoles présentées par le candidat : sert à masquer les thèmes réservés. */
  const mySchools = useMemo(() => {
    const list = [profile?.choice_1, profile?.choice_2, profile?.choice_3, ...(profile?.target_schools ?? [])];
    return new Set(list.filter((s): s is string => Boolean(s && s.trim())).map((s) => s.trim()));
  }, [profile]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openThemes, setOpenThemes] = useState<string[]>([]);

  /** Meilleur statut obtenu par question, tous passages confondus. */
  const statuses = useMemo(() => {
    const map = new Map<string, QuestionStatus>();
    const consider = (questionId: string, feedback: string) => {
      if (!feedback) return;
      const next = statusFromVerdict(parseVerdict(feedback));
      const current = map.get(questionId) ?? "Non commencé";
      if (STATUS_RANK[next] > STATUS_RANK[current]) map.set(questionId, next);
    };
    attempts.forEach((a) => consider(a.question_id, a.ai_feedback));
    answers.forEach((a) => consider(a.question_id, a.ai_feedback));
    return map;
  }, [attempts, answers]);

  const selected = KEY_QUESTIONS.find((q) => q.id === selectedId) ?? null;

  if (selected) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => setSelectedId(null)}>
          <ArrowLeft className="size-4" /> Toutes les questions
        </Button>
        <QuestionWorkspace
          key={selected.id}
          question={selected}
          existing={answers.find((a) => a.question_id === selected.id) ?? null}
          onBackToMenu={() => setSelectedId(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <PartNav prev="/partie-6" next="/partie-8" className="mb-6" />
      <PartHeader step="Module 7" title="Mon entraînement sur les questions clés" />

      <Card className="mb-6 flex gap-3 border-accent/50 bg-secondary/50 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            L'objectif de ce module est de commencer à vous entraîner, à l'écrit ou à l'oral, sur les questions
            classiques de l'entretien.
          </p>
          <p>
            Pour chaque question, vous devez répondre à l'oral, et notre outil vous donnera un feedback en temps réel.
            Vous pourrez vous entraîner autant de fois que vous voudrez sur chaque question.
          </p>
          <p>
            Avant de vous lancer, préparez bien votre réponse en vous appuyant sur le travail effectué jusqu'à présent
            et sur les consignes théoriques pour chaque question.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {KEY_QUESTION_THEMES.map((theme) => {
          const reservedFor = SCHOOL_RESERVED_THEMES[theme];
          if (reservedFor && !mySchools.has(reservedFor)) return null;
          const qs = KEY_QUESTIONS.filter((q) => q.theme === theme);
          if (!qs.length) return null;
          const open = openThemes.includes(theme);
          return (
            <Card key={theme} className="h-fit p-5">
              <button
                type="button"
                onClick={() => setOpenThemes((t) => (open ? t.filter((x) => x !== theme) : [...t, theme]))}
                className="flex w-full cursor-pointer items-center gap-3 text-left"
              >
                <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition ${open ? "" : "-rotate-90"}`} />
                <span className="flex-1">
                  <span className="text-lg font-semibold">
                    <span aria-hidden className="mr-2">
                      {THEME_EMOJI[theme] ?? "🎯"}
                    </span>
                    {theme}
                  </span>
                  <span className="block text-xs text-muted-foreground">{qs.length} question(s)</span>
                </span>
              </button>

              {open ? (
                <div className="mt-4 space-y-5">
                  {groupQuestions(qs).map(({ subTheme, questions }) => (
                    <div key={subTheme ?? "_"}>
                      {subTheme ? (
                        <p className="mb-2 text-sm font-semibold">
                          <span aria-hidden className="mr-2">
                            {SUB_THEME_EMOJI[subTheme] ?? "🎯"}
                          </span>
                          {subTheme}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {questions.length} question(s)
                          </span>
                        </p>
                      ) : null}
                      <ul className="space-y-2">
                        {questions.map((q) => (
                          <li key={q.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(q.id)}
                              className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-left transition hover:border-accent/50 hover:bg-secondary"
                            >
                              <span className="flex-1 text-sm">{q.question}</span>
                              {statusBadge(statuses.get(q.id) ?? "Non commencé")}
                              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}

            </Card>
          );
        })}
      </div>

      <PartNav prev="/partie-6" next="/partie-8" className="mt-10" />
    </div>
  );
}

function QuestionWorkspace({
  question,
  existing,
  onBackToMenu,
}: {
  question: KeyQuestion;
  existing: QuestionAnswer | null;
  onBackToMenu: () => void;
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(user?.id);
  const { data: career } = useCareerProject(user?.id);
  const { data: experiences = [] } = useExperiences(user?.id);
  const askAi = useServerFn(reviewAnswer);

  const [answer, setAnswer] = useState(existing?.answer ?? "");
  const [feedback, setFeedback] = useState(existing?.ai_feedback ?? "");
  const [reviewing, setReviewing] = useState(false);

  const needsSchool = isSchoolSpecific(question);
  const schoolOptions = useMemo(() => {
    const list = [profile?.choice_1, profile?.choice_2, profile?.choice_3, ...(profile?.target_schools ?? [])]
      .filter((s): s is string => Boolean(s && s.trim()));
    return Array.from(new Set(list));
  }, [profile]);
  const [school, setSchool] = useState(existing?.school ?? "");

  const verdict = feedback ? parseVerdict(feedback) : null;
  const validated = verdict === "Validé";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["question_answers", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["question_attempts", user?.id] });
  };

  async function persist(status: string, aiFeedback: string) {
    const payload = {
      user_id: user!.id,
      question_id: question.id,
      answer,
      ai_feedback: aiFeedback,
      status,
      school: needsSchool ? school : "",
    };
    if (existing) {
      const { error } = await supabase.from("question_answers").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("question_answers").insert(payload);
      if (error) throw error;
    }
  }

  const finish = useMutation({
    mutationFn: () => persist("submitted", feedback),
    onSuccess: () => {
      invalidate();
      toast.success("Question terminée.");
      onBackToMenu();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function evaluate() {
    if (needsSchool && !school) {
      toast.error("Choisissez d'abord l'école que vous présentez pour cette question.");
      return;
    }
    const cacheKey = needsSchool ? `${question.id}::${school}` : question.id;
    if (isSameInput("question", cacheKey, answer, Boolean(feedback))) {
      toast.message("Votre réponse n'a pas changé : la correction du jury reste la même.");
      return;
    }
    setReviewing(true);
    try {
      const res = await askAi({
        data: {
          question: needsSchool ? `${question.question} (école présentée : ${school})` : question.question,
          intent: question.intent,
          criteria: question.criteria,
          pitfalls: question.pitfalls,
          answer,
          careerProject: career?.job_or_field ?? "",
          schools: needsSchool ? [school] : (profile?.target_schools ?? []),
          experiences: experiences.filter((e) => e.status === "submitted").map((e) => `${e.name} : ${e.story}`),
        },
      });
      setFeedback(res.feedback);
      rememberInput("question", cacheKey, answer);
      await persist(existing?.status === "submitted" ? "submitted" : "draft", res.feedback);
      const { error: attemptError } = await supabase.from("question_attempts").insert({
        user_id: user!.id,
        question_id: question.id,
        answer,
        ai_feedback: res.feedback,
        school: needsSchool ? school : "",
      });
      invalidate();
      if (attemptError) {
        toast.warning(
          "Correction affichée, mais non archivée dans l'historique : la connexion réseau a échoué. Vérifiez votre connexion et relancez la correction pour la conserver.",
        );
      } else {
        toast.success("Correction générée.");
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Correction IA impossible.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <Card className="space-y-5 p-6">
      {needsSchool && school ? (
        <div className="relative -mx-6 -mt-6 h-44 overflow-hidden bg-ink">
          <img
            src={schoolPhotoOrFallback(school)}
            alt={`Campus ${school}`}
            className="size-full object-cover object-center opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
          <span className="absolute bottom-3 left-4 font-serif text-lg text-[var(--craie)]">{school}</span>
        </div>
      ) : null}
      <div>
        <Badge variant="secondary">
          <span aria-hidden className="mr-1">
            {THEME_EMOJI[question.theme] ?? "🎯"}
          </span>
          {question.theme}
        </Badge>
        <h1 className="mt-3 text-3xl">{question.question}</h1>
        <div className="mt-4">
          <TheoryDialog
            label="Les attendus de la question"
            title={question.question}
            intro="Ce que le jury cherche derrière cette question, les critères d'une bonne réponse et les pièges à éviter."
            sections={questionSections(question)}
          />
        </div>
      </div>

      {needsSchool ? (
        <div className="rounded-lg border border-accent/40 bg-secondary/50 p-4">
          <Label htmlFor="school">École présentée *</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Cette question porte sur une école précise : choisissez celle que vous présentez pour cet entraînement. Votre
            historique sera classé école par école.
          </p>
          {schoolOptions.length === 0 ? (
            <p className="mt-2 text-xs text-destructive">
              Aucune école renseignée : complétez d'abord vos choix d'écoles en module 1.
            </p>
          ) : (
            <Select value={school} onValueChange={setSchool}>
              <SelectTrigger id="school" className="mt-2">
                <SelectValue placeholder="Choisir une école" />
              </SelectTrigger>
              <SelectContent>
                {schoolOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : null}



      <div>
        <Label htmlFor="answer">Votre réponse (orale ou écrite)</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Répondez à voix haute, ou écrivez directement. Relisez la transcription avant de la soumettre.
        </p>
        <Textarea
          id="answer"
          className="mt-2 min-h-36"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Votre réponse au jury…"
        />
        <div className="mt-2">
          <OralAnswer label="Répondre à l'oral" onTranscript={(t) => setAnswer((a) => `${a}\n${t}`.trim())} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {validated ? (
          <Button size="sm" onClick={() => finish.mutate()} disabled={finish.isPending}>
            <Check className="size-4" /> J'ai terminé cette question
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={evaluate} disabled={reviewing || !answer.trim()}>
            {reviewing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Je soumets ma réponse
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAnswer("");
            setFeedback("");
          }}
        >
          <RotateCcw className="size-4" /> Recommencer
        </Button>
        {feedback && !validated ? (
          <Button variant="ghost" size="sm" onClick={onBackToMenu}>
            <ArrowLeft className="size-4" /> Je change de question
          </Button>
        ) : null}
      </div>

      {feedback ? (
        <div className="rounded-lg border border-accent/40 bg-secondary/60 p-4 text-sm leading-relaxed">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="size-4 text-accent" /> Correction du jury IA
            </p>
            {verdictBadge(parseVerdict(feedback))}
          </div>
          <AiFeedback text={feedback} />
        </div>
      ) : null}

      <AttemptHistory questionId={question.id} groupBySchool={needsSchool} onReuse={setAnswer} />
    </Card>
  );
}

function AttemptHistory({
  questionId,
  groupBySchool,
  onReuse,
}: {
  questionId: string;
  groupBySchool: boolean;
  onReuse: (text: string) => void;
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: attempts = [], isLoading } = useQuestionAttempts(user?.id, questionId);
  const [openId, setOpenId] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("question_attempts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question_attempts", user?.id] });
      toast.success("Passage supprimé de l'historique.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Passages regroupés par école pour les questions propres à une école. */
  const groups = useMemo(() => {
    if (!groupBySchool) return [["", attempts]] as [string, QuestionAttempt[]][];
    const map = new Map<string, QuestionAttempt[]>();
    attempts.forEach((a) => {
      const key = a.school?.trim() || "École non précisée";
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "fr"));
  }, [attempts, groupBySchool]);

  const renderItem = (a: QuestionAttempt, label: string) => {
    const open = openId === a.id;
    return (
      <li key={a.id} className="rounded-lg border border-border bg-background/60">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setOpenId(open ? null : a.id)}
            className="flex flex-1 cursor-pointer items-center gap-3 text-left"
          >
            <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition ${open ? "" : "-rotate-90"}`} />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(a.created_at).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {a.ai_feedback ? verdictBadge(parseVerdict(a.ai_feedback)) : null}
          </button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Supprimer ce passage"
            disabled={remove.isPending}
            onClick={() => remove.mutate(a.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
        {open ? (
          <div className="space-y-3 border-t border-border px-3 py-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ma réponse</p>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onReuse(a.answer)}>
                  <RotateCcw className="size-3" /> Reprendre ce texte
                </Button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{a.answer}</p>
            </div>
            {a.ai_feedback ? (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Correction du jury IA
                </p>
                <AiFeedback text={a.ai_feedback} />
              </div>
            ) : null}
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
        <History className="size-4 text-accent" /> Historique de mes passages
        <Badge variant="secondary">{attempts.length}</Badge>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {groupBySchool
          ? "Chaque correction IA est archivée avec la transcription correspondante, classée par école présentée."
          : "Chaque correction IA est archivée avec la transcription correspondante : comparez vos passages pour suivre votre progression."}
      </p>

      {isLoading ? (
        <p className="mt-3 text-xs text-muted-foreground">Chargement…</p>
      ) : attempts.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Aucun passage archivé pour l'instant. Soumettez une réponse pour créer le premier.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map(([schoolName, items]) => (
            <div key={schoolName || "all"}>
              {groupBySchool ? (
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <School className="size-3.5 text-accent" /> {schoolName}
                  <Badge variant="secondary">{items.length}</Badge>
                </p>
              ) : null}
              <ul className="space-y-2">{items.map((a, i) => renderItem(a, `Passage n°${items.length - i}`))}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

