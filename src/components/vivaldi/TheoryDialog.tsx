import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Section = { title: string; points: string[] };

/** Consignes théoriques consultables à tout moment pendant le travail d'une partie. */
export function TheoryDialog({
  title,
  intro,
  points,
  sections,
  children,
  label = "Consulter les consignes théoriques",
  prominent = false,
}: {
  title: string;
  intro: string;
  points?: string[];
  sections?: Section[];
  children?: ReactNode;
  label?: string;
  /** Bouton plein sombre de l'encart « À lire au démarrage ». */
  prominent?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {prominent ? (
          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-full bg-[var(--ink)] px-6 py-4 text-[17px] font-semibold text-white shadow-[0_10px_24px_rgba(11,18,32,0.18)] transition-opacity hover:opacity-90 md:whitespace-nowrap md:px-9 md:py-[22px] md:text-[20px]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M6 3h9l4 4v14H6z" />
              <path d="M9 12h7M9 16h7M9 8h3" />
            </svg>
            {label}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="size-4 text-accent" />
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{intro}</DialogDescription>
        </DialogHeader>
        {points && (
          <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            {points.map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
        {sections?.map((s) => (
          <section key={s.title}>
            <h4 className="mb-2 text-sm font-semibold text-foreground">{s.title}</h4>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {children}
      </DialogContent>
    </Dialog>
  );
}
