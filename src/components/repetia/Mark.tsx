import { cn } from "@/lib/utils";

/**
 * Le signe The Prepboard, tracés officiels du pack de marque.
 * `small` : version sous 24 px (1,5 tour, trait épaissi).
 */
export function SpiralMark({
  className,
  tone = "ink",
  small = false,
}: {
  className?: string;
  tone?: "ink" | "chalk" | "red";
  small?: boolean;
  /** conservé pour compatibilité, sans effet */
  turns?: number;
}) {
  const d = small
    ? "M40 50A11 11 0 0 0 62 50A17 17 0 0 0 28 50A23 23 0 0 0 74 50A29 29 0 0 0 84 62"
    : "M44 50A8.5 8.5 0 0 0 61 50A14 14 0 0 0 33 50A19.5 19.5 0 0 0 72 50A25 25 0 0 0 22 50A30.5 30.5 0 0 0 83 50";
  const dotPos = small ? { cx: 84, cy: 62, r: 9 } : { cx: 83, cy: 50, r: 7 };
  const stroke =
    tone === "chalk" ? "var(--craie)" : tone === "red" ? "var(--rouge)" : "var(--ink)";
  const dot = tone === "chalk" ? "var(--rouge-clair)" : "var(--rouge)";

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("size-8", className)}
      role="img"
      aria-label="The Prepboard"
      fill="none"
    >
      <path
        d={d}
        stroke={stroke}
        strokeWidth={small ? 11 : 8.5}
        strokeLinecap="round"
      />
      <circle cx={dotPos.cx} cy={dotPos.cy} r={dotPos.r} fill={dot} />
    </svg>
  );
}

/** Le verrouillage horizontal : le signe, puis le nom dont « board » est en rouge. */
export function Wordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "chalk";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-[1.375rem] leading-none font-semibold tracking-tight",
        tone === "chalk" ? "text-[var(--craie)]" : "text-[var(--ink)]",
        className,
      )}
    >
      <SpiralMark tone={tone} className="size-[1.3em]" />
      <span aria-hidden>
        The Prep<span className="text-[var(--rouge)]">board</span>
      </span>
      <span className="sr-only">The Prepboard</span>
    </span>
  );
}
