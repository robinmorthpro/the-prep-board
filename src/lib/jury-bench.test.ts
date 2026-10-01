import { describe, expect, it } from "vitest";
import { benchDurationMinutes, measureJuryBench, type BenchTurn } from "./jury-bench";

/** Petit utilitaire : un tour horodaté à la minute donnée. */
function turn(question: string, answer: string, minute: number): BenchTurn {
  const at = (m: number) => new Date(Date.UTC(2026, 0, 1, 10, m, 0)).toISOString();
  return { question, answer, askedAt: at(minute), answeredAt: at(minute + 1) };
}

describe("banc de mesure du jury", () => {
  it("mesure la durée réelle du fil", () => {
    expect(benchDurationMinutes([turn("A ?", "oui", 0), turn("B ?", "oui", 9)])).toBe(10);
    expect(benchDurationMinutes([])).toBe(0);
  });

  it("entretien vide : toutes les métriques sont neutres", () => {
    const metrics = measureJuryBench([]);
    expect(metrics.juryTurns).toBe(0);
    expect(metrics.questionsPerMinute).toBe(0);
    expect(metrics.endsWithQuestionRatio).toBe(0);
    expect(metrics.juryWordShare).toBe(0);
    expect(metrics.qualityCommentTurns).toEqual([]);
    expect(metrics.coveredThemes.projetPro).toBe(false);
  });

  it("compte les questions par minute", () => {
    const metrics = measureJuryBench([
      turn("Quel est votre projet professionnel ?", "Le conseil.", 0),
      turn("Et pourquoi ce secteur ?", "Parce que.", 2),
      turn("C'est noté.", "D'accord.", 4),
    ]);
    // Deux questions sur 5 minutes de fil (0 → 5 min).
    expect(metrics.juryTurns).toBe(3);
    expect(metrics.questionsPerMinute).toBeCloseTo(2 / 5, 5);
  });

  it("une phrase imposée sans question n'est pas un défaut", () => {
    const metrics = measureJuryBench([
      turn("Vous avez choisi l'article « Le climat en 2030 », nous vous écoutons.", "Alors, voici.", 0),
      turn("Quel journal lisez-vous ?", "Le Monde.", 2),
    ]);
    // Le dénominateur exclut la phrase imposée : 1 question sur 1 tour compté.
    expect(metrics.endsWithQuestionRatio).toBe(1);
  });

  it("repère une fin sans question qui n'est pas une phrase imposée", () => {
    const metrics = measureJuryBench([
      turn("C'est noté, merci.", "…", 0),
      turn("Quel journal lisez-vous ?", "Le Monde.", 2),
    ]);
    expect(metrics.endsWithQuestionRatio).toBe(0.5);
  });

  it("les accusés de réception autorisés ne sont pas des fautes", () => {
    const metrics = measureJuryBench([
      turn("Parfait, commençons. Voici vos cinq cartes.", "D'accord.", 0),
      turn("D'accord. Que faisiez-vous exactement ?", "Je tenais la caisse.", 2),
      turn("Merci. Et ensuite ?", "Ensuite…", 4),
      turn("Très bien. Quel était votre rôle ?", "Capitaine.", 6),
    ]);
    expect(metrics.qualityCommentTurns).toEqual([]);
  });

  it("repère les jugements de clarté et de qualité de la réponse", () => {
    const metrics = measureJuryBench([
      turn("C'est très clair. Et ensuite ?", "…", 0),
      turn("C'est clair. Pourquoi ce choix ?", "…", 2),
      turn("C'est beaucoup plus clair. Quel était le budget ?", "…", 4),
      turn("Très précis. Et après ?", "…", 6),
      turn("Réponse honnête. Que retenez-vous ?", "…", 8),
      turn("Voilà une réponse très complète. Et ensuite ?", "…", 10),
      turn("Très bien. Quel était votre rôle ?", "Capitaine.", 12),
    ]);
    expect(metrics.qualityCommentTurns.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("mesure la part des formules d'accueil en tête de prise de parole", () => {
    const metrics = measureJuryBench([
      // Compte : formule d'accueil en tête.
      turn("C'est noté sur ce plan B. Et ensuite ?", "…", 0),
      turn("Merci pour votre réponse. Pourquoi ce choix ?", "…", 2),
      // Ne compte pas : transition légitime, puis reprise désignative.
      turn("Merci pour cette présentation. Vous avez parlé de la trésorerie, comment l'avez-vous tenue ?", "…", 4),
      turn("Merci pour cet échange. Avez-vous une question ?", "…", 6),
      // Ne compte pas : « c'est noté » n'est pas en tête.
      turn("Quel était votre rôle ? C'est noté.", "…", 8),
    ]);
    expect(metrics.formulaOpenerShare).toBeCloseTo(2 / 5, 5);
  });

  it("mesure la part des reprises désignatives", () => {
    const metrics = measureJuryBench([
      turn("Vous avez parlé de la danse, qu'en retirez-vous ?", "…", 0),
      turn("Vous disiez tout à l'heure que le conseil vous attirait, pourquoi ?", "…", 2),
      turn("Je voudrais revenir sur votre stage, quel était votre rôle ?", "…", 4),
      turn("Quel journal lisez-vous ?", "Le Monde.", 6),
    ]);
    expect(metrics.pointingRepriseShare).toBeCloseTo(3 / 4, 5);
  });

  it("repère les vrais jugements de qualité, où qu'ils soient dans le tour", () => {
    const metrics = measureJuryBench([
      turn("Vous avez bien montré l'enjeu. Pouvez-vous préciser ?", "Oui.", 0),
      turn("C'est très construit. Et ensuite ?", "Ensuite…", 2),
      turn("Bien sûr. Vous maîtrisez votre sujet, d'ailleurs pourquoi ce choix ?", "Par goût.", 4),
      turn("Quel est votre rôle ?", "Capitaine.", 6),
    ]);
    expect(metrics.qualityCommentTurns).toEqual([
      { index: 0, excerpt: "vous avez bien montre" },
      { index: 1, excerpt: "c'est tres construit" },
      { index: 2, excerpt: "vous maitrisez" },
    ]);
  });

  it("repère les questions à tiroir", () => {
    const metrics = measureJuryBench([
      turn("Quel était votre rôle ? Et qu'en retenez-vous ?", "Beaucoup.", 0),
      turn("Pourquoi ce choix ?", "Par goût.", 2),
    ]);
    expect(metrics.doubleQuestionTurns).toEqual([0]);
  });

  it("repère les prises de parole trop longues", () => {
    const long = `${Array.from({ length: 65 }, () => "mot").join(" ")} ?`;
    const metrics = measureJuryBench([turn(long, "oui", 0), turn("Et alors ?", "rien", 2)]);
    expect(metrics.longTurns).toEqual([0]);
  });

  it("compte les amorces répétées", () => {
    const metrics = measureJuryBench([
      turn("Très bien, je vous écoute sur ce point ?", "oui", 0),
      turn("Très bien, je note ce que vous dites ?", "oui", 2),
      turn("Très bien, je comprends votre position ?", "oui", 4),
      turn("Quel est votre rôle ?", "chef", 6),
    ]);
    expect(metrics.openerRepeats).toEqual([{ opener: "tres bien, je", count: 3, share: 0.75 }]);
  });

  it("repère deux questions quasi identiques", () => {
    const metrics = measureJuryBench([
      turn("Quelles difficultés avez-vous rencontrées pendant votre stage bancaire ?", "plusieurs", 0),
      turn("Parlez-moi de votre sport favori ?", "le rugby", 2),
      turn("Quelles difficultés rencontrees pendant votre stage bancaire ?", "les memes", 4),
    ]);
    expect(metrics.repeatedQuestions.map(({ a, b }) => [a, b])).toEqual([[0, 2]]);
    expect(metrics.repeatedQuestions[0]!.similarity).toBeGreaterThanOrEqual(0.6);
  });

  it("calcule la part de parole du jury sans compter la ponctuation", () => {
    const metrics = measureJuryBench([turn("Un deux trois ?", "quatre cinq six sept huit neuf", 0)]);
    // « un deux trois ? » compte 3 mots (le point d'interrogation isolé est
    // écarté), la réponse en compte 6.
    expect(metrics.juryWordShare).toBeCloseTo(3 / 9, 5);
  });

  it("une phrase imposée longue ne gonfle pas la part de parole du jury", () => {
    const longImposed =
      "Vous avez choisi l'article « Le climat en 2030 », un sujet qui engage la réflexion sur les décennies à venir, nous vous écoutons.";
    const metrics = measureJuryBench([turn(longImposed, "un deux trois quatre cinq", 0)]);
    // Phrase imposée exclue : le jury ne compte aucun mot, le candidat 5.
    expect(metrics.juryWordShare).toBe(0);
  });

  it("mesure la part des questions venant du catalogue du module 6", () => {
    const bank = ["Où vous voyez-vous dans 5 ans ?", "Quelles sont vos qualités et vos défauts ?"];
    const metrics = measureJuryBench(
      [
        turn("Où vous voyez-vous dans 5 ans ?", "Consultant.", 0),
        turn("Quel était le budget de cette association ?", "Trois mille euros.", 2),
      ],
      bank,
    );
    expect(metrics.bankQuestionRatio).toBe(0.5);
  });

  it("mesure la part des questions improvisées ancrées dans la réponse précédente", () => {
    const bank = ["Où vous voyez-vous dans 5 ans ?"];
    const metrics = measureJuryBench(
      [
        turn("Où vous voyez-vous dans 5 ans ?", "Je voudrais travailler dans la logistique.", 0),
        // Ancrée : reprend « logistique » de la réponse précédente.
        turn("Qu'est-ce qui vous attire dans la logistique ?", "L'organisation des flux.", 2),
        // Hors sol : aucun mot significatif de la réponse précédente.
        turn("Quel journal lisez-vous ?", "Le Monde.", 4),
      ],
      bank,
    );
    expect(metrics.bankQuestionRatio).toBeCloseTo(1 / 3, 5);
    expect(metrics.anchoredImprovisedRatio).toBe(0.5);
  });

  it("mesure la longueur des prises de parole du jury", () => {
    /** Question de `n` mots suivie d'un « ? » isolé (non compté). */
    const questionOf = (n: number) => `${Array.from({ length: n }, () => "mot").join(" ")} ?`;
    const lengths = [5, 10, 14, 20, 25, 30, 35, 45, 50, 55];
    const metrics = measureJuryBench(lengths.map((n, i) => turn(questionOf(n), "réponse", i * 2)));
    expect(metrics.juryTurnLength).toEqual({
      // Série triée : position médiane 4,5 → moyenne de 25 et 30.
      median: 27.5,
      // Position p90 : 8,1 → 50 + 0,1 × (55 − 50).
      p90: 50.5,
      max: 55,
      // Moins de 15 mots : 5, 10, 14.
      shortShare: 0.3,
      // 40 mots ou plus : 45, 50, 55.
      richShare: 0.3,
    });
  });

  it("les phrases imposées ne comptent pas dans la longueur des prises de parole", () => {
    const questionOf = (n: number) => `${Array.from({ length: n }, () => "mot").join(" ")} ?`;
    const metrics = measureJuryBench([
      turn("Vous avez choisi l'article « Le climat en 2030 », nous vous écoutons.", "voici", 0),
      turn(questionOf(20), "réponse", 2),
      turn(questionOf(50), "réponse", 4),
    ]);
    // Seules les deux questions non imposées comptent.
    expect(metrics.juryTurnLength).toEqual({ median: 35, p90: 47, max: 50, shortShare: 0, richShare: 0.5 });
  });

  it("sans prise de parole non imposée, la longueur est neutre sans planter", () => {
    const metrics = measureJuryBench([
      turn("Vous avez choisi l'article « Le climat en 2030 », nous vous écoutons.", "voici", 0),
    ]);
    expect(metrics.juryTurnLength).toEqual({ median: 0, p90: 0, max: 0, shortShare: 0, richShare: 0 });
  });

  it("détecte les thèmes obligatoires abordés", () => {
    const metrics = measureJuryBench([
      turn("Quel est votre projet professionnel ?", "conseil", 0),
      turn("Pourquoi notre école plutôt qu'une autre ?", "le programme", 2),
      turn("Quelles sont vos qualités et vos défauts ?", "curieux", 4),
      turn("Un article vous a-t-il marqué dans l'actualité ?", "oui", 6),
      turn("Parlez-moi de votre stage ?", "en banque", 8),
    ]);
    expect(metrics.coveredThemes).toEqual({
      projetPro: true,
      ecole: true,
      qualitesDefauts: true,
      actualite: true,
      experience: true,
    });
  });


  it("compte les tours vides du jury", () => {
    const metrics = measureJuryBench([
      turn("Quel est votre projet professionnel ?", "conseil", 0),
      turn("", "je complète", 2),
      turn("Et ensuite ?", "puis la finance", 4),
      turn("   ", "encore", 6),
    ]);
    expect(metrics.silentTurns).toBe(2);
    expect(metrics.silentShare).toBeCloseTo(0.5);
  });
});
