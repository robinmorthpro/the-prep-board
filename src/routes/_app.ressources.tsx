import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { KNOWLEDGE } from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app/ressources")({
  head: () => ({
    meta: [
      { title: "Ressources théoriques | The Prepboard" },
      { name: "description", content: "Les attentes du jury aux oraux CPGE : écoles, projet professionnel, exploitation des expériences." },
      { property: "og:title", content: "Ressources théoriques | The Prepboard" },
      { property: "og:description", content: "Méthodes et critères du jury pour les oraux BCE et Ecricome." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const sections = [KNOWLEDGE.personal, KNOWLEDGE.career, KNOWLEDGE.schools, KNOWLEDGE.experiences];
  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Base de connaissance</p>
        <h1 className="mt-2 text-4xl">Ressources théoriques</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Tout ce que le jury cherche, réuni au même endroit. Ces repères sont aussi rappelés à côté de chaque exercice.
        </p>
      </header>
      <div className="space-y-6">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <h2 className="text-2xl">{s.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
