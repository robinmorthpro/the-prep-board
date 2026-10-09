import { describe, expect, it } from "vitest";
import { BAREME, grilleKeyForSchool, type NiveauOuNonObserve } from "./bareme";
import { calculerNote, percentileFor } from "./calcul";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;
const G = (k: string) => BAREME.grilles[k]!;
import { mesurerPenalites } from "./durees";

function tout(grilleKey: string, niveau: NiveauOuNonObserve): N {
  const out: N = {};
  for (const c of G(grilleKey).criteres) out[c.cle] = Object.fromEntries(c.cases.map((x) => [x.cle, niveau]));
  return out;
}
const sans = { interrompu: false, penalites: [] };

describe("calcul de la note", () => {
  it("grille classique toute à N4 = 20/20", () => {
    const r = calculerNote(G("classique"), tout("classique", "N4"), sans);
    expect(r.note_sur_20).toBe(20);
    expect(r.note_finale).toBe(20);
  });

  it("une case « non observé » sort du diviseur", () => {
    const g = G("classique");
    const n = tout("classique", "N4");
    n.experiences.projection = "non observé"; // 1,5 point max
    const r = calculerNote(g, n, sans);
    expect(r.diviseur).toBe(g.total_brut - 1.5);
    expect(r.note_sur_20).toBe(20);
    expect(r.points_par_case["experiences"]?.["projection"]).toBeNull();
  });

  it("un critère entièrement non observé n'est pas noté", () => {
    const n = tout("classique", "N4");
    for (const k of Object.keys(n.ouverture)) n.ouverture[k] = "non observé";
    const r = calculerNote(G("classique"), n, sans);
    expect(r.criteres_non_notes).toEqual(["ouverture"]);
    expect(r.points_par_critere["ouverture"]).toBeNull();
    expect(r.note_sur_20).toBe(20);
  });

  it("Montpellier : total 10,5 ramené sur 20", () => {
    const g = G("montpellier");
    expect(g.total_brut).toBe(10.5);
    const n = tout("montpellier", "N4");
    n.presentation.presentation = "N3"; // 1,5 au lieu de 2
    const r = calculerNote(g, n, sans);
    expect(r.note_sur_20).toBeCloseTo((10 * 20) / 10.5, 10);
  });

  it("pitch EM Strasbourg : N1 = 0,5", () => {
    const n = tout("em_strasbourg", "N4");
    n.pitch_em_strasbourg.pitch = "N1";
    const r = calculerNote(G("em_strasbourg"), n, sans);
    expect(r.points_par_critere["pitch_em_strasbourg"]).toBe(0.5);
    expect(r.note_sur_20).toBe(18.5);
  });

  it("pénalité de 0,5 et plancher à 0", () => {
    const p = { partie: "x", type: "trop_court" as const, duree_mesuree_s: 100, seuil_s: 150 };
    const haut = calculerNote(G("classique"), tout("classique", "N4"), { interrompu: false, penalites: [p, p] });
    expect(haut.note_finale).toBe(19);
    const bas = calculerNote(G("classique"), tout("classique", "N1"), { interrompu: false, penalites: [p] });
    expect(bas.note_sur_20).toBe(0);
    expect(bas.note_finale).toBe(0);
  });

  it("lecture de la table du percentile", () => {
    expect(percentileFor(0)).toBe(1);
    expect(percentileFor(4.5)).toBe(1);
    expect(percentileFor(10)).toBe(24);
    expect(percentileFor(10.4)).toBe(24); // ligne inférieure
    expect(percentileFor(10.5)).toBe(28);
    expect(percentileFor(20)).toBeLessThanOrEqual(99);
  });

  it("entretien interrompu : ni note ni percentile", () => {
    const r = calculerNote(G("classique"), tout("classique", "N4"), { interrompu: true, penalites: [] });
    expect(r.note_sur_20).toBeNull();
    expect(r.note_finale).toBeNull();
    expect(r.percentile).toBeNull();
  });
});

describe("pénalités de durée mesurées par le code", () => {
  const t = (id: string, s: number) => ({ phaseId: id, startedAt: "2026-10-09T10:00:00.000Z", transitionDetectedAt: new Date(Date.parse("2026-10-09T10:00:00.000Z") + s * 1000).toISOString() });
  it("EDHEC sous 3 min 15 : pénalité", () => {
    expect(mesurerPenalites("edhec", [t("edhec-presentation", 190)]).penalites).toHaveLength(1);
    expect(mesurerPenalites("edhec", [t("edhec-presentation", 200)]).penalites).toHaveLength(0);
  });
  it("ESSEC au-delà de 5 min 30 : pénalité", () => {
    expect(mesurerPenalites("essec", [t("essec-presentation", 340)]).penalites).toHaveLength(1);
  });
  it("durée non mesurée : aucune pénalité, durée gardée en contrôle", () => {
    const r = mesurerPenalites("em_strasbourg", []);
    expect(r.penalites).toHaveLength(0);
    expect(r.controles[0]!.duree_mesuree_s).toBeNull();
  });
});

describe("écoles", () => {
  it("toutes les écoles enregistrées ont une grille", () => {
    for (const s of ["EDHEC", "emlyon", "ESC Clermont BS", "ESSEC", "GEM (Grenoble EM)", "INSEEC Grande École", "KEDGE", "La Rochelle BS", "NEOMA", "SCBS (South Champagne BS)", "SKEMA", "TBS Education", "HEC Paris"]) {
      expect(grilleKeyForSchool(s), s).not.toBeNull();
    }
    expect(grilleKeyForSchool("EM Strasbourg")).toBe("em_strasbourg");
  });
});
