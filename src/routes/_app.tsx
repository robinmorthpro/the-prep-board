import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/repetia/Mark";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { PARTS, PREP_PARTS, TRAIN_PARTS, moduleNumber } from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

/* Icônes de la maquette (trait 1.8) */
function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const ICONS = {
  home: <path d="M3 11l9-7 9 7M5 10v10h14V10" />,
  board: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  prep: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5z" />
      <path d="M8 7h8" />
    </>
  ),
  mic: (
    <>
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3" />
    </>
  ),
  books: <path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l4 1-3 14-4-1z" />,
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
};

const mainItem = (active: boolean) =>
  `flex items-center gap-3 rounded-[14px] px-[14px] py-3 text-[19px] leading-snug transition-colors ${
    active
      ? "bg-[var(--ciel)] font-semibold text-[var(--ink)]"
      : "font-medium text-[var(--line)] hover:bg-white/5 hover:text-white"
  }`;

function AppLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--paper)] text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const isActive = (to: string) => pathname.startsWith(to);

  // Numérotation : Module 1 à 5 pour la préparation, Module 6 et 7 pour l'entraînement.
  const sideNumber = (part: (typeof PARTS)[number]) => moduleNumber(part.id);

  const partLink = (part: (typeof PARTS)[number]) => {
    const active = pathname.startsWith(part.path);
    return (
      <Link
        key={part.id}
        to={part.path}
        className={`flex gap-[10px] rounded-[10px] px-[10px] py-2 text-[18px] font-medium leading-snug transition-colors ${
          active ? "bg-white/10 text-white" : "text-[var(--gris-sombre)] hover:bg-white/5 hover:text-white"
        }`}
      >
        <span className="tabular-nums text-[var(--gris-doux)]">{sideNumber(part)}</span>
        {part.title}
      </Link>
    );
  };

  const subList = (parts: readonly (typeof PARTS)[number][]) => (
    <div className="mb-2 ml-[26px] mt-1 flex flex-col gap-0.5 border-l border-white/12 pl-4">
      {parts.map(partLink)}
    </div>
  );

  const navLinks = (
    <nav className="flex flex-col gap-1">
      <Link to="/dashboard" className={mainItem(isActive("/dashboard"))}>
        <NavIcon>{ICONS.home}</NavIcon>
        Page d'accueil
      </Link>
      <Link to="/mon-tableau-de-bord" className={mainItem(isActive("/mon-tableau-de-bord"))}>
        <NavIcon>{ICONS.board}</NavIcon>
        Tableau de bord
      </Link>
      <Link to="/informations-personnelles" className={mainItem(isActive("/informations-personnelles"))}>
        <NavIcon>{ICONS.user}</NavIcon>
        Informations personnelles
      </Link>
      <Link to="/je-me-prepare" className={mainItem(isActive("/je-me-prepare"))}>
        <NavIcon>{ICONS.prep}</NavIcon>
        Je me prépare
      </Link>
      {subList(PREP_PARTS)}
      <Link to="/je-m-entraine" className={mainItem(isActive("/je-m-entraine"))}>
        <NavIcon>{ICONS.mic}</NavIcon>
        Je m'entraîne
      </Link>
      {subList(TRAIN_PARTS)}
      <Link to="/ressources" className={mainItem(isActive("/ressources"))}>
        <NavIcon>{ICONS.books}</NavIcon>
        Ressources théoriques
      </Link>
      <div className="mt-3 border-t border-white/12 pt-3">
        <button type="button" onClick={signOut} className={`${mainItem(false)} w-full text-left`}>
          <NavIcon>{ICONS.logout}</NavIcon>
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] md:flex">
      {/* Barre latérale (ordinateur) */}
      <aside className="sticky top-0 hidden h-screen w-[330px] shrink-0 flex-col overflow-y-auto bg-[var(--ink)] px-5 py-7 text-white md:flex">
        <Link to="/dashboard" aria-label="The Prepboard, accueil" className="block px-[14px] pb-8 pt-1">
          <Wordmark tone="chalk" />
        </Link>
        {navLinks}
      </aside>

      {/* Barre supérieure (mobile) */}
      <div className="md:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between bg-[var(--ink)] px-5 py-4">
          <Link to="/dashboard" aria-label="The Prepboard, accueil">
            <Wordmark tone="chalk" />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-white/85"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </header>
        {mobileOpen ? (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto bg-[var(--ink)] px-5 pb-6 text-white">
            {navLinks}
          </div>
        ) : null}
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1110px] px-5 py-6 md:px-14 md:pb-[72px] md:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
