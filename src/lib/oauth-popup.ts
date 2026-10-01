// Connexion Google depuis l'aperçu de l'éditeur Lovable (iframe).
//
// Dans l'iframe, Google refuse d'afficher sa page (403), la pop-up OAuth perd
// son lien avec l'iframe (COOP de Google) et n'a pas le même stockage navigateur
// (partitionnement). On passe donc par un relais en base :
//   1. /auth (iframe) tire un nonce secret et ouvre l'OAuth dans une pop-up,
//      avec ?handoff=<nonce> dans l'URL de retour ;
//   2. /auth/callback (pop-up) dépose son refresh token sous ce nonce
//      (put_oauth_handoff), se déconnecte localement et se ferme ;
//   3. /auth (iframe) interroge claim_oauth_handoff jusqu'à récupérer le jeton
//      (lu une seule fois, supprimé à la lecture), puis ouvre sa session.
// Hors iframe (onglet normal, production), rien de tout ça : redirection classique.
import { supabase } from "@/integrations/supabase/client";

export const HANDOFF_PARAM = "handoff";

/** Nonce secret de 256 bits, en hexadécimal (64 caractères). */
export function newHandoffNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vrai si l'app tourne dans une iframe (aperçu de l'éditeur Lovable). */
export function isFramed(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/** Pop-up : dépose le refresh token sous le nonce. */
export async function putHandoff(nonce: string, refreshToken: string): Promise<boolean> {
  const { error } = await supabase.rpc("put_oauth_handoff", {
    p_nonce: nonce,
    p_refresh_token: refreshToken,
  });
  return !error;
}

/** Iframe : récupère (et supprime) le refresh token déposé sous le nonce, ou null. */
export async function claimHandoff(nonce: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("claim_oauth_handoff", { p_nonce: nonce });
  if (error || typeof data !== "string" || !data) return null;
  return data;
}
