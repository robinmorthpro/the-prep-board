import { describe, expect, it } from "vitest";
import { interviewDifficultyLabel, interviewJuryLabel, interviewPercentile } from "./interview-kb";

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

describe("percentile affiché dans l'historique", () => {
  it("masque tout percentile pour un entretien interrompu, même présent dans un ancien feedback", () => {
    expect(interviewPercentile("stopped", 98, "P98 - ancien feedback")).toBe(null);
  });

  it("prend la valeur enregistrée pour un entretien achevé, sinon celle de l'ancien feedback", () => {
    expect(interviewPercentile("done", 72, "P98 - ancien feedback")).toBe(72);
    expect(interviewPercentile("done", null, "P64 - ancien feedback")).toBe(64);
  });
});