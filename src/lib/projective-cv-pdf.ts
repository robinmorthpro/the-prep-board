/**
 * Export PDF du CV projectif (module 6, support SKEMA BS).
 * Les éléments projetés (futurs) sont écrits en rouge pour se distinguer du réel,
 * comme l'exige l'exercice.
 */
import { jsPDF } from "jspdf";
import type { ProjectiveCv } from "./vivaldi-queries";

const MARGIN = 44;
const NAVY = [20, 28, 51] as const;
const RED = [191, 46, 34] as const;
const GREY = [90, 90, 90] as const;

export function downloadProjectiveCvPdf(cv: ProjectiveCv) {
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
    opts: { size?: number; bold?: boolean; color?: readonly number[]; gap?: number; indent?: number } = {},
  ) {
    const { size = 10, bold = false, color = [40, 40, 40], gap = 5, indent = 0 } = opts;
    if (!text?.trim()) return;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0]!, color[1]!, color[2]!);
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    lines.forEach((line) => {
      ensure(size + 4);
      doc.text(line, MARGIN + indent, y);
      y += size + 2;
    });
    y += gap;
  }

  function section(title: string) {
    ensure(30);
    y += 6;
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y - 10, width - MARGIN, y - 10);
    write(title.toUpperCase(), { size: 10, bold: true, color: NAVY, gap: 4 });
  }

  // En-tête
  write(cv.full_name || "Nom Prénom", { size: 20, bold: true, color: NAVY, gap: 2 });
  write(cv.headline || "Poste occupé dans 10 ans", { size: 13, bold: true, color: RED, gap: 4 });
  write([cv.identity, cv.contact].filter((v) => v?.trim()).join(" · "), { size: 9, color: GREY, gap: 6 });

  if (cv.formation?.trim() || cv.formation_future?.trim()) {
    section("Formation");
    // Réel d'abord (bleu), puis projeté (rouge).
    cv.formation
      ?.split("\n")
      .filter((l) => l.trim())
      .forEach((line) => write(line.trim(), { size: 10, color: NAVY, gap: 2 }));
    cv.formation_future
      ?.split("\n")
      .filter((l) => l.trim())
      .forEach((line) => write(line.trim(), { size: 10, color: RED, gap: 2 }));
  }

  const experiences = cv.experiences.filter((e) => e.role?.trim() || e.company?.trim());
  if (experiences.length) {
    section("Parcours professionnel");
    // Réel d'abord, projeté ensuite (et en rouge).
    [...experiences.filter((e) => !e.future), ...experiences.filter((e) => e.future)].forEach((exp) => {
      const color = exp.future ? RED : NAVY;
      const head = [exp.period, exp.role].filter((v) => v?.trim()).join(" › ");
      write(head, { size: 10.5, bold: true, color, gap: 1 });
      write([exp.company, exp.place].filter((v) => v?.trim()).join(" - "), { size: 9.5, color: GREY, gap: 2 });
      exp.missions
        .split("\n")
        .filter((l) => l.trim())
        .forEach((line) => write(`• ${line.trim()}`, { size: 9.5, gap: 1, indent: 10, color: color }));
      y += 4;
    });
  }

  if (cv.languages?.trim() || cv.skills?.trim()) {
    section("Langues et compétences");
    write(cv.languages, { size: 9.5, gap: 2 });
    write(cv.skills, { size: 9.5, gap: 2 });
  }

  if (cv.associations?.trim()) {
    section("Vie associative");
    cv.associations
      .split("\n")
      .filter((l) => l.trim())
      .forEach((line) => write(`• ${line.trim()}`, { size: 9.5, gap: 1 }));
  }

  if (cv.extras?.trim()) {
    section("Informations complémentaires");
    cv.extras
      .split("\n")
      .filter((l) => l.trim())
      .forEach((line) => write(`• ${line.trim()}`, { size: 9.5, gap: 1 }));
  }

  ensure(20);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(GREY[0], GREY[1], GREY[2]);
  doc.text("En rouge : les éléments projetés. En bleu : les éléments réels.", MARGIN, height - 28);

  const name = (cv.full_name || "cv-projectif").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`cv-projectif-${name}.pdf`);
}
