import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, XCircle } from "lucide-react";

/** Trois statuts seulement : « Partiel » est traité comme « À perfectionner ». */
type Status = "Validé" | "À perfectionner" | "Manquant";

type GridItem = { criterion: string; status: Status; justification: string; example?: string };

type GridSection = { title: string; items: GridItem[] };

function normalizeStatus(raw: string): Status {
  if (/^validé/i.test(raw)) return "Validé";
  if (/^manquant/i.test(raw)) return "Manquant";
  return "À perfectionner";
}

/** Une ligne « Exemple : … » (ou l'ancien « À écrire plutôt : … ») appartient au critère précédent. */
const EXAMPLE_RE = /^(?:Exemple|À écrire plutôt|A écrire plutôt)\s*:\s*/i;

function parseItems(block: string): GridItem[] {
  const items: GridItem[] = [];
  for (const raw of block.split("\n")) {
    const line = raw.replace(/^[-*]\s*/, "").trim();
    if (!line) continue;
    if (EXAMPLE_RE.test(line)) {
      const last = items[items.length - 1];
      const example = line.replace(EXAMPLE_RE, "").trim();
      if (last) last.example = last.example ? `${last.example} ${example}` : example;
      continue;
    }
    const parts = line.split(" - ");
    const justification = parts.slice(2).join(" - ").trim();
    // L'exemple peut être collé en fin de justification : on l'isole.
    const split = justification.split(/(?:^|\s)(?:Exemple|À écrire plutôt|A écrire plutôt)\s*:\s*/i);
    const item: GridItem = {
      criterion: parts[0]?.trim() ?? line,
      status: normalizeStatus(parts[1]?.trim() ?? ""),
      justification: (split[0] ?? justification).trim(),
    };
    if (split.length > 1) item.example = split.slice(1).join(" ").trim();
    items.push(item);
  }
  return items;
}

/** Découpe le retour en : synthèse (verdict), grilles par section, puis le reste (questions). */
function parseFeedback(input: string) {
  // Les modèles produisent parfois des tirets longs : on normalise pour un rendu et un parsing stables.
  const text = input.replace(/[—–]/g, "-");
  const re = /## Grille([^\n]*)\n([\s\S]*?)(?=\n## |$)/g;
  const sections: GridSection[] = [];
  let rest = text;
  for (const m of text.matchAll(re)) {
    const items = parseItems((m[2] ?? "").trim());
    if (items.length) {
      sections.push({ title: (m[1] ?? "").replace(/^[\s-:-]+/, "").trim() || "Grille d'évaluation", items });
    }
    rest = rest.replace(m[0], "");
  }
  rest = rest.trim();

  // Le niveau est déjà affiché en badge à côté du titre : on retire le titre « Verdict »
  // et la ligne de niveau pour éviter la redite.
  rest = rest
    .replace(/^##\s*Verdict[^\n]*\n/im, "")
    .replace(/^\s*(Validé|À perfectionner|À retravailler|A retravailler)\s*\.?\s*\n/im, "")
    .trim();

  const qIndex = rest.search(/## Questions/i);

  const summary = (qIndex >= 0 ? rest.slice(0, qIndex) : rest).trim();
  const questions = qIndex >= 0 ? rest.slice(qIndex).trim() : "";

  return { sections, summary, questions };
}

function statusBadge(status: Status) {
  if (status === "Validé") {
    return (
      <Badge variant="outline" className="gap-1 border-success/60 bg-success/10 text-success">
        <Check className="size-3" /> Validé
      </Badge>
    );
  }
  if (status === "À perfectionner") {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/60 bg-amber-500/10 text-amber-600">
        <AlertCircle className="size-3" /> À perfectionner
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-destructive/60 bg-destructive/10 text-destructive">
      <XCircle className="size-3" /> Manquant
    </Badge>
  );
}

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h4 className="mt-4 text-base font-semibold text-primary">{children}</h4>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent first:mt-0">{children}</p>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <p className="mt-4 mb-1 border-l-2 border-accent pl-2 text-sm font-semibold text-primary first:mt-0">{children}</p>
  ),
  p: ({ children }: { children?: ReactNode }) => <p className="text-sm leading-relaxed">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="ml-4 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="ml-4 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="text-sm leading-relaxed">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-primary">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-border/60" />,
  code: ({ children }: { children?: ReactNode }) => {
    const label = String(children ?? "");
    if (/^coh[eé]rence$/i.test(label) || /^connaissance$/i.test(label)) {
      const isCoherence = /^coh/i.test(label);
      return (
        <span
          className={`mr-1.5 inline-block rounded-sm px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.12em] ${
            isCoherence
              ? "bg-accent/10 text-accent"
              : "bg-primary/10 text-primary"
          }`}
        >
          {label}
        </span>
      );
    }
    return <code className="rounded bg-secondary px-1 py-0.5 text-xs">{children}</code>;
  },
};

/** Les tags "[Cohérence]" / "[Connaissance]" en tête de puce deviennent des badges. */
function tagify(text: string) {
  return text.replace(/^(\s*[-*]\s*)\[(Cohérence|Coherence|Connaissance)\]\s*/gim, (_m, bullet, tag) => `${bullet}\`${tag}\` `);
}

/**
 * Rendu lisible des retours du jury IA, dans un ordre simple et sans redite :
 * 1) verdict + synthèse générale, 2) grilles section par section (contexte, anecdotes 1-3),
 * 3) questions possibles du jury.
 */
export function AiFeedback({ text }: { text: string }) {
  const { sections, summary, questions } = parseFeedback(text);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      {summary ? (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Synthèse</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {summary}
          </ReactMarkdown>
        </div>
      ) : null}

      {sections.map((section, si) => (
        <div key={si} className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{section.title}</p>
          <ul className="space-y-3">
            {section.items.map((item, i) => (
              <li key={i} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">{item.criterion}</p>
                  <div className="shrink-0 pt-0.5">{statusBadge(item.status)}</div>
                </div>
                {item.justification ? (
                  <p className="text-xs text-muted-foreground">{item.justification}</p>
                ) : null}
                {item.example ? (
                  <p className="rounded-md border border-border/60 bg-background/60 p-2 text-xs font-normal text-foreground/80">
                    <span className="font-normal italic text-muted-foreground">Exemple : </span>
                    {item.example}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {questions ? (
        <div className="rounded-lg border border-border/60 bg-secondary/40 p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {tagify(questions)}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
