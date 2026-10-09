import { describe, expect, it } from "vitest";
import { interviewDifficultyLabel, interviewJuryLabel } from "./interview-kb";

describe("libellés du niveau de jury", () => {
  it("affiche les deux niveaux actuels et convertit découverte en jury neutre", () => {
    expect(interviewJuryLabel("classique")).toBe("Jury neutre");
    expect(interviewJuryLabel("classique_dur")).toBe("Jury dur");
    expect(interviewJuryLabel("decouverte")).toBe("Jury neutre");
  });

  it("conserve le libellé complet historique par défaut", () => {
    expect(interviewDifficultyLabel()).toBe("Entretien classique - jury neutre");
    expect(interviewDifficultyLabel("decouverte")).toBe("Entretien classique - jury neutre");
  });
});