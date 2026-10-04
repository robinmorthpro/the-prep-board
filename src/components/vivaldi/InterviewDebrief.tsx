import { useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, FileText, Plus } from "lucide-react";
import { schoolPhotoOrFallback } from "@/components/vivaldi/school-photos";


/**
 * Rendu du débrief d'entretien (module 7), maquette `maquette-app-feedback.html` :
 * 1) bandeau sombre (école, date, jury, percentile global, export PDF),
 * 2) feedback général, 3) priorités de travail, 4) feedback détaillé par moment
 * (repliable, appuyé sur des verbatims), 5) transcript complet.
 * Le percentile par moment n'est pas affiché : seul le percentile global existe.
 */

type ReviewPart = { title: string; verbatims: string[]; feedback: string };

const md: Components = {
  p: ({ children }) => <p className="text-[17px] leading-[1.55] md:text-[20px]">{children}</p>,
  ul: ({ children }) => <ul className="flex list-none flex-col gap-3.5">{children}</ul>,
  ol: ({ children }) => (
    <ol className="ml-5 list-decimal space-y-3 text-[17px] marker:font-semibold marker:text-[var(--bleu-texte)] md:text-[20px]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="ai-li flex gap-3.5 text-[17px] leading-[1.55] md:text-[20px]">
      <span aria-hidden className="ai-dot mt-[11px] size-2 flex-none rounded-full bg-[var(--bleu-texte)]" />
      <span className="min-w-0">{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-bold text-[var(--ink)]">{children}</strong>,
  h3: ({ children }) => <p className="mt-3 text-[20px] font-semibold tracking-[-0.01em] text-[var(--ink)]">{children}</p>,
};

/** Liste numérotée des priorités : carré bleu pâle à la place du chiffre. */
const prio: Components = {
  ...md,
  p: ({ children }) => <p className="text-[17px] leading-[1.55] md:text-[18px]">{children}</p>,
  ol: ({ children }) => <ol className="prio-list">{children}</ol>,
  li: ({ children }) => <li className="min-w-0">{children}</li>,
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
    const title = first.replace(/^###\s*/, "").trim().replace(/^\d+\s*[.)\u2022-]\s*/, "").trim();
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

/** Carte blanche à grand titre, socle commun des sections du débrief. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white p-6 md:p-10">
      <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">{title}</h2>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/**
 * Ligne repliable d'un moment (ou du transcript) : simple rangée bordée quand
 * elle est fermée, panneau gris quand elle est ouverte (maquette feedback).
 */
function CollapsibleRow({
  icon,
  number,
  title,
  defaultOpen = false,
  children,
}: {
  icon?: ReactNode;
  number?: number;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const header = (
    <button type="button" className="flex w-full items-center gap-3.5 text-left" onClick={() => setOpen((o) => !o)}>
      {icon}
      {typeof number === "number" ? (
        <span className="w-7 shrink-0 text-[16px] font-semibold text-[var(--bleu-texte)] md:text-[17px]" style={{ fontVariantNumeric: "tabular-nums" }}>
          {number}.
        </span>
      ) : null}
      <span className="min-w-0 text-[20px] font-medium tracking-[-0.015em] text-[var(--ink)] md:text-[22px]">{title}</span>
      <Plus
        aria-hidden="true"
        className={`ml-auto size-[22px] shrink-0 text-[var(--graphite)] transition-transform ${open ? "rotate-45" : ""}`}
      />
    </button>
  );
  if (open) {
    return (
      <div className="rounded-[20px] border border-[rgba(11,18,32,0.1)] bg-[var(--paper)] p-5 md:p-7">
        {header}
        <div className="mt-5">{children}</div>
      </div>
    );
  }
  return (
    <div className="border-b border-[rgba(11,18,32,0.1)] py-5 md:px-7">{header}</div>
  );
}

/**
 * Bandeau d'ouverture du débrief : photo sombre de l'école, son logo, son nom,
 * date et jury, bouton d'export PDF et percentile global en carte translucide.
 */
export function DebriefHeader({
  school,
  logo,
  date,
  difficultyLabel,
  percentile,
  percentileLabel,
  onExport,
}: {
  school: string;
  logo?: string | undefined;
  date: string;
  difficultyLabel?: string | undefined;
  percentile?: number | null;
  percentileLabel?: string | undefined;
  onExport?: () => void;
}) {
  const pct = percentile ? Math.max(0, Math.min(100, percentile)) : 0;
  const label = percentileLabel?.trim() || (percentile ? `Sur cet entretien, vous faites mieux que ${pct} % des candidats (± 5 percentiles).` : "");
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] text-white">
      <img
        src={schoolPhotoOrFallback(school)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover object-[center_40%]"
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(11,18,32,0.95) 0%, rgba(11,18,32,0.82) 45%, rgba(11,18,32,0.35) 100%)" }}
      />
      <div className="relative p-6 md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col items-start gap-4">
            {logo ? (
              <img
                src={logo}
                alt={`Logo ${school}`}
                className="size-14 rounded-[12px] bg-white object-contain p-1.5"
                loading="lazy"
              />
            ) : null}
            <h2 className="m-0 text-[38px] font-medium leading-[1.02] tracking-[-0.045em] md:text-[56px]">{school}</h2>
            <p className="m-0 text-[16px] text-[#D3DAE6] md:text-[18px]">
              {[date, difficultyLabel].filter(Boolean).join(" · ")}
            </p>
            {onExport ? (
              <button
                type="button"
                onClick={onExport}
                className="mt-2 inline-flex items-center gap-3 rounded-full bg-[#A9C8FF] px-6 py-4 text-[17px] font-semibold text-[var(--ink)] md:px-[26px] md:text-[20px]"
              >
                <Download className="size-[18px]" aria-hidden="true" />
                Exporter le feedback et le transcript en PDF
              </button>
            ) : null}
          </div>
          {percentile ? (
            <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[rgba(11,18,32,0.72)] p-6 backdrop-blur-sm md:p-7">
              <span className="text-[15px] font-semibold text-[#AEB8C9] md:text-[16px]">Percentile indicatif</span>
              <p className="m-0 text-[72px] font-medium leading-[0.9] tracking-[-0.05em] md:text-[104px]">P{pct}</p>
              <div className="relative mt-1.5 h-[10px] rounded-full bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${pct}%`, background: "linear-gradient(90deg, rgba(169,200,255,0.25), #A9C8FF)" }}
                />
                <span
                  className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#A9C8FF] bg-white"
                  style={{ left: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-[13px] text-[#8A94A6] md:text-[14px]">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              <p className="m-0 text-[16px] leading-[1.45] md:text-[18px]">{label}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
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
    <section className="rounded-[24px] bg-white p-6 md:p-10">
      <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">Transcript complet</h2>
      <div className="mt-6">
        <CollapsibleRow
          icon={<FileText className="size-[22px] shrink-0 text-[var(--bleu-texte)]" aria-hidden="true" />}
          title="Consulter le transcript complet"
        >
          <div className="flex flex-col gap-5">
            {turns.map((t, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <p className="m-0 text-[16px] font-semibold text-[var(--ink)] md:text-[17px]">Le jury</p>
                <p className="m-0 italic leading-relaxed text-[var(--graphite)]">{t.question || "-"}</p>
                <p className="m-0 mt-2 text-[16px] font-semibold text-[var(--bleu-texte)] md:text-[17px]">Vous</p>
                <p className="m-0 whitespace-pre-wrap leading-relaxed text-[var(--graphite)]">{t.answer || "-"}</p>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </section>
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

/** Percentile + phrase de positionnement extraits du débrief (pour le bandeau sombre). */
export function positioningInfo(text?: string | null) {
  const positioning = cleanPositioning(sectionAny(text ?? "", ["Ce que ce classement signifie", "Positionnement"]));
  const posMatch = positioning.match(/^([\s\S]*?)(\bP\d{1,3}\b[^\n]*)([\s\S]*)$/);
  const posScore = posMatch?.[2]?.trim() ?? "";
  const value = Number(posScore.match(/\bP(\d{1,3})\b/)?.[1] ?? "");
  const label = posScore.replace(/^\bP\d{1,3}\b\s*[-–-]?\s*/, "").trim();
  return {
    value: Number.isFinite(value) && value > 0 ? value : null,
    label: label || (Number.isFinite(value) && value > 0 ? `Sur cet entretien, vous faites mieux que ${value} % des candidats (± 5 percentiles).` : ""),
  };
}

export function InterviewDebrief({
  text,
  positioningInBanner = false,
}: {
  text: string;
  /** Le percentile est déjà affiché dans le bandeau sombre : on ne le répète pas ici. */
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

  // Le percentile (P67 …) est isolé sur sa propre ligne, il vit dans le bandeau sombre.
  const posMatch = positioning.match(/^([\s\S]*?)(\bP\d{1,3}\b[^\n]*)([\s\S]*)$/);
  const posBefore = posMatch?.[1]?.trim() ?? "";
  const posScore = posMatch?.[2]?.trim() ?? "";
  const posRest = posMatch?.[3]?.trim() ?? (posMatch ? "" : positioning);

  const posValue = Number(posScore.match(/\bP(\d{1,3})\b/)?.[1] ?? "");
  const posLabel = posScore.replace(/^\bP\d{1,3}\b\s*[-–-]?\s*/, "").trim();

  if (fallback) {
    return (
      <section className="rounded-[24px] bg-white p-6 md:p-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
          {text}
        </ReactMarkdown>
      </section>
    );
  }

  // Quand le percentile est déjà dans le bandeau, on ne réaffiche aucun bloc ici.
  const showPositioning = positioning && !positioningInBanner;

  return (
    <div className="flex flex-col gap-6">
      {showPositioning ? (
        <Section title="Ce que ce classement signifie">
          {posBefore ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {posBefore}
            </ReactMarkdown>
          ) : null}
          {posScore ? (
            Number.isFinite(posValue) && posValue > 0 ? (
              <p className="m-0 text-[20px] font-semibold text-[var(--bleu-texte)] md:text-[22px]">P{posValue}</p>
            ) : (
              <p className="m-0 text-[20px] font-semibold text-[var(--bleu-texte)] md:text-[22px]">{posScore}</p>
            )
          ) : null}
          {posLabel ? (
            <p className="m-0 text-[17px] leading-[1.55] text-[var(--graphite)] md:text-[20px]">{posLabel}</p>
          ) : null}
          {posRest ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {posRest}
            </ReactMarkdown>
          ) : null}
        </Section>
      ) : null}

      {general ? (
        <Section title="Feedback général">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {general}
          </ReactMarkdown>
        </Section>
      ) : null}

      {priorities ? (
        <Section title="À retravailler en priorité">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={prio}>
            {priorities}
          </ReactMarkdown>
        </Section>
      ) : null}

      {parts.length || review ? (
        <Section title="Feedback détaillé">
          {parts.length ? (
            <div className="flex flex-col">
              {parts.map((part, i) => (
                <CollapsibleRow key={i} number={i + 1} title={part.title} defaultOpen={i === 0}>
                  {part.feedback ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                      {part.feedback}
                    </ReactMarkdown>
                  ) : null}
                  {part.verbatims.length ? (
                    <div className="mt-5 flex flex-col gap-3">
                      <p className="m-0 text-[18px] font-semibold tracking-[-0.01em] text-[var(--ink)] md:text-[20px]">
                        Verbatims qui illustrent
                      </p>
                      {part.verbatims.map((v, j) => (
                        <blockquote
                          key={j}
                          className="m-0 border-l-4 border-[#A9C8FF] pl-5 text-[16px] leading-[1.6] text-[var(--graphite)] md:text-[18px]"
                        >
                          {v}
                        </blockquote>
                      ))}
                    </div>
                  ) : null}
                </CollapsibleRow>
              ))}
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {review}
            </ReactMarkdown>
          )}
        </Section>
      ) : null}

    </div>
  );
}
