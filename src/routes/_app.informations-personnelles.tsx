import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/vivaldi-queries";
import {
  ACQUISITION_CHANNELS,
  EXPECTATIONS,
  EXPECTATION_OTHER,
  PREPA_CLASSES,
  PREPA_LYCEES,
  SCHOOLS,
} from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app/informations-personnelles")({
  head: () => ({
    meta: [
      { title: "Informations personnelles | The Prepboard" },
      { name: "description", content: "Profil, classe prépa, lycée et écoles visées : le paramétrage de votre préparation aux oraux." },
      { property: "og:title", content: "Mes informations personnelles | The Prepboard" },
      { property: "og:description", content: "Première étape du parcours The Prepboard de préparation aux oraux CPGE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PersonalInfo,
});

const SCHOOL_NAMES = new Set(SCHOOLS.map((school) => school.name));

const sanitizeSchoolSelection = (values: Array<string | null | undefined>) =>
  values.filter((value): value is string => typeof value === "string" && SCHOOL_NAMES.has(value));

const sanitizeChoices = (
  selectedSchools: string[],
  profileChoices: { choice_1?: string | null; choice_2?: string | null; choice_3?: string | null },
) => ({
  choice_1: profileChoices.choice_1 && selectedSchools.includes(profileChoices.choice_1) ? profileChoices.choice_1 : "",
  choice_2: profileChoices.choice_2 && selectedSchools.includes(profileChoices.choice_2) ? profileChoices.choice_2 : "",
  choice_3: profileChoices.choice_3 && selectedSchools.includes(profileChoices.choice_3) ? profileChoices.choice_3 : "",
});

function PersonalInfo() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(user?.id);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    prepa_class: "",
    prepa_lycee: "",
    acquisition_channel: "",
    expectations_other: "",
  });
  const [expectations, setExpectations] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [choices, setChoices] = useState({ choice_1: "", choice_2: "", choice_3: "" });

  /** État de l'enregistrement automatique affiché à l'utilisateur. */
  const [autoSave, setAutoSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  /** Empêche l'enregistrement automatique déclenché par l'hydratation initiale. */
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!profile) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      prepa_class: profile.prepa_class,
      prepa_lycee: profile.prepa_lycee ?? "",
      acquisition_channel: profile.acquisition_channel,
      expectations_other: profile.expectations_other ?? "",
    });
    setExpectations(profile.expectations ?? []);
    const selectedSchools = sanitizeSchoolSelection(profile.target_schools ?? []);
    setSchools(selectedSchools);
    setChoices(sanitizeChoices(selectedSchools, profile));
  }, [profile]);

  const toggleSchool = (value: string) => {
    const next = schools.includes(value) ? schools.filter((v) => v !== value) : [...schools, value];
    // clear any choice that no longer belongs to the selected schools
    const nextChoices = { ...choices };
    (Object.keys(nextChoices) as Array<keyof typeof nextChoices>).forEach((k) => {
      if (nextChoices[k] && !next.includes(nextChoices[k])) nextChoices[k] = "";
    });
    setSchools(next);
    setChoices(nextChoices);
  };

  /** Construit la charge utile envoyée au backend. */
  const buildPayload = (validate: boolean) => {
    const selectedSchools = sanitizeSchoolSelection(schools);
    const validChoices = sanitizeChoices(selectedSchools, choices);
    return {
      ...form,
      expectations,
      target_schools: selectedSchools,
      ...validChoices,
      ...(validate ? { part1_completed: true } : {}),
    };
  };

  /* Enregistrement automatique : chaque modification est sauvegardée après une
     courte pause, sans aucun bouton à cliquer. */
  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    setAutoSave("saving");
    const timer = setTimeout(async () => {
      const { error } = await supabase.from("profiles").update(buildPayload(false)).eq("id", user.id);
      setAutoSave(error ? "error" : "saved");
      if (error) toast.error("Enregistrement impossible : " + error.message);
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, form, expectations, schools, choices]);

  const advance = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Vous devez être connecté pour enregistrer ces informations.");
      const { error } = await supabase.from("profiles").update(buildPayload(true)).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      navigate({ to: "/partie-2" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canAdvance = Boolean(
    form.first_name.trim() &&
      form.last_name.trim() &&
      form.acquisition_channel &&
      form.prepa_class &&
      schools.length > 0,
  );

  return (
    <div>
      <PartHeader step="Informations personnelles" title="Mes informations personnelles" />

      <div className="space-y-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {autoSave === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Enregistrement…
            </>
          ) : autoSave === "error" ? (
            <>Enregistrement impossible, vérifiez votre connexion.</>
          ) : (
            <>
              <Check className="size-4 text-success" /> Tout est enregistré automatiquement.
            </>
          )}
        </p>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl">Identité</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Prénom <span className="text-destructive">*</span></Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Nom <span className="text-destructive">*</span></Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Classe prépa <span className="text-destructive">*</span></Label>
              <Select value={form.prepa_class} onValueChange={(v) => setForm({ ...form, prepa_class: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {PREPA_CLASSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ma prépa</Label>
              <Select value={form.prepa_lycee} onValueChange={(v) => setForm({ ...form, prepa_lycee: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir mon lycée" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {PREPA_LYCEES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Comment nous avez-vous connu ? <span className="text-destructive">*</span></Label>
              <Select value={form.acquisition_channel} onValueChange={(v) => setForm({ ...form, acquisition_channel: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {ACQUISITION_CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl">Ce que j'attends de The Prepboard</h2>
          <div className="space-y-3">
            {EXPECTATIONS.map((e) => (
              <label key={e} className="flex items-start gap-3 text-sm">
                <Checkbox checked={expectations.includes(e)} onCheckedChange={() => setExpectations((prev) => prev.includes(e) ? prev.filter((v) => v !== e) : [...prev, e])} />
                <span>{e}</span>
              </label>
            ))}
          </div>
          {expectations.includes(EXPECTATION_OTHER) ? (
            <div className="space-y-1.5">
              <Label htmlFor="other">Précisez</Label>
              <Input
                id="other"
                value={form.expectations_other}
                onChange={(e) => setForm({ ...form, expectations_other: e.target.value })}
                placeholder="Ce que vous attendez en plus"
              />
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-2xl">Les écoles que je présente à l'oral <span className="text-destructive">*</span></h2>
          <p className="text-sm text-muted-foreground">
            Les réponses à cette section permettront de personnaliser la suite de votre préparation.
          </p>
          <p className="text-sm text-muted-foreground">
            Écoles des concours BCE et Ecricome, classées dans l'ordre du classement SIGEM.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SCHOOLS.map((s) => (
              <label key={s.name} className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm">
                <Checkbox checked={schools.includes(s.name)} onCheckedChange={() => toggleSchool(s.name)} />
                <span className="flex-1">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.concours}</span>
              </label>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {([1, 2, 3] as const).map((n) => {
              const key = `choice_${n}` as const;
              const takenElsewhere = (["choice_1", "choice_2", "choice_3"] as const)
                .filter((k) => k !== key)
                .map((k) => choices[k])
                .filter(Boolean);
              return (
                <div key={n} className="space-y-1.5">
                  <Label>Choix {n}</Label>
                  <Select
                    value={choices[key]}
                    onValueChange={(v) => setChoices({ ...choices, [key]: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools
                        .filter((s) => !takenElsewhere.includes(s))
                        .map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          {canAdvance ? (
            <Button onClick={() => advance.mutate()} disabled={advance.isPending} className="gap-2">
              Commencer la préparation
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <span className="group relative inline-flex" tabIndex={0}>
              <Button disabled className="pointer-events-none gap-2">
                Commencer la préparation
                <ArrowRight className="size-4" />
              </Button>
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-72 rounded-md bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Renseignez votre prénom, votre nom, votre classe prépa, comment vous nous avez connus et au moins une école présentée pour continuer.
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
