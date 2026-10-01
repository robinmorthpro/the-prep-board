/**
 * Popup de structure officielle affiché avant le démarrage d'un entretien.
 *
 * Il dit trois choses au candidat : le déroulé réel de l'épreuve dans l'école
 * choisie, ce qui est simulé ou non, et — quand l'école l'exige — le support à
 * déposer avant de pouvoir démarrer.
 */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, Loader2, MinusCircle, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { realMinutes, simulatedMinutes, type SchoolInterviewConfig } from "@/lib/school-interviews";
import { schoolLogo } from "@/lib/school-logos";

export function InterviewBriefDialog({
  open,
  onOpenChange,
  config,
  school,
  fallbackAgent,
  busy,
  onStart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SchoolInterviewConfig;
  school: string;
  /** L'agent dédié de cette école n'existe pas encore : jury classique joué à sa place. */
  fallbackAgent: boolean;
  busy: boolean;
  onStart: (support: File | null, articleId: string | null, imageId: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setFileError("");
      setSelectedArticleId(null);
      setSelectedImageId(null);
    }
  }, [open, config.school]);

  const support = config.support;
  const articles = support?.articleOptions;
  const images = config.imageOptions;
  const accept = useMemo(() => (support?.accept ?? []).map((e) => `.${e}`).join(","), [support]);
  const missingImage = Boolean(images) && !selectedImageId;
  const selectedImage = images?.find((i) => i.id === selectedImageId) ?? null;
  const missingSupport =
    (config.requiresUpload && (articles ? !selectedArticleId : !file)) || missingImage;
  const selectedArticle = articles?.find((a) => a.id === selectedArticleId) ?? null;

  function pick(next: File | null) {
    setFileError("");
    if (!next || !support?.accept || support.maxMb === undefined) {
      setFile(next);
      return;
    }
    const ext = next.name.split(".").pop()?.toLowerCase() ?? "";
    if (!support.accept.includes(ext)) {
      setFileError(`Format non accepté. Déposez un fichier ${support.accept.join(", ")}.`);
      return;
    }
    if (next.size > support.maxMb * 1024 * 1024) {
      setFileError(`Fichier trop lourd (${support.maxMb} Mo maximum).`);
      return;
    }
    setFile(next);
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {schoolLogo(school) ? (
              <img
                src={schoolLogo(school)}
                alt={`Logo ${school}`}
                className="size-10 shrink-0 rounded-md border border-border/60 bg-white object-contain p-1"
                loading="lazy"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Structure officielle de l'entretien
              </p>
              <DialogTitle className="font-serif text-xl leading-tight">{config.popupCopy.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="pt-2 text-left text-sm leading-relaxed">
            {config.popupCopy.desc}
          </DialogDescription>
        </DialogHeader>

        {images?.length ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Votre image — un seul choix, obligatoire
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Comme le jour J, choisissez maintenant l'image à partir de laquelle vous vous présenterez. Le jury
              l'aura sous les yeux dès le début de l'entretien.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((img) => {
                const active = img.id === selectedImageId;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageId(img.id)}
                    aria-pressed={active}
                    className={`group overflow-hidden rounded-[3px] border text-left transition ${
                      active ? "border-accent ring-2 ring-accent/50" : "border-border/60 hover:border-accent"
                    }`}
                  >
                    <img
                      src={img.path}
                      alt={img.description}
                      loading="lazy"
                      className="aspect-video w-full object-cover transition group-hover:scale-105"
                    />
                    <span className="block px-2 py-1 text-xs font-medium text-foreground">{img.shortLabel}</span>
                  </button>
                );
              })}
            </div>
            {selectedImage ? (
              <p className="text-sm leading-snug text-muted-foreground">{selectedImage.description}</p>
            ) : null}
          </div>
        ) : config.imageBank?.length ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Le type d'images proposées
            </p>
            <div className="px-14">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-3">
                  {config.imageBank.map((src) => (
                    <CarouselItem key={src} className="basis-1/2 pl-3 md:basis-1/3">
                      <div className="overflow-hidden rounded-[3px] border border-border/60">
                        <img
                          src={src}
                          alt="Exemple d'image proposée par le jury"
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        ) : null}

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Déroulé de l'épreuve
            </p>
            <ul className="mt-3 space-y-2">
              {config.phases.map((phase) => (
                <li
                  key={phase.label}
                  className={`flex items-start gap-3 rounded-[3px] border p-3 text-sm ${
                    phase.excluded ? "border-border/60 bg-muted/40 text-muted-foreground" : "border-border/60"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {phase.excluded ? (
                      <MinusCircle className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4 text-accent" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{phase.label}</span>
                    {phase.minutes ? (
                      <span className="text-muted-foreground"> · environ {phase.minutes} min</span>
                    ) : null}
                    {phase.detail ? (
                      <span className="block text-xs text-muted-foreground">{phase.detail}</span>
                    ) : null}
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.12em]">
                      {phase.excluded ? (
                        <span className="text-muted-foreground">Non simulé</span>
                      ) : phase.guaranteed ? (
                        <span className="text-accent">Simulé · toujours posé</span>
                      ) : (
                        <span className="text-accent">Simulé</span>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[3px] border border-border/60 bg-secondary/40 p-3 text-sm">
            <p className="font-medium text-foreground">
              Épreuve réelle {realMinutes(config)} min · simulation {simulatedMinutes(config)} min
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{config.popupCopy.durationNote}</p>
          </div>

          {fallbackAgent ? (
            <div className="flex gap-3 rounded-[3px] border border-accent/50 bg-accent/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" />
              <div className="leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Format simplifié en attendant le jury dédié</p>
                <p className="mt-1">
                  Le jury spécifique de cette école n'est pas encore disponible. L'entretien va démarrer avec le jury
                  classique : ce sera un entretien de motivation générique.
                  {config.format === "special" ? (
                    <> Ce ne sera donc pas encore le format spécifique de l'école (mise en situation, exercice dédié, etc.) décrit ci-dessus.</>
                  ) : null}{" "}
                  Le déroulé officiel reste votre repère pour l'épreuve réelle.
                </p>
              </div>
            </div>
          ) : null}

          {support ? (
            <div className="rounded-[3px] border border-border/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {articles ? "Article à choisir avant de démarrer" : "Support à déposer avant de démarrer"}
              </p>
              <p className="mt-2 text-sm font-medium text-primary">{support.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{support.instructions}</p>
              {support.prompts?.length ? (
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  {support.prompts.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              ) : null}

              {articles ? (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Sélection d'articles ({articles.length}) — un seul choix
                  </p>
                  <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                    {articles.map((article) => {
                      const active = article.id === selectedArticleId;
                      return (
                        <li key={article.id}>
                          <div
                            className={`rounded-[3px] border p-3 text-sm transition-colors ${
                              active ? "border-accent bg-accent/5" : "border-border/60 hover:bg-muted/40"
                            }`}
                          >
                            <button
                              type="button"
                              className="flex w-full items-start gap-3 text-left"
                              onClick={() => setSelectedArticleId(article.id)}
                              aria-pressed={active}
                            >
                              <span className="mt-0.5 shrink-0">
                                {active ? (
                                  <CheckCircle2 className="size-4 text-accent" />
                                ) : (
                                  <MinusCircle className="size-4 text-muted-foreground" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="font-medium">{article.title}</span>
                                <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                  {article.source} · {article.date}
                                </span>
                                <span className="mt-1 block truncate text-xs text-muted-foreground">
                                  {article.summary}
                                </span>
                              </span>
                            </button>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs font-medium text-accent underline underline-offset-2"
                            >
                              Lire l'article ↗
                            </a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {selectedArticle ? (
                    <p className="mt-3 flex items-center gap-2 text-xs text-accent">
                      <FileUp className="size-3.5" /> {selectedArticle.title} — le jury l'aura sous les yeux dès le
                      début.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Ce choix est obligatoire : le jury ouvre l'entretien sur l'article que vous sélectionnez.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <Label
                    htmlFor="interview-support"
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Mon document ({(support.accept ?? []).join(", ")} — {support.maxMb} Mo max)
                  </Label>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      id="interview-support"
                      type="file"
                      accept={accept}
                      className="block w-full max-w-sm cursor-pointer rounded-[3px] border border-border/60 p-2 text-sm file:mr-3 file:rounded-[3px] file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                      onChange={(e) => pick(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => pick(null)}>
                        <X className="size-4" /> Retirer
                      </Button>
                    ) : null}
                  </div>
                  {file ? (
                    <p className="mt-2 flex items-center gap-2 text-xs text-accent">
                      <FileUp className="size-3.5" /> {file.name} — le jury l'aura sous les yeux dès le début.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ce document est obligatoire : le jury de cette école conduit l'entretien à partir de lui.
                    </p>
                  )}
                  {fileError ? <p className="mt-2 text-xs text-destructive">{fileError}</p> : null}
                </div>
              )}
            </div>
          ) : null}

          <p className="text-sm font-medium text-primary">{config.popupCopy.goodluck}</p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => onStart(file, selectedArticleId, selectedImageId)}
            disabled={busy || missingSupport}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {missingImage
              ? "Choisissez une image"
              : missingSupport
                ? articles
                  ? "Choisissez un article"
                  : "Déposez votre document"
                : "Démarrer l'entretien"}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
