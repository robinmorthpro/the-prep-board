/**
 * Stabilité des retours IA : tant que la réponse de l'étudiant n'a pas changé,
 * on ne relance pas l'IA (le feedback déjà affiché reste identique).
 * Si l'input change, on relance et on met à jour la signature.
 */
function hash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `v8_${(h >>> 0).toString(36)}_${input.length}`;
}

export function signature(payload: unknown) {
  return hash(JSON.stringify(payload));
}

const key = (scope: string, id: string) => `repetia.feedback.${scope}.${id}`;

/** true si l'input est identique à celui déjà analysé (et qu'un feedback existe). */
export function isSameInput(scope: string, id: string, payload: unknown, hasFeedback: boolean) {
  if (!hasFeedback || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key(scope, id)) === signature(payload);
  } catch {
    return false;
  }
}

export function rememberInput(scope: string, id: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(scope, id), signature(payload));
  } catch {
    /* stockage indisponible : on relancera l'IA, sans casser l'app */
  }
}
