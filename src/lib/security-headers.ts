// En-têtes de sécurité ajoutés à toutes les réponses du serveur (audit de sécurité du 22/10).
// Pas de politique de contenu stricte : elle casserait la voix (ElevenLabs), Supabase et les polices.
// Seule la directive frame-ancestors est posée : le site ne s'affiche pas dans le cadre d'un autre site,
// sauf dans l'éditeur Lovable, qui montre l'aperçu dans un cadre.

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
  "Content-Security-Policy":
    "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev https://*.lovable.app https://*.lovableproject.com",
};

/** Renvoie la réponse avec les en-têtes de sécurité, sans écraser ceux déjà posés. */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
