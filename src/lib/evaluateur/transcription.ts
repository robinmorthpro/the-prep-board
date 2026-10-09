export type TourEnregistre = { question?: string; answer?: string; askedAt?: string; answeredAt?: string };

export type Replique = { role: "Jury" | "Candidat"; at: number | null; texte: string };

const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Répliques dans l'ordre, horodatées depuis la première. */
export function repliques(turns: TourEnregistre[]): Replique[] {
  const out: Replique[] = [];
  for (const t of turns) {
    if ((t.question ?? "").trim()) out.push({ role: "Jury", at: t.askedAt ? Date.parse(t.askedAt) : null, texte: t.question!.trim() });
    if ((t.answer ?? "").trim()) out.push({ role: "Candidat", at: t.answeredAt ? Date.parse(t.answeredAt) : null, texte: t.answer!.trim() });
  }
  return out;
}

/** « mm:ss Jury : … » / « mm:ss Candidat : … », mm:ss depuis le début. */
export function transcriptionHorodatee(turns: TourEnregistre[]): string {
  const list = repliques(turns);
  const debut = list.map((r) => r.at).find((x): x is number => x !== null && Number.isFinite(x)) ?? null;
  return list
    .map((r) => {
      const stamp = debut !== null && r.at !== null && Number.isFinite(r.at) ? `${mmss(r.at - debut)} ` : "";
      return `${stamp}${r.role} : ${r.texte}`;
    })
    .join("\n");
}
