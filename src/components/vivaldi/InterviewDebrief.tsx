import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight } from "lucide-react";
import { schoolPhotoOrFallback } from "@/components/vivaldi/school-photos";


/**
 * Rendu du débrief d'entretien classique (module 7) :
 * 1) positionnement (percentile en rouge, sur sa propre ligne), 2) feedback général,
 * 3) revue thème par thème (repliable, appuyée sur des verbatims), 4) priorités de travail.
 * Le transcript mot pour mot est rendu séparément par <InterviewTranscript /> (replié, en fin de page).
 */

type ReviewPart = { title: string; verbatims: string[]; feedback: string };

const md = {
  p: ({ children }: { children?: ReactNode }) => <p className="text-sm leading-relaxed">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="ml-4 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="ml-4 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="text-sm leading-relaxed">{children}</li>,
  h2: ({ children }: { children?: ReactNode }) => (
    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{children}</p>
  ),
  h3: ({ children }: { children?: ReactNode }) => <p className="mt-3 font-semibold text-primary">{children}</p>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-primary">{children}</strong>
  ),
};

function section(text: string, heading: string) {
  const re = new RegExp(`##\\s*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  return text.match(re)?.[1]?.trim() ?? "";
}

/** Certaines sessions plus anciennes utilisent d'autres intitulés pour la même section. */
function sectionAny(text: string, headings: string[]) {
  for (const h of headings) {
    const found = section(text, h);
    if (found) return found;
  }
  return "";
}


function parseReview(block: string): ReviewPart[] {
  const parts: ReviewPart[] = [];
  for (const chunk of block.split(/\n(?=###\s)/)) {
    const lines = chunk.split("\n");
    const first = lines[0] ?? "";
    if (!/^###\s/.test(first)) continue;
    const title = first.replace(/^###\s*/, "").trim();
    const verbatims: string[] = [];
    let feedback = "";
    let field: "verbatims" | "feedback" | null = null;
    for (const raw of lines.slice(1)) {
      const line = raw.replace(/^[-*]\s*/, "").trim();
      const m = line.match(/^\**(VERBATIMS?|FEEDBACK)\**\s*:\s*(.*)$/i);
      if (m) {
        field = /^VERBATIM/i.test(m[1]!) ? "verbatims" : "feedback";
        const value = m[2]!.trim();
        if (field === "verbatims") verbatims.push(...value.split("//").map((v) => v.trim()).filter(Boolean));
        else feedback = value;
        continue;
      }
      if (!raw.trim()) continue;
      if (field === "verbatims") verbatims.push(...line.split("//").map((v) => v.trim()).filter(Boolean));
      else feedback = feedback ? `${feedback}\n${raw.trim()}` : raw.trim();
    }
    parts.push({ title, verbatims, feedback });
  }
  return parts;
}

function Box({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[3px] border border-border/60 bg-secondary/40 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</p>
      {children}
    </div>
  );
}

/** Encadré repliable, utilisé pour chaque partie de la revue et pour le transcript complet. */
function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[3px] border border-border/60 bg-secondary/40">
      <button
        type="button"
        className="flex w-full items-center gap-2 p-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
        <span className="font-semibold text-primary">{title}</span>
      </button>
      {open ? <div className="border-t border-border/60 p-4">{children}</div> : null}
    </div>
  );
}

/**
 * Bandeau encre du débrief (uniquement au-dessus du feedback d'un oral ouvert
 * depuis l'historique) : école, date, format, percentile en jauge rouge.
 * Fond encre uni, sans trame.
 */
export function DebriefHeader({
  school,
  logo,
  date,
  formatLabel,
  difficultyLabel,
  percentile,
  percentileLabel,
}: {
  school: string;
  logo?: string | undefined;
  date: string;
  formatLabel?: string | undefined;
  difficultyLabel?: string | undefined;
  percentile?: number | null;
  percentileLabel?: string | undefined;
}) {
  return (
    <div className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-[3px] bg-primary px-5 py-4 text-primary-foreground">
      <img
        src={schoolPhotoOrFallback(school)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover opacity-40"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/35" />
      {logo ? (
        <img
          src={logo}
          alt={`Logo ${school}`}
          className="relative size-11 shrink-0 rounded-[3px] bg-white object-contain p-1"
          loading="lazy"
        />
      ) : null}
      <div className="relative min-w-0 flex-1">

        <p className="font-display text-lg leading-tight">{school}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] opacity-70">
          {[date, formatLabel, difficultyLabel].filter(Boolean).join(" · ")}
        </p>
      </div>
      {percentile ? (
        <div className="relative flex items-center gap-3">

          <PercentileDial value={percentile} />
          <div className="text-[11px] uppercase tracking-[0.14em] opacity-70">
            PERCENTILE INDICATIF
            <span className="mt-0.5 block font-display text-base normal-case tracking-normal opacity-100">
              P{percentile}
            </span>
            {percentileLabel ? (
              <span className="mt-1 block max-w-[15rem] text-[12px] normal-case leading-snug tracking-normal">
                {percentileLabel}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}


/** Transcript complet, replié par défaut, avec un rendu simple et aéré. */
export function InterviewTranscript({
  turns,
}: {
  turns: { question: string; answer?: string | null }[];
}) {
  if (!turns.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Transcript complet</p>
      <Collapsible title="Consulter le transcript complet">
        <div className="space-y-4 text-sm leading-relaxed">
          {turns.map((t, i) => (
            <div key={i}>
              <p className="font-medium text-primary">Le jury</p>
              <p className="italic text-muted-foreground">{t.question || "-"}</p>
              <p className="mt-2 font-medium text-accent">Vous</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{t.answer || "-"}</p>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

/** Jauge circulaire du percentile (remplie à hauteur du score). */
function PercentileDial({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative size-16 shrink-0 rounded-full"
      style={{
        background: `conic-gradient(var(--rouge) ${pct * 3.6}deg, color-mix(in srgb, var(--line) 70%, transparent) 0deg)`,
      }}
      role="img"
      aria-label={`Percentile ${pct}`}
    >
      <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-card">
        <span className="font-display text-sm font-bold text-destructive">{pct}</span>
      </div>
    </div>
  );
}

/** Retire le jargon interne de la grille des anciens débriefs (zones, profil en quatre axes). */
function cleanPositioning(raw: string) {
  return raw
    .split("\n")
    .filter((line) => {
      const l = line.replace(/^[-*•]\s*/, "").trim();
      if (/^zone\s+(rouge|grise|verte|bleue)\b/i.test(l)) return false;
      if (/^(passé et recul|passe et recul|projet et école|projet et ecole|tenue au creusement|conduite et clarté|conduite et clarte)\s*:/i.test(l))
        return false;
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Percentile + phrase de positionnement extraits du débrief (pour le bandeau encre). */
export function positioningInfo(text?: string | null) {
  const positioning = cleanPositioning(sectionAny(text ?? "", ["Ce que ce classement signifie", "Positionnement"]));
  const posMatch = positioning.match(/^([\s\S]*?)(\bP\d{1,3}\b[^\n]*)([\s\S]*)$/);
  const posScore = posMatch?.[2]?.trim() ?? "";
  const value = Number(posScore.match(/\bP(\d{1,3})\b/)?.[1] ?? "");
  const label = posScore.replace(/^\bP\d{1,3}\b\s*[-–-]?\s*/, "").trim();
  return {
    value: Number.isFinite(value) && value > 0 ? value : null,
    label: label || (Number.isFinite(value) && value > 0 ? `Vous devancez ${value} % des candidats.` : ""),
  };
}

export function InterviewDebrief({
  text,
  positioningInBanner = false,
}: {
  text: string;
  difficulty?: string;
  /** Le positionnement est déjà affiché dans le bandeau encre : on ne le répète pas ici. */
  positioningInBanner?: boolean;
}) {
  const positioning = cleanPositioning(sectionAny(text, ["Ce que ce classement signifie", "Positionnement"]));
  const general = section(text, "Feedback général");
  const review = sectionAny(text, [
    "Feedback détaillé",
    "Feedback des différents moments de l'entretien",
    "Feedback des differents moments de l'entretien",
    "Revue partie par partie",
    "Revue thème par thème",
    "Revue theme par theme",
  ]);

  const priorities = section(text, "À retravailler en priorité");
  const parts = parseReview(review);
  const fallback = !positioning && !general && !review && !priorities;

  // Le percentile (P67 …) est isolé sur sa propre ligne et affiché en rouge.
  const posMatch = positioning.match(/^([\s\S]*?)(\bP\d{1,3}\b[^\n]*)([\s\S]*)$/);
  const posBefore = posMatch?.[1]?.trim() ?? "";
  const posScore = posMatch?.[2]?.trim() ?? "";
  const posRest = posMatch?.[3]?.trim() ?? (posMatch ? "" : positioning);

  const posValue = Number(posScore.match(/\bP(\d{1,3})\b/)?.[1] ?? "");
  const posLabel = posScore.replace(/^\bP\d{1,3}\b\s*[-–-]?\s*/, "").trim();

  if (fallback) {
    return (
      <div className="rounded-[3px] border border-border/60 bg-secondary/40 p-4 text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
          {text}
        </ReactMarkdown>
      </div>
    );
  }

  // Quand le positionnement est déjà dans le bandeau encre, on ne réaffiche aucun bloc ici.
  const showPositioning = positioning && !positioningInBanner;

  return (
    <div className="space-y-4 text-foreground/90">
      {showPositioning ? (
        <Box label="Ce que ce classement signifie">
          {posBefore ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {posBefore}
            </ReactMarkdown>
          ) : null}
          {posScore && !positioningInBanner ? (
            Number.isFinite(posValue) && posValue > 0 ? (
              <div className="my-3 flex items-center gap-4">
                <PercentileDial value={posValue} />
                <div>
                  <p className="text-base font-bold text-destructive">P{posValue}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {posLabel || `Vous devancez ${posValue} % des candidats.`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="my-2 text-base font-bold text-destructive">{posScore}</p>
            )
          ) : null}
          {posRest ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {posRest}
            </ReactMarkdown>
          ) : null}
        </Box>
      ) : null}



      {general ? (
        <Box label="Feedback général">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {general}
          </ReactMarkdown>
        </Box>
      ) : null}

      {priorities ? (
        <Box label="À retravailler en priorité">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {priorities}
          </ReactMarkdown>
        </Box>
      ) : null}

      {parts.length ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Feedback détaillé des différents moments de l'entretien
          </p>
          {parts.map((part, i) => (
            <Collapsible key={i} title={part.title} defaultOpen={i === 0}>
              {part.verbatims.length ? (
                <div className="mb-3 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Verbatims
                  </p>
                  {part.verbatims.map((v, j) => (
                    <p
                      key={j}
                      className="rounded-md border-l-2 border-accent/50 bg-background/60 px-3 py-2 text-sm italic leading-relaxed"
                    >
                      {v}
                    </p>
                  ))}
                </div>
              ) : null}
              {part.feedback ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                  {part.feedback}
                </ReactMarkdown>
              ) : null}
            </Collapsible>
          ))}
        </div>
      ) : review ? (
        <Box label="Feedback détaillé des différents moments de l'entretien">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {review}
          </ReactMarkdown>
        </Box>
      ) : null}

    </div>
  );
}
