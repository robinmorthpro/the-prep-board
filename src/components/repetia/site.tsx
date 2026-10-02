import { Link, useRouterState } from "@tanstack/react-router";
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
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const overlay = pathname === "/";
  const cta = "Je commence ma préparation";

  return (
    <header
      className={cn(
        "z-50 text-white",
        overlay ? "absolute inset-x-0 top-0 bg-transparent" : "sticky top-0 bg-[var(--ink)]",
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-14 px-5 py-5 text-[18px] font-medium whitespace-nowrap md:px-12 md:py-[26px]">
        <Link to="/" aria-label="The Prepboard, accueil" className="flex flex-none items-center">
          <img src="/brand/logo-fond-sombre.svg" alt="The Prepboard" className="block h-6 w-auto md:h-7" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setConcoursOpen(true)}
            onMouseLeave={() => setConcoursOpen(false)}
          >
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1.5 hover:text-[var(--ciel)]"
              aria-expanded={concoursOpen}
              onClick={() => setConcoursOpen((v) => !v)}
            >
              Concours préparés
              <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", concoursOpen && "rotate-180")} />
            </button>
            {concoursOpen ? (
              <div className="absolute left-0 top-full pt-3">
                <div className="w-72 overflow-hidden rounded-[14px] bg-white p-2 text-[var(--ink)] shadow-[0_10px_24px_rgba(11,18,32,0.18)]">
                  {CONCOURS.map((c) => (
                    <Link
                      key={c.slug}
                      to="/concours/$slug"
                      params={{ slug: c.slug }}
                      className="block rounded-[10px] px-4 py-3 text-[16px] whitespace-normal hover:bg-[var(--paper)]"
                    >
                      {c.nav}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <a href="/#methode" className="hover:text-[var(--ciel)]">
            La méthode The Prepboard
          </a>
          <Link to="/blog" className="hover:text-[var(--ciel)]">
            Blog
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <Link to="/dashboard" className="rounded-full bg-[var(--ciel)] px-[22px] py-[13px] font-semibold text-[var(--ink)] hover:opacity-90">
              Mon espace d'entraînement
            </Link>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="px-3.5 py-2.5 hover:text-[var(--ciel)]">
                Se connecter
              </Link>
              <Link to="/auth" className="rounded-full bg-[var(--ciel)] px-[22px] py-[13px] font-semibold text-[var(--ink)] hover:opacity-90">
                {cta}
              </Link>
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
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/12 bg-[var(--ink)] px-5 pt-5 pb-7 lg:hidden">
          <p className="text-[13px] font-semibold tracking-[0.1em] text-[var(--gris-sombre)] uppercase">Concours préparés</p>
          <div className="mt-3 grid gap-2">
            {CONCOURS.map((c) => (
              <Link
                key={c.slug}
                to="/concours/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="py-1 text-[17px]"
              >
                {c.nav}
              </Link>
            ))}
          </div>
          <div className="my-5 h-px bg-white/12" />
          <a href="/#methode" onClick={() => setOpen(false)} className="block text-[17px]">
            La méthode The Prepboard
          </a>
          <Link to="/blog" onClick={() => setOpen(false)} className="mt-3 block text-[17px]">
            Blog
          </Link>
          <div className="mt-6 grid gap-2">
            {session ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-full bg-[var(--ciel)] px-6 py-3.5 text-center font-semibold text-[var(--ink)]">
                Mon espace d'entraînement
              </Link>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setOpen(false)} className="rounded-full border border-white/35 px-6 py-3.5 text-center font-medium">
                  Se connecter
                </Link>
                <Link to="/auth" onClick={() => setOpen(false)} className="rounded-full bg-[var(--ciel)] px-6 py-3.5 text-center font-semibold text-[var(--ink)]">
                  {cta}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const label = "m-0 text-[13px] font-semibold tracking-[0.1em] text-[var(--gris-sombre)] uppercase";
  return (
    <footer className="bg-[var(--ink)] pt-16 pb-10 text-[18px] text-white md:pt-20 md:text-[20px]">
      <div className="mx-auto max-w-[1440px] px-5 md:px-12">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <img src="/brand/logo-fond-sombre.svg" alt="The Prepboard" className="block h-7 w-auto" />
            <p className="mt-[18px] max-w-[300px] text-[var(--gris-sombre)]">{BRAND.baseline}</p>
          </div>
          <nav aria-label="Concours">
            <p className={label}>Concours préparés</p>
            <ul className="mt-5 grid gap-3">
              {CONCOURS.map((c) => (
                <li key={c.slug}>
                  <Link to="/concours/$slug" params={{ slug: c.slug }} className="hover:text-[var(--ciel)]">
                    {c.nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="The Prepboard">
            <p className={label}>The Prepboard</p>
            <ul className="mt-5 grid gap-3">
              <li>
                <a href="/#methode" className="hover:text-[var(--ciel)]">La méthode The Prepboard</a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[var(--ciel)]">Je commence ma préparation</Link>
              </li>
              <li>
                <Link to="/test-gratuit" className="hover:text-[var(--ciel)]">Je teste gratuitement</Link>
              </li>
              <li>
                <Link to="/auth" search={{ mode: "signin" }} className="hover:text-[var(--ciel)]">Se connecter</Link>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="break-all hover:text-[var(--ciel)]">{BRAND.email}</a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-16 border-t border-white/12 pt-6 text-[15px] text-[var(--gris-sombre)] md:mt-[72px] md:text-[17px]">
          © {new Date().getFullYear()} The Prepboard. Préparation aux concours.
        </p>
      </div>
    </footer>
  );
}
