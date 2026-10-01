import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChiffresBand,
  CompareTriTable,
  FaqList,
  PriceBlock,
  Reveal,
  Section,
  SectionTitle,
  TemoignageCarousel,
} from "@/components/repetia/site";
import {
  BRAND,
  CHIFFRES,
  COMPARATIF,
  CONCOURS,
  EPREUVES,
  FAQ_GENERALE,
  TEMOIGNAGES_HOME,
  getConcours,
} from "@/lib/site-content";
import heroAsset from "@/assets/site/hero-oral.jpg.asset.json";
import amphiAsset from "@/assets/site/amphi-vide.jpg.asset.json";
import repetitionAsset from "@/assets/site/repetition.jpg.asset.json";
import campusAsset from "@/assets/site/campus-paris.jpg.asset.json";

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

/** Parallax doux : l'image glisse à une fraction du scroll. */
function useParallax(factor = 0.18) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      el.style.transform = `translateY(${rect.top * factor}px)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [factor]);

  return ref;
}

function Home() {
  const heroImg = useParallax(0.22);
  const quoteImg = useParallax(0.16);
  const ctaImg = useParallax(0.16);

  return (
    <div>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-[var(--ink)] text-[var(--craie)]">
        <img
          ref={heroImg}
          src={heroAsset.url}
          alt="Un candidat répond aux questions du jury dans une salle d'examen historique"
          className="absolute inset-0 size-full scale-[1.15] object-cover opacity-60"
          loading="eager"
          fetchPriority="high"
          width={1920}
          height={1152}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/55 to-[var(--ink)]/25"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-32 pb-20 md:pb-28">
          <Reveal>
            <h1 className="max-w-4xl text-[2.6rem] leading-[1.08] font-bold tracking-[-0.015em] md:text-[4.5rem]">
              La préparation aux concours,{" "}
              <span className="text-[var(--rouge-clair)]">réinventée.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-relaxed text-[var(--craie)]/85 md:text-[20px]">
              The Prepboard est la première plateforme de préparation aux concours qui allie
              l'expertise des meilleurs spécialistes et la puissance de l'IA.
              <br />
              Suivez une préparation 100% personnalisée, un entraînement 100% illimité, une
              progression 100% mesurable.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">Je me lance</Link>
              </Button>
              <a
                href="#concours"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-[var(--craie)] underline-offset-4 hover:underline"
              >
                Les concours préparés <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- The Prepboard en chiffres */}
      <section className="bg-[var(--ink)] px-6 pb-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="label-mono mb-8 text-[var(--seyes)]">The Prepboard en chiffres</h2>
          <ChiffresBand items={CHIFFRES} />
        </div>
      </section>

      {/* ------------------------------------------- concept et comparatif */}
      <Section id="methode" wide>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionTitle
              title="Préparez vos concours sans limite"
              intro={
                <>
                  Les prépas classiques ont un savoir-faire, freiné par trois limites
                  structurelles : un accompagnement standardisé faute de temps et de moyens, un
                  nombre d'entraînements trop limité, et un tarif devenu prohibitif. The Prepboard
                  pousse plus loin l'expertise pédagogique, aux côtés des meilleurs spécialistes
                  de chaque épreuve, et la rend disponible sans limite.
                </>
              }
            />
            <p className="mt-8 max-w-2xl text-[19px] leading-snug font-semibold">
              Vous vous entraînez plus, vous travaillez mieux, vous progressez plus vite.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <figure className="overflow-hidden">
              <img
                src={repetitionAsset.url}
                alt="Deux étudiantes répètent un oral dans une bibliothèque, l'une parle pendant que l'autre prend des notes"
                className="aspect-[8/5] w-full object-cover"
                loading="lazy"
                width={1600}
                height={1008}
              />
            </figure>
          </Reveal>
        </div>
        <Reveal>
          <CompareTriTable colonnes={COMPARATIF.colonnes} lignes={COMPARATIF.lignes} />
        </Reveal>
      </Section>

      {/* ---------------------------------------------------------- épreuves */}
      <Section tone="paper" id="concours" wide>
        <Reveal>
          <SectionTitle
            title="Nos épreuves préparées"
            intro="Chaque concours a son format, son jury et ses attendus. Choisissez le vôtre pour voir le détail de l'épreuve et de la préparation."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EPREUVES.map((e, k) => {
            const c = getConcours(e.slug);
            return (
              <Reveal key={e.slug} delay={(k % 3) * 100} className="h-full">
                <Link
                  to="/concours/$slug"
                  params={{ slug: e.slug }}
                  className="group flex h-full flex-col justify-between border border-[var(--ink)]/12 bg-[var(--craie)] p-8 transition-colors hover:border-[var(--rouge)]/40 hover:bg-[var(--coquille)] md:p-10"
                >
                  <div>
                    <h3 className="text-[1.5rem] leading-[1.15] font-bold tracking-[-0.015em]">
                      {e.titre}
                    </h3>
                    <p className="mt-3 text-[16px] text-[var(--rouge)]">{e.sous}</p>
                    {c ? (
                      <dl className="mt-7 grid gap-2 border-t border-border pt-5 text-[14.5px] sm:grid-cols-[70px_1fr]">
                        <dt className="label-mono pt-0.5">Durée</dt>
                        <dd>{c.epreuve.duree}</dd>
                        <dt className="label-mono pt-0.5">Jury</dt>
                        <dd>{c.epreuve.jury}</dd>
                      </dl>
                    ) : null}
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-[var(--rouge)]">
                    Voir la préparation
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ------------------------------------------- respiration plein cadre */}
      <section className="relative isolate flex min-h-[70svh] items-center overflow-hidden bg-[var(--ink)] text-[var(--craie)]">
        <img
          ref={quoteImg}
          src={amphiAsset.url}
          alt="Un amphithéâtre universitaire historique baigné de lumière"
          className="absolute inset-0 size-full scale-[1.12] object-cover opacity-45"
          loading="lazy"
          width={1600}
          height={1008}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/85 via-[var(--ink)]/40 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-6 py-28">
          <Reveal>
            <blockquote className="max-w-3xl">
              <p className="font-display text-[1.9rem] leading-[1.25] font-bold tracking-[-0.01em] md:text-[3rem]">
                Un oral ne s'improvise pas. Il se répète, se corrige, se répète encore.
              </p>
              <cite className="mt-8 block text-[15px] font-medium not-italic text-[var(--seyes)]">
                Le principe fondateur de The Prep<span className="text-[var(--rouge)]">board</span>
              </cite>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- témoignages */}
      <Section wide>
        <Reveal>
          <SectionTitle
            title="Ils s'entraînent déjà sans limite"
            intro="Les candidats racontent ce que change un entraînement répété, corrigé et mesuré."
          />
        </Reveal>
        <TemoignageCarousel items={TEMOIGNAGES_HOME} />
      </Section>

      {/* ------------------------------------------------------------- tarif */}
      <Section tone="paper">
        <Reveal>
          <SectionTitle
            title="Un prix unique, aucun compteur"
            intro="Ni abonnement, ni crédits, ni supplément par entraînement."
          />
        </Reveal>
        <div className="mt-14">
          <Reveal delay={120}>
            <PriceBlock />
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------------------------------------- faq */}
      <Section>
        <Reveal>
          <SectionTitle title="Questions fréquentes" />
        </Reveal>
        <FaqList items={FAQ_GENERALE} />
      </Section>

      {/* ------------------------------------------------------ cta plein cadre */}
      <section className="relative isolate flex min-h-[64svh] items-center overflow-hidden bg-[var(--ink)] text-[var(--craie)]">
        <img
          ref={ctaImg}
          src={campusAsset.url}
          alt="Des étudiants arrivent devant l'entrée d'une grande école parisienne"
          className="absolute inset-0 size-full scale-[1.12] object-cover opacity-40"
          loading="lazy"
          width={1600}
          height={1008}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/50 to-[var(--ink)]/40"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-6 py-28">
          <Reveal>
            <div className="max-w-3xl">
              <h2 className="text-[2.25rem] leading-[1.1] font-bold tracking-[-0.015em] md:text-[3.5rem]">
                Commencez votre préparation aujourd'hui.
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[var(--craie)]/85">
                Créez votre compte, construisez votre dossier étape par étape, puis
                entraînez-vous sans limite jusqu'au jour de l'épreuve.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth">Je me lance</Link>
                </Button>
                <span className="text-[15px] text-[var(--craie)]/80">
                  {BRAND.price} €, {BRAND.priceBoursier} € pour les boursiers.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export const CONCOURS_COUNT = CONCOURS.length;
