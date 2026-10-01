# Arriver sur le dashboard après connexion / création de compte

## Ce qui se passe aujourd'hui

Sur la page `/auth`, la connexion par email + mot de passe redirige bien vers `/dashboard`. En revanche les deux chemins qui passent par un aller-retour externe renvoient sur la home page :

- **Connexion Google** : l'URL de retour est l'origine du site (`https://…/`), donc Google ramène toujours sur la home.
- **Création de compte par email** : le lien de confirmation reçu par mail ramène aussi sur l'origine du site, donc sur la home.

## Ce que je vais faire

1. Créer une page de retour d'authentification publique `/auth/callback` : elle attend que la session soit bien établie, puis envoie l'utilisateur sur `/dashboard` (ou sur la page qu'il voulait atteindre avant de se connecter). Elle affiche un simple écran « Connexion en cours… ».
2. Faire pointer la connexion Google et le lien de confirmation d'inscription vers cette page de retour, au lieu de la home.
3. Conserver la destination voulue (paramètre `next`) à travers l'aller-retour, pour qu'un utilisateur qui cliquait par exemple sur « Partie 4 » y revienne après connexion.
4. Sur `/auth`, si l'utilisateur est déjà connecté, il est redirigé immédiatement vers son espace au lieu de rester sur la page de connexion.

Rien d'autre ne change : pas de modification de l'outil d'entraînement, ni du site vitrine, ni des comptes existants.

## Détails techniques

- Nouvelle route publique `src/routes/auth.callback.tsx` (`createFileRoute("/auth/callback")`), sans garde d'authentification, avec `ssr: false` côté rendu utile : elle lit `next` (validé comme chemin relatif same-origin), attend `supabase.auth.getSession()` / `onAuthStateChange`, puis `navigate({ to: next ?? "/dashboard", replace: true })`. En absence de session au bout de quelques secondes, retour sur `/auth` avec un message.
- Dans `src/routes/auth.tsx` :
  - `lovable.auth.signInWithOAuth("google", { redirect_uri: \`${window.location.origin}/auth/callback${next ? "?next=" + encodeURIComponent(next) : ""}\` })`.
  - `signUp({ options: { emailRedirectTo: même URL de callback } })`.
  - Redirections internes via `navigate({ ..., replace: true })` plutôt que `window.location.href`.
- La destination de retour reste une URL publique same-origin (jamais `/dashboard` directement en `redirect_uri`), conformément aux contraintes OAuth.
