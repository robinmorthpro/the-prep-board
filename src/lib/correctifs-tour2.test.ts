// Correctifs relevés pendant le tour 2 (T2-1, T2-5, T2-8).
import { describe, expect, it } from "vitest";
import { CLOSING_QUESTIONS, ESSEC_RETOUR_LIBRE, ESSEC_RETOUR_LIBRE_SEUL, PhaseEngine } from "./phase-engine";
import { monologueMeasuresFor, phaseScheduleForSchool } from "./school-interviews";
import { isNothingToAdd, normalizeInterviewText } from "./interview-text";
import { mainRendueBloquee } from "./main-rendue";

const T0 = 1_700_000_000_000;
const at = (m: number) => T0 + Math.round(m * 60_000);
const LONG =
  "Je pense que cet élément est important parce qu'il montre comment j'ai construit mon raisonnement avec des exemples concrets et une vraie prise de recul sur mon parcours.";
const engineFor = (school: string, total: number, closingQuestion?: string) =>
  new PhaseEngine({
    school,
    schedule: phaseScheduleForSchool(school),
    monologues: monologueMeasuresFor(school),
    totalMinutes: total,
    startedAt: T0,
    closingQuestion,
  });
const jury = (e: PhaseEngine, t: string, m: number) => e.onJuryMessage(t, at(m));
const answer = (e: PhaseEngine, m: number, t = LONG) => e.onCandidateAnswer(t, at(m)).join(" ");

describe("T2-1 : ESSEC, le jury sort du cas de lui-même avec du temps restant", () => {
  const cas = () => {
    const e = engineFor("ESSEC", 45.5, CLOSING_QUESTIONS.C);
    jury(e, "Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", 0.1);
    jury(e, "Présentez-vous, vous avez cinq minutes.", 0.5);
    answer(e, 35.2);
    jury(e, "Je vous propose maintenant une petite mise en situation.", 35.5);
    return e;
  };
  it("la réponse suivante porte la consigne de retour à l'échange libre, puis la clôture arrive à l'heure avec la question tirée", () => {
    const e = cas();
    expect(jury(e, "Merci. La mise en situation est terminée.", 41.1)).toEqual([]);
    expect(answer(e, 41.5)).toContain(ESSEC_RETOUR_LIBRE_SEUL);
    expect(answer(e, 42.6)).toBe("");
    expect(answer(e, 43.6)).toContain(CLOSING_QUESTIONS.C);
  });
  it("la consigne de retour ne part qu'une fois", () => {
    const e = cas();
    jury(e, "Merci. La mise en situation est terminée.", 41.1);
    answer(e, 41.5);
    expect(answer(e, 42.0)).not.toContain(ESSEC_RETOUR_LIBRE_SEUL);
  });
  it("le texte de sortie complet reste inchangé", () => {
    expect(ESSEC_RETOUR_LIBRE).toBe(
      "Remercie le candidat et mets un terme au cas. La mise en situation est terminée. Reviens à l'échange libre jusqu'à la consigne de clôture : aborde un point pas encore traité, sans nouvelle mise en situation.",
    );
  });
});

describe("T2-5 : KEDGE, annonce de la dernière carte, jamais de secours « main rendue »", () => {
  for (const phrase of [
    "Il nous reste une carte, Trait d'Esprit, Victoire amère. Allons-y.",
    "Il nous reste deux cartes : Trait de Pensée et Trait d'Esprit.",
    "Passons à la dernière carte, Trait d'Esprit.",
  ]) {
    it(phrase, () => expect(mainRendueBloquee({ normalized: normalizeInterviewText(phrase) })).toBe(true));
  }
  it("une vraie prise de parole sans question reste rattrapée", () => {
    expect(mainRendueBloquee({ normalized: normalizeInterviewText("Très bien, c'est un parcours intéressant.") })).toBe(false);
  });
});

describe("T2-8 : « rien à ajouter » jugé aussi sur la première phrase", () => {
  it.each([
    "Non, je pense avoir fait le tour. Juste que je trouve ces sujets vraiment passionnants parce qu'ils touchent directement à mon projet professionnel.",
    "Rien d'autre à ajouter, merci. Ces questions m'ont permis de préciser beaucoup de choses sur mon raisonnement et ma façon de voir le sujet.",
    "Non, je pense avoir fait le tour.",
  ])("reconnu : %s", (t) => expect(isNothingToAdd(t)).toBe(true));
  it.each([
    "Non, mais je voudrais ajouter que le train reste trop cher pour beaucoup de familles, et que la taxe doit financer des billets moins chers.",
    "C'est tout à fait ça. Et j'ajouterais que la régulation européenne doit suivre.",
    "Non. Par contre j'aimerais ajouter un point sur le fret, qui me paraît essentiel.",
    "Oui, une chose : la taxe doit être fléchée, sinon elle ne sera jamais acceptée.",
  ])("non reconnu : %s", (t) => expect(isNothingToAdd(t)).toBe(false));
});
