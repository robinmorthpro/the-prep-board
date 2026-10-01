// Connexion Google depuis l'aperçu de l'éditeur Lovable (iframe) :
// la page /auth ouvre Google dans une pop-up ; /auth/callback, ouverte dans
// cette pop-up, renvoie la session à la fenêtre d'origine puis se ferme.
export const OAUTH_POPUP_MESSAGE = "prepboard:oauth-session";

/** Vrai si la page tourne dans une pop-up ouverte par une page de la même origine. */
export function isSameOriginPopup(): boolean {
  try {
    return !!window.opener && window.opener !== window && window.opener.location.origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Envoie la session à la fenêtre d'origine (même origine uniquement) et ferme la pop-up. */
export function sendSessionToOpener(session: { access_token: string; refresh_token: string }): void {
  window.opener.postMessage(
    { type: OAUTH_POPUP_MESSAGE, access_token: session.access_token, refresh_token: session.refresh_token },
    window.location.origin,
  );
  window.close();
}
