import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, ArrowRight, Check, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHero } from "@/components/vivaldi/PageHero";
import { CHAPTERS, searchResources, type ResourceSection } from "@/lib/ressources-data";

export const Route = createFileRoute("/_app/ressources")({
  head: () => ({
    meta: [
      { title: "Ressources théoriques | The Prepboard" },
      { name: "description", content: "La méthode complète des oraux de motivation, chapitre par chapitre : projet pro, écoles, expériences, actualité, jour de l'oral." },
      { property: "og:title", content: "Ressources théoriques | The Prepboard" },
      { property: "og:description", content: "La méthode des oraux BCE et Ecricome, classée par chapitre, avec recherche par mot-clé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResourcesPage,
});

const pad = (n: number) => String(n).padStart(2, "0");

function Section({ s, num, from }: { s: ResourceSection; num: string; from?: string }) {
  return (
    <section id={s.id} className="scroll-mt-24 border-t border-border py-8 first:border-t-0 first:pt-0">
      <p className="m-0 text-sm font-medium tabular-nums text-muted-foreground">
        {num}
        {from && <span> · {from}</span>}
        {s.group && <span> · {s.group}</span>}
      </p>
      <h3 className="m-0 mt-1 text-[22px] font-semibold tracking-[-0.02em]">{s.title}</h3>
      {s.lead && <p className="m-0 mt-3 text-[18px] font-medium leading-[1.5] text-foreground">{s.lead}</p>}

      {s.body && (
        <div className="mt-4 space-y-3 text-[16px] leading-[1.7] text-[var(--graphite)]">
          {s.body.map((p) => <p key={p} className="m-0">{p}</p>)}
        </div>
      )}

      {s.points && (
        <ul className="m-0 mt-4 list-disc space-y-2.5 pl-5 text-[16px] leading-[1.65] text-[var(--graphite)]">
          {s.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      {(s.faire || s.eviter) && (
        <div className={`mt-5 grid gap-6 ${s.faire && s.eviter ? "md:grid-cols-2" : ""}`}>
          {s.faire && (
            <div>
              <p className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.faireLabel ?? "À faire"}</p>
              <ul className="m-0 list-none space-y-2 p-0">
                {s.faire.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[15px] leading-[1.55]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--bleu)]" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {s.eviter && (
            <div>
              <p className="m-0 mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.eviterLabel ?? "À éviter"}</p>
              <ul className="m-0 list-none space-y-2 p-0">
                {s.eviter.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[15px] leading-[1.55]">
                    <Minus className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {s.exemple && (
        <figure className="m-0 mt-5 rounded-2xl bg-muted px-5 py-4">
          <figcaption className="mb-1 text-sm font-semibold text-muted-foreground">Exemple</figcaption>
          <blockquote className="m-0 text-[15px] leading-[1.6]">{s.exemple}</blockquote>
        </figure>
      )}
    </section>
  );
}

function ResourcesPage() {
  const [active, setActive] = useState<string>(CHAPTERS[0]!.id);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchResources(query), [query]);
  const ci = Math.max(0, CHAPTERS.findIndex((c) => c.id === active));
  const chapter = CHAPTERS[ci]!;
  const next = CHAPTERS[ci + 1];
  const searching = query.trim().length > 0;

  const open = (id: string) => {
    setActive(id);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHero eyebrow="Base de connaissance" title="Ressources théoriques">
        La méthode complète, dans l'ordre où l'on prépare un oral. Vous cherchez un point précis ? Tapez un mot-clé.
      </PageHero>

      <div className="relative mb-8">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un mot-clé : perches, master, défauts, échec…"
          aria-label="Rechercher dans les ressources"
          className="h-12 rounded-full pl-12 pr-12 text-base"
        />
        {searching && (
          <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Sommaire" className="min-w-0 break-words lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <p className="m-0 mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sommaire</p>
          <ol className="m-0 list-none space-y-1 p-0">
            {CHAPTERS.map((c, i) => {
              const on = !searching && c.id === active;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => open(c.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex w-full gap-3 rounded-xl px-3 py-2 text-left text-[15px] transition-colors ${on ? "bg-muted font-semibold" : "text-[var(--graphite)] hover:bg-muted/60"}`}
                  >
                    <span className="tabular-nums text-muted-foreground">{pad(i + 1)}</span>
                    <span>{c.title}</span>
                  </button>
                  {on && (
                    <ul className="m-0 mb-2 hidden list-none space-y-1 border-l border-border py-1 pl-4 ml-[30px] lg:block">
                      {c.sections.map((s) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                            className="block text-sm leading-snug text-muted-foreground hover:text-foreground"
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <article className="min-w-0 max-w-[760px]">
          {searching ? (
            <>
              <p className="m-0 mb-6 text-sm text-muted-foreground">
                {results.length} résultat{results.length > 1 ? "s" : ""} pour « {query} »
              </p>
              {results.length === 0 && <p>Aucun résultat. Essayez un autre mot.</p>}
              {results.map(({ chapter: c, index, section }) => (
                <Section key={section.id} s={section} num={`Chapitre ${pad(index)}`} from={c.title} />
              ))}
            </>
          ) : (
            <>
              <header className="mb-8">
                <p className="m-0 text-sm font-medium tabular-nums text-[var(--bleu)]">Chapitre {pad(ci + 1)}</p>
                <h2 className="m-0 mt-1 text-[34px] font-semibold leading-tight tracking-[-0.03em]">{chapter.title}</h2>
                <p className="m-0 mt-3 text-[18px] leading-[1.55] text-[var(--graphite)]">{chapter.intro}</p>
                {chapter.link && (
                  <Link to={chapter.link.to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--bleu)]">
                    {chapter.link.label} <ArrowRight className="size-4" />
                  </Link>
                )}
              </header>
              {chapter.sections.map((s, i) => <Section key={s.id} s={s} num={`${ci + 1}.${i + 1}`} />)}
              {next && (
                <button
                  type="button"
                  onClick={() => open(next.id)}
                  className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border px-5 py-4 text-left hover:bg-muted/60"
                >
                  <span>
                    <span className="block text-sm text-muted-foreground">Chapitre suivant</span>
                    <span className="font-semibold">{next.title}</span>
                  </span>
                  <ArrowRight className="size-5" />
                </button>
              )}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
