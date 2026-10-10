import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InterviewDebrief } from "@/components/vivaldi/InterviewDebrief";
import { controlerTexte, filtrerVerbatims, insererPercentile, LIGNE_INTERROMPU, parseReview } from "./texte";
import { blocFileForSchool } from "./textes";
import { produireFeedback } from "../feedback-enchainement";
import { plain } from "../transcript-pdf";

const TEXTE = `## Ce que ce classement signifie
Vous êtes dans la moyenne.

## Feedback général
- Point

## Feedback détaillé
### Présentation
VERBATIMS: [présentation] Vous : « je suis en deuxième année de prépa ECG » // [stage] Vous : « j'ai dirigé une équipe de cinquante personnes »
FEEDBACK:
- Piste

## À retravailler en priorité
- Point
Déjà en place, à ne pas perdre : la structure.`;

const TRANSCRIPTION = "Bonjour, je m’appelle Robin, je suis en deuxième année de prépa ECG au lycée du Parc.";

describe("rédacteur : traitement du texte", () => {
  it("insère la ligne du percentile juste sous le premier titre", () => {
    const out = insererPercentile(TEXTE, 67, false).split("\n");
    expect(out[0]).toBe("## Ce que ce classement signifie");
    expect(out[1]).toBe("P67 - vous faites mieux que 67 % des candidats (± 5 percentiles).");
  });
  it("entretien interrompu : ligne exacte à la place du percentile", () => {
    const out = insererPercentile(TEXTE, null, true).split("\n");
    expect(out[1]).toBe("Entretien interrompu : pas de note ni de percentile. Voici un retour sur ce que vous avez fait.");
    expect(out[1]).toBe(LIGNE_INTERROMPU);
  });
  it("retire une citation inventée et garde une citation vraie", () => {
    const { text, retirees } = filtrerVerbatims(TEXTE, TRANSCRIPTION);
    expect(text).toContain("« je suis en deuxième année de prépa ECG »");
    expect(text).not.toContain("cinquante personnes");
    expect(retirees).toHaveLength(1);
  });
  it("supprime entièrement une ligne VERBATIMS dont toutes les citations sont retirées", () => {
    const input = `### Présentation\n- Une remarque\nVERBATIMS: Vous : « citation inventée »\n- Une autre remarque`;
    const { text, retirees } = filtrerVerbatims(input, TRANSCRIPTION);
    expect(text).toBe("### Présentation\n- Une remarque\n- Une autre remarque");
    expect(retirees).toEqual(["Vous : « citation inventée »"]);
  });
  it("traite plusieurs lignes VERBATIMS et ne garde que leurs citations exactes", () => {
    const input = `### Présentation\n- Première remarque\nVERBATIMS: Vous : « je suis en deuxième année de prépa ECG » // Vous : « faux »\n- Deuxième remarque\nVERBATIMS: Vous : « au lycée du Parc »`;
    const { text, retirees } = filtrerVerbatims(input, TRANSCRIPTION);
    expect(text).toContain('VERBATIMS: Vous : « je suis en deuxième année de prépa ECG »');
    expect(text).toContain('VERBATIMS: Vous : « au lycée du Parc »');
    expect(text).not.toContain('« faux »');
    expect(retirees).toHaveLength(1);
  });
  it("accepte une ligne VERBATIMS indentée, avec tiret ou en gras en conservant la mise en forme", () => {
    const input = `### Présentation\n- Remarque\n  VERBATIMS: Vous : « je suis en deuxième année de prépa ECG »\n- Autre remarque\n- VERBATIMS: Vous : « au lycée du Parc »\n- Encore une\n**VERBATIMS:** Vous : « Robin »`;
    const { text, retirees } = filtrerVerbatims(input, TRANSCRIPTION);
    expect(retirees).toHaveLength(0);
    expect(text).toContain("  VERBATIMS: Vous : « je suis en deuxième année de prépa ECG »");
    expect(text).toContain("- VERBATIMS: Vous : « au lycée du Parc »");
    expect(text).toContain("**VERBATIMS:** Vous : « Robin »");
  });
  it("garde une citation tirée du document remis", () => {
    const t = TEXTE.replace("j'ai dirigé une équipe de cinquante personnes", "trésorier du BDE");
    const { retirees } = filtrerVerbatims(t, TRANSCRIPTION, "Expériences : trésorier du BDE en 2025.");
    expect(retirees).toHaveLength(0);
  });
  it("contrôle : « P » + nombre et section manquante déclenchent un nouvel appel", () => {
    expect(controlerTexte(TEXTE)).toEqual([]);
    expect(controlerTexte(`${TEXTE}\nVous êtes P40.`).length).toBe(1);
    expect(controlerTexte(TEXTE.replace("## Feedback général", "## Général")).length).toBe(1);
  });
  it("choix du bloc d'école", () => {
    expect(blocFileForSchool("NEOMA")).toBe("ecoles-a-document.md");
    expect(blocFileForSchool("EM Strasbourg")).toBe("em-strasbourg.md");
    expect(blocFileForSchool("Audencia")).toBeNull();
  });
  it("analyse le nouveau format avec plusieurs puces, citations rattachées et puce seule", () => {
    const parts = parseReview(`### Présentation\n- Première remarque\nVERBATIMS: Vous : « citation 1 » // Jury : « citation 2 »\n- Deuxième remarque\n- Troisième remarque\nVERBATIMS: Vous : « citation 3 »`);
    expect(parts).toEqual([
      {
        title: "Présentation",
        format: "attached",
        feedback: "",
        verbatims: [],
        items: [
          { feedback: "Première remarque", verbatims: ['Vous : « citation 1 »', 'Jury : « citation 2 »'] },
          { feedback: "Deuxième remarque", verbatims: [] },
          { feedback: "Troisième remarque", verbatims: ['Vous : « citation 3 »'] },
        ],
      },
    ]);
  });
  it("rattache les lignes VERBATIMS indentée, avec tiret ou en gras à la puce précédente sans créer de nouvelle puce", () => {
    const parts = parseReview(`### Présentation\n- Première remarque\n  VERBATIMS: Vous : « citation 1 »\n- Deuxième remarque\n- VERBATIMS: Vous : « citation 2 »\n- Troisième remarque\n**VERBATIMS:** Vous : « citation 3 »`);
    expect(parts[0]?.items).toEqual([
      { feedback: "Première remarque", verbatims: ['Vous : « citation 1 »'] },
      { feedback: "Deuxième remarque", verbatims: ['Vous : « citation 2 »'] },
      { feedback: "Troisième remarque", verbatims: ['Vous : « citation 3 »'] },
    ]);
  });
  it("préserve la structure de l'ancien format", () => {
    const parts = parseReview(`### Présentation\nVERBATIMS: Vous : « ancienne citation »\nFEEDBACK:\n- Ancienne remarque`);
    expect(parts[0]).toEqual({
      title: "Présentation",
      format: "legacy",
      feedback: "- Ancienne remarque",
      verbatims: ['Vous : « ancienne citation »'],
      items: [],
    });
  });
  it("préserve le texte libre d'un critère non mesuré", () => {
    expect(parseReview("### Ouverture sur le monde\nPas mesuré dans cet entretien.")[0]?.feedback).toBe("Pas mesuré dans cet entretien.");
  });
  it("affiche les citations sous leurs puces sans titre global dans le nouveau format", () => {
    const html = renderToStaticMarkup(
      createElement(InterviewDebrief, {
        text: "## Feedback détaillé\n### Présentation\n- Première remarque\nVERBATIMS: Vous : « citation 1 »\n- Remarque sans citation",
      }),
    );
    expect(html).toContain("Première remarque");
    expect(html).toContain("citation 1");
    expect(html).toContain("Remarque sans citation");
    expect(html).not.toContain("Verbatims qui illustrent");
    expect(html.indexOf("Première remarque")).toBeLessThan(html.indexOf("citation 1"));
  });
  it("conserve le bloc global des verbatims pour l'ancien format", () => {
    const html = renderToStaticMarkup(
      createElement(InterviewDebrief, {
        text: "## Feedback détaillé\n### Présentation\nVERBATIMS: Vous : « ancienne citation »\nFEEDBACK:\n- Ancienne remarque",
      }),
    );
    expect(html).toContain("Ancienne remarque");
    expect(html).toContain("Verbatims qui illustrent");
    expect(html.indexOf("Ancienne remarque")).toBeLessThan(html.indexOf("Verbatims qui illustrent"));
  });
  it("adapte les libellés de l'export PDF pour les deux formats", () => {
    expect(plain("VERBATIMS: Une citation\nFEEDBACK:\n- Une remarque")).toBe("Verbatims : Une citation\n- Une remarque");
  });
  it("conserve l'empreinte exacte du texte commun du rédacteur", () => {
    const file = new URL("./textes/redacteur-commun.md", import.meta.url);
    const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
    expect(hash).toBe("6fe38423df9e292005e9dd2da856f71e5cf0c0b2f3f75ce6f0901cdf2b77e7b8");
  });
});

describe("enchaînement : une relance automatique, puis échec", () => {
  const ok = async () => ({ ok: true, id: "e", status: "ok" });
  it("succès au premier essai : un seul passage", async () => {
    const evaluer = vi.fn(ok);
    const r = await produireFeedback({ evaluer, rediger: async () => ({ debrief: "texte", percentile: 67 }) });
    expect(r).toEqual({ ok: true, debrief: "texte", percentile: 67, source: "nouveau", evaluationId: "e" });
    expect(evaluer).toHaveBeenCalledTimes(1);
  });
  it("échec puis succès : deux passages", async () => {
    const evaluer = vi.fn(ok);
    const rediger = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce({ debrief: "texte", percentile: 50 });
    const r = await produireFeedback({ evaluer, rediger });
    expect(r.ok).toBe(true);
    expect(evaluer).toHaveBeenCalledTimes(2);
  });
  it("deux échecs : échec, sans texte", async () => {
    const evaluer = vi.fn(async () => { throw new Error("x"); });
    const r = await produireFeedback({ evaluer, rediger: vi.fn() });
    expect(r).toEqual({ ok: false });
    expect(evaluer).toHaveBeenCalledTimes(2);
  });
  it("évaluation « invalide » deux fois : échec, rédacteur jamais appelé", async () => {
    const rediger = vi.fn();
    const r = await produireFeedback({ evaluer: async () => ({ ok: true, id: "e", status: "invalide" }), rediger });
    expect(r).toEqual({ ok: false });
    expect(rediger).not.toHaveBeenCalled();
  });
});
