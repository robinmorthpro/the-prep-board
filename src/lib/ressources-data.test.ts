import { describe, expect, test } from "vitest";
import { CHAPTERS } from "@/lib/ressources-data";
import { CAREER_THEORY_SECTIONS, NEWS_THEORY_SECTIONS, SCHOOLS_THEORY_SECTIONS, EXPERIENCE_THEORY_SECTIONS } from "@/lib/theory";

const chap = (id: string) => CHAPTERS.find((c) => c.id === id)!;

describe("Ressources théoriques : source unique avec les modules", () => {
  test("le chapitre Questions clés contient les 44 questions canoniques", () => {
    expect(chap("questions").sections).toHaveLength(44);
  });

  test.each([
    ["projet", CAREER_THEORY_SECTIONS],
    ["ecoles", SCHOOLS_THEORY_SECTIONS],
    ["experiences", EXPERIENCE_THEORY_SECTIONS],
    ["actualite", NEWS_THEORY_SECTIONS],
  ])("le chapitre %s et le module affichent les mêmes parties", (id, theory) => {
    expect(chap(id).sections.map((s) => s.title)).toEqual(theory.map((s) => s.title));
  });

  test("le contenu du livre est bien présent dans le module 1", () => {
    const all = CAREER_THEORY_SECTIONS.flatMap((s) => s.points).join(" ");
    expect(all).toContain("400 heures");
    expect(all).toContain("LinkedIn");
  });

  test("RIASEC n'apparaît plus dans la méthode commune", () => {
    expect(JSON.stringify(CHAPTERS)).not.toContain("RIASEC");
  });
});
