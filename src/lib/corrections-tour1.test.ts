// Corrections du tour 1 du banc : un test par correction non couverte ailleurs.
import { describe, expect, it } from "vitest";
import { EDHEC_INDIVIDUEL, END_WITH_QUESTION, EXIT_SENTENCE_RE, PhaseEngine } from "./phase-engine";
import { monologueMeasuresFor, phaseScheduleForSchool } from "./school-interviews";
import { normalizeInterviewText } from "./interview-text";
import { mainRendueBloquee } from "./main-rendue";
import { adaptCommonForSchool, commonJuryText } from "./elevenlabs-agent-prompt";
import { mesuresPour } from "./evaluateur/durees";
import { communPour } from "./evaluateur/textes";
import { controlerClassement, filtrerVerbatims, motsInternes } from "./redacteur/texte";
import { DEFAULT_REDACTEUR_MODEL, sortieSansPenalites } from "./redacteur/run";
import { criteresPourEcole } from "./redacteur/textes";
import { FEEDBACK_ECHEC_MESSAGE, FEEDBACK_TENTATIVES, produireFeedback } from "./feedback-enchainement";

const T0 = 1_700_000_000_000;
const at = (m: number) => T0 + Math.round(m * 60_000);
const LONG =
  "Je pense que cet élément est important parce qu'il montre comment j'ai construit mon raisonnement avec des exemples concrets et une vraie prise de recul sur mon parcours.";
const engineFor = (school: string, total: number) =>
  new PhaseEngine({ school, schedule: phaseScheduleForSchool(school), monologues: monologueMeasuresFor(school), totalMinutes: total, startedAt: T0 });
const marker = (e: PhaseEngine, m: number, t = LONG) => e.onCandidateAnswer(t, at(m)).join(" ");

describe("D5 — texte commun du jury adapté par école", () => {
  it("Montpellier : ni Projet professionnel ni École dans les thèmes", () => {
    const t = adaptCommonForSchool(commonJuryText(), "Montpellier BS");
    expect(t).toContain("jamais abordés à Montpellier");
    expect(t).not.toBe(commonJuryText());
  });
  it("ESSEC : la mise en situation et « Vendez-moi ce stylo » retirées de la banque", () => {
    expect(adaptCommonForSchool(commonJuryText(), "ESSEC")).not.toContain("Vendez-moi ce stylo");
  });
  it("format classique : texte commun inchangé", () => {
    expect(adaptCommonForSchool(commonJuryText(), "NEOMA")).toBe(commonJuryText());
  });
});

describe("D6 — secours « main rendue » bloqué", () => {
  const n = normalizeInterviewText;
  it("sur une invitation, la phrase de sortie, la question de clôture et l'interview inversée GEM", () => {
    expect(mainRendueBloquee({ normalized: n("Racontez-moi votre stage.") })).toBe(true);
    expect(mainRendueBloquee({ normalized: n("L'entretien est désormais terminé.") })).toBe(true);
    expect(mainRendueBloquee({ normalized: n("Merci. Si vous deviez retenir une chose de cet échange, laquelle."), closingQuestion: "Si vous deviez retenir une chose de cet échange, laquelle ?" })).toBe(true);
    expect(mainRendueBloquee({ normalized: n("Bonne remarque."), phaseId: "gem-inversee" })).toBe(true);
  });
  it("mais part sur une simple remarque en échange libre", () => {
    expect(mainRendueBloquee({ normalized: n("Très bien, merci pour cette réponse.") })).toBe(false);
  });
});

describe("D8 — présentation dès l'accueil", () => {
  it("une réponse longue à « Est-ce que c'est clair ? » dispense de la deuxième réplique", () => {
    const e = engineFor("EM Strasbourg", 20);
    e.onJuryMessage("Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", at(0.2));
    marker(e, 2, `${LONG} ${LONG} ${LONG}`);
    expect(e.secondReplyWasSkipped).toBe(true);
  });
});

describe("D9 — pas de reproche de changement de partie en partie libre", () => {
  it("TBS, échange libre : une transition annoncée n'est pas reprise", () => {
    const e = engineFor("TBS Education", 20);
    e.onJuryMessage("Bonjour, parlons de votre article.", at(0.2));
    e.onJuryMessage("Merci. Cette première partie sur l'article est terminée : nous passons maintenant à la deuxième partie, un échange plus libre. Je vous invite à vous présenter.", at(5));
    const r = e.onJuryMessage("Merci. Nous passons maintenant à l'entretien classique.", at(9)).join(" ");
    expect(r).not.toContain("Tu viens d'annoncer un changement de partie");
  });
});

describe("D10 — emlyon : pas de « termine par une question » avant le tirage", () => {
  it("le repère de la présentation ne contient pas la consigne", () => {
    const e = engineFor("emlyon", 30);
    e.onJuryMessage("Bonjour. Présentez-vous en une minute.", at(0.2));
    expect(marker(e, 1)).not.toContain(END_WITH_QUESTION);
  });
});

describe("D11 — durées selon le champ « mesure » du barème", () => {
  it("EDHEC : parole du candidat seul ; Clermont : toute la partie", () => {
    expect(mesuresPour("edhec", "presentation_mot", "temps de parole du candidat seul")[0]).toBe("edhec-presentation");
    expect(mesuresPour("clermont", "question_impact", "toute la partie")[0]).toBe("clermont-impact");
    expect(mesuresPour("inseec", "image", "toute la partie, relances du jury comprises")[0]).toBe("inseec-image");
  });
});

describe("D13 — mots internes repérés dans le feedback", () => {
  it("repère zone, niveau, grille et « ce qui vous coûte des points »", () => {
    const m = motsInternes("En zone rouge, niveau N2 de la grille, ce qui vous coûte des points.");
    expect(m.length).toBeGreaterThanOrEqual(3);
    expect(motsInternes("Votre récit est clair et précis.")).toEqual([]);
  });
});

describe("D14 — qui parle", () => {
  it("une citation « Vous : » prononcée par le jury est retirée", () => {
    const parRole = { candidat: "j'ai organisé un tournoi de basket pour mon lycée", jury: "pourquoi avez-vous choisi notre école cette année" };
    const r = filtrerVerbatims(
      "VERBATIMS: [école] Vous : « pourquoi avez-vous choisi notre école cette année » // [club] Vous : « j'ai organisé un tournoi de basket pour mon lycée »",
      `${parRole.candidat}\n${parRole.jury}`,
      "",
      parRole,
    );
    expect(r.retirees).toHaveLength(1);
    expect(r.text).toContain("tournoi de basket");
  });
});

describe("D15 — phrase du classement conforme à la tranche", () => {
  it("P30 annoncé « en danger » est refusé, « dans la moyenne » accepté", () => {
    const base = "## Ce que ce classement signifie\n";
    expect(controlerClassement(`${base}Votre candidature est en danger.`, 30, false).length).toBeGreaterThan(0);
    expect(controlerClassement(`${base}Vous êtes dans la moyenne, l'oral ne départage pas.`, 30, false)).toEqual([]);
  });
});

describe("D16 — modèles et chaîne en échec", () => {
  it("le rédacteur tourne sur Claude Sonnet 5", () => expect(DEFAULT_REDACTEUR_MODEL).toBe("anthropic/claude-sonnet-5"));
  it("échec provoqué, relance automatique, puis écran « Réessayer »", async () => {
    let appels = 0;
    const r = await produireFeedback({
      evaluer: async () => {
        appels += 1;
        throw new Error("échec provoqué");
      },
      rediger: async () => ({ debrief: "", percentile: null }),
    });
    expect(appels).toBe(FEEDBACK_TENTATIVES);
    expect(FEEDBACK_TENTATIVES).toBe(2);
    expect(r.ok).toBe(false);
    expect(FEEDBACK_ECHEC_MESSAGE).toContain("Réessayez");
  });
});

describe("D19 — critères du rédacteur dans l'ordre du bloc de l'école", () => {
  it("ordre commun respecté, Montpellier n'a ni École ni Projet (critères propres dans le bloc de l'école)", () => {
    const titres = (s: string) => s.match(/^## .*/gm) ?? [];
    expect(titres(criteresPourEcole("GEM (Grenoble EM)"))[0]).toBe("## Présentation");
    expect(titres(criteresPourEcole("GEM (Grenoble EM)")).at(-1)).toBe("## Clarté");
    const mbs = criteresPourEcole("Montpellier BS");
    expect(mbs).not.toMatch(/^## École$/m);
    expect(mbs).not.toMatch(/^## Projet professionnel$/m);
  });
});

describe("D20 — texte de l'évaluateur sans critère absent, école par école", () => {
  it("TBS et Clermont sans Ouverture, Montpellier sans Projet ni École, classique complet", () => {
    for (const g of ["tbs", "clermont"]) expect(communPour(g).length).toBeLessThan(communPour("classique").length);
    expect(communPour("montpellier").length).toBeLessThan(communPour("classique").length);
    expect(communPour("emlyon")).toBe(communPour("classique"));
  });
});

describe("D22 — emlyon : « Il reste à couvrir » joint au repère suivant", () => {
  it("ne part pas seul après la transition du jury", () => {
    const e = engineFor("emlyon", 30);
    e.onJuryMessage("Bonjour. Présentez-vous en une minute.", at(0.2));
    const seul = e
      .onJuryMessage("Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre.", at(15))
      .join(" ");
    expect(seul).not.toContain("Il reste à couvrir");
  });
});

describe("D23 — le rédacteur ne reçoit jamais les pénalités de l'évaluateur", () => {
  it("retire le champ penalites de la sortie transmise", () => {
    expect(sortieSansPenalites({ grille: "classique", penalites: [{ partie: "x" }], remarques: "" })).toEqual({ grille: "classique", remarques: "" });
  });
});

describe("D24 — EDHEC : passage à l'entretien individuel", () => {
  it("la consigne se termine par « Ne reprends jamais le mot tiré. »", () => {
    expect(EDHEC_INDIVIDUEL.endsWith("Ne reprends jamais le mot tiré.")).toBe(true);
  });
});

describe("D26 — phrase de sortie", () => {
  it("reconnaît « bonne continuation » et « l'entretien est désormais terminé »", () => {
    expect(EXIT_SENTENCE_RE.test(normalizeInterviewText("Merci, bonne continuation dans vos oraux."))).toBe(true);
    expect(EXIT_SENTENCE_RE.test(normalizeInterviewText("Merci, l'entretien est désormais terminé."))).toBe(true);
  });
});
