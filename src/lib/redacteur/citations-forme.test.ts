// Vérification des citations du feedback : tolérante à la forme, jamais aux mots.
import { describe, expect, it } from "vitest";
import { citationTrouvee, filtrerVerbatims } from "./texte";

const SOURCE =
  "Candidat : Je pense que c'était un vrai défi… Mon coach m'a dit « garde le cap » et je reste curieuse de découvrir les associations.";

describe("citationTrouvee : différences de forme acceptées", () => {
  it.each([
    ["majuscule initiale changée", "je pense que c'était un vrai défi"],
    ["points de suspension en trois points", "un vrai défi..."],
    ["guillemets droits au lieu de « »", 'm\'a dit "garde le cap"'],
    ["omission marquée […]", "Je pense […] un vrai défi"],
  ])("%s", (_, citation) => expect(citationTrouvee(citation, SOURCE)).toBe(true));
});

describe("citationTrouvee : mots changés refusés", () => {
  it.each([
    ["mot remplacé", "je crois que c'était un vrai défi"],
    ["mot ajouté", "un très vrai défi"],
    ["accord changé", "je reste curieux de découvrir"],
    ["mot retiré sans […]", "je reste de découvrir les associations"],
  ])("%s", (_, citation) => expect(citationTrouvee(citation, SOURCE)).toBe(false));
});

describe("filtrerVerbatims", () => {
  it("garde une citation qui ne diffère que par la majuscule initiale, retire une citation reformulée", () => {
    const texte = "VERBATIMS : Vous : « Je reste curieuse de découvrir les associations » // Vous : « j'adore découvrir les associations »";
    const r = filtrerVerbatims(texte, SOURCE);
    expect(r.text).toContain("Je reste curieuse");
    expect(r.retirees).toHaveLength(1);
    expect(r.retirees[0]).toContain("j'adore");
  });
});
