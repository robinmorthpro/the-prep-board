// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Fonctions serveur Vercel à Londres, au plus près de la base Supabase (eu-west-2) : audit de sécurité du 22/10.
  // Le type exposé par la config Lovable est volontairement étroit, mais l'option est bien transmise à Nitro,
  // qui l'écrit dans .vercel/output/functions/__server.func/.vc-config.json (vérifié au build).
  nitro: { vercel: { functions: { regions: ["lhr1"] } } } as unknown as { preset?: string },
});
