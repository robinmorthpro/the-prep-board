// Enchaînement de fin d'entretien : évaluation → rédacteur, avec secours vers l'ancien debrief.

/** Interrupteur : false = tout le monde reçoit l'ancien debrief (debriefInterview). */
export const NOUVEAU_FEEDBACK_ACTIF = true;

export type FeedbackObtenu = {
  debrief: string;
  percentile: number | null;
  source: "nouveau" | "ancien";
  evaluationId: string | null;
};

export function percentileDuTexte(text: string): number | null {
  const m = text.match(/\bP(\d{1,2})\b/);
  const p = m ? Number(m[1]) : NaN;
  return p >= 1 && p <= 99 ? p : null;
}

export async function produireFeedback(deps: {
  actif?: boolean;
  evaluer: () => Promise<{ ok: boolean; id?: string; status?: string }>;
  rediger: (evaluationId: string) => Promise<{ debrief: string; percentile: number | null }>;
  ancien: () => Promise<{ debrief: string }>;
}): Promise<FeedbackObtenu> {
  if (deps.actif ?? NOUVEAU_FEEDBACK_ACTIF) {
    try {
      const ev = await deps.evaluer();
      if (ev.ok && ev.id && ev.status === "ok") {
        const r = await deps.rediger(ev.id);
        return { debrief: r.debrief, percentile: r.percentile, source: "nouveau", evaluationId: ev.id };
      }
    } catch (e) {
      console.error("Nouveau feedback indisponible, secours vers l'ancien debrief", e);
    }
  }
  const old = await deps.ancien();
  return { debrief: old.debrief, percentile: percentileDuTexte(old.debrief), source: "ancien", evaluationId: null };
}
