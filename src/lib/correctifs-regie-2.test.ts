// Correctifs de la régie, 2e passage : failles trouvées à la relecture et au rejeu des entretiens du tour 1.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CLOSING_QUESTIONS, EXIT_SENTENCE_RE, PhaseEngine, closingInstruction } from "./phase-engine";
import { CONFIGURED_SCHOOLS, monologueMeasuresFor, phaseScheduleForSchool } from "./school-interviews";
import { normalizeInterviewText } from "./interview-text";
import { buildJuryAgentPrompt, commonJuryText } from "./elevenlabs-agent-prompt";

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
const types = (e: PhaseEngine) => e.events.map((x) => x.type);

describe("ESSEC : entre l'échéance de 35 min et l'ordre, une formule générique ne lance pas le cas", () => {
  it("« Parlons maintenant de votre projet » à 35 min 03, avant l'ordre : pas de faux cas, l'ordre part ensuite", () => {
    const e = engineFor("ESSEC", 45);
    jury(e, "Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", 0.1);
    jury(e, "Présentez-vous, vous avez cinq minutes.", 0.5);
    answer(e, 34.9);
    expect(jury(e, "Très bien. Parlons maintenant de votre projet professionnel.", 35.05)).toEqual([]);
    expect(e.currentPhaseId).toBe("essec-libre-1");
    expect(types(e)).not.toContain("improvised-switch");
    expect(answer(e, 35.6)).toContain("mise en situation");
    expect(types(e)).toContain("switch-ordered");
  });
});

describe("TBS : l'article n'est quitté que sur une vraie demande de présentation ou un vrai changement de partie", () => {
  const debut = () => {
    const e = engineFor("TBS Education", 20);
    jury(e, "Bonjour, parlons de votre article.", 0.2);
    return e;
  };
  for (const phrase of [
    "Merci. Passons à la question des enjeux de cet article.",
    "Passons maintenant à votre avis sur le sujet.",
    "Parlons maintenant de l'auteur de l'article.",
    "Pouvez-vous présenter le journal ?",
    "Pouvez-vous me présenter les enjeux ?",
    "Qu'est-ce qui vous a poussé à vous présenter à ce concours ?",
    "Changeons de sujet : que pensez-vous du titre ?",
  ]) {
    it(`« ${phrase} » à 2 min : reste dans l'article`, () => {
      const e = debut();
      jury(e, phrase, 2);
      expect(e.currentPhaseId).toBe("tbs-article");
    });
  }
  for (const phrase of [
    "Merci pour cette présentation. Je passe à la seconde partie de l'entretien, consacrée à votre parcours.",
    "Je vous laisse vous présenter.",
    "Pouvez-vous maintenant vous présenter ?",
    "Je vous propose de vous présenter.",
    "Présentez-vous.",
  ]) {
    it(`« ${phrase} » à 4 min 30 : bascule vers l'échange libre`, () => {
      const e = debut();
      jury(e, phrase, 4.5);
      expect(e.currentPhaseId).toBe("tbs-libre");
    });
  }
});

describe("emlyon : une formule d'enchaînement entre deux cartes ne quitte pas les cartes", () => {
  for (const phrase of ["Passons à la carte suivante.", "Passons maintenant à la carte Créativité.", "Passons à votre carte Projet."]) {
    it(`« ${phrase} »`, () => {
      const e = engineFor("emlyon", 30);
      jury(e, "Bonjour.", 0.1);
      e.markPhaseStart("emlyon-cartes", at(3), "Épreuve des 4 cartes");
      jury(e, phrase, 5);
      expect(e.currentPhaseId).toBe("emlyon-cartes");
    });
  }
});

describe("INSEEC : « Changeons de sujet » pendant l'image garde le rattrapage d'avant", () => {
  it("à 3 min, une consigne de rattrapage part", () => {
    const e = engineFor("INSEEC Grande École", 25);
    jury(e, "Bonjour, présentez-vous à partir de votre image.", 0.1);
    const out = jury(e, "Merci. Changeons de sujet : quels sont vos loisirs ?", 3);
    expect(out.join(" ")).toContain("Tu viens d'annoncer un changement de partie");
  });
});

describe("GEM : formules de fin de l'interview inversée", () => {
  const inversee = () => {
    const e = engineFor("GEM (Grenoble EM)", 32);
    jury(e, "Bonjour.", 0.1);
    jury(e, "Merci pour cet exposé. Nous passons maintenant à l'interview inversée : c'est à vous de m'interroger.", 7);
    return e;
  };
  const cas: [string, boolean][] = [
    ["Avec tout ça, j'aurais encore plus de questions à vous poser sur votre parcours, comment avez-vous choisi ce métier", false],
    ["Je n'ai pas d'autres questions sur ce point, mais comment recrutez-vous vos équipes", false],
    ["Enchanté, merci de me recevoir", false],
    ["Je n'ai plus de questions, merci.", true],
    ["C'est bon pour moi, merci beaucoup.", true],
    ["Bon, j'ai plus de questions, merci.", true],
  ];
  for (const [phrase, fin] of cas) {
    it(`« ${phrase} » → synthèse : ${fin}`, () => {
      const e = inversee();
      answer(e, 8, phrase);
      expect(types(e).includes("early-ordered-candidate-closed")).toBe(fin);
    });
  }
});

describe("D5 : le passage retiré du texte commun est absent (GEM, TBS, Clermont)", () => {
  const c = commonJuryText();
  const i = c.indexOf("\n5. Ouverture sur le monde : ");
  const debutTheme5 = c.slice(i + 1, c.indexOf("\n", i + 1));
  for (const school of ["GEM (Grenoble EM)", "TBS Education", "ESC Clermont BS"]) {
    it(school, () => {
      const p = buildJuryAgentPrompt("classique", 30, undefined, school);
      expect(debutTheme5.length).toBeGreaterThan(40);
      expect(p).not.toContain(debutTheme5);
      expect(p).toContain("5. Ouverture sur le monde : déjà couverte par");
    });
  }
});

describe("D26 : la phrase de sortie ferme l'entretien dans les 23 écoles", () => {
  const sortie = normalizeInterviewText("Merci à vous, l'entretien est désormais terminé.");
  it("reconnue par la règle commune", () => expect(EXIT_SENTENCE_RE.test(sortie)).toBe(true));
  it("l'application et le banc ferment l'entretien sur cette règle, sans condition d'école", () => {
    const app = readFileSync("src/routes/_app.partie-8.tsx", "utf8");
    const banc = readFileSync("scripts/jury-bench-run.ts", "utf8");
    expect(app).toMatch(/EXIT_SENTENCE_RE\.test\(/);
    expect(banc).toMatch(/EXIT_SENTENCE_RE\.test\(/);
  });
  for (const school of CONFIGURED_SCHOOLS) {
    it(`${school} : question tirée posée, puis consigne de sortie après la réponse`, () => {
      const e = engineFor(school, 30);
      jury(e, "Bonjour.", 0.1);
      answer(e, 28.5);
      jury(e, `Merci. ${CLOSING_QUESTIONS.A}`, 28.7);
      expect(answer(e, 29)).toContain("phrase de sortie");
    });
  }
});

describe("Clôture : seule la question tirée compte comme posée", () => {
  it("ESSEC à 43 min 30, question improvisée → consigne de clôture avec la question tirée", () => {
    const e = engineFor("ESSEC", 45, CLOSING_QUESTIONS.C);
    jury(e, "Bonjour, voici le déroulé. Est-ce que c'est clair pour vous ?", 0.1);
    jury(e, "Présentez-vous, vous avez cinq minutes.", 0.5);
    answer(e, 35.2);
    jury(e, "Je vous propose maintenant une petite mise en situation.", 35.5);
    expect(jury(e, "Merci. La mise en situation est terminée. Qu'avez-vous retenu de votre stage ?", 43.5)).toEqual([
      closingInstruction(CLOSING_QUESTIONS.C),
    ]);
  });
});

describe("Compte à rebours : gardé pour les cartes emlyon et la question Impact de Clermont seulement", () => {
  it("Clermont, question Impact : « encore environ » (la conduite s'y appuie pour le contre-pied)", () => {
    const e = engineFor("ESC Clermont BS", 25);
    jury(e, "Bonjour.", 0.1);
    e.markPhaseStart("clermont-impact", at(3), "Question Impact");
    expect(answer(e, 5)).toContain("encore environ");
  });
  it("TBS, article : pas de compte à rebours", () => {
    const e = engineFor("TBS Education", 20);
    jury(e, "Bonjour, parlons de votre article.", 0.2);
    expect(answer(e, 2)).not.toContain("encore environ");
  });
});
