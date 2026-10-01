import { describe, expect, it } from "vitest";
import {
  buildAnswerSendPlan,
  EMPTY_TURN_NUDGE,
  IGNORED_NUDGE_NUDGE,
  INVITATION_RE,
  juryTurnRescueDue,
  NO_ANSWER_STEPS,
  noAnswerStepDue,
  normalizeInterviewText,
} from "./interview-text";


/**
 * Toute phrase imposée mot pour mot par une conduite d'école qui ne se termine
 * PAS par une question doit être reconnue par INVITATION_RE : sinon le secours
 * « main rendue » s'arme et fait ajouter au jury une question parasite.
 */
const IMPOSED_PHRASES_WITHOUT_QUESTION = [
  // TBS
  "Vous avez choisi l'article « Le climat en 2030 », nous vous écoutons.",
  "Merci. Cette première partie sur l'article est terminée : nous passons maintenant à la deuxième partie, un échange plus libre. Je vous invite à vous présenter.",
  // ESC Clermont BS
  "Nous allons commencer par le pitch : vous avez deux minutes pour vous présenter. Je vous écoute.",
  "Merci. Passons à la question Impact : choisissez un axe parmi People, Planet, ou Profit.",
  // INSEEC
  "Vous avez choisi l'image du musée : nous vous écoutons.",
  // GEM
  "Vous disposez d'environ cinq minutes : à vous de jouer.",
  "Merci pour cet exposé. Nous passons maintenant à l'interview inversée : c'est à vous de m'interroger.",
  "Il vous reste une minute, c'est le moment de faire votre synthèse si vous le souhaitez.",
  "Très bien. C'est le moment de faire votre synthèse.",
  // ESSEC
  "Je vous propose maintenant une petite mise en situation.",
  // emlyon
  "Passons maintenant au tirage de vos quatre cartes.",
  "Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre.",
  // KEDGE
  "Parfait, commençons. Voici vos cinq cartes.",
  "Merci. Il nous reste trois cartes : Trait d'Action, Trait de Pensée, Trait d'Esprit. Par laquelle voulez-vous commencer ?",
  // EDHEC
  "Voici le mot que vous avez tiré au sort : liberté. Bon courage.",
];

describe("INVITATION_RE", () => {
  for (const phrase of IMPOSED_PHRASES_WITHOUT_QUESTION) {
    it(`reconnaît « ${phrase.slice(0, 48)}… »`, () => {
      expect(INVITATION_RE.test(normalizeInterviewText(phrase))).toBe(true);
    });
  }

  it("n'attrape pas un simple constat du jury", () => {
    const constat = "Très bien, je note que ce sujet vous tient à cœur et que vous l'avez travaillé.";
    expect(INVITATION_RE.test(normalizeInterviewText(constat))).toBe(false);
  });
});

describe("filet « c'est au jury de parler »", () => {
  const base = {
    lastAnswerAt: 1_000,
    lastNudgeAt: null,
    lastJuryAt: 500,
    now: 10_000,
    jurySpeaking: false,
    closed: false,
    rescuedForAt: null,
    mode: "text" as const,
  };

  it("relance quand le candidat a parlé en dernier et que le jury se tait", () => {
    expect(juryTurnRescueDue(base)).toEqual({ at: 1_000, nudge: EMPTY_TURN_NUDGE });
  });

  it("ne relance pas avant le délai du mode", () => {
    expect(juryTurnRescueDue({ ...base, now: 4_000 })).not.toBe(null);
    expect(juryTurnRescueDue({ ...base, now: 3_999 })).toBe(null);
    expect(juryTurnRescueDue({ ...base, mode: "voice", now: 3_999 })).toBe(null);
    expect(juryTurnRescueDue({ ...base, mode: "voice", now: 4_000 })).not.toBe(null);
  });

  it("ne relance jamais quand c'est le jury qui a parlé en dernier", () => {
    expect(juryTurnRescueDue({ ...base, lastJuryAt: 2_000 })).toBe(null);
    expect(juryTurnRescueDue({ ...base, lastAnswerAt: null, lastJuryAt: 2_000 })).toBe(null);
  });

  it("ne relance ni pendant que le jury parle ni après la clôture", () => {
    expect(juryTurnRescueDue({ ...base, jurySpeaking: true })).toBe(null);
    expect(juryTurnRescueDue({ ...base, closed: true })).toBe(null);
  });

  it("au plus une relance par occasion", () => {
    expect(juryTurnRescueDue({ ...base, rescuedForAt: 1_000 })).toBe(null);
    expect(juryTurnRescueDue({ ...base, rescuedForAt: 500 })).not.toBe(null);
  });

  it("couvre aussi le silence qui suit une consigne de l'application", () => {
    // Le jury a parlé (transition trop tôt), l'application a envoyé la consigne
    // de rattrapage, puis plus rien : la relance est due.
    expect(
      juryTurnRescueDue({ ...base, lastAnswerAt: 500, lastJuryAt: 1_000, lastNudgeAt: 2_000 }),
    ).toEqual({ at: 2_000, nudge: IGNORED_NUDGE_NUDGE });
  });

  it("ne relance pas quand le jury a repris la parole après la consigne", () => {
    expect(juryTurnRescueDue({ ...base, lastAnswerAt: 500, lastNudgeAt: 2_000, lastJuryAt: 3_000 })).toBe(null);
  });

  it("ne relance pas quand c'est au candidat de parler après une question du jury", () => {
    expect(juryTurnRescueDue({ ...base, lastAnswerAt: 500, lastNudgeAt: null, lastJuryAt: 2_000 })).toBe(null);
  });

  it("une seule relance par consigne", () => {
    const state = { ...base, lastAnswerAt: 500, lastJuryAt: 1_000, lastNudgeAt: 2_000, rescuedForAt: 2_000 };
    expect(juryTurnRescueDue(state)).toBe(null);
  });
});


describe("candidat muet (oral uniquement)", () => {
  const base = {
    enabled: true,
    silenceSince: 1_000,
    lastJuryAt: 1_000,
    lastAnswerAt: 500,
    now: 1_000,
    jurySpeaking: false,
    closed: false,
    paused: false,
    stepsDone: 0,
  };

  it("déclenche les paliers à 10, 20 puis 30 secondes", () => {
    expect(noAnswerStepDue({ ...base, now: 10_999 })).toBe(null);
    expect(noAnswerStepDue({ ...base, now: 11_000 })).toBe(0);
    expect(noAnswerStepDue({ ...base, now: 21_000, stepsDone: 1 })).toBe(1);
    expect(noAnswerStepDue({ ...base, now: 31_000, stepsDone: 2 })).toBe(2);
  });

  it("les paliers sont ancrés sur le début du silence, même si le jury relance", () => {
    // Le jury a relancé à 11 s et à 21 s : le silence a commencé à 1 s, donc
    // les paliers suivants tombent bien à 21 s et 31 s, pas plus tard.
    expect(noAnswerStepDue({ ...base, lastJuryAt: 11_000, now: 21_000, stepsDone: 1 })).toBe(1);
    expect(noAnswerStepDue({ ...base, lastJuryAt: 21_000, now: 31_000, stepsDone: 2 })).toBe(2);
  });

  it("aucun quatrième palier : l'application ne clôt jamais l'entretien", () => {
    expect(NO_ANSWER_STEPS).toHaveLength(3);
    expect(NO_ANSWER_STEPS.every((step) => step.instruction.length > 0)).toBe(true);
    expect(NO_ANSWER_STEPS[0]!.instruction).toContain("dix secondes");
    expect(noAnswerStepDue({ ...base, now: 60_000, stepsDone: 3 })).toBe(null);
  });

  it("ne déclenche rien pendant une préparation ou une réflexion accordée", () => {
    expect(noAnswerStepDue({ ...base, now: 60_000, paused: true })).toBe(null);
  });

  it("ne déclenche rien sans début de silence connu", () => {
    expect(noAnswerStepDue({ ...base, silenceSince: null, now: 60_000 })).toBe(null);
  });

  it("mêmes délais quand les paliers sont activés en test écrit", () => {
    expect(noAnswerStepDue({ ...base, enabled: true, now: 10_999 })).toBe(null);
    expect(noAnswerStepDue({ ...base, enabled: true, now: 11_000 })).toBe(0);
  });

  it("ne déclenche rien quand les paliers sont inactifs", () => {
    expect(noAnswerStepDue({ ...base, enabled: false, now: 60_000 })).toBe(null);
  });

  it("ne déclenche rien quand le candidat a parlé après le jury", () => {
    expect(noAnswerStepDue({ ...base, lastAnswerAt: 2_000, now: 60_000 })).toBe(null);
  });

  it("ne déclenche rien pendant que le jury parle ni après la clôture", () => {
    expect(noAnswerStepDue({ ...base, now: 60_000, jurySpeaking: true })).toBe(null);
    expect(noAnswerStepDue({ ...base, now: 60_000, closed: true })).toBe(null);
  });

  it("ne repasse jamais par un palier déjà déclenché", () => {
    expect(noAnswerStepDue({ ...base, now: 15_000, stepsDone: 1 })).toBe(null);
  });
});

describe("buildAnswerSendPlan", () => {
  it("envoie toutes les mises à jour contextuelles AVANT le message du candidat", () => {
    const plan = buildAnswerSendPlan({
      before: ["[RÉGIE] Ta prochaine prise de parole commence par cette phrase…"],
      answer: "Voilà ce que j'ai fait pendant ce stage.",
      after: ["[RÉGIE] Temps écoulé : 6 min sur 25 min."],
    });
    expect(plan).toEqual([
      { kind: "context", text: "[RÉGIE] Ta prochaine prise de parole commence par cette phrase…" },
      { kind: "context", text: "[RÉGIE] Temps écoulé : 6 min sur 25 min." },
      { kind: "user", text: "Voilà ce que j'ai fait pendant ce stage." },
    ]);
  });

  it("le repère de temps précède désormais la réponse", () => {
    const plan = buildAnswerSendPlan({ before: [], answer: "Oui.", after: ["[RÉGIE] Temps écoulé : 2 min."] });
    expect(plan.map((s) => s.kind)).toEqual(["context", "user"]);
  });

  it("sans réponse (oral), seules les mises à jour contextuelles partent, dans l'ordre", () => {
    const plan = buildAnswerSendPlan({ before: ["[RÉGIE] X"], answer: null, after: ["[RÉGIE] Temps écoulé : 3 min."] });
    expect(plan).toEqual([
      { kind: "context", text: "[RÉGIE] X" },
      { kind: "context", text: "[RÉGIE] Temps écoulé : 3 min." },
    ]);
  });
});
