import { createFileRoute } from "@tanstack/react-router";
import {
  HomeAppelFinal,
  HomeComparatif,
  HomeEpreuves,
  HomeFaq,
  HomeHero,
  HomeMethode,
  HomePrix,
  HomeTemoignages,
} from "@/components/repetia/home";
import { BRAND, CONCOURS, FAQ_GENERALE, TEMOIGNAGES_HOME } from "@/lib/site-content";

const TITLE = "The Prepboard : la préparation aux concours réinventée";
const DESCRIPTION =
  "La première plateforme de préparation aux concours créée par des spécialistes de chaque épreuve et pilotée par l'IA : préparation 100 % personnalisée, entraînement illimité, 99 € (79 € boursiers).";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "The Prepboard",
              url: "/",
              email: BRAND.email,
              description: DESCRIPTION,
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ_GENERALE.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="bg-[var(--ink)] font-sans text-[20px] leading-[1.55]">
      <HomeHero />
      <HomeMethode />
      <HomeComparatif />
      <HomeEpreuves />
      <HomePrix />
      <HomeTemoignages items={TEMOIGNAGES_HOME} />
      <HomeFaq items={FAQ_GENERALE} />
      <HomeAppelFinal />
    </div>
  );
}

export const CONCOURS_COUNT = CONCOURS.length;
