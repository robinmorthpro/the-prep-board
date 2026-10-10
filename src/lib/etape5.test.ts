import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mesurerPenalites } from "./evaluateur/durees";
import { userMessageFor } from "./evaluateur/run";
import { userMessageRedacteur } from "./redacteur/run";
import { blocTirages, blocCartesEvaluateur } from "./tirages";
import {
  EMLYON_CREATIVITE,
  EMLYON_EXPERIENCE,
  EMLYON_ETIQUETTES_EXCEPTIONS,
  EMLYON_JURY,
  EMLYON_MODULE,
  EMLYON_PERSONNALITE,
  EMLYON_PROJET,
  drawEmlyonCards,
  emlyonCritere,
} from "./emlyon-kb";
import { EDHEC_WORDS, EDHEC_WORDS_JURY, EDHEC_WORDS_MODULE, pickEdhecWord } from "./edhec-kb";
import { CLERMONT_IMPACT_JURY, CLERMONT_IMPACT_MODULE } from "./esc-clermont-kb";
import { buildClermontImpactVariables } from "./school-interviews";
import { buildJuryAgentPrompt } from "./elevenlabs-agent-prompt";
import { PhaseEngine, END_WITH_QUESTION } from "./phase-engine";
import { monologueMeasuresFor, phaseScheduleFor, getSchoolInterviewConfig } from "./school-interviews";
import { KEY_QUESTIONS } from "./vivaldi-data";

const sha = (p: string) => createHash("sha256").update(readFileSync(new URL(p, import.meta.url))).digest("hex");

describe("A. textes de l'évaluateur", () => {
  it("empreintes exactes", () => {
    expect(sha("./evaluateur/textes/commun.md")).toBe("7d6a18be6ec3b63096efdfe7c27fb336e4122981d3d78ff6818304ff1f2e7ecd");
    expect(sha("./evaluateur/textes/ecoles/essec.md")).toBe("c23947bcaf1db1c117850784d3d2f63a0b9d2bcc65868ae253250ba52a089b7c");
    expect(sha("./evaluateur/textes/ecoles/emlyon.md")).toBe("f68a16e9a34127a7d10053be56d11fd528bc0efd1b1afc8ff5101fb823f0bf42");
  });
});

describe("B. pitch EM Strasbourg", () => {
  const t = (s: number) => [{ phaseId: "em-strasbourg-pitch", startedAt: new Date(0).toISOString(), transitionDetectedAt: new Date(s * 1000).toISOString() }];
  it("2 min 10 : pénalité", () => expect(mesurerPenalites("em_strasbourg", t(130)).penalites).toHaveLength(1));
  it("2 min 40 : aucune", () => expect(mesurerPenalites("em_strasbourg", t(160)).penalites).toHaveLength(0));
  it("non mesuré : aucune", () => expect(mesurerPenalites("em_strasbourg", []).penalites).toHaveLength(0));
});

const tirages = {
  emlyon_cartes: [{ pile: "Créativité", question: "Pouvez-vous nous parler de Google ?", critere: "Ouverture sur le monde" }],
  kedge_cartes: [{ nom: "Trait d'Union", texte: "ODD 13" }],
  edhec_mot: "audace",
  montpellier_situations: ["Vous avez pris un risque"],
  essec_situation: { enonce: "Énoncé", competence: "Créativité" },
  clermont_impact: { axe: "Planet", question: "Q ?" },
  tbs_article: "Article test",
  gem_personnage: "Tu t'appelles Léa.\nPoste : DRH.",
};

describe("D/G. tirages transmis", () => {
  it("bloc du rédacteur pour chaque tirage", () => {
    const b = blocTirages(tirages);
    for (const l of [
      "- Carte Créativité : « Pouvez-vous nous parler de Google ? » (critère : Ouverture sur le monde)",
      "- Carte Trait d'Union : « ODD 13 »",
      "- Mot imposé : « audace »",
      "- Situation choisie : « Vous avez pris un risque »",
      "- Mise en situation : « Énoncé » — compétence visée : Créativité",
      "- Question Impact (axe Planet) : « Q ? »",
      "- Article : « Article test »",
      "- Personnage de l'interview inversée : Tu t'appelles Léa. Poste : DRH.",
    ])
      expect(b).toContain(l);
  });
  it("aucun bloc sans tirage", () => {
    expect(blocTirages({})).toBe("");
    expect(blocTirages(null)).toBe("");
  });
  it("les cartes et leur critère arrivent à l'évaluateur et au rédacteur", () => {
    const session = { id: "s", user_id: "u", school: "emlyon", status: "done", turns: [], phase_timings: [], support_text: "", inseec_image: "", tirages };
    expect(userMessageFor(session as never)).toContain(blocCartesEvaluateur(tirages));
    const r = userMessageRedacteur(
      { ...session, difficulty: "classique", support_label: "" } as never,
      { id: "e", grille: "emlyon", status: "ok", raw_output: {}, case_points: {}, unrated_criteria: [], penalties: {}, interrupted: false, percentile: 50 },
      "",
    );
    expect(r).toContain("(critère : Ouverture sur le monde)");
  });
});

describe("G. étiquettes emlyon", () => {
  it("les 25 exceptions existent mot pour mot dans les banques", () => {
    const all = [...EMLYON_CREATIVITE, ...EMLYON_PROJET];
    const keys = Object.keys(EMLYON_ETIQUETTES_EXCEPTIONS);
    expect(keys).toHaveLength(25);
    for (const k of keys) expect(all).toContain(k);
  });
  it("exceptions et critère par défaut", () => {
    expect(emlyonCritere("Créativité", "Pouvez-vous nous parler de Google ?")).toBe("Ouverture sur le monde");
    expect(emlyonCritere("Créativité", "Citez une personne innovante qui vous inspire.")).toBe("Expériences et personnalité");
    expect(emlyonCritere("Créativité", "Que vous évoque le terme « early makers » ?")).toBe("École");
    expect(emlyonCritere("Créativité", EMLYON_CREATIVITE.find((q) => !(q in EMLYON_ETIQUETTES_EXCEPTIONS))!)).toBe(
      "Gestion des situations déstabilisantes (l'imprévu)",
    );
    expect(emlyonCritere("Expérience", EMLYON_EXPERIENCE[0]!)).toBe("Expériences et personnalité");
    expect(emlyonCritere("Personnalité", EMLYON_PERSONNALITE[0]!)).toBe("Expériences et personnalité");
    expect(emlyonCritere("Projet", "Pourquoi une business school ?")).toBe("École");
    expect(emlyonCritere("Projet", "Dans quel pays ne souhaiteriez-vous pas partir en échange universitaire ?")).toBe("Projet professionnel");
  });
});

describe("F. piles séparées", () => {
  it("emlyon : module et jury disjoints, jury tire dans sa liste", () => {
    for (const pile of ["Expérience", "Personnalité", "Projet", "Créativité"] as const) {
      expect(EMLYON_MODULE[pile].some((q) => EMLYON_JURY[pile].includes(q))).toBe(false);
    }
    expect([EMLYON_MODULE.Expérience.length, EMLYON_JURY.Expérience.length]).toEqual([23, 23]);
    expect([EMLYON_MODULE.Personnalité.length, EMLYON_JURY.Personnalité.length]).toEqual([33, 32]);
    expect([EMLYON_MODULE.Projet.length, EMLYON_JURY.Projet.length]).toEqual([21, 20]);
    expect([EMLYON_MODULE.Créativité.length, EMLYON_JURY.Créativité.length]).toEqual([32, 32]);
    const d = drawEmlyonCards();
    expect(EMLYON_JURY.Projet).toContain(d.projet);
    expect(EMLYON_JURY.Créativité).toContain(d.creativite);
  });
  it("EDHEC : 38 mots au module, 37 au jury, disjoints", () => {
    expect(EDHEC_WORDS.length).toBe(75);
    expect([EDHEC_WORDS_MODULE.length, EDHEC_WORDS_JURY.length]).toEqual([38, 37]);
    expect(EDHEC_WORDS_MODULE.some((w) => EDHEC_WORDS_JURY.includes(w))).toBe(false);
    expect(EDHEC_WORDS_JURY).toContain(pickEdhecWord());
  });
  it("Clermont : le module publie 1 à 12, le jury tire dans 13 à 24", () => {
    const published = new Set(KEY_QUESTIONS.filter((q) => q.theme === "Clermont SB").map((q) => q.question));
    expect(published.size).toBe(36);
    for (const axis of ["people", "planet", "profit"] as const) {
      expect(CLERMONT_IMPACT_MODULE[axis].every((q) => published.has(q))).toBe(true);
      expect(CLERMONT_IMPACT_JURY[axis]).toHaveLength(12);
      expect(CLERMONT_IMPACT_JURY[axis].some((q) => published.has(q))).toBe(false);
    }
    for (const r of [0, 0.5, 0.999]) {
      const v = buildClermontImpactVariables("ESC Clermont BS", () => r);
      expect(CLERMONT_IMPACT_JURY.planet).toContain(v.clermont_q_planet);
    }
  });
  it("textes retirés du module", () => {
    const txt = JSON.stringify(KEY_QUESTIONS);
    expect(txt).not.toContain("tenez votre position en l'ajustant intelligemment");
    expect(txt).not.toContain("Tenez environ 2 minutes");
    expect(txt).not.toContain("dès les premières secondes");
    expect(txt).toContain("Développez chaque carte, environ 3 à 4 minutes, sans monologue exhaustif.");
  });
});

describe("E. jury et régie", () => {
  it("CONNAISSANCE DU CANDIDAT : version du texte commun, envoyée une seule fois", () => {
    const prompt = buildJuryAgentPrompt("classique", 30);
    expect(prompt.split("CONNAISSANCE DU CANDIDAT").length - 1).toBe(1);
    expect(prompt).toContain("ni écrit dans le document qu'il a remis. Tu construis  tes questions");
  });

  const engine = (school: string) =>
    new PhaseEngine({
      school,
      schedule: phaseScheduleFor(getSchoolInterviewConfig(school)) ?? [],
      monologues: monologueMeasuresFor(school),
      totalMinutes: 30,
      startedAt: 0,
    });

  it("pas de suffixe-question avant la deuxième réplique, puis retour", () => {
    const e = engine("EM Strasbourg");
    e.onJuryMessage("Bonjour… Est-ce que c'est clair pour vous ?", 1000);
    expect(e.onCandidateAnswer("Oui", 2000).join(" ")).not.toContain(END_WITH_QUESTION);
    e.onJuryMessage("Racontez-moi une réussite personnelle.", 3000);
    // Pitch d'EM Strasbourg en cours : toujours aucun suffixe.
    expect(e.onCandidateAnswer("Mon pitch…", 60_000).join(" ")).not.toContain(END_WITH_QUESTION);
    e.onJuryMessage("Merci. Parlons de votre parcours.", 200_000);
    expect(e.onCandidateAnswer("Je suis en prépa.", 220_000).join(" ")).toContain(END_WITH_QUESTION);
  });

  it("Montpellier : pas de suffixe au repère qui suit la phrase de passage", () => {
    const e = engine("Montpellier BS");
    e.onJuryMessage("Bonjour.", 1000);
    e.onJuryMessage("Merci. Passons maintenant aux situations : à vous de choisir celle qui vous inspire.", 60_000);
    expect(e.onCandidateAnswer("Je prends le risque.", 70_000).join(" ")).not.toContain(END_WITH_QUESTION);
    e.onJuryMessage("Racontez.", 80_000);
    expect(e.onCandidateAnswer("Alors…", 90_000).join(" ")).toContain(END_WITH_QUESTION);
  });

  it("Clermont : pas de suffixe pendant le pitch", () => {
    const e = engine("ESC Clermont BS");
    e.onJuryMessage("Bonjour.", 1000);
    expect(e.onCandidateAnswer("Mon pitch…", 30_000).join(" ")).not.toContain(END_WITH_QUESTION);
  });

  it("KEDGE : plus de « (C1) » dans le nom de la mesure", () => {
    const steps = phaseScheduleFor(getSchoolInterviewConfig("KEDGE")) ?? [];
    expect(JSON.stringify(steps)).not.toContain("(C1)");
  });

  it("GEM : questions courtes pendant l'interview inversée, pas de bascule à sec", () => {
    const e = engine("GEM (Grenoble EM)");
    e.markPhaseStart("gem-inversee", 7 * 60_000, "Interview inversée");
    for (let i = 0; i < 4; i++) e.onCandidateAnswer("Et vous ?", 8 * 60_000 + i * 1000);
    expect(e.events.some((ev) => ev.type === "early-ordered-dry")).toBe(false);
  });

  it("ESSEC : sortie anticipée avec question de clôture, pas de seconde consigne", () => {
    const e = engine("ESSEC");
    e.onJuryMessage("Bonjour.", 1000);
    e.markPhaseStart("essec-situation-1", 35 * 60_000, "Mise en situation");
    const out = e.onJuryMessage("Merci. La mise en situation est terminée. Qu'aimeriez-vous ajouter pour conclure ?", 38 * 60_000);
    expect(out).toEqual([]);
    expect(e.closingSent).toBe(true);
  });

  it("emlyon : la mesure des cartes part de la première prise de parole du candidat", () => {
    const e = engine("emlyon");
    e.markPhaseStart("emlyon-cartes", 120_000, "Épreuve des 4 cartes");
    e.markMeasureStart("emlyon-cartes", 150_000);
    const t = e.timings.find((x) => x.phaseId === "emlyon-cartes")!;
    expect(t.startedAt).toBe(new Date(150_000).toISOString());
  });
});
