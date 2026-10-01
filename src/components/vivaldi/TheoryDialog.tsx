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
}: {
  title: string;
  intro: string;
  points?: string[];
  sections?: Section[];
  children?: ReactNode;
  label?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="size-4 text-accent" />
          {label}
        </Button>
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
