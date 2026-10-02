import { cn } from "@/lib/utils";

/**
 * Symbole officiel The Prepboard (brand kit v2) : trois points 40/70/100 % + barre.
 * Ciel sur fond sombre, bleu sur fond clair. Taille minimale : 16 px.
 */
export function SpiralMark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "chalk" | "red";
  /** conservés pour compatibilité, sans effet */
  small?: boolean;
  turns?: number;
}) {
  const fill = tone === "chalk" ? "#A9C8FF" : "#2F5BFF";
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} role="img" aria-label="The Prepboard">
      <circle cx="8" cy="17.5" r="3.2" fill={fill} fillOpacity="0.4" />
      <circle cx="16" cy="13.5" r="3.2" fill={fill} fillOpacity="0.7" />
      <circle cx="24" cy="9.5" r="3.2" fill={fill} />
      <rect x="3" y="22" width="26" height="5" rx="2.5" fill={fill} />
    </svg>
  );
}

/**
 * Logo complet officiel (fichiers SVG fournis, jamais recomposé).
 * `chalk` = version fond sombre. La hauteur suit la taille de police (1.3em).
 */
export function Wordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "chalk";
}) {
  return (
    <span className={cn("inline-flex items-center text-[1.375rem] leading-none", className)}>
      <img
        src={tone === "chalk" ? "/brand/logo-fond-sombre.svg" : "/brand/logo-fond-clair.svg"}
        alt="The Prepboard"
        className="block h-[1.3em] w-auto min-w-[140px]"
        draggable={false}
      />
    </span>
  );
}
