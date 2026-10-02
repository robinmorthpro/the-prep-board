import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionTitle, SiteFooter, SiteHeader } from "@/components/repetia/site";

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

const ARTICLES = [
  {
    titre: "Comment structurer un projet professionnel convaincant",
    texte: "La méthode pas à pas pour transformer un projet flou en discours précis et mémorable.",
  },
  {
    titre: "Les 5 erreurs qui font perdre des points à l'oral",
    texte: "Ce que les jurys remarquent en premier, et comment l'éviter par la répétition.",
  },
];

function BlogPage() {
  return (
    <div className="site-scope flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <Section tone="paper">
          <SectionTitle
            title="Le blog The Prepboard"
            intro="Conseils d'experts, méthodes et retours d'expérience pour transformer votre entraînement en admission. Bientôt en ligne."
          />
          <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2">
            {ARTICLES.map((a) => (
              <article key={a.titre} className="rounded-[24px] bg-white p-6 md:p-8">
                <p className="pill-label inline-flex rounded-full bg-[var(--bleu-pale)] px-3 py-1 text-[var(--bleu-texte)]">
                  Bientôt
                </p>
                <h3 className="mt-4 text-[22px] leading-snug font-semibold tracking-[-0.02em] md:text-[24px]">{a.titre}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[var(--graphite)]">{a.texte}</p>
              </article>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
