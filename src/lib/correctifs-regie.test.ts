// Correctifs de la régie après vérification du tour 1 (R1 à R15) et tests manquants.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CLOSING_QUESTIONS,
  EDHEC_INDIVIDUEL,
  EXIT_PHRASE_INSTRUCTION,
  EXIT_SENTENCE_RE,
  PhaseEngine,
  REGIE_PREFIX,
  THEME_REMINDER,
  closingInstruction,
  essecSortieCloture,
} from "./phase-engine";
import { getSchoolInterviewConfig, monologueMeasuresFor, phaseScheduleForSchool } from "./school-interviews";
import { normalizeInterviewText } from "./interview-text";
import { adaptCommonForSchool, buildJuryAgentPrompt, commonJuryText } from "./elevenlabs-agent-prompt";
import { mesuresPour } from "./evaluateur/durees";
import { communPour } from "./evaluateur/textes";
import { avertissementsAvecAlertes, blocCalcule } from "./redacteur/run";
import { JURY_SCHOOL_TEXTS } from "./jury/school-texts";
import {
  PROFIL_PAR_ECOLE,
  RECOPIES,
  essaiRenotation,
  feedbackSurListe,
  redacteurPourPlan,
  regleOuvertureCandidat,
  tirerClotureBanc,
} from "../../scripts/bench-lib";

const T0 = 1_700_000_000_000;
const at = (m: number) => T0 + Math.round(m * 60_000);
const LONG =
  "Je pense que cet élément est important parce qu'il montre comment j'ai construit mon raisonnement avec des exemples concrets et une vraie prise de recul sur mon parcours.";
const QUESTION = "Comment se passe une journée type dans votre métier ?";
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
const marker = (e: PhaseEngine, m: number, t = LONG) => e.onCandidateAnswer(t, at(m)).join(" ");
const types = (e: PhaseEngine) => e.events.map((x) => x.type);
const exitCount = (e: PhaseEngine) => types(e).filter((t) => t === "exit-phrase").length;

const TBS_ARTICLE = (e: PhaseEngine) => jury(e, "Bonjour, parlons de votre article.", 0.2);
const ESSEC_OUVERTURE = (e: PhaseEngine) => {
  jury(e, "Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", 0.1);
  jury(e, "Présentez-vous, vous avez cinq minutes.", 0.5);
};
const ESSEC_CAS = (e: PhaseEngine) => {
  ESSEC_OUVERTURE(e);
  marker(e, 35.2);
  jury(e, "Je vous propose maintenant une petite mise en situation.", 35.5);
};

describe("R1 — ESSEC : pas de bascule improvisée depuis l'échange libre", () => {
  it("« Parlons maintenant de votre projet » et « Changeons de sujet » à la 12e minute ne lancent pas le cas", () => {
    const e = engineFor("ESSEC", 45);
    ESSEC_OUVERTURE(e);
    expect(jury(e, "Parlons maintenant de votre projet professionnel.", 12)).toEqual([]);
    expect(jury(e, "Changeons de sujet : que pensez-vous de la RSE ?", 13)).toEqual([]);
    expect(e.currentPhaseId).toBe("essec-libre-1");
    expect(types(e)).not.toContain("improvised-switch");
    expect(marker(e, 35.2)).toContain("mise en situation");
    expect(types(e)).toContain("switch-ordered");
  });
  it("cas inverse : TBS, « l'article est terminé. Présentez-vous. » à 4 min 30 fait basculer", () => {
    const e = engineFor("TBS Education", 20);
    TBS_ARTICLE(e);
    jury(e, "Merci, l'article est terminé. Présentez-vous.", 4.5);
    expect(e.currentPhaseId).toBe("tbs-libre");
  });
});

describe("R1 bis — « Changeons de sujet » n'est jamais un changement de partie", () => {
  it("TBS, article à 2 min : pas de bascule", () => {
    const e = engineFor("TBS Education", 20);
    TBS_ARTICLE(e);
    jury(e, "Changeons de sujet : que pensez-vous du titre ?", 2);
    expect(e.currentPhaseId).toBe("tbs-article");
  });
  it("TBS, article à 4 min : « Nous passons à la seconde partie. » fait basculer", () => {
    const e = engineFor("TBS Education", 20);
    TBS_ARTICLE(e);
    jury(e, "Nous passons à la seconde partie.", 4);
    expect(e.currentPhaseId).toBe("tbs-libre");
  });
  it("ESSEC, dans le cas à 40 min : « Changeons de sujet. » sort du cas (D27)", () => {
    const e = engineFor("ESSEC", 45);
    ESSEC_CAS(e);
    expect(jury(e, "Changeons de sujet.", 40)).toEqual([]);
    expect(e.currentPhaseId).toBe("essec-sortie");
  });
});

describe("R2 / D21 — TBS : bascule seulement quand le jury demande de SE présenter", () => {
  const cas: [string, string][] = [
    ["Pouvez-vous présenter le journal ?", "tbs-article"],
    ["Pouvez-vous me présenter les enjeux ?", "tbs-article"],
    ["Je vous propose de vous présenter.", "tbs-libre"],
    ["Présentez-vous.", "tbs-libre"],
  ];
  it.each(cas)("« %s » → %s", (phrase, phase) => {
    const e = engineFor("TBS Education", 20);
    TBS_ARTICLE(e);
    jury(e, phrase, 2);
    expect(e.currentPhaseId).toBe(phase);
  });
});

describe("R3 — consigne de sortie seulement après la question de clôture", () => {
  it("oral : seuil franchi en fin de parole du jury", () => {
    const e = engineFor("NEOMA", 30);
    jury(e, "Bonjour, présentez-vous.", 0.1);
    jury(e, "Parlez-moi de votre stage.", 27.5);
    expect(e.markerAtJuryTurnEnd(at(28)).join(" ")).toContain(closingInstruction(CLOSING_QUESTIONS.A));
    expect(e.onCandidateAnswerAfterPreSentMarker(LONG, at(28.5))).toEqual([]);
    jury(e, CLOSING_QUESTIONS.A, 28.6);
    expect(e.onCandidateAnswerAfterPreSentMarker(LONG, at(29)).join(" ")).toContain(EXIT_PHRASE_INSTRUCTION);
    jury(e, "Merci.", 29.2);
    expect(e.onCandidateAnswerAfterPreSentMarker(LONG, at(29.4))).toEqual([]);
    expect(exitCount(e)).toBe(1);
  });
  it("écrit : même règle", () => {
    const e = engineFor("NEOMA", 30);
    jury(e, "Bonjour, présentez-vous.", 0.1);
    expect(marker(e, 28)).toContain(closingInstruction(CLOSING_QUESTIONS.A));
    expect(marker(e, 28.3)).toBe("");
    jury(e, CLOSING_QUESTIONS.A, 28.5);
    expect(marker(e, 29)).toContain(EXIT_PHRASE_INSTRUCTION);
    jury(e, "Merci.", 29.2);
    expect(marker(e, 29.4)).toBe("");
    expect(exitCount(e)).toBe(1);
  });
  it("ESSEC : la question tirée déjà posée dans le message qui clôt compte comme posée", () => {
    const e = engineFor("ESSEC", 45, CLOSING_QUESTIONS.B);
    ESSEC_CAS(e);
    expect(jury(e, "Merci. La mise en situation est terminée. Vous avez le mot de la fin : un seul mot.", 43.5)).toEqual([]);
    expect(e.closingSent).toBe(true);
    expect(marker(e, 44)).toContain(EXIT_PHRASE_INSTRUCTION);
  });
});

describe("R4 — GEM : seule une formule de fin clôt l'interview inversée", () => {
  const ouvrir = (e: PhaseEngine) => {
    jury(e, "Nous sommes prêts à vous écouter pour votre exposé : à vous de jouer.", 0);
    marker(e, 7.1);
    jury(e, "Merci pour cet exposé. Nous passons maintenant à l'interview inversée : c'est à vous de m'interroger.", 7.2);
  };
  const cas: [string, boolean][] = [
    ["Enchanté, merci de me recevoir", false],
    ["et quelle est votre stratégie pour l'année prochaine", false],
    ["Je n'ai plus de questions, merci.", true],
    ["Je pense avoir fait le tour.", true],
  ];
  it.each(cas)("« %s » → synthèse : %s", (texte, synthese) => {
    const e = engineFor("GEM (Grenoble EM)", 30);
    ouvrir(e);
    marker(e, 7.5, texte);
    expect(types(e).includes("early-ordered-candidate-closed")).toBe(synthese);
  });
});

describe("R5 — ESSEC : conduite alignée sur D27", () => {
  it("texte de conduite : question sur un point pas encore traité, clôture à la consigne", () => {
    const c = JURY_SCHOOL_TEXTS["ESSEC"]!.conduct;
    expect(c).toContain("puis, dans la même prise de parole, une question sur un point pas encore traité. Tu poses la question de clôture seulement à la consigne de l'application.");
    expect(c).toContain("tu remercies le candidat, tu mets un terme au cas, puis tu suis sa consigne.");
    expect(c).not.toContain("tu n'attends pas la consigne de l'application");
  });
  it("à 41 min, fin du cas avec une question : retour à l'échange libre, clôture à 43 min avec la question tirée", () => {
    const e = engineFor("ESSEC", 45, CLOSING_QUESTIONS.C);
    ESSEC_CAS(e);
    expect(jury(e, "Merci. La mise en situation est terminée. Qu'avez-vous retenu de votre stage ?", 41)).toEqual([]);
    expect(e.closingSent).toBe(false);
    expect(marker(e, 43)).toContain(CLOSING_QUESTIONS.C);
  });
  it("même phrase à 43 min 30 : clôture sans seconde consigne", () => {
    const e = engineFor("ESSEC", 45);
    ESSEC_CAS(e);
    expect(jury(e, "Merci. La mise en situation est terminée. Qu'avez-vous retenu de votre stage ?", 43.5)).toEqual([]);
    expect(e.closingSent).toBe(true);
  });
});

describe("R6 — ESSEC : consigne de sortie avec la variante B, seule", () => {
  it("texte exact à 43 min 30", () => {
    const e = engineFor("ESSEC", 45, CLOSING_QUESTIONS.B);
    ESSEC_CAS(e);
    expect(e.onCandidateAnswer(LONG, at(43.5))).toEqual([
      `${REGIE_PREFIX} Remercie le candidat et mets un terme au cas. La mise en situation est terminée. Pose maintenant, mot pour mot, la question de clôture : « Vous avez le mot de la fin : un seul mot. ». Tu diras la phrase de sortie après la réponse du candidat.`,
    ]);
    expect(essecSortieCloture(CLOSING_QUESTIONS.B)).not.toContain("Termine ta prochaine");
  });
});

describe("R7 — ESSEC : moitié de l'échange libre depuis la fin de la présentation", () => {
  it("présentation finie à 5 min : message après la 20e minute, pas avant", () => {
    const e = engineFor("ESSEC", 45);
    ESSEC_OUVERTURE(e);
    marker(e, 5);
    jury(e, "Merci. Parlez-moi de votre stage.", 5.1);
    expect(marker(e, 19)).not.toContain(THEME_REMINDER);
    jury(e, "Et ensuite ?", 19.5);
    expect(marker(e, 20.5)).toContain(THEME_REMINDER);
  });
});

describe("R8 / D24 — EDHEC", () => {
  it("consigne exacte", () => expect(EDHEC_INDIVIDUEL).toBe("Ne reprends jamais le mot tiré."));
});

describe("R9 — présentation dès l'accueil : la mesure part de la fin de parole du jury", () => {
  it("oral : 3 min, pas 3 min 20", () => {
    const e = engineFor("EM Strasbourg", 20);
    e.onJuryMessage("Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", T0);
    e.onJuryFinishedSpeaking(T0 + 20_000);
    e.onCandidateAnswerAfterPreSentMarker(`${LONG} ${LONG} ${LONG}`, T0 + 200_000);
    e.onJuryMessage("Merci pour ce pitch.", T0 + 210_000);
    const t = e.timings.find((x) => x.phaseId === "em-strasbourg-pitch")!;
    expect((Date.parse(t.transitionDetectedAt!) - Date.parse(t.startedAt)) / 1000).toBe(180);
  });
});

describe("R10 / R11 / R12 / D17 / D18 — banc", () => {
  const banc = readFileSync(new URL("../../scripts/jury-bench-run.ts", import.meta.url), "utf8");
  it("R10 : l'armement des cartes emlyon est une recopie protégée par empreinte", () => {
    expect(RECOPIES.some((r) => r.nom === "emlyon : armement des cartes")).toBe(true);
    expect(banc).toContain("alreadyPresented");
  });
  it("R11 : la clôture vient d'un générateur séparé, déterministe", () => {
    expect(tirerClotureBanc(7)).toBe(tirerClotureBanc(7));
    expect(banc).not.toContain("pickClosingVariant(rnd)");
    expect(banc).toContain("tirerClotureBanc(plan.graine)");
  });
  it("R12 : rédacteur par défaut selon le plan, liste --feedback-sur", () => {
    expect(redacteurPourPlan("renoter", undefined)).toBeNull();
    expect(redacteurPourPlan("eclair", undefined)).toBe("anthropic/claude-sonnet-5");
    expect(redacteurPourPlan("principal", undefined)).toBe("anthropic/claude-sonnet-5");
    expect(redacteurPourPlan("eclair", "aucun")).toBeNull();
    expect(redacteurPourPlan("renoter", "google/gemini-3.7-flash")).toBe("google/gemini-3.7-flash");
    expect(feedbackSurListe("a,b")).toEqual(new Set(["a", "b"]));
    expect(feedbackSurListe(undefined)).toBeNull();
  });
  it("D17 : le candidat attend l'invitation, sauf scénario « commence dès l'accueil » ; à TBS il présente l'article", () => {
    expect(regleOuvertureCandidat({ id: "normal", consigne: "" }, null)).toContain("Tu attends que le jury t'invite à te présenter");
    expect(regleOuvertureCandidat({ id: "x", consigne: "", commenceDesAccueil: true }, null)).not.toContain("Tu attends");
    expect(regleOuvertureCandidat({ id: "normal", consigne: "" }, "Le climat")).toContain("« Le climat »");
  });
  it("D18 : l'essai 1 n'est jamais écrasé par une renotation", () => {
    expect(essaiRenotation(undefined)).toBe(2);
    expect(() => essaiRenotation("1")).toThrow();
  });
});

describe("R13 — alerte des mots internes enregistrée", () => {
  it("ajoutée aux avertissements existants", () => {
    expect(avertissementsAvecAlertes(["x"], ["grille"])).toEqual(["x", { source: "redacteur", mots_internes: ["grille"] }]);
    expect(avertissementsAvecAlertes(["x"], [])).toEqual(["x"]);
  });
});

describe("R14 — mesure absente : aucune pénalité, pas de repli", () => {
  it("EDHEC « toute la partie » n'existe pas ; INSEEC « candidat seul » ne lit que la parole", () => {
    expect(mesuresPour("edhec", "presentation_mot", "toute la partie")).toEqual([]);
    expect(mesuresPour("inseec", "image", "temps de parole du candidat seul")).toEqual(["inseec-image-monologue"]);
  });
});

describe("D5 / D25 — texte commun du jury adapté", () => {
  const commun = commonJuryText();
  it.each(["GEM (Grenoble EM)", "TBS Education", "ESC Clermont BS"])("%s : thème 5 remplacé", (school) => {
    const t = adaptCommonForSchool(commun, school);
    expect(t).toContain("5. Ouverture sur le monde : déjà couverte par");
    expect(t).not.toContain("Les questions citées sont des exemples");
  });
  it("emlyon (D25) : jamais la prépa ni le lycée", () => {
    const t = adaptCommonForSchool(commun, "emlyon");
    expect(t).toContain("études (à l'emlyon : jamais la prépa ni le lycée), travail,");
    expect(t).not.toContain("registres variés : études, travail,");
    expect(buildJuryAgentPrompt.length).toBeGreaterThanOrEqual(0);
  });
});

describe("D12 — entretien interrompu", () => {
  it("le rédacteur reçoit « aucune » pénalité", () => {
    const b = blocCalcule({
      id: "e",
      grille: "classique",
      status: "ok",
      raw_output: {},
      case_points: {},
      unrated_criteria: [],
      penalties: { appliquees: [{ partie: "presentation", type: "trop_court", duree_mesuree_s: 30, seuil_s: 60 }] },
      interrupted: true,
      percentile: null,
    });
    expect(b).toContain("Pénalités de durée retenues :\n- aucune");
  });
});

describe("D20 — titres de section de l'évaluateur, école par école", () => {
  const titres = (g: string) => communPour(g).match(/^#+ .*/gm) ?? [];
  const a = (g: string, motif: RegExp) => titres(g).some((t) => motif.test(t));
  it("TBS et Clermont sans Ouverture ; Montpellier sans Projet ni École ; classique complet", () => {
    for (const g of ["tbs", "clermont"]) expect(a(g, /Ouverture sur le monde/)).toBe(false);
    expect(a("montpellier", /Projet professionnel/)).toBe(false);
    expect(a("montpellier", /^### 5\.4 École/)).toBe(false);
    for (const m of [/Ouverture sur le monde/, /Projet professionnel/, /^### 5\.4 École/]) expect(a("classique", m)).toBe(true);
  });
});

describe("D22 — emlyon : « Il reste à couvrir » part avec la réponse suivante", () => {
  it("jointe au repère qui suit la réponse", () => {
    const e = engineFor("emlyon", 30);
    jury(e, "Bonjour. Présentez-vous en une minute.", 0.2);
    marker(e, 1.5);
    e.markPhaseStart("emlyon-cartes", at(2));
    const seul = jury(e, "Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre.", 10).join(" ");
    expect(seul).not.toContain("Il reste à couvrir");
    expect(marker(e, 11)).toContain("Il reste à couvrir");
  });
});

describe("D26 — « Merci à vous, l'entretien est désormais terminé. » ferme l'entretien", () => {
  it.each(Object.keys(PROFIL_PAR_ECOLE))("%s", (school) => {
    expect(getSchoolInterviewConfig(school).school).toBe(school);
    expect(EXIT_SENTENCE_RE.test(normalizeInterviewText("Merci à vous, l'entretien est désormais terminé."))).toBe(true);
  });
  it("ESSEC : la phrase ferme aussi le cas en cours", () => {
    const e = engineFor("ESSEC", 45);
    ESSEC_CAS(e);
    jury(e, "Merci à vous, l'entretien est désormais terminé.", 44);
    expect(e.closingSent).toBe(true);
  });
});

void QUESTION;
