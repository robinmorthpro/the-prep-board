import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { HANDOFF_PARAM, putHandoff } from "@/lib/oauth-popup";

function safePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

function safeNonce(value: unknown): string | undefined {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value) ? value : undefined;
}

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { next?: string; handoff?: string } => {
    const out: { next?: string; handoff?: string } = {};
    const next = safePath(search["next"]);
    if (next) out.next = next;
    const handoff = safeNonce(search[HANDOFF_PARAM]);
    if (handoff) out.handoff = handoff;
    return out;
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
  const { next, handoff } = Route.useSearch();
  const [tooLong, setTooLong] = useState(false);
  const [handedOff, setHandedOff] = useState<"ok" | "error" | null>(null);

  useEffect(() => {
    let done = false;
    const handle = async (session: Session) => {
      if (done) return;
      done = true;
      if (!handoff) {
        navigate({ to: next ?? "/dashboard", replace: true });
        return;
      }
      // Pop-up ouverte depuis l'aperçu de l'éditeur Lovable : on dépose le jeton
      // pour l'aperçu, puis on se déconnecte ici (localement : la session reste
      // valide côté serveur, c'est l'aperçu qui la reprend) et on ferme.
      const ok = await putHandoff(handoff, session.refresh_token);
      await supabase.auth.signOut({ scope: "local" });
      setHandedOff(ok ? "ok" : "error");
      if (ok) window.setTimeout(() => window.close(), 800);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void handle(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void handle(session);
    });

    const timer = setTimeout(() => {
      if (!done) setTooLong(true);
    }, 6000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate, next, handoff]);

  if (handedOff === "ok") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl">Connexion réussie</h1>
        <p className="text-muted-foreground">Cette fenêtre va se fermer. Vous pouvez la fermer vous-même si besoin.</p>
      </main>
    );
  }
  if (handedOff === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl">Connexion impossible</h1>
        <p className="text-muted-foreground">Fermez cette fenêtre et réessayez depuis la page de connexion.</p>
      </main>
    );
  }

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
