import { describe, expect, it, vi } from "vitest";
import { controlerTexte, filtrerVerbatims, insererPercentile, LIGNE_INTERROMPU } from "./texte";
import { blocFileForSchool } from "./textes";
import { produireFeedback } from "../feedback-enchainement";

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
