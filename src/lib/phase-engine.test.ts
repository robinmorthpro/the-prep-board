import { describe, expect, it } from "vitest";
import {
  END_WITH_QUESTION,
  MONTPELLIER_THEME_REMINDER,
  PhaseEngine,
  THEME_REMINDER,
  THEME_REMINDER_WITHOUT_NEWS,
  TRANSITION_RE,
  applyQueuedInstructions,
} from "./phase-engine";
import { CLERMONT_AXIS_OFFER_RE, cleanJuryMessage, isDryAnswer, isNothingToAdd, normalizeInterviewText } from "./interview-text";
import {
  buildClermontImpactVariables,
  measuredPhaseDurationsBlock,
  monologueMeasuresFor,
  phaseScheduleForSchool,
  type PhaseTiming,
} from "./school-interviews";
import { CLERMONT_IMPACT_QUESTIONS } from "./esc-clermont-kb";

/** Temps simulé : T0 = démarrage de l'entretien. */
const T0 = 1_700_000_000_000;
const at = (minutes: number) => T0 + Math.round(minutes * 60_000);

const LONG = "Je pense que cet élément est important parce qu'il montre comment j'ai construit mon raisonnement avec des exemples concrets et une vraie prise de recul sur mon parcours.";
const DRY = "Je ne sais pas.";
/** Question du candidat pendant l'interview inversée GEM. */
const QUESTION = "Comment se passe une journée type dans votre métier ?";
const CLOSING_ORDER = "Pose maintenant, mot pour mot, la question de clôture";

function engineFor(school: string, totalMinutes: number) {
  return new PhaseEngine({
    school,
    schedule: phaseScheduleForSchool(school),
    monologues: monologueMeasuresFor(school),
    totalMinutes,
    startedAt: T0,
  });
}

const jury = (engine: PhaseEngine, text: string, minutes: number) => engine.onJuryMessage(text, at(minutes));
const answer = (engine: PhaseEngine, text: string, minutes: number) => engine.onCandidateAnswer(text, at(minutes));
const marker = (engine: PhaseEngine, minutes: number, text = LONG) => answer(engine, text, minutes).join(" ");
const timingOf = (engine: PhaseEngine, id: string) => engine.timings.find((t) => t.phaseId === id) as PhaseTiming;
const types = (engine: PhaseEngine) => engine.events.map((e) => e.type);
/** Lignes de phase portant réellement un malus (l'en-tête cite toujours la règle). */
const malusLines = (block: string) =>
  block.split("\n").filter((line) => line.startsWith("- ") && line.includes("retire 0,5 point"));

/** Phrases de transition réelles, telles que le jury doit les prononcer. */
const PHRASES = {
  tbs: "Merci. Cette première partie sur l'article est terminée : nous passons maintenant à la deuxième partie, un échange plus libre. Je vous invite à vous présenter.",
  clermontDiscussion: "Merci pour cet échange. Parlons maintenant de votre parcours et de vos projets.",
  inseec: "Merci. Nous passons maintenant à l'entretien classique.",
  gemInversee: "Merci pour cet exposé. Nous passons maintenant à l'interview inversée : c'est à vous de m'interroger.",
  gemMinute: "Il vous reste une minute, c'est le moment de faire votre synthèse.",
  gemSynthese: "Très bien. C'est le moment de faire votre synthèse.",
  gemClassique: "Merci. Nous passons maintenant à un échange plus classique.",
  emlyonFin: "Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre.",
  kedgeAutoportrait: "Voici vos cartes. Commençons par la carte Autoportrait : présentez-vous à partir de ce mot.",
  kedgeCartes: "Merci. Il nous reste trois cartes : Trait d'Action, Trait de Pensée, Trait d'Esprit. Par laquelle voulez-vous commencer ?",
  kedgeConclusion: "Avez-vous une question à me poser, ou quelque chose à ajouter ?",
  essecSituation: "Je vous propose maintenant une petite mise en situation.",
  essecSortie: "Changeons de sujet. Parlons de votre rapport au collectif.",
} as const;

const ADD_QUESTION_ASKED = "Avez-vous autre chose à ajouter sur cette partie ?";

describe("variables Impact Clermont préparées au démarrage", () => {
  it("tire une question non vide appartenant à chaque banque pour Clermont", () => {
    const variables = buildClermontImpactVariables("ESC Clermont BS", () => 0.5);
    expect(CLERMONT_IMPACT_QUESTIONS.people).toContain(variables.clermont_q_people);
    expect(CLERMONT_IMPACT_QUESTIONS.planet).toContain(variables.clermont_q_planet);
    expect(CLERMONT_IMPACT_QUESTIONS.profit).toContain(variables.clermont_q_profit);
    expect(Object.values(variables).every(Boolean)).toBe(true);
  });

  it("laisse les trois variables vides pour les autres écoles", () => {
    expect(buildClermontImpactVariables("TBS Education", () => 0.5)).toEqual({
      clermont_q_people: "",
      clermont_q_planet: "",
      clermont_q_profit: "",
    });
  });
});

describe("nettoyage des messages du jury", () => {
  it("ignore un objet JSON vide", () => expect(cleanJuryMessage(" { } ")).toBe(""));
  it("retire le préfixe JSON vide", () =>
    expect(cleanJuryMessage("{}Merci. Passons à la discussion.")).toBe("Merci. Passons à la discussion."));
});

describe("question « autre chose à ajouter » : dernier recours seulement", () => {
  it("est absente du repère à 2 min sur une phase de 5 min", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bonjour, parlons de votre article.", 0.2);
    expect(marker(engine, 2)).not.toContain("Avez-vous autre chose à ajouter");
  });

  it("est présente à 3 min 30 sur une phase de 5 min (40 % finaux)", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bonjour, parlons de votre article.", 0.2);
    expect(marker(engine, 3.5)).toContain("Avez-vous autre chose à ajouter");
  });

  it("une réponse négative sans question posée ne déclenche aucune bascule", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bonjour, parlons de votre article.", 0.2);
    answer(engine, "Non, je pense avoir fait le tour.", 2);
    expect(types(engine)).not.toContain("early-ordered-nothing-to-add");
    expect(types(engine)).not.toContain("switch-ordered");
  });
});

/**
 * Écoles à phases : premier ordre de bascule attendu et phrase qui le confirme.
 * `setup` reproduit les débuts de phase pilotés par l'application ou par une
 * détection (Clermont, emlyon, KEDGE).
 */
const SCHOOLS: Array<{
  name: string;
  school: string;
  totalMinutes: number;
  dueMinute: number;
  phrase: string;
  orderSnippet: string;
  ongoingSnippet: string;
  setup?: (engine: PhaseEngine) => void;
  targetStepId: string;
}> = [
  {
    name: "TBS Education",
    school: "TBS Education",
    totalMinutes: 20,
    dueMinute: 5,
    phrase: PHRASES.tbs,
    orderSnippet: "deuxième partie",
    ongoingSnippet: "Reste sur l'article",
    targetStepId: "tbs-libre",
  },
  {
    name: "ESC Clermont BS",
    school: "ESC Clermont BS",
    totalMinutes: 30,
    dueMinute: 8,
    phrase: PHRASES.clermontDiscussion,
    orderSnippet: "votre parcours et de vos projets",
    ongoingSnippet: "Reste sur la question Impact",
    setup: (engine) => engine.markPhaseStart("clermont-impact", at(3)),
    targetStepId: "clermont-discussion",
  },
  {
    name: "INSEEC Grande École",
    school: "INSEEC Grande École",
    totalMinutes: 30,
    dueMinute: 5,
    phrase: PHRASES.inseec,
    orderSnippet: "moment de passer à la partie 2",
    ongoingSnippet: "Reste sur l'image",
    targetStepId: "inseec-classique",
  },
  {
    name: "GEM (Grenoble EM)",
    school: "GEM (Grenoble EM)",
    totalMinutes: 30,
    dueMinute: 7,
    phrase: PHRASES.gemInversee,
    orderSnippet: "Nous passons maintenant à l'interview inversée",
    ongoingSnippet: "Reste sur l'exposé",
    targetStepId: "gem-inversee",
  },
  {
    name: "KEDGE",
    school: "KEDGE",
    totalMinutes: 30,
    dueMinute: 4.2,
    phrase: PHRASES.kedgeCartes,
    orderSnippet: "moment de passer à la partie des trois cartes restantes",
    ongoingSnippet: "Reste sur la présentation Autoportrait",
    setup: (engine) => jury(engine, PHRASES.kedgeAutoportrait, 1.2),
    targetStepId: "kedge-cartes",
  },
  {
    name: "emlyon",
    school: "emlyon",
    totalMinutes: 45,
    dueMinute: 20,
    phrase: PHRASES.emlyonFin,
    orderSnippet: "terminé avec les 4 cartes",
    ongoingSnippet: "Reste sur les cartes",
    setup: (engine) => engine.markPhaseStart("emlyon-cartes", at(5)),
    targetStepId: "emlyon-libre",
  },
  {
    name: "ESSEC",
    school: "ESSEC",
    totalMinutes: 45,
    dueMinute: 35,
    phrase: PHRASES.essecSituation,
    orderSnippet: "mise en situation finale",
    // D1 : aucun repère pendant l'échange libre.
    ongoingSnippet: "",
    targetStepId: "essec-situation-1",
  },
];

describe("cas 1 — réponses régulières : ordre au premier repère après l'échéance", () => {
  for (const s of SCHOOLS) {
    it(`${s.name} : aucun ordre avant l'échéance, ordre après, confirmation à la phrase`, () => {
      const engine = engineFor(s.school, s.totalMinutes);
      jury(engine, "Premier message du jury, bienvenue.", 0);
      s.setup?.(engine);
      const before = marker(engine, s.dueMinute - 1);
      expect(before).toContain(s.ongoingSnippet);
      expect(before).not.toContain(s.orderSnippet);
      const order = marker(engine, s.dueMinute + 0.2);
      expect(order).toContain(s.orderSnippet);
      jury(engine, s.phrase, s.dueMinute + 0.4);
      expect(types(engine)).toContain("phase-confirmed");
      const after = marker(engine, s.dueMinute + 0.6);
      expect(after).not.toContain(s.orderSnippet);
    });
  }
});

describe("cas 3 — réponse longue : ordre au repère suivant, sans malus", () => {
  for (const s of SCHOOLS) {
    it(`${s.name} : réponse qui finit à échéance + 1'30`, () => {
      const engine = engineFor(s.school, s.totalMinutes);
      jury(engine, "Premier message du jury, bienvenue.", 0);
      s.setup?.(engine);
      const order = marker(engine, s.dueMinute + 1.5);
      expect(order).toContain(s.orderSnippet);
      jury(engine, s.phrase, s.dueMinute + 1.7);
      const previous = engine.timings.find((t) => t.transitionDetectedAt && t.kind === "phase");
      if (previous) expect(previous.anticipee).toBe(false);
      expect(types(engine)).not.toContain("early-ordered-dry");
      expect(types(engine)).not.toContain("unordered-switch");
    });
  }
});

/** Écoles à monologue mesuré (exposé, image, article, autoportrait). */
const MONOLOGUES: Array<{
  name: string;
  school: string;
  totalMinutes: number;
  dueMinute: number;
  measureId: string;
  stepId: string;
  phrase: string;
  orderSnippet: string;
  /** Premier message du jury qui invite à parler (ou détection du step). */
  open: (engine: PhaseEngine) => void;
}> = [
  {
    name: "TBS Education",
    school: "TBS Education",
    totalMinutes: 20,
    dueMinute: 5,
    measureId: "tbs-article-monologue",
    stepId: "tbs-article",
    phrase: PHRASES.tbs,
    orderSnippet: "deuxième partie",
    open: (engine) => jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0),
  },
  {
    name: "GEM (Grenoble EM)",
    school: "GEM (Grenoble EM)",
    totalMinutes: 30,
    dueMinute: 7,
    measureId: "gem-expose-monologue",
    stepId: "gem-expose",
    phrase: PHRASES.gemInversee,
    orderSnippet: "Nous passons maintenant à l'interview inversée",
    open: (engine) => jury(engine, "Nous sommes prêts à vous écouter pour votre exposé : à vous de jouer.", 0),
  },
  {
    name: "INSEEC Grande École",
    school: "INSEEC Grande École",
    totalMinutes: 30,
    dueMinute: 5,
    measureId: "inseec-image-monologue",
    stepId: "inseec-image",
    phrase: PHRASES.inseec,
    orderSnippet: "moment de passer à la partie 2",
    open: (engine) => jury(engine, "Vous avez choisi l'image de la montagne : nous vous écoutons.", 0),
  },
  {
    name: "KEDGE (autoportrait)",
    school: "KEDGE",
    totalMinutes: 30,
    dueMinute: 4.2,
    measureId: "kedge-autoportrait-monologue",
    stepId: "kedge-autoportrait",
    phrase: PHRASES.kedgeCartes,
    orderSnippet: "moment de passer à la partie des trois cartes restantes",
    open: (engine) => {
      jury(engine, "Bienvenue à cet entretien du Révélateur.", 0);
      jury(engine, PHRASES.kedgeAutoportrait, 1.2);
    },
  },
];

describe("cas 2 — monologue de 2 minutes : bascule seulement à l'échéance", () => {
  for (const m of MONOLOGUES) {
    it(`${m.name} : « phase écourtée » pour le monologue`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      const monoStart = m.school === "KEDGE" ? 1.2 : 0;
      // Monologue de 2 minutes, puis relances : aucun ordre avant l'échéance.
      const first = marker(engine, monoStart + 2);
      expect(first).not.toContain(m.orderSnippet);
      jury(engine, "Merci. Pouvez-vous détailler votre analyse ?", monoStart + 2.1);
      expect(marker(engine, monoStart + 2.6)).not.toContain(m.orderSnippet);
      jury(engine, "Et quel est votre avis personnel ?", monoStart + 2.7);
      expect(marker(engine, m.dueMinute + 0.2)).toContain(m.orderSnippet);
      const timing = timingOf(engine, m.measureId);
      expect(timing.transitionDetectedAt).toBeTruthy();
      const block = measuredPhaseDurationsBlock(m.school, engine.timings);
      expect(block).toContain("phase écourtée");
      expect(block).toContain("durée mesurée 2 min 00 s");
    });
  }
});

describe("cas 4a — « autre chose à ajouter ? » puis réponse négative", () => {
  for (const m of MONOLOGUES) {
    it(`${m.name} : ordre immédiat, anticipée, un seul malus`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      const monoStart = m.school === "KEDGE" ? 1.2 : 0;
      marker(engine, monoStart + 2);
      jury(engine, ADD_QUESTION_ASKED, monoStart + 2.2);
      const order = answer(engine, "Non, je pense avoir fait le tour.", monoStart + 2.5).join(" ");
      expect(order).toContain(m.orderSnippet);
      expect(types(engine)).toContain("early-ordered-nothing-to-add");
      jury(engine, m.phrase, monoStart + 2.7);
      expect(timingOf(engine, m.stepId).anticipee).toBe(true);
      const block = measuredPhaseDurationsBlock(m.school, engine.timings);
      expect(malusLines(block)).toHaveLength(1);
      expect(block).toContain("déjà été compté");
    });
  }
});

describe("cas 4a bis — réponse positive : aucun ordre", () => {
  for (const m of MONOLOGUES) {
    it(`${m.name} : « Oui, j'aimerais ajouter que… »`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      const monoStart = m.school === "KEDGE" ? 1.2 : 0;
      marker(engine, monoStart + 2);
      jury(engine, ADD_QUESTION_ASKED, monoStart + 2.2);
      const reply = answer(
        engine,
        `Oui, j'aimerais ajouter que ${LONG}`,
        monoStart + 2.5,
      ).join(" ");
      expect(reply).not.toContain(m.orderSnippet);
      expect(types(engine)).not.toContain("early-ordered-nothing-to-add");
    });
  }
});

describe("cas 4b — trois réponses sèches consécutives", () => {
  for (const m of MONOLOGUES) {
    it(`${m.name} : ordre anticipé par l'application`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      const monoStart = m.school === "KEDGE" ? 1.2 : 0;
      expect(marker(engine, monoStart + 1, DRY)).not.toContain(m.orderSnippet);
      jury(engine, "Pouvez-vous préciser ?", monoStart + 1.1);
      expect(marker(engine, monoStart + 1.4, DRY)).not.toContain(m.orderSnippet);
      jury(engine, "Un exemple concret ?", monoStart + 1.5);
      const order = marker(engine, monoStart + 1.8, DRY);
      expect(order).toContain(m.orderSnippet);
      expect(types(engine)).toContain("early-ordered-dry");
      jury(engine, m.phrase, monoStart + 2);
      expect(timingOf(engine, m.stepId).anticipee).toBe(true);
    });
  }
});

describe("bascule du jury sans ordre de l'application", () => {
  // D21 : TBS reconnaît la bascule faite par le jury, sans rattrapage.
  for (const m of MONOLOGUES.filter((item) => item.school !== "TBS Education")) {
    it(`${m.name} : rattrapée deux fois, puis confirmée sans malus`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      marker(engine, 2);
      expect(jury(engine, m.phrase, 3)[0]).toContain("Reprends immédiatement la partie en cours");
      expect(types(engine)).toContain("recovered-switch");
      expect(types(engine)).not.toContain("unordered-switch");
      expect(jury(engine, m.phrase, 3.2)).toHaveLength(1);
      expect(jury(engine, m.phrase, 3.4)).toHaveLength(0);
      expect(types(engine)).toContain("unordered-switch");
      expect(timingOf(engine, m.stepId).anticipee).toBe(false);
    });
  }
});

describe("rattrapage d'une transition improvisée", () => {
  const impactEngine = () => {
    const engine = engineFor("ESC Clermont BS", 30);
    jury(engine, "Bienvenue.", 0);
    engine.markPhaseStart("clermont-impact", at(1));
    return engine;
  };

  it("renvoie la consigne de rattrapage, ne confirme pas la phase, poursuit la mesure", () => {
    const engine = impactEngine();
    const instructions = jury(engine, "Merci. Nous passons maintenant à la suite.", 3.5);
    expect(instructions).toHaveLength(1);
    expect(instructions[0]).toContain("la question Impact");
    expect(types(engine)).toContain("recovered-switch");
    expect(types(engine)).not.toContain("improvised-switch");
    expect(timingOf(engine, "clermont-impact").transitionDetectedAt).toBeUndefined();
    expect(marker(engine, 3.7)).toContain("la question Impact");
  });

  it("au troisième essai, considère la phase terminée sans malus", () => {
    const engine = impactEngine();
    expect(jury(engine, "Merci. Nous passons maintenant à la suite.", 3)).toHaveLength(1);
    expect(jury(engine, "Merci. Nous passons maintenant à la suite.", 3.3)).toHaveLength(1);
    expect(jury(engine, "Merci. Nous passons maintenant à la suite.", 3.6)).toHaveLength(0);
    expect(types(engine)).toContain("improvised-switch");
    expect(timingOf(engine, "clermont-impact").anticipee).toBe(false);
    expect(marker(engine, 6.2)).not.toContain("votre parcours et de vos projets");
  });

  it("ne rattrape pas une transition détectée après un ordre de l'application", () => {
    const engine = impactEngine();
    expect(marker(engine, 6.1)).toContain("C'est maintenant le moment de passer à la partie 3");
    expect(jury(engine, PHRASES.clermontDiscussion, 6.3)).toHaveLength(0);
    expect(types(engine)).not.toContain("recovered-switch");
    expect(types(engine)).toContain("phase-confirmed");
  });

  it("ne confond pas une relance avec une transition", () => {
    const engine = impactEngine();
    jury(engine, "Parlons de votre exemple, qu'avez-vous fait ?", 3);
    expect(types(engine)).not.toContain("recovered-switch");
    expect(marker(engine, 3.2)).toContain("question Impact");
  });
});

describe("garde-fou — ordre jamais suivi", () => {
  for (const m of MONOLOGUES) {
    it(`${m.name} : phase forcée après 2 repères, sans malus`, () => {
      const engine = engineFor(m.school, m.totalMinutes);
      m.open(engine);
      marker(engine, m.dueMinute + 0.2);
      marker(engine, m.dueMinute + 0.5);
      const forced = marker(engine, m.dueMinute + 0.8);
      expect(types(engine)).toContain("forced-after-2-markers");
      expect(forced).not.toContain(m.orderSnippet);
      expect(timingOf(engine, m.stepId).anticipee).toBe(false);
    });
  }
});

describe("ESC Clermont BS", () => {
  it("aucun ordre vers la question Impact avant markPhaseStart", () => {
    const engine = engineFor("ESC Clermont BS", 30);
    jury(engine, "Nous allons commencer par le pitch, je vous écoute.", 0);
    for (const minute of [1, 2, 3, 4]) {
      const text = marker(engine, minute);
      expect(text).toContain("Reste sur le pitch");
      expect(text).not.toContain("Reste sur la question Impact");
    }
    expect(types(engine)).not.toContain("switch-ordered");
    expect(types(engine)).not.toContain("forced-after-2-markers");
  });

  it("la Discussion est due 5 minutes après markPhaseStart", () => {
    const engine = engineFor("ESC Clermont BS", 30);
    jury(engine, "Nous allons commencer par le pitch, je vous écoute.", 0);
    engine.markPhaseStart("clermont-impact", at(6));
    expect(marker(engine, 10)).not.toContain("votre parcours et de vos projets");
    expect(marker(engine, 11.1)).toContain("votre parcours et de vos projets");
  });
});

describe("emlyon", () => {
  it("cartes démarrées par l'application, fin à 10' sous le plancher", () => {
    const engine = engineFor("emlyon", 45);
    jury(engine, "Bienvenue, est-ce que c'est clair pour vous ?", 0);
    engine.markPhaseStart("emlyon-cartes", at(5));
    marker(engine, 8);
    jury(engine, PHRASES.emlyonFin, 15);
    const timing = timingOf(engine, "emlyon-cartes");
    expect(timing.transitionDetectedAt).toBeTruthy();
    const block = measuredPhaseDurationsBlock("emlyon", engine.timings);
    expect(block).toContain("durée mesurée 10 min 00 s");
    expect(block).toContain("phase écourtée");
  });

  it("ordre de fin des cartes à 15 minutes de cartes", () => {
    const engine = engineFor("emlyon", 45);
    jury(engine, "Bienvenue, est-ce que c'est clair pour vous ?", 0);
    engine.markPhaseStart("emlyon-cartes", at(5));
    expect(marker(engine, 19)).not.toContain("terminé avec les 4 cartes");
    expect(marker(engine, 20.2)).toContain("terminé avec les 4 cartes");
  });
});

describe("ESSEC", () => {
  const open = (engine: PhaseEngine) => {
    jury(engine, "Cet entretien va durer 45 minutes. Est-ce que c'est clair pour vous ?", 0);
    jury(engine, "Très bien. Vous disposez d'environ cinq minutes pour vous présenter, je vous écoute.", 0.3);
  };

  it("mise en situation unique ordonnée à 35 minutes", () => {
    const engine = engineFor("ESSEC", 45);
    open(engine);
    expect(marker(engine, 34)).not.toContain("mise en situation finale");
    expect(marker(engine, 35.2)).toContain("mise en situation finale");
  });

  it("la clôture Y−2 reste prioritaire à la fin de la mise en situation", () => {
    const engine = engineFor("ESSEC", 45);
    open(engine);
    marker(engine, 35.2);
    jury(engine, PHRASES.essecSituation, 35.5);
    expect(marker(engine, 42)).not.toContain("question de clôture");
    expect(marker(engine, 43)).toContain(CLOSING_ORDER);
  });

  it("D27 — sortie anticipée du jury à plus de 2 min de la fin : retour à l'échange libre, sans clôture", () => {
    const engine = engineFor("ESSEC", 45);
    open(engine);
    marker(engine, 35.2);
    jury(engine, PHRASES.essecSituation, 35.5);
    marker(engine, 39);
    expect(jury(engine, PHRASES.essecSortie, 40)).toEqual([]);
    expect(engine.closingSent).toBe(false);
    expect(engine.currentPhaseId).toBe("essec-sortie");
    // Échange libre : aucun repère, puis clôture normale à Y−2.
    expect(marker(engine, 41)).not.toContain("Phase en cours");
    expect(marker(engine, 41.5)).toBe("");
    expect(marker(engine, 43)).toContain(CLOSING_ORDER);
    expect(types(engine)).not.toContain("recovered-switch");
    expect(types(engine)).not.toContain("unordered-switch");
  });

  it("détecte aussi qu'une mise en situation est épuisée quand le jury dit que le cas est clos", () => {
    const engine = engineFor("ESSEC", 45);
    open(engine);
    marker(engine, 35.2);
    jury(engine, PHRASES.essecSituation, 35.5);
    expect(jury(engine, "Le cas est clos.", 40)).toEqual([]);
    expect(engine.currentPhaseId).toBe("essec-sortie");
    expect(engine.closingSent).toBe(false);
  });

  it("n'a qu'une seule phase de mise en situation, sans malus de durée", () => {
    const situations = phaseScheduleForSchool("ESSEC").filter((step) => step.id.startsWith("essec-situation"));
    expect(situations).toHaveLength(1);
    expect(situations[0]?.timing).toBeUndefined();
  });

  const presentation = (minutes: number) => {
    const engine = engineFor("ESSEC", 45);
    jury(engine, "Cet entretien va durer 45 minutes. Est-ce que c'est clair pour vous ?", 0);
    jury(engine, "Très bien. Vous disposez d'environ cinq minutes pour vous présenter, je vous écoute.", 0);
    answer(engine, LONG, minutes);
    jury(engine, "Merci. Parlons de votre parcours.", minutes + 0.2);
    return measuredPhaseDurationsBlock("ESSEC", engine.timings);
  };

  it("présentation de 2'30 : aucun malus", () => {
    expect(presentation(2.5)).not.toContain("Phase écourtée");
  });

  it("présentation de 6' : malus (trop longue)", () => {
    expect(presentation(6)).toContain("Présentation trop longue");
  });

  it("présentation de 4' : aucun malus", () => {
    const block = presentation(4);
    expect(block).toContain("durée mesurée 4 min 00 s");
    expect(malusLines(block)).toHaveLength(0);
  });
});

describe("D2 — message de la moitié de l'échange libre", () => {
  it("est envoyé une seule fois dans un entretien classique, seul", () => {
    const engine = engineFor("ICN Business School", 30);
    expect(marker(engine, 14)).toBe("");
    expect(answer(engine, LONG, 15)).toEqual([`[RÉGIE — consigne interne, ne jamais la lire ni la mentionner] ${THEME_REMINDER}`]);
    expect(marker(engine, 16)).toBe("");
  });

  it("utilise le rappel spécifique à Montpellier", () => {
    const engine = engineFor("Montpellier BS", 25);
    expect(marker(engine, 17)).toContain(MONTPELLIER_THEME_REMINDER);
    expect(marker(engine, 18)).not.toContain(MONTPELLIER_THEME_REMINDER);
  });

  it("part à la moitié des 35 minutes d'échange libre à l'ESSEC", () => {
    const engine = engineFor("ESSEC", 45);
    expect(marker(engine, 17.4)).not.toContain(THEME_REMINDER);
    expect(marker(engine, 17.6)).toContain(THEME_REMINDER);
  });

  it("part à la moitié du traitement des cartes KEDGE", () => {
    const engine = engineFor("KEDGE", 30);
    jury(engine, "Bienvenue.", 0);
    engine.markPhaseStart("kedge-autoportrait", at(4));
    marker(engine, 7.1);
    jury(engine, PHRASES.kedgeCartes, 7.2);
    expect(marker(engine, 18.5)).not.toContain(THEME_REMINDER);
    expect(marker(engine, 18.7)).toContain(THEME_REMINDER);
  });

  it.each([
    ["TBS Education", 20, 12.6, "tbs-libre", PHRASES.tbs],
    ["ESC Clermont BS", 30, 22.6, "clermont-discussion", PHRASES.clermontDiscussion],
    ["GEM (Grenoble EM)", 30, 22.6, "gem-classique", PHRASES.gemClassique],
    ["emlyon", 28, 24.1, "emlyon-libre", PHRASES.emlyonFin],
  ] as const)("attend la moitié de l'échange libre pour %s", (school, total, minute, phaseId, phrase) => {
    const engine = engineFor(school, total);
    jury(engine, "Ouverture.", 0);
    engine.markPhaseStart(phaseId, at(total === 28 ? 20 : total === 30 ? 15 : 5));
    jury(engine, phrase, total === 28 ? 20.1 : total === 30 ? 15.1 : 5.1);
    expect(marker(engine, minute - 0.2)).not.toContain(THEME_REMINDER);
    const expectedReminder = ["TBS Education", "ESC Clermont BS", "GEM (Grenoble EM)"].includes(school)
      ? THEME_REMINDER_WITHOUT_NEWS
      : THEME_REMINDER;
    expect(marker(engine, minute)).toContain(expectedReminder);
  });

  it("n'est jamais ajouté au repère de clôture", () => {
    const engine = engineFor("ICN Business School", 6);
    expect(marker(engine, 4)).not.toContain(THEME_REMINDER);
    expect(engine.closingSent).toBe(true);
  });
});

describe("GEM", () => {
  const openInversee = (engine: PhaseEngine) => {
    jury(engine, "Nous sommes prêts à vous écouter pour votre exposé : à vous de jouer.", 0);
    marker(engine, 7.1);
    jury(engine, PHRASES.gemInversee, 7.2);
  };

  it("flux normal : minute de restitution à +9, échange classique à +10", () => {
    const engine = engineFor("GEM (Grenoble EM)", 30);
    openInversee(engine);
    expect(marker(engine, 15, QUESTION)).not.toContain("Il vous reste une minute");
    expect(marker(engine, 16.3, QUESTION)).toContain("Il vous reste une minute");
    jury(engine, PHRASES.gemMinute, 16.5);
    expect(marker(engine, 17.6)).toContain("échange plus classique");
  });

  it("flux anticipé : « plus de questions » à 6' déclenche la synthèse", () => {
    const engine = engineFor("GEM (Grenoble EM)", 30);
    openInversee(engine);
    jury(engine, "Avez-vous d'autres questions à me poser ?", 7.8);
    const order = answer(engine, "Non, je n'ai plus de questions.", 8).join(" ");
    expect(order).toContain("C'est le moment de faire votre synthèse.");
    expect(order).not.toContain("Il vous reste une minute");
    jury(engine, PHRASES.gemSynthese, 8.1);
    expect(timingOf(engine, "gem-inversee").anticipee).toBe(true);
    // L'ordre part dès 45 s de synthèse, pour ne jamais redire « reste silencieux »
    // à un candidat qui a fini.
    expect(marker(engine, 8.7)).not.toContain("échange plus classique");
    expect(marker(engine, 8.9)).toContain("échange plus classique");
  });

  it("minute de restitution jamais détectée : classique après inversée + 10", () => {
    const engine = engineFor("GEM (Grenoble EM)", 30);
    openInversee(engine);
    marker(engine, 16.3, QUESTION);
    // Le repère de la minute n'est sauté qu'après une minute de retard : le
    // candidat ne perd pas sa synthèse quand les tours de parole sont longs.
    expect(marker(engine, 17.3, QUESTION)).not.toContain("l'échange classique");
    // Au 2e repère non suivi d'effet, le garde-fou considère la partie commencée.
    const forced = marker(engine, 18.3, QUESTION);
    expect(forced.includes("l'échange classique") || engine.currentPhaseId === "gem-classique").toBe(true);
  });

  it.each([
    "Merci, j'ai fait le tour, ça répond à mes questions.",
    "D'accord, c'est très clair pour moi.",
  ])("D7 — le candidat clôt l'interview inversée (« %s ») : synthèse tout de suite", (text) => {
    const engine = engineFor("GEM (Grenoble EM)", 30);
    openInversee(engine);
    marker(engine, 8, QUESTION);
    jury(engine, "Je dirige une équipe de cinq personnes.", 8.5);
    const order = answer(engine, text, 9).join(" ");
    expect(order).toContain("C'est le moment de faire votre synthèse.");
    expect(types(engine)).toContain("early-ordered-candidate-closed");
  });
});

describe("KEDGE", () => {
  it("autoportrait au message « Carte Autoportrait », cartes à +3, clôture commune à Y−2", () => {
    const engine = engineFor("KEDGE", 30);
    jury(engine, "Bienvenue à cet entretien du Révélateur.", 0);
    jury(engine, PHRASES.kedgeAutoportrait, 1);
    expect(marker(engine, 2)).toContain("Reste sur la présentation Autoportrait");
    expect(marker(engine, 4.2)).toContain("Il nous reste trois cartes");
    jury(engine, PHRASES.kedgeCartes, 4.4);
    // Aucune mesure ni malus sur le traitement des cartes.
    expect(engine.timings.some((t) => t.phaseId === "kedge-cartes")).toBe(false);
    expect(marker(engine, 26)).not.toContain("question de clôture");
    expect(marker(engine, 27.2)).not.toContain("moment de passer à la conclusion");
    expect(marker(engine, 28)).toContain(CLOSING_ORDER);
    const block = measuredPhaseDurationsBlock("KEDGE", engine.timings);
    expect(block).not.toContain("Traitement des cartes");
  });
});

describe("clôture", () => {
  it("envoyée une seule fois à Y−2, plus aucun ordre ensuite", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    const first = answer(engine, LONG, 18);
    expect(first).toHaveLength(1);
    expect(first[0]).toContain(CLOSING_ORDER);
    expect(first[0]).not.toContain("Il reste 2 minutes");
    expect(engine.closingSent).toBe(true);
    const second = answer(engine, LONG, 19);
    expect(second).toHaveLength(1);
    expect(second[0]).not.toContain("Phase en cours");
    expect(types(engine).filter((t) => t === "closing")).toHaveLength(1);
  });
});

describe("EDHEC", () => {
  it("la présentation est mesurée entre markPhaseStart et markPhaseEnd", () => {
    const engine = engineFor("EDHEC", 30);
    jury(engine, "Voici le mot que vous avez tiré au sort. Bon courage.", 0);
    engine.markPhaseStart("edhec-presentation", at(1), "Présentation EDHEC");
    answer(engine, LONG, 4);
    engine.markPhaseEnd("edhec-presentation", at(4.3));
    const block = measuredPhaseDurationsBlock("EDHEC", engine.timings);
    expect(block).toContain("durée mesurée 3 min 00 s");
    expect(block).toContain("phase écourtée");
  });

  it("présentation de 4 minutes : aucun malus", () => {
    const engine = engineFor("EDHEC", 30);
    jury(engine, "Voici le mot que vous avez tiré au sort. Bon courage.", 0);
    engine.markPhaseStart("edhec-presentation", at(1), "Présentation EDHEC");
    answer(engine, LONG, 5);
    engine.markPhaseEnd("edhec-presentation", at(5.2));
    expect(malusLines(measuredPhaseDurationsBlock("EDHEC", engine.timings))).toHaveLength(0);
  });
});

describe("monologue TBS : début au 1er message du jury", () => {
  it("la mesure démarre dès le premier message du jury (moteur créé avant la connexion)", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bienvenue. Vous avez choisi l'article, nous vous écoutons.", 0);
    const timing = timingOf(engine, "tbs-article-monologue");
    expect(new Date(timing.startedAt).getTime()).toBe(T0);
  });
});

describe("monologue : début affiné par la fin de la parole du jury", () => {
  it("onJuryFinishedSpeaking décale le début du monologue", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    engine.onJuryFinishedSpeaking(at(0.5));
    answer(engine, LONG, 5);
    jury(engine, PHRASES.tbs, 5.2);
    const timing = timingOf(engine, "tbs-article-monologue");
    const minutes =
      (new Date(timing.transitionDetectedAt!).getTime() - new Date(timing.startedAt).getTime()) / 60_000;
    expect(minutes).toBeCloseTo(4.5, 5);
  });
});

describe("isDryAnswer", () => {
  const dry = [
    "Je ne sais pas.",
    "Rien à ajouter.",
    "Pas d'avis.",
    "Aucune idée.",
    "Oui.",
    "Je ne vois pas vraiment.",
  ];
  const notDry = [
    LONG,
    "J'ai travaillé deux ans dans une association sportive de mon lycée.",
    "Mon projet professionnel est de rejoindre un cabinet de conseil en stratégie.",
    "Cet article montre surtout les limites du modèle économique actuel des médias.",
    // Marqueur explicite dans une phrase développée (> 12 mots) : vrai argument.
    "Je ne vois pas pourquoi les entreprises refuseraient, car elles y gagnent en productivité et en fidélisation des jeunes recrues.",
  ];
  for (const text of dry) it(`sèche : « ${text} »`, () => expect(isDryAnswer(text)).toBe(true));
  for (const text of notDry) it(`non sèche : « ${text.slice(0, 40)}… »`, () => expect(isDryAnswer(text)).toBe(false));
});

describe("isNothingToAdd", () => {
  const negative = [
    "Non, je pense avoir fait le tour.",
    "Rien d'autre.",
    "Non merci.",
    "C'est tout.",
    "Je n'ai plus de questions.",
    "Non.",
    "Pas vraiment.",
  ];
  const positive = [
    `Oui, j'aimerais ajouter que ${LONG}`,
    "Oui, je voulais parler de mon stage en entreprise familiale.",
    "J'ai encore un point important à préciser sur mon engagement associatif.",
    // « C'est tout à fait ça » ne doit pas être capté par « c'est tout ».
    "C'est tout à fait ça, j'ajouterais que mon stage m'a beaucoup appris sur le terrain.",
    // « Rien d'autre » dans une phrase développée (> 12 mots) : vrai propos.
    "Je ne vois rien d'autre qu'une solution : investir davantage dans la formation des jeunes pour rester compétitif.",
  ];
  for (const text of negative) it(`négative : « ${text} »`, () => expect(isNothingToAdd(text)).toBe(true));
  for (const text of positive)
    it(`positive : « ${text.slice(0, 40)}… »`, () => expect(isNothingToAdd(text)).toBe(false));
});

/**
 * Type du repère (1a) : l'application réduit le repère au temps écoulé quand
 * elle y joint une consigne, sauf si le moteur ordonne une bascule.
 */
describe("type du repère : ongoing vs switch", () => {
  it("annonce « ongoing » avant l'échéance, avec le temps seul exploitable", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    const text = marker(engine, 2);
    expect(engine.lastMarker?.kind).toBe("ongoing");
    expect(engine.lastMarker?.timeOnly).toBe("Temps écoulé : 2 min.");
    expect(text).toContain("INTERDICTION DE CHANGER DE PARTIE");
    expect(text).toContain("Ta prochaine prise de parole doit être une relance sur ce sujet, jamais une transition.");
    expect(text).toContain("Temps écoulé : 2 min.");
    expect(text).not.toContain("min sur");
  });

  it("D1 — n'ajoute plus le compte à rebours hors cartes emlyon", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    const text = marker(engine, 2.2);
    expect(text).toContain("Tu es en « l'article de presse ».");
    expect(text).not.toContain("encore environ");
  });

  it("annonce « switch » quand la bascule est ordonnée", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    marker(engine, 2);
    const text = marker(engine, 6);
    expect(engine.lastMarker?.kind).toBe("switch");
    expect(text).toContain("deuxième partie");
  });

  it("annonce « none » sur le repère de clôture", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    marker(engine, 18);
    expect(engine.lastMarker?.kind).toBe("none");
  });
});

describe("ordre de bascule : formulation libre", () => {
  it("n'exige plus le mot pour mot sur une transition, mais termine par une question", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Nous vous écoutons sur cet article.", 0);
    const text = marker(engine, 5.5);
    expect(text).not.toContain("mot pour mot");
    expect(text).toContain("Tu peux la formuler à ta manière");
    expect(text.trimEnd().endsWith(END_WITH_QUESTION)).toBe(true);
  });
});

describe("détection de la proposition d'axe Clermont", () => {
  it("s'arme quand le jury propose le choix de l'axe", () => {
    const t = normalizeInterviewText("Merci. Passons à la question Impact : choisissez un axe parmi People, Planet, ou Profit.");
    expect(CLERMONT_AXIS_OFFER_RE.test(t)).toBe(true);
  });

  it("ne s'arme pas sur un pitch qui cite un axe", () => {
    const t = normalizeInterviewText("Parlez-nous de vous.");
    expect(CLERMONT_AXIS_OFFER_RE.test(t)).toBe(false);
    const reponse = normalizeInterviewText("Le profit durable est au cœur de mon projet.");
    expect(CLERMONT_AXIS_OFFER_RE.test(reponse)).toBe(false);
  });
});

describe("transitions improvisées après virgule ou deux-points", () => {
  const impactEngine = () => {
    const engine = engineFor("ESC Clermont BS", 30);
    jury(engine, "Bienvenue.", 0);
    engine.markPhaseStart("clermont-impact", at(1));
    return engine;
  };

  it.each([
    "Très bien, passons à la discussion.",
    "Merci, nous passons maintenant à l'entretien classique.",
    "D'accord : changeons de sujet.",
  ])("détecte : %s", (msg) => {
    const engine = impactEngine();
    expect(jury(engine, msg, 3).length).toBeGreaterThan(0);
    expect(types(engine)).toContain("recovered-switch");
  });

  it.each([
    "Parlons de votre exemple, qu'avez-vous fait ?",
    "Dans cette situation, comment réagissez-vous ?",
    "Vous disiez que la discussion avait été tendue : racontez-moi.",
  ])("ignore : %s", (msg) => {
    const engine = impactEngine();
    expect(jury(engine, msg, 3)).toEqual([]);
    expect(types(engine)).not.toContain("recovered-switch");
    expect(types(engine)).not.toContain("improvised-switch");
  });
});

describe("rappel « une question » dans chaque repère", () => {
  it("termine le repère ongoing et le repère de bascule par le rappel, une seule fois", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Nous vous écoutons sur cet article.", 0);
    const ongoing = marker(engine, 2);
    expect(ongoing.trimEnd().endsWith(END_WITH_QUESTION)).toBe(true);
    expect(ongoing.split(END_WITH_QUESTION).length - 1).toBe(1);
    const switchMarker = marker(engine, 5.5);
    expect(switchMarker.trimEnd().endsWith(END_WITH_QUESTION)).toBe(true);
  });

  it("ne termine pas le repère de clôture par le rappel", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Nous vous écoutons sur cet article.", 0);
    const updates = engine.onCandidateAnswer("Voici ma réponse développée sur cet article de presse.", at(18.2));
    expect(updates[updates.length - 1]).not.toContain(END_WITH_QUESTION);
  });
});

describe("transitions reformulées : plus aucun signalement", () => {
  it("KEDGE : une transition reformulée confirme la phase sans événement de paraphrase", () => {
    const engine = engineFor("KEDGE", 30);
    jury(engine, "Bienvenue à cet entretien du Révélateur.", 0);
    jury(engine, PHRASES.kedgeAutoportrait, 1.2);
    marker(engine, 4.4);
    const out = jury(
      engine,
      "Il nous reste trois cartes, laquelle voulez-vous traiter en premier : Trait d'Action, Trait de Pensée ou Trait d'Esprit ?",
      4.6,
    );
    expect(out).toEqual([]);
    expect(types(engine)).toContain("phase-confirmed");
    expect(types(engine)).not.toContain("paraphrased-phrase");
  });
});

describe("détections de transition tolérantes à la reformulation", () => {
  const detectOf = (school: string, stepId: string) =>
    phaseScheduleForSchool(school).find((step) => step.id === stepId)!.detect!;
  const hits = (school: string, stepId: string, phrase: string) =>
    detectOf(school, stepId).test(normalizeInterviewText(phrase));

  const CASES: { school: string; stepId: string; ok: string[]; no: string[] }[] = [
    {
      school: "TBS Education",
      stepId: "tbs-libre",
      ok: [
        PHRASES.tbs,
        "Merci, cette première partie sur l'article est terminée : nous continuons par un échange plus libre.",
      ],
      no: [
        "Quel est le point le plus discutable de cet article, selon vous ?",
        "Pourquoi avoir choisi ce journal plutôt qu'un autre ?",
      ],
    },
    {
      school: "ESC Clermont BS",
      stepId: "clermont-discussion",
      ok: [PHRASES.clermontDiscussion, "Très bien, passons à la discussion.", "Parlons de votre parcours."],
      no: [
        "Racontez-moi votre projet professionnel en quelques mots.",
        "Quel impact concret attendez-vous de cette action ?",
      ],
    },
    {
      school: "INSEEC Grande École",
      stepId: "inseec-classique",
      ok: [
        PHRASES.inseec,
        "Très bien, nous allons maintenant passer à la seconde partie de l'entretien, plus classique.",
      ],
      no: [
        "Qu'est-ce qui vous a attiré vers cette image en particulier ?",
        "Que retenez-vous de cette seconde expérience en entreprise ?",
      ],
    },
    {
      school: "GEM (Grenoble EM)",
      stepId: "gem-inversee",
      ok: [PHRASES.gemInversee, "Merci, c'est à vous de m'interroger maintenant."],
      no: [
        "Quelle question vous a le plus surpris pendant votre exposé ?",
        "Pouvez-vous m'en dire plus sur votre conclusion ?",
      ],
    },
    {
      school: "GEM (Grenoble EM)",
      stepId: "gem-classique",
      ok: [PHRASES.gemClassique, "Merci. Nous passons à un entretien plus classique."],
      no: [
        "Parlons de votre projet professionnel, qu'envisagez-vous ?",
        "Comment avez-vous vécu cet échange avec vos camarades ?",
      ],
    },
    {
      school: "KEDGE",
      stepId: "kedge-cartes",
      ok: [PHRASES.kedgeCartes, "Choisissons une carte : quelle carte voulez-vous traiter en premier ?"],
      no: [
        "Il vous reste trois minutes pour développer, allez-y.",
        "Quelle carte de visite laisseriez-vous à un recruteur ?",
      ],
    },
    {
      school: "emlyon",
      stepId: "emlyon-libre",
      ok: [PHRASES.emlyonFin],
      no: [
        "Parlons de la fin de votre stage, qu'en retenez-vous ?",
        "Quelle carte vous a semblé la plus difficile à traiter ?",
      ],
    },
    {
      school: "ESSEC",
      stepId: "essec-situation-1",
      ok: [PHRASES.essecSituation],
      no: [
        "Dans cette situation, comment réagissez-vous ?",
        "Quelle décision avez-vous prise dans ce cas précis ?",
      ],
    },
  ];

  for (const { school, stepId, ok, no } of CASES) {
    for (const phrase of ok) {
      it(`${stepId} détecte « ${phrase.slice(0, 44)}… »`, () => expect(hits(school, stepId, phrase)).toBe(true));
    }
    for (const phrase of no) {
      it(`${stepId} ignore la relance « ${phrase.slice(0, 44)}… »`, () =>
        expect(hits(school, stepId, phrase)).toBe(false));
    }
  }
});

describe("durée mesurée indépendante du moment où le jury obéit", () => {
  it("clôt la phase précédente à l'instant de l'ORDRE, pas de la détection tardive", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bonjour, quel article avez-vous choisi ?", 0);
    answer(engine, LONG, 2);
    // Ordre de bascule envoyé au repère qui suit la réponse de 5 min.
    const ordered = marker(engine, 5);
    expect(ordered).toContain("Tu peux la formuler à ta manière");
    // Le jury n'obéit qu'à 6 min 30.
    jury(engine, PHRASES.tbs, 6.5);
    expect(types(engine)).toContain("phase-confirmed");
    expect(timingOf(engine, "tbs-article").transitionDetectedAt).toBe(new Date(at(5)).toISOString());
  });

  it("clôt aussi à l'instant de l'ordre quand le garde-fou force la phase", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bonjour, quel article avez-vous choisi ?", 0);
    marker(engine, 5);
    marker(engine, 6);
    marker(engine, 7);
    marker(engine, 8);
    expect(types(engine)).toContain("forced-after-2-markers");
    expect(timingOf(engine, "tbs-article").transitionDetectedAt).toBe(new Date(at(5)).toISOString());
  });
});

describe("détecteur générique de transition (toutes écoles)", () => {
  const impactEngine = () => {
    const engine = engineFor("ESC Clermont BS", 30);
    jury(engine, "Bienvenue.", 0);
    engine.markPhaseStart("clermont-impact", at(1));
    return engine;
  };

  it.each([
    "Nous allons maintenant passer à la seconde partie de l'entretien.",
    "Très bien, passons à la discussion.",
    "Merci, nous passons maintenant à l'entretien classique.",
    "D'accord : changeons de sujet.",
    "Je vous propose de passer aux cartes.",
  ])("détecte : %s", (msg) => {
    expect(TRANSITION_RE.test(normalizeInterviewText(msg))).toBe(true);
    const engine = impactEngine();
    expect(jury(engine, msg, 3).length).toBeGreaterThan(0);
    expect(types(engine)).toContain("recovered-switch");
  });

  it.each([
    "Passons en revue votre parcours : quelle expérience vous a le plus marqué ?",
    "On passe beaucoup de temps à parler d'organisation, mais qu'est-ce qui vous amuse ?",
    "Dans la seconde partie de votre réponse, vous parliez de méthode : développez.",
    "Je vous propose de passer sur un exemple concret, lequel choisissez-vous ?",
    "Vous avez changé de sujet en cours de réponse : revenons à ma question.",
  ])("ignore : %s", (msg) => {
    expect(TRANSITION_RE.test(normalizeInterviewText(msg))).toBe(false);
    const engine = impactEngine();
    expect(jury(engine, msg, 3)).toEqual([]);
    expect(types(engine)).not.toContain("recovered-switch");
    expect(types(engine)).not.toContain("improvised-switch");
  });

  it("reconnaît la transition TBS reformulée « seconde partie »", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Nous vous écoutons sur cet article.", 0);
    marker(engine, 12);
    jury(
      engine,
      "Nous allons maintenant passer à la seconde partie de l'entretien, plus centrée sur votre parcours. Pouvez-vous vous présenter ?",
      12.2,
    );
    expect(timingOf(engine, "tbs-article").transitionDetectedAt).toBeDefined();
  });

  it("ne rattrape pas une sortie anticipée autorisée de mise en situation ESSEC", () => {
    const engine = engineFor("ESSEC BS", 30);
    jury(engine, "Bienvenue.", 0);
    engine.markPhaseStart("essec-situation-1", at(5));
    expect(jury(engine, "Très bien, changeons de sujet : parlez-moi de votre parcours.", 7)).toEqual([]);
    expect(types(engine)).not.toContain("recovered-switch");
  });
});

// ---------------------------------------------------------------------------
// ORAL — repère PRÉ-ENVOYÉ en fin de prise de parole du jury
// ---------------------------------------------------------------------------

describe("repère pré-envoyé (markerAtJuryTurnEnd)", () => {
  const preMarker = (engine: PhaseEngine, minutes: number) => engine.markerAtJuryTurnEnd(at(minutes)).join(" ");

  it("donne exactement le même repère que onCandidateAnswer au même instant", () => {
    for (const s of SCHOOLS) {
      const viaAnswer = engineFor(s.school, s.totalMinutes);
      jury(viaAnswer, "Premier message du jury, bienvenue.", 0);
      s.setup?.(viaAnswer);
      const viaPre = engineFor(s.school, s.totalMinutes);
      jury(viaPre, "Premier message du jury, bienvenue.", 0);
      s.setup?.(viaPre);
      expect(viaPre.markerAtJuryTurnEnd(at(s.dueMinute + 0.5))).toEqual(
        viaAnswer.onCandidateAnswer(LONG, at(s.dueMinute + 0.5)),
      );
      expect(types(viaPre)).toEqual(types(viaAnswer));
    }
  });

  it("répète l'ordre de bascule jusqu'à la détection de la transition", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    expect(preMarker(engine, 5.2)).toContain("deuxième partie");
    engine.onCandidateAnswerAfterPreSentMarker(LONG, at(5.4));
    jury(engine, "Un exemple de conséquence concrète ?", 5.5);
    expect(preMarker(engine, 5.6)).toContain("deuxième partie");
    engine.onCandidateAnswerAfterPreSentMarker(LONG, at(5.8));
    jury(engine, PHRASES.tbs, 5.9);
    expect(preMarker(engine, 6.1)).not.toContain("deuxième partie");
    expect(timingOf(engine, "tbs-article").transitionDetectedAt).toBeTruthy();
  });

  it("force la phase suivante après 2 repères pré-envoyés non suivis", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    preMarker(engine, 5.2);
    preMarker(engine, 5.8);
    preMarker(engine, 6.4);
    expect(types(engine)).toContain("forced-after-2-markers");
  });

  it("à Y−2 la clôture est prioritaire : aucune bascule dans le repère", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    const updates = engine.markerAtJuryTurnEnd(at(18));
    expect(updates.join(" ")).toContain(CLOSING_ORDER);
    expect(updates.join(" ")).not.toContain("deuxième partie");
    expect(types(engine)).toContain("closing");
    expect(engine.closingSent).toBe(true);
  });
});

describe("réponse du candidat à l'oral, après un repère pré-envoyé", () => {
  it("n'envoie rien quand la réponse ne déclenche aucun ordre nouveau", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    engine.markerAtJuryTurnEnd(at(1));
    expect(engine.onCandidateAnswerAfterPreSentMarker(LONG, at(2))).toEqual([]);
  });

  it("envoie l'ordre de bascule anticipée déclenché par une troisième réponse sèche", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    engine.markerAtJuryTurnEnd(at(1));
    expect(engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.2))).toEqual([]);
    jury(engine, "Pouvez-vous préciser ?", 1.3);
    expect(engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.5))).toEqual([]);
    jury(engine, "Un exemple concret ?", 1.6);
    const order = engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.8)).join(" ");
    expect(order).toContain("deuxième partie");
    expect(types(engine)).toContain("early-ordered-dry");
  });

  it("envoie l'ordre déclenché par « rien à ajouter »", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    engine.markerAtJuryTurnEnd(at(2));
    jury(engine, ADD_QUESTION_ASKED, 2.2);
    const order = engine.onCandidateAnswerAfterPreSentMarker("Non, j'ai fait le tour.", at(2.5)).join(" ");
    expect(order).toContain("deuxième partie");
    expect(types(engine)).toContain("early-ordered-nothing-to-add");
  });
});

// ---------------------------------------------------------------------------
// SIMULATION ÉCRIT / ORAL — toutes les écoles avec calendrier de phases
// ---------------------------------------------------------------------------

type SimSchool = {
  school: string;
  totalMinutes: number;
  /** Événements déclenchés par l'application, comme dans _app.partie-8.tsx. */
  appPhaseStarts?: Array<{ afterJuryTurn: number; phaseId: string }>;
  /** Prise de parole imposée du jury à un tour donné (annonce des cartes KEDGE). */
  juryTextAt?: Record<number, string>;
};

const SIM_SCHOOLS: SimSchool[] = [
  { school: "TBS Education", totalMinutes: 20 },
  { school: "ESC Clermont BS", totalMinutes: 30, appPhaseStarts: [{ afterJuryTurn: 2, phaseId: "clermont-impact" }] },
  { school: "INSEEC Grande École", totalMinutes: 30 },
  { school: "GEM (Grenoble EM)", totalMinutes: 30 },
  { school: "KEDGE", totalMinutes: 30, juryTextAt: { 2: PHRASES.kedgeAutoportrait } },
  { school: "emlyon", totalMinutes: 45, appPhaseStarts: [{ afterJuryTurn: 2, phaseId: "emlyon-cartes" }] },
  { school: "ESSEC", totalMinutes: 45 },
];

const ANSWER_SECONDS = [30, 90, 150] as const;
const JURY_SECONDS = 15;

type SimResult = {
  timings: PhaseTiming[];
  events: Array<{ at: number; type: string; phaseId?: string | undefined }>;
  malus: string[];
  closingAt: number | null;
  closingCount: number;
  forcedCount: number;
  /** Fin de la première réponse du candidat située après totalMinutes − 2. */
  closingDeadline: number | null;
};

/**
 * Rejoue un entretien complet sur horloge virtuelle.
 * - `ecrit` : repère envoyé APRÈS la réponse (onCandidateAnswer) ;
 * - `oral`  : repère PRÉ-ENVOYÉ en fin de prise de parole du jury
 *   (markerAtJuryTurnEnd, au plus un par réponse) puis
 *   onCandidateAnswerAfterPreSentMarker après la réponse.
 */
function simulate(
  sim: SimSchool,
  answerSeconds: number,
  mode: "ecrit" | "oral",
  jurySeconds: number = JURY_SECONDS,
): SimResult {
  const engine = engineFor(sim.school, sim.totalMinutes);
  const steps = phaseScheduleForSchool(sim.school);
  const stepById = new Map(steps.map((step) => [step.id, step]));
  let t = T0;
  let pendingPhrase: string | null = null;
  let seen = 0;
  let closingAt: number | null = null;
  let closingDeadline: number | null = null;
  let closingCount = 0;
  let forcedCount = 0;
  let turnsAfterClosing = 0;

  /** Consomme les événements nouveaux : phrase de transition attendue, compteurs. */
  const drain = () => {
    for (const event of engine.events.slice(seen)) {
      if (event.type === "closing") {
        closingCount += 1;
        if (closingAt === null) closingAt = event.at;
      }
      if (event.type === "forced-after-2-markers") forcedCount += 1;
      if (event.type === "switch-ordered" || event.type.startsWith("early-ordered")) {
        const step = event.phaseId ? stepById.get(event.phaseId) : undefined;
        const phrase = step?.phrase ?? step?.earlyPhrase ?? null;
        if (phrase) pendingPhrase = phrase;
      }
    }
    seen = engine.events.length;
  };

  for (let turn = 1; turn <= 400; turn += 1) {
    if (closingAt !== null && turnsAfterClosing >= 1) break;
    if (closingAt !== null) turnsAfterClosing += 1;
    const text: string =
      sim.juryTextAt?.[turn] ?? pendingPhrase ?? `Question numéro ${turn} : pouvez-vous développer ce point ?`;
    if (text === pendingPhrase) pendingPhrase = null;
    engine.onJuryMessage(text, t);
    drain();
    for (const start of sim.appPhaseStarts ?? []) {
      if (start.afterJuryTurn === turn) engine.markPhaseStart(start.phaseId, t);
    }
    drain();
    t += jurySeconds * 1_000;
    engine.onJuryFinishedSpeaking(t);
    if (mode === "oral" && !engine.closingSent) {
      engine.markerAtJuryTurnEnd(t);
      drain();
    }
    t += answerSeconds * 1_000;
    if (closingDeadline === null && Math.floor((t - T0) / 60_000) >= sim.totalMinutes - 2) closingDeadline = t;
    const reply = engine.currentPhaseId === "gem-inversee" ? QUESTION : LONG;
    if (mode === "oral") engine.onCandidateAnswerAfterPreSentMarker(reply, t);
    else engine.onCandidateAnswer(reply, t);
    drain();
    if (t - T0 > (sim.totalMinutes + 6) * 60_000) break;
  }

  return {
    timings: engine.timings,
    events: engine.events.map((e) => ({ at: e.at, type: e.type, phaseId: e.phaseId })),
    malus: malusLines(measuredPhaseDurationsBlock(sim.school, engine.timings)),
    closingAt,
    closingCount,
    forcedCount,
    closingDeadline,
  };
}

/** Échéance théorique d'un step, calculée comme le moteur (dueAtFor). */
function dueAtOf(sim: SimSchool, stepId: string, timings: PhaseTiming[]): number | null {
  const step = phaseScheduleForSchool(sim.school).find((s) => s.id === stepId);
  if (!step) return null;
  if (step.startMinute === undefined && !step.relativeToPhaseId) return null;
  const absolute = step.startMinute === undefined ? T0 : T0 + step.startMinute * 60_000;
  if (!step.relativeToPhaseId) return absolute;
  const startOf = (id: string) => {
    const timing = timings.find((item) => item.phaseId === id && item.kind !== "monologue");
    return timing ? new Date(timing.startedAt).getTime() : undefined;
  };
  let relStart = startOf(step.relativeToPhaseId);
  let after = step.afterMinutes ?? 0;
  if (relStart === undefined && step.fallbackRelativeToPhaseId) {
    relStart = startOf(step.fallbackRelativeToPhaseId);
    after = step.fallbackAfterMinutes ?? 0;
  }
  if (relStart === undefined) return absolute;
  return Math.max(absolute, relStart + after * 60_000);
}

const durationMinutes = (timing: PhaseTiming | undefined) =>
  timing?.transitionDetectedAt
    ? (new Date(timing.transitionDetectedAt).getTime() - new Date(timing.startedAt).getTime()) / 60_000
    : null;

describe("simulation orale (option A) vs simulation écrite, école par école", () => {
  for (const sim of SIM_SCHOOLS) {
    for (const seconds of ANSWER_SECONDS) {
      describe(`${sim.school} — réponses de ${seconds} s`, () => {
        const written = simulate(sim, seconds, "ecrit");
        const oral = simulate(sim, seconds, "oral");

        it("n'ordonne jamais une bascule avant l'échéance de la phase visée", () => {
          for (const result of [written, oral]) {
            for (const event of result.events) {
              if (event.type !== "switch-ordered" || !event.phaseId) continue;
              // GEM : l'échéance de l'échange classique est relative à la minute de
              // synthèse, qui n'est pas une phase mesurée (et porte un butoir à
              // inversée + 10). Elle est vérifiée par les tests GEM dédiés.
              if (event.phaseId === "gem-classique") continue;
              const dueAt = dueAtOf(sim, event.phaseId, result.timings);
              if (dueAt === null) continue;
              expect(event.at).toBeGreaterThanOrEqual(dueAt);
            }
          }
        });

        it("ne marque aucune phase « anticipée » sans bascule anticipée ordonnée", () => {
          for (const result of [written, oral]) {
            const earlyOrdered = result.events.some((e) => e.type.startsWith("early-ordered"));
            if (!earlyOrdered) expect(result.timings.every((timing) => !timing.anticipee)).toBe(true);
          }
        });

        // À l'oral, l'ordre de bascule part en FIN de prise de parole du jury, donc
        // AU PLUS UN échange plus tôt qu'à l'écrit (où il partait après la réponse).
        // La durée mesurée d'une phase s'arrête à l'instant de l'ordre : elle peut
        // donc être plus courte à l'oral, d'au plus un échange (jury + réponse),
        // et jamais en dessous de l'échéance prévue de la phase suivante.
        it("ne raccourcit pas une phase de plus d'un échange à l'oral", () => {
          const tolerance = (JURY_SECONDS + seconds) / 60;
          for (const timing of written.timings.filter((item) => item.kind !== "monologue")) {
            const writtenMinutes = durationMinutes(timing);
            const oralTiming = oral.timings.find(
              (item) => item.phaseId === timing.phaseId && item.kind !== "monologue",
            );
            const oralMinutes = durationMinutes(oralTiming);
            if (writtenMinutes === null || oralMinutes === null) continue;
            expect(oralMinutes).toBeGreaterThanOrEqual(writtenMinutes - tolerance - 1e-9);
          }
        });

        it("n'ajoute aucun malus « phase écourtée » à l'oral", () => {
          for (const line of oral.malus) expect(written.malus).toContain(line);
        });

        it("mesure les monologues à l'identique à l'oral et à l'écrit", () => {
          for (const measure of monologueMeasuresFor(sim.school)) {
            const a = durationMinutes(written.timings.find((item) => item.phaseId === measure.id));
            const b = durationMinutes(oral.timings.find((item) => item.phaseId === measure.id));
            expect(b).toEqual(a);
          }
        });

        it("envoie la clôture une seule fois, au plus tard à la réponse qui suit Y−2", () => {
          for (const result of [written, oral]) {
            expect(result.closingCount).toBe(1);
            expect(result.closingAt).not.toBeNull();
            if (result.closingDeadline !== null) {
              expect(result.closingAt!).toBeLessThanOrEqual(result.closingDeadline);
            }
          }
        });
      });
    }
  }

  it("affiche le tableau des durées mesurées (écrit / oral)", () => {
    const rows: string[] = [];
    for (const sim of SIM_SCHOOLS) {
      for (const seconds of ANSWER_SECONDS) {
        const written = simulate(sim, seconds, "ecrit");
        const oral = simulate(sim, seconds, "oral");
        const ids = new Set(written.timings.map((t) => `${t.phaseId}|${t.kind ?? "phase"}`));
        for (const key of ids) {
          const [phaseId, kind] = key.split("|");
          const find = (r: SimResult) =>
            r.timings.find((t) => t.phaseId === phaseId && (t.kind ?? "phase") === kind);
          const w = durationMinutes(find(written));
          const o = durationMinutes(find(oral));
          rows.push(
            `${sim.school} | ${seconds}s | ${phaseId}${kind === "monologue" ? " (monologue)" : ""} | écrit ${
              w === null ? "—" : w.toFixed(2)
            } min | oral ${o === null ? "—" : o.toFixed(2)} min`,
          );
        }
        const min = (v: number | null) => (v === null ? "—" : ((v - T0) / 60_000).toFixed(2));
        rows.push(
          `${sim.school} | ${seconds}s | CLÔTURE écrit ${min(written.closingAt)} min / oral ${min(
            oral.closingAt,
          )} min | forcées écrit ${written.forcedCount} / oral ${oral.forcedCount} | malus écrit ${
            written.malus.length
          } / oral ${oral.malus.length}`,
        );
      }
    }
    console.log(`\n=== TABLEAU SIMULATION ===\n${rows.join("\n")}\n`);
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe("consigne en file et ordre de bascule (applyQueuedInstructions)", () => {
  it("garde la consigne en file quand le repère porte un ordre de bascule", () => {
    const result = applyQueuedInstructions({
      updates: ["[RÉGIE …] Ordre de bascule"],
      queued: ["Tire les 4 cartes."],
      marker: { kind: "switch", timeOnly: "5 minutes écoulées." },
    });
    expect(result.updates).toEqual(["[RÉGIE …] Ordre de bascule"]);
    expect(result.remaining).toEqual(["Tire les 4 cartes."]);
  });

  it("envoie la consigne avec un repère de temps simple", () => {
    const result = applyQueuedInstructions({
      updates: ["[RÉGIE …] Reste sur la phase en cours"],
      queued: ["Tire les 4 cartes."],
      marker: { kind: "ongoing", timeOnly: "5 minutes écoulées." },
    });
    expect(result.updates[0]).toContain("5 minutes écoulées.");
    expect(result.updates.at(-1)).toContain("Tire les 4 cartes.");
    expect(result.remaining).toEqual([]);
  });
});

describe("clôture due pendant la réponse du candidat (oral)", () => {
  it("part juste après la réponse, une seule fois", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Bienvenue, parlons de votre article.", 0);
    engine.markerAtJuryTurnEnd(at(17.5));
    expect(engine.closingSent).toBe(false);
    const updates = engine.onCandidateAnswerAfterPreSentMarker(LONG, at(18.2)).join(" ");
    expect(updates).toContain(CLOSING_ORDER);
    expect(engine.closingSent).toBe(true);
    expect(engine.onCandidateAnswerAfterPreSentMarker(LONG, at(19)).join(" ")).not.toContain(CLOSING_ORDER);
    expect(types(engine).filter((type) => type === "closing")).toHaveLength(1);
  });
});

describe("bascule anticipée à l'oral et garde-fou des 2 repères", () => {
  it("ne force pas la bascule à l'ordre anticipé, puis force après 2 repères pré-envoyés", () => {
    const engine = engineFor("TBS Education", 20);
    jury(engine, "Vous avez choisi l'article, nous vous écoutons.", 0);
    engine.markerAtJuryTurnEnd(at(1));
    engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.2));
    jury(engine, "Pouvez-vous préciser ?", 1.3);
    engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.5));
    jury(engine, "Un exemple concret ?", 1.6);
    expect(engine.onCandidateAnswerAfterPreSentMarker(DRY, at(1.8)).join(" ")).toContain("deuxième partie");
    expect(types(engine)).not.toContain("forced-after-2-markers");
    jury(engine, "Un dernier point sur l'article ?", 2);
    engine.markerAtJuryTurnEnd(at(2.2));
    expect(types(engine)).not.toContain("forced-after-2-markers");
    jury(engine, "Et sur les conséquences ?", 2.4);
    engine.markerAtJuryTurnEnd(at(2.6));
    expect(types(engine).filter((type) => type === "forced-after-2-markers")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// GEM — PARTIE 2 (interview inversée + minute de synthèse) : 9 + 1 = 10 min
// ---------------------------------------------------------------------------

type GemCombo = {
  inverseeStart: number;
  question: number;
  juryAnswer: number;
  synthese: number;
};

type GemRun = {
  /** Secondes entre le début de l'inversée et l'annonce de la synthèse. */
  announceSeconds: number | null;
  /** Durée mesurée de la partie 2 (inversée + synthèse), en minutes. */
  part2Minutes: number | null;
  /** Le jury a-t-il reçu « reste silencieux » après la fin de la synthèse ? */
  silentAfterSynthese: boolean;
  malus: string[];
};

/**
 * Rejoue la partie 2 GEM avec des tours réalistes : le candidat POSE des
 * questions (10/20/40 s), le jury y répond (20/45/90 s), puis le candidat fait
 * sa synthèse (45/60/75 s). À l'écrit le repère part après le tour du candidat,
 * à l'oral il est pré-envoyé en fin de prise de parole du jury.
 */
function simulateGemPart2(combo: GemCombo, mode: "ecrit" | "oral"): GemRun {
  const engine = engineFor("GEM (Grenoble EM)", 30);
  const steps = phaseScheduleForSchool("GEM (Grenoble EM)");
  const stepById = new Map(steps.map((step) => [step.id, step]));
  let pendingPhrase: string | null = null;
  let seen = 0;
  const drain = () => {
    for (const event of engine.events.slice(seen)) {
      if (event.type === "switch-ordered" || event.type.startsWith("early-ordered")) {
        const step = event.phaseId ? stepById.get(event.phaseId) : undefined;
        const phrase = step?.phrase ?? step?.earlyPhrase ?? null;
        if (phrase) pendingPhrase = phrase;
      }
    }
    seen = engine.events.length;
  };

  // Exposé, puis entrée dans l'inversée à l'instant demandé.
  engine.onJuryMessage("Nous vous écoutons pour votre exposé.", T0);
  const orderAt = Math.max(5, combo.inverseeStart - 0.05);
  if (mode === "oral") engine.markerAtJuryTurnEnd(at(orderAt));
  else engine.onCandidateAnswer(LONG, at(orderAt));
  drain();
  const inverseeAt = at(combo.inverseeStart);
  engine.onJuryMessage(PHRASES.gemInversee, inverseeAt);
  pendingPhrase = null;
  drain();
  let t = inverseeAt;
  let announceAt: number | null = null;
  let silentAfterSynthese = false;

  for (let turn = 1; turn <= 120; turn += 1) {
    // Le jury répond à la question précédente (ou annonce la synthèse).
    if (turn > 1 || pendingPhrase) {
      const text: string = pendingPhrase ?? "Voici ma réponse à votre question, avec quelques précisions utiles.";
      if (text === pendingPhrase) pendingPhrase = null;
      engine.onJuryMessage(text, t);
      drain();
      const isAnnounce = text === PHRASES.gemMinute || text === PHRASES.gemSynthese;
      if (announceAt === null && isAnnounce) announceAt = t;
      // L'annonce de la synthèse est une phrase courte (~5 s), pas une réponse.
      t += (isAnnounce ? 5 : combo.juryAnswer) * 1_000;
      engine.onJuryFinishedSpeaking(t);
      if (mode === "oral" && !engine.closingSent) {
        engine.markerAtJuryTurnEnd(t);
        drain();
      }
    }
    // Tour du candidat : une question, ou la synthèse si elle a été annoncée.
    const isSynthese = announceAt !== null;
    t += (isSynthese ? combo.synthese : combo.question) * 1_000;
    const text = isSynthese
      ? "Pour conclure, je retiens trois choses de cet échange et je vous remercie pour vos réponses."
      : "Quelle place l'école donne-t-elle à ce dispositif dans le cursus ?";
    const updates = (
      mode === "oral"
        ? engine.onCandidateAnswerAfterPreSentMarker(text, t)
        : engine.onCandidateAnswer(text, t)
    ).join(" ");
    drain();
    if (isSynthese && updates.includes("reste silencieux")) silentAfterSynthese = true;
    if (isSynthese && updates.includes("échange plus classique")) {
      // Le jury obéit : la bascule ferme le chronomètre de la partie 2.
      t += combo.juryAnswer * 1_000;
      engine.onJuryMessage(PHRASES.gemClassique, t);
      drain();
      break;
    }
    if (t - T0 > 26 * 60_000) break;
  }

  const timing = engine.timings.find((item) => item.phaseId === "gem-inversee" && item.kind !== "monologue");
  return {
    announceSeconds: announceAt === null ? null : (announceAt - inverseeAt) / 1_000,
    part2Minutes: durationMinutes(timing),
    silentAfterSynthese,
    malus: malusLines(measuredPhaseDurationsBlock("GEM (Grenoble EM)", engine.timings)),
  };
}

const GEM_COMBOS: GemCombo[] = [];
for (const inverseeStart of [7, 7.5, 8.5]) {
  for (const question of [10, 20, 40]) {
    for (const juryAnswer of [20, 45, 90]) {
      for (const synthese of [45, 60, 75]) {
        GEM_COMBOS.push({ inverseeStart, question, juryAnswer, synthese });
      }
    }
  }
}

describe("GEM — partie 2 mesurée (inversée + minute de synthèse)", () => {
  for (const mode of ["ecrit", "oral"] as const) {
    it(`annonce la synthèse à l'heure et mesure la partie 2 (${mode})`, () => {
      for (const combo of GEM_COMBOS) {
        const label = `${mode} start ${combo.inverseeStart} q${combo.question} j${combo.juryAnswer} s${combo.synthese}`;
        const run = simulateGemPart2(combo, mode);
        expect(run.announceSeconds, label).not.toBeNull();
        // L'annonce ne part jamais avant 8:45 : c'est l'échéance de la synthèse.
        expect(run.announceSeconds!, label).toBeGreaterThanOrEqual(8 * 60 + 45);
        // Le jury ne peut annoncer qu'à sa PROCHAINE prise de parole : le retard
        // maximal est donc un échange (sa réponse en cours + la question suivante).
        // Le jury ne peut annoncer qu'à sa PROCHAINE prise de parole : le retard
        // dépend donc de la granularité des tours (sa réponse + la question
        // suivante), au plus deux échanges quand l'échéance tombe en plein tour.
        expect(run.announceSeconds!, label).toBeLessThanOrEqual(
          8 * 60 + 45 + 2 * (combo.juryAnswer + combo.question) + 1,
        );
        // La partie 2 n'est jamais sous le plancher de 8,5 min : aucun malus.
        expect(run.part2Minutes!, label).toBeGreaterThanOrEqual(8.5);
        expect(run.malus, label).toEqual([]);
        // Le jury ne reçoit jamais « reste silencieux » après la fin de la synthèse.
        expect(run.silentAfterSynthese, label).toBe(false);
      }
    });
  }

  it("mesure 10 min ± 15 s dès que l'annonce est à l'heure et la synthèse d'une minute", () => {
    let checked = 0;
    for (const combo of GEM_COMBOS.filter((c) => c.synthese === 60)) {
      const label = `start ${combo.inverseeStart} q${combo.question} j${combo.juryAnswer} s${combo.synthese}`;
      for (const mode of ["ecrit", "oral"] as const) {
        const run = simulateGemPart2(combo, mode);
        // L'annonce ne peut tomber qu'à une prise de parole du jury : quand elle
        // arrive dans la fenêtre visée, la partie 2 vaut 10 min ± 15 s.
        if ((run.announceSeconds ?? 0) > 9 * 60 + 15) continue;
        checked += 1;
        expect(run.part2Minutes!, `${label} ${mode}`).toBeGreaterThanOrEqual(9.75);
        expect(run.part2Minutes!, `${label} ${mode}`).toBeLessThanOrEqual(10.25);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("affiche le tableau des combinaisons GEM", () => {
    const rows: string[] = [];
    const announces: number[] = [];
    const parts: number[] = [];
    for (const combo of GEM_COMBOS) {
      for (const mode of ["ecrit", "oral"] as const) {
        const run = simulateGemPart2(combo, mode);
        if (run.announceSeconds !== null) announces.push(run.announceSeconds);
        if (run.part2Minutes !== null) parts.push(run.part2Minutes);
        const mmss = (s: number | null) =>
          s === null ? "—" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
        rows.push(
          `GEM | début ${combo.inverseeStart} | question ${combo.question}s | jury ${combo.juryAnswer}s | synthèse ${combo.synthese}s | ${mode} | annonce ${mmss(run.announceSeconds)} | partie 2 ${run.part2Minutes?.toFixed(2) ?? "—"} min | malus ${run.malus.length}`,
        );
      }
    }
    const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
    rows.push(
      `MIN/MAX | annonce ${mmss(Math.min(...announces))} → ${mmss(Math.max(...announces))} | partie 2 ${Math.min(...parts).toFixed(2)} → ${Math.max(...parts).toFixed(2)} min`,
    );
    console.log(`\n=== TABLEAU GEM PARTIE 2 ===\n${rows.join("\n")}\n`);
    expect(rows.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// BALAYAGE — 7 écoles, réponses de 20 à 240 s, prises de parole du jury variables
// ---------------------------------------------------------------------------

describe("balayage des durées de réponse (20 → 240 s)", () => {
  const SWEEP_ANSWERS = Array.from({ length: 23 }, (_, i) => 20 + i * 10);
  for (const sim of SIM_SCHOOLS) {
    it(`ne dégrade rien à l'oral — ${sim.school}`, () => {
      for (const jurySeconds of [10, 15, 25]) {
        for (const seconds of SWEEP_ANSWERS) {
          const label = `${sim.school} ${seconds}s jury ${jurySeconds}s`;
          const written = simulate(sim, seconds, "ecrit", jurySeconds);
          const oral = simulate(sim, seconds, "oral", jurySeconds);
          // Aucun malus à l'oral qui n'existe pas à l'écrit.
          for (const line of oral.malus) expect(written.malus, label).toContain(line);
          // Aucune bascule ordonnée avant son échéance.
          for (const result of [written, oral]) {
            for (const event of result.events) {
              if (event.type !== "switch-ordered" || !event.phaseId) continue;
              if (event.phaseId === "gem-classique") continue;
              const dueAt = dueAtOf(sim, event.phaseId, result.timings);
              if (dueAt === null) continue;
              expect(event.at, `${label} ${event.phaseId}`).toBeGreaterThanOrEqual(dueAt);
            }
            // Clôture envoyée une seule fois et à l'heure.
            expect(result.closingCount, label).toBe(1);
            if (result.closingDeadline !== null) {
              expect(result.closingAt!, label).toBeLessThanOrEqual(result.closingDeadline);
            }
          }
          // Monologues identiques à l'oral et à l'écrit.
          for (const measure of monologueMeasuresFor(sim.school)) {
            const a = durationMinutes(written.timings.find((item) => item.phaseId === measure.id));
            const b = durationMinutes(oral.timings.find((item) => item.phaseId === measure.id));
            expect(b, `${label} ${measure.id}`).toEqual(a);
          }
        }
      }
    });
  }
});
