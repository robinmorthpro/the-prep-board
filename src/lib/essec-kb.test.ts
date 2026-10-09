import { describe, expect, it } from "vitest";
import { ESSEC_SITUATIONS_JURY, ESSEC_SITUATIONS_MODULE, ESSEC_SITUATIONS_NUMEROTEES } from "./essec-kb";

describe("partition partagée ESSEC", () => {
  it("corrige les étiquettes 8, 24 et 30", () => {
    expect(ESSEC_SITUATIONS_NUMEROTEES.find((item) => item.numero === 8)?.competence).toBe("Capacités d'organisation");
    expect(ESSEC_SITUATIONS_NUMEROTEES.find((item) => item.numero === 24)?.competence).toBe("Créativité");
    expect(ESSEC_SITUATIONS_NUMEROTEES.find((item) => item.numero === 30)?.competence).toBe("Créativité");
  });

  it("donne au module les trois plus petits numéros de chaque compétence et le complément au jury", () => {
    const groups = new Map<string, typeof ESSEC_SITUATIONS_NUMEROTEES>();
    for (const item of ESSEC_SITUATIONS_NUMEROTEES) {
      groups.set(item.competence, [...(groups.get(item.competence) ?? []), item]);
    }
    for (const [competence, items] of groups) {
      expect(ESSEC_SITUATIONS_MODULE.filter((item) => item.competence === competence).map((item) => item.numero)).toEqual(
        items.slice(0, 3).map((item) => item.numero),
      );
    }
    expect(ESSEC_SITUATIONS_MODULE).toHaveLength(15);
    expect(ESSEC_SITUATIONS_JURY).toHaveLength(15);
    expect(new Set([...ESSEC_SITUATIONS_MODULE, ...ESSEC_SITUATIONS_JURY].map((item) => item.numero)).size).toBe(30);
  });
});