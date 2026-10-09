import { describe, expect, it } from "vitest";
import { JURY_SCHOOL_TEXTS } from "./school-texts";
import {
  buildFirstMessage,
  getSchoolInterviewConfig,
  greeting,
  monologueMeasuresFor,
  openingNote,
  phaseScheduleForSchool,
  promptFor,
  schoolDisplayName,
  secondReplyFor,
  simulatedMinutes,
  type SchoolInterviewConfig,
} from "../school-interviews";
import { PhaseEngine } from "../phase-engine";
import { pickGemPersona } from "../gem-kb";

const SCHOOLS = Object.keys(JURY_SCHOOL_TEXTS);
const OPTS = { firstName: "Robin", articleTitle: "Article test", inseecImage: "Image test", edhecWord: "audace" };

/**
 * Premier message tel que l'application le construisait avant l'étape 3
 * (commit 74b0146), avec le seul changement décidé pour l'INSEEC.
 */
function legacyFirstMessage(config: SchoolInterviewConfig): string {
  const hello = greeting(OPTS.firstName);
  const minutes = simulatedMinutes(config);
  const welcome = `${hello.replace(/\.$/, "")}, et bienvenue à l'entretien ${schoolDisplayName(config.school).preposition}.`;
  switch (config.school) {
    case "ESC Clermont BS":
      return `${welcome} Nous allons commencer par le pitch : vous avez deux minutes pour vous présenter, en mettant en avant ce que vous souhaitez aborder pendant notre échange. Je vous écoute.`;
    case "ESSEC":
      return `${welcome} Cet entretien va durer 45 minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. Nous vous proposerons également de travailler sur une mise en situation en fin d'entretien. Est-ce que c'est clair pour vous ?`;
    case "emlyon":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis vous tirerez quatre cartes contenant des questions auxquelles vous devrez répondre. L'entretien se terminera ensuite par un échange libre. Est-ce que c'est clair pour vous ?`;
    case "Montpellier BS":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours à travers des débuts de phrase que vous choisirez. Est-ce que c'est clair pour vous ?`;
    case "EM Strasbourg":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de commencer par nous parler d'une réussite dont vous êtes fier, puis nous échangerons sur votre parcours, vos motivations et vos projets. Est-ce que c'est clair pour vous ?`;
    case "INSEEC Grande École":
      // Seul changement de l'étape 3 : « pendant environ cinq minutes », sans « suivie d'un court échange ».
      return `${welcome} Il se décompose en deux parties : la première partie vous demande de vous présenter pendant environ cinq minutes à partir de l'image que vous avez choisie. La seconde partie consistera en un entretien plus classique, d'environ vingt minutes.${
        OPTS.inseecImage ? ` Vous avez choisi l'image « ${OPTS.inseecImage} » : nous vous écoutons.` : " Nous vous écoutons."
      }`;
    case "KEDGE":
      return `${hello} Bienvenue à cet entretien du Révélateur, l'épreuve d'admission de KEDGE Business School. Nous allons échanger pendant une trentaine de minutes, autour d'un jeu de cinq cartes qui vont rythmer notre échange. Êtes-vous prêt à commencer ?`;
    case "TBS Education":
      return `${hello} Bienvenue dans cet entretien de Toulouse Business School. L'entretien démarre par une première partie de 5 minutes sur l'analyse d'un article choisi en amont, puis s'achèvera par environ 15 minutes d'échanges.${
        OPTS.articleTitle ? ` Vous avez choisi l'article « ${OPTS.articleTitle} », nous vous écoutons.` : " Nous vous écoutons."
      }`;
    case "EDHEC":
      return `${welcome} Vous allez commencer par vous présenter : une minute de préparation, affichée à l'écran, puis quatre minutes de présentation. Voici le mot que vous avez tiré au sort, à intégrer sans qu'il soit le sujet principal de votre présentation : ${OPTS.edhecWord}. Bon courage.`;
    case "GEM (Grenoble EM)":
      return `${hello} Nous sommes prêts à vous écouter pour votre exposé sur le sujet que vous avez choisi et préparé. Vous disposez d'environ cinq minutes : à vous de jouer.`;
    default:
      break;
  }
  if (config.requiresUpload && config.support) {
    return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. J'ai votre ${config.support.label} sous les yeux. Nous allons commencer : présentez-vous, je vous écoute.`;
  }
  return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. Il n'y a pas de bonne ou de mauvaise réponse, soyez simplement vous-même. Est-ce que c'est clair pour vous ?`;
}

/** Toutes les consignes de régie que le moteur peut envoyer pour cette école. */
function regieInstructions(school: string): string[] {
  const config = getSchoolInterviewConfig(school);
  const schedule = phaseScheduleForSchool(school);
  const total = simulatedMinutes(config);
  const out: string[] = [];
  for (const mode of ["lent", "rapide"] as const) {
    const startedAt = 0;
    const engine = new PhaseEngine({
      school,
      schedule,
      monologues: monologueMeasuresFor(school),
      totalMinutes: total,
      startedAt,
      variables: {
        card_experience: "Quelle est votre expérience la plus originale ?",
        card_personnalite: "Quel est votre principal défaut ?",
        card_projet: "Quel métier visez-vous ?",
        card_creativite: "Inventez un objet utile.",
      },
    });
    const step = mode === "lent" ? 1 : 3;
    for (let minute = 0; minute <= total; minute += step) {
      const at = startedAt + minute * 60_000;
      out.push(...engine.onJuryMessage("Très bien, pouvez-vous préciser ce point ?", at));
      out.push(...engine.onCandidateAnswer("Oui, je peux développer ce point avec un exemple concret.", at + 10_000));
    }
    // Transition annoncée par le jury sans ordre : rattrapage et entrée anticipée.
    const engine2 = new PhaseEngine({
      school,
      schedule,
      monologues: monologueMeasuresFor(school),
      totalMinutes: total,
      startedAt,
      variables: {},
    });
    engine2.onJuryMessage("Présentez-vous.", startedAt);
    out.push(...engine2.onJuryMessage("Nous passons maintenant à la partie suivante, un échange plus libre.", startedAt + 30_000));
  }
  return out.filter(Boolean);
}

const FORBIDDEN: Array<[string, RegExp]> = [
  ["${", /\$\{/],
  ["opts.", /\bopts\./],
  ["config.", /\bconfig\./],
  ["p.<champ>", /\bp\.(prenom|poste|secteur|seniorite|filRouge|ancienGem)\b/],
  ["Réglage du code", /Réglage du code/],
];

describe("rendu réel envoyé au jury", () => {
  it.each(SCHOOLS)("construit le premier message comme avant l'étape 3 pour %s", (school) => {
    const config = getSchoolInterviewConfig(school);
    expect(buildFirstMessage(config, OPTS)).toBe(legacyFirstMessage(config));
  });

  it.each(SCHOOLS)("n'envoie aucune expression de code à %s", (school) => {
    const config = getSchoolInterviewConfig(school);
    const textes = [
      buildFirstMessage(config, OPTS),
      secondReplyFor(config) ?? "",
      openingNote(config),
      ...(["classique", "classique_dur"] as const).map((variant) => promptFor(config, variant) ?? ""),
      ...regieInstructions(school),
    ];
    for (const texte of textes) {
      for (const [label, pattern] of FORBIDDEN) {
        expect(pattern.test(texte), `${label} dans : ${texte.slice(0, 160)}`).toBe(false);
      }
    }
  });

  it("remplit le personnage GEM sans laisser de champ de code", () => {
    const persona = pickGemPersona();
    expect(persona).not.toMatch(/\$\{/);
    const prompt = promptFor(getSchoolInterviewConfig("GEM (Grenoble EM)"), "classique") ?? "";
    expect(prompt).toContain("{{gem_persona}}");
    expect(prompt).not.toContain("Fil rouge si le candidat creuse (ne jamais amener spontanément) :");
  });
});
