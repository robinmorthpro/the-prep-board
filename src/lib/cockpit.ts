/**
 * Cockpit de progression (« Mon tableau de bord »).
 *
 * Deux briques :
 *  - un radar de 5 thèmes d'entretien, alimenté uniquement par les trois
 *    dernières simulations complètes évaluées ;
 *  - une liste de priorités déduite de l'état réel du parcours.
 *
 * Aucun appel réseau ici : tout se calcule à partir des données déjà chargées.
 */

import { KEY_QUESTIONS } from "@/lib/vivaldi-data";
import { BAREME } from "@/lib/evaluateur/bareme";
import {
  isCareerDeepened,
  isNewsTopicComplete,
  isSheetFinished,
  isSupportComplete,
  type CareerProject,
  type Experience,
  type InterviewSession,
  type InterviewSupport,
  type NewsTopic,
  type Profile,
  type QuestionAnswer,
  type SchoolSheet,
} from "@/lib/vivaldi-queries";

export const COCKPIT_THEMES = [
  "Connaissance écoles",
  "Introspection et récit personnel",
  "Projet professionnel",
  "Projection vers le futur",
  "Aisance orale",
] as const;

export type CockpitTheme = (typeof COCKPIT_THEMES)[number];

/** Rattachement explicite de chaque question clé à un thème du radar. */
const QUESTION_THEME: Record<string, CockpitTheme> = {
  // Connaissance écoles
  "pourquoi-ecole-commerce": "Connaissance écoles",
  "pourquoi-notre-ecole": "Connaissance écoles",
  "qu-est-ce-que-notre-ecole-va-vous-apporter": "Connaissance écoles",
  "quelle-est-la-devise-notre-ecole": "Connaissance écoles",
  "quelles-sont-les-valeurs-notre-ecole": "Connaissance écoles",
  "maire-ville-ecole": "Connaissance écoles",
  "tissu-economique-ville-region": "Connaissance écoles",
  "apport-ecole": "Connaissance écoles",
  "entre-notre-ecole-et-une-autre-que-choisissez-vous": "Connaissance écoles",
  "que-feriez-vous-si-vous-etiez-refuse-dans-notre-ecole": "Connaissance écoles",

  // Introspection et récit personnel
  "presentez-vous": "Introspection et récit personnel",
  "presentation-5-min": "Introspection et récit personnel",
  "racontez-experience": "Introspection et récit personnel",
  "apport-experience": "Introspection et récit personnel",
  "trois-qualites": "Introspection et récit personnel",
  "trois-defauts": "Introspection et récit personnel",
  "amis-disent": "Introspection et récit personnel",
  "pourquoi-vous": "Introspection et récit personnel",
  "plus-gros-echec": "Introspection et récit personnel",
  "plus-belle-reussite": "Introspection et récit personnel",
  "place-equipe": "Introspection et récit personnel",
  "individuel-collectif": "Introspection et récit personnel",
  reorientation: "Introspection et récit personnel",

  // Projet professionnel
  "projet-professionnel": "Projet professionnel",
  "dans-5-ans": "Projet professionnel",
  "que-voulez-vous-faire-ecole": "Projet professionnel",
  "jusquou-reussir": "Projet professionnel",
  "bon-manager": "Projet professionnel",
  modele: "Projet professionnel",

  // Projection vers le futur
  "dans-10-ans": "Projection vers le futur",
  "projet-n-aboutit-pas": "Projection vers le futur",
  "ne-pas-changer-d-avis": "Projection vers le futur",
  "concilier-vie-pro-familiale": "Projection vers le futur",
  "sujet-actualite-parler": "Projection vers le futur",
  "quavez-vous-a-dire-sur": "Projection vers le futur",
  "vous-venez-de-gagner-1-million-d-euros-qu-en-faites-vous": "Projection vers le futur",

  // Aisance orale
  "faites-nous-rire": "Aisance orale",
  "surprenez-nous": "Aisance orale",
  "qu-est-ce-qui-vous-emeut": "Aisance orale",
  "pensez-vous-avoir-reussi-l-entretien": "Aisance orale",
  "vendez-moi-ce-stylo": "Aisance orale",
  "question-ou-ajouter": "Aisance orale",
  "mot-de-la-fin": "Aisance orale",
  "quelle-question-auriez-vous-aime": "Aisance orale",
};

export function themeOfQuestion(questionId: string): CockpitTheme {
  return QUESTION_THEME[questionId] ?? "Introspection et récit personnel";
}

/** Nombre de questions clés disponibles par thème. */
export function questionCountByTheme(): Record<CockpitTheme, number> {
  const counts = Object.fromEntries(COCKPIT_THEMES.map((t) => [t, 0])) as Record<CockpitTheme, number>;
  KEY_QUESTIONS.forEach((q) => {
    counts[themeOfQuestion(q.id)] += 1;
  });
  return counts;
}

export type Verdict = "Validé" | "À perfectionner" | "À retravailler";

export function verdictOf(feedback?: string | null): Verdict | null {
  const match = (feedback ?? "").match(/## Verdict\n\s*(Validé|À perfectionner|À retravailler)/i);
  return (match?.[1] as Verdict | undefined) ?? null;
}

/** Conversion du verdict IA en score sur 100 (mêmes seuils pour toutes les questions). */
const VERDICT_SCORE: Record<Verdict, number> = {
  Validé: 90,
  "À perfectionner": 62,
  "À retravailler": 32,
};

/** Percentile relevé dans le débrief d'un entretien complet (« P67 - … »). */
export function percentileOfDebrief(debrief?: string | null): number | null {
  const m = (debrief ?? "").match(/\bP(\d{1,3})\b/);
  const value = m ? Number(m[1]) : NaN;
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : null;
}

export type ThemeScore = {
  theme: CockpitTheme;
  /** Score sur 100, null si aucune donnée. */
  score: number | null;
  /** Questions clés travaillées / disponibles sur ce thème. */
  worked: number;
  total: number;
  /** Nombre de questions dont le verdict est « À retravailler ». */
  toRework: number;
};

export type RadarPoint = { theme: CockpitTheme; short: string; score: number; objectif: number };

export const THEME_SHORT: Record<CockpitTheme, string> = {
  "Connaissance écoles": "Écoles",
  "Introspection et récit personnel": "Introspection",
  "Projet professionnel": "Projet pro",
  "Projection vers le futur": "Futur",
  "Aisance orale": "Aisance orale",
};

const PRESENTATION_CRITERIA = new Set([
  "presentation",
  "presentation_longue_essec",
  "presentation_mot_edhec",
  "autoportrait_kedge",
  "presentation_image_inseec",
  "pitch_em_strasbourg",
]);

function themeOfCase(criterion: string, caseKey: string): CockpitTheme | null {
  if (criterion === "ecole") return "Connaissance écoles";
  if (PRESENTATION_CRITERIA.has(criterion)) return "Introspection et récit personnel";
  if (criterion === "experiences" || criterion === "experiences_montpellier") {
    return caseKey === "projection" ? "Projection vers le futur" : "Introspection et récit personnel";
  }
  if (criterion === "projet") return "Projet professionnel";
  if (["destabilisantes", "conduite", "clarte"].includes(criterion)) return "Aisance orale";
  return null;
}

/** Une simulation produit un pourcentage par thème, puis les 1 à 3 dernières sont moyennées. */
export function computeThemeScores(answers: QuestionAnswer[], sessions: InterviewSession[]): ThemeScore[] {
  const totals = questionCountByTheme();
  const questionStats = Object.fromEntries(
    COCKPIT_THEMES.map((theme) => [theme, { worked: 0, toRework: 0 }]),
  ) as Record<CockpitTheme, { worked: number; toRework: number }>;

  answers.forEach((a) => {
    const theme = themeOfQuestion(a.question_id);
    const verdict = verdictOf(a.ai_feedback);
    if (!verdict) return;
    questionStats[theme].worked += 1;
    if (verdict === "À retravailler") questionStats[theme].toRework += 1;
  });

  const evaluations = sessions
    .filter((session) => session.status === "done" && session.evaluation?.status === "ok" && !session.evaluation.interrupted)
    .map((session) => session.evaluation)
    .filter((evaluation): evaluation is NonNullable<InterviewSession["evaluation"]> => evaluation !== null)
    .slice(0, 3);

  const perTheme = Object.fromEntries(COCKPIT_THEMES.map((theme) => [theme, [] as number[]])) as Record<
    CockpitTheme,
    number[]
  >;
  evaluations.forEach((evaluation) => {
    const grid = BAREME.grilles[evaluation.grille];
    if (!grid) return;
    const buckets = Object.fromEntries(COCKPIT_THEMES.map((theme) => [theme, { points: 0, max: 0 }])) as Record<
      CockpitTheme,
      { points: number; max: number }
    >;
    grid.criteres.forEach((criterion) => {
      criterion.cases.forEach((caseDef) => {
        const theme = themeOfCase(criterion.cle, caseDef.cle);
        const points = evaluation.case_points?.[criterion.cle]?.[caseDef.cle];
        if (!theme || typeof points !== "number") return;
        buckets[theme].points += points;
        buckets[theme].max += Math.max(...Object.values(caseDef.points));
      });
    });
    COCKPIT_THEMES.forEach((theme) => {
      const bucket = buckets[theme];
      if (bucket.max > 0) perTheme[theme].push((bucket.points / bucket.max) * 100);
    });
  });

  return COCKPIT_THEMES.map((theme) => {
    const values = perTheme[theme];
    const score = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    return { theme, score, worked: questionStats[theme].worked, total: totals[theme], toRework: questionStats[theme].toRework };
  });
}

export function radarData(scores: ThemeScore[], objectif = 75): RadarPoint[] {
  return scores.map((s) => ({
    theme: s.theme,
    short: THEME_SHORT[s.theme],
    score: s.score ?? 0,
    objectif,
  }));
}

export type Priority = {
  id: string;
  title: string;
  reason: string;
  to: string;
  cta: string;
  level: "bloquant" | "important" | "consolidation";
};

/** Ce que l'étudiant doit faire maintenant, dans l'ordre logique du parcours. */
export function computePriorities(input: {
  profile: Profile | null;
  career: CareerProject | null;
  sheets: SchoolSheet[];
  experiences: Experience[];
  newsTopics: NewsTopic[];
  supports: InterviewSupport[];
  answers: QuestionAnswer[];
  sessions: InterviewSession[];
  themeScores: ThemeScore[];
}): Priority[] {
  const { profile, career, sheets, experiences, newsTopics, supports, answers, sessions, themeScores } = input;
  const out: Priority[] = [];

  if (!profile?.part1_completed) {
    out.push({
      id: "profil",
      title: "Compléter mes informations personnelles",
      reason: "Sans profil complet, la préparation ne peut pas être personnalisée à vos écoles.",
      to: "/informations-personnelles",
      cta: "Compléter mon profil",
      level: "bloquant",
    });
  }

  if (!isCareerDeepened(career)) {
    out.push({
      id: "projet",
      title: "Approfondir mon projet professionnel",
      reason: "C'est le socle de la moitié des questions du jury : métier visé, secteur, qualités mobilisées.",
      to: "/partie-2",
      cta: "Travailler mon projet",
      level: "bloquant",
    });
  }

  const finishedSheets = sheets.filter(isSheetFinished).length;
  const targetSchools = (profile?.target_schools ?? []).length;
  if (finishedSheets < Math.max(1, Math.min(targetSchools, 3))) {
    out.push({
      id: "fiches",
      title: "Terminer mes fiches écoles",
      reason: `${finishedSheets} fiche(s) terminée(s)${targetSchools ? ` pour ${targetSchools} école(s) visée(s)` : ""} : le jury sanctionne vite un « pourquoi nous » approximatif.`,
      to: "/partie-3",
      cta: "Compléter une fiche",
      level: "important",
    });
  }

  const submitted = experiences.filter((e) => e.status === "submitted").length;
  const ratio = experiences.length ? submitted / experiences.length : 0;
  if (experiences.length < 4 || ratio < 0.75) {
    out.push({
      id: "experiences",
      title: "Valider mes expériences personnelles",
      reason: experiences.length
        ? `${submitted}/${experiences.length} expériences validées (75 % attendus) : ce sont vos anecdotes du jour J.`
        : "Aucune expérience travaillée : vous n'avez pas encore de matière à raconter au jury.",
      to: "/partie-4",
      cta: "Travailler mes expériences",
      level: "important",
    });
  }

  const finishedNews = newsTopics.filter((t) => t.status === "submitted" && isNewsTopicComplete(t)).length;
  if (finishedNews < 3) {
    out.push({
      id: "actu",
      title: "Préparer mes sujets d'actualité",
      reason: `${finishedNews} sujet(s) prêt(s) : visez-en 3 pour ne jamais être pris au dépourvu.`,
      to: "/partie-5",
      cta: "Ajouter un sujet",
      level: finishedNews === 0 ? "important" : "consolidation",
    });
  }

  const finishedSupports = supports.filter(isSupportComplete).length;
  if (finishedSupports === 0) {
    out.push({
      id: "supports",
      title: "Finaliser un support d'entretien",
      reason: "Questionnaire ou CV projectif : c'est le premier contact du jury avec votre profil.",
      to: "/partie-6",
      cta: "Travailler mes supports",
      level: "important",
    });
  }

  const worked = answers.filter((a) => verdictOf(a.ai_feedback) !== null).length;
  const toRework = answers.filter((a) => verdictOf(a.ai_feedback) === "À retravailler");
  if (toRework.length > 0) {
    out.push({
      id: "questions-rework",
      title: `Refaire ${toRework.length} question(s) clé(s) notée(s) « À retravailler »`,
      reason: "Une réponse jugée à retravailler reste un point de fragilité tant qu'elle n'a pas été repassée.",
      to: "/partie-7",
      cta: "Repasser ces questions",
      level: "important",
    });
  } else if (worked < 10) {
    out.push({
      id: "questions",
      title: "Travailler davantage de questions clés",
      reason: `${worked} question(s) corrigée(s) : visez-en au moins 10 avant les simulations.`,
      to: "/partie-7",
      cta: "M'entraîner sur une question",
      level: "important",
    });
  }

  const doneInterviews = sessions.filter((s) => s.status === "done").length;
  if (doneInterviews < 3) {
    out.push({
      id: "simulations",
      title: "Passer une simulation complète",
      reason: `${doneInterviews} entretien(s) complet(s) passé(s) : c'est le seul exercice qui mesure votre tenue sur 30 minutes.`,
      to: "/partie-8",
      cta: "Lancer une simulation",
      level: doneInterviews === 0 ? "important" : "consolidation",
    });
  }

  const weakest = themeScores
    .filter((s) => s.score !== null && s.score < 60)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (weakest) {
    out.push({
      id: `theme-${weakest.theme}`,
      title: `Renforcer le thème « ${weakest.theme} »`,
      reason: `C'est votre thème le plus fragile (${weakest.score}/100) sur vos simulations complètes.`,
      to: "/partie-8",
      cta: "Repasser une simulation",
      level: "consolidation",
    });
  }

  const untouched = themeScores.filter((s) => s.worked === 0)[0];
  if (untouched) {
    out.push({
      id: `blind-${untouched.theme}`,
      title: `Ouvrir le thème « ${untouched.theme} »`,
      reason: "Aucune question corrigée sur ce thème : votre radar reste aveugle dessus.",
      to: "/partie-7",
      cta: "Découvrir les questions",
      level: "consolidation",
    });
  }

  return out.slice(0, 4);
}

/** Indice de préparation global (0-100), pondéré préparation / entraînement. */
export function readinessScore(input: {
  profile: Profile | null;
  career: CareerProject | null;
  sheets: SchoolSheet[];
  experiences: Experience[];
  newsTopics: NewsTopic[];
  supports: InterviewSupport[];
  themeScores: ThemeScore[];
}): number {
  const { profile, career, sheets, experiences, newsTopics, supports, themeScores } = input;
  const submitted = experiences.filter((e) => e.status === "submitted").length;
  const prepItems = [
    profile?.part1_completed ? 1 : 0,
    isCareerDeepened(career) ? 1 : 0,
    Math.min(sheets.filter(isSheetFinished).length / 2, 1),
    Math.min(submitted / 4, 1),
    Math.min(newsTopics.filter((t) => t.status === "submitted" && isNewsTopicComplete(t)).length / 3, 1),
    Math.min(supports.filter(isSupportComplete).length / 1, 1),
  ];
  const prep = prepItems.reduce((a, b) => a + b, 0) / prepItems.length;

  const scored = themeScores.filter((s) => s.score !== null);
  const train = scored.length
    ? scored.reduce((acc, s) => acc + (s.score ?? 0), 0) / (scored.length * 100)
    : 0;
  const coverage = scored.length / COCKPIT_THEMES.length;

  return Math.round((prep * 0.45 + train * 0.4 + coverage * 0.15) * 100);
}
