// Messages d'erreur de connexion et d'inscription, en français (QA du 22/10 : Supabase les renvoie en anglais).
// Textes validés par Robin le 22/10. Une erreur inconnue garde le message d'origine.

export const MESSAGE_CHAMPS_VIDES = "Renseignez votre adresse e-mail et un mot de passe.";

const PAR_CODE: Record<string, string> = {
  anonymous_provider_disabled: MESSAGE_CHAMPS_VIDES,
  validation_failed: MESSAGE_CHAMPS_VIDES,
  email_address_invalid: "Cette adresse e-mail n'est pas valide.",
  weak_password: "Le mot de passe doit contenir au moins 6 caractères.",
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Confirmez d'abord votre adresse e-mail grâce au lien reçu.",
  over_email_send_rate_limit: "Patientez une minute avant de redemander l'e-mail.",
  over_request_rate_limit: "Patientez une minute avant de redemander l'e-mail.",
};

const PAR_TEXTE: Array<[RegExp, string]> = [
  [/anonymous sign-ins are disabled|missing email or phone/i, MESSAGE_CHAMPS_VIDES],
  [/unable to validate email address|invalid format|email address .* is invalid/i, PAR_CODE["email_address_invalid"]!],
  [/password should be at least/i, PAR_CODE["weak_password"]!],
  [/invalid login credentials/i, PAR_CODE["invalid_credentials"]!],
  [/email not confirmed/i, PAR_CODE["email_not_confirmed"]!],
  [/for security purposes, you can only request this after|rate limit/i, PAR_CODE["over_email_send_rate_limit"]!],
];

export function authErrorMessage(error: { message: string; code?: string | undefined }): string {
  const parCode = error.code ? PAR_CODE[error.code] : undefined;
  if (parCode) return parCode;
  const trouve = PAR_TEXTE.find(([motif]) => motif.test(error.message));
  return trouve ? trouve[1] : error.message;
}

/** Vrai quand l'adresse ou le mot de passe manque : inutile d'appeler Supabase. */
export function champsVides(email: string, password: string): boolean {
  return email.trim() === "" || password === "";
}
