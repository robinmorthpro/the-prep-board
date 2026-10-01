/**
 * Export PDF d'une fiche école (module 3) : informations générales puis
 * éléments spécifiques au projet professionnel, avec un rendu structuré.
 */
import { jsPDF } from "jspdf";
import type { SchoolSheet } from "./vivaldi-queries";
import { schoolLogo } from "./school-logos";

/** Charge le logo CDN en dataURL pour l'intégrer au PDF (silencieux si indisponible). */
async function loadLogo(school: string): Promise<string | null> {
  const url = schoolLogo(school);
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("logo"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const MARGIN = 48;
const NAVY = [23, 42, 71] as const;
const GOLD = [161, 122, 47] as const;

export async function downloadSchoolSheetPdf(sheet: SchoolSheet) {
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

  const logo = await loadLogo(sheet.school);
  if (logo) {
    try {
      const props = doc.getImageProperties(logo);
      const h = 40;
      const w = Math.min(120, (props.width / props.height) * h);
      doc.addImage(logo, "PNG", width - MARGIN - w, MARGIN - 8, w, h);
    } catch {
      /* logo optionnel */
    }
  }

  write("The Prepboard - Fiche école", { size: 11, bold: true, color: GOLD, gap: 2 });
  write(sheet.school, { size: 20, bold: true, color: NAVY, gap: 4 });
  write(
    `Généré le ${new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}`,
    { size: 9, color: [120, 120, 120], gap: 16 },
  );

  write("Informations générales", { size: 13, bold: true, color: GOLD, gap: 8 });
  field("Baseline / slogan", sheet.baseline);
  field("Année de création", sheet.founded_year);
  field("Direction", sheet.director);
  field("Campus", sheet.campuses);
  field("Autres éléments que je juge importants", sheet.generic_other);

  ensure(30);
  write("Éléments spécifiques à mon projet professionnel", { size: 13, bold: true, color: GOLD, gap: 8 });
  const items = sheet.items ?? [];
  if (!items.length) {
    write("Aucun élément renseigné.", { size: 10, color: [120, 120, 120] });
  }
  items.forEach((item, i) => {
    ensure(60);
    write(`${i + 1}. ${item.kind}${item.name?.trim() ? ` - ${item.name.trim()}` : ""}`, {
      size: 11,
      bold: true,
      color: NAVY,
      gap: 4,
    });
    field("Description et informations", item.description);
    field("URL de référence", item.url);
    field("Pourquoi cela m'intéresse", item.why);
    y += 4;
  });

  const slug = sheet.school.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`vivaldi-fiche-${slug || "ecole"}.pdf`);
}
