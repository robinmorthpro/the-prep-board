// Banc d'essai : plans de l'essai éclair et du tour 2, essais de stabilité.
import { describe, expect, it } from "vitest";
import { CAS_LIMITES_TOUR2, ECLAIRS, PROFIL_PAR_ECOLE, essaisStabilite, plansTour2 } from "../../scripts/bench-lib";
import { difficultiesFor, getSchoolInterviewConfig } from "./school-interviews";

describe("essai éclair", () => {
  it("KEDGE neutre (clôture), GEM qui clôt l'interview inversée tôt, EM Strasbourg qui commence dès l'accueil", () => {
    expect(ECLAIRS.map((c) => `${c.ecole}/${c.jury}/${c.scenario.id}`)).toEqual([
      "KEDGE/classique/normal",
      "GEM (Grenoble EM)/classique/inversee-close-tot",
      "EM Strasbourg/classique/presentation-des-accueil",
    ]);
  });
});

describe("tour 2", () => {
  const plans = plansTour2();
  const principaux = plans.filter((p) => p.scenario.id === "normal").slice(0, Object.keys(PROFIL_PAR_ECOLE).length);
  it("les 23 écoles, un jury chacune, en alternant neutre et dur, avec les profils du tour 1", () => {
    expect(principaux.map((p) => p.ecole)).toEqual(Object.keys(PROFIL_PAR_ECOLE));
    principaux.forEach((p, i) => {
      expect(p.jury).toBe(i % 2 === 0 ? "classique" : "classique_dur");
      expect(p.profil).toBe(PROFIL_PAR_ECOLE[p.ecole]);
      expect(p.graine).toBe(1);
    });
  });
  it("les 5 cas limites en échec au tour 1", () => {
    expect(plans.filter((p) => p.scenario.id !== "normal").map((p) => p.scenario.id).sort()).toEqual([...CAS_LIMITES_TOUR2].sort());
  });
  it("Clermont et Rennes en jury dur, une seule fois chacun", () => {
    for (const ecole of ["ESC Clermont BS", "Rennes School of Business"]) {
      expect(plans.filter((p) => p.ecole === ecole && p.jury === "classique_dur" && p.scenario.id === "normal")).toHaveLength(1);
    }
    expect(plans).toHaveLength(29);
  });
  it("chaque jury prévu existe pour son école", () => {
    for (const p of plans) {
      if (["Rennes School of Business", "ISC Paris"].includes(p.ecole)) continue;
      expect(difficultiesFor(getSchoolInterviewConfig(p.ecole))).toContain(p.jury);
    }
  });
});

describe("stabilité", () => {
  it("essais 2, 3, 4 par défaut ; jamais l'essai 1 ; doublons retirés", () => {
    expect(essaisStabilite(undefined)).toEqual([2, 3, 4]);
    expect(essaisStabilite("2,3")).toEqual([2, 3]);
    expect(essaisStabilite("1,2,2,3")).toEqual([2, 3]);
    expect(essaisStabilite("1")).toEqual([2, 3, 4]);
  });
});
