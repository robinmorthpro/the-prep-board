import { describe, expect, it } from "vitest";
import { BAREME } from "./bareme";
import { systemPromptFor } from "./textes";
import { validerSortie } from "./validation";

const grille = BAREME.grilles["classique"]!;
const transcription = "Bonjour, présentez-vous.\nJe m’appelle Robin, je suis en deuxième année de prépa ECG au lycée du Parc à Lyon.";
const textes = systemPromptFor("classique")!;

function sortie(citation: string, extra: Record<string, unknown> = {}) {
  const criteres = Object.fromEntries(
    grille.criteres.map((c) => [
      c.cle,
      Object.fromEntries(c.cases.map((x) => [x.cle, { niveau: "N4", justification: "ok", manque_pour_n4: [], citations: [citation] }])),
    ]),
  );
  return JSON.stringify({ grille: "classique", entretien_interrompu: false, criteres: { ...criteres, ...extra }, penalites: [], remarques: "" });
}

describe("vérification de la sortie", () => {
  const attendu = { grilleKey: "classique", grille, transcription, textesEvaluateur: textes };
  it("citation exacte acceptée (apostrophe et espaces normalisés)", () => {
    expect(validerSortie(sortie("Je m'appelle Robin,  je suis en deuxième année de prépa ECG"), attendu).ok).toBe(true);
  });
  it("citation inventée rejetée", () => {
    const r = validerSortie(sortie("Je m'appelle Robin et j'adore la finance de marché"), attendu);
    expect(r.ok).toBe(false);
  });
  it("critère en trop rejeté", () => {
    const r = validerSortie(sortie("Je m'appelle Robin, je suis en deuxième année", { bonus: {} }), attendu);
    expect(r.ok).toBe(false);
  });
  it("message système = commun + école + format, séparés par une ligne vide", () => {
    expect(textes.startsWith("# L'évaluateur : texte commun")).toBe(true);
    expect(textes).toContain("\n\n# Format classique (grille `classique`)");
    expect(textes).toContain("\n\n# Format de sortie de l'évaluateur");
  });
  function avecManque(m: string) {
    const o = JSON.parse(sortie("Je m'appelle Robin"));
    const c = grille.criteres[0]!;
    o.criteres[c.cle][c.cases[0]!.cle] = { niveau: "N3", justification: "ok", manque_pour_n4: [m], citations: [] };
    return JSON.stringify(o);
  }
  it("manque_pour_n4 recopié sans les ** accepté", () => {
    expect(validerSortie(avecManque("racontées par au moins 2 anecdotes précises chacune"), attendu).ok).toBe(true);
  });
  it("manque_pour_n4 qui traverse un <br> accepté", () => {
    expect(validerSortie(avecManque("aucune projection). 2. Générique ou sans preuve : N2 au mieux"), attendu).ok).toBe(true);
  });
  it("manque_pour_n4 inventé toujours rejeté", () => {
    expect(validerSortie(avecManque("racontées par au moins 5 anecdotes"), attendu).ok).toBe(false);
  });
});
