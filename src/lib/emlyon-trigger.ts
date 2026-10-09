/** Silence complet exigé après la présentation avant le tirage des cartes emlyon. */
export const EMLYON_CARDS_SILENCE_MS = 5_000;

/**
 * emlyon : le tirage des cartes ne part qu'après 5 s de silence complet du
 * candidat à la fin de sa présentation. Toute reprise de parole annule le
 * compte ; il repart de zéro à la fin de la nouvelle prise de parole.
 */
export class EmlyonCardsSilence {
  private answerEndedAt: number | null = null;

  /** Fin d'une prise de parole du candidat (ou envoi de la réponse écrite). */
  answerEnded(at: number) {
    this.answerEndedAt = at;
  }

  /** Le candidat reprend la parole : le compte est annulé. */
  voice() {
    this.answerEndedAt = null;
  }

  /** Vrai quand 5 s de silence se sont écoulées depuis la fin de la dernière prise de parole. */
  isDue(at: number) {
    return this.answerEndedAt !== null && at - this.answerEndedAt >= EMLYON_CARDS_SILENCE_MS;
  }

  reset() {
    this.answerEndedAt = null;
  }
}
