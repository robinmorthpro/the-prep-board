import { describe, expect, it } from "vitest";
import { buildJuryAgentPrompt, difficultyBlock } from "./elevenlabs-agent-prompt";
import { INTERVIEW_VARIANTS } from "./interview-kb";
import { getSchoolInterviewConfig, promptFor } from "./school-interviews";

describe("prompt du jury vocal", () => {
  it("conserve les invariants de parole sans réintroduire la limite de 25 mots", () => {
    const prompt = buildJuryAgentPrompt("classique", 25);

    expect(prompt).not.toContain("25 mots");
    expect(prompt).toContain("Une seule question par prise de parole");
    expect(prompt).toContain("Tu ne commentes JAMAIS la qualité");
    expect(prompt).toContain("Ton temps de parole : 15 à 25 %");
    expect(prompt).toContain("EXEMPLES DE TON");
    expect(prompt).toContain("L'apport à l'école se vérifie à partir de ses engagements");
    expect(prompt).toContain("Vérifier les cinq thèmes n'est pas une course.");
    expect(prompt).toContain("Tu ne poses la question de clôture et tu ne dis la phrase de sortie QUE lorsque l'application te le demande.");
  });

  it.each(INTERVIEW_VARIANTS.map((variant) => variant.code))(
    "porte la règle de reprise désignative et supprime les accusés de réception évaluatifs (%s)",
    (code) => {
      const prompt = buildJuryAgentPrompt(code, 25);

      expect(prompt).toContain("Vous avez parlé de");
      expect(prompt).toContain("au plus une fois dans l'entretien");
      expect(prompt).toContain("mots d'évaluation");
      expect(prompt).not.toContain("« merci », « d'accord », « très clair », « entendu »");

      expect(prompt).not.toContain("« très clair »)");
    },
  );

  it.each(INTERVIEW_VARIANTS)("injecte uniquement le niveau officiel correspondant à $code", (variant) => {
    const block = difficultyBlock(variant.code);
    expect(block).toContain(`NIVEAU JOUÉ : ${variant.code === "classique_dur" ? "Jury dur" : "Jury neutre"}`);
    expect(block).not.toContain(variant.code === "classique_dur" ? "NIVEAU JOUÉ : Jury neutre" : "NIVEAU JOUÉ : Jury dur");
  });

  it.each(["ESSEC", "GEM (Grenoble EM)", "emlyon", "KEDGE", "Montpellier BS"])(
    "porte la nouvelle trame et la conduite de %s sans ancien bloc",
    (school) => {
      const config = getSchoolInterviewConfig(school);
      const prompt = promptFor(config, "classique") ?? "";
      for (const title of ["LES CINQ THÈMES À COUVRIR", "APRÈS CHAQUE RÉPONSE", "PARTIES IMPOSÉES PAR L'ÉCOLE", "CREUSER UNE RÉPONSE"]) {
        expect(prompt).toContain(title);
        expect(prompt.split(title)).toHaveLength(2);
      }
      for (const removed of ["COUVERTURE MINIMALE", "trois oreilles", "25 mots", "MARGE DE TEMPS", "RÈGLE DE LA MAIN RENDUE"]) {
        expect(prompt).not.toContain(removed);
      }
    },
  );

  it("conserve les règles communes citées par les conduites", () => {
    const prompt = buildJuryAgentPrompt("classique", 30, getSchoolInterviewConfig("GEM (Grenoble EM)").conductNote);
    expect(prompt).toContain("APRÈS CHAQUE RÉPONSE");
    expect(prompt).toContain("TU NE COUPES JAMAIS LE CANDIDAT");
  });

  it("porte la conduite ESSEC à 35 minutes et interdit l'au revoir prématuré", () => {
    const prompt = promptFor(getSchoolInterviewConfig("ESSEC"), "classique") ?? "";
    expect(prompt).toContain("à la 35e minute");
    expect(prompt).toContain("8 minutes au maximum");
    expect(prompt).toContain("Tu ne dis jamais au revoir avant la mise en situation : l'entretien n'est pas fini.");
    expect(prompt).not.toContain("à la 32e minute");
  });
});
