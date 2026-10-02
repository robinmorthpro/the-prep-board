import { Link } from "@tanstack/react-router";

const pill =
  "inline-flex items-center gap-[10px] whitespace-nowrap rounded-full border border-[rgba(11,18,32,0.2)] bg-white px-4 py-3 text-[16px] font-semibold text-[var(--ink)] transition-colors md:px-[22px] md:py-[14px] md:text-[20px]";

function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Barre de navigation entre les modules, affichée en haut et en bas de chaque partie. */
export function PartNav({
  prev,
  next,
  nextEnabled = true,
  nextMessage,
  className,
}: {
  /** Chemin du module précédent (absent pour le module 1). */
  prev?: string;
  /** Chemin du module suivant (absent pour le dernier module). */
  next?: string;
  nextEnabled?: boolean;
  /** Message affiché au survol quand le module suivant est verrouillée. */
  nextMessage?: string;
  className?: string;
}) {
  const message = nextMessage ?? "Terminez le travail demandé dans ce module pour continuer.";

  return (
    <nav className={`flex flex-wrap items-center justify-between gap-3 ${className ?? ""}`}>
      {prev ? (
        <Link to={prev} className={`${pill} hover:border-[var(--ink)]`}>
          <ArrowLeft />
          Revenir au module précédent
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        nextEnabled ? (
          <Link to={next} className={`${pill} hover:border-[var(--ink)]`}>
            Passer au module suivant
            <ArrowRight />
          </Link>
        ) : (
          <span className="group relative inline-flex" tabIndex={0}>
            <span aria-disabled="true" className={`${pill} cursor-not-allowed opacity-50`}>
              Passer au module suivant
              <ArrowRight />
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-64 rounded-[14px] bg-[var(--ink)] px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {message}
            </span>
          </span>
        )
      ) : (
        <span />
      )}
    </nav>
  );
}
