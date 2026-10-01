import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { isSameOriginPopup, sendSessionToOpener } from "@/lib/oauth-popup";

function safePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = safePath(search["next"]);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Connexion en cours - The Prepboard" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [tooLong, setTooLong] = useState(false);

  useEffect(() => {
    let done = false;
    const go = (to: string) => {
      if (done) return;
      done = true;
      navigate({ to, replace: true });
    };
    // Ouverte en pop-up depuis l'aperçu de l'éditeur Lovable : on renvoie la
    // session à la fenêtre d'origine au lieu de naviguer ici.
    const popup = isSameOriginPopup();
    const handle = (session: Session) => {
      if (popup) {
        if (done) return;
        done = true;
        sendSessionToOpener(session);
        return;
      }
      go(next ?? "/dashboard");
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) handle(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handle(session);
    });

    const timer = setTimeout(() => {
      if (!done) setTooLong(true);
    }, 6000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate, next]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl">Connexion en cours…</h1>
      <p className="text-muted-foreground">Nous ouvrons votre espace d'entraînement.</p>
      {tooLong ? (
        <button
          className="text-sm underline"
          onClick={() => navigate({ to: "/auth", search: { mode: "signin" }, replace: true })}
        >
          La connexion prend trop de temps - revenir à la page de connexion
        </button>
      ) : null}
    </main>
  );
}
