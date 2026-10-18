import { describe, expect, it } from "vitest";
import { interviewBrief, supportModuleMention } from "./interview-brief";
import { getSchoolInterviewConfig } from "./school-interviews";

describe("Durée totale réglée affichée avant entretien", () => {
  it.each([
    ["ESSEC", 45], ["emlyon", 27], ["INSEEC Grande École", 25], ["GEM (Grenoble EM)", 32], ["Rennes School of Business", 25], ["ISC Paris", 25],
  ])("%s affiche %s minutes sans modifier la configuration", (school, minutes) => {
    const config = getSchoolInterviewConfig(String(school));
    const before = JSON.stringify(config);
    expect(interviewBrief(config).minutes).toBe(minutes);
    expect(JSON.stringify(config)).toBe(before);
  });
});

describe("Durée affichée au candidat", () => {
  it.each([
    ["emlyon", "Environ 30 minutes"],
    ["GEM (Grenoble EM)", "Environ 30 minutes"],
    ["INSEEC Grande École", "Environ 25 minutes"],
  ])("%s affiche « %s »", (school, label) => {
    expect(interviewBrief(getSchoolInterviewConfig(String(school))).durationLabel).toBe(label);
  });

  it("laisse la durée réglée par le moteur inchangée", () => {
    expect(getSchoolInterviewConfig("emlyon").durationSeconds / 60).toBe(27);
    expect(getSchoolInterviewConfig("GEM (Grenoble EM)").durationSeconds / 60).toBe(32);
  });
});

describe("Durée affichée à côté du titre de chaque étape", () => {
  it.each([
    ["ESSEC", ["3 min à 5 min 30", undefined, "À la 35e minute"]],
    ["EDHEC", ["1 min + 4 min", "20 min"]],
    ["emlyon", ["Environ 1 min", "Environ 15 min", "Environ 8 à 10 min"]],
    ["GEM (Grenoble EM)", ["5 min + 2 min", "9 min + 1 min", "15 min"]],
    ["KEDGE", [undefined, "Environ 3 min", undefined, undefined]],
    ["TBS Education", ["5 min", "Environ 15 min"]],
    ["ESC Clermont BS", ["2 min", "Environ 5 min", "18 min"]],
    ["Montpellier BS", ["1 à 2 min", undefined, undefined]],
    ["INSEEC Grande École", ["5 min", "20 min"]],
  ])("%s affiche la durée de chaque étape", (school, durations) => {
    const { steps } = interviewBrief(getSchoolInterviewConfig(String(school)));
    expect(steps.map((s) => s.duration)).toEqual(durations);
  });

  it("retire toute mention de durée de la phrase sous chaque titre", () => {
    for (const school of ["ESSEC", "EDHEC", "emlyon", "GEM (Grenoble EM)", "KEDGE", "TBS Education", "ESC Clermont BS", "INSEEC Grande École", "EM Strasbourg", "Montpellier BS"]) {
      for (const step of interviewBrief(getSchoolInterviewConfig(school)).steps) {
        if (step.duration) {
          expect(step.detail, `${school} — ${step.label}`).not.toMatch(/minute/);
        }
      }
    }
  });

  it("Clermont précise que réponse et échange partagent les cinq minutes", () => {
    const step = interviewBrief(getSchoolInterviewConfig("ESC Clermont BS")).steps[1];
    expect(step?.duration).toBe("Environ 5 min");
    expect(step?.detail).toMatch(/se partagent ce temps/);
  });
});

describe("Mention du module Mes supports d'entretien", () => {
  it("rappelle le nom du support et le module en une seule ligne (NEOMA)", () => {
    expect(supportModuleMention(getSchoolInterviewConfig("NEOMA"))).toBe(
      "Questionnaire NEOMA — ce support est travaillé au module « Mes supports d’entretien »",
    );
  });

  it("adapte la ligne au nom du support de chaque école concernée", () => {
    for (const school of ["ESCP", "EM Strasbourg", "EM Normandie", "BSB (Burgundy School of Business)", "SKEMA"]) {
      const config = getSchoolInterviewConfig(school);
      expect(supportModuleMention(config), school).toBe(
        `${config.support?.label} — ce support est travaillé au module « Mes supports d’entretien »`,
      );
    }
  });

  it("n'affiche pas de mention pour TBS ni pour les écoles sans support", () => {
    expect(supportModuleMention(getSchoolInterviewConfig("TBS Education"))).toBeNull();
    expect(supportModuleMention(getSchoolInterviewConfig("Audencia"))).toBeNull();
  });
});