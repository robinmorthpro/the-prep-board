import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, Gauge, Home, LayoutList, LogOut, Menu, Mic, UserCircle, X } from "lucide-react";
import { Wordmark } from "@/components/repetia/Mark";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { PARTS, PREP_PARTS, TRAIN_PARTS, moduleNumber } from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});


function AppLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(true);
  const [trainingMenuOpen, setTrainingMenuOpen] = useState(true);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--coquille)] text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const isActive = (to: string) => pathname.startsWith(to);

  const prepParts = PREP_PARTS;
  const trainParts = TRAIN_PARTS;

  const parcoursOpen = prepParts.some((p) => pathname.startsWith(p.path));
  const trainingOpen = trainParts.some((p) => pathname.startsWith(p.path));

  const partLink = (part: (typeof PARTS)[number]) => (
    <Link
      key={part.id}
      to={part.path}
      className={`rounded-md px-3 py-2 text-[13px] leading-snug transition-colors ${
        pathname.startsWith(part.path)
          ? "bg-[var(--craie)]/10 font-medium text-[var(--craie)]"
          : "text-[var(--craie)]/60 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
      }`}
    >
      <span className="mr-2 font-mono text-[11px] text-[var(--rouge-clair)]">
        {moduleNumber(part.id)}
      </span>
      {part.title}
    </Link>
  );

  const navLinks = (
    <nav className="flex flex-col gap-1">
      <Link
        to="/dashboard"
        className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors ${
          isActive("/dashboard")
            ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
            : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
        }`}
      >
        <Home className="size-4 shrink-0" />
        Page d'accueil
      </Link>

      <Link
        to="/mon-tableau-de-bord"
        className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors ${
          isActive("/mon-tableau-de-bord")
            ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
            : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
        }`}
      >
        <Gauge className="size-4 shrink-0" />
        Mon tableau de bord
      </Link>


      <Link
        to="/informations-personnelles"
        className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors ${
          isActive("/informations-personnelles")
            ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
            : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
        }`}
      >
        <UserCircle className="size-4 shrink-0" />
        Informations personnelles
      </Link>

      <div>
        <div
          className={`flex w-full items-center rounded-md text-sm transition-colors ${
            parcoursOpen
              ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
              : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
          }`}
        >
          <Link to="/je-me-prepare" className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <LayoutList className="size-4 shrink-0" />
            Je me prépare
          </Link>
          <button
            type="button"
            onClick={() => setModulesOpen((v) => !v)}
            aria-expanded={modulesOpen}
            aria-label="Afficher les modules de préparation"
            className="px-3 py-2.5"
          >
            <ChevronDown className={`size-4 transition-transform ${modulesOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
        {modulesOpen ? (
          <div className="mt-1 flex flex-col gap-0.5 border-l border-[var(--craie)]/15 pl-3 ml-5">
            {prepParts.map(partLink)}
          </div>
        ) : null}
      </div>

      <div>
        <div
          className={`flex w-full items-center rounded-md text-sm transition-colors ${
            trainingOpen
              ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
              : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
          }`}
        >
          <Link to="/je-m-entraine" className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <Mic className="size-4 shrink-0" />
            Je m'entraîne
          </Link>
          <button
            type="button"
            onClick={() => setTrainingMenuOpen((v) => !v)}
            aria-expanded={trainingMenuOpen}
            aria-label="Afficher les entraînements"
            className="px-3 py-2.5"
          >
            <ChevronDown className={`size-4 transition-transform ${trainingMenuOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
        {trainingMenuOpen ? (
          <div className="mt-1 flex flex-col gap-0.5 border-l border-[var(--craie)]/15 pl-3 ml-5">
            {trainParts.map(partLink)}
          </div>
        ) : null}
      </div>

      <Link
        to="/ressources"
        className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors ${
          isActive("/ressources")
            ? "bg-[var(--craie)]/12 font-medium text-[var(--craie)]"
            : "text-[var(--craie)]/65 hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
        }`}
      >
        <BookOpen className="size-4 shrink-0" />
        Ressources théoriques
      </Link>
    </nav>
  );


  return (
    <div className="min-h-screen bg-[var(--coquille)] md:flex">
      {/* Rail latéral (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--craie)]/10 bg-[var(--ink)] md:flex">
        <div className="px-6 py-7">
          <Link to="/dashboard" aria-label="The Prepboard">
            <Wordmark tone="chalk" />
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">{navLinks}</div>
        <div className="border-t border-[var(--craie)]/10 p-4">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm text-[var(--craie)]/60 transition-colors hover:bg-[var(--craie)]/6 hover:text-[var(--craie)]"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Barre supérieure (mobile) */}
      <div className="md:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--craie)]/10 bg-[var(--ink)] px-5 py-4">
          <Link to="/dashboard" aria-label="The Prepboard">
            <Wordmark tone="chalk" className="text-[1.15rem]" />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="text-[var(--craie)]/80"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {mobileOpen ? (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[var(--craie)]/10 bg-[var(--ink)] px-3 pb-4">
            {navLinks}
            <button
              type="button"
              onClick={signOut}
              className="mt-1 flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm text-[var(--craie)]/60"
            >
              <LogOut className="size-4" />
              Déconnexion
            </button>
          </div>
        ) : null}
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
