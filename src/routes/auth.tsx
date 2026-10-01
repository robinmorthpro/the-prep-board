import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/hooks/useSession";
import { HANDOFF_PARAM, claimHandoff, isFramed, newHandoffNonce } from "@/lib/oauth-popup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "signup"; next?: string } => {
    const out: { mode?: "signin" | "signup"; next?: string } = {};
    if (search["mode"] === "signin") out.mode = "signin";
    const next = search["next"];
    if (typeof next === "string" && next.startsWith("/") && !next.startsWith("//")) out.next = next;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Connexion - The Prepboard" },
      { name: "description", content: "Créez votre compte The Prepboard et commencez votre préparation aux oraux CPGE." },
      { property: "og:title", content: "Connexion - The Prepboard" },
      { property: "og:description", content: "Accédez à votre préparation aux oraux BCE et Ecricome." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { mode, next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);

  const destination = next ?? "/dashboard";

  function rememberDestination() {
    window.sessionStorage.setItem("repetia_auth_destination", destination);
  }

  function callbackUrl() {
    const base = `${window.location.origin}/auth/callback`;
    return next ? `${base}?next=${encodeURIComponent(next)}` : base;
  }

  // /auth/callback est une sous-route de /auth : sur la page de retour, on lui
  // laisse la main (rendu via <Outlet />) et on ne redirige pas d'ici.
  const { pathname } = useLocation();
  const onCallback = pathname.startsWith("/auth/callback");

  useEffect(() => {
    if (!session || onCallback) return;
    navigate({ to: destination, replace: true });
  }, [session, destination, navigate, onCallback]);

  // Relais OAuth (aperçu de l'éditeur) : minuterie d'interrogation, arrêtée au démontage.
  const handoffTimer = useRef<number | null>(null);
  function stopHandoffPolling() {
    if (handoffTimer.current !== null) {
      window.clearInterval(handoffTimer.current);
      handoffTimer.current = null;
    }
  }
  useEffect(() => stopHandoffPolling, []);

  async function signIn() {
    setBusy(true);
    rememberDestination();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      window.sessionStorage.removeItem("repetia_auth_destination");
      toast.error(error.message);
      return;
    }
    navigate({ to: destination, replace: true });
  }

  async function signUp() {
    setBusy(true);
    rememberDestination();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: callbackUrl(),
      },
    });
    setBusy(false);
    if (error) {
      window.sessionStorage.removeItem("repetia_auth_destination");
      toast.error(error.message);
      return;
    }
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      window.sessionStorage.removeItem("repetia_auth_destination");
      toast.error("Un compte existe déjà avec cet email. Utilisez l'onglet Connexion.");
      return;
    }
    if (data.session) {
      toast.success("Compte créé. Vous pouvez commencer le module 1.");
      navigate({ to: destination, replace: true });
      return;
    }
    toast.success("Compte créé. Confirmez votre email pour accéder à votre espace.");
  }

  async function google() {
    rememberDestination();
    // OAuth Google géré par Supabase (projet perso), plus par Lovable Cloud.
    // Dans l'iframe de l'éditeur Lovable : pop-up + relais en base (voir lib/oauth-popup).
    if (isFramed()) {
      stopHandoffPolling();
      const nonce = newHandoffNonce();
      const sep = callbackUrl().includes("?") ? "&" : "?";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${callbackUrl()}${sep}${HANDOFF_PARAM}=${nonce}`,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data?.url) {
        window.sessionStorage.removeItem("repetia_auth_destination");
        toast.error("Connexion Google impossible.");
        return;
      }
      const popup = window.open(data.url, "prepboard-google-auth", "width=500,height=680");
      if (!popup) {
        toast.error("Autorisez les fenêtres pop-up pour vous connecter avec Google.");
        return;
      }
      // Interroge le relais toutes les 1,5 s pendant 3 min au maximum.
      const startedAt = Date.now();
      handoffTimer.current = window.setInterval(async () => {
        if (Date.now() - startedAt > 3 * 60 * 1000) {
          stopHandoffPolling();
          return;
        }
        const refreshToken = await claimHandoff(nonce);
        if (!refreshToken || handoffTimer.current === null) return;
        stopHandoffPolling();
        const { error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (refreshError) {
          toast.error("Connexion Google impossible.");
          return;
        }
        navigate({ to: destination, replace: true });
      }, 1500);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      window.sessionStorage.removeItem("repetia_auth_destination");
      toast.error("Connexion Google impossible.");
      return;
    }
    // Succès : le navigateur est redirigé vers Google, puis vers /auth/callback.
  }

  if (onCallback) return <Outlet />;

  return (
    <main className="surface-grid flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The Prepboard</p>
        <h1 className="mt-2 text-3xl">Votre préparation aux oraux</h1>
        <Tabs defaultValue={mode === "signin" ? "signin" : "signup"} className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="signup" className="flex-1">
              Inscription
            </TabsTrigger>
            <TabsTrigger value="signin" className="flex-1">
              Connexion
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signup" className="space-y-4 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Camille" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Durand" />
              </div>
            </div>
            <EmailPassword {...{ email, setEmail, password, setPassword }} />
            <Button className="w-full" disabled={busy} onClick={signUp}>
              Créer mon compte (formule gratuite)
            </Button>
          </TabsContent>
          <TabsContent value="signin" className="space-y-4 pt-5">
            <EmailPassword {...{ email, setEmail, password, setPassword }} />
            <Button className="w-full" disabled={busy} onClick={signIn}>
              Me connecter
            </Button>
          </TabsContent>
        </Tabs>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="outline" className="w-full" onClick={google}>
          Continuer avec Google
        </Button>
      </Card>
    </main>
  );
}

function EmailPassword({
  email,
  setEmail,
  password,
  setPassword,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
    </>
  );
}
