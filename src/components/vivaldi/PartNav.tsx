import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to={prev}>
            <ArrowLeft className="size-4" />
            Revenir au module précédent
          </Link>
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        nextEnabled ? (
          <Button asChild size="sm" className="gap-2">
            <Link to={next}>
              Passer au module suivant
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <span className="group relative inline-flex" tabIndex={0}>
            <Button size="sm" disabled className="pointer-events-none gap-2">
              Passer au module suivant
              <ArrowRight className="size-4" />
            </Button>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-64 rounded-md bg-primary px-3 py-2 text-xs leading-relaxed text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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
