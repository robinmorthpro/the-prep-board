import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CompareTable,
  CtaBand,
  FaqList,
  PriceBlock,
  Section,
  SectionTitle,
} from "@/components/repetia/site";
import { BRAND, CONCOURS, VS_CHATBOT, VS_PREPA, getConcours } from "@/lib/site-content";
import carnetAsset from "@/assets/site/carnet-notes.jpg";
import amphiBoutmy from "@/assets/site/amphi-boutmy.jpg";
import hecJouy from "@/assets/site/hec-jouy.jpg";
import essecCergy from "@/assets/site/essec-cergy.jpg";
import edhecLille from "@/assets/site/edhec-lille.jpg";
import facMedecine from "@/assets/site/fac-medecine.jpg";

/** Un visuel documentaire par concours, photographié sur les lieux concernés. */
const VISUELS: Record<string, { url: string; alt: string; credit: string }> = {
  "oral-sciences-po-paris": {
    url: amphiBoutmy,
    alt: "Amphithéâtre Émile Boutmy, Sciences Po, rue Saint-Guillaume à Paris",
    credit: "Amphithéâtre Émile Boutmy, Sciences Po Paris",
  },
  "oraux-ecoles-de-commerce-cpge": {
    url: hecJouy,
    alt: "Le château du campus de HEC Paris à Jouy-en-Josas",
    credit: "Campus de HEC Paris, Jouy-en-Josas",
  },
  "oraux-ecoles-de-commerce-ast": {
    url: essecCergy,
    alt: "Le campus de l'ESSEC à Cergy",
    credit: "Campus de l'ESSEC, Cergy",
  },
  "oraux-ecoles-de-commerce-post-bac": {
    url: edhecLille,
    alt: "Le campus de l'EDHEC à Lille",
    credit: "Campus de l'EDHEC, Lille",
  },
  "oraux-pass-las": {
    url: facMedecine,
    alt: "La faculté de médecine de Montpellier",
    credit: "Faculté de médecine de Montpellier",
  },
};

export const Route = createFileRoute("/_site/concours/$slug")({
  loader: ({ params }) => {
    const concours = getConcours(params.slug);
    if (!concours) throw notFound();
    return { concours };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Concours introuvable | The Prepboard" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.concours;
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/concours/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/concours/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Course",
                name: c.h1,
                description: c.description,
                provider: { "@type": "Organization", name: "The Prepboard" },
                offers: {
                  "@type": "Offer",
                  price: BRAND.price,
                  priceCurrency: "EUR",
                  availability: "https://schema.org/InStock",
                },
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode: "online",
                  courseWorkload: "PT10H",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: c.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ConcoursPage,
});

function ConcoursPage() {
  const { concours: c } = Route.useLoaderData();
  const visuel = VISUELS[c.slug] ?? VISUELS["oral-sciences-po-paris"]!;
  const autres = CONCOURS.filter((x) => x.slug !== c.slug);

  return (
    <div className="site-scope">
      {/* ------------------------------------------------------------- hero */}
      <section className="relative isolate -mt-[1px] overflow-hidden bg-[var(--ink)] text-white">
        <img
          src={visuel.url}
          alt={visuel.alt}
          className="absolute inset-0 size-full object-cover"
          loading="eager"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,18,32,0.94)_0%,rgba(11,18,32,0.78)_45%,rgba(11,18,32,0.35)_100%)]"
        />
        <div className="relative mx-auto max-w-[1440px] px-5 pt-20 pb-16 md:px-12 md:pt-32 md:pb-24">
          <h1 className="m-0 max-w-[980px] text-[42px] leading-[0.98] font-medium tracking-[-0.05em] md:text-[76px]">
            {c.h1}
          </h1>
          <p className="mt-7 max-w-[680px] text-[18px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">
            {c.chapo}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--ciel)] px-6 py-4 text-[17px] font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
            >
              Créer mon compte <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a
              href="#preparation"
              className="inline-flex items-center gap-2 text-[17px] font-medium underline-offset-4 hover:underline"
            >
              Voir la préparation <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
          <p className="pill-label mt-14 text-white/55">{visuel.credit}</p>
        </div>
      </section>

      {/* ---------------------------------------------------------- épreuve */}
      <Section>
        <SectionTitle kicker="L'épreuve" title="Ce qui vous attend le jour de l'oral." />
        <dl className="mt-10 grid gap-2.5 rounded-[28px] bg-[var(--paper)] p-2 md:mt-14 md:grid-cols-2 md:p-2.5">
          {[
            ["Format", c.epreuve.format],
            ["Durée", c.epreuve.duree],
            ["Jury", c.epreuve.jury],
            ["Poids dans l'admission", c.epreuve.coefficient],
            ["Calendrier", c.epreuve.calendrier],
          ].map(([k, v], i, arr) => (
            <div
              key={k}
              className={`rounded-[22px] bg-white p-6 md:p-8 ${
                arr.length % 2 === 1 && i === arr.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <dt className="pill-label inline-flex rounded-full bg-[var(--bleu-pale)] px-3 py-1 text-[var(--bleu-texte)]">{k}</dt>
              <dd className="mt-4 text-[17px] leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* --------------------------------------------------------- attendus */}
      <Section tone="paper">
        <SectionTitle
          kicker="Les attendus du jury"
          title="Quatre choses évaluées, quoi que vous racontiez."
          intro="Elles ne figurent dans aucune brochure. Elles décident pourtant du classement."
        />
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2">
          {c.attendus.map((a, i) => (
            <div key={a.titre} className="rounded-[24px] bg-white p-6 md:p-8">
              <span className="text-[17px] font-semibold text-[var(--bleu)]">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-[22px] leading-snug font-semibold tracking-[-0.02em] md:text-[24px]">{a.titre}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-[var(--graphite)]">{a.texte}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- questions */}
      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <SectionTitle
            tone="chalk"
            kicker="Les questions"
            title="Des questions que vous entendrez, dites à voix haute avant le jour J."
            intro="Chaque question de la base est accompagnée de l'intention du jury, des critères d'évaluation et des pièges classiques."
          />
          <ul className="grid gap-2.5">
            {c.questions.map((q) => (
              <li key={q} className="flex gap-3 rounded-[14px] bg-white/[0.06] px-5 py-4 text-[17px] leading-snug">
                <span className="font-semibold text-[var(--ciel)]">?</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ------------------------------------------------------ préparation */}
      <Section id="preparation">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <SectionTitle
              kicker="La préparation The Prepboard"
              title="Comment nous préparons cette épreuve."
              intro="Le parcours a été construit avec des jurys de concours : on travaille le fond dans l'ordre, puis on répète l'oral entier."
            />
            <ol className="mt-10 grid gap-3">
              {c.parcours.map((p, i) => (
                <li key={p.titre} className="flex gap-4 rounded-[22px] bg-[var(--paper)] p-5 md:p-6">
                  <span className="w-1 flex-none self-stretch rounded bg-[var(--ciel)]" />
                  <div>
                    <p className="m-0 text-[15px] font-semibold text-[var(--graphite)]">Étape {String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-1 text-[22px] leading-snug font-medium tracking-[-0.03em]">{p.titre}</p>
                    <p className="mt-2 text-[16px] leading-relaxed text-[var(--graphite)]">{p.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className="m-0">
            <img
              src={carnetAsset}
              alt="Notes manuscrites et ordinateur pendant la préparation d'un oral"
              className="aspect-4/5 w-full rounded-[28px] object-cover"
              loading="lazy"
            />
          </figure>
        </div>
      </Section>

      {/* --------------------------------------------------- différenciants */}
      <Section tone="paper">
        <SectionTitle kicker="Ce qui change" title="Pourquoi cette préparation tient pour cette épreuve." />
        <ul className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3">
          {c.differenciants.map((d) => (
            <li key={d} className="flex gap-3 rounded-[24px] bg-white p-6 text-[16.5px] leading-relaxed">
              <span className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-[var(--bleu-texte)] text-white">
                <Check aria-hidden className="size-3.5" />
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <div className="mt-20">
          <h3 className="text-[26px] leading-snug font-medium tracking-[-0.03em] md:text-[32px]">{VS_PREPA.titre}</h3>
          <CompareTable
            colonnes={["Prépa aux oraux", "The Prepboard"]}
            lignes={VS_PREPA.lignes.map((l) => ({
              critere: l.critere,
              autre: l.prepa,
              repetia: l.repetia,
            }))}
          />
          <h3 className="mt-20 text-[1.5rem] leading-snug font-semibold">{VS_CHATBOT.titre}</h3>
          <CompareTable
            colonnes={["Assistant généraliste", "The Prepboard"]}
            lignes={VS_CHATBOT.lignes.map((l) => ({
              critere: l.critere,
              autre: l.chat,
              repetia: l.repetia,
            }))}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------ tarif */}
      <Section>
        <SectionTitle kicker="Accès" title="Un prix, aucun compteur." />
        <div className="mt-14">
          <PriceBlock context={`pour ${c.nav.toLowerCase()}`} />
        </div>
      </Section>

      {/* -------------------------------------------------------------- faq */}
      <Section tone="paper">
        <SectionTitle kicker="Questions fréquentes" title="Sur cette épreuve et sa préparation." />
        <FaqList items={c.faq} />
      </Section>

      {/* ---------------------------------------------------------- maillage */}
      <Section>
        <SectionTitle kicker="Autres concours" title="Vous préparez aussi une autre épreuve ?" />
        <ul className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
          {autres.map((x) => (
            <li key={x.slug}>
              <Link
                to="/concours/$slug"
                params={{ slug: x.slug }}
                className="flex items-center justify-between gap-4 bg-[var(--craie)] p-6 text-[17px] font-medium hover:text-[var(--rouge)]"
              >
                {x.nav}
                <ArrowRight aria-hidden className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </div>
  );
}
