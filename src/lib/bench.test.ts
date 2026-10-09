import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CAS_LIMITES,
  PROFIL_PAR_ECOLE,
  RECOPIES,
  PRESENTATION_CLASSIQUE_S,
  REPONSE_FERMEE_S,
  cleReprise,
  estQuestionFermee,
  fourchettePresentation,
  montpellierChoixMessage,
  dureeParoleMs,
  extraireBloc,
  pourCandidat,
  sha256,
} from "../../scripts/bench-lib";
import { REGIE_PREFIX } from "./phase-engine";
import { normalizeInterviewText } from "./interview-text";
import { EVAL_MAX_OUTPUT_TOKENS } from "./evaluateur/gateway";
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

describe("banc : durées des présentations", () => {
  const centre = (e: string, doc = false, sc?: number) => {
    const [a, b] = fourchettePresentation(e, doc, sc);
    return Math.round((a + b) / 2);
  };
  it("format classique : 1 min 30 à 2 min", () => {
    expect(fourchettePresentation("Audencia", false)).toEqual([90, 120]);
    expect(PRESENTATION_CLASSIQUE_S).toEqual([90, 120]);
  });
  it("durées imposées par école", () => {
    expect(centre("ESSEC")).toBe(270);
    expect(centre("emlyon")).toBe(60);
    expect(centre("EDHEC")).toBe(240);
    expect(centre("GEM (Grenoble EM)")).toBe(300);
    expect(centre("KEDGE")).toBe(180);
    expect(centre("INSEEC Grande École")).toBe(300);
    expect(centre("Montpellier BS")).toBe(90);
    expect(centre("EM Strasbourg", true)).toBe(180);
    expect(centre("ESC Clermont BS")).toBe(120);
  });
  it("écoles à document : 2 min", () => {
    expect(centre("NEOMA", true)).toBe(120);
  });
  it("le scénario « trop court » l'emporte sur l'école", () => {
    expect(centre("EDHEC", false, 150)).toBe(150);
  });
});

describe("banc : questions fermées", () => {
  const f = (t: string) => estQuestionFermee(normalizeInterviewText(t));
  it("réponse courte de 10 à 30 s", () => expect(REPONSE_FERMEE_S).toEqual([10, 30]));
  it("questions fermées ou factuelles", () => {
    expect(f("Combien de licenciés compte votre club ?")).toBe(true);
    expect(f("Citez-moi trois associations de l'école.")).toBe(true);
    expect(f("Très bien. Citez-moi trois associations de l'école ?")).toBe(true);
    expect(f("Avez-vous déjà travaillé à l'étranger ?")).toBe(true);
    expect(f("En quelle année avez-vous commencé le handball ?")).toBe(true);
  });
  it("questions ouvertes", () => {
    expect(f("Pourquoi voulez-vous intégrer notre école ?")).toBe(false);
    expect(f("Racontez-moi une situation difficile que vous avez vécue ?")).toBe(false);
    expect(f("Qu'est-ce qui vous a le plus marqué dans cette expérience ?")).toBe(false);
  });
});

describe("banc : Montpellier et limite de l'évaluateur", () => {
  it("le message au clic est exactement celui de l'application", () => {
    const tpl = partie8.match(/agent\.notifyContext\(\s*`([^`]+)`/)![1]!;
    const texte = "Vous avez pris un risque";
    expect(montpellierChoixMessage(texte)).toBe(tpl.replace("${s.text}", texte));
  });
  it("limite de sortie de l'évaluateur : 32 000 jetons", () => {
    expect(EVAL_MAX_OUTPUT_TOKENS).toBe(32000);
  });
});
