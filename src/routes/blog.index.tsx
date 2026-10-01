import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle } from "@/components/repetia/site";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    title: "Blog The Prepboard - Conseils et méthodes pour les oraux de concours",
    meta: [
      {
        name: "description",
        content:
          "Articles, méthodes et conseils d'experts pour réussir vos oraux de concours : Sciences Po, CPGE, AST, post-bac, PASS/LAS.",
      },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <Section tone="paper">
      <SectionTitle
        title="Le blog The Prepboard"
        intro="Conseils d'experts, méthodes et retours d'expérience pour transformer votre entraînement en admission. Bientôt en ligne."
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--ink)]/12 bg-[var(--craie)] p-8">
          <p className="label-mono text-[var(--rouge)]">Bientôt</p>
          <h3 className="mt-3 text-[1.4rem] font-semibold tracking-tight">
            Comment structurer un projet professionnel convaincant
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            La méthode pas à pas pour transformer un projet flou en discours précis et mémorable.
          </p>
        </article>
        <article className="rounded-lg border border-[var(--ink)]/12 bg-[var(--craie)] p-8">
          <p className="label-mono text-[var(--rouge)]">Bientôt</p>
          <h3 className="mt-3 text-[1.4rem] font-semibold tracking-tight">
            Les 5 erreurs qui font perdre des points à l'oral
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Ce que les jurys remarquent en premier, et comment l'éviter par la répétition.
          </p>
        </article>
      </div>
    </Section>
  );
}
