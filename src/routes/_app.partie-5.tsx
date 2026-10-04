import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { StartPanel } from "@/components/vivaldi/StartPanel";
import { PartNav } from "@/components/vivaldi/PartNav";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { NEWS_THEORY_SECTIONS } from "@/lib/theory";
import { AiFeedback } from "@/components/vivaldi/AiFeedback";
import { MonthPicker } from "@/components/vivaldi/MonthPicker";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { reviewNewsTopic } from "@/lib/ai.functions";
import { isSameInput, rememberInput } from "@/lib/feedback-cache";
import { MAX_NEWS_TOPICS, NEWS_THEORY } from "@/lib/vivaldi-data";
import {
  newsTopicMissingFields,
  useCareerProject,
  useNewsTopics,
  useProfile,
  type NewsTopic,
} from "@/lib/vivaldi-queries";

const TITLE_PLACEHOLDER = "Ex. : le rachat de la branche santé de [entreprise] annoncé en mars 2026";

type VerdictLevel = "Validé" | "À perfectionner" | "À retravailler";

function ReqLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-destructive"> *</span>
    </>
  );
}

function parseVerdict(feedback: string): VerdictLevel {
  const match = feedback.match(/## Verdict\n\s*(Validé|À perfectionner|À retravailler)/i);
  return (match?.[1] as VerdictLevel) ?? "À retravailler";
}

function verdictBadge(level: VerdictLevel) {
  if (level === "Validé") return <Badge className="bg-success text-success-foreground">Validé</Badge>;
  if (level === "À perfectionner") return <Badge className="bg-amber-500 text-white">À perfectionner</Badge>;
  return <Badge variant="destructive">À retravailler</Badge>;
}

export const Route = createFileRoute("/_app/partie-5")({
  head: () => ({
    meta: [
      { title: "Module 4 - Mes sujets d'actualités | The Prepboard" },
      {
        name: "description",
        content: "Préparez jusqu'à 3 sujets d'actualité : sources, enjeux, causes, conséquences et lien avec votre projet.",
      },
      { property: "og:title", content: "Je travaille les sujets d'actualité | The Prepboard" },
      { property: "og:description", content: "Trois sujets d'actualité maîtrisés pour tenir tout un oral CPGE." },
    ],
  }),
  component: Part5,
});

type Draft = {
  title: string;
  event_date: string;
  urls: string[];
  why_important: string;
  stakes: string;
  causes: string;
  consequences: string;
  personal_interest: string;
  interview_link: string;
};

function toDraft(t: NewsTopic): Draft {
  return {
    title: t.title,
    event_date: t.event_date ?? "",
    urls: t.urls.length ? t.urls : [""],
    why_important: t.why_important,
    stakes: t.stakes,
    causes: t.causes,
    consequences: t.consequences,
    personal_interest: t.personal_interest,
    interview_link: t.interview_link,
  };
}

function Part5() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: topics = [] } = useNewsTopics(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { data: career } = useCareerProject(user?.id);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["news_topics", user?.id] });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("news_topics").insert({ user_id: user!.id, title: "" });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const done = topics.filter((t) => t.status === "submitted").length;
  const targetSchools = [profile?.choice_1, profile?.choice_2, profile?.choice_3].filter(
    (s): s is string => Boolean(s && s.trim()),
  );

  return (
    <div className="module-form">
      <PartNav prev="/partie-4" next="/partie-6" nextEnabled={Boolean(done >= 2)} nextMessage="Validez au moins 2 sujets d'actualité pour continuer." className="mb-6" />
      <PartHeader step="Module 4" title="Mes sujets d'actualités" />
      <StartPanel
        objectif={[
            <>L'objectif de ce module est de faire émerger quelques événements d'actualité qui vous ont marqués dans les derniers mois, puis de faire ensuite le lien avec vous et de trouver les perches que vous voulez tendre à partir de ce sujet. Appuyez-vous et faites donc des liens avec le travail effectué dans les sections précédentes. L'objectif de cette question est que le jury en sache finalement un peu plus sur ... vous !</>,
        ]}
        aSavoir={[
            <>Dans ce module, The Prepboard ne vérifie pas l'exactitude des informations que vous renseignez. Il vous appartient de prendre le temps de faire avec soin le travail de recherche et d'analyse nécessaire sur l'actualité. C'est ainsi que vous progresserez et mettrez en avant des événements pertinents en lien avec certains de vos thèmes d'entretiens.</>,
            <>Vous pourrez passer au module suivant quand vous aurez validé au moins 2 sujets d'actualité.</>,
        ]}
        theory={
          <TheoryDialog
              prominent title={NEWS_THEORY.title} intro={NEWS_THEORY.intro} sections={NEWS_THEORY_SECTIONS} />
        }
        recommendation="Avant de commencer, nous vous recommandons de consulter la rubrique « Consignes théoriques » pour comprendre les attentes."
      />

      <Card className="mb-6 p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {done} / {Math.max(topics.length, 1)} sujet(s) validé(s)
          </span>
          <span className="text-muted-foreground">
            Au moins {MAX_NEWS_TOPICS} requis pour travailler la section suivante
          </span>
        </div>
        <Progress value={Math.min(done / MAX_NEWS_TOPICS, 1) * 100} />
      </Card>

      <Card className="mb-6 space-y-3 p-6">
        <h2 className="text-2xl">Ajouter un sujet d'actualité</h2>
        <p className="text-sm text-muted-foreground">
          Un sujet = un événement d'actualité précis et daté, pas une tendance générale.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => create.mutate()}
          disabled={create.isPending || topics.length >= MAX_NEWS_TOPICS}
        >
          <Plus className="size-4" />
          Nouveau sujet d'actualité
        </Button>
        {topics.length >= MAX_NEWS_TOPICS ? (
          <p className="text-xs text-muted-foreground">
            Maximum atteint : supprimez un sujet pour en travailler un autre.
          </p>
        ) : null}
      </Card>

      <div className="space-y-6">
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun sujet pour l'instant.</p>
        ) : (
          topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              careerProject={career?.job_or_field ?? ""}
              schools={targetSchools}
              onChanged={invalidate}
            />
          ))
        )}
      </div>

      <PartNav prev="/partie-4" next="/partie-6" nextEnabled={Boolean(done >= 2)} nextMessage="Validez au moins 2 sujets d'actualité pour continuer." className="mt-10" />
    </div>
  );
}

function TopicCard({
  topic,
  careerProject,
  schools,
  onChanged,
}: {
  topic: NewsTopic;
  careerProject: string;
  schools: string[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState<Draft>(() => toDraft(topic));
  const [open, setOpen] = useState(true);
  const review = useServerFn(reviewNewsTopic);

  useEffect(() => {
    setForm(toDraft(topic));
  }, [topic]);

  const set = (patch: Partial<Draft>) => setForm((f) => ({ ...f, ...patch }));

  const payload = (extra: Record<string, unknown> = {}) => ({
    title: form.title,
    event_date: form.event_date,
    urls: form.urls.map((u) => u.trim()).filter(Boolean),
    why_important: form.why_important,
    stakes: form.stakes,
    causes: form.causes,
    consequences: form.consequences,
    personal_interest: form.personal_interest,
    interview_link: form.interview_link,
    ...extra,
  });

  const persist = async (status?: "todo" | "submitted", feedback?: string) => {
    const extra: Record<string, unknown> = {};
    if (status) extra['status'] = status;
    if (feedback !== undefined) extra['ai_feedback'] = feedback;
    const { error } = await supabase.from("news_topics").update(payload(extra)).eq("id", topic.id);
    if (error) throw error;
  };

  // Auto-enregistrement silencieux (comme en module 4).
  const snapshot = JSON.stringify(payload());
  const lastSaved = useRef(snapshot);
  useEffect(() => {
    if (snapshot === lastSaved.current) return;
    const t = setTimeout(() => {
      lastSaved.current = snapshot;
      persist().catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  useEffect(() => {
    lastSaved.current = JSON.stringify(payload());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  const missing = newsTopicMissingFields({ ...topic, ...payload() } as NewsTopic);
  const complete = missing.length === 0;

  const reviewSignature = () => ({
    ...payload(),
    careerProject: careerProject.trim(),
    schools: schools.join("|"),
  });

  // Sujet validé par le jury IA et non remodifié depuis : plus besoin de proposer « inachevé ».
  const isValidated =
    topic.status === "submitted" &&
    Boolean(topic.ai_feedback) &&
    parseVerdict(topic.ai_feedback) === "Validé" &&
    isSameInput("news", topic.id, reviewSignature(), true);

  const submit = useMutation({
    mutationFn: async () => {
      const signature = reviewSignature();
      if (isSameInput("news", topic.id, signature, Boolean(topic.ai_feedback))) {
        await persist("submitted");
        return null;
      }
      const res = await review({
        data: {
          title: form.title,
          urls: form.urls.map((u) => u.trim()).filter(Boolean),
          whyImportant: form.why_important,
          stakes: form.stakes,
          causes: form.causes,
          consequences: form.consequences,
          personalInterest: form.personal_interest,
          interviewLink: form.interview_link,
          careerProject,
          schools,
        },
      });
      await persist("submitted", res.feedback);
      rememberInput("news", topic.id, signature);
      return res.feedback;
    },
    onSuccess: (result) => {
      toast.success(
        result === null
          ? "Votre sujet n'a pas changé : l'analyse du jury reste la même."
          : "Le jury IA a relu votre sujet.",
      );
      setOpen(false);
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markUnfinished = useMutation({
    mutationFn: () => persist("todo"),
    onSuccess: () => {
      setOpen(false);
      toast.message("Sujet marqué comme inachevé.");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("news_topics").delete().eq("id", topic.id);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card className="space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div
          className="min-w-0 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <h3 className="truncate text-2xl">{form.title?.trim() || "Nouveau sujet d'actualité"}</h3>
          <p className="text-xs text-muted-foreground">
            {form.urls.filter((u) => u.trim()).length} lien(s) · {missing.length} rubrique(s) à compléter
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant={topic.status === "submitted" ? "default" : "outline"} className="gap-1">
            {topic.status === "submitted" ? <Check className="size-3" /> : null}
            {topic.status === "submitted" ? "Validé" : "Inachevé"}
          </Badge>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Réduire" : "Déplier"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => del.mutate()}
            disabled={del.isPending}
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {open ? (
        <>
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Informations générales</p>

            <div className="space-y-1.5">
              <Label htmlFor={`title-${topic.id}`}>
                <ReqLabel>Nom de l'événement</ReqLabel>
                <span className="ml-1 text-xs text-muted-foreground">(court et délimité)</span>
              </Label>
              <Input
                id={`title-${topic.id}`}
                value={form.title}
                placeholder={TITLE_PLACEHOLDER}
                onChange={(e) => set({ title: e.target.value })}
              />
            </div>

            <MonthPicker
              label={<ReqLabel>Date de l'événement</ReqLabel>}
              hint="Choisissez un mois, puis un jour précis si vous le connaissez."
              value={form.event_date}
              onChange={(v) => set({ event_date: v })}
              withDay
            />

            <div className="space-y-1.5">
              <Label>
                <ReqLabel>Liens qui en parlent (5 max)</ReqLabel>
              </Label>
              <p className="text-xs text-muted-foreground">
                Presse de référence, étude, podcast - vous devez pouvoir citer vos sources devant le jury.
              </p>
              <div className="space-y-2">
                {form.urls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={url}
                        placeholder="https://…"
                        onChange={(e) => set({ urls: form.urls.map((u, j) => (j === i ? e.target.value : u)) })}
                      />
                    </div>
                    {form.urls.length > 1 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => set({ urls: form.urls.filter((_, j) => j !== i) })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {form.urls.length < 5 ? (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => set({ urls: [...form.urls, ""] })}>
                  <Plus className="size-4" />
                  Ajouter un lien
                </Button>
              ) : null}
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Mon analyse personnelle</p>
            <div className="space-y-4 rounded-lg border border-border/60 p-4">
              <Field
                id={`why-${topic.id}`}
                label="Pourquoi cet événement est important à mes yeux"
                value={form.why_important}
                onChange={(v) => set({ why_important: v })}
                placeholder="Ce qui se joue vraiment derrière cet événement."
              />
              <Field
                id={`stakes-${topic.id}`}
                label="Les enjeux"
                value={form.stakes}
                onChange={(v) => set({ stakes: v })}
                placeholder="Formulez une tension : qui gagne, qui perd, quel arbitrage."
              />
              <Field
                id={`causes-${topic.id}`}
                label="Les causes"
                value={form.causes}
                onChange={(v) => set({ causes: v })}
                placeholder="Pourquoi cela arrive maintenant."
              />
              <Field
                id={`cons-${topic.id}`}
                label="Les conséquences possibles"
                value={form.consequences}
                onChange={(v) => set({ consequences: v })}
                placeholder="Au futur, avec prudence : plusieurs scénarios."
              />
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Pourquoi j'ai choisi ce sujet</p>
            <div className="space-y-4 rounded-lg border border-border/60 p-4">
              <Field
                id={`interest-${topic.id}`}
                label="Pourquoi j'ai choisi cet événement"
                value={form.personal_interest}
                onChange={(v) => set({ personal_interest: v })}
                placeholder="Votre accroche personnelle, sincère."
              />
              <Field
                id={`link-${topic.id}`}
                label="Le ou les liens que je veux faire en entretien"
                value={form.interview_link}
                onChange={(v) => set({ interview_link: v })}
                placeholder="Tendre une perche concernant une expérience personnelle, mon projet professionnel ou l'école présentée"
              />
            </div>
          </section>

          {topic.ai_feedback ? (
            <Card className="border-accent/50 bg-secondary/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold">Retour du jury IA</p>
                {verdictBadge(parseVerdict(topic.ai_feedback))}
              </div>
              <AiFeedback text={topic.ai_feedback} />
              {isValidated ? null : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Vous pouvez améliorer maintenant, revenir plus tard (marquez le sujet comme inachevé) ou poursuivre
                  malgré ces remarques.
                </p>
              )}
            </Card>
          ) : null}

          <div className="rounded-lg border-2 border-accent/40 bg-secondary/40 p-4">
            {!complete ? (
              <p className="mb-3 text-xs text-muted-foreground">Il reste à compléter : {missing.join(", ")}.</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => submit.mutate()} disabled={submit.isPending || !complete} className="gap-2">
                {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isValidated ? "Valider mon sujet d'actualité" : "Soumettre mon sujet d'actualité"}
              </Button>
              {isValidated ? null : (
                <Button variant="ghost" onClick={() => markUnfinished.mutate()} disabled={markUnfinished.isPending}>
                  Marquer comme inachevé
                </Button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        <ReqLabel>{label}</ReqLabel>
      </Label>
      <Textarea id={id} rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
