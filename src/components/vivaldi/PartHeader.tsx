import type { ReactNode } from "react";
import { moduleBanner } from "./module-banners";

export function PartHeader({
  step,
  title,
  intro,
  children,
  image,
}: {
  step: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  /** Force un visuel de bannière, sinon déduit du module. */
  image?: string | null;
}) {
  const banner = image === null ? undefined : (image ?? moduleBanner(step));

  if (!banner) {
    return (
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{step}</p>
        <h1 className="mt-2 text-4xl">{title}</h1>
        {intro ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p> : null}
        {children}
      </header>
    );
  }

  return (
    <header className="mb-8">
      <div className="relative overflow-hidden bg-ink">
        <img
          src={banner}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">{step}</p>
          <h1 className="mt-2 max-w-2xl text-4xl text-primary-foreground">{title}</h1>
          {intro ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/80">{intro}</p>
          ) : null}
        </div>
      </div>
      {children}
    </header>
  );
}
