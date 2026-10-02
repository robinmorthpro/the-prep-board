import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/vivaldi/PageHero";
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
      <PageHero eyebrow="Base de connaissance" title="Ressources théoriques">
        Tout ce que le jury cherche, réuni au même endroit. Ces repères sont aussi rappelés à côté de chaque exercice.
      </PageHero>
      <div className="space-y-6">
        {sections.map((s) => (
          <Card key={s.title} className="rounded-[24px] border-0 p-7 shadow-none">
            <h2 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">{s.title}</h2>
            <ul className="mt-4 space-y-2.5 text-[17px] leading-[1.6] text-[var(--graphite)]">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--bleu)]" />
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
