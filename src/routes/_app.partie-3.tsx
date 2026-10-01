import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { SCHOOLS_THEORY_SECTIONS } from "@/lib/theory";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import {
  isSheetFinished,
  itemMissingFields,
  sheetMissingFields,

  useProfile,
  useSchoolSheets,
  SHEET_ITEM_KINDS,
  type SchoolSheet,
  type SheetItem,
  type SheetItemKind,
} from "@/lib/vivaldi-queries";
import { KNOWLEDGE, SCHOOL_SHEET_EXAMPLE } from "@/lib/vivaldi-data";
import { downloadSchoolSheetPdf } from "@/lib/school-sheet-pdf";
import { schoolLogo } from "@/lib/school-logos";
import { schoolPhotoOrFallback } from "@/components/vivaldi/school-photos";

import { PartNav } from "@/components/vivaldi/PartNav";

export const Route = createFileRoute("/_app/partie-3")({
  head: () => ({
    meta: [
      { title: "Module 2 - Mes fiches écoles | The Prepboard" },
      { name: "description", content: "Une fiche par école : socle générique et éléments spécifiques justifiés par votre projet pro." },
      { property: "og:title", content: "Je travaille mes connaissances des écoles | The Prepboard" },
      { property: "og:description", content: "Fiches écoles BCE et Ecricome reliées à votre projet professionnel." },
    ],
  }),
  component: Part3,
});

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function ReqLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-destructive"> *</span>
    </>
  );
}

function Part3() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(user?.id);
  
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const [newSchool, setNewSchool] = useState("");

  const targets = profile?.target_schools ?? [];
  const used = sheets.map((s) => s.school);
  const available = targets.filter((s) => !used.includes(s));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sheets", user?.id] });

  const addSheet = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("school_sheets").insert({ user_id: user!.id, school: newSchool });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewSchool("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const finished = sheets.filter(isSheetFinished).length;

  return (
    <div>
      <PartNav prev="/partie-2" next="/partie-4" nextEnabled={Boolean(finished >= 1)} nextMessage="Validez au moins une fiche école complète pour continuer." className="mb-6" />
      <PartHeader step="Module 2" title="Mes fiches écoles">
        <div className="mt-4">
          <TheoryDialog
            title={KNOWLEDGE.schools.title}
            intro="Les consignes théoriques de ce module, les attendus du jury sur les questions liées à l'école, plus un modèle de fiche école."
            sections={SCHOOLS_THEORY_SECTIONS}
          >
            <Card className="mt-4 p-4">
              <p className="text-sm font-semibold">Modèle de fiche école</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {SCHOOL_SHEET_EXAMPLE.project} - {SCHOOL_SHEET_EXAMPLE.school}
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {SCHOOL_SHEET_EXAMPLE.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-medium text-primary">{k}</dt>
                    <dd className="text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </TheoryDialog>
        </div>
      </PartHeader>

      <Card className="mb-6 flex gap-3 border-accent/50 bg-secondary/50 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            L'objectif de ce module est de formaliser, à l'écrit, vos recherches sur l'ensemble des éléments
            spécifiques qui vous intéressent parmi les écoles que vous présenterez lors de l'entretien.
          </p>
          <p>
            Avant de commencer, nous vous recommandons de consulter la rubrique « Consignes théoriques » pour prendre
            connaissance des consignes et comprendre les attentes.
          </p>
          <div>
            <p className="font-medium text-foreground">À savoir :</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>
                Dans ce module, The Prepboard ne vérifie ni la pertinence ni l'exactitude des informations que vous
                renseignez sur l'école. Il vous appartient de faire le travail de recherche nécessaire à votre
                découverte de l'école. C'est ainsi que vous progresserez et que vous saurez réellement ce que l'école
                propose spécifiquement pour votre projet. Encore une fois, avant même le stade de l'entraînement oral,
                c'est la qualité de votre travail personnel préparatoire qui fait la différence !
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <Badge variant="outline">
          {finished} école{finished > 1 ? "s" : ""} terminée{finished > 1 ? "s" : ""} sur {targets.length} à préparer
        </Badge>
      </div>

      <Card className="mb-6 space-y-3 p-6">
        <h2 className="text-2xl">Sélectionner une école à travailler</h2>
        {targets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Choisissez d'abord vos écoles dans le module 1 pour pouvoir créer une fiche.
          </p>
        ) : (

          <div className="flex flex-wrap gap-3">
            <Select value={newSchool} onValueChange={setNewSchool}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder={available.length ? "Choisir une école" : "Toutes vos écoles sont créées"} />
              </SelectTrigger>
              <SelectContent>
                {available.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => addSheet.mutate()} disabled={!newSchool || addSheet.isPending} className="gap-2">
              <Plus className="size-4" />
              Créer la fiche
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-6">
        {sheets.map((s) => (
          <SheetCard key={s.id} sheet={s} onSaved={invalidate} />
        ))}
      </div>

      <PartNav prev="/partie-2" next="/partie-4" nextEnabled={Boolean(finished >= 1)} nextMessage="Validez au moins une fiche école complète pour continuer." className="mt-10" />
    </div>
  );
}

function SheetCard({ sheet, onSaved }: { sheet: SchoolSheet; onSaved: () => void }) {
  const backupKey = `vivaldi:sheet:${sheet.id}`;
  const [f, setF] = useState<SchoolSheet>(() => {
    if (typeof window === "undefined") return sheet;
    try {
      const raw = localStorage.getItem(backupKey);
      if (raw) return { ...sheet, ...(JSON.parse(raw) as Partial<SchoolSheet>) };
    } catch {
      /* ignore */
    }
    return sheet;
  });
  const [autoState, setAutoState] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [open, setOpen] = useState(true);

  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setF(sheet);
  }, [sheet]);

  const persist = async (source: "auto" | "manuel", data: SchoolSheet) => {
    const { id, ...rest } = data;
    const payload = { ...rest, finished: isSheetFinished(data) };
    const { data: res, error } = await supabase
      .from("school_sheets")
      .update(payload)
      .eq("id", id)
      .select("id, updated_at, finished")
      .maybeSingle();
    if (error) {
      throw error;
    }
    try {
      localStorage.removeItem(backupKey);
    } catch {
      /* ignore */
    }
    dirty.current = false;
    return res;
  };

  // Autosave : 0,7 s après la dernière frappe, avec sauvegarde locale de secours.
  useEffect(() => {
    if (!dirty.current) return;
    try {
      localStorage.setItem(backupKey, JSON.stringify(f));
    } catch {
      /* ignore */
    }
    setAutoState("pending");
    const t = setTimeout(() => {
      persist("auto", f)
        .then(() => {
          setAutoState("saved");
          onSaved();
        })
        .catch(() => setAutoState("error"));
    }, 700);
    return () => clearTimeout(t);
  }, [f]);

  // Filet de sécurité : si l'utilisateur quitte la page ou la fiche avant la fin du délai
  // d'autosave, on envoie immédiatement la dernière version saisie.
  const latest = useRef(f);
  latest.current = f;
  useEffect(() => {
    const flush = () => {
      if (dirty.current) void persist("auto", latest.current).catch(() => undefined);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  const save = useMutation({
    mutationFn: () => persist("manuel", f),
    onSuccess: () => {
      setAutoState("saved");
      setSaveErrors([]);
      toast.success("Fiche enregistrée.");
      setOpen(false);
      onSaved();
    },
    onError: (e: Error) => {
      setAutoState("error");
      toast.error(e.message);
    },
  });

  const markUnfinished = useMutation({
    mutationFn: async () => {
      const { id, ...rest } = f;
      const payload = { ...rest, finished: false };
      const { error } = await supabase.from("school_sheets").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setAutoState("saved");
      setSaveErrors([]);
      setOpen(false);
      toast.message("Fiche marquée comme inachevée.");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("school_sheets").delete().eq("id", sheet.id);
      if (error) throw error;
    },
    onSuccess: onSaved,
    onError: (e: Error) => toast.error(e.message),
  });

  const done = isSheetFinished(f);
  const completeCount = (f.items ?? []).filter((i) => itemMissingFields(i).length === 0).length;
  const specificMinimumReached = completeCount >= 3;
  const specificCountLabel = `${completeCount}/3 éléments spécifiques complets`;
  const specificSectionLabel = specificMinimumReached
    ? `${specificCountLabel} - minimum atteint`
    : `${specificCountLabel} - 3 requis pour valider`;
  const set = (k: keyof SchoolSheet) => (v: string) => {
    dirty.current = true;
    setSaveErrors([]);
    setF({ ...f, [k]: v });
  };

  const setItems = (items: SheetItem[]) => {
    dirty.current = true;
    setSaveErrors([]);
    setF({ ...f, items });
  };
  const addItem = (kind: SheetItemKind) =>
    setItems([
      ...(f.items ?? []),
      { id: crypto.randomUUID(), kind, name: "", description: "", url: "", why: "" },
    ]);
  const updateItem = (id: string, patch: Partial<SheetItem>) =>
    setItems((f.items ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => setItems((f.items ?? []).filter((i) => i.id !== id));

  const autoLabel =
    autoState === "pending"
      ? "Enregistrement automatique…"
      : autoState === "saved"
        ? "Enregistré automatiquement"
        : autoState === "error"
          ? "Échec de l'enregistrement - brouillon conservé localement"
          : "Autosave activé";

  return (
    <Card className="space-y-5 p-6">
      <div className="relative -mx-6 -mt-6 h-44 overflow-hidden bg-ink">
        <img
          src={schoolPhotoOrFallback(sheet.school)}
          alt={`Campus ${sheet.school}`}
          className="size-full object-cover object-center opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-3">

        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setOpen((o) => !o)}
        >
          {schoolLogo(sheet.school) ? (
            <img
              src={schoolLogo(sheet.school)}
              alt={`Logo ${sheet.school}`}
              className="size-10 shrink-0 rounded-md border border-border/60 bg-white object-contain p-1"
              loading="lazy"
            />
          ) : null}
          <h3 className="text-2xl">{sheet.school}</h3>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant={done ? "default" : "outline"} className="gap-1">
            {done ? <Check className="size-3" /> : null}
            {done ? "Terminée" : "Inachevée"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              const missing = sheetMissingFields(f);
              const invalidUrls = (f.items ?? [])
                .filter((i) => i.url.trim() && !isValidUrl(i.url))
                .map((i) => `URL invalide - ${i.kind}${i.name ? ` - ${i.name}` : ""}`);
              const errors = [...missing, ...invalidUrls];
              if (errors.length > 0) {
                setSaveErrors(errors);
                toast.error("Tous les champs obligatoires ne sont pas remplis", {
                  description: errors.slice(0, 4).join(" • "),
                  duration: 6000,
                });
                setOpen(true);
                return;
              }
              void downloadSchoolSheetPdf(f);
            }}
          >
            <Download className="size-4" />
            PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Réduire" : "Déplier"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => {
              if (window.confirm(`Supprimer la fiche ${sheet.school} ?`)) del.mutate();
            }}
            disabled={del.isPending}
          >
            <Trash2 className="size-4" />
            Supprimer la fiche
          </Button>
        </div>
      </div>

      {open ? (
        <>
      <section className="space-y-4">

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Informations générales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label={<ReqLabel>Baseline / slogan de l'école</ReqLabel>} value={f.baseline} onChange={set("baseline")} />
          <Text label={<ReqLabel>Année de création</ReqLabel>} value={f.founded_year} onChange={set("founded_year")} />
          <Text label={<ReqLabel>Nom du directeur ou de la directrice</ReqLabel>} value={f.director} onChange={set("director")} />
          <Text label={<ReqLabel>Campus</ReqLabel>} value={f.campuses} onChange={set("campuses")} />
        </div>
        <Area
          label="Autres éléments que je juge importants"
          value={f.generic_other}
          onChange={set("generic_other")}
          placeholder="Accréditations, associations d'alumni, pédagogie, classements…"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Éléments spécifiques à mon projet professionnel
          </p>
          <Badge variant={specificMinimumReached ? "default" : "secondary"} className="text-xs">
            {specificSectionLabel}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {SHEET_ITEM_KINDS.map((kind) => (
            <Button key={kind} variant="outline" size="sm" className="gap-1" onClick={() => addItem(kind)}>
              <Plus className="size-4" />
              {kind}
            </Button>
          ))}
        </div>

        {(f.items ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ajoutez les éléments de l'école qui vous intéressent en cliquant ci-dessus.
          </p>
        ) : (
          <div className="space-y-4">
            {(f.items ?? []).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onChange={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {saveErrors.length > 0 ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">À compléter avant de pouvoir enregistrer la fiche :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {saveErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            const missing = sheetMissingFields(f);
            const invalidUrls = (f.items ?? [])
              .filter((i) => i.url.trim() && !isValidUrl(i.url))
              .map((i) => `URL invalide - ${i.kind}${i.name ? ` - ${i.name}` : ""}`);
            const errors = [...missing, ...invalidUrls];
            if (errors.length > 0) {
              setSaveErrors(errors);
              toast.error("Tous les champs obligatoires ne sont pas remplis", {
                description: errors.slice(0, 4).join(" • "),
                duration: 6000,
              });
              setOpen(true);
              return;
            }
            save.mutate();
          }}
          disabled={save.isPending}
        >
          Valider la fiche
        </Button>
        <Button
          variant="ghost"
          onClick={() => markUnfinished.mutate()}
          disabled={markUnfinished.isPending}
        >
          Marquer comme inachevée
        </Button>
        <span className={`ml-auto text-xs ${autoState === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {autoLabel}
        </span>
      </div>
        </>
      ) : null}
    </Card>

  );
}

function Text({ label, value, onChange }: { label: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ItemCard({
  item,
  onChange,
  onRemove,
}: {
  item: SheetItem;
  onChange: (patch: Partial<SheetItem>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const gaps = itemMissingFields(item);

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex min-w-0 cursor-pointer items-center gap-2"
          onClick={() => setOpen((o) => !o)}
        >
          <Badge variant="secondary">{item.kind}</Badge>
          {item.name?.trim() ? (
            <span className="truncate text-sm text-muted-foreground">{item.name}</span>
          ) : null}
          {gaps.length > 0 ? (
            <Badge variant="outline" className="gap-1 text-destructive">
              <AlertTriangle className="size-3" />
              {gaps.length} champ{gaps.length > 1 ? "s" : ""} manquant{gaps.length > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Check className="size-3" />
              Complet
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Réduire" : "Déplier"}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={onRemove}>
            <Trash2 className="size-4" />
            Retirer
          </Button>
        </div>
      </div>
      {open ? (
        <>
          <Text label={<ReqLabel>Nom exact</ReqLabel>} value={item.name} onChange={(v) => onChange({ name: v })} />
          <Area label={<ReqLabel>Description et informations. N'oubliez pas d'insérer ce qui le distingue parmi ce que propose les autres écoles</ReqLabel>} value={item.description} onChange={(v) => onChange({ description: v })} />
          <div className="space-y-1.5">
            <Label><ReqLabel>URL de référence</ReqLabel></Label>
            <Input
              type="url"
              value={item.url ?? ""}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://..."
            />
            {item.url.trim() && !isValidUrl(item.url) ? (
              <p className="text-xs text-destructive">Format d'URL invalide</p>
            ) : null}
          </div>
          <Area
            label={<ReqLabel>Pourquoi cela m'intéresse ? Lien avec mes projets professionnels ou personnels</ReqLabel>}
            value={item.why}
            onChange={(v) => onChange({ why: v })}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1"
              onClick={() => setOpen(false)}
            >
              <Check className="size-4" />
              Valider et réduire cet élément
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

