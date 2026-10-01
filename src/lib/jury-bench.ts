/**
 * BANC DE MESURE DE LA QUALITÉ DU JURY
 *
 * Fonctions PURES uniquement : aucune dépendance React, aucun accès réseau,
 * aucun `Date.now()`. Le banc se nourrit exclusivement du fil déjà persisté en
 * session (`InterviewTurn[]`, cf. `src/lib/vivaldi-queries.ts`), ce qui permet
 * de comparer objectivement « avant / après » quand on retouche les consignes
 * du jury, sur des entretiens déjà enregistrés.
 *
 * Rien n'est branché dans l'interface à ce stade : on expose seulement les
 * fonctions de mesure.
 */
import { INVITATION_RE, normalizeInterviewText } from "@/lib/interview-text";

/** Un tour du fil, tel qu'il est persisté en session. */
export type BenchTurn = {
  question: string;
  answer: string;
  askedAt?: string;
  answeredAt?: string;
};

/** Une prise de parole du jury commentant la qualité de la réponse. */
export type QualityCommentTurn = {
  /** Index du tour dans le fil. */
  index: number;
  /** Extrait fautif repéré dans la prise de parole. */
  excerpt: string;
};

/** Une amorce (3 premiers mots) réutilisée au moins deux fois. */
export type OpenerRepeat = {
  opener: string;
  count: number;
  /** Part des prises de parole du jury commençant par cette amorce (0 → 1). */
  share: number;
};

/** Deux questions du jury trop proches l'une de l'autre. */
export type RepeatedQuestionPair = {
  /** Index du premier tour concerné. */
  a: number;
  /** Index du second tour concerné. */
  b: number;
  /** Similarité de Jaccard mesurée (0 → 1). */
  similarity: number;
};

/** Thèmes obligatoires de l'entretien, détectés dans les questions du jury. */
export type CoveredThemes = {
  projetPro: boolean;
  ecole: boolean;
  qualitesDefauts: boolean;
  actualite: boolean;
  experience: boolean;
};

/** Distribution de la longueur des prises de parole du jury (en mots). */
export type JuryTurnLength = {
  /** Nombre de mots médian. */
  median: number;
  /** 90e centile. */
  p90: number;
  /** Prise de parole la plus longue. */
  max: number;
  /** Part des prises de parole de moins de 15 mots : indicateur « le jury est sec ». */
  shortShare: number;
  /** Part des prises de parole de 40 mots ou plus : indicateur « il étoffe quand c'est utile ». */
  richShare: number;
};

export type JuryBenchMetrics = {
  juryTurns: number;
  /**
   * Tours vides : réponses du candidat qui ne sont précédées d'AUCUN texte du
   * jury (le jury n'a rien produit entre la réponse précédente et celle-ci).
   * Taux brut, sans le rattrapage de l'application.
   */
  silentTurns: number;
  /** Part des réponses du candidat restées sans texte du jury (0 → 1). */
  silentShare: number;
  /** Questions du jury par minute d'entretien réel (0 si la durée est nulle). */
  questionsPerMinute: number;
  /** Part des prises de parole se terminant par une question (0 → 1). */
  endsWithQuestionRatio: number;
  qualityCommentTurns: QualityCommentTurn[];
  /** Index des prises de parole contenant deux questions ou plus. */
  doubleQuestionTurns: number[];
  /**
   * Index des prises de parole de plus de 60 mots. Point de vigilance, pas un
   * défaut en soi : le jury ne doit pas se mettre à faire des discours.
   */
  longTurns: number[];
  /** Longueur des prises de parole du jury, hors phrases imposées. */
  juryTurnLength: JuryTurnLength;
  openerRepeats: OpenerRepeat[];
  repeatedQuestions: RepeatedQuestionPair[];
  /** Part des mots prononcés par le jury sur le total (objectif : 0,15 → 0,25). */
  juryWordShare: number;
  /**
   * Part des prises de parole qui COMMENCENT par une formule d'accueil
   * (« c'est noté », « merci pour … ») hors transitions légitimes. Cible < 5 %.
   */
  formulaOpenerShare: number;
  /** Part des prises de parole contenant une reprise désignative des mots du candidat. */
  pointingRepriseShare: number;
  /** Part des questions du jury reprenant une question du catalogue du module 6. */
  bankQuestionRatio: number;
  /**
   * Parmi les questions hors catalogue, part de celles qui reprennent au moins
   * un mot significatif de la réponse précédente du candidat.
   */
  anchoredImprovisedRatio: number;
  coveredThemes: CoveredThemes;
};

/**
 * Jugements de QUALITÉ interdits par le prompt du jury : il peut accuser
 * réception neutrement (« très bien », « d'accord »), jamais juger la réponse
 * ou son auteur. Repérés PARTOUT dans la prise de parole, pas seulement au
 * début. Trois familles :
 *  - la qualification de la réponse ou de son auteur (« c'est très construit »,
 *    « vous maîtrisez », « c'est exactement ça »…) ;
 *  - le compliment sur la manière : « vous avez (très) bien » + verbe,
 *    « c'est (très) bien » + nom ou verbe ;
 *  - la clarté et la qualité de la réponse elles-mêmes (« c'est clair »,
 *    « très précis », « réponse honnête »…), désormais interdites.
 * « parfait » et « très bien » employés SEULS ne matchent pas.
 */
const QUALITY_COMMENT_RE = new RegExp(
  [
    "c'est tres (?:structure|construit|complet)",
    "tres eclairant",
    "c'est interessant",
    "c'est pertinent",
    "bonne reponse",
    "belle reponse",
    "excellent",
    "c'est un bon (?:exemple|point)",
    "vous maitrisez",
    "c'est exactement ca",
    "tout a fait juste",
    "vous avez (?:tres )?bien [a-z]+",
    "c'est (?:tres )?bien [a-z]+",
    // Clarté et qualité de la réponse.
    "c'est (?:tres )?clair",
    "beaucoup plus clair",
    "tres (?:precis|precise|riche|juste)",
    "reponse (?:tres )?(?:honnete|claire|precise|complete|riche|interessante|sincere|pertinente)",
    "reponse tres",
  ].join("|"),
);

/**
 * Formule d'accueil en TÊTE de prise de parole : le tic qu'on veut voir
 * disparaître (« C'est noté sur ce plan B. », « Merci pour votre réponse. »).
 */
const FORMULA_OPENER_RE = /^(?:c'est note|merci pour)/;

/** Transitions légitimes : après une longue prise de parole imposée ou en clôture. */
const LEGIT_THANKS_RE = /^merci pour (?:cette presentation|votre presentation|cet expose|cet echange)/;

/** Reprise DÉSIGNATIVE des mots du candidat : ce qu'on veut voir augmenter. */
const POINTING_REPRISE_RE =
  /(vous avez parle de|vous parliez de|vous avez dit|vous disiez|vous avez evoque|vous avez mentionne|je voudrais revenir sur|je reviens sur|tout a l'heure vous)/;

/** Seuil de vigilance (mots) : au-delà, le jury risque de faire un discours. */
const LONG_TURN_WORDS = 60;

/** Seuils des indicateurs de longueur : « sec » et « étoffé ». */
const SHORT_TURN_WORDS = 15;
const RICH_TURN_WORDS = 40;

/**
 * Centile d'une série triée, par interpolation linéaire. `q` entre 0 et 1.
 * Série vide → 0.
 */
function percentile(sorted: number[], q: number) {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower]!;
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower);
}

/** Seuil de similarité (Jaccard) au-delà duquel deux questions sont « reposées ». */
const REPEATED_QUESTION_THRESHOLD = 0.6;

/** Seuil de similarité au-delà duquel une question vient du catalogue du module 6. */
const BANK_MATCH_THRESHOLD = 0.5;

/** Mots-clés simples de détection des thèmes obligatoires (texte normalisé). */
const THEME_PATTERNS: Record<keyof CoveredThemes, RegExp> = {
  // Projet professionnel : métier visé, secteur, « après l'école ».
  projetPro: /projet professionnel|projet pro|votre projet|metier|apres l'ecole|apres votre diplome|secteur/,
  // Motivation école : nom générique, programme, associations, campus.
  ecole: /notre ecole|cette ecole|notre programme|nos associations|notre campus|pourquoi nous|choisi cette/,
  // Qualités et défauts : la question de personnalité classique.
  qualitesDefauts: /qualites|defauts|points forts|points faibles|vos faiblesses|vos forces/,
  // Actualité : sujet d'actualité, presse, article, événement récent.
  actualite: /actualite|l'actu|un article|la presse|un journal|un sujet recent|dans le monde/,
  // Expériences : stage, job, bénévolat, association, voyage, sport.
  experience: /stage|un job|benevolat|associatif|une association|un voyage|votre sport|une experience/,
};

/**
 * Mots normalisés d'un texte : on ne garde que les unités contenant au moins
 * une lettre ou un chiffre, pour que la ponctuation isolée (« ? », « … »)
 * ne soit jamais comptée comme un mot.
 */
function words(normalized: string) {
  return normalized.split(/\s+/).filter((unit) => /[a-z0-9]/.test(unit));
}

/** Mots outils, sans valeur de contenu : ils n'ancrent pas une relance. */
const STOP_WORDS = new Set([
  "alors",
  "aussi",
  "avoir",
  "beaucoup",
  "cette",
  "comme",
  "comment",
  "depuis",
  "donne",
  "elles",
  "entre",
  "etais",
  "etait",
  "etaient",
  "ensuite",
  "faire",
  "meme",
  "parce",
  "pense",
  "peux",
  "plutot",
  "pour",
  "pourquoi",
  "quand",
  "quelque",
  "quelques",
  "sinon",
  "toujours",
  "vraiment",
]);

/** Mots significatifs d'un texte : plus de 4 lettres, hors mots outils. */
function significantWords(normalized: string) {
  return new Set(
    words(normalized)
      .map((word) => word.replace(/[^a-z0-9]/g, ""))
      .filter((word) => word.length > 4 && !STOP_WORDS.has(word)),
  );
}

/** Une prise de parole du jury se termine-t-elle par une question ? */
function endsWithQuestion(raw: string) {
  return /\?\s*$/.test(raw.trim());
}

/** Similarité de Jaccard sur les mots de plus de 4 lettres. */
function jaccard(a: string, b: string) {
  const setOf = (text: string) => new Set(words(text).filter((word) => word.length > 4));
  const left = setOf(a);
  const right = setOf(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  const union = left.size + right.size - shared;
  return union === 0 ? 0 : shared / union;
}

/** Durée réelle de l'entretien, en minutes (dernier `answeredAt` − premier `askedAt`). */
export function benchDurationMinutes(turns: BenchTurn[]) {
  const startIso = turns[0]?.askedAt;
  const endIso = [...turns].reverse().find((turn) => turn.answeredAt)?.answeredAt;
  if (!startIso || !endIso) return 0;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / 60_000;
}

/**
 * Mesure complète d'un fil d'entretien.
 *
 * `questionBank` : intitulés des questions travaillées par le candidat au
 * module 6 (`KEY_QUESTIONS[].question`). Passé en paramètre pour garder la
 * fonction pure et testable ; vide par défaut.
 */
export function measureJuryBench(turns: BenchTurn[], questionBank: string[] = []): JuryBenchMetrics {
  const juryTexts = turns.map((turn) => turn.question ?? "");
  const normalized = juryTexts.map((text) => normalizeInterviewText(text));
  /** Phrase imposée : elle a le droit de ne pas se terminer par une question. */
  const imposed = normalized.map((text) => INVITATION_RE.test(text));

  const qualityCommentTurns: QualityCommentTurn[] = [];
  const doubleQuestionTurns: number[] = [];
  const longTurns: number[] = [];
  const openerCounts = new Map<string, number>();
  let denominator = 0;
  let questionTurns = 0;
  let juryWords = 0;
  let candidateWords = 0;
  let formulaOpeners = 0;
  let pointingReprises = 0;

  turns.forEach((turn, index) => {
    const text = juryTexts[index]!;
    const norm = normalized[index]!;
    const juryWordList = words(norm);
    // La part de parole exclut les phrases imposées mot pour mot par
    // l'application : elles ne mesurent pas le bavardage du jury.
    if (!imposed[index]) juryWords += juryWordList.length;
    candidateWords += words(normalizeInterviewText(turn.answer ?? "")).length;

    if (endsWithQuestion(text)) questionTurns += 1;
    if (!imposed[index]) denominator += 1;

    const quality = QUALITY_COMMENT_RE.exec(norm);
    if (quality) qualityCommentTurns.push({ index, excerpt: quality[0] });

    const marks = (text.match(/\?/g) ?? []).length;
    if (marks >= 2 && !imposed[index]) doubleQuestionTurns.push(index);

    if (juryWordList.length > LONG_TURN_WORDS) longTurns.push(index);

    if (juryWordList.length >= 3) {
      const opener = juryWordList.slice(0, 3).join(" ");
      openerCounts.set(opener, (openerCounts.get(opener) ?? 0) + 1);
    }

    // Tic de reprise : formule d'accueil en tête de prise de parole, hors
    // transitions légitimes (« merci pour cette présentation »…).
    if (FORMULA_OPENER_RE.test(norm) && !LEGIT_THANKS_RE.test(norm)) formulaOpeners += 1;
    if (POINTING_REPRISE_RE.test(norm)) pointingReprises += 1;
  });

  // La part « se termine par une question » se calcule hors phrases imposées :
  // une prise de parole imposée sans question n'est pas un défaut.
  let endsWithQuestionInScope = 0;
  normalized.forEach((_, index) => {
    if (!imposed[index] && endsWithQuestion(juryTexts[index]!)) endsWithQuestionInScope += 1;
  });

  const repeatedQuestions: RepeatedQuestionPair[] = [];
  for (let a = 0; a < normalized.length; a += 1) {
    for (let b = a + 1; b < normalized.length; b += 1) {
      const similarity = jaccard(normalized[a]!, normalized[b]!);
      if (similarity >= REPEATED_QUESTION_THRESHOLD) repeatedQuestions.push({ a, b, similarity });
    }
  }

  // Catalogue du module 6 : une question du jury en « vient » quand elle
  // ressemble assez (Jaccard) à l'intitulé travaillé par le candidat.
  const bankNormalized = questionBank.map((label) => normalizeInterviewText(label));
  let askedQuestions = 0;
  let fromBank = 0;
  let improvised = 0;
  let anchoredImprovised = 0;
  normalized.forEach((norm, index) => {
    if (!endsWithQuestion(juryTexts[index]!) || imposed[index]) return;
    askedQuestions += 1;
    const inBank = bankNormalized.some((label) => jaccard(norm, label) >= BANK_MATCH_THRESHOLD);
    if (inBank) {
      fromBank += 1;
      return;
    }
    improvised += 1;
    // Réponse précédente du candidat : celle du tour d'avant.
    const previous = index > 0 ? normalizeInterviewText(turns[index - 1]!.answer ?? "") : "";
    const echoes = significantWords(previous);
    if (echoes.size > 0) {
      for (const word of significantWords(norm)) {
        if (echoes.has(word)) {
          anchoredImprovised += 1;
          break;
        }
      }
    }
  });

  // Longueur des prises de parole du jury, hors phrases imposées : le jury a
  // le droit d'étoffer (reprise des mots du candidat), on veut voir s'il reste
  // sec ou s'il fait parfois des prises de parole plus riches.
  const lengths = normalized
    .map((norm, index) => (imposed[index] ? null : words(norm).length))
    .filter((length): length is number => length !== null)
    .sort((a, b) => a - b);
  const shortCount = lengths.filter((length) => length < SHORT_TURN_WORDS).length;
  const richCount = lengths.filter((length) => length >= RICH_TURN_WORDS).length;
  const juryTurnLength: JuryTurnLength =
    lengths.length === 0
      ? { median: 0, p90: 0, max: 0, shortShare: 0, richShare: 0 }
      : {
          median: percentile(lengths, 0.5),
          p90: percentile(lengths, 0.9),
          max: lengths[lengths.length - 1]!,
          shortShare: shortCount / lengths.length,
          richShare: richCount / lengths.length,
        };

  const minutes = benchDurationMinutes(turns);
  const totalWords = juryWords + candidateWords;
  const allJuryText = normalized.join(" ");


  return {
    juryTurns: turns.length,
    silentTurns: juryTexts.filter((text) => !text.trim()).length,
    silentShare: turns.length > 0 ? juryTexts.filter((text) => !text.trim()).length / turns.length : 0,
    questionsPerMinute: minutes > 0 ? questionTurns / minutes : 0,
    endsWithQuestionRatio: denominator > 0 ? endsWithQuestionInScope / denominator : 0,
    qualityCommentTurns,
    doubleQuestionTurns,
    longTurns,
    openerRepeats: [...openerCounts.entries()]
      .filter(([, count]) => count >= 2)
      .map(([opener, count]) => ({ opener, count, share: turns.length > 0 ? count / turns.length : 0 }))
      .sort((left, right) => right.count - left.count),
    repeatedQuestions,
    juryTurnLength,
    juryWordShare: totalWords > 0 ? juryWords / totalWords : 0,
    formulaOpenerShare: turns.length > 0 ? formulaOpeners / turns.length : 0,
    pointingRepriseShare: turns.length > 0 ? pointingReprises / turns.length : 0,
    bankQuestionRatio: askedQuestions > 0 ? fromBank / askedQuestions : 0,
    anchoredImprovisedRatio: improvised > 0 ? anchoredImprovised / improvised : 0,
    coveredThemes: {
      projetPro: THEME_PATTERNS.projetPro.test(allJuryText),
      ecole: THEME_PATTERNS.ecole.test(allJuryText),
      qualitesDefauts: THEME_PATTERNS.qualitesDefauts.test(allJuryText),
      actualite: THEME_PATTERNS.actualite.test(allJuryText),
      experience: THEME_PATTERNS.experience.test(allJuryText),
    },
  };
}
