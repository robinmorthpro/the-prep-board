import { describe, expect, it } from "vitest";
import { CLOSING_QUESTIONS, EXIT_PHRASE_INSTRUCTION, PhaseEngine, REGIE_PREFIX, closingInstruction } from "./phase-engine";
import { getSchoolInterviewConfig, monologueMeasuresFor, phaseScheduleFor, simulatedMinutes } from "./school-interviews";

const min = 60_000;
function moteur(school: string) {
  const config = getSchoolInterviewConfig(school);
  return { e: new PhaseEngine({ school, schedule: phaseScheduleFor(config) ?? [], monologues: monologueMeasuresFor(school), totalMinutes: simulatedMinutes(config), startedAt: 0, variables: {} }), total: simulatedMinutes(config) };
}

describe("clôture : question seule, puis phrase de sortie", () => {
  it("D4/D3 — à Y−2 : question de clôture tirée, mot pour mot ; réponse suivante : consigne de sortie", () => {
    const { e, total } = moteur("Audencia");
    e.onJuryMessage("Bonjour, présentez-vous.", 0);
    e.onCandidateAnswer("Je m'appelle Robin.", 1 * min);
    e.onJuryMessage("Très bien, parlez-moi de votre projet ?", 1 * min);
    const a = e.onCandidateAnswer("Mon projet est la logistique.", (total - 2) * min);
    expect(a).toEqual([`${REGIE_PREFIX} ${closingInstruction(CLOSING_QUESTIONS.A)}`]);
    expect(a.join(" ")).not.toContain("Il reste 2 minutes");
    e.onJuryMessage("Avez-vous une question pour nous ?", (total - 2) * min);
    const b = e.onCandidateAnswer("Non, merci beaucoup.", (total - 1) * min);
    expect(b).toEqual([`${REGIE_PREFIX} ${EXIT_PHRASE_INSTRUCTION}`]);
    expect(EXIT_PHRASE_INSTRUCTION).toBe("S'il t'a posé une question, réponds-y en une ou deux phrases, sans rien inventer sur l'école, puis dis la phrase de sortie. Sinon, dis seulement la phrase de sortie.");
  });
});
