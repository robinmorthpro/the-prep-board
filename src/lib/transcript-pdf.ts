/**
 * Export PDF du transcript d'un entretien (module 7).
 * Le PDF contient l'en-tête (école, format, difficulté, date, durée), le fil
 * complet horodaté des échanges jury / candidat, puis le débrief du jury.
 */
import { jsPDF } from "jspdf";
import type { InterviewTurn } from "./vivaldi-queries";

export type TranscriptPdfInput = {
  school: string;
  formatLabel: string;
  difficultyLabel?: string | undefined;
  createdAt: string;
  turns: InterviewTurn[];
  debrief?: string | undefined;
  complete?: boolean | undefined;
};

const MARGIN = 48;
const NAVY = [23, 42, 71] as const;
const GOLD = [161, 122, 47] as const;

function clockAt(iso?: string, startIso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (startIso) {
    const start = new Date(startIso).getTime();
    if (!Number.isNaN(start)) {
      const s = Math.max(0, Math.round((d.getTime() - start) / 1000));
      return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    }
  }
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Nettoie les marqueurs markdown du débrief pour un rendu papier lisible. */
export function plain(text: string) {
  return text
    .replace(/^(\s*)\**VERBATIMS?\**\s*:\s*/gim, "$1Verbatims : ")
    .replace(/^(\s*)\**FEEDBACK\**\s*:\s*/gim, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/^\s*[-•]\s*/gm, "- ")
    .trim();
}

export function downloadInterviewPdf(input: TranscriptPdfInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const maxWidth = width - MARGIN * 2;
  let y = MARGIN;

  function ensure(space: number) {
    if (y + space > height - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function write(text: string, opts: { size?: number; bold?: boolean; color?: readonly number[]; gap?: number } = {}) {
    const { size = 10, bold = false, color = [40, 40, 40], gap = 6 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0]!, color[1]!, color[2]!);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, MARGIN, y);
      y += size + 4;
    }
    y += gap;
  }

  const startIso = input.turns[0]?.askedAt ?? input.createdAt;

  write("The Prepboard - Transcript d'entretien", { size: 18, bold: true, color: NAVY, gap: 4 });
  write(
    [
      `École : ${input.school || "non précisée"}`,
      `Format : ${input.formatLabel}`,
      input.difficultyLabel ? `Difficulté : ${input.difficultyLabel}` : "",
      `Date : ${new Date(input.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`,
      `Échanges : ${input.turns.length}`,
      input.complete === false ? "Entretien interrompu avant la clôture : évaluation incomplète." : "",
    ]
      .filter(Boolean)
      .join("\n"),
    { size: 10, color: [90, 90, 90], gap: 14 },
  );

  write("Fil de l'entretien", { size: 13, bold: true, color: GOLD, gap: 8 });
  if (!input.turns.length) write("Aucun échange enregistré.", { color: [120, 120, 120] });
  input.turns.forEach((t, i) => {
    const stamp = clockAt(t.askedAt, startIso);
    write(`${i + 1}. Jury${stamp ? ` - ${stamp}` : ""}`, { size: 10, bold: true, color: NAVY, gap: 2 });
    write(t.question || "(question non enregistrée)", { size: 10, gap: 4 });
    const aStamp = clockAt(t.answeredAt, startIso);
    write(`Candidat${aStamp ? ` - ${aStamp}` : ""}`, { size: 10, bold: true, color: GOLD, gap: 2 });
    write(t.answer || "(pas de réponse)", { size: 10, gap: 10 });
  });

  if (input.debrief?.trim()) {
    ensure(40);
    write("Débrief du jury", { size: 13, bold: true, color: GOLD, gap: 8 });
    write(plain(input.debrief), { size: 10, gap: 4 });
  }

  const slug = (input.school || "entretien").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const date = new Date(input.createdAt).toISOString().slice(0, 10);
  doc.save(`vivaldi-entretien-${slug || "entretien"}-${date}.pdf`);
}
