import { Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  BRAND,
  CHIFFRES,
  COMPARATIF,
  EPREUVES,
  METHODE_HOME,
  type Temoignage,
} from "@/lib/site-content";
import heroAsset from "@/assets/site/hero-oral.jpg";
import repetitionAsset from "@/assets/site/repetition.jpg";
import campusAsset from "@/assets/site/campus-paris.jpg";
import hecAsset from "@/assets/site/hec-jouy.jpg";
import essecAsset from "@/assets/site/essec-cergy.jpg";
import neomaAsset from "@/assets/site/campus-neoma.jpg";
import boutmyAsset from "@/assets/site/amphi-boutmy.jpg";
import medecineAsset from "@/assets/site/fac-medecine.jpg";
import prepAsset from "@/assets/site/app-preparation.jpg.asset.json";
import entretienAsset from "@/assets/site/app-entretien.jpg.asset.json";
import feedbackAsset from "@/assets/site/app-feedback.jpg.asset.json";

/* ------------------------------------------------------------ primitives */

export const CTA_LABEL = "Je commence ma préparation";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-12", className)}>{children}</div>;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CtaPill({ tone = "ciel", className }: { tone?: "ciel" | "encre"; className?: string }) {
  return (
    <Link
      to="/auth"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[18px] font-semibold whitespace-nowrap transition-opacity hover:opacity-90 md:px-[34px] md:py-5 md:text-[20px]",
        tone === "ciel" ? "bg-[var(--ciel)] text-[var(--ink)]" : "bg-[var(--ink)] text-white",
        className,
      )}
    >
      {CTA_LABEL}
      <Arrow />
    </Link>
  );
}

const H2 = "m-0 text-[40px] leading-none font-medium tracking-[-0.045em] md:text-[64px]";
const CHAPO = "m-0 text-[20px] leading-[1.45] tracking-[-0.01em] md:text-[26px]";

/* ------------------------------------------------------------------ hero */

function Chiffre({ value }: { value: string }) {
  if (value === "∞") {
    return <span className="inline-block align-[-0.14em] text-[1.5em] leading-[0]">∞</span>;
  }
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return <>{value}</>;
  return (
    <>
      {m[1]}
      <span className="pb-hcount" style={{ "--to": Number(m[2]) } as CSSProperties} aria-hidden />
      <span className="sr-only">{m[2]}</span>
      {m[3]}
    </>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--ink)] text-white">
      <img
        src={heroAsset}
        alt="Un candidat répond aux questions du jury dans une salle d'examen historique"
        className="absolute inset-0 size-full -scale-x-100 object-cover object-[40%_30%]"
        loading="eager"
        fetchPriority="high"
        width={1920}
        height={1152}
      />
      <div aria-hidden className="absolute inset-0 bg-[var(--ink)] opacity-[0.38]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,18,32,0.92)_0%,rgba(11,18,32,0.75)_34%,rgba(11,18,32,0)_62%)] max-md:bg-[linear-gradient(90deg,rgba(11,18,32,0.85)_0%,rgba(11,18,32,0.6)_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[560px] bg-[linear-gradient(0deg,rgba(11,18,32,0.95)_0%,rgba(11,18,32,0)_100%)]" />
      <Container className="relative z-[2] pt-[132px] pb-12 md:pt-[186px] md:pb-16">
        <div className="max-w-[720px]">
          <h1 className="m-0 text-[46px] leading-[0.98] font-medium tracking-[-0.05em] md:text-[84px]">
            Entraînez-vous aux oraux d'admission, <span className="text-[var(--ciel)]">sans limite</span>
          </h1>
          <p className="mt-7 max-w-[640px] text-[18px] leading-[1.55] text-[#E1E6EF] md:text-[20px]">
            The Prepboard est la première plateforme de préparation aux concours qui allie l'expertise des
            meilleurs spécialistes et la puissance de l'IA.
            <br />
            Suivez une préparation 100% personnalisée, un entraînement 100% illimité, une progression 100%
            mesurable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-[18px] font-medium md:text-[20px]">
            <CtaPill />
            <a href="#concours" className="flex items-center gap-2 text-white">
              Les concours préparés
              <Arrow />
            </a>
          </div>
        </div>
        <h2 className="sr-only">The Prepboard en chiffres</h2>
        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-8 md:mt-[72px] md:grid-cols-4 md:gap-8">
          {CHIFFRES.map((c) => (
            <div key={c.label} className="border-t border-white/12 pt-6">
              <p className="m-0 text-[44px] leading-[0.9] font-medium tracking-[-0.045em] tabular-nums md:text-[72px]">
                <Chiffre value={c.value} />
              </p>
              <p className="mt-4 max-w-[280px] text-[16px] leading-[1.45] text-[var(--line)] md:text-[20px]">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------- méthode */

const CAPTURES = [
  { src: prepAsset.url, alt: "Écran Je me prépare de l'app The Prepboard : les modules de préparation et leur état", h: 500 },
  { src: entretienAsset.url, alt: "Écran Mon entraînement illimité de l'app : choix de l'école, du format et de la difficulté avant l'entretien", h: 506 },
  { src: feedbackAsset.url, alt: "Écran de débrief de l'app : percentile, feedback général et points à retravailler", h: 506 },
];

function Capture({ k }: { k: number }) {
  const c = CAPTURES[k]!;
  return (
    <figure className="m-0 rounded-[24px] border border-[rgba(11,18,32,0.1)] bg-[var(--paper)] p-2.5">
      <div aria-hidden className="flex gap-[7px] px-2 pt-1.5 pb-3.5">
        <span className="size-[11px] rounded-full bg-[#F0605D]" />
        <span className="size-[11px] rounded-full bg-[#F5B83D]" />
        <span className="size-[11px] rounded-full bg-[#3FCF8E]" />
      </div>
      <img src={c.src} alt={c.alt} width={800} height={c.h} loading="lazy" className="block h-auto w-full rounded-[14px]" />
    </figure>
  );
}

export function HomeMethode() {
  const [active, setActive] = useState(0);
  return (
    <section id="methode-etapes" className="scroll-mt-24 bg-white pt-20 pb-20 text-[var(--ink)] md:pt-[136px] md:pb-[120px]">
      <Container>
        <div className="mb-12 flex flex-col gap-6 md:mb-[72px]">
          <h2 className={H2}>{METHODE_HOME.titre}</h2>
          <p className={cn(CHAPO, "max-w-[1100px] text-[var(--graphite)]")}>{METHODE_HOME.texte}</p>
        </div>

        {/* ordinateur : sélection au survol, au clic ou au clavier */}
        <div className="hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] items-stretch gap-16 lg:grid">
          <div className="flex flex-col justify-center gap-2" role="tablist" aria-label="Étapes de la méthode">
            {METHODE_HOME.etapes.map((e, k) => (
              <button
                key={e.n}
                type="button"
                role="tab"
                aria-selected={active === k}
                aria-controls="methode-capture"
                onMouseEnter={() => setActive(k)}
                onFocus={() => setActive(k)}
                onClick={() => setActive(k)}
                className={cn(
                  "flex cursor-pointer items-start gap-5 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bleu)]",
                  k < 2 && "border-b border-[rgba(11,18,32,0.1)]",
                )}
              >
                <span className={cn("w-1 flex-none self-stretch rounded", active === k ? "bg-[var(--ciel)]" : "bg-transparent")} />
                <span>
                  <span className="block text-[20px] font-semibold text-[var(--graphite)]">{e.n}</span>
                  <span
                    className={cn(
                      "mt-1.5 block text-[40px] leading-[1.05] font-medium tracking-[-0.035em] transition-colors",
                      active === k ? "text-[var(--ink)]" : "text-[#9AA3B2]",
                    )}
                  >
                    {e.titre}
                  </span>
                </span>
              </button>
            ))}
            <div className="mt-9 pl-6">
              <CtaPill />
            </div>
          </div>
          <div id="methode-capture" role="tabpanel" className="flex flex-col gap-7">
            <Capture k={active} />
          </div>
        </div>

        {/* mobile et tablette : étapes empilées, chacune avec sa capture */}
        <div className="flex flex-col gap-12 lg:hidden">
          {METHODE_HOME.etapes.map((e, k) => (
            <div key={e.n} className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <span className="w-1 flex-none self-stretch rounded bg-[var(--ciel)]" />
                <span>
                  <span className="block text-[17px] font-semibold text-[var(--graphite)]">{e.n}</span>
                  <span className="mt-1 block text-[30px] leading-[1.05] font-medium tracking-[-0.035em]">{e.titre}</span>
                </span>
              </div>
              <Capture k={k} />
            </div>
          ))}
          <div>
            <CtaPill />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ comparatif */

type Statut = "oui" | "partiel" | "non";

function StatutIcon({ statut }: { statut: Statut }) {
  if (statut === "oui") {
    return (
      <span aria-label="Oui" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-[var(--bleu-texte)] text-white">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M5 12l5 5 9-10" /></svg>
      </span>
    );
  }
  if (statut === "partiel") {
    return (
      <span aria-label="En partie" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M6 12h12" /></svg>
      </span>
    );
  }
  return (
    <span aria-label="Non" className="mt-0.5 inline-flex size-6 flex-none items-center justify-center rounded-full bg-[#FEE2E2] text-[#B91C1C]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
    </span>
  );
}

function Ligne({ nom, texte, statut, top }: { nom: string; texte: string; statut: Statut; top?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-2 rounded-[14px] sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4",
        top ? "bg-[#DCE8FF] p-3.5 text-[var(--ink)] shadow-[inset_0_0_0_1.5px_var(--ciel)]" : "bg-white px-3.5 py-3",
      )}
    >
      <span className={cn("flex items-center gap-2.5 text-[16px] font-semibold", top ? "text-[var(--bleu-texte)]" : "text-[var(--gris-doux)]")}>
        <StatutIcon statut={statut} />
        {nom}
      </span>
      <span className={cn("text-[17px] leading-[1.4]", top ? "font-medium" : "text-[var(--graphite)]")}>{texte}</span>
    </div>
  );
}

export function HomeComparatif() {
  return (
    <section id="methode" className="scroll-mt-24 bg-[var(--paper)] pt-20 pb-20 text-[var(--ink)] md:pt-[136px] md:pb-[120px]">
      <Container>
        <h2 className="m-0 text-[40px] leading-[1.12] font-medium tracking-[-0.045em] md:text-[64px]">
          Prépa classique, IA seule
          <br />
          ou{" "}
          <span className="inline-block rounded-[18px] border-2 border-dashed border-[#7D93FF] bg-[#EAF1FF] px-3 pb-2 text-[var(--bleu-texte)] md:px-4">
            The Prepboard ?
          </span>
        </h2>
        <p className={cn(CHAPO, "mt-6 text-[var(--graphite)]")}>Huit critères, trois façons de se préparer.</p>
        <div className="mt-10 flex flex-col gap-2.5 rounded-[28px] border border-[rgba(11,18,32,0.1)] bg-[rgba(11,18,32,0.035)] p-2 md:mt-14 md:rounded-[36px] md:p-2.5">
          <div className="rounded-[22px] bg-white p-3 md:rounded-[28px] md:p-7">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {COMPARATIF.lignes.map((l) => (
                <div
                  key={l.critere}
                  className="grid gap-2.5 rounded-[22px] bg-[var(--paper)] p-4 md:p-6 lg:row-span-4 lg:grid-rows-subgrid"
                >
                  <h3 className="m-0 mb-1.5 flex items-center gap-3 text-[22px] font-semibold tracking-[-0.02em] md:text-[24px]">
                    <span aria-hidden className="flex-none text-[28px] leading-none">{l.icone}</span>
                    {l.critere}
                  </h3>
                  <Ligne nom="The Prepboard" texte={l.repetia} statut="oui" top />
                  <Ligne nom="Prépa classique" texte={l.prepa} statut={l.prepaStatut as Statut} />
                  <Ligne nom="IA seule" texte={l.ia} statut={l.iaStatut as Statut} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 md:mt-14">
          <CtaPill />
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------- épreuves */

const EPREUVE_PHOTOS: Record<string, { src: string; alt: string }> = {
  "oraux-ecoles-de-commerce-cpge": { src: hecAsset, alt: "Campus d'HEC Paris à Jouy-en-Josas" },
  "oraux-ecoles-de-commerce-ast": { src: essecAsset, alt: "Campus de l'ESSEC à Cergy" },
  "oraux-ecoles-de-commerce-post-bac": { src: neomaAsset, alt: "Campus de NEOMA" },
  "oral-sciences-po-paris": { src: boutmyAsset, alt: "L'amphithéâtre Boutmy de Sciences Po" },
  "oraux-pass-las": { src: medecineAsset, alt: "Un amphithéâtre de faculté de médecine" },
};

export function HomeEpreuves() {
  return (
    <section id="concours" className="scroll-mt-24 bg-[var(--ink)] py-20 text-white md:py-[136px]">
      <Container>
        <div className="flex flex-col gap-6">
          <h2 className={H2}>Nos épreuves préparées</h2>
          <p className={cn(CHAPO, "max-w-[1100px] text-[var(--line)]")}>
            Chaque concours a son format, son jury et ses attendus. Choisissez le vôtre pour voir le détail de
            l'épreuve et de la préparation.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {EPREUVES.map((e, k) => {
            const big = k === 0;
            const photo = EPREUVE_PHOTOS[e.slug];
            return (
              <Link
                key={e.slug}
                to="/concours/$slug"
                params={{ slug: e.slug }}
                className={cn(
                  "group relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-[var(--ink)] text-white",
                  big ? "min-h-[360px] md:col-span-2 lg:min-h-[440px]" : "min-h-[320px] lg:min-h-[360px]",
                )}
              >
                {photo ? (
                  <img src={photo.src} alt={photo.alt} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                ) : null}
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,18,32,0.92)_0%,rgba(11,18,32,0.55)_45%,rgba(11,18,32,0.05)_100%)]" />
                <div
                  className={cn(
                    "relative flex gap-5 p-7",
                    big ? "flex-col md:flex-row md:items-end md:justify-between md:p-11" : "flex-col md:p-8",
                  )}
                >
                  <h3
                    className={cn(
                      "m-0 font-medium tracking-[-0.04em]",
                      big ? "text-[30px]/[1.04] md:text-[40px]/[1.04]" : "text-[28px]/[1.04] md:text-[32px]/[1.04]",
                    )}
                  >
                    {e.titre}
                  </h3>
                  <span className="inline-flex flex-none items-center gap-2.5 self-start rounded-full border border-white/35 px-[22px] py-[13px] text-[18px] font-medium md:text-[20px]">
                    Voir la préparation
                    <Arrow className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------- prix */

const INCLUS: { texte: string; icon: ReactNode }[] = [
  { texte: "Un parcours guidé qui part de votre parcours et de vos écoles", icon: <path d="M4 19V5M4 5h11l-2 4 2 4H4" /> },
  { texte: "Des oraux complets avec un jury vocal qui relance", icon: <><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" /><path d="M19 11a7 7 0 0 1-14 0M12 18v3" /></> },
  { texte: "Un rapport écrit et un transcript après chaque passage", icon: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7M9 8h3" /></> },
  { texte: "Trois niveaux d'exigence, de la découverte au jury difficile", icon: <path d="M4 20v-5M10 20v-9M16 20V8M22 20H2" /> },
  { texte: "Vos fiches écoles et vos récits exportables en PDF", icon: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" /> },
  { texte: "L'historique de tous vos passages, pour mesurer la progression", icon: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" /> },
];

export function HomePrix() {
  return (
    <section className="bg-white py-20 text-[var(--ink)] md:py-[136px]">
      <Container>
        <h2 className={H2}>Un prix unique, aucun compteur</h2>
        <p className={cn(CHAPO, "mt-6 text-[var(--graphite)]")}>Ni abonnement, ni crédits, ni supplément par entraînement.</p>
        <div className="mt-12 grid grid-cols-1 gap-4 md:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-6 rounded-[28px] bg-[var(--ciel)] p-7 text-[var(--ink)] md:p-12">
            <p className="m-0 text-[80px] leading-[0.9] font-medium tracking-[-0.045em] md:text-[104px]">{BRAND.price} €</p>
            <p className="m-0 -mt-1.5 border-b border-[rgba(11,18,32,0.25)] pb-[22px] text-[20px] leading-[1.35] font-medium tracking-[-0.01em] md:text-[22px]">
              <span className="font-bold">3 à 10 fois moins cher</span> qu'une prépa classique
            </p>
            <p className="m-0 text-[18px] leading-[1.55] md:text-[20px]">
              Paiement unique, accès jusqu'à votre concours. Le nombre de passages n'entre pas dans le prix.
            </p>
            <p className="m-0 text-[18px] leading-[1.55] text-[var(--graphite)] md:text-[20px]">
              <span className="font-bold text-[var(--ink)]">{BRAND.priceBoursier} € pour les boursiers</span>, sur présentation de
              la notification de bourse. Mêmes fonctionnalités, sans restriction.
            </p>
            <CtaPill tone="encre" className="mt-auto self-start" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {INCLUS.map((f) => (
              <div key={f.texte} className="flex flex-col gap-[18px] rounded-[24px] bg-[var(--paper)] p-7">
                <span className="inline-flex size-[52px] items-center justify-center rounded-[16px] bg-[var(--ink)] text-[var(--ciel)]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {f.icon}
                  </svg>
                </span>
                <span className="text-[18px] leading-[1.35] font-medium tracking-[-0.01em] md:text-[20px]">{f.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ témoignages */

const PORTRAITS = [
  { src: repetitionAsset, pos: "32% 22%", scale: 2.6 },
  { src: heroAsset, pos: "23% 24%", scale: 3.2 },
  { src: repetitionAsset, pos: "72% 30%", scale: 2.6 },
];

function Quote({ t }: { t: Temoignage }) {
  const h = t.highlight;
  const idx = h ? t.quote.indexOf(h) : -1;
  if (!h || idx < 0) return <>« {t.quote} »</>;
  return (
    <>
      « {t.quote.slice(0, idx)}
      <span className="font-semibold shadow-[inset_0_-0.38em_0_var(--ciel)]">{h}</span>
      {t.quote.slice(idx + h.length)} »
    </>
  );
}

export function HomeTemoignages({ items }: { items: readonly Temoignage[] }) {
  // ordre de la maquette : les avis mis en valeur d'abord, puis les autres
  const ordered = [...items.filter((t) => t.highlight), ...items.filter((t) => !t.highlight)];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % ordered.length), 6500);
    return () => window.clearInterval(id);
  }, [ordered.length, paused]);

  const visible = [0, 1, 2].map((o) => ({ t: ordered[(i + o) % ordered.length]!, idx: (i + o) % ordered.length }));

  return (
    <section className="bg-[var(--ink)] py-20 text-white md:py-[136px]">
      <Container>
        <div className="flex flex-col gap-6">
          <h2 className={H2}>Ils s'entraînent déjà sans limite</h2>
          <p className={cn(CHAPO, "max-w-[1100px] text-[var(--line)]")}>
            Les candidats racontent ce que change un entraînement répété, corrigé et mesuré.
          </p>
        </div>
        <div
          className="mt-12 grid grid-cols-1 gap-4 md:mt-[72px] md:grid-cols-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-live="polite"
        >
          {visible.map(({ t, idx }, k) => {
            const p = PORTRAITS[idx % PORTRAITS.length]!;
            return (
              <figure
                key={`${t.author}-${k}`}
                className={cn("m-0 flex flex-col overflow-hidden rounded-[24px] bg-white text-[var(--ink)]", k > 0 && "hidden md:flex")}
              >
                <div className="h-[220px] overflow-hidden md:h-[260px]">
                  <img
                    src={p.src}
                    alt=""
                    loading="lazy"
                    className="block size-full object-cover"
                    style={{ objectPosition: p.pos, transform: `scale(${p.scale})`, transformOrigin: p.pos }}
                  />
                </div>
                <div className="flex grow flex-col justify-between gap-10 px-7 pt-8 pb-9 md:px-9 md:pt-9 md:pb-10">
                  <blockquote className="m-0 text-[22px] leading-[1.35] font-medium tracking-[-0.02em] md:text-[26px]">
                    <Quote t={t} />
                  </blockquote>
                  <figcaption className="flex items-center gap-3.5">
                    <span className="w-1 self-stretch rounded bg-[var(--ciel)]" />
                    <span>
                      <span className="block text-[22px] font-semibold md:text-[24px]">{t.author}</span>
                      <span className="mt-0.5 block text-[17px] text-[var(--graphite)]">{t.detail}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {ordered.map((t, k) => (
            <button
              key={t.author + k}
              type="button"
              aria-label={`Témoignage ${k + 1}`}
              aria-current={k === i}
              onClick={() => setI(k)}
              className={cn("h-[3px] w-8 cursor-pointer rounded-sm transition-colors", k === i ? "bg-[var(--ciel)]" : "bg-white/20 hover:bg-white/40")}
            />
          ))}
        </div>
        <div className="mt-14">
          <CtaPill />
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

export function HomeFaq({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[var(--paper)] pt-20 pb-20 text-[var(--ink)] md:pt-[136px] md:pb-24">
      <Container className="flex flex-col gap-10 md:gap-14">
        <h2 className={H2}>Questions fréquentes</h2>
        <div className="border-t border-[var(--ink)]">
          {items.map((item, k) => {
            const isOpen = open === k;
            return (
              <div key={item.q} className="border-b border-[rgba(11,18,32,0.1)] py-6 md:py-7">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${k}`}
                  onClick={() => setOpen(isOpen ? null : k)}
                  className="flex w-full cursor-pointer justify-between gap-6 text-left text-[20px] font-medium tracking-[-0.015em] md:text-[24px]"
                >
                  {item.q}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className={cn("mt-1 flex-none transition-transform", isOpen && "rotate-45")}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {isOpen ? (
                  <p id={`faq-${k}`} className="m-0 mt-[18px] max-w-[1000px] text-[18px] leading-[1.65] text-[var(--graphite)] md:text-[20px]">
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="-mt-4">
          <CtaPill />
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ appel final */

export function HomeAppelFinal() {
  return (
    <section className="relative flex min-h-[600px] items-end overflow-hidden bg-[var(--ink)] text-white md:h-[720px]">
      <img
        src={campusAsset}
        alt="Des étudiants arrivent devant l'entrée d'une grande école parisienne"
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
        width={1600}
        height={1008}
      />
      <div aria-hidden className="absolute inset-0 bg-[var(--ink)] opacity-40" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,18,32,0.95)_0%,rgba(11,18,32,0.2)_70%)]" />
      <Container className="relative pb-16 md:pb-24">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-16">
          <div className="max-w-[760px]">
            <h2 className="m-0 text-[40px] leading-none font-medium tracking-[-0.05em] md:text-[64px]">
              Commencez votre préparation aujourd'hui.
            </h2>
            <p className="mt-7 max-w-[560px] text-[18px] leading-[1.6] text-[var(--line)] md:text-[20px]">
              Créez votre compte, construisez votre dossier étape par étape, puis entraînez-vous sans limite
              jusqu'au jour de l'épreuve.
            </p>
          </div>
          <div className="flex flex-none flex-col items-start gap-3.5 md:items-end">
            <CtaPill />
          </div>
        </div>
      </Container>
    </section>
  );
}
