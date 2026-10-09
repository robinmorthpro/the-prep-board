// Enchaînement de fin d'entretien : évaluation → rédacteur, une relance automatique, puis échec affiché.

export const FEEDBACK_ECHEC_MESSAGE = "Votre feedback n'a pas pu être généré. Réessayez dans quelques minutes.";

/** Nombre total de passages de la chaîne : le premier, plus une relance automatique. */
export const FEEDBACK_TENTATIVES = 2;

export type FeedbackObtenu =
  | { ok: true; debrief: string; percentile: number | null; source: "nouveau"; evaluationId: string }
  | { ok: false };

/** Percentile lu dans le texte : seulement pour les anciens feedbacks déjà enregistrés. */
export function percentileDuTexte(text: string): number | null {
  const m = text.match(/\bP(\d{1,2})\b/);
  const p = m ? Number(m[1]) : NaN;
  return p >= 1 && p <= 99 ? p : null;
}

export async function produireFeedback(deps: {
  evaluer: () => Promise<{ ok: boolean; id?: string; status?: string }>;
  rediger: (evaluationId: string) => Promise<{ debrief: string; percentile: number | null }>;
}): Promise<FeedbackObtenu> {
  for (let i = 0; i < FEEDBACK_TENTATIVES; i++) {
    try {
      const ev = await deps.evaluer();
      if (ev.ok && ev.id && ev.status === "ok") {
        const r = await deps.rediger(ev.id);
        if (r.debrief.trim()) return { ok: true, debrief: r.debrief, percentile: r.percentile, source: "nouveau", evaluationId: ev.id };
      }
    } catch (e) {
      console.error(`Feedback : échec de la chaîne (passage ${i + 1})`, e);
    }
  }
  return { ok: false };
}
