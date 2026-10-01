import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, Menu, X, Minus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Mark";
import { BRAND, CONCOURS, type Temoignage } from "@/lib/site-content";

/* ------------------------------------------------------------- mouvement */

/** Révèle le contenu au scroll (fondu + translation, délai optionnel). */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={cn("reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
}

/** Compteur animé qui monte jusqu'à `value` quand il entre dans le viewport. */
export function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(value);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(eased * value));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ---------------------------------------------------------------- primitives */

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("label-mono", className)}>
      {children}
    </p>
  );
}

export function Section({
  children,
  className,
  tone = "default",
  id,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "paper" | "ink";
  id?: string;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "px-6 py-24 md:py-32",
        tone === "default" && "bg-[var(--coquille)]",
        tone === "paper" && "bg-[var(--coquille-2)]",
        tone === "ink" && "bg-[var(--ink)] text-[var(--craie)]",
        className,
      )}
    >
      <div className={cn("mx-auto", wide ? "max-w-[1400px]" : "max-w-6xl")}>{children}</div>
    </section>
  );
}

export function SectionTitle({
  title,
  intro,
  tone = "ink",
  className,
}: {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "ink" | "chalk";
  className?: string;
}) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <h2 className="text-[2rem] leading-[1.06] font-semibold tracking-[-0.025em] md:text-[3rem]">
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            "mt-6 max-w-2xl text-[17px] leading-relaxed",
            tone === "chalk" ? "text-[var(--seyes)]" : "text-muted-foreground",
          )}
        >
          {intro}
        </p>
      ) : null}
    </header>
  );
}

export function Stat({ value, label, tone = "ink" }: { value: string; label: string; tone?: "ink" | "chalk" }) {
  return (
    <div className={cn("border-t pt-4", tone === "chalk" ? "border-[var(--ink-2)]" : "border-border")}>
      <p className="text-[1.75rem] leading-none font-semibold tabular-nums">{value}</p>
      <p
        className={cn(
          "mt-2 text-[13.5px] leading-snug",
          tone === "chalk" ? "text-[var(--seyes)]" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------- chiffres (compteur) */

export function ChiffresBand({
  items,
}: {
  items: readonly { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-px bg-[var(--ink-2)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((c, k) => {
        const [, digits, rest] = /^(\d+)(.*)$/.exec(c.value) ?? [];
        return (
          <Reveal key={c.label} delay={k * 120} className="bg-[var(--ink)]">
            <div className="flex h-full flex-col justify-between px-7 py-10">
              <p className="font-display text-[3.5rem] leading-none font-bold tracking-[-0.02em] text-[var(--craie)] tabular-nums">
                {digits ? (
                  <>
                    <CountUp value={Number.parseInt(digits, 10)} />
                    {rest}
                  </>
                ) : (
                  c.value
                )}
              </p>
              <p className="mt-5 text-[14.5px] leading-snug text-[var(--seyes)]">{c.label}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------ comparatif (2 ou 3) */

export function CompareTable({
  colonnes,
  lignes,
}: {
  colonnes: [string, string];
  lignes: readonly { critere: string; autre: string; repetia: string }[];
}) {
  return (
    <div className="mt-12 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="label-mono py-3 pr-6 font-normal">
              Critère
            </th>
            <th scope="col" className="label-mono py-3 pr-6 font-normal">
              {colonnes[0]}
            </th>
            <th scope="col" className="label-mono py-3 font-normal text-[var(--rouge)]">
              {colonnes[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.critere} className="border-b border-border align-top">
              <th scope="row" className="py-5 pr-6 text-left font-semibold">
                {l.critere}
              </th>
              <td className="py-5 pr-6 text-muted-foreground">
                <span className="flex gap-2">
                  <Minus aria-hidden className="mt-1.5 size-3.5 shrink-0 text-graphite" />
                  {l.autre}
                </span>
              </td>
              <td className="py-5">
                <span className="flex gap-2">
                  <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-[var(--rouge)]" />
                  {l.repetia}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompareTriTable({
  colonnes,
  lignes,
}: {
  colonnes: readonly [string, string, string];
  lignes: readonly { critere: string; prepa: string; ia: string; repetia: string }[];
}) {
  return (
    <div className="mt-14 overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left align-top text-[15px]">
        <caption className="sr-only">
          Comparaison entre une prépa classique, une IA généraliste et The Prepboard
        </caption>
        <thead>
          <tr className="border-b border-[var(--ink)]/15">
            <th scope="col" className="label-mono w-[16%] py-4 pr-6 font-normal">
              Critère
            </th>
            <th scope="col" className="label-mono w-[24%] py-4 pr-6 font-normal">
              {colonnes[0]}
            </th>
            <th scope="col" className="label-mono w-[24%] py-4 pr-6 font-normal">
              {colonnes[1]}
            </th>
            <th
              scope="col"
              className="w-[30%] bg-[var(--ink)] px-6 py-4 text-[13px] font-semibold tracking-[0.06em] uppercase text-[var(--craie)]"
            >
              The Prep<span className="text-[var(--rouge-clair)]">board</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.critere} className="border-b border-[var(--ink)]/10 align-top">
              <th scope="row" className="py-6 pr-6 text-left font-semibold">
                {l.critere}
              </th>
              <td className="py-6 pr-6 text-muted-foreground">
                <span className="flex gap-2">
                  <Minus aria-hidden className="mt-1.5 size-3.5 shrink-0 text-graphite" />
                  {l.prepa}
                </span>
              </td>
              <td className="py-6 pr-6 text-muted-foreground">
                <span className="flex gap-2">
                  <Minus aria-hidden className="mt-1.5 size-3.5 shrink-0 text-graphite" />
                  {l.ia}
                </span>
              </td>
              <td className="bg-[var(--craie)] px-6 py-6 font-medium">
                <span className="flex gap-2">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-[var(--rouge)]" />
                  {l.repetia}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------- témoignages tournants */

export function TemoignageCarousel({ items }: { items: readonly Temoignage[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % items.length), 5500);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  const visible = [0, 1, 2]
    .map((offset) => items[(i + offset) % items.length])
    .filter((t): t is Temoignage => Boolean(t));

  return (
    <div
      className="mt-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {visible.map((t, k) => (
          <figure
            key={`${t.author}-${k}`}
            className={cn(
              "flex h-full flex-col justify-between border border-[var(--ink)]/12 bg-[var(--craie)] p-7",
              k > 0 && "hidden md:flex",
            )}
          >
            <Quote aria-hidden className="size-5 text-[var(--rouge)]" />
            <blockquote className="mt-5 text-[17px] leading-relaxed">« {t.quote} »</blockquote>
            <figcaption className="mt-6 border-t border-border pt-4 text-[14px]">
              <span className="font-semibold">{t.author}</span>
              <span className="block text-muted-foreground">{t.detail}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {items.map((t, k) => (
          <button
            key={t.author + k}
            type="button"
            aria-label={`Témoignage ${k + 1}`}
            aria-current={k === i}
            onClick={() => setI(k)}
            className={cn(
              "h-1 w-8 transition-colors",
              k === i ? "bg-[var(--rouge)]" : "bg-[var(--ink)]/15 hover:bg-[var(--ink)]/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}

const INCLUS = [
  "Un parcours guidé qui part de votre parcours et de vos écoles",
  "Des oraux complets avec un jury vocal qui relance",
  "Un rapport écrit et un transcript après chaque passage",
  "Trois niveaux d'exigence, de la découverte au jury difficile",
  "Vos fiches écoles et vos récits exportables en PDF",
  "L'historique de tous vos passages, pour mesurer la progression",
];

export function PriceBlock({ context }: { context?: string }) {
  return (
    <div className="grid items-start gap-12 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="label-mono">Accès complet</p>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="text-[4.5rem] leading-none font-semibold tracking-[-0.03em]">
            {BRAND.price} €
          </span>
        </p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
          Paiement unique, accès jusqu'à votre concours{context ? `, ${context}` : ""}. Le nombre de
          passages n'entre pas dans le prix.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed">
          <span className="font-semibold">{BRAND.priceBoursier} € pour les boursiers</span>, sur
          présentation de la notification de bourse. Mêmes fonctionnalités, sans restriction.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/auth">Je me lance</Link>
        </Button>
      </div>
      <ul className="grid gap-3 border-t border-border pt-8 text-[16px] md:border-t-0 md:pt-0">
        {INCLUS.map((f) => (
          <li key={f} className="flex gap-3">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-[var(--rouge)]" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="mt-12 border-t border-[var(--ink)]/15"
    >
      {items.map((item, k) => (
        <AccordionItem key={item.q} value={`q-${k}`} className="border-b border-[var(--ink)]/15">
          <AccordionTrigger className="py-6 text-left text-[19px] leading-snug font-semibold hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="max-w-3xl pb-7 text-[16px] leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function CtaBand({
  titre = "Commencez votre préparation aujourd'hui.",
  texte = "Créez votre compte, construisez votre dossier étape par étape, puis entraînez-vous sans limite jusqu'au jour de l'épreuve.",
}: {
  titre?: string;
  texte?: string;
}) {
  return (
    <Section tone="ink">
      <div className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[3.25rem]">
            {titre}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--seyes)]">{texte}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth">Je me lance</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[var(--seyes)] bg-transparent text-[var(--craie)] hover:bg-[var(--ink-2)] hover:text-[var(--craie)]"
            asChild
          >
            <a href="/#concours">Les concours préparés</a>
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- header/footer */

export function SiteHeader() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [concoursOpen, setConcoursOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-[var(--coquille)]/92 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <Link to="/" aria-label="The Prepboard, accueil">
          <Wordmark />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setConcoursOpen(true)}
            onMouseLeave={() => setConcoursOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-[15px] font-medium hover:text-[var(--rouge)]"
              aria-expanded={concoursOpen}
              onClick={() => setConcoursOpen((v) => !v)}
            >
              Concours préparés
              <ChevronDown
                aria-hidden
                className={cn("size-4 transition-transform", concoursOpen && "rotate-180")}
              />
            </button>
            {concoursOpen ? (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-64 overflow-hidden rounded-lg border border-[var(--ink)]/12 bg-[var(--craie)] shadow-lg">
                  {CONCOURS.map((c) => (
                    <Link
                      key={c.slug}
                      to="/concours/$slug"
                      params={{ slug: c.slug }}
                      className="block px-4 py-3 text-[14.5px] hover:bg-[var(--coquille)] hover:text-[var(--rouge)]"
                    >
                      {c.nav}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <a href="/#methode" className="text-[15px] font-medium hover:text-[var(--rouge)]">
            La méthode The Prepboard
          </a>
          <Link to="/blog" className="text-[15px] font-medium hover:text-[var(--rouge)]">
            Blog
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <Button size="sm" asChild>
              <Link to="/dashboard">Mon espace d'entraînement</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" search={{ mode: "signin" }}>Se connecter</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Je commence l'entraînement</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-[var(--craie)] px-6 py-5 lg:hidden">
          <p className="label-mono">Concours préparés</p>
          <div className="mt-3 grid gap-2">
            {CONCOURS.map((c) => (
              <Link
                key={c.slug}
                to="/concours/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="py-1 text-[16px]"
              >
                {c.nav}
              </Link>
            ))}
          </div>
          <div className="trait-deroulement my-5" />
          <a href="/#methode" onClick={() => setOpen(false)} className="text-[16px]">
            La méthode The Prepboard
          </a>
          <Link to="/blog" onClick={() => setOpen(false)} className="mt-3 block text-[16px]">
            Blog
          </Link>
          <div className="mt-5 grid gap-2">
            {session ? (
              <Button asChild>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  Mon espace d'entraînement
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Je commence l'entraînement
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[var(--ink)] px-6 py-16 text-[var(--craie)]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Wordmark tone="chalk" className="text-[1.75rem]" />
            <p className="mt-5 max-w-xs text-[15px] leading-snug text-[var(--seyes)]">
              {BRAND.baseline}
            </p>
          </div>

          <nav aria-label="Concours" className="text-[14.5px]">
            <p className="label-mono text-[var(--seyes)]">Concours préparés</p>
            <ul className="mt-4 space-y-2.5">
              {CONCOURS.map((c) => (
                <li key={c.slug}>
                  <Link to="/concours/$slug" params={{ slug: c.slug }} className="hover:text-[var(--rouge-clair)]">
                    {c.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="The Prepboard" className="text-[14.5px]">
            <p className="label-mono text-[var(--seyes)]">The Prepboard</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href="/#methode" className="hover:text-[var(--rouge-clair)]">
                  La méthode The Prepboard
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[var(--rouge-clair)]">
                  Je me lance
                </Link>
              </li>
              <li>
                <Link to="/auth" search={{ mode: "signin" }} className="hover:text-[var(--rouge-clair)]">
                  Se connecter
                </Link>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-[var(--rouge-clair)]">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-[var(--ink-2)] pt-6 text-[12.5px] text-[var(--seyes)] md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} The Prepboard. Préparation aux concours.</p>
          <p>{"\n"}</p>
        </div>
      </div>
    </footer>
  );
}
