import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import juryCommunRaw from "./textes/jury-commun.md?raw";
import { commonJuryText } from "../elevenlabs-agent-prompt";
import { JURY_SCHOOL_TEXTS } from "./school-texts";
import { getSchoolInterviewConfig, openingNote, secondReplyFor } from "../school-interviews";

const reference = readFileSync(new URL("./textes/jury-ecoles-final.md", import.meta.url), "utf8");
const HEADINGS = ["PREMIER MESSAGE", "DEUXIÈME RÉPLIQUE", "CONSIGNE D'OUVERTURE", "CONDUITE PROPRE À L'ÉCOLE", "CONSIGNES ENVOYÉES PENDANT L'ENTRETIEN"] as const;

function sections() {
  const starts = [...reference.matchAll(/^# ÉCOLE : (.+)$/gm)];
  return Object.fromEntries(starts.map((match, index) => {
    const school = match[1]!;
    const body = reference.slice(match.index! + match[0].length, starts[index + 1]?.index ?? reference.length);
    const entries = HEADINGS.map((heading) => {
      const headingRe = new RegExp(`^#{0,2} ?${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
      const found = headingRe.exec(body);
      if (!found) return [heading, ""];
      const tail = body.slice(found.index + found[0].length);
      const next = HEADINGS.map((item) => new RegExp(`^#{0,2} ?${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").exec(tail)?.index)
        .filter((position): position is number => position !== undefined);
      return [heading, tail.slice(0, next.length ? Math.min(...next) : undefined)
        .replace(/^Réglage du code[^\n]*\n?/gm, "")
        .replace(/^Moment :[^\n]*\n?/gm, "")
        // GEM : forme du texte de {{gem_persona}} (construit par gem-kb.ts), traitée comme un réglage du code.
        .replace(/^Tu t'appelles \$\{p\.prenom\}[^\n]*\n?/gm, "")
        .replace(/^Fil rouge si le candidat creuse \(ne jamais amener spontanément\) : \$\{p\.filRouge\}\n?/gm, "")
        .trim().replace(/---$/, "").trimEnd()];
    });
    return [school, Object.fromEntries(entries)];
  }));
}

const expected = sections() as Record<string, Record<(typeof HEADINGS)[number], string>>;
describe("références officielles du jury — étape 3", () => {
  it("conserve le fichier commun octet pour octet et exclut seulement sa régie finale", async () => {
    expect(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(juryCommunRaw)).then((b) => Buffer.from(b).toString("hex"))).toBe("6852bfedda9ac4bc4c4054f4d6ede1986048d1c4826ff7cf74801cb5fa176b7c");
    expect(juryCommunRaw).toBe(`${commonJuryText()}\n---\n\nMESSAGE ENVOYÉ PAR L'APPLICATION À LA MOITIÉ DE L'ÉCHANGE LIBRE (consigne de régie)\n${juryCommunRaw.split("MESSAGE ENVOYÉ PAR L'APPLICATION À LA MOITIÉ DE L'ÉCHANGE LIBRE (consigne de régie)\n")[1]}`);
  });

  it("conserve la référence des 15 écoles octet pour octet", async () => {
    expect(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(reference)).then((b) => Buffer.from(b).toString("hex"))).toBe("e0e5c7d8da19fe9688ee5b0e7ef4a986067924bd9a6bc769bfb86dd8f454a9f5");
    expect(Object.keys(expected)).toHaveLength(15);
  });

  it.each(Object.keys(JURY_SCHOOL_TEXTS))("envoie les textes exacts pour %s", (school) => {
    const config = getSchoolInterviewConfig(school);
    const text = JURY_SCHOOL_TEXTS[school]!;
    expect(text.secondReply).toBe(expected[school]!["DEUXIÈME RÉPLIQUE"]);
    const conductPrefix = "CONDUITE PROPRE À L'ÉCOLE (elle prime sur la trame générique)\n";
    expect(text.conduct).toBe(expected[school]!["CONDUITE PROPRE À L'ÉCOLE"].replace(conductPrefix, ""));
    expect(secondReplyFor(config) ?? "").toBe(text.secondReply);
    expect(openingNote(config)).toBe(text.opening.replaceAll("${second}", text.secondReply));
  });
});
