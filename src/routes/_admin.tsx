import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/repetia/Mark";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/pilotage-queries";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  );
}

const mainItem = (active: boolean) =>
  `flex items-center gap-3 rounded-[14px] px-[14px] py-3 text-[19px] leading-snug transition-colors ${
    active
      ? "bg-[var(--ciel)] font-semibold text-[var(--ink)]"
      : "font-medium text-[var(--line)] hover:bg-white/5 hover:text-white"
  }`;

/** Espace admin : séparé de l'espace apprenant, accessible au seul rôle admin. */
function AdminLayout() {
  const { session, user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
    else if (session && !roleLoading && isAdmin === false) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, roleLoading, isAdmin, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !session || roleLoading || !isAdmin) {
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

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1">
      <span className="mx-[14px] mb-4 self-start rounded-full bg-white px-[10px] py-1 text-[14px] font-semibold uppercase tracking-[0.06em] text-[var(--ink)]">
        Espace administrateur
      </span>
      <Link to="/pilotage" className={mainItem(pathname === "/pilotage")}>
        <NavIcon>
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </NavIcon>
        Pilotage
      </Link>
      <Link to="/pilotage" hash="candidats" className={mainItem(pathname.startsWith("/candidats"))}>
        <NavIcon>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
          <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.8 3 2.5 3.5 5.2" />
        </NavIcon>
        Candidats
      </Link>
      <div className="mt-auto border-t border-white/12 pt-3">
        <button type="button" onClick={signOut} className={`${mainItem(false)} w-full text-left`}>
          <NavIcon>
            <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
          </NavIcon>
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] md:flex">
      <aside className="sticky top-0 hidden h-screen w-[330px] shrink-0 flex-col overflow-y-auto bg-[var(--ink)] px-5 py-7 text-white md:flex">
        <Link to="/pilotage" aria-label="The Prepboard, pilotage" className="block px-[14px] pb-8 pt-1">
          <Wordmark tone="chalk" />
        </Link>
        {navLinks}
      </aside>

      <div className="md:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between bg-[var(--ink)] px-5 py-4">
          <Link to="/pilotage" aria-label="The Prepboard, pilotage">
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
        {mobileOpen ? <div className="bg-[var(--ink)] px-5 pb-6 pt-2 text-white">{navLinks}</div> : null}
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1110px] px-5 py-6 md:px-14 md:pb-[72px] md:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
