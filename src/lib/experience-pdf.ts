/**
 * Export PDF d'une fiche expérience (module 4) : informations générales
 * puis anecdotes, avec le même rendu que la fiche école.
 */
import { jsPDF } from "jspdf";
import type { Experience } from "./vivaldi-queries";

const MARGIN = 48;
const NAVY = [23, 42, 71] as const;
const GOLD = [161, 122, 47] as const;

function formatMonth(value: string) {
  if (!value?.trim()) return "en cours";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function downloadExperiencePdf(exp: Experience) {
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

  function write(
    text: string,
    opts: { size?: number; bold?: boolean; color?: readonly number[]; gap?: number } = {},
  ) {
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

  function field(label: string, value: string) {
    if (!value?.trim()) return;
    write(label, { size: 9, bold: true, color: NAVY, gap: 1 });
    write(value.trim(), { size: 10, gap: 8 });
  }

  const name = exp.name?.trim() || "Expérience";

  write("The Prepboard - Fiche expérience", { size: 11, bold: true, color: GOLD, gap: 2 });
  write(name, { size: 20, bold: true, color: NAVY, gap: 4 });
  write(
    `${exp.category} · ${formatMonth(exp.start_date)} → ${formatMonth(exp.end_date)}`,
    { size: 9, color: [120, 120, 120], gap: 2 },
  );
  write(
    `Généré le ${new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}`,
    { size: 9, color: [120, 120, 120], gap: 16 },
  );

  write("Informations générales", { size: 13, bold: true, color: GOLD, gap: 8 });
  field("Contexte de l'expérience", exp.context);
  field("Titre du récit", exp.story_title);
  field("Récit de l'expérience", exp.story);

  ensure(30);
  write("Anecdotes", { size: 13, bold: true, color: GOLD, gap: 8 });
  const anecdotes = exp.anecdotes ?? [];
  if (!anecdotes.length) {
    write("Aucune anecdote renseignée.", { size: 10, color: [120, 120, 120] });
  }
  anecdotes.forEach((a, i) => {
    ensure(60);
    write(`${i + 1}. ${a.title?.trim() || "Anecdote sans titre"}`, {
      size: 11,
      bold: true,
      color: NAVY,
      gap: 4,
    });
    field("Ce que j'ai fait concrètement", a.detail);
    field("Ce que j'en retire", a.learning);
    field("Lien avec mon projet professionnel", a.link);
    y += 4;
  });

  if (exp.ai_feedback?.trim()) {
    ensure(40);
    write("Retour du jury IA", { size: 13, bold: true, color: GOLD, gap: 8 });
    write(exp.ai_feedback.replace(/[#*`>]/g, "").trim(), { size: 10 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`vivaldi-experience-${slug || "fiche"}.pdf`);
}
