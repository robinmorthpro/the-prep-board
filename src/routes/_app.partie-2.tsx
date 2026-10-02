import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { StartPanel } from "@/components/vivaldi/StartPanel";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { CAREER_THEORY_SECTIONS } from "@/lib/theory";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { isCareerDeepened, useCareerProject } from "@/lib/vivaldi-queries";
import { CAREER_THEORY } from "@/lib/vivaldi-data";
import { PartNav } from "@/components/vivaldi/PartNav";


export const Route = createFileRoute("/_app/partie-2")({
  head: () => ({
    meta: [
      { title: "Module 1 - Mon projet professionnel | The Prepboard" },
      { name: "description", content: "Métier ou domaine de métiers, rôle en entreprise, qualités nécessaires et actualité du métier." },
      { property: "og:title", content: "Je travaille mon projet professionnel | The Prepboard" },
      { property: "og:description", content: "Structurez un projet professionnel crédible pour les oraux CPGE." },
    ],
  }),
  component: Part2,
});

const EMPTY = {
  job_or_field: "",
  sector: "",
  description: "",
  company_role: "",
  job_names: "",
  qualities: "",
  news: "",
  companies: "",
  extra_info: "",
};

function Part2() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: career } = useCareerProject(user?.id);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!career) return;
    setForm({
      job_or_field: career.job_or_field,
      sector: career.sector,
      description: career.description,
      company_role: career.company_role,
      job_names: career.job_names,
      qualities: career.qualities,
      news: career.news,
      companies: career.companies,
      extra_info: career.extra_info,
    });
  }, [career]);

  const save = useMutation({
    mutationFn: async (validate: boolean) => {
      const { error } = await supabase
        .from("career_projects")
        .update({ ...form, ...(validate ? { deepened: true } : {}) })
        .eq("user_id", user!.id);
      if (error) throw error;
      if (validate) {
        const { error: e2 } = await supabase.from("profiles").update({ part2_completed: true }).eq("id", user!.id);
        if (e2) throw e2;
      }
    },
    onSuccess: (_d, validate) => {
      queryClient.invalidateQueries({ queryKey: ["career", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      if (validate) {
        toast.success("Projet professionnel validé - le module 3 est débloqué.");
        navigate({ to: "/partie-3" });
      } else {
        toast.success("Projet professionnel enregistré.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ready = isCareerDeepened({ ...form, user_id: "", deepened: false });

  return (
    <div>
      <PartNav prev="/informations-personnelles" next="/partie-3" nextEnabled={Boolean(ready)} nextMessage="Complétez tous les champs obligatoires de votre projet professionnel pour continuer." className="mb-6" />
      <PartHeader step="Module 1" title="Mon projet professionnel" />
      <StartPanel
        objectif={[
            <>L'objectif de ce module est de formaliser, à l'écrit, votre réflexion personnelle sur le projet professionnel que vous présenterez lors de l'entretien.</>,
        ]}
        aSavoir={[
            <>À ce stade, il n'est pas encore nécessaire de faire le lien avec l'école, cela vous sera demandé par la suite.</>,
            <>Dans ce module, The Prepboard ne vérifie ni la pertinence ni l'exactitude des informations que vous renseignez. Il vous appartient donc de vous assurer de la pertinence, de la cohérence et de la justesse de votre réflexion. C'est là que la qualité de votre travail personnel fait la différence !</>,
        ]}
        theory={
          <TheoryDialog
              prominent
              title={CAREER_THEORY.title}
              intro={CAREER_THEORY.intro}
              sections={CAREER_THEORY_SECTIONS}
            />
        }
        recommendation="Avant de commencer, nous vous recommandons de consulter la rubrique « Consignes théoriques » pour prendre connaissance des consignes et comprendre les attentes."
      />


      <div>
        <Card className="module-form flex flex-col gap-7 rounded-[24px] border-0 p-6 md:p-10">
          <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">Mon projet professionnel</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              id="job"
              label="Le métier ou domaine de métier qui m'attire"
              required
              value={form.job_or_field}
              onChange={(v) => setForm({ ...form, job_or_field: v })}
              placeholder="Chef de produit / Métiers de la finance d'entreprise"
            />
            <Field
              id="sector"
              label="Secteur"
              value={form.sector}
              onChange={(v) => setForm({ ...form, sector: v })}
              placeholder="Agro-alimentaire"
            />
          </div>

          <Field
            id="description"
            label="Ma description personnelle du métier ou domaine de métier"
            required
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Le contrôleur de gestion est quelqu'un qui ..."
          />
          <Field
            id="role"
            label="Son rôle en entreprise"
            required
            value={form.company_role}
            onChange={(v) => setForm({ ...form, company_role: v })}
            placeholder="Le marketing a pour fonction de ...."
          />
          <Field
            id="jobs"
            label="Si j'ai rentré un domaine de métier (ex : le marketing, la finance d'entreprise, la communication, etc) : quelques noms de métiers associés avec leur fonction"
            required
            value={form.job_names}
            onChange={(v) => setForm({ ...form, job_names: v })}
            placeholder="Parmi les métiers de la communication, le rôle de Community manager est de ..."
          />
          <Field
            id="qualities"
            label="Citez au moins 3 qualités requises pour y exercer. Pour chaque qualité, entrez également une anecdote durant laquelle vous avez fait preuve de cette qualité"
            required
            value={form.qualities}
            onChange={(v) => setForm({ ...form, qualities: v })}
            placeholder="Pour travailler en finance de marché, il est important d'être ... C'est une qualité dont j'ai fait preuve quand ..."
          />
          <Field
            id="news"
            label="L'actualité du métier ou du domaine de métier"
            value={form.news}
            onChange={(v) => setForm({ ...form, news: v })}
            placeholder="Vous pouvez entrer du texte ou des URL d'articles"
          />
          <Field
            id="companies"
            label="Les entreprises de référence dans votre métier ou domaine de métier"
            value={form.companies}
            onChange={(v) => setForm({ ...form, companies: v })}
            placeholder="Voyez au-delà des frontières !"
          />
          <Field
            id="extra"
            label="Informations supplémentaires"
            value={form.extra_info}
            onChange={(v) => setForm({ ...form, extra_info: v })}
            placeholder="Des figures connues, des évènements spéciaux, etc"
          />
          <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(11,18,32,0.1)] pt-7">
            <Button variant="outline" size="lg" onClick={() => save.mutate(false)} disabled={save.isPending} className="gap-[10px]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 3h11l3 3v15H5z" />
                <path d="M8 3v5h7M8 21v-7h8v7" />
              </svg>
              Enregistrer
            </Button>
            <Button
              size="lg"
              onClick={() => save.mutate(true)}
              disabled={!ready || save.isPending}
              className="gap-[10px] bg-[var(--ciel)] text-[var(--ink)] hover:bg-[var(--ciel)]/85"
            >
              Valider et débloquer le module 3
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Button>
          </div>
          <p className="-mt-2 text-[16px] text-[var(--graphite)] md:text-[17px]">
            Vous pouvez revenir modifier ces informations quand vous voulez. Si vous changez de projet, il faudra refaire le travail
            des modules suivantes qui en dépendent.
          </p>
        </Card>
      </div>
      <PartNav prev="/informations-personnelles" next="/partie-3" nextEnabled={Boolean(ready)} nextMessage="Complétez tous les champs obligatoires de votre projet professionnel pour continuer." className="mt-10" />
    </div>
  );
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const isTextarea =
    id === "description" ||
    id === "role" ||
    id === "jobs" ||
    id === "qualities" ||
    id === "news" ||
    id === "companies" ||
    id === "extra";

  return (
    <div className="flex flex-col gap-[10px]">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-[var(--bleu-texte)]"> *</span> : null}
      </Label>
      {isTextarea ? (
        <Textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
