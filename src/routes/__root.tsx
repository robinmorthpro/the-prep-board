import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { HANDOFF_PARAM } from "@/lib/oauth-popup";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ink)] px-5 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-[96px] leading-none font-medium tracking-[-0.05em] text-[var(--ciel)]">404</h1>
        <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.02em]">Page introuvable</h2>
        <p className="mt-2 text-[16px] text-[var(--line)]">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--ciel)] px-6 py-3 text-[16px] font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ink)] px-5 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-[28px] font-medium tracking-[-0.03em]">
          Cette page n'a pas pu s'afficher
        </h1>
        <p className="mt-2 text-[16px] text-[var(--line)]">
          Une erreur est survenue de notre côté. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[var(--ciel)] px-6 py-3 text-[16px] font-semibold text-[var(--ink)] transition-opacity hover:opacity-90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Prepboard, préparation aux oraux de concours" },
      {
        name: "description",
        content:
          "The Prepboard : la préparation aux oraux de concours avec un jury vocal et des simulations illimitées.",
      },
      { name: "author", content: "The Prepboard" },
      { property: "og:site_name", content: "The Prepboard" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B1220" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg?v=2", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png?v=2", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/favicon-16.png?v=2", type: "image/png", sizes: "16x16" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const completePendingAuth = () => {
      // Pop-up de relais OAuth (aperçu de l'éditeur) : /auth/callback doit d'abord
      // déposer le jeton pour l'aperçu. Elle hérite du sessionStorage de l'aperçu
      // (window.open) : sans cette exception, on partirait vers /dashboard trop tôt.
      if (new URLSearchParams(window.location.search).has(HANDOFF_PARAM)) return;
      const destination = window.sessionStorage.getItem("repetia_auth_destination");
      if (!destination || !destination.startsWith("/") || destination.startsWith("//")) return;
      window.sessionStorage.removeItem("repetia_auth_destination");
      void router.navigate({ to: destination, replace: true });
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) completePendingAuth();
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) completePendingAuth();
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
