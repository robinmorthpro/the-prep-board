import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CAS_LIMITES,
  PROFIL_PAR_ECOLE,
  RECOPIES,
  cleReprise,
  dureeParoleMs,
  extraireBloc,
  pourCandidat,
  sha256,
} from "../../scripts/bench-lib";
import { REGIE_PREFIX } from "./phase-engine";
import { getSchoolInterviewConfig } from "./school-interviews";
import { CLERMONT_IMPACT_JURY } from "./esc-clermont-kb";
import { buildClermontImpactVariables } from "./school-interviews";

const partie8 = readFileSync(new URL("../routes/_app.partie-8.tsx", import.meta.url), "utf8");
const script = readFileSync(new URL("../../scripts/jury-bench-run.ts", import.meta.url), "utf8");

describe("banc : blocs recopiés de partie-8", () => {
  for (const r of RECOPIES) {
    it(`« ${r.nom} » n'a pas changé dans l'application`, () => {
      const bloc = extraireBloc(partie8, r.debut, r.fin);
      expect(bloc, "bloc introuvable dans partie-8").not.toBeNull();
      expect(sha256(bloc!)).toBe(r.sha256);
    });
    it(`« ${r.nom} » est listé et recopié dans le script`, () => {
      expect(script).toContain(`RECOPIE partie-8 : ${r.nom}`);
    });
  }
});

describe("banc : candidat et horloge", () => {
  it("le candidat ne voit jamais une consigne de régie", () => {
    expect(pourCandidat(`${REGIE_PREFIX} Temps écoulé : 3 min.`)).toBeNull();
    expect(pourCandidat("Bonjour, présentez-vous.")).toBe("Bonjour, présentez-vous.");
  });
  it("150 mots durent une minute", () => {
    expect(dureeParoleMs(Array(150).fill("mot").join(" "))).toBe(60_000);
  });
  it("clé de reprise stable", () => {
    const k = { lot: "pilote", ecole: "ESC Clermont BS", jury: "classique" as const, scenario: "normal", graine: 7 };
    expect(cleReprise(k)).toBe(cleReprise({ ...k }));
  });
});

describe("banc : plan des entretiens", () => {
  it("23 écoles, toutes connues de l'application, avec la rotation des profils", () => {
    expect(Object.keys(PROFIL_PAR_ECOLE)).toHaveLength(23);
    const n = (p: string) => Object.values(PROFIL_PAR_ECOLE).filter((x) => x === p).length;
    expect([n("excellent"), n("bon"), n("moyen"), n("faible"), n("passif")]).toEqual([5, 5, 5, 4, 4]);
    expect(PROFIL_PAR_ECOLE["ESC Clermont BS"]).toBe("bon");
    for (const e of Object.keys(PROFIL_PAR_ECOLE)) expect(getSchoolInterviewConfig(e).school).toBe(e);
  });
  it("13 cas limites", () => {
    expect(CAS_LIMITES).toHaveLength(13);
    expect(CAS_LIMITES[0]).toMatchObject({ ecole: "TBS Education", jury: "classique", profil: "bon" });
    expect(CAS_LIMITES[7]).toMatchObject({ ecole: "Rennes School of Business", jury: "classique_dur" });
  });
  it("le tirage Clermont du banc vient de la pile du jury", () => {
    const v = buildClermontImpactVariables("ESC Clermont BS", () => 0.42);
    expect(CLERMONT_IMPACT_JURY.people).toContain(v.clermont_q_people);
  });
});
