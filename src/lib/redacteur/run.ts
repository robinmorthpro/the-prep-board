// Rédaction du feedback à partir d'une évaluation « ok ». Serveur uniquement.
import { BAREME } from "../evaluateur/bareme";
import { callEvaluator, createRunIdFetch, type Message } from "../evaluateur/gateway";
import { repliques, transcriptionHorodatee, type TourEnregistre } from "../evaluateur/transcription";
import type { PenaliteAppliquee } from "../evaluateur/calcul";
import { systemPromptRedacteur } from "./textes";
import { blocTirages } from "../tirages";
import { controlerClassement, controlerTexte, filtrerVerbatims, insererPercentile, motsInternes } from "./texte";

/** Modèle du rédacteur (D16) ; l'évaluateur reste sur DEFAULT_EVAL_MODEL. */
export const DEFAULT_REDACTEUR_MODEL = "anthropic/claude-sonnet-5";

/** D23 : le rédacteur ne reçoit jamais les pénalités écrites par l'évaluateur. */
export function sortieSansPenalites(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const { penalites: _penalites, ...reste } = raw as Record<string, unknown>;
  return reste;
}

export type SessionPourRedaction = {
  id: string;
  school: string;
  difficulty: string | null;
  turns: unknown;
  support_label: string | null;
  support_text: string | null;
  inseec_image: string | null;
  tirages?: unknown;
};

export type EvaluationPourRedaction = {
  id: string;
  grille: string;
  status: string;
  raw_output: unknown;
  case_points: unknown;
  unrated_criteria: string[] | null;
  penalties: unknown;
  interrupted: boolean;
  percentile: number | null;
};

export function juryJoue(difficulty: string | null | undefined): string {
  return difficulty === "classique_dur" ? "Jury dur" : "Jury neutre";
}

const mmss = (s: number) => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")} s`;

/** Bloc « ce que le code a calculé ». */
export function blocCalcule(ev: EvaluationPourRedaction): string {
  const grille = BAREME.grilles[ev.grille];
  const lignes: string[] = ["CE QUE LE CODE A CALCULÉ"];
  lignes.push(`Percentile : ${ev.interrupted || ev.percentile === null ? "aucun (entretien interrompu)" : `P${ev.percentile}`}`);
  const appliquees = ev.interrupted
    ? []
    : (((ev.penalties as { appliquees?: PenaliteAppliquee[] } | null)?.appliquees ?? []) as PenaliteAppliquee[]);
  lignes.push("Pénalités de durée retenues :");
  if (!appliquees.length) lignes.push("- aucune");
  for (const p of appliquees) {
    lignes.push(`- ${p.partie} : ${p.type === "trop_court" ? "trop courte" : "trop longue"}, durée mesurée ${mmss(p.duree_mesuree_s)}, seuil ${mmss(p.seuil_s)}`);
  }
  const nonNotes = ev.unrated_criteria ?? [];
  const nomCritere = (k: string) => grille?.criteres.find((c) => c.cle === k)?.nom ?? k;
  lignes.push(`Critères non notés : ${nonNotes.length ? nonNotes.map(nomCritere).join(", ") : "aucun"}`);
  lignes.push("Cases évaluées, classées par points perdus (de la plus coûteuse à la moins coûteuse) :");
  const pts = (ev.case_points ?? {}) as Record<string, Record<string, number | null>>;
  const cases: { critere: string; case: string; perdus: number; ordre: number }[] = [];
  let ordre = 0;
  for (const c of grille?.criteres ?? []) {
    for (const x of c.cases) {
      ordre++;
      const obtenu = pts[c.cle]?.[x.cle];
      if (obtenu === null || obtenu === undefined) continue;
      const max = Math.max(...Object.values(x.points));
      cases.push({ critere: c.nom, case: x.nom, perdus: Math.round((max - obtenu) * 100) / 100, ordre });
    }
  }
  cases.sort((a, b) => b.perdus - a.perdus || a.ordre - b.ordre);
  for (const c of cases) lignes.push(`- ${c.critere} / ${c.case} : ${String(c.perdus).replace(".", ",")} point(s) perdu(s)`);
  return lignes.join("\n");
}

export function userMessageRedacteur(session: SessionPourRedaction, ev: EvaluationPourRedaction, contexte: string): string {
  const parts = [
    `École : ${session.school}`,
    `Jury joué : ${juryJoue(session.difficulty)}`,
    `Entretien interrompu : ${ev.interrupted ? "oui" : "non"}`,
    "",
    "SORTIE DE L'ÉVALUATEUR (JSON) :",
    JSON.stringify(sortieSansPenalites(ev.raw_output), null, 2),
    "",
    blocCalcule(ev),
    "",
    contexte,
    "",
    "TRANSCRIPTION :",
    transcriptionHorodatee((session.turns ?? []) as TourEnregistre[]),
  ];
  const tires = blocTirages(session.tirages);
  if (tires) parts.push("", tires);
  if ((session.support_text ?? "").trim()) {
    parts.push("", `CONTENU DU SUPPORT (${session.support_label ?? ""}), transcrit fidèlement :`, session.support_text!.trim());
  }
  return parts.join("\n");
}

export type ResultatRedaction = {
  debrief: string;
  percentile: number | null;
  attempts: number;
  citations_retirees: string[];
  /** D13 : mots internes restés après la nouvelle demande. */
  alertes: string[];
  model: string;
  duration_ms: number;
};

export async function redigerFeedbackSession(
  session: SessionPourRedaction,
  ev: EvaluationPourRedaction,
  contexte: string,
  opts: { model?: string | undefined } = {},
): Promise<ResultatRedaction> {
  if (ev.status !== "ok") throw new Error("Évaluation non valide : pas de rédaction.");
  const started = Date.now();
  const model = opts.model?.trim() || DEFAULT_REDACTEUR_MODEL;
  const hasSupport = Boolean((session.support_text ?? "").trim());
  const system = systemPromptRedacteur({
    school: session.school,
    supportLabel: session.support_label,
    hasSupport,
    inseecImage: session.inseec_image,
  });
  const messages: Message[] = [{ role: "user", content: userMessageRedacteur(session, ev, contexte) }];
  const f = createRunIdFetch();
  let attempts = 0;
  for (let i = 0; i < 2; i++) {
    attempts++;
    const brut = (await callEvaluator(f, model, system, messages, undefined, { json: false })).trim();
    const percentileRecu = ev.interrupted ? null : ev.percentile;
    const mots = motsInternes(brut);
    const bloquantes = [...controlerTexte(brut), ...controlerClassement(brut, percentileRecu, ev.interrupted)];
    const erreurs = [
      ...bloquantes,
      ...(mots.length ? [`Le texte emploie du vocabulaire interne interdit : ${mots.join(", ")}. Reformule sans ces mots.`] : []),
    ];
    // Après la nouvelle demande, des mots internes seuls ne bloquent plus : alerte enregistrée.
    if (!erreurs.length || (i === 1 && !bloquantes.length)) {
      if (mots.length) console.warn(`Rédacteur : vocabulaire interne restant (alerte)`, mots);
      const liste = repliques((session.turns ?? []) as TourEnregistre[]);
      const transcription = liste.map((r) => r.texte).join("\n");
      const parRole = {
        candidat: liste.filter((r) => r.role === "Candidat").map((r) => r.texte).join("\n"),
        jury: liste.filter((r) => r.role === "Jury").map((r) => r.texte).join("\n"),
      };
      const { text, retirees } = filtrerVerbatims(brut, transcription, session.support_text ?? "", parRole);
      if (retirees.length) console.warn(`Rédacteur : ${retirees.length} citation(s) retirée(s)`, retirees);
      const percentile = ev.interrupted ? null : ev.percentile;
      return {
        debrief: insererPercentile(text, percentile, ev.interrupted),
        percentile,
        attempts,
        citations_retirees: retirees,
        alertes: mots,
        model,
        duration_ms: Date.now() - started,
      };
    }
    if (i === 0) {
      messages.push(
        { role: "assistant", content: brut },
        { role: "user", content: `Ton texte contient des erreurs. Corrige-les et rends de nouveau le feedback complet :\n- ${erreurs.join("\n- ")}` },
      );
    } else {
      throw new Error(`Rédacteur : texte non conforme après 2 appels (${erreurs.join(" ")})`);
    }
  }
  throw new Error("Rédacteur : échec.");
}
