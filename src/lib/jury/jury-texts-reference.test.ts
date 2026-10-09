import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import juryCommunRaw from "./textes/jury-commun.md?raw";
import { commonJuryText } from "../elevenlabs-agent-prompt";
import { JURY_SCHOOL_TEXTS } from "./school-texts";
import { buildFirstMessage, getSchoolInterviewConfig, openingNote, schoolDisplayName, secondReplyFor, simulatedMinutes } from "../school-interviews";

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
        .trim().replace(/---$/, "").trimEnd()];
    });
    return [school, Object.fromEntries(entries)];
  }));
}

const expected = sections() as Record<string, Record<(typeof HEADINGS)[number], string>>;
const renderTemplate = (text: string, school: string) => text
  .replaceAll("${welcome}", `Bonjour Robin, et bienvenue à l'entretien ${schoolDisplayName(school).preposition}.`)
  .replaceAll("${hello}", "Bonjour Robin.")
  .replaceAll("${minutes}", String(simulatedMinutes(getSchoolInterviewConfig(school))))
  .replaceAll("${support}", "document")
  .replaceAll("${article}", "Article test")
  .replaceAll("${edhec_mot}", "audace")
  .replaceAll("${inseec_image}", "Image test");

describe("références officielles du jury — étape 3", () => {
  it("conserve le fichier commun octet pour octet et exclut seulement sa régie finale", async () => {
    expect(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(juryCommunRaw)).then((b) => Buffer.from(b).toString("hex"))).toBe("66c80177b87ae57678c516ed9a7ed8ccceb0ce2cd0582d2fe7907e1264c715d7");
    expect(juryCommunRaw).toBe(`${commonJuryText()}\n---\n\nRAPPEL ENVOYÉ PAR L'APPLICATION AUX DEUX TIERS (consigne de régie)\n${juryCommunRaw.split("RAPPEL ENVOYÉ PAR L'APPLICATION AUX DEUX TIERS (consigne de régie)\n")[1]}`);
  });

  it("conserve la référence des 15 écoles octet pour octet", async () => {
    expect(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(reference)).then((b) => Buffer.from(b).toString("hex"))).toBe("4111cab825f9326463468a7d3b930931c443fcb08a66aa8a9338ee863d4d94c6");
    expect(Object.keys(expected)).toHaveLength(15);
  });

  it.each(Object.keys(JURY_SCHOOL_TEXTS))("envoie les quatre textes exacts pour %s", (school) => {
    const config = getSchoolInterviewConfig(school);
    const text = JURY_SCHOOL_TEXTS[school]!;
    expect(text.firstMessage).toBe(expected[school]!["PREMIER MESSAGE"]);
    expect(text.secondReply).toBe(expected[school]!["DEUXIÈME RÉPLIQUE"]);
    const conductPrefix = "CONDUITE PROPRE À L'ÉCOLE (elle prime sur la trame générique)\n";
    expect(text.conduct).toBe(expected[school]!["CONDUITE PROPRE À L'ÉCOLE"].replace(conductPrefix, ""));
    expect(buildFirstMessage(config, { firstName: "Robin", articleTitle: "Article test", edhecWord: "audace", inseecImage: "Image test" }))
      .toBe(renderTemplate(text.firstMessage, school));
    expect(secondReplyFor(config) ?? "").toBe(text.secondReply);
    expect(openingNote(config)).toBe(text.opening.replaceAll("${second}", text.secondReply));
  });
});
