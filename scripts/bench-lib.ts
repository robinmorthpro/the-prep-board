// Fonctions pures du banc d'essai 3.5 (testées dans src/lib/bench.test.ts).
import { createHash } from "node:crypto";
import { isRegieMessage, pickClosingVariant, type ClosingVariant } from "../src/lib/phase-engine";

export type Jury = "classique" | "classique_dur";
export type Profil = "excellent" | "bon" | "moyen" | "faible" | "passif";

export const CANDIDAT_WPM = 150;
export const CANDIDAT_MODELE = "anthropic/claude-sonnet-5";
export const MODELES_NOTATION = ["google/gemini-3.7-flash", "anthropic/claude-sonnet-5"] as const;

export const mots = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
/** Horloge virtuelle : durée d'une prise de parole du candidat. */
export const dureeParoleMs = (t: string, wpm = CANDIDAT_WPM) => (mots(t) / wpm) * 60_000;
export const motsPourSecondes = (s: number, wpm = CANDIDAT_WPM) => Math.round((s / 60) * wpm);

/** Profils par école (spécification, 4a). */
export const PROFIL_PAR_ECOLE: Record<string, Profil> = {
  ESSEC: "excellent",
  KEDGE: "excellent",
  "Montpellier BS": "excellent",
  "BSB (Burgundy School of Business)": "excellent",
  "IMT-BS": "excellent",
  ESCP: "bon",
  NEOMA: "bon",
  "TBS Education": "bon",
  "EM Strasbourg": "bon",
  "ESC Clermont BS": "bon",
  EDHEC: "moyen",
  "GEM (Grenoble EM)": "moyen",
  "Rennes School of Business": "moyen",
  "EM Normandie": "moyen",
  "INSEEC Grande École": "moyen",
  emlyon: "faible",
  "ICN Business School": "faible",
  "ISC Paris": "faible",
  "SCBS (South Champagne BS)": "faible",
  SKEMA: "passif",
  Audencia: "passif",
  "Excelia BS (La Rochelle)": "passif",
  "Brest Business School": "passif",
};

export type Scenario = {
  id: string;
  consigne: string;
  presentationS?: number;
  impactS?: number;
  stopMinute?: number;
  reponseS?: [number, number];
  /** Scénario volontaire : le candidat commence sa présentation dès l'accueil (D17). */
  commenceDesAccueil?: boolean;
};

export const SCENARIO_NORMAL: Scenario = { id: "normal", consigne: "" };

/** Les 13 cas limites (spécification, 4b). */
export const CAS_LIMITES: { ecole: string; jury: Jury; profil: Profil; graine: number; scenario: Scenario }[] = [
  { ecole: "TBS Education", jury: "classique", profil: "bon", graine: 1, scenario: { id: "interrompu", consigne: "", stopMinute: 10 } },
  { ecole: "ICN Business School", jury: "classique", profil: "moyen", graine: 1, scenario: { id: "refus", consigne: "Du début à la fin, tu refuses de te livrer : tu réponds « je ne sais pas », « rien de particulier », sans développer." } },
  { ecole: "Audencia", jury: "classique", profil: "faible", graine: 1, scenario: { id: "seche", consigne: "Tu sèches plusieurs fois (silence, « euh… je ne sais plus ») et tu te dévalorises (« je ne suis pas très intéressant »)." } },
  { ecole: "EDHEC", jury: "classique", profil: "bon", graine: 1, scenario: { id: "presentation-courte", consigne: "", presentationS: 150 } },
  { ecole: "GEM (Grenoble EM)", jury: "classique", profil: "bon", graine: 1, scenario: { id: "expose-court", consigne: "", presentationS: 180 } },
  { ecole: "EM Strasbourg", jury: "classique", profil: "bon", graine: 1, scenario: { id: "pitch-court", consigne: "", presentationS: 90 } },
  { ecole: "ESC Clermont BS", jury: "classique", profil: "bon", graine: 1, scenario: { id: "impact-court", consigne: "Sur la question Impact, tu réponds très brièvement, une ou deux phrases à chaque relance.", impactS: 20 } },
  { ecole: "Rennes School of Business", jury: "classique_dur", profil: "bon", graine: 1, scenario: { id: "conteste", consigne: "Tu contestes le jury, tu digresses, et tes réponses sont très longues.", reponseS: [190, 220] } },
  { ecole: "Excelia BS (La Rochelle)", jury: "classique", profil: "moyen", graine: 1, scenario: { id: "tres-court", consigne: "Tu réponds en une seule phrase. À deux moments de l'entretien, tu poses une question au jury.", reponseS: [5, 10] } },
  { ecole: "SCBS (South Champagne BS)", jury: "classique", profil: "passif", graine: 1, scenario: { id: "jamais-ecole-projet", consigne: "Tu n'amènes jamais de toi-même l'école ni ton projet professionnel." } },
  { ecole: "Brest Business School", jury: "classique_dur", profil: "bon", graine: 1, scenario: { id: "effleure", consigne: "Une seule fois, en passant, tu mentionnes une association de l'école sans la développer." } },
  { ecole: "ISC Paris", jury: "classique", profil: "bon", graine: 12, scenario: SCENARIO_NORMAL },
  { ecole: "ISC Paris", jury: "classique", profil: "bon", graine: 13, scenario: SCENARIO_NORMAL },
];

/** Essais éclair (corrections du tour 1). */
export const ECLAIRS: { ecole: string; jury: Jury; profil: Profil; graine: number; scenario: Scenario }[] = [
  {
    ecole: "GEM (Grenoble EM)",
    jury: "classique",
    profil: "bon",
    graine: 1,
    scenario: {
      id: "inversee-close-tot",
      consigne:
        "Pendant l'interview inversée, tu poses seulement deux questions au jury, puis tu dis : « Merci, j'ai fait le tour, ça répond à mes questions. »",
    },
  },
  {
    ecole: "EM Strasbourg",
    jury: "classique",
    profil: "bon",
    graine: 1,
    scenario: {
      id: "presentation-des-accueil",
      consigne:
        "Au premier message du jury (« Est-ce que c'est clair pour vous ? »), tu réponds oui puis tu enchaînes aussitôt sur ton pitch : la réussite dont tu es le plus fier, sans attendre qu'on te le demande.",
      commenceDesAccueil: true,
    },
  },
];

/** Durée de la présentation imposée (en secondes), par école (décision du fondateur). */
export const PRESENTATION_S: Record<string, number> = {
  ESSEC: 270,
  emlyon: 60,
  EDHEC: 240,
  "GEM (Grenoble EM)": 300,
  KEDGE: 180,
  "INSEEC Grande École": 300,
  "Montpellier BS": 90,
  "EM Strasbourg": 180,
  "ESC Clermont BS": 120,
};
/** Écoles à document : présentation de 2 min. */
export const PRESENTATION_DOCUMENT_S = 120;
/** Format classique (« Présentez-vous ») : 1 min 30 à 2 min. */
export const PRESENTATION_CLASSIQUE_S: [number, number] = [90, 120];

/** Fourchette (s) de la présentation : scénario « trop court » d'abord, puis école, puis document, puis classique. */
export function fourchettePresentation(ecole: string, aDocument: boolean, scenarioS?: number): [number, number] {
  const s = scenarioS ?? PRESENTATION_S[ecole] ?? (aDocument ? PRESENTATION_DOCUMENT_S : undefined);
  return s ? [s * 0.95, s * 1.05] : PRESENTATION_CLASSIQUE_S;
}

/** Réponse courte (10 à 30 s) à une question fermée ou factuelle. */
export const REPONSE_FERMEE_S: [number, number] = [10, 30];

/**
 * Question fermée ou factuelle : un chiffre, un nom, oui ou non, « citez-moi… ».
 * Texte déjà normalisé (normalizeInterviewText : minuscules, sans accents).
 * On regarde la dernière phrase interrogative du jury (à défaut, sa dernière phrase).
 */
export function estQuestionFermee(normalise: string): boolean {
  const toutes = normalise.split(/(?<=[?.!])\s+/).map((p) => p.trim()).filter(Boolean);
  const questions = toutes.filter((p) => p.includes("?"));
  const q = (questions[questions.length - 1] ?? toutes[toutes.length - 1] ?? "").trim();
  if (!q) return false;
  if (/\b(pourquoi|comment (avez|as|vous|tu|expliquez|feriez|ferais)|racontez|parlez|expliquez|decrivez|que pensez|qu'en pensez|en quoi|developpez)\b/.test(q)) return false;
  return /\b(combien|en quelle annee|depuis quand|a quelle date|quel age|quel (chiffre|nombre|pourcentage|montant)|citez|cite-moi|nommez|oui ou non|comment s'appelle|quel est (le|son|votre) nom|qui est (le|la)|dans quelle (ville|entreprise)|quelle est la capitale)\b/.test(q)
    || /^(est-ce que|avez-vous|etes-vous|connaissez-vous|savez-vous|aimez-vous|vous (avez|etes|connaissez)\b[^?]*\?$)/.test(q);
}

/** Montpellier BS : message envoyé au jury au clic sur une situation (recopie partie-8). */
export const montpellierChoixMessage = (texte: string) =>
  `Le candidat vient de choisir à l'écran la situation suivante à développer : "${texte}". Attends qu'il commence à raconter, puis creuse normalement (concret, recul) sur cette situation précise.`;

/** Entrée du journal de l'entretien (horloge simulée). */
export type EntreeJournal = {
  t: string;
  type: "jury" | "regie" | "contexte";
  texte: string;
  /** Messages du jury : repondu, fusionne (suivi d'un autre avant la réponse), sans_reponse, filtre (vide ou régie). */
  statut?: "repondu" | "fusionne" | "sans_reponse" | "filtre";
};

/** Clé de reprise : la même d'une exécution à l'autre. */
export const cleReprise = (r: { lot: string; ecole: string; jury: Jury; scenario: string; graine: number }) =>
  `${r.lot}|${r.ecole}|${r.jury}|${r.scenario}|${r.graine}`;

/** Ce que voit le candidat : jamais une consigne de régie. */
export function pourCandidat(juryText: string): string | null {
  const t = juryText.trim();
  if (!t || isRegieMessage(t) || t.includes("[RÉGIE")) return null;
  return t;
}

/** Générateur déterministe (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function withSeed<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  Math.random = seeded(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

export function graineEcole(ecole: string, n: number) {
  let h = 2166136261;
  for (const c of `${ecole}#${n}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// ---------------------------------------------------------------- recopies
/**
 * Blocs recopiés de src/routes/_app.partie-8.tsx (non exportés là-bas).
 * Chaque bloc est repéré par une ligne de début et une ligne de fin ; son
 * empreinte doit rester celle-ci, sinon le test échoue et le banc est à revoir.
 */
export const RECOPIES: { nom: string; debut: string; fin: string; sha256: string }[] = [
  { nom: "variables du jury (agent.start)", debut: "        dynamicVariables: {", fin: "          ...clermontVariables,", sha256: "9626236e957b10a4d6b93eb2c86d3c9ee0c2e5fb7dacf09a3589a731d37ab9fa" },
  { nom: "Clermont : vérification et secours de la question Impact", debut: "    if (config.school === \"ESC Clermont BS\" && !clermontRescueDoneRef.current && juryMessageCountRef.current > 1) {", fin: "    // emlyon — secours : le tirage des cartes n'a pas été annoncé.", sha256: "125a6dff0a5a72a50215abef9a61c36c25597e5e5d97e0d869c5f310d1645b79" },
  { nom: "Clermont : axe repéré dans la réponse du candidat", debut: "    if (config.school === \"ESC Clermont BS\" && clermontAxisOfferedRef.current && !clermontAxisSentRef.current) {", fin: "    // emlyon : l'épreuve des 4 cartes est lancée par l'application dès la fin", sha256: "522cdb855f70266684b7465729c2b2cfb199860e56a14b9a5c4d9d604e6b36b2" },
  { nom: "detectImpactAxis", debut: "  function detectImpactAxis(t: string, loose = false): ImpactAxis | null {", fin: "   * Démarrage de l'entretien, déclenché depuis le popup de structure.", sha256: "67d521c789060cc666ce2942d5b5b07f3b20621bb83aa090675c48bf9c29d225" },
  { nom: "emlyon : armement des cartes", debut: "      const alreadyPresented = nextTurns.length === 1", fin: "  /** emlyon : 5 s de silence complet après la fin de la prise de parole, puis tirage. */", sha256: "a" },
  { nom: "emlyon : consigne du tirage des cartes", debut: "  function triggerEmlyonCards() {", fin: "  const agent = useJuryAgent({", sha256: "301b3a155b5cc3c1922f000c3a9c688ab534f3658e6df79eb0569d987e81ea20" },
  { nom: "clôture et secours « main rendue »", debut: "    if (juryMessageCountRef.current > 1 && EXIT_SENTENCE_RE.test(normalized)) {", fin: "  /** Le candidat vient de finir sa prise de parole : le fil est complété. */", sha256: "6a459f4accee3a222111bdd611774dd265d1ada7cf162a4a4399a4506330305a" },
  { nom: "Montpellier : message au clic sur une situation", debut: "                            agent.notifyContext(", fin: "                          }}", sha256: "94f8bb4c70daaf769158be001a897f80721be81ee8895e09ca4be273b23779bc" },
  { nom: "EDHEC : fin de la présentation", debut: "    if (juryMessageCountRef.current > 1 && /nous passons maintenant a l'entretien individuel/.test(normalized)) {", fin: "    if (juryMessageCountRef.current > 1 && /nous avons termine avec les (4|quatre) cartes/.test(normalized)) setCardsStage(\"after\");", sha256: "711e148e40006b04badb2228d954692a842656e0a9999c1aef430a064caeda8f" },
];

export function extraireBloc(source: string, debut: string, fin: string): string | null {
  const i = source.indexOf(debut);
  if (i < 0) return null;
  const j = source.indexOf(fin, i + debut.length);
  if (j < 0) return null;
  return source.slice(i, j);
}

export const sha256 = (t: string) => createHash("sha256").update(t).digest("hex");

// ---------------------------------------------------------------- coûts
/** Tarifs publics en dollars par million de jetons (hypothèse de calcul, à jour au 09/10/2026). */
export const TARIFS: Record<string, { entree: number; sortie: number }> = {
  "google/gemini-3.7-flash": { entree: 0.3, sortie: 2.5 },
  "anthropic/claude-sonnet-5": { entree: 3, sortie: 15 },
};

/** `sortie` inclut la réflexion ; `reflexion` en est la part (Claude : thinking_tokens, Gemini : reasoning_tokens). */
export type Jetons = { entree: number; sortie: number; appels: number; reflexion?: number };
export const coutJetons = (modele: string, j: Jetons) => {
  const t = TARIFS[modele];
  return t ? (j.entree * t.entree + j.sortie * t.sortie) / 1_000_000 : null;
};

/** R11 : question de clôture tirée avec un générateur séparé, dérivé de la graine. */
export function tirerClotureBanc(graine: number): ClosingVariant {
  const sel = [..."cloture"].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return pickClosingVariant(seeded((graine ^ sel) >>> 0));
}

/** D17 : règle d'ouverture du candidat simulé. */
export function regleOuvertureCandidat(scenario: Scenario, article: string | null | undefined): string {
  return `${
    scenario.commenceDesAccueil
      ? ""
      : "\n- Tu attends que le jury t'invite à te présenter avant de le faire : à « Est-ce que c'est clair pour vous ? », tu réponds seulement que c'est clair."
  }${article ? `\n- Tu commences l'entretien en présentant l'article de presse que tu as choisi : « ${article} ».` : ""}`;
}

/** Rédacteur de l'application (R12). */
export const REDACTEUR_APP = "anthropic/claude-sonnet-5";

/** R12 : rédacteur selon le plan et l'option `--redacteur=<modèle>|aucun`. */
export function redacteurPourPlan(plan: string, option: string | undefined): string | null {
  if (option === "aucun") return null;
  if (option) return option;
  return plan === "renoter" ? null : REDACTEUR_APP;
}

/** R12 : `--feedback-sur=id1,id2` → ensemble d'identifiants, ou null (tous). */
export function feedbackSurListe(option: string | undefined): Set<string> | null {
  const ids = (option ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return ids.length ? new Set(ids) : null;
}

/** D18 : la renotation écrit toujours un essai distinct ; l'essai 1 n'est jamais écrasé. */
export function essaiRenotation(option: string | undefined): number {
  const n = Number(option ?? "2");
  if (!Number.isInteger(n) || n < 2) throw new Error("Renotation : l'essai 1 (tour 1) ne peut pas être écrasé ; utilisez --essai=2 ou plus.");
  return n;
}
