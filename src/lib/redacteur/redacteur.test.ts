import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
  it("adapte les libellés de l'export PDF pour les deux formats", () => {
    expect(plain("VERBATIMS: Une citation\nFEEDBACK:\n- Une remarque")).toBe("Verbatims : Une citation\n- Une remarque");
  });
  it("conserve l'empreinte exacte du texte commun du rédacteur", () => {
    const file = new URL("./textes/redacteur-commun.md", import.meta.url);
    const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
    expect(hash).toBe("dc65a76ee5992166c5bbc0b609272ed6dad8a239ec586540f391c6f9edfb6417");
  });
});

describe("enchaînement et secours", () => {
  const ancien = vi.fn(async () => ({ debrief: "## Ce que ce classement signifie\nP42 - vous faites mieux que 42 % des candidats (± 5 percentiles)." }));
  it("évaluation « invalide » : ancien debrief, source « ancien »", async () => {
    const rediger = vi.fn();
    const r = await produireFeedback({ actif: true, evaluer: async () => ({ ok: true, id: "e", status: "invalide" }), rediger, ancien });
    expect(r.source).toBe("ancien");
    expect(r.percentile).toBe(42);
    expect(rediger).not.toHaveBeenCalled();
  });
  it("évaluation en échec : ancien debrief", async () => {
    const r = await produireFeedback({ actif: true, evaluer: async () => { throw new Error("x"); }, rediger: vi.fn(), ancien });
    expect(r.source).toBe("ancien");
  });
  it("rédacteur en échec : ancien debrief", async () => {
    const r = await produireFeedback({ actif: true, evaluer: async () => ({ ok: true, id: "e", status: "ok" }), rediger: async () => { throw new Error("x"); }, ancien });
    expect(r.source).toBe("ancien");
  });
  it("tout va bien : nouveau feedback", async () => {
    const r = await produireFeedback({ actif: true, evaluer: async () => ({ ok: true, id: "e", status: "ok" }), rediger: async () => ({ debrief: "texte", percentile: 67 }), ancien });
    expect(r).toEqual({ debrief: "texte", percentile: 67, source: "nouveau", evaluationId: "e" });
  });
  it("interrupteur coupé : ancien debrief sans évaluation", async () => {
    const evaluer = vi.fn();
    const r = await produireFeedback({ actif: false, evaluer, rediger: vi.fn(), ancien });
    expect(r.source).toBe("ancien");
    expect(evaluer).not.toHaveBeenCalled();
  });
});
