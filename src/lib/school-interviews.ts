/**
 * Configuration d'entretien PAR ÉCOLE (module 8).
 *
 * Source unique de vérité pour :
 * - le popup de structure officielle affiché avant le démarrage,
 * - l'agent vocal ElevenLabs à joindre (agent partagé « classique » ou agent dédié),
 * - le support à déposer en amont quand l'école en exige un.
 *
 * Toute école non listée ici retombe sur `DEFAULT_CLASSIQUE_CONFIG` : les 24 écoles
 * restent utilisables, les configurations arrivent par lots.
 */
import { buildJuryAgentPrompt } from "./elevenlabs-agent-prompt";
import { CLERMONT_IMPACT_JURY, type ImpactAxis } from "./esc-clermont-kb";
import { INSEEC_IMAGES } from "./inseec-kb";

import { INTERVIEW_VARIANTS, type InterviewVariant } from "./interview-kb";
import { TBS_ARTICLES } from "./tbs-articles";
import { JURY_SCHOOL_TEXTS } from "./jury/school-texts";


export const CLASSIQUE_AGENT_ENV = "ELEVENLABS_AGENT_ID_CLASSIQUE";

export type ClermontImpactVariables = {
  clermont_q_people: string;
  clermont_q_planet: string;
  clermont_q_profit: string;
};

/** Questions Impact préparées avant la connexion du jury, une par axe. */
export function buildClermontImpactVariables(
  school: string,
  random: () => number = Math.random,
): ClermontImpactVariables {
  const empty: ClermontImpactVariables = {
    clermont_q_people: "",
    clermont_q_planet: "",
    clermont_q_profit: "",
  };
  if (school !== "ESC Clermont BS") return empty;
  const pick = (axis: ImpactAxis) => {
    const questions = CLERMONT_IMPACT_JURY[axis];
    return questions[Math.floor(random() * questions.length)] ?? questions[0]!;
  };
  return {
    clermont_q_people: pick("people"),
    clermont_q_planet: pick("planet"),
    clermont_q_profit: pick("profit"),
  };
}

export type InterviewPhase = {
  label: string;
  minutes: number;
  detail?: string;
  /** Phase réelle mais NON simulée (hors du périmètre de l'agent vocal). */
  excluded?: boolean;
  /** Phase garantie par le jury dans la simulation. */
  guaranteed?: boolean;
};

export type InterviewSupport = {
  /** Nom du document tel que l'école le désigne. */
  label: string;
  /** Consigne affichée au candidat avant l'upload. */
  instructions: string;
  /** Questions ou rubriques du support, quand elles sont connues. */
  prompts?: string[];
  /** Extensions acceptées (upload de fichier uniquement). */
  accept?: string[];
  maxMb?: number;
  /**
   * Alternative à l'upload : le candidat choisit un article dans une liste que
   * nous fournissons (cas TBS Education). Quand ce champ est présent, aucun
   * fichier personnel n'est demandé.
   */
  articleOptions?: {
    id: string;
    title: string;
    source: string;
    date: string;
    url: string;
    summary: string;
  }[];
};


export type SchoolInterviewConfig = {
  school: string;
  /** Informatif : sert aux libellés. La logique lit `agentIdEnv` et `useHouseJuryPrompt`. */
  format: "classique" | "special";
  /** Secret serveur contenant l'identifiant de l'agent ElevenLabs. */
  agentIdEnv: string;
  /** Durée de la partie réellement simulée. */
  durationSeconds: number;
  phases: InterviewPhase[];
  requiresUpload: boolean;
  support?: InterviewSupport;
  /**
   * true : on injecte notre prompt jury maison + les niveaux de difficulté.
   * false : le déroulé est entièrement défini dans l'agent ElevenLabs (format spécial).
   */
  useHouseJuryPrompt: boolean;
  /**
   * Conduite officielle propre à l'école, ajoutée au prompt du jury maison
   * (ouverture imposée, poids donné au support déposé). Ignorée quand
   * `useHouseJuryPrompt` est false : le déroulé vient alors de l'agent dédié.
   */
  conductNote?: string;
  /**
   * Guidance libre injectée dans le PROMPT SYSTÈME DE DÉBRIEF (jamais dans le
   * prompt du jury en direct) pour indiquer à l'IA de notation comment
   * appliquer / pondérer les critères C1-C9 de la grille INTERVIEW_GRID
   * partagée, compte tenu du format spécifique de cette école. Peut, pour une
   * école qui l'exige explicitement (ex. ESSEC), étendre le barème au-delà de
   * /20 avec un critère supplémentaire propre à l'école : dans ce cas, le
   * supplément doit lui-même donner au modèle la formule de conversion vers un
   * équivalent /20 (produit en croix) avant application de la table de
   * percentile existante — jamais de nouvelle table de percentile.
   */
  debriefSupplement?: string;
  /**
   * true : l'école n'est pas encore simulable (jury dédié non créé). Elle
   * reste visible dans la liste mais n'est pas sélectionnable.
   */
  comingSoon?: boolean;
  /** Chemins publics des images d'exemple à montrer dans le popup avant démarrage (pas utilisées dans l'agent vocal). */
  imageBank?: string[];
  /**
   * Images réellement proposées au choix DANS le popup, avant le démarrage
   * (INSEEC). Le choix est obligatoire et transmis au jury dès le premier
   * message : il n'y a plus aucune sélection en cours d'entretien.
   */
  imageOptions?: { id: string; path: string; shortLabel: string; description: string }[];
  popupCopy: { title: string; desc: string; durationNote: string; goodluck: string };
};

const GOODLUCK = "Bon entretien — parlez comme le jour J, le jury s'adapte à vous.";

/** Phases par défaut d'un entretien de motivation au format classique. */
const CLASSIQUE_PHASES: InterviewPhase[] = [
  { label: "Accueil du jury", minutes: 1, detail: "Présentation des membres du jury", excluded: true },
  { label: "Présentation du candidat", minutes: 3, detail: "« Présentez-vous »", guaranteed: true },
  { label: "Échange sur le parcours, les motivations et le projet", minutes: 18 },
  { label: "Questions du candidat au jury", minutes: 3, excluded: true },
];

export const DEFAULT_CLASSIQUE_CONFIG: Omit<SchoolInterviewConfig, "school"> = {
  format: "classique",
  agentIdEnv: CLASSIQUE_AGENT_ENV,
  durationSeconds: 1500,
  phases: CLASSIQUE_PHASES,
  requiresUpload: false,
  useHouseJuryPrompt: true,
  popupCopy: {
    title: "Entretien de motivation, format classique",
    desc: "Entretien individuel de motivation : présentation, parcours, motivations pour l'école, projet professionnel, puis vos questions au jury.",
    durationNote:
      "Durée réelle 25 minutes. La simulation reproduit la présentation et l'échange avec le jury ; l'accueil du jury et vos questions finales ne sont pas simulés.",
    goodluck: GOODLUCK,
  },
};

const CONFIGS: SchoolInterviewConfig[] = [
  {
    school: "ESSEC",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 2700,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote:
      "CONDUITE SPÉCIFIQUE ESSEC :\n1) Présentation initiale : laisse le candidat dérouler sa présentation sur 3 à 5 minutes sans jamais l'interrompre, quelle qu'en soit la longueur.\n2) UNE mise en situation, et une seule, déclenchée par l'application à la 35e minute, jamais de ta propre initiative : {{situation_enonce}}\nPropose-la une seule fois, telle quelle, sans la reformuler ni la résumer à l'avance. Laisse un court instant de réflexion, puis laisse le candidat dérouler sa réponse pendant 6 à 7 minutes ; tu peux le relancer, demander des précisions ou le contredire sur sa solution, comme sur n'importe quel autre sujet. La mise en situation dure 8 minutes au maximum, puis vient la clôture. Avant la 35e minute, tu mènes l'échange libre normal. Tu ne dis jamais au revoir avant la mise en situation : l'entretien n'est pas fini.\n3) Entrée dans la mise en situation : l'application t'indiquera dans un repère de temps le moment d'y entrer : tu ne l'anticipes jamais. Tu annonces la transition avec tes propres mots, puis tu énonces l'énoncé de la mise en situation mot pour mot.\n4) Sortie de la mise en situation : si le cas est épuisé, tu annonces simplement que la mise en situation est terminée ; l'application t'envoie alors aussitôt la consigne de clôture. Sinon, tu restes exclusivement sur le cas jusqu'à la consigne de clôture. La clôture à deux minutes de la fin garde toujours la priorité.",
    debriefSupplement:
      "CONTEXTE SPÉCIFIQUE ESSEC — BARÈME ÉTENDU (/23 AVANT CONVERSION) : cet entretien comporte, en plus des neuf critères C1-C9 ci-dessus notés sur 20, UN DIXIÈME CRITÈRE PROPRE À L'ESSEC : la mise en situation posée en fin d'entretien. Applique la grille C1-C9 normalement, PUIS ajoute ce dixième critère, puis calcule le score final comme indiqué plus bas.\n\nC10 — Mise en situation : solution personnelle construite et justifiée (/3). Ce critère porte sur LA mise en situation posée pendant l'entretien. Évalue-la avec les niveaux ci-dessous. Le total du barème reste /23, inchangé.\n- N1 (0 pt) : pas de solution personnelle claire ; le candidat récite, improvise au hasard sans justifier ses choix, ou abandonne face à une relance ou contradiction du jury.\n- N2 (1 pt) : une solution est proposée mais reste peu structurée ou faiblement justifiée ; le candidat hésite ou se contredit sous la relance du jury sans s'ajuster.\n- N3 (2 pts) : le candidat construit une solution personnelle cohérente, l'argumente avec des hypothèses explicites (données de l'énoncé ou admises par lui), et tient sa position face à une relance ou contradiction du jury en l'ajustant intelligemment — ni rigidité, ni capitulation.\n- N4 (3 pts) : niveau N3, ET au moins l'un des apports suivants, amené sans être forcé ni plaqué : un lien pertinent avec une qualité personnelle authentique du candidat, OU un lien pertinent avec son projet professionnel futur ou l'ESSEC elle-même.\nImportant : ce lien qualité personnelle / projet futur est un BONUS optionnel réservé au N4. Son absence n'est jamais pénalisée et ne doit jamais faire descendre le candidat en dessous du N3 s'il a par ailleurs construit et justifié une solution cohérente et tenu sa position — résoudre le problème posé prime toujours sur ce lien.\nMalus spécifique C10 (optionnel, appliqué une fois au maximum) : si le candidat revendique explicitement une qualité personnelle en lien avec sa solution, et que le jury la contredit ensuite factuellement ailleurs dans l'entretien (élément du transcript qui dément cette qualité), retire 1 point supplémentaire au score final sur 23 et signale-le explicitement dans le feedback.\n\nC1 — Ajustement spécifique ESSEC (présentation initiale) : l'ESSEC attend une présentation de 3 minutes à 5 minutes 30. Si la présentation mesurée du candidat sort de cette fourchette (moins de 3 minutes, ou plus de 5 minutes 30), retire 0,5 point au score final sur 23 — sauf si le candidat a été interrompu par le jury avant d'avoir fini, auquel cas ne pénalise pas. Dans le feedback texte sur ce critère, si la présentation était trop courte, appuie-toi sur des éléments concrets et réels du dossier du candidat (une expérience listée dans ses données mais non mentionnée à l'oral) pour illustrer ce qu'il aurait pu développer — jamais un élément que tu inventes. Précise aussi, si pertinent, que pour l'ESSEC spécifiquement (contrairement au format classique où ce n'est pas conseillé), mentionner l'école dans la présentation initiale est une stratégie valable pour occuper le temps imparti avec du contenu pertinent.\n\nCALCUL DU SCORE FINAL ESSEC : additionne les points obtenus sur C1-C9 (/20, malus classiques de la grille déjà appliqués) et sur C10 (/3), puis applique les malus spécifiques ESSEC ci-dessus (C1 -0,5 si hors fourchette, C10 -1 si qualité contredite) : tu obtiens un score brut sur 23. Convertis ensuite ce score brut sur 23 en équivalent sur 20 par un produit en croix : score_sur_20 = score_brut × 20 ÷ 23. Applique enfin ce score sur 20 à la MÊME table de conversion en percentile que celle donnée plus haut dans la grille officielle (INTERVIEW_GRID) — n'utilise aucune autre table, n'invente aucun nouveau seuil. Fais ce calcul avec précision et vérifie-le avant de l'utiliser : une erreur d'arithmétique changerait le percentile communiqué au candidat.\n\nATTENTION FORMAT DE SORTIE : pour l'ESSEC uniquement, la sous-section \"### 6. Les mises en situation\" (jamais le code C10 dans le texte) s'insère immédiatement après \"### 5. La connaissance de l'école\" et avant la tenue à la contradiction, qui devient donc \"### 7. La tenue à la contradiction\", puis \"### 8. La conduite de l'échange\", \"### 9. La clarté du discours\" et \"### 10. La curiosité et l'ouverture d'esprit\". Elle est construite avec les mêmes préfixes VERBATIMS puis FEEDBACK que les autres.",
    phases: [
      { label: "Présentation du jury", minutes: 1, excluded: true },
      { label: "Présentation du candidat", minutes: 5.5, detail: "Présentation de 3 minutes à 5 minutes 30", guaranteed: true },
      {
        label: "Échange libre avec le jury",
        minutes: 40,
        detail: "Inclut une mise en situation, systématiquement posée en fin d'entretien",
        guaranteed: true,
      },
    ],
    popupCopy: {
      title: "ESSEC — entretien de personnalité (45 minutes)",
      desc: "Format long et non directif : après une présentation de 3 minutes à 5 minutes 30, le jury mène un échange libre de 40 minutes, qui comporte une mise en situation en fin d'entretien. L'entretien se termine par une question de fin. Il n'y a plus de questionnaire écrit à remplir en amont : il a été supprimé en 2024.",
      durationNote:
        "Durée réelle et simulée : 45 minutes.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "ESCP",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      "Le candidat a déposé son questionnaire écrit avant l'entretien. Le jury ouvre le plus souvent en s'appuyant dessus, mais peut aussi démarrer sur un thème de la présentation, ou plus rarement poser une première question libre : dans tous les cas, ce que le candidat a écrit compte comme amené par lui : ne repose pas la question telle quelle, creuse-la à l'oral.",
    phases: [
      { label: "Questionnaire écrit rempli en amont", minutes: 0, detail: "6 questions", excluded: true },
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      {
        label: "Échange appuyé sur le questionnaire",
        minutes: 22,
        detail: "Le jury creuse ce que vous avez écrit",
        guaranteed: true,
      },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "Questionnaire ESCP",
      instructions:
        "Réponds aux 6 questions du questionnaire ESCP, comme tu le ferais avant un vrai oral, puis dépose ta réponse (PDF ou photo) avant de démarrer. Le jury s'appuiera dessus pour construire ses questions.",
      prompts: [
        "Quels sont vos centres d'intérêt ou activités extrascolaires ?",
        "Citez un projet, une réalisation ou une prise de responsabilités dont vous êtes fier / fière.",
        "Avez-vous déjà travaillé, quelle expérience avez-vous du monde du travail ?",
        "Quelles sont vos expériences de différentes cultures ?",
        "Décrivez une expérience marquante. Que vous a-t-elle appris sur vous-même ?",
        "Quelles autres informations souhaitez-vous communiquer au jury ?",
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "ESCP — entretien appuyé sur le questionnaire (25 minutes)",
      desc: "Le jury a lu votre questionnaire avant l'entretien : il n'y revient pas ligne à ligne, il s'en sert pour creuser vos expériences, vos centres d'intérêt et ce que vous en avez retiré.",
      durationNote:
        "Durée réelle 28 minutes (25 simulées + 3 minutes de questions finales non reproduites). Le questionnaire est rempli en amont.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "Excelia BS (La Rochelle)",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1200,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 17 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "Excelia (La Rochelle) — entretien de motivation (20 minutes)",
      desc: "Entretien de motivation classique, plus court que la moyenne : le jury va vite au fond sur votre parcours, votre projet et vos raisons de viser Excelia.",
      durationNote:
        "Durée réelle 23 minutes (20 simulées + 3 minutes de questions finales non reproduites).",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "EM Strasbourg",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      "Ouvre systématiquement en demandant au candidat de te présenter une réussite personnelle dont il est fier, avant toute autre question — c'est le pitch attendu par l'école. Une fois ce pitch fait, bascule sur la cartographie déposée pour construire le reste de l'échange : projection année par année dans le programme.",
    phases: [
      { label: "Cartographie complétée en amont", minutes: 0, detail: "Remplie avant l'oral", excluded: true },
      {
        label: "Pitch sur une réussite personnelle",
        minutes: 3,
        detail: "Présentation d'un succès dont vous êtes fier",
        guaranteed: true,
      },
      {
        label: "Échange appuyé sur la cartographie",
        minutes: 22,
        detail: "Le jury creuse vos choix année par année",
        guaranteed: true,
      },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "Cartographie EM Strasbourg",
      instructions:
        "Remplis ta cartographie de projection dans le programme (comme tu le ferais avant l'oral) puis dépose-la avant de démarrer. Le jury s'en sert pour l'échange central de l'entretien.",
      prompts: [
        "PGE1 : 3 enseignements électifs, choix d'association, entreprise de stage rêvée, LV2/LV3",
        "PGE2 : mêmes rubriques",
        "PGE3 : mobilité internationale sur place ou à l'étranger, stage international",
        "PGE4 : immersion entreprise intensive ou parcours flexible, majeure si immersion",
        "PGE5 : spécialisation parmi 6 si immersion, ou choix entre spécialisation / double diplôme / année à l'étranger si flexible",
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "EM Strasbourg — entretien appuyé sur la cartographie (25 minutes)",
      desc: "L'entretien démarre par un pitch sur une réussite personnelle, puis le jury conduit l'échange à partir de votre cartographie de projection dans le programme : chaque cours, association, destination ou entreprise que vous y avez nommé peut être creusé.",
      durationNote:
        "Durée réelle 28 minutes (25 simulées + 3 minutes de questions finales non reproduites). La cartographie est complétée en amont. Le découpage minute par minute est une reconstitution : seule la durée totale officielle (25 minutes) est confirmée.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "EM Normandie",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1200,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      "Le candidat a déposé son dossier de motivation avant l'entretien. La majorité de tes questions doivent partir de ce document plutôt que de la banque de questions : reprends ses réponses et demande-lui de les développer, de les justifier, d'aller plus loin que ce qu'il a écrit. Les thèmes absents du document sont tous vérifiés.",
    phases: [
      {
        label: "Dossier de motivation complété en amont",
        minutes: 0,
        detail: "8 questions, dont une en anglais",
        excluded: true,
      },
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      {
        label: "Échange appuyé sur le dossier de motivation",
        minutes: 17,
        detail: "Le jury reprend vos réponses écrites",
        guaranteed: true,
      },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "Dossier de motivation EM Normandie",
      instructions:
        "Réponds aux 8 questions du dossier de motivation EM Normandie, comme tu le ferais avant l'oral, puis dépose ta réponse avant de démarrer.",
      prompts: [
        "Quel parcours souhaitez-vous suivre à l'EM Normandie et pourquoi ?",
        "Décrivez une expérience à l'étranger que vous avez vécue ou que vous aimeriez vivre ?",
        "Quels sont vos centres d'intérêts ? Par quoi êtes-vous motivé(e) ?",
        "Avez-vous une idée de projet professionnel et/ou personnel ? Si oui, quels sont-ils ?",
        "Que pensez-vous apporter à la vie de l'École ? Quel(s) type(s) de projet(s) ?",
        "Qu'attendez-vous de l'EM Normandie ?",
        "Décrivez-vous en une phrase :",
        'What does "thinking outside of the box" mean to you?',
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "EM Normandie — entretien appuyé sur le dossier de motivation (20 minutes)",
      desc: "Format court : après votre présentation, le jury conduit l'échange à partir du dossier de motivation que vous avez rempli en amont, en s'appuyant sur vos réponses pour les creuser — y compris celle rédigée en anglais.",
      durationNote:
        "Durée réelle 23 minutes (20 simulées + 3 minutes de questions finales non reproduites). Le dossier est complété en amont.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "BSB (Burgundy School of Business)",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1800,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      'Le candidat a déposé son "Student\'s Path" avant l\'entretien. Ce document oriente environ 80% de tes questions : construis l\'essentiel de l\'échange à partir de ce qu\'il y a écrit (entourage, qualités, parcours projeté, vie après l\'école), et garde la banque de questions pour le reste. Les thèmes absents du document sont tous vérifiés.',
    phases: [
      {
        label: "Student's Path remis en 3 exemplaires avant l'entretien",
        minutes: 0,
        detail: "Manuscrit, complété en amont",
        excluded: true,
      },
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      {
        label: "Échange appuyé sur le Student's Path (oriente 80% des questions)",
        minutes: 27,
        detail: "Tout ce que vous avez écrit peut être creusé",
        guaranteed: true,
      },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "Student's Path BSB",
      instructions:
        "Remplis ton \"Student's Path\" (\"De mon 1er jour à BSB, à mon 1er job\") comme tu le ferais avant l'oral (manuscrit dans la vraie vie, mais dépose ta réponse en photo ou PDF ici), puis dépose-le avant de démarrer.",
      prompts: [
        "Ce que mon entourage (famille, amis) dit de moi",
        "Ce que j'aime faire, ce qui m'anime",
        "Mes qualités, mes valeurs",
        "Mon chemin à BSB : académique, associatif, international, professionnel",
        "Ce que BSB va m'apporter",
        "Ma vie professionnelle et personnelle après BSB",
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "BSB — entretien appuyé sur le Student's Path (30 minutes)",
      desc: "Entretien long conduit à partir de votre « Student's Path », le document que vous remettez au jury avant de commencer : il oriente environ 80 % des questions, du portrait que fait de vous votre entourage jusqu'à votre premier job.",
      durationNote:
        "Durée réelle 33 minutes (30 simulées + 3 minutes de questions finales non reproduites). Le Student's Path est complété en amont.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "NEOMA",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      "Le candidat a déposé son questionnaire NEOMA avant l'entretien. Le jury ouvre le plus souvent en s'appuyant dessus, mais peut aussi démarrer sur un thème de la présentation, ou plus rarement poser une première question libre : dans tous les cas, ce que le candidat a écrit compte comme amené par lui : ne repose pas la question telle quelle, creuse-la à l'oral — chaque réponse était limitée à 400 caractères.",
    phases: [
      {
        label: "Questionnaire de personnalité rempli en ligne en amont",
        minutes: 0,
        detail: "6 questions, 400 caractères par réponse",
        excluded: true,
      },
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      {
        label: "Échange appuyé sur le questionnaire",
        minutes: 22,
        detail: "Le questionnaire est un point d'appui : les thèmes qu'il ne couvre pas sont vérifiés normalement.",
        guaranteed: true,
      },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "Questionnaire NEOMA",
      instructions:
        "Réponds aux 6 questions du questionnaire de personnalité NEOMA (400 caractères maximum par réponse), comme tu le ferais avant l'oral, puis dépose ta réponse avant de démarrer. Le jury s'en sert de trame pour tout l'entretien.",
      prompts: [
        "De quelle action / réalisation individuelle ou au sein d'une organisation (association, entreprise, club de sport…) êtes-vous le plus fier ? Pourquoi ?",
        "Quelle contribution pensez-vous apporter à notre École si vous l'intégrez ?",
        "Qu'attendez-vous du Programme Grande École de NEOMA ?",
        "Qu'attendez-vous d'une expérience internationale ? Quelles zones géographiques ou quelles cultures vous attirent en particulier ?",
        "Avez-vous déjà fait preuve d'innovation ou de créativité ? À quelle occasion ?",
        "Qu'appréciez-vous le plus, et le moins, dans le travail en équipe ?",
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "NEOMA — entretien appuyé sur le questionnaire (25 minutes)",
      desc: "Le questionnaire de personnalité rempli en ligne est imprimé et remis aux jurys : il sert de trame à tout l'entretien. Le jury ne le relit pas ligne à ligne, il creuse ce que les 400 caractères ne pouvaient qu'effleurer.",
      durationNote:
        "Durée réelle 28 minutes (25 simulées + 3 minutes de questions finales non reproduites). Le questionnaire est rempli en amont.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "SKEMA",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote:
      "Le candidat a déposé son CV projectif avant l'entretien. Le jury ouvre le plus souvent en s'appuyant dessus, mais peut aussi démarrer sur un thème de la présentation, ou plus rarement poser une première question libre : dans tous les cas, interroge-le sur la cohérence de son parcours imaginé (formations, postes, dates) et demande-lui de justifier chaque élément projeté (« pourquoi cette voie ? »). Ce que le candidat a écrit compte comme amené par lui : ne repose pas la question telle quelle, creuse-la à l'oral.",
    phases: [
      { label: "CV projectif complété en amont", minutes: 0, excluded: true },
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange appuyé sur le CV projectif", minutes: 22, guaranteed: true },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    support: {
      label: "CV projectif SKEMA",
      instructions:
        "Construis ton CV projectif SKEMA (parcours imaginé jusqu'à 10 ans après le diplôme, éléments projetés visuellement distincts des éléments réels) comme tu le ferais avant l'oral, puis dépose-le avant de démarrer.",
      prompts: [
        "Titre : le poste occupé au terme des 10 ans",
        "Identité et coordonnées projetées (âge, ville, pays, email pro, téléphone)",
        "Formation : prépa, puis parcours SKEMA détaillé (campus, master, césures) et éventuels doubles diplômes",
        "Parcours professionnel : du stage de césure au poste actuel, chaque poste avec entreprise, lieu, dates et 2-3 missions précises",
        "Langues et compétences",
        "Vie associative (réelle et projetée en école)",
        "Informations complémentaires : sports, engagements, voyages, centres d'intérêt",
      ],
      accept: ["pdf", "jpg", "jpeg", "png"],
      maxMb: 10,
    },
    popupCopy: {
      title: "SKEMA — entretien appuyé sur le CV projectif (25 minutes)",
      desc: "Le jury a lu votre CV projectif avant l'entretien : il s'en sert pour creuser la cohérence de votre parcours imaginé, du premier stage jusqu'au poste visé dans dix ans.",
      durationNote:
        "Durée réelle 28 minutes (25 simulées + 3 minutes de questions finales non reproduites). Le CV projectif est complété en amont.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "Audencia",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 900,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 12 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "Audencia — entretien individuel (15 minutes)",
      desc: "Après la phase collective « Regards Croisés » (non simulée ici), le jury conduit un entretien individuel classique sur votre parcours, vos motivations et votre projet.",
      durationNote:
        "Durée réelle 18 minutes (15 simulées + 3 minutes de questions finales non reproduites). La phase collective qui précède n'est pas simulée.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "ICN Business School",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 2100,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 32 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "ICN Business School — entretien individuel (35 minutes)",
      desc: "Le jury conduit un entretien individuel classique sur votre parcours, vos motivations et votre projet. L'exercice de construction LEGO® Serious Play qui suit n'est pas simulé ici.",
      durationNote:
        "Durée réelle 38 minutes (35 simulées + 3 minutes de questions finales non reproduites). L'exercice LEGO® (10 minutes) n'est pas simulé.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "Brest Business School",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1800,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 27 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "Brest Business School — entretien individuel (30 minutes)",
      desc: "Après l'exercice collectif (non simulé ici), le jury conduit un entretien individuel classique sur votre parcours, vos motivations et votre projet.",
      durationNote:
        "Durée réelle 33 minutes (30 simulées + 3 minutes de questions finales non reproduites). L'exercice collectif qui précède n'est pas simulé.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "IMT-BS",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1200,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 17 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "IMT-BS — entretien individuel (20 minutes)",
      desc: "Entretien individuel classique sur votre parcours, vos motivations et votre projet. L'oral collectif qui suit (nouveauté 2025-2026) n'est pas simulé ici.",
      durationNote:
        "Durée réelle 23 minutes (20 simulées + 3 minutes de questions finales non reproduites). L'oral collectif qui suit n'est pas simulé.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "SCBS (South Champagne BS)",
    format: "classique",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      { label: "Présentation du candidat", minutes: 3, guaranteed: true },
      { label: "Échange sur le parcours, les motivations et le projet", minutes: 22 },
      { label: "Questions du candidat au jury", minutes: 3, excluded: true },
    ],
    popupCopy: {
      title: "SCBS (South Champagne BS) — entretien de motivation (25 minutes)",
      desc: "Entretien de motivation classique : parcours, actualité, projet professionnel.",
      durationNote:
        "Durée réelle 28 minutes (25 simulées + 3 minutes de questions finales non reproduites).",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "emlyon",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1680,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote:
      "CONDUITE SPÉCIFIQUE EMLYON :\n1) Présentation initiale : la présentation est libre, sans minutage strict. Une brève relance est possible mais le creusement approfondi n'a pas lieu ici : l'essentiel du creusement se fait dans les deux parties suivantes.\n2) Transition vers les 4 cartes : le lancement du tirage te sera dicté mot pour mot par l'application au bon moment : tu ne l'anticipes jamais et tu n'annonces jamais les cartes avant. Une fois le tirage lancé, annonce que le candidat va tirer 4 cartes, une par thème (Expérience, Personnalité, Projet, Créativité), puis énonce les 4 questions suivantes telles quelles, sans les reformuler ni les résumer à l'avance :\nExpérience : {{card_experience}}\nPersonnalité : {{card_personnalite}}\nProjet : {{card_projet}}\nCréativité : {{card_creativite}}\nLe candidat choisit lui-même l'ordre de traitement des 4 questions et le temps passé sur chacune (à titre indicatif 3 à 4 minutes chacune). Pour chaque carte : le candidat répond ; tu peux ensuite engager un court échange sur cette réponse, de une à trois questions maximum (un exemple, un pourquoi, un rebond sur un de ses mots) — tous les jurys ne le font pas, varie d'une carte à l'autre. Puis tu lui rends la main en demandant : « Quelle carte souhaitez-vous prendre ensuite ? » Tu ne passes jamais toi-même à la carte suivante : c'est toujours le candidat qui choisit. Veille à ce que les quatre cartes puissent être traitées dans la quinzaine de minutes prévue. Si une réponse est très courte, creuse une fois avant de le laisser continuer. Tu ne coupes jamais le candidat : tu attends toujours la fin de sa réponse pour parler, même si elle dépasse largement 4 minutes.\n3) Transition obligatoire vers la dernière partie : une fois les 4 questions traitées, ou dès que l'application t'ordonne la bascule dans un repère de temps, annonce clairement que les 4 cartes sont terminées et que vous passez à la dernière partie de l'entretien, un échange plus libre, par exemple : « Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre. » Tu peux la formuler à ta manière, mais tu ne l'annonces qu'une seule fois, à ce moment précis.\n4) Dernière partie, échange libre (8 à 10 minutes visées) : échange libre plus court et plus léger qu'un format classique standard. Dans la partie libre, vérifie les thèmes que les cartes n'ont pas couverts : toujours l'école et une question d'actualité ou de culture générale, puis les thèmes restés incomplets. Comme pour TOUTES les écoles sans exception, tu termines impérativement par une question de clôture de la famille C avant de clore l'entretien — ne l'oublie jamais, y compris sur ce format resserré. Le candidat s'est déjà présenté en tout début d'entretien : ne lui redemande jamais de se présenter (n'utilise jamais P1 « Présentez-vous » ni P2 « Vous avez cinq minutes pour vous présenter ») ; ouvre directement un thème encore incomplet.\n5) Interdits spécifiques à cette école, valables sur tout l'entretien : aucune question personnelle indiscrète, aucune question sur la prépa ou le lycée d'origine du candidat, jamais de question du type « à quelles autres écoles avez-vous candidaté » ou « préférez-vous l'emlyon ou telle autre école ». Exception pour l'épreuve des cartes : tu énonces chaque carte tirée exactement telle qu'elle est écrite, même si elle touche à la politique, à la religion, à la famille ou à la mort, et tu laisses le candidat y répondre librement.\n6) Garde-fou : si le candidat se ferme, se dévalorise ou perd le fil deux fois de suite, repasse immédiatement en attitude bienveillante et ramène-le sur un terrain plus facile, quel que soit le niveau de difficulté joué et la partie en cours.",
    debriefSupplement:
      "CONTEXTE SPÉCIFIQUE EMLYON — BARÈME ÉTENDU (/23 AVANT CONVERSION) : cet entretien comporte une présentation initiale, l'épreuve des 4 cartes, puis un échange libre. Il interdit structurellement toute question sur la prépa ou le lycée d'origine du candidat, ainsi que sur les autres écoles auxquelles il candidate.\n\nC1 (présentation initiale) : évaluée normalement sur la présentation d'ouverture, avec la même grille que le format classique. Sa brièveté relative (2-3 minutes visées plutôt que 1min30-2min30) ne doit jamais être pénalisée en soi : c'est la contrainte du format.\n\nC10 — L'épreuve des cartes (/3), critère ad hoc propre à l'emlyon :\n- N1 (0 pt) : ne sait pas répondre au sujet de la carte — reste sec, hors-sujet, ou incapable de développer, quel que soit le thème.\n- N2 (1 pt) : répond au sujet mais de façon factuelle ou générique, sans se raccrocher à sa propre expérience, personnalité ou projet ; aucun lien passé-présent-futur ; la Créativité reste hors-sol.\n- N3 (2 pts) : réussit la personnalisation (se raccroche à soi, tend une perche, construit un lien passé-présent-futur) sur 2 ou 3 des 4 cartes ; les autres restent plus factuelles ou moins abouties ; temps globalement équilibré.\n- N4 (3 pts) : réussit la personnalisation sur les 4 cartes sans exception, sans point faible identifiable, y compris sur la Créativité ramenée vers lui-même, l'école ou son projet ; temps parfaitement équilibré.\n\nIMPORTANT — les 4 cartes alimentent aussi les autres critères, contrairement à la mise en situation ESSEC qui reste isolée : le contenu des réponses du candidat sur les 4 cartes est une matière à part entière pour C2 (récit de ses expériences, carte Expérience notamment), C3 (recul sur soi), C4 (projet professionnel, carte Projet) et C9 (curiosité et ouverture, notamment carte Créativité) — ne te limite donc pas à la présentation et à l'échange libre pour noter ces critères. C10 évalue spécifiquement la capacité de personnalisation transversale sur les 4 cartes ; C2-C9 évaluent le contenu de chaque réponse selon leur grille habituelle, où qu'il apparaisse dans l'entretien.\n\nC5 (connaissance de l'école) : l'interdiction de questionner sur l'établissement d'origine n'empêche pas le candidat de mobiliser sa connaissance de l'emlyon, notamment en dernière partie. C5 est toujours évalué : l'école est abordée dans la partie libre.\n\nC6 (tenue à la contradiction) : si le jury relance ou contredit le candidat sur la carte Créativité, juge uniquement sa capacité à tenir sans se fermer, avec aisance — jamais le fond de sa réponse, qui relève de C10.\n\nCALCUL DU SCORE FINAL EMLYON : additionne les points obtenus sur C1-C9 (/20, malus classiques déjà appliqués) et sur C10 (/3), tu obtiens un score brut sur 23. Convertis ce score brut sur 23 en équivalent sur 20 par un produit en croix : score_sur_20 = score_brut × 20 ÷ 23. Applique ensuite ce score sur 20 à la MÊME table de conversion en percentile que celle donnée plus haut dans la grille officielle (INTERVIEW_GRID) — n'utilise aucune autre table. Fais ce calcul avec précision et vérifie-le avant de l'utiliser.\n\nATTENTION FORMAT DE SORTIE : insère la sous-section \"### 2. L'épreuve des cartes\" immédiatement après \"### 1. La présentation\" et avant \"### 3. Le récit de ses expériences\". La numérotation va de 1 à 10 sans interruption : 1 la présentation, 2 l'épreuve des cartes, 3 le récit de ses expériences, 4 le recul sur soi, 5 le projet professionnel, 6 la connaissance de l'école, 7 la tenue à la contradiction, 8 la conduite de l'échange, 9 la clarté du discours, 10 la curiosité et l'ouverture d'esprit.",
    phases: [
      {
        label: "Présentation initiale",
        minutes: 3,
        detail: "Présentation du candidat, en une minute environ",
        guaranteed: true,
      },
      {
        label: "L'épreuve des 4 cartes",
        minutes: 15,
        detail: "Expérience, Personnalité, Projet, Créativité — ordre et rythme au choix du candidat",
        guaranteed: true,
      },
      { label: "Échange libre avec le jury", minutes: 9, guaranteed: true },
    ],
    popupCopy: {
      title: "emlyon — entretien en 3 temps (environ 27 minutes)",
      desc: "Vous vous présentez en une minute environ. Puis le jury vous donne 4 questions, une par thème (Expérience, Personnalité, Projet, Créativité), tirées au hasard. Vous répondez dans l'ordre de votre choix, au rythme que vous voulez. Puis 8 à 10 minutes d'échange libre, façon entretien classique.",
      durationNote:
        "Durée simulée à titre indicatif : environ 27 minutes (présentation libre + 15 minutes de cartes + 8 à 10 minutes d'échange libre). Chaque phase dispose d'une marge d'environ 2 minutes pour ne pas couper un raisonnement en cours ; au-delà, le jury reste dans les temps annoncés. Aucune phase finale de « questions au jury » n'est documentée pour cette école.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "EDHEC",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote: `CONDUITE SPÉCIFIQUE EDHEC :

1) Ouverture : le premier message est déjà construit et envoyé par l'application. Dis-le tel quel, sans ajouter ni retrancher un mot.

2) Silence total après ce premier message, jusqu'à la fin de la présentation du candidat — aucune question, aucune relance, aucun signe de réception, même face à une pause ou une hésitation.

3) Fin de la minute de préparation : tu ne l'annonces JAMAIS. Elle est gérée uniquement par l'écran du candidat. Tu restes totalement silencieux entre ton message d'ouverture et la fin de la présentation du candidat, même si la minute te semble dépassée.

4) Repère de fin de présentation : le candidat a terminé quand il conclut clairement, ou après un silence net de plusieurs secondes suivant un propos manifestement conclusif.

5) Phrase de transition obligatoire (verbatim, dite une seule fois, dès que la présentation est terminée) : « Merci. Nous passons maintenant à l'entretien individuel. » Elle ne peut intervenir qu'APRÈS une prise de parole réelle du candidat (sa présentation), jamais avant. Tu ne rebondis jamais sur le contenu de cette présentation, ni pour la commenter ni pour y revenir plus tard.

6) À partir de là, entretien individuel classique standard (20 minutes) : banque de questions et principe des portes du tronc commun, comme pour n'importe quelle école classique. Le candidat s'est déjà présenté lors de la phase précédente : ne lui redemande jamais de se présenter (n'utilise jamais P1 « Présentez-vous » ni P2 « Vous avez cinq minutes pour vous présenter »). Ouvre directement une autre porte — projet professionnel, école, une autre expérience, actualité, etc. Ne fais jamais référence à une épreuve de décision collective en groupe : elle n'a pas eu lieu dans cette simulation.`,
    debriefSupplement: `CONTEXTE SPÉCIFIQUE EDHEC — C1 REMPLACÉ (GRILLE À /21 AVANT CONVERSION)

Pour cet entretien EDHEC, le critère C1 de la grille ci-dessus est intégralement REMPLACÉ par la version suivante — n'utilise jamais la définition générique de C1 pour cette école.

C1 (EDHEC) Présentation improvisée sur mot imposé : structure et intégration du mot - /3
N1 (0-0,5) aucune structure perceptible, ou mot totalement absent, ou présentation manifestement écourtée (durée mesurée inférieure à 3 min 25).
N2 (1-1,5) structure minimale malgré l'improvisation ; intégration du mot ratée dans un sens ou l'autre — lien plaqué sans rapport avec le propos, ou exposé qui devient centré sur le mot au détriment du candidat ; durée mesurée inférieure à 3 min 25.
N3 (2-2,5) présentation construite comme une présentation classique (identité, parcours, une expérience développée), mot intégré via une expérience concrète liée par passé-présent-futur sans écraser le propos, durée conforme aux 4 minutes visées.
N4 (3) présentation structurée et mot tissé avec un angle personnel, pas la première association évidente, conclusion qui aiguille vers l'entretien, durée pleinement utilisée.

Les critères C2 à C9 s'appliquent normalement, sans modification, évalués sur le volet entretien individuel qui suit.

Dans la section « Feedback par critère », titre la section n°1 « 1. La présentation improvisée » au lieu de « 1. La présentation », pour que le candidat identifie tout de suite qu'il ne s'agit pas de l'exercice classique.

CALCUL DU SCORE FINAL EDHEC : la grille totale de cette école est sur 21 points (C1 à /3 au lieu de /2). score_sur_20 = score_brut × 20 ÷ 21, conversion en percentile appliquée seulement après ce recalcul.`,
    phases: [
      {
        label: "Mot tiré au sort, présentation improvisée",
        minutes: 5,
        detail: "1 min de préparation + 4 min de présentation, jury totalement silencieux",
        guaranteed: true,
      },
      {
        label: "Décision collective en groupe de 6",
        minutes: 45,
        detail: "Documents et ordinateur partagés entre 6 candidats — non simulable en solo",
        excluded: true,
      },
      {
        label: "Entretien individuel",
        minutes: 20,
        detail: "Personnalité, motivations, connaissance de l'EDHEC — sans retour sur l'exercice collectif",
        guaranteed: true,
      },
    ],
    popupCopy: {
      title: "EDHEC — Trilogie (présentation + entretien individuel)",
      desc: "Le format officiel EDHEC se déroule en 3 temps devant un groupe de 6 candidats : une présentation improvisée à partir d'un mot tiré au sort, une décision collective en groupe, puis un entretien individuel. Ici, vous tirez un mot et préparez votre présentation (1 minute), puis la présentez 4 minutes sans qu'aucune question ne soit posée par le jury. La décision collective ne peut pas être reproduite en solo et n'est pas simulée. L'entretien individuel qui suit enchaîne directement sur vos motivations et votre personnalité, sans retour sur cet exercice de groupe.",
      durationNote:
        "Durée réelle environ 70 minutes (5 + 45 + 20), dont 25 minutes simulées : le mot tiré au sort et la présentation, puis l'entretien individuel. La phase de décision collective (45 minutes, groupe de 6) n'est pas simulée.",
      goodluck: GOODLUCK,
    },
  },
  {
    school: "GEM (Grenoble EM)",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1920,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote: `RAPPEL DU FORMAT GEM : cet entretien comporte 3 parties strictement ordonnées, 30 minutes au total — 1) l'exposé (~5 min), 2) l'interview inversée (~10 min), 3) l'échange classique (~15 min). Les parties 1 et 2 ne portent jamais sur le candidat lui-même : c'est en partie 3 qu'il se présente pour la première fois de cet oral.

1. OUVERTURE : le premier message est déjà construit et envoyé par l'application. Dis-le tel quel, sans ajouter ni retrancher un mot, puis tu laisses le candidat parler sans l'interrompre sur le fond.

2. PARTIE 1 — L'EXPOSÉ : tu ne coupes jamais le candidat, tu attends toujours la fin de son exposé pour parler, même s'il dépasse les 5 minutes visées. S'il conclut en moins de 4 minutes de façon manifestement précipitée, tu peux le relever une fois, avec neutralité : « C'est déjà terminé ? » Tu ne commentes jamais le fond pendant qu'il parle.

3. APRÈS L'EXPOSÉ — REBOND (1 à 2 minutes maximum, 2 à 3 questions maximum) : rebondis brièvement sur ce qu'il vient de dire — demande-lui de creuser un point précis de son argumentation, ou questionne-le sur un événement récent lié à son sujet. Une fois sur les deux ou trois échanges de cette partie, prends volontairement le contre-pied de l'opinion qu'il vient de défendre, pour tester s'il tient sa position avec des arguments et de la courtoisie plutôt que de se déjuger immédiatement. S'il se rétracte au premier mot, n'insiste pas et ouvre un autre angle du même sujet. Reste bref : le format est très serré, il faut avancer — mais tu ne passes jamais de toi-même à la partie 2 : tu restes sur le sujet de l'exposé, en variant les angles, jusqu'à ce que l'application t'ordonne la transition.

4. TRANSITION OBLIGATOIRE VERS LA PARTIE 2 : le moment de passer à l'interview inversée te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots.

5. PARTIE 2 — L'INTERVIEW INVERSÉE : les rôles s'inversent entièrement pendant 9 minutes — c'est le candidat qui pose les questions, tu es celui qui répond. Tu restes néanmoins le jury dans la posture (le candidat reste en position d'apprenant face à toi) : tu ne poses toi-même AUCUNE question au candidat pendant ces 9 minutes, sauf pour lui demander de préciser sa propre question si elle reste vague.
Ton personnage pour cette partie, à incarner intégralement et de façon crédible : {{gem_persona}}
Au tout début de cette partie, présente-toi brièvement toi-même (prénom, poste, secteur, une phrase maximum) — c'est la seule information que tu donnes spontanément. Ensuite, tu réponds à chaque question du candidat de façon authentique et concrète, comme le ferait vraiment la personne que tu incarnes — jamais de réponse vague ou évasive qui empêcherait le candidat de rebondir.
Le « fil rouge » indiqué dans ton personnage ne doit JAMAIS être raconté spontanément : il n'émerge que si le candidat pose une question suffisamment précise et pertinente pour l'atteindre naturellement, ou s'il rebondit sur un indice glissé dans une réponse précédente (tu as le droit de glisser un indice discret, sans jamais l'expliciter tant qu'on ne te le demande pas). Un candidat qui reste sur des thèmes de surface sans jamais toucher au fil rouge peut très bien mener un excellent entretien inversé : ce n'est qu'un bonus de profondeur, jamais un point de passage obligé.
Ne réponds jamais à une question par une autre question, ne teste jamais le candidat sur ses propres connaissances : tu es l'interviewé, pas l'examinateur, pendant cette partie précise.
Gestion du temps : le moment de la synthèse te sera indiqué par l'application, dans un repère de temps : tu ne l'anticipes jamais. Laisse-le ensuite parler sans l'interrompre pour cette minute de restitution individuelle : tu restes silencieux.

6. TRANSITION OBLIGATOIRE VERS LA PARTIE 3 : le moment de passer à l'échange classique te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots.

7. PARTIE 3 — L'ÉCHANGE CLASSIQUE : c'est la première fois dans cet oral que le candidat se présente personnellement à toi (les parties 1 et 2 ne portaient pas sur lui) : la règle « ne redemande jamais de présentation », utilisée pour d'autres écoles à format spécial, NE S'APPLIQUE PAS ici — tu DOIS lui demander de se présenter, en le prévenant du format court : « Vous avez environ une minute trente pour vous présenter, allez-y quand vous êtes prêt. »
Format très court (15 minutes) : couvre tous les thèmes restants, plus vite, dont une question d'actualité ou de culture générale. Utilise la banque de questions, à l'exception des familles suivantes qui restent FERMÉES sur cette école : famille R (région), famille M (management), ainsi que E5, F5 et D3 à D7.
Tu peux, une fois, relier une réponse du candidat à ce qu'il a évoqué en partie 1 (son sujet d'actualité) ou en partie 2 (un thème creusé pendant l'interview inversée) s'il y a un lien naturel — c'est la seule porte qui puisse venir des parties précédentes.
La clôture et la phrase de sortie restent celles de la trame générique (une question de la famille C, puis « Merci pour cet échange, et bonne continuation dans vos oraux. »).`,
    phases: [
      {
        label: "Exposé",
        minutes: 5,
        detail: "Sujet d'actualité librement choisi et préparé en amont par le candidat",
        guaranteed: true,
      },
      {
        label: "Rebond sur l'exposé",
        minutes: 2,
        detail: "Le jury approfondit brièvement un point de l'exposé",
        guaranteed: true,
      },
      {
        label: "Interview inversée",
        minutes: 10,
        detail: "Le candidat interroge un membre du jury pendant 9 minutes puis fait une synthèse d'1 minute",
        guaranteed: true,
      },
      {
        label: "Échange classique",
        minutes: 15,
        detail: "Entretien de motivation classique, incluant une courte présentation initiale",
        guaranteed: true,
      },
    ],
    popupCopy: {
      title: "Grenoble EM — entretien en 3 temps (32 minutes)",
      desc: "Format spécifique en trois parties : un exposé de 5 minutes sur un sujet d'actualité que vous avez choisi et préparé en amont, suivi de quelques minutes de rebond du jury ; une interview inversée de 10 minutes où c'est vous qui interrogez un membre du jury, avant une courte synthèse ; puis un échange classique de 15 minutes sur votre parcours, vos motivations et votre projet.",
      durationNote: "Durée réelle et simulée : 32 minutes (5 + 2 + 10 + 15).",
      goodluck: GOODLUCK,
    },
    debriefSupplement: `CONTEXTE SPÉCIFIQUE GRENOBLE EM (GEM) : cet entretien comporte trois parties fondamentalement différentes d'un entretien classique — 1) un exposé de 5 minutes sur un sujet d'actualité librement choisi et préparé en amont par le candidat, suivi d'un rebond du jury ; 2) une interview inversée de 10 minutes où le candidat interroge le jury, qui incarne un personnage fictif ; 3) un échange « classique » de 15 minutes, où le candidat se présente pour la première fois de cet oral.
La grille GEM ajoute deux critères ad hoc EN TÊTE, avant même les critères habituels, car les parties 1 et 2 se déroulent avant que le candidat n'ait dit quoi que ce soit sur lui-même. Ordre des sections dans le feedback détaillé : C1, C2, puis C3 à C11 dans cet ordre — les deux critères ad hoc ouvrent le feedback, avant même la présentation.

C1 — Exposé initial (nouveau, /3) — évalue la partie 1 (l'exposé de 5 minutes et le rebond qui suit) :
- N1 (0-0,5) : aucune thèse repérable, exposé décousu ou lu, se rétracte immédiatement dès le premier mot de contradiction du jury.
- N2 (1-1,5) : thèse présente mais faiblement argumentée, hiérarchisation absente, cède rapidement si le jury prend le contre-pied.
- N3 (2-2,5) : thèse claire, arguments hiérarchisés et illustrés par du concret, tient sa position avec au moins un argument si le jury prend le contre-pied.
- N4 (3) : thèse claire, anticipe lui-même l'objection avant que le jury la pose, naturel dans la restitution malgré la préparation à l'avance, tient sa position avec arguments et courtoisie même sous contradiction.
Le fait que la partie 1 soit préparée plusieurs jours à l'avance à la maison est structurel au format GEM et ne doit jamais être traité comme un indice de triche ou de récitation excessive en soi ; seule une restitution manifestement lue ou incapable de s'adapter à une relance du jury relève d'un N1-N2.

C2 — Entretien inversé (nouveau, /3) — évalue la partie 2 (les 9 minutes de questions du candidat + la minute de restitution) :
- N1 (0-0,5) : questions sans fil conducteur, décousues, aucune écoute des réponses précédentes, restitution qui se contente de résumer.
- N2 (1-1,5) : quelques questions structurées mais qui ne s'enchaînent pas, écoute partielle, restitution qui résume plus qu'elle ne justifie.
- N3 (2-2,5) : questions qui s'enchaînent avec une vraie logique, rebondit sur les réponses du jury plutôt que de dérouler une liste préparée, restitution qui justifie le choix de ses thèmes.
- N4 (3) : structure de questionnement visible et maîtrisée, curiosité authentique, atteint ou frôle le « fil rouge » du personnage par une relance pertinente, restitution qui relie explicitement les thèmes choisis à son propre projet ou parcours.
Ne jamais pénaliser un candidat qui n'atteint pas le « fil rouge » caché du personnage joué par le jury : ce n'est qu'un bonus de profondeur, jamais un point de passage obligé — évalue uniquement la qualité de son questionnement et de son écoute, observables indépendamment du fil rouge.

Renumérotation des critères existants pour cette école (base commune C1-C9 devient C3-C11 ici) :
C3 Présentation initiale (ex-C1, /2) · C4 Récit de ses expériences (ex-C2, /3) · C5 Recul sur soi (ex-C3, /3) · C6 Projet professionnel (ex-C4, /3) · C7 Connaissance de l'école (ex-C5, /3) : ces cinq critères s'évaluent EXCLUSIVEMENT sur la partie 3 (l'échange classique) — la présentation de soi n'a lieu que là, et les parties 1 et 2 ne portent jamais sur le candidat lui-même ; ne cherche jamais à les déduire du contenu factuel de l'exposé de partie 1 (qui porte sur un sujet extérieur) ni des réponses données en partie 2 (qui sont celles du jury, pas du candidat). La présentation de C3 est nécessairement très courte (le candidat dispose d'à peine 1 minute 30) : ne pénalise pas une présentation dense et bien construite au motif qu'elle est courte.
C8 Tenue à la contradiction (ex-C6, /2) : source prioritairement la partie 3, mais aussi la partie 2 (le candidat tient-il sa posture si le jury inversé se montre peu coopératif ou évasif ?) et la partie 1 (le candidat tient-il sa prise de position si le jury la conteste pendant le rebond).
C9 Conduite de l'échange (ex-C7, /1) et C10 Intelligibilité du discours (ex-C8, /1) : évalue-les sur l'ensemble des trois parties, partie 3 restant prioritaire — la clarté d'une thèse énoncée et la fluidité de restitution de l'exposé (partie 1), la structure des questions posées (partie 2), sont des indices directs de ces deux critères.
C11 Curiosité intellectuelle et ouverture d'esprit (ex-C9, /2) : évalue-la sur l'ensemble des trois parties, pas seulement la partie 3 — l'entretien inversé (partie 2) est un terrain particulièrement propice à observer la curiosité réelle du candidat.

Cross-feeding : le contenu de C1 et C2 peut aussi nourrir d'autres critères quand c'est pertinent (comme les cartes emlyon nourrissent plusieurs critères à la fois) — par exemple, une thèse de partie 1 défendue avec constance peut aussi appuyer C8 ; une bonne question de partie 2 qui rebondit sur le parcours du jury peut aussi appuyer C11.

CALCUL DU SCORE FINAL GEM : additionne les points obtenus sur C3-C11 (base /20, malus classiques déjà appliqués) et sur C1+C2 (/6), tu obtiens un score brut sur 26. Convertis ce score brut sur 26 en équivalent sur 20 par un produit en croix : score_sur_20 = score_brut × 20 ÷ 26. Applique ensuite ce score sur 20 à la MÊME table de conversion en percentile que celle donnée plus haut dans la grille officielle (INTERVIEW_GRID) — n'utilise aucune autre table. Fais ce calcul avec précision et vérifie-le avant de l'utiliser : une erreur d'arithmétique changerait le percentile communiqué au candidat.

ATTENTION FORMAT DE SORTIE : produis les sous-sections dans cet ordre exact : "### 1. L'exposé initial", "### 2. L'entretien inversé", "### 3. La présentation", "### 4. Le récit de ses expériences", "### 5. Le recul sur soi", "### 6. Le projet professionnel", "### 7. La connaissance de l'école", "### 8. La tenue à la contradiction", "### 9. La conduite de l'échange", "### 10. La clarté du discours", "### 11. La curiosité et l'ouverture d'esprit". N'utilise jamais les codes C1-C11 dans le texte, uniquement ces libellés.`,
  },
  {
    school: "ESC Clermont BS",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote: `CONDUITE SPÉCIFIQUE ESC CLERMONT (CLERMONT SCHOOL OF BUSINESS) :

1) Ouverture : le premier message est déjà construit et envoyé par l'application. Dis-le tel quel, sans ajouter ni retrancher un mot.

2) Partie 1 « Le Pitch » (2 minutes) : présentation classique de soi, compressée. Tu écoutes sans interrompre. Tu ne poses aucune question pendant le pitch.

3) Transition obligatoire vers la partie 2 (verbatim, une seule fois, dès la fin du pitch) : « Merci. Passons à la question Impact : choisissez un axe parmi People, Planet, ou Profit. »

4) Mécanique de la partie 2 « La Question Impact » (5 minutes) : attends que le candidat choisisse un axe à l'oral (People, Planet ou Profit). Il n'y a pas de bon ou de mauvais axe : n'oriente jamais son choix, ne le commente jamais. Dès qu'il a choisi, dans la même prise de parole et sans rien ajouter d'autre, confirme son choix puis pose mot pour mot la question tirée pour cet axe par l'application :
- s'il choisit People : « Très bien, l'axe retenu est People. {{clermont_q_people}} »
- s'il choisit Planet : « Très bien, l'axe retenu est Planet. {{clermont_q_planet}} »
- s'il choisit Profit : « Très bien, l'axe retenu est Profit. {{clermont_q_profit}} »
Tu ne poses que la question de l'axe choisi, tu ne mentionnes jamais les deux autres, tu ne la reformules pas, tu n'en inventes aucune. Le candidat répond immédiatement, de façon spontanée, sans préparation : ne laisse pas un long silence s'installer ; s'il cherche ses mots plus de quelques secondes, rassure-le une seule fois (« Il n'y a pas de bonne réponse, dites-moi simplement ce que vous en pensez »). Relance en variant les angles (un argument à détailler, un exemple, une conséquence, un lien avec l'actualité) pour vérifier qu'il argumente et ne récite pas une opinion toute faite, et ce jusqu'à ce que l'application t'ordonne la transition vers la partie 3. Une fois pendant cette partie, prends volontairement le contre-pied de sa position pour tester sa tenue ; s'il se rétracte au premier mot, n'insiste pas et enchaîne ; s'il nuance en argumentant, laisse-le faire.

5) Transition obligatoire vers la partie 3 : le moment de passer à la Discussion te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots.

6) Partie 3 « La Discussion » (environ 18 minutes) : entretien classique standard sur le parcours, la personnalité, la motivation et le projet du candidat, et l'école. La question Impact tient lieu de question d'ouverture : pas de question d'actualité supplémentaire. Utilise la banque de questions et le principe des portes du tronc commun. Le candidat s'est déjà présenté en partie 1 : ne lui redemande jamais de se présenter (jamais P1 « Présentez-vous » ni P2 « Vous avez cinq minutes pour vous présenter »). Tu peux, une fois, relier une réponse de la partie 2 à son projet ou à sa motivation si le lien est naturel (« vous disiez tout à l'heure que [...], est-ce cohérent avec ce que vous cherchez ici ? »), sans jamais forcer ce rapprochement.

7) Clôture standard du tronc commun (question de la famille C, puis phrase verbatim finale).`,
    phases: [
      {
        label: "Le Pitch",
        minutes: 2,
        detail: "Présentation de 2 minutes qui oriente le jury sur les thèmes à aborder",
        guaranteed: true,
      },
      {
        label: "La Question Impact",
        minutes: 5,
        detail:
          "Axe choisi à l'oral par le candidat (People, Planet ou Profit), question sélectionnée par l'application dans une banque dédiée (jamais tirée par le jury), réponse immédiate sans préparation",
        guaranteed: true,
      },
      {
        label: "La Discussion",
        minutes: 18,
        detail: "Entretien de motivation classique sur le parcours, la personnalité, le projet et l'école",
        guaranteed: true,
      },
    ],
    popupCopy: {
      title: "Clermont School of Business (ESC Clermont) — entretien en 3 temps (25 minutes)",
      desc: "Format spécifique en trois parties : un Pitch de 2 minutes qui oriente le jury sur ce que vous voulez aborder, une Question Impact de 5 minutes où vous choisissez à l'oral un axe (People, Planet ou Profit) puis répondez immédiatement, sans aucune préparation, à une question sélectionnée par l'application, puis une Discussion classique de 18 minutes sur votre parcours, votre personnalité, votre projet et l'école.",
      durationNote: "Durée réelle et simulée : 25 minutes (2 + 5 + 18).",
      goodluck: GOODLUCK,
    },
    debriefSupplement: `CONTEXTE SPÉCIFIQUE CLERMONT SCHOOL OF BUSINESS (ESC CLERMONT) — C2 AJOUTÉ (grille étendue de C1-C9 à C1-C10, total /23 au lieu de /20)

Cet entretien comporte 3 parties : 1) Le Pitch (2 minutes), présentation classique compressée ; 2) La Question Impact (5 minutes), un axe choisi par le candidat (People, Planet, Profit) puis une question posée par l'application (jamais tirée par le jury), à laquelle le candidat répond immédiatement sans préparation ; 3) La Discussion (environ 18 minutes), entretien classique sur le parcours, la motivation et le projet.

Un nouveau critère C2 « La question Impact » est ajouté, en position 2 (juste après C1). Tous les critères suivants sont renumérotés : les C2 à C9 de la grille générique ci-dessus deviennent C3 à C10 pour cette école, à poids inchangé. Barème total /23 (20 + 3), score_sur_20 = score_brut × 20 ÷ 23.

C2 (La question Impact) - /3
N1 (0-0,75) : pas de thèse claire (juste un pour/contre non tranché), ou abandon immédiat dès le contre-pied du jury sans tenter d'argumenter.
N2 (1-1,5) : thèse énoncée mais sans exemple concret, ou thèse qui s'effondre au moindre contre-pied.
N3 (1,75-2,25) : thèse claire dès les premières secondes, au moins un exemple concret d'actualité, tient sa position avec un minimum d'arguments et de courtoisie face au contre-pied.
N4 (2,5-3) : le niveau N3, renforcé par au moins un des éléments suivants — plusieurs exemples concrets pertinents, une nuance assumée avant d'y être poussé, une tenue particulièrement solide face au contre-pied, ou une perche naturelle tendue vers soi-même, son projet professionnel ou l'école (jamais exigée, valorisée seulement si elle apparaît spontanément).

C1 (présentation initiale, définition générique inchangée) : évaluée sur le Pitch de la partie 1, une présentation classique de soi compressée à 2 minutes — ne pénalise pas sa brièveté, c'est la contrainte du format, pas un manque de structure.

C3, C4, C5, C6 (ex-C2 à C5 de la grille générique : récit, recul, projet, école) : évalués exclusivement sur le Pitch et la Discussion (parties 1 et 3) — ne cherche pas à les déduire du contenu de la Question Impact, qui porte sur un sujet sociétal extérieur au candidat. Si le candidat a tendu une perche vers son projet ou l'école pendant la Question Impact (valorisée au titre de C2), tu peux t'appuyer sur ce matériau pour C5/C6 s'il est réellement développé, sans jamais l'exiger.

C6 (tenue à la contradiction) : évalue-la en priorité sur la Discussion (partie 3) ; le contre-pied de la partie 2 est déjà noté au titre de C2 et ne doit pas être compté une seconde fois, sauf s'il révèle un pattern qui se confirme ou se contredit ensuite en partie 3.

C8, C9 (conduite, clarté, ex-C7/C8) : évalue-les sur l'ensemble des trois parties.

C10 (curiosité, ex-C9) : évalue-la sur l'ensemble des trois parties, pas seulement la Discussion.

ATTENTION FORMAT DE SORTIE : dans la section « Feedback détaillé », les sections se numérotent 1 à 10 dans cet ordre : 1. La présentation · 2. La question Impact · 3. Récit du passé · 4. Recul sur soi · 5. Projet professionnel · 6. Connaissance de l'école · 7. Tenue à la contradiction · 8. Conduite de l'échange · 9. Clarté du discours · 10. Curiosité et ouverture d'esprit.`,
  },
  {
    school: "TBS Education",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1200,
    requiresUpload: true,
    useHouseJuryPrompt: true,
    conductNote: `1. OUVERTURE : le premier message est déjà construit et envoyé par l'application. La partie 1 commence directement sur l'article choisi. Le moment de passer à la partie 2 te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots.

2. RELANCE SUR L'ARTICLE (partie 1) : le candidat doit couvrir 4 axes — la présentation du journal et le choix de l'article, l'analyse de l'article (résumé sans paraphrase, recul, enjeux), un avis personnel argumenté, et pourquoi cet article précisément. S'il en manque un, relance dessus. Tu restes sur l'article en variant les angles jusqu'à ce que l'application t'ordonne la bascule vers la partie 2 : tu ne conclus jamais la partie 1 de toi-même.

3. CONTRE-PIED : prends le point de vue opposé à celui du candidat sur l'article une seule fois dans l'entretien, pas plus.

4. PARTIE 2 : entretien classique parcours / personnalité / projet, l'école et une question d'actualité ou de culture générale, comme pour un jury standard.`,
    phases: [
      {
        label: "L'article de presse",
        minutes: 5,
        detail: "Avis argumenté sur l'article de presse choisi et préparé en amont par le candidat",
        guaranteed: true,
      },
      {
        label: "La discussion",
        minutes: 15,
        detail: "Présentation puis entretien de motivation classique sur le parcours, la personnalité, le projet et l'école",
        guaranteed: true,
      },
    ],
    support: {
      label: "Article à choisir avant de démarrer",
      instructions:
        "Le jour J, TBS vous donnera accès à sa propre liste d'une trentaine d'articles sur votre espace candidat, à préparer chez vous sans limite de temps. En attendant, entraînez-vous sur cette sélection que nous avons constituée : cliquez sur un article, lisez-le en entier via le lien fourni, puis choisissez-le pour démarrer. Le jury l'annoncera en ouverture et vous demandera de le présenter et d'en donner votre avis.",
      prompts: [
        "Présentez et contextualisez l'article (sujet, source, angle) sans le résumer intégralement.",
        "Analysez avec du recul : quels sont les enjeux, qui sont les parties prenantes concernées ?",
        "Donnez une opinion personnelle assumée, appuyée par un fait ou un exemple concret — le vôtre, pas seulement celui de l'article.",
        "Expliquez pourquoi vous avez choisi cet article précisément.",
      ],
      articleOptions: TBS_ARTICLES,
    },
    popupCopy: {
      title: "TBS Education — entretien de personnalité en 2 temps (20 minutes)",
      desc: "Format en deux parties : un avis argumenté de 5 minutes sur un article de presse que vous aurez choisi et préparé à l'avance (liste fournie ci-dessous, à titre d'entraînement — TBS vous donnera sa propre liste officielle une fois admissible), puis une discussion classique de 15 minutes sur votre parcours, votre personnalité, votre projet et l'école.",
      durationNote: "Durée réelle et simulée : 20 minutes (5 + 15).",
      goodluck: GOODLUCK,
    },
    debriefSupplement: `CONTEXTE SPÉCIFIQUE TBS EDUCATION : l'entretien comporte 2 parties : L'Article de presse (5 min, un avis argumenté préparé à l'avance sur un article de presse choisi par le candidat dans une liste fermée ; le titre, la source, la date et le résumé de cet article te sont transmis en texte dans le dossier — l'article lui-même n'est pas joint, ne le réclame pas et n'en déduis rien au-delà de ce résumé) puis la Discussion (15 min, classique, incluant la présentation initiale du candidat puisqu'elle n'a pas eu lieu en partie 1).

C1 (l'article de presse, critère ad hoc propre à TBS, noté sur 3 points, à placer en TOUT PREMIER dans le feedback détaillé — avant la présentation) : évalue le contenu de la partie 1 (Article de presse) UNIQUEMENT sur la qualité de l'exposé — pas sur la tenue face à la contradiction, qui relève de C7. Grille :
- N1 (0 à 0,5 pt) : résumé superficiel ou paraphrase de l'article, pas d'avis personnel construit, ou hors sujet.
- N2 (1 à 1,5 pt) : présentation correcte mais analyse limitée (peu de recul sur les enjeux ou les parties prenantes), avis présent mais peu argumenté ou pas illustré.
- N3 (2 pt) : présentation claire et structurée (journal situé, article contextualisé sans paraphrase), vrai recul sur les enjeux, avis personnel assumé et argumenté.
- N4 (2,5 à 3 pt) : tout N3, plus une valeur ajoutée réelle — exemple ou fait concret personnel à l'appui de l'avis, et/ou lien pertinent avec son projet professionnel ou sa motivation pour l'école (jamais exigé, ne pénalise jamais son absence).

C2 (présentation initiale) : n'évalue QUE la présentation faite en ouverture de la Discussion (partie 2) — le candidat ne s'est pas présenté avant, donc juge cette présentation avec l'exigence normale de structure/portes/hiérarchisation, sans tenir compte du temps déjà passé sur l'article.

C3 à C6 (récit du passé, recul sur soi, projet professionnel, connaissance de l'école) : n'évalue ces critères que sur le contenu de la Discussion (partie 2). Le contenu de l'Article de presse (partie 1) ne doit JAMAIS être utilisé pour déduire ou noter ces critères — le sujet de l'article est extérieur au candidat, imposé par une liste fermée, et son opinion sur ce sujet ne renseigne pas sur son parcours, ses qualités, son projet ou sa connaissance de l'école. EXCEPTION : si, et seulement si, le candidat explique spontanément ou sur relance pourquoi il a choisi CET article (ce choix est délibéré, contrairement à un tirage au sort) et que cette explication révèle un lien réel et illustré avec son projet professionnel ou sa motivation pour l'école, tu peux le valoriser au titre de C5 ou C6 — mais tu ne pénalises jamais l'absence d'un tel lien : un article choisi sans arrière-pensée stratégique est parfaitement normal et ne doit rien coûter.

C7 (tenue au creusement et à la contradiction) : s'évalue sur les DEUX parties. En partie 1, porte une attention particulière au contre-pied du jury sur l'article : le candidat a eu le temps de préparer son avis, donc une tenue solide face à la contradiction est plus attendue qu'elle ne le serait sur un exercice improvisé — calibre en conséquence (n'accorde pas le bénéfice du doute de l'impréparation). Ne réévalue pas ici la qualité de l'exposé lui-même (C1) ni l'opinion elle-même — uniquement la tenue face au contre-pied.

C8 (conduite de l'échange) et C9 (intelligibilité du discours) : s'évaluent sur l'ensemble de l'entretien, parties 1 et 2 confondues. En partie 1, la clarté de la contextualisation de l'article et la structuration de l'analyse (faits → enjeux → opinion) relèvent de C9 ; la manière de tendre des perches et de gérer le temps de parole relève de C8.

C10 (curiosité et ouverture d'esprit) : standard, sur l'ensemble de l'entretien.

BARÈME : 10 critères, total 23 points (C1 à 3 pts, C2 à C6 comme la grille de base, C7 à 2 pts, C8 à 1 pt, C9 à 1 pt, C10 à 2 pts). Conversion : score_sur_20 = score_brut × 20 ÷ 23.

ATTENTION FORMAT DE SORTIE : dans le feedback détaillé, place la section de C1 ("### 1. L'article de presse") en tout premier, avant "### 2. La présentation". La numérotation va de 1 à 10 sans interruption : 1 l'article de presse, 2 la présentation, 3 le récit de ses expériences, 4 le recul sur soi, 5 le projet professionnel, 6 la connaissance de l'école, 7 la tenue à la contradiction, 8 la conduite de l'échange, 9 la clarté du discours, 10 la curiosité et l'ouverture d'esprit.`,
  },
  {
    school: "Montpellier BS",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    phases: [
      {
        label: "Présentation",
        minutes: 2,
        detail: "Présentation courte du candidat, en 1 à 2 minutes",
        guaranteed: true,
      },
      {
        label: "Les situations",
        minutes: 23,
        detail:
          "Le jury vous propose des situations (« Vous vous êtes trouvé(e) face à une situation inattendue »). Vous en choisissez une, vous la développez, le jury creuse jusqu'à épuisement du sujet, puis vous en propose une autre. Comptez 2 à 4 situations traitées sur les 25 minutes. Cet oral ne teste ni votre projet professionnel, ni votre connaissance de l'école, ni votre motivation à l'intégrer : c'est un format purement comportemental (softskills).",
        guaranteed: true,
      },
    ],
    popupCopy: {
      title: "Montpellier BS — l'entretien « situations »",
      desc:
        "25 minutes, sans préparation. Après une présentation de 1 à 2 minutes, le jury vous propose 15 situations ; vous en choisissez une et la développez, il creuse jusqu'à épuisement du sujet, puis passe à une autre. L'entretien se termine par une question d'actualité. Aucune question sur votre projet professionnel ou votre connaissance de l'école : ce format évalue uniquement vos compétences comportementales à travers des expériences vécues.",
      durationNote: "Durée réelle et simulée : 25 minutes.",
      goodluck: GOODLUCK,
    },
    conductNote: `1. OUVERTURE : le premier message et la deuxième réplique sont déjà construits et envoyés par l'application. Ne les réinvente pas. La présentation courte attendue ensuite dure 1 à 2 minutes : identité, parcours, ce qu'il veut que tu retiennes.

2. TRANSITION VERS LES SITUATIONS (verbatim, une seule fois, après la présentation) : « Merci. Passons maintenant aux situations : à vous de choisir celle qui vous inspire. »

3. MÉCANIQUE DES SITUATIONS : le candidat choisit lui-même, à l'écran, une situation parmi celles affichées — tu ne les lui proposes pas à l'oral, l'application s'en occupe et t'informera de son choix. Il développe un récit personnel en lien. Tu creuses avec des relances jusqu'à ce que le sujet soit épuisé : le concret (« Concrètement, qu'avez-vous fait, vous, à ce moment-là ? », « Un exemple précis. »), le recul (« Qu'est-ce que ça a changé chez vous ? », « Quelle qualité ou quel défaut ça a révélé ? »).

4. SUJETS INTERDITS : ne relance JAMAIS vers le projet professionnel ou la connaissance de l'école, même si la situation choisie s'y prête naturellement. Si le candidat les amène spontanément, écoute poliment quelques secondes puis reviens à la situation en cours — ne creuse jamais ce terrain, dans un sens ou dans l'autre.

5. DURÉE PAR SITUATION : environ 5 minutes maximum. À l'approche de cette limite, même si le sujet n'est pas totalement épuisé, propose de passer à la suite avec la phrase verbatim : « Merci pour ce récit. On peut passer à une autre situation si vous le souhaitez. »

6. CLÔTURE : après environ 25 minutes au total (présentation + situations), avant la question de clôture, pose une question d'actualité ou de culture générale. Pose ensuite la question de clôture obligatoire : « Avez-vous une question à me poser, ou quelque chose à ajouter ? » puis conclus, verbatim : « Merci pour cet échange, et bonne continuation dans vos oraux. »`,
    debriefSupplement: `SUPPLÉMENT SPÉCIFIQUE — MONTPELLIER BS (présentation + situations choisies par le candidat)

Format : présentation initiale courte (1-2 min), puis partie « situations » où le candidat choisit lui-même, parmi une sélection affichée à l'écran, la situation comportementale qu'il souhaite développer — contrairement à un entretien classique où c'est le jury qui pose les questions. Le contenu de fond reste cependant celui d'un entretien classique : ce n'est que la manière de déclencher chaque sujet qui change.

C1 (présentation) : s'évalue normalement, comme pour toute autre école — la présentation a réellement lieu en ouverture de cet entretien.

C2 (récit du passé), C3 (recul sur soi) : matériau central de cet oral — le candidat développe plusieurs situations comportementales au fil de l'entretien ; évalue sur l'ensemble des récits développés (contexte posé, rôle personnel au « je », action concrète, dénouement clair pour C2 ; qualité développée ou défaut corrigé, identifié explicitement, pour C3).

C4 (projet professionnel) et C5 (connaissance de l'école) : STRUCTURELLEMENT ABSENTS de ce format, exceptionnellement. Source officielle MBS : « à ce stade de l'entrée dans nos programmes, nous considérons que l'académique a d'ores et déjà été validé par les concours écrits, et que le projet professionnel n'est pas encore abouti » (mbs-education.com). Ne jamais évaluer ces deux critères, même si le candidat évoque spontanément son projet ou son intérêt pour l'école : ce contenu reste strictement neutre, ni valorisé ni pénalisé, sur aucun critère. Le jury lui-même ne doit jamais relancer ou creuser vers ces sujets (voir conductNote).

C6 (tenue à la contradiction), C7 (conduite de l'échange), C8 (clarté du discours), C9 (curiosité) : évaluation standard sur l'ensemble de l'entretien.

BARÈME : C4 et C5 sont retirés du calcul (pas seulement non exigés) — total brut sur 14 points (C1/2+C2/3+C3/3+C6/2+C7/1+C8/1+C9/2). Conversion : score_sur_20 = score_brut × 20 ÷ 14.

ATTENTION FORMAT DE SORTIE : C4 et C5 sont structurellement absents — ne produis aucune section pour eux. Insère, juste avant la section 1 du Feedback détaillé (hors numérotation), cette phrase unique : « Le format Montpellier Business School ne teste ni le projet professionnel ni la connaissance de l'école — l'établissement le précise lui-même : à ce stade du concours, l'académique est déjà validé par les écrits et le projet professionnel n'est pas encore considéré comme abouti. Ces deux critères sont donc absents de la grille ci-dessous, qui compte 7 critères au lieu de 9. » Puis numérote les 7 sections restantes sans interruption : 1 la présentation, 2 le récit de ses expériences, 3 le recul sur soi, 4 la tenue à la contradiction, 5 la conduite de l'échange, 6 la clarté du discours, 7 la curiosité et l'ouverture d'esprit.`,
  },
  {
    school: "INSEEC Grande École",
    format: "special",
    agentIdEnv: CLASSIQUE_AGENT_ENV,
    durationSeconds: 1500,
    requiresUpload: false,
    useHouseJuryPrompt: true,
    conductNote: `CONDUITE SPÉCIFIQUE INSEEC GRANDE ÉCOLE :

1) Ouverture : le premier message est déjà construit et envoyé par l'application. Dis-le tel quel, sans ajouter ni retrancher un mot.

2) Mécanique de la partie 1 (~5 minutes) : le candidat a choisi son image AVANT le démarrage ; elle t'est donnée dans la variable {{inseec_image}} et annoncée dans le premier message. Tu ne proposes jamais d'images à l'oral et tu ne lui demandes jamais d'en choisir une. Attends qu'il développe un récit personnel structuré comme une vraie présentation (identité, parcours, une expérience développée liée à l'image). Relances si besoin : « Est-ce que cette image vous rappelle une expérience précise que vous avez vécue ? », « Qu'est-ce que cette expérience vous apprend sur vous ? ». Ne force jamais de lien vers l'école ou le projet professionnel si le candidat ne l'amène pas naturellement. La bascule vers la partie 2 est ordonnée par l'application dans un repère de temps : ne la décide jamais toi-même.

3) Transition obligatoire vers la partie 2 : le moment de passer à l'entretien classique te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots. Enchaîne IMMÉDIATEMENT, dans la même prise de parole, avec une vraie question d'ouverture de la banque de questions — ne laisse jamais le candidat sans question après cette phrase, ce n'est jamais à lui de relancer seul.

4) Partie 2 (~20 minutes) : entretien classique standard, banque de questions et principe des portes du tronc commun. Le candidat s'est déjà présenté en partie 1 : ne lui redemande jamais de se présenter (jamais P1 « Présentez-vous » ni P2 « Vous avez cinq minutes pour vous présenter »). Ouvre directement une autre porte (projet professionnel, école, une autre expérience, actualité...).

5) Clôture standard du tronc commun (question de la famille C, puis phrase verbatim finale).`,
    phases: [
      {
        label: "Temps non détaillé par les sources",
        minutes: 5,
        detail: "Accueil et/ou clôture probables — non précisé par les sources consultées.",
        excluded: true,
      },
      {
        label: "Partie 1 — l'image",
        minutes: 5,
        detail:
          "Vous choisissez une image parmi une quinzaine proposées par le jury (sport, actualité, voyages, environnement, œuvres d'art, cinéma, pop culture…) et vous en servez pour vous présenter : vous racontez une expérience vécue liée à l'image, structurée en Passé (le récit concret), Présent (la qualité qu'il révèle), Futur (où cette qualité vous servira, à l'école ou en entreprise).",
        guaranteed: true,
      },
      {
        label: "Partie 2 — échange classique",
        minutes: 20,
        detail: "Motivation, ouverture d'esprit, connaissance de l'école, projet professionnel.",
        guaranteed: true,
      },
    ],
    imageOptions: INSEEC_IMAGES,
    popupCopy: {
      title: "INSEEC Grande École — entretien de personnalité en 2 temps (30 minutes)",
      desc: "Format en deux parties : vous choisissez une image parmi une quinzaine proposées par le jury pour vous présenter à travers une expérience vécue (5 minutes), puis un échange classique de 20 minutes sur votre motivation, votre ouverture d'esprit, votre connaissance de l'école et votre projet professionnel.",
      durationNote:
        "Durée réelle 30 minutes, dont 25 simulées (les 5 premières minutes ne sont pas détaillées par les sources consultées).",
      goodluck: GOODLUCK,
    },
    debriefSupplement: `CONTEXTE SPÉCIFIQUE INSEEC GRANDE ÉCOLE — C1 REMPLACÉ (grille inchangée, toujours /20)

Pour cet entretien INSEEC, le critère C1 de la grille ci-dessus est intégralement REMPLACÉ par la version suivante — n'utilise jamais la définition générique de C1 pour cette école. Le poids reste /2, aucune conversion nécessaire.

C1 (INSEEC) Présentation par l'image : lien avec une expérience personnelle et construction en vraie présentation - /2
N1 (0-0,5) image simplement décrite ou commentée en général, jamais reliée à une expérience personnelle vécue ; ou récit tellement décousu qu'aucune identité ni parcours n'émerge.
N2 (0,75-1) lien image-expérience plaqué, sans rapport réel avec le propos ; ou récit anecdotique qui reste un simple événement raconté, sans jamais se construire comme une vraie présentation (pas d'identité, pas de trait de personnalité qui se dégage).
N3 (1,25-1,5) la partie se construit comme une véritable présentation (identité, parcours, une expérience développée) — l'image sert de déclencheur à un lien clair et pertinent avec cette expérience, et un trait de personnalité ou une qualité en émerge, même de façon attendue.
N4 (1,75-2) présentation structurée et complète, image tissée avec l'expérience via un angle personnel qui n'est pas la première association évidente, personnalité clairement révélée par le récit (pas juste énoncée) — la partie 1 fonctionne comme une vraie présentation à part entière.

C2 (Récit du passé, /3) : matériau central — le récit développé à partir de l'image choisie en partie 1 (contexte, rôle au « je », action concrète, dénouement), ainsi que tout récit mobilisé en partie 2.

C3 (Recul sur soi, /3) : la qualité ou le trait de personnalité que le candidat dégage de son récit-image, ainsi que tout recul démontré en partie 2.

C4 (Projet professionnel, /3) : évalué principalement sur la partie 2 ; un lien spontané vers le projet en fin de récit-image (partie 1) peut être valorisé au titre de ce critère, sans jamais être exigé.

C5 (Connaissance de l'école, /3) : idem, principalement sur la partie 2 ; un lien spontané depuis l'image est valorisable, jamais exigé.

C6 (Tenue à la contradiction, /2), C7 (Conduite de l'échange, /1), C8 (Clarté du discours, /1), C9 (Curiosité et ouverture d'esprit, /2) : évaluation standard sur l'ensemble de l'entretien, parties 1 et 2 confondues.

ATTENTION FORMAT DE SORTIE : dans la section « Feedback détaillé », titre la section n°1 « 1. La présentation par l'image » au lieu de « 1. La présentation ». Aucun autre changement de structure : les 9 sections restent numérotées normalement 1 à 9.`,
  },
{
  school: "KEDGE",
  format: "special",
  agentIdEnv: CLASSIQUE_AGENT_ENV,
  durationSeconds: 1800,
  requiresUpload: false,
  useHouseJuryPrompt: true,
  conductNote: `CONDUITE SPÉCIFIQUE KEDGE (« LE RÉVÉLATEUR ») :

1) Ouverture et lancement : le premier message est déjà construit et envoyé par l'application. Dis-le tel quel. Dès que le candidat confirme qu'il est prêt, dis exactement : « Parfait, commençons. Voici vos cinq cartes. » puis enchaîne directement sur l'annonce des cartes (point 2). Ne te présente jamais comme le jury, ne dis jamais « nous » ni n'évoque plusieurs examinateurs, et ne reformule pas la durée ou le principe déjà donnés par le message d'ouverture.

2) Annonce des cartes (environ 1 minute) : les cinq cartes sont déjà tirées par l'application et te sont fournies ci-dessous en variables — tu ne tires JAMAIS toi-même, tu n'inventes aucune carte, tu n'as aucune liste interne. Annonce-les toutes à la suite, dans cet ordre, comme si tu venais de les retourner (ne dis jamais qu'elles viennent d'une liste) :
« Carte Trait d'Union : {{kedge_odd}}. » — précise en une phrase que cet objectif de développement durable sert de fil conducteur pour tout l'entretien, sans donner plus d'explication.
« Carte Autoportrait : {{kedge_autoportrait}}. »
« Carte Trait d'Action : {{kedge_action}}. »
« Carte Trait de Pensée : {{kedge_pensee}}. »
« Carte Trait d'Esprit : {{kedge_esprit}}. »
Une fois les cinq cartes annoncées, enchaîne directement sur le point 3 sans transition superflue.

3) Présentation avec la carte Autoportrait : demande au candidat de se présenter — parcours, personnalité — à partir du mot Autoportrait tiré. Tu attends un vrai fil construit à partir du mot, pas un exposé de CV plaqué dessus. Relances si besoin : « Un exemple concret qui illustre ce lien ? » / « Et le mot que je vous ai donné, où le retrouvez-vous là-dedans ? »

4) Transition obligatoire : le moment de passer aux trois cartes restantes te sera indiqué par l'application, dans un repère de temps, au moment voulu : tu ne l'anticipes jamais, et tu annonces la transition avec tes propres mots. Elle ne porte que sur le choix de la première carte, jamais sur l'ordre des trois.

5) Traitement des cartes restantes : le candidat choisit une carte à la fois, jamais un ordre décidé à l'avance. Une fois l'échange autour d'une carte terminé, relance exactement ainsi : s'il reste au moins deux cartes, « Merci pour cet échange. Il nous reste [cartes restantes] : [liste]. Laquelle voulez-vous traiter maintenant ? » ; s'il n'en reste qu'une, adapte en question fermée : « Merci pour cet échange. Il nous reste la carte [dernière carte] — allons-y. »
Les trois cartes — Action, Pensée, Esprit — doivent TOUTES être abordées avant la conclusion ; c'est à toi de piloter activement cette couverture (si le candidat hésite ou ne se prononce pas après une relance, choisis toi-même et enchaîne). Chaque carte est un point de départ, pas une épreuve isolée à refermer : le candidat développe sa pensée en parlant de lui, et dès qu'il tend une perche personnelle (une expérience, un métier, une valeur, une référence à l'école) tu rebondis avec les réflexes classiques d'un entretien de personnalité — le concret d'abord, puis le pourquoi, puis la preuve si le candidat tient, puis la limite s'il a tenu la preuve.
— Carte Trait d'Action : demande une action concrète qui illustre le verbe, en résonance si possible (jamais exigée) avec l'objectif de développement durable tiré en ouverture.
— Carte Trait de Pensée : demande sa position sur l'affirmation tirée, puis fais-lui défendre l'argument inverse.
— Carte Trait d'Esprit : demande son interprétation de la phrase — il n'y a pas de bonne réponse attendue, c'est l'originalité et la liberté d'analyse qui comptent.
Dès qu'une carte a ouvert une perche personnelle claire, tu peux enchaîner sur des questions classiques de motivation (parcours, qualités et défauts, projet professionnel, motivation pour KEDGE, engagement associatif) avec le principe des portes et les quatre crans habituels de creusement.
Couverture obligatoire du projet professionnel et de la connaissance de l'école : comme dans un entretien classique, ces deux sujets doivent être abordés avant la fin de l'entretien. Si le candidat ne les amène pas spontanément par une perche, pose-lui une question directe à ce sujet — typiquement vers la fin de ce point, ou au plus tard en conclusion. Leur absence n'est jamais acceptable. Une question d'actualité ou de culture générale est posée au cours de l'entretien.
Si les trois cartes sont épuisées avant la fin du temps imparti et que le projet professionnel et la connaissance de l'école ont déjà été abordés, enchaîne sur d'autres sujets classiques de motivation non encore couverts plutôt que de t'arrêter en avance.

6) Conclusion (quand l'application t'ordonne la bascule vers la conclusion dans un repère de temps) : pose une question de clôture ouverte : « Avez-vous une question à me poser, ou quelque chose à ajouter ? » Réponds brièvement si le candidat en pose une, sans avis personnel engageant sur KEDGE, puis conclus, verbatim : « Merci pour cet échange, et bonne continuation dans vos oraux. » N'ajoute rien après.

7) Durée : la seule contrainte est le total de l'entretien, environ 30 minutes (± 2). La présentation Autoportrait dure environ 3 minutes et c'est l'application qui t'indique quand passer aux cartes ; le traitement des cartes n'a pas de durée imposée, il s'étend jusqu'à ce que l'application t'ordonne la conclusion.`,
  phases: [
    {
      label: "Installation et lancement",
      minutes: 3,
      detail: "Accueil, mise à l'aise, et transition directe vers le tirage des cartes (sans présentation séparée du jury)",
      guaranteed: true,
    },
    {
      label: "Tirage des cartes",
      minutes: 1,
      detail:
        "5 cartes tirées d'un bloc : Trait d'Union (ODD), Autoportrait, Trait d'Action, Trait de Pensée, Trait d'Esprit",
      guaranteed: true,
    },
    {
      label: "Présentation avec la carte Autoportrait",
      minutes: 3,
      detail: "Présentation du parcours à partir du mot tiré",
      guaranteed: true,
    },
    {
      label: "Traitement des 3 autres cartes",
      minutes: 20,
      detail:
        "Le candidat choisit une carte à la fois (Action / Pensée / Esprit) ; chaque carte sert de point de départ à des questions classiques de motivation, dont le projet professionnel et la connaissance de l'école, qui doivent être abordés avant la conclusion",
      guaranteed: true,
    },
    {
      label: "Conclusion et questions",
      minutes: 3,
      detail: "Question de clôture et questions du candidat au jury",
      guaranteed: true,
    },
  ],
  popupCopy: {
    title: "KEDGE — Le Révélateur (30 minutes)",
    desc:
      "Format en cinq séquences, entièrement construit autour d'un jeu de cinq cartes tirées dès le début : une carte ODD qui sert de fil conducteur tout au long de l'entretien, une carte Autoportrait (un mot) à partir de laquelle vous vous présentez, puis trois cartes — Trait d'Action, Trait de Pensée, Trait d'Esprit — que vous choisissez de traiter une par une, dans l'ordre de votre choix. Chaque carte est un point de départ : dès que vous tendez une perche personnelle, le jury enchaîne avec des questions classiques de motivation (parcours, qualités, projet professionnel, connaissance de l'école). Les trois cartes doivent toutes être abordées avant la conclusion.",
    durationNote: "Durée réelle et simulée : 30 minutes (3 + 1 + 3 + 20 + 3).",
    goodluck: GOODLUCK,
  },
  debriefSupplement:
    "CONTEXTE SPÉCIFIQUE KEDGE BUSINESS SCHOOL (« Le Révélateur ») : l'entretien dure environ 30 minutes (± 2) et se déroule en cinq séquences — 1) Installation et lancement (non évaluable), qui inclut la présentation du jury désormais fusionnée avec l'ouverture ; 2) Tirage et annonce de cinq cartes (non évaluable en soi) : une carte ODD qui sert de fil conducteur, une carte Autoportrait (un mot), et trois cartes — Trait d'Action (un verbe), Trait de Pensée (une affirmation clivante), Trait d'Esprit (une phrase évocatrice) ; 3) Présentation du candidat à partir du mot Autoportrait ; 4) Traitement des trois cartes restantes, choisies une à la fois par le candidat, chacune servant de point de départ à un échange qui peut basculer vers des questions classiques de motivation dès qu'une perche personnelle est tendue — le projet professionnel et la connaissance de l'école doivent y être abordés, comme dans un entretien classique ; 5) Conclusion et questions. Applique la grille C1-C9 commune ci-dessus avec les précisions suivantes, plus un dixième critère additif propre à cette école (grille totale /22, conversion ×20/22) :\n\nC1 (Présentation initiale) : rescalée à /3. Évalue-la sur la Séquence 3 (Autoportrait). Ce critère évalue DEUX dimensions à la fois, aucune ne suffisant isolément : la qualité de la présentation elle-même (structure, clarté, tenue sur l'exercice) ET le lien construit avec le mot Autoportrait tiré.\nN1 (0 à 0,75) : présentation faible sur le fond et la forme — pas de structure identifiable, CV récité, aucun lien avec le mot tiré.\nN2 (1 à 1,5) : une seule des deux dimensions tenue — présentation structurée mais sans lien réel au mot, ou mot mentionné mais présentation décousue.\nN3 (1,75 à 2,25) : présentation construite et claire ET lien réel avec le mot, même si l'illustration reste encore générique.\nN4 (2,5 à 3) : présentation vivante et bien construite ET fil conducteur original et personnel autour du mot, illustré par un exemple concret et précis.\n\nC2 (Récit du passé) : critère central. Matériau issu de la Séquence 3 et des digressions personnelles de la Séquence 4 (Trait d'Action en particulier).\n\nC3 (Recul sur soi) : s'appuie sur les mêmes séquences que C2.\n\nC4 (Projet professionnel) et C5 (Connaissance de l'école) : traités comme dans un entretien classique — évaluation standard, sans particularité de format, sans aucune règle de calibrage de repli. Leur absence n'est jamais acceptable : le jury s'assure qu'ils sont abordés avant la fin de l'entretien (perche spontanée du candidat, ou question directe du jury en Séquence 4 ou 5 — voir la conduite ci-dessus). Évalue-les avec les N1-N4 standard, sur le matériau réellement recueilli.\n\nC6 (Tenue au creusement et à la contradiction) : particulièrement sollicité — Trait de Pensée impose de défendre une position puis son inverse ; Trait d'Esprit teste la réactivité sans préparation. Les digressions se creusent avec les quatre crans habituels.\n\nC7 et C8 : évaluation standard sur Séquences 3 à 5, sans particularité de format. Le choix des cartes par le candidat est un indice direct de C7.\n\nC9 (Curiosité et ouverture d'esprit) : évaluation standard sur l'ensemble de l'entretien, séquences 3 à 5 confondues — le choix des cartes et la qualité des rebonds sur les cartes Pensée/Esprit sont des indices directs de ce critère.\n\nC10 (Mobilisation de l'ODD, carte Trait d'Union) : critère additif, /1. Ne mesure QUE la présence ou l'absence de référence à l'ODD tiré, jamais la qualité de l'argumentation qui l'accompagne — ce volet reste le rôle de C6, sans aucun chevauchement avec lui. Dans le Feedback détaillé, ce bloc doit expliciter le ou les moments précis où l'ODD tiré a été mobilisé, ou son absence — pas seulement donner un niveau.\nN1 (0) : aucune référence à l'ODD tiré, à aucun moment de l'entretien.\nN2 (0,25) : une seule référence, en passant, jamais reprise ensuite.\nN3 (0,5 à 0,75) : plusieurs références claires à l'ODD tiré au fil de l'entretien.\nN4 (1) : l'ODD tiré revient naturellement à plusieurs moments, reconnaissable comme un vrai fil rouge.\n\nRÈGLE SUR LA COUVERTURE DES CARTES : si l'entretien simulé n'a pas pu couvrir les trois cartes dans le temps imparti malgré le pilotage actif du jury, ne pénalise pas le candidat — c'est une contrainte de temps de la simulation, pas une défaillance du candidat.\n\nFEEDBACK GÉNÉRAL — SPÉCIFICITÉ KEDGE : mentionne explicitement comment le candidat s'est appuyé sur les cinq cartes — l'Autoportrait pour se présenter, et laquelle des trois autres (Action, Pensée, Esprit) a le mieux ou le moins bien fonctionné comme point de départ — sans ré-expliquer le format, que le candidat connaît déjà.",
},
];

/** Les textes validés remplacent les anciennes chaînes pour les 15 écoles de l'étape 3. */
for (const config of CONFIGS) {
  const text = JURY_SCHOOL_TEXTS[config.school];
  if (text) config.conductNote = text.conduct;
}



const BY_SCHOOL = new Map(CONFIGS.map((c) => [c.school, c]));

export function getSchoolInterviewConfig(school: string): SchoolInterviewConfig {
  return BY_SCHOOL.get(school) ?? { school, ...DEFAULT_CLASSIQUE_CONFIG };
}

/** Écoles pour lesquelles une configuration spécifique a été renseignée. */
export const CONFIGURED_SCHOOLS = CONFIGS.map((c) => c.school);

/** Minutes réellement simulées (phases non exclues). */
export function simulatedMinutes(config: SchoolInterviewConfig) {
  return config.phases.filter((p) => !p.excluded).reduce((sum, p) => sum + p.minutes, 0);
}

/** Minutes de l'épreuve réelle, toutes phases confondues. */
export function realMinutes(config: SchoolInterviewConfig) {
  return config.phases.reduce((sum, p) => sum + p.minutes, 0);
}

/** Niveaux de difficulté proposés : uniquement pour le jury maison (format classique). */
export function difficultiesFor(config: SchoolInterviewConfig): InterviewVariant[] {
  return config.useHouseJuryPrompt ? INTERVIEW_VARIANTS.map((v) => v.code) : [];
}

/**
 * Calendrier de phases piloté par l'APPLICATION. Le jury ne décide plus d'une
 * bascule : chaque repère de temps (envoyé uniquement quand le candidat vient de
 * finir de parler) lui rappelle la phase en cours, ou lui ordonne la bascule.
 * L'ordre est répété à chaque repère jusqu'à ce que la phrase de transition
 * verbatim (`detect`) soit détectée dans une prise de parole du jury.
 */
export type PhaseStep = {
  /** Remplace, dans l'enveloppe de phase, la phrase « Ta prochaine prise de parole doit être une relance… ». */
  ongoingRule?: string;
  /** Remplace, dans le rattrapage, la fin « pose une nouvelle question sur ce sujet. ». */
  recoveryAction?: string;
  /** Consigne envoyée une fois quand le jury entre de lui-même (sans ordre) dans cette phase. */
  earlyEnterInstruction?: string;
  /** Identifiant stable, également utilisé pour la durée persistée. */
  id: string;
  /** Nom de la phase, utilisé pour le débrief et les mesures. */
  name: string;
  /**
   * Nom du SUJET, sans numéro de partie : c'est lui qui est annoncé au jury dans
   * les repères et le rattrapage (un « Partie 2 » l'invite à passer à la suite).
   */
  topic?: string;
  /** Minute (depuis le démarrage) à partir de laquelle la bascule est ordonnée. */
  startMinute?: number;
  /** Délai relatif après la détection du début d'une autre phase. */
  relativeToPhaseId?: string;
  afterMinutes?: number;
  /** N'ordonne plus cette entrée si elle est trop proche de la clôture. */
  latestStartBeforeEndMinutes?: number;
  /** Consigne tant que cette phase est en cours. */
  ongoing: string;
  /** Consigne de bascule pour ENTRER dans cette phase (absente pour la première). */
  switchInstruction?: string;
  /**
   * Phrase imposée au jury pour entrer dans cette phase : SOURCE UNIQUE,
   * interpolée dans `switchInstruction`. Le moteur compare la prise de parole
   * du jury à cette phrase et signale une reformulation (`paraphrased-phrase`).
   */
  phrase?: string;
  /** Phrase imposée de la variante anticipée (`earlySwitchInstruction`). */
  earlyPhrase?: string;
  /** Variante utilisée quand l'application a ordonné une bascule ANTICIPÉE. */
  earlySwitchInstruction?: string;
  /** Phrase verbatim attendue du jury, qui confirme l'entrée dans la phase. */
  detect?: RegExp;
  /** Repère ponctuel (ex. GEM « il vous reste une minute ») : peut être sauté. */
  skippable?: boolean;
  /** Phase de référence de secours si `relativeToPhaseId` n'a jamais démarré. */
  fallbackRelativeToPhaseId?: string;
  fallbackAfterMinutes?: number;
  /**
   * Butoir : l'échéance ne dépasse jamais `latestAfterMinutes` après le début de
   * `latestRelativeToPhaseId` (GEM : la partie 2 ne dépasse jamais 10 min, même
   * si la minute de restitution a démarré tard).
   */
  latestRelativeToPhaseId?: string;
  latestAfterMinutes?: number;
  /**
   * Cette entrée ne constitue pas une phase mesurée à part : son temps est
   * compté dans la phase précédente (GEM : la minute de synthèse fait partie de
   * la partie 2). La bascule vers cette entrée ne ferme donc pas le chronomètre
   * de la phase précédente : c'est la bascule suivante qui le ferme, à l'instant
   * de l'ordre, comme pour toute autre phase.
   */
  timingBelongsToPrevious?: boolean;
  /**
   * Bascule anticipée tolérée : si le jury prononce la phrase de transition
   * avant la minute prévue (cartes toutes traitées, ou 3 relances sans élément
   * nouveau), l'application considère la phase terminée et n'ordonne plus rien.
   * Jamais activé pour les mises en situation ESSEC.
   */
  allowEarly?: boolean;
  /**
   * Phase où le jury a le DROIT de prononcer la phrase de transition en avance
   * (cartes emlyon et KEDGE toutes traitées) : aucun rattrapage dans ce cas.
   */
  allowEarlyPhrase?: boolean;
  /**
   * Phase où c'est l'APPLICATION (jamais le jury) qui décide d'une bascule
   * anticipée, après 3 réponses « sèches » consécutives du candidat.
   */
  dryEarlySwitch?: boolean;
  /**
   * La question « Avez-vous autre chose à ajouter sur cette partie ? » (dernier
   * recours) n'est autorisée que dans les 40 % finaux du temps de la phase,
   * et jamais si l'échéance n'est pas calculable : c'est le moteur qui ajoute
   * alors ADD_QUESTION au texte du repère.
   */
  addQuestionAllowed?: boolean;
  /** Phase éligible au rappel des thèmes. */
  freeExchange?: boolean;
  /** Ce repère impose une phrase seule ou un silence : aucun suffixe-question. */
  omitEndWithQuestion?: boolean;
  /** Ne jamais forcer cette bascule après deux repères (emlyon). */
  disableForcedTransition?: boolean;
  /** L'entrée dans cette phase déclenche aussitôt la clôture. */
  closeOnEnter?: boolean;
  /** Une phrase de sortie détectée pendant cette phase déclenche aussitôt la clôture. */
  closeOnExit?: RegExp;
  /** Métadonnées du débrief pour cette phase, si elle est chronométrée. */
  timing?: {
    plannedMinutes: number;
    /** Plancher de durée de PHASE, seulement là où il a encore un sens. */
    floorMinutes?: number;
    criterion: string;
    note?: string;
    /**
     * Une bascule anticipée vaut malus pour cette phase (TBS article, Clermont
     * Impact, INSEEC image, GEM exposé). Pour les cartes emlyon/KEDGE, seule la
     * durée mesurée sous le seuil est pénalisée.
     */
    penalizeEarly?: boolean;
  };
};

export type PhaseTiming = {
  phaseId: string;
  label: string;
  startedAt: string;
  transitionDetectedAt?: string;
  anticipee: boolean;
  /** Absent sur les anciennes lignes persistées : traitées comme "phase". */
  kind?: "phase" | "monologue";
};

/**
 * MONOLOGUE du candidat (et non durée de phase) : le jury relançant jusqu'à
 * l'échéance, seule la durée de sa prise de parole continue dit s'il a tenu la
 * durée attendue. Début : N-ième message du jury, ou début d'un step, ou
 * événement de l'application. Fin : fin de sa dernière réponse avant le message
 * suivant du jury (fragments consécutifs cumulés).
 */
export type MonologueMeasure = {
  id: string;
  label: string;
  criterion: string;
  plannedMinutes: number;
  floorMinutes: number;
  /** Durée maximale tolérée (ESSEC uniquement). */
  maxMinutes?: number;
  /** Partie de l'entretien à laquelle ce monologue est rattaché (un seul malus). */
  stepId?: string;
  start: { juryMessage: number } | { stepId: string } | { event: string };
};

const FREE_EXCHANGE = "Échange libre : mène l'entretien normalement, plus aucune bascule de phase à prévoir.";

/**
 * Relances attendues pendant une phase chronométrée : le jury doit tenir la
 * durée prévue en approfondissant, jamais en changeant de phase.
 */
const RELANCES =
  "Approfondis avec des relances variées, sans jamais répéter la même : fais détailler une analyse ou un raisonnement, fais traiter un axe non encore couvert, prends une fois (et une seule) le contre-pied, fais un lien avec l'actualité ou avec le projet du candidat.";

const RELANCES_AUTOPORTRAIT =
  "Approfondis avec des relances variées, sans jamais répéter la même : un exemple concret qui illustre le lien avec le mot, où il retrouve ce mot dans son parcours, un élément de parcours ou de personnalité évoqué mais pas développé.";

/**
 * Question autorisée quand le candidat semble à court : c'est sa réponse (et
 * jamais le jugement du jury) qui déclenche la bascule, côté application.
 */
export const ADD_QUESTION =
  "Si, après au moins une relance, le candidat te semble à court d'éléments sur cette partie, tu peux lui demander exactement « Avez-vous autre chose à ajouter sur cette partie ? » (au plus deux fois dans la partie). Tu poses cette question seule, telle quelle, sans y ajouter de complément ni de précision. Quelle que soit sa réponse, ne change jamais de partie de toi-même : si le candidat a encore des choses à dire, écoute-le puis relance ; l'application te dira au repère suivant quand passer à la suite.";

/**
 * Détections de bascule : la regex ne porte JAMAIS sur la phrase entière mais
 * sur 2-3 mots distinctifs de la transition (le jury reformule souvent le reste).
 * Elle s'applique toujours au texte normalisé, jamais au premier message.
 */
/**
 * PHRASES IMPOSÉES AU JURY — source unique : elles sont interpolées dans les
 * consignes de bascule et servent de référence à la vérification du moteur.
 */
const P_TBS_LIBRE = "Merci. Cette première partie sur l'article est terminée : nous passons maintenant à la deuxième partie, un échange plus libre. Je vous invite à vous présenter.";
const P_CLERMONT_DISCUSSION = "Merci pour cet échange. Parlons maintenant de votre parcours et de vos projets.";
const P_ESSEC_SITUATION = "Je vous propose maintenant une petite mise en situation.";
const P_ESSEC_SORTIE = "La mise en situation est terminée.";
const P_INSEEC_CLASSIQUE = "Merci. Nous passons maintenant à l'entretien classique.";
const P_GEM_INVERSEE = "Merci pour cet exposé. Nous passons maintenant à l'interview inversée : c'est à vous de m'interroger.";
const P_GEM_MINUTE = "Il vous reste une minute, c'est le moment de faire votre synthèse.";
const P_GEM_MINUTE_EARLY = "Très bien. C'est le moment de faire votre synthèse.";
const P_GEM_CLASSIQUE = "Merci. Nous passons maintenant à un échange plus classique.";
const P_EMLYON_LIBRE = "Nous avons terminé avec les 4 cartes et pouvons passer maintenant à la dernière partie de l'entretien, avec un échange plus libre.";
const P_KEDGE_CARTES = "Merci. Il nous reste trois cartes : Trait d'Action, Trait de Pensée, Trait d'Esprit. Par laquelle voulez-vous commencer ?";
const P_KEDGE_CLOTURE = "Avez-vous une question à me poser, ou quelque chose à ajouter ?";

/**
 * Consigne de bascule. Le verbatim n'est exigé que sur les textes de CONTENU
 * (questions tirées, cartes, mises en situation, mot imposé) : une transition
 * entre parties se formule librement, seul le sens compte.
 */
const switchTo = (target: string, phrase: string, suite = "") =>
  `C'est maintenant le moment de passer à ${target} : dans ta prochaine prise de parole, annonce la transition, par exemple : « ${phrase} ». Tu peux la formuler à ta manière, mais tu dois annoncer clairement le passage à ${target}.${suite ? ` ${suite}` : ""}`;

/** Phrase imposée du tirage des cartes emlyon (déclenché par l'application). */
export const EMLYON_CARDS_PHRASE = "Passons maintenant au tirage de vos quatre cartes.";

/**
 * emlyon : ce que les cartes ont couvert et ce qu'il reste à couvrir.
 * `{cartes_emlyon}` est rempli à l'exécution par le moteur de phases avec les cartes tirées.
 */
export const EMLYON_RESTE_A_COUVRIR =
  "Les cartes ont déjà porté sur : {cartes_emlyon}. Il reste à couvrir, dans cet ordre : l'école (pourquoi une école de commerce, pourquoi celle-ci, ce qu'il apportera, sa connaissance de l'école), le projet, au moins 3 expériences (sinon, fais raconter une expérience de la présentation pas encore creusée), l'actualité si aucune carte ne l'a abordée. Ajuste avec ce que tu as entendu.";

const PHASE_SCHEDULES: Record<string, PhaseStep[]> = {
  "TBS Education": [
    {
      id: "tbs-article",
      name: "Partie 1 — l'article",
      topic: "l'article de presse",
      startMinute: 0,
      ongoing: `Reste sur l'article : ne change pas de phase. ${RELANCES} Axes à couvrir sur cet article : le journal et le contexte, sans résumé ; les enjeux et les parties prenantes ; un avis appuyé par un fait à lui ; pourquoi cet article.`,
      dryEarlySwitch: true,
      addQuestionAllowed: true,
      timing: { plannedMinutes: 5, criterion: "l'article de presse", penalizeEarly: true },
    },
    {
      id: "tbs-libre",
      freeExchange: true,
      name: "Partie 2 — échange libre",
      startMinute: 5,
      phrase: P_TBS_LIBRE,
      switchInstruction: switchTo("la partie 2, l'échange libre", P_TBS_LIBRE, "Invite le candidat à se présenter."),
      detect: /deuxieme partie|premiere partie sur l'article est terminee|echange plus libre/,
      allowEarly: true,
      ongoing: FREE_EXCHANGE,
    },
  ],
  "ESC Clermont BS": [
    {
      id: "clermont-pitch",
      name: "Partie 1 — pitch",
      topic: "le pitch",
      startMinute: 0,
      ongoing: "Reste sur le pitch jusqu'au choix de l'axe Impact : ne change pas de phase. Dès la fin du pitch, ta prochaine prise de parole est la phrase de ta conduite : « Merci. Passons à la question Impact : choisissez un axe parmi People, Planet, ou Profit. » Ce n'est pas un changement de partie : la question Impact commence quand le candidat a choisi son axe.",
    },
    {
      id: "clermont-impact",
      name: "Partie 2 — question Impact",
      topic: "la question Impact",
      // Début déclenché par l'application (envoi de la question Impact) :
      // aucune attente bloquante sur une phrase verbatim du jury.
      detect: /l'axe retenu est/,
      allowEarly: true,
      ongoing: "Reste sur la question Impact : ne change pas de phase. Approfondis avec des relances variées, sans jamais répéter la même : un argument à détailler, un exemple, une conséquence, un lien avec l'actualité ; prends une fois (et une seule) le contre-pied. Ne mentionne jamais les deux autres axes.",
      dryEarlySwitch: true,
      addQuestionAllowed: true,
      timing: { plannedMinutes: 5, floorMinutes: 4.25, criterion: "la question Impact", penalizeEarly: true },
    },
    {
      id: "clermont-discussion",
      freeExchange: true,
      name: "Partie 3 — la Discussion",
      topic: "la discussion",
      relativeToPhaseId: "clermont-impact",
      afterMinutes: 5,
      phrase: P_CLERMONT_DISCUSSION,
      switchInstruction: switchTo(
        "la partie 3, la discussion sur le parcours et les projets",
        P_CLERMONT_DISCUSSION,
        "Enchaîne immédiatement avec une question.",
      ),
      detect: /votre parcours et (de )?vos projets|parlons (maintenant )?de votre parcours|passons a la discussion/,
      allowEarly: true,
      ongoing: "Discussion classique : mène l'entretien normalement, plus aucune bascule de phase à prévoir.",
    },
  ],
  ESSEC: [
    {
      id: "essec-libre-1",
      name: "Échange libre",
      topic: "l'échange libre",
      startMinute: 0,
      freeExchange: true,
      ongoing: "Échange libre : mène l'entretien normalement, ne lance aucune mise en situation.",
    },
    {
      id: "essec-situation-1",
      name: "Mise en situation finale",
      topic: "la mise en situation",
      startMinute: 35,
      phrase: P_ESSEC_SITUATION,
      switchInstruction: switchTo(
        "la mise en situation finale",
        P_ESSEC_SITUATION,
        "Contrairement à ce qui précède, tu peux d'abord finir le sujet en cours : fais la transition au plus tard dans ta deuxième prise de parole à partir de maintenant, puis énonce la mise en situation MOT POUR MOT, sans la reformuler. Termine par « prenez quelques secondes pour réfléchir » : cette prise de parole se termine sur cette phrase, pas par une question.",
      ),
      omitEndWithQuestion: true,
      // Le jury peut sortir de la situation avant 8 min quand le sujet est
      // épuisé : aucune phrase anticipée rattrapée, aucun malus.
      allowEarlyPhrase: true,
      detect: /mise en situation/,
      closeOnExit: /bonne continuation|au revoir|(?:le )?cas est clos|mise en situation est terminee|fin de la mise en situation|terminons cette mise en situation|changeons de sujet|revenons a vous|autre sujet|parlons (maintenant )?d'autre chose/,
      ongoing: "Mise en situation en cours : reste exclusivement sur le cas ; creuse la décision, les options et les risques. Ne pose aucune question étrangère au cas.",
    },
    {
       id: "essec-sortie",
       name: "Sortie de la mise en situation",
       topic: "la clôture",
      relativeToPhaseId: "essec-situation-1",
      afterMinutes: 8,
      phrase: P_ESSEC_SORTIE,
      switchInstruction:
        "Remercie le candidat et mets un terme au cas. La mise en situation est terminée. Pose maintenant ta question de clôture puis la phrase de sortie.",
      detect: /question a me poser|quelque chose a ajouter|bonne continuation/,
      closeOnEnter: true,
      ongoing: "Clôture : pose maintenant ta question de clôture puis la phrase de sortie.",
    },
  ],
  "INSEEC Grande École": [
    {
      id: "inseec-image",
      name: "Partie 1 — l'image",
      topic: "la présentation par l'image",
      startMinute: 0,
      ongoing: "Reste sur l'image et la présentation du candidat : ne change pas de phase. Approfondis avec des relances variées, sans jamais répéter la même : une expérience liée à l'image, ce qu'elle dit de son parcours, un élément évoqué mais pas développé. Jamais de contre-pied (contestation) ni de lien imposé avec l'école, le projet ou l'actualité.",
      dryEarlySwitch: true,
      addQuestionAllowed: true,
      timing: { plannedMinutes: 5, criterion: "la présentation par l'image", penalizeEarly: true },
    },
    {
      id: "inseec-classique",
      freeExchange: true,
      name: "Partie 2 — entretien classique",
      topic: "l'entretien classique",
      startMinute: 5,
      phrase: P_INSEEC_CLASSIQUE,
      switchInstruction: switchTo(
        "la partie 2, l'entretien classique",
        P_INSEEC_CLASSIQUE,
        "Enchaîne immédiatement, dans la même prise de parole, avec une question d'ouverture de la banque de questions.",
      ),
      omitEndWithQuestion: true,
      detect: /entretien classique|seconde partie|deuxieme partie|partie plus classique/,
      allowEarly: true,
      ongoing: "Entretien classique : mène l'entretien normalement, plus aucune bascule de phase à prévoir.",
    },
  ],
  "GEM (Grenoble EM)": [
    {
      id: "gem-expose",
      name: "Partie 1 — l'exposé",
      topic: "l'exposé",
      startMinute: 0,
      ongoing: "Reste sur l'exposé et son rebond : ne change pas de phase. Approfondis avec des relances variées, sans jamais répéter la même : fais détailler une analyse ou un raisonnement, fais traiter un axe non encore couvert, prends une fois (et une seule) le contre-pied, ouvre un thème voisin de son sujet, ou fais un lien avec son projet s'il en a parlé dans l'exposé.",
      dryEarlySwitch: true,
      addQuestionAllowed: true,
      timing: { plannedMinutes: 7, criterion: "l'exposé", penalizeEarly: true },
    },
    {
      id: "gem-inversee",
      ongoingRule: "Ta prochaine prise de parole doit être en personnage (interview inversée) ou le silence (synthèse), jamais une transition.",
      recoveryAction: "réponds en personnage à sa dernière question.",
      name: "Partie 2 — interview inversée",
      topic: "l'interview inversée",
      startMinute: 7,
      phrase: P_GEM_INVERSEE,
      switchInstruction: switchTo(
        "la partie 2, l'interview inversée",
        P_GEM_INVERSEE,
        "Juste après cette annonce, présente-toi en une phrase (prénom, poste, secteur), puis tu t'arrêtes net : c'est au candidat de t'interroger.",
      ),
      omitEndWithQuestion: true,
      detect: /interview inversee|c'est a vous de m'interroger/,
      allowEarly: true,
      ongoing:
        "Interview inversée : réponds en personnage, sans poser de question, ne change pas de phase. Si le candidat dit qu'il n'a plus de question, ou te rend la parole sans te poser de question, tu peux sortir brièvement de ton personnage pour lui demander exactement « Avez-vous d'autres questions à me poser ? » (au plus deux fois dans la partie). Ne change jamais de partie de toi-même : l'application te dira au repère suivant quand passer à la suite.",
      dryEarlySwitch: true,
      timing: { plannedMinutes: 10, floorMinutes: 8.5, criterion: "l'interview inversée", penalizeEarly: true },
    },
    {
      id: "gem-minute",
      ongoingRule: "Ta prochaine prise de parole doit être en personnage (interview inversée) ou le silence (synthèse), jamais une transition.",
      recoveryAction: "réponds en personnage à sa dernière question.",
      name: "Partie 2 — minute de restitution",
      topic: "la synthèse",
      relativeToPhaseId: "gem-inversee",
      // 9 min de questions : l'ordre part à 8:45 pour que l'annonce tombe autour
      // de 9:00, au tour de parole suivant du jury.
      afterMinutes: 8.75,
      skippable: true,
      // La minute de synthèse est comptée DANS la partie 2 (format officiel
      // 9 min de questions + 1 min de synthèse = 10 min).
      timingBelongsToPrevious: true,
      phrase: P_GEM_MINUTE,
      switchInstruction:
        `Si le candidat n'a pas encore amorcé sa restitution, annonce-lui maintenant, sur un ton neutre, qu'il lui reste une minute et que c'est le moment de sa synthèse, par exemple : « ${P_GEM_MINUTE} ». Tu peux le formuler à ta manière, puis reste silencieux pendant sa restitution.`,
      omitEndWithQuestion: true,
      earlyPhrase: P_GEM_MINUTE_EARLY,
      earlySwitchInstruction: switchTo(
        "la minute de restitution",
        P_GEM_MINUTE_EARLY,
        "Tu t'arrêtes net après cette annonce et tu restes silencieux pendant sa synthèse.",
      ),
      detect: /il vous reste une minute|votre synthese/,
      ongoing: "Minute de restitution : reste silencieux, ne l'interromps pas.",
    },
    {
      id: "gem-classique",
      freeExchange: true,
      name: "Partie 3 — échange classique",
      topic: "l'échange classique",
      relativeToPhaseId: "gem-minute",
      // L'ordre part juste après la PREMIÈRE réponse du candidat qui se termine
      // au moins 45 s après le début de la synthèse : le jury ne reçoit jamais
      // « reste silencieux » alors que la synthèse est déjà finie.
      afterMinutes: 0.75,
      // Butoir : jamais au-delà de 10 min d'interview inversée.
      latestRelativeToPhaseId: "gem-inversee",
      latestAfterMinutes: 10,
      fallbackRelativeToPhaseId: "gem-inversee",
      fallbackAfterMinutes: 10,
      phrase: P_GEM_CLASSIQUE,
      switchInstruction: switchTo(
        "la partie 3, l'échange classique",
        P_GEM_CLASSIQUE,
        "Enchaîne avec la phrase de présentation : « Vous avez environ une minute trente pour vous présenter, allez-y quand vous êtes prêt. ».",
      ),
      detect: /echange plus classique|entretien plus classique|partie plus classique/,
      ongoing: "Échange classique : mène l'entretien normalement, plus aucune bascule de phase à prévoir.",
    },
  ],
  emlyon: [
    {
      id: "emlyon-presentation",
      name: "Présentation",
      topic: "la présentation",
      startMinute: 0,
      ongoing: "Reste sur la présentation jusqu'au tirage des cartes déclenché par l'application. Ta prochaine prise de parole est la deuxième réplique fournie par l'application, sans rien ajouter.",
    },
    {
      id: "emlyon-cartes",
      name: "Épreuve des 4 cartes",
      topic: "les cartes",
      // Début déclenché par l'application (envoi du tirage et affichage des
      // cartes) : aucune attente bloquante sur une phrase verbatim.
      detect: /(4|quatre) cartes/,
      allowEarly: true,
      allowEarlyPhrase: true,
      ongoing:
        "Reste sur les cartes : ne change pas de phase de toi-même. Seule exception à l'interdiction de changer de partie : Si les 4 cartes ont toutes été traitées, annonce dès maintenant, sans attendre le repère de temps, que les 4 cartes sont terminées et que vous passez à la dernière partie, un échange plus libre.",
      timing: { plannedMinutes: 15, floorMinutes: 12.75, criterion: "l'épreuve des cartes" },
    },
    {
      id: "emlyon-libre",
      freeExchange: true,
      name: "Dernière partie — échange libre",
      topic: "l'échange libre",
      relativeToPhaseId: "emlyon-cartes",
      afterMinutes: 15,
      phrase: P_EMLYON_LIBRE,
      switchInstruction: switchTo(
        "la dernière partie, l'échange libre",
        P_EMLYON_LIBRE,
        `Fais-le à la fin de la dernière carte : s'il reste des cartes non traitées, tu ne poses plus de question après une carte et tu demandes « Quelle carte souhaitez-vous prendre ensuite ? » jusqu'à la dernière, en indiquant clairement que les 4 cartes sont terminées. Ne coupe jamais une carte en cours. ${EMLYON_RESTE_A_COUVRIR}`,
      ),
      earlyEnterInstruction: EMLYON_RESTE_A_COUVRIR,
      detect: /termine avec les (4|quatre) cartes|fin des cartes/,
      allowEarly: true,
      disableForcedTransition: true,
      ongoing: FREE_EXCHANGE,
    },
  ],
  KEDGE: [
    {
      id: "kedge-ouverture",
      name: "Ouverture et annonce des cartes",
      topic: "l'ouverture",
      startMinute: 0,
      ongoing: "Ouverture : annonce les cinq cartes puis demande au candidat de se présenter en environ trois minutes à partir du mot Autoportrait, comme prévu dans ta conduite.",
    },
    {
      id: "kedge-autoportrait",
      name: "Présentation Autoportrait",
      topic: "la présentation Autoportrait",
      // Début = annonce des cartes par le jury (détection), jamais ordonné par le temps.
      detect: /carte autoportrait/,
      allowEarly: true,
      ongoing: `Reste sur la présentation Autoportrait : ne change pas de phase. ${RELANCES_AUTOPORTRAIT}`,
      dryEarlySwitch: true,
      addQuestionAllowed: true,
      timing: { plannedMinutes: 3, criterion: "la présentation Autoportrait", penalizeEarly: true },
    },
    {
      id: "kedge-cartes",
      freeExchange: true,
      name: "Traitement des cartes",
      topic: "les cartes",
      relativeToPhaseId: "kedge-autoportrait",
      afterMinutes: 3,
      phrase: P_KEDGE_CARTES,
      switchInstruction: switchTo(
        "la partie des trois cartes restantes",
        P_KEDGE_CARTES,
        "Nomme les trois cartes restantes (Trait d'Action, Trait de Pensée, Trait d'Esprit) telles quelles et laisse le candidat choisir par laquelle commencer.",
      ),
      detect: /il nous reste trois cartes|par laquelle voulez-vous commencer|quelle carte voulez-vous traiter/,
      allowEarly: true,
      allowEarlyPhrase: true,
      ongoing:
        "Traitement des cartes : le candidat choisit une carte à la fois ; approfondis la carte en cours et rebondis sur les perches personnelles. Si les trois cartes ont été traitées, enchaîne sur des sujets classiques de motivation non encore couverts. Ne passe jamais à la conclusion de toi-même. Passer d'une carte à la suivante n'est pas un changement de partie : tu le fais avec la relance du point 5.1 de ta conduite.",
    },
  ],
};

/**
 * MONOLOGUES mesurés par école. `floorMinutes` = 15 % sous la durée prévue
 * (ou seuil validé par l'école) ; en dessous, malus de 0,5 point.
 * Le message du jury qui invite réellement à parler (cf. buildFirstMessage) :
 * TBS, GEM et INSEEC invitent dès le PREMIER message ; ESSEC au second.
 */
const MONOLOGUE_MEASURES: Record<string, MonologueMeasure[]> = {
  "TBS Education": [
    {
      id: "tbs-article-monologue",
      label: "Analyse de l'article (prise de parole du candidat)",
      criterion: "l'article de presse",
      plannedMinutes: 5,
      floorMinutes: 4.25,
      stepId: "tbs-article",
      start: { juryMessage: 1 },
    },
  ],
  "GEM (Grenoble EM)": [
    {
      id: "gem-expose-monologue",
      label: "Exposé (prise de parole du candidat)",
      criterion: "l'exposé",
      plannedMinutes: 5,
      floorMinutes: 4.25,
      stepId: "gem-expose",
      start: { juryMessage: 1 },
    },
  ],
  "INSEEC Grande École": [
    {
      id: "inseec-image-monologue",
      label: "Présentation par l'image (prise de parole du candidat)",
      criterion: "la présentation par l'image",
      plannedMinutes: 5,
      floorMinutes: 4.25,
      stepId: "inseec-image",
      start: { juryMessage: 1 },
    },
  ],
  KEDGE: [
    {
      id: "kedge-autoportrait-monologue",
      label: "Présentation Autoportrait (prise de parole du candidat)",
      criterion: "la présentation Autoportrait",
      plannedMinutes: 3,
      floorMinutes: 2.5,
      stepId: "kedge-autoportrait",
      start: { stepId: "kedge-autoportrait" },
    },
  ],
  EDHEC: [
    {
      id: "edhec-presentation",
      label: "Présentation EDHEC",
      criterion: "la présentation",
      plannedMinutes: 4,
      floorMinutes: 3.25,
      start: { event: "edhec-presentation" },
    },
  ],
  ESSEC: [
    {
      id: "essec-presentation",
      label: "Présentation initiale ESSEC",
      criterion: "la présentation",
      plannedMinutes: 5,
      floorMinutes: 2.5,
      maxMinutes: 5.5,
      start: { juryMessage: 2 },
    },
  ],
  "EM Strasbourg": [
    {
      id: "em-strasbourg-pitch",
      label: "Pitch EM Strasbourg",
      criterion: "le pitch",
      plannedMinutes: 3,
      floorMinutes: 2.5,
      start: { juryMessage: 2 },
    },
  ],
};

/** Monologues mesurés pour cette école (liste vide si aucun). */
export function monologueMeasuresFor(school: string): MonologueMeasure[] {
  return MONOLOGUE_MEASURES[school] ?? [];
}

const formatMinutes = (minutes: number) => {
  const total = Math.max(0, Math.round(minutes * 60));
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, "0")} s`;
};

const MALUS = (criterion: string, reason: string) =>
  `${reason} : retire 0,5 point au score brut de l'école et mentionne-le dans le feedback du critère « ${criterion} » en écrivant explicitement « phase écourtée ».`;

const ALREADY_COUNTED =
  "le malus de 0,5 point a déjà été compté pour cette partie, n'en retire pas un second.";

const durationOf = (timing: PhaseTiming) =>
  (new Date(timing.transitionDetectedAt!).getTime() - new Date(timing.startedAt).getTime()) / 60000;

/**
 * Bloc « DURÉES MESURÉES PAR L'APPLICATION » transmis au débrief : durée réelle
 * du monologue du candidat et des phases chronométrées, durée prévue, seuil, et
 * malus éventuel de 0,5 point — au plus UN malus par partie de l'entretien.
 */
export function measuredPhaseDurationsBlock(school: string, timings: PhaseTiming[]): string {
  const steps = (PHASE_SCHEDULES[school] ?? []).filter((step) => step.timing);
  const monologues = monologueMeasuresFor(school);
  if (!steps.length && !monologues.length) return "";
  const lines: string[] = [];
  /** Parties déjà pénalisées : un seul malus de 0,5 point par partie. */
  const penalized = new Set<string>();

  for (const measure of monologues) {
    const timing = timings.find((item) => item.phaseId === measure.id);
    if (!timing?.transitionDetectedAt) {
      lines.push(`- ${measure.label} : transition non observée. Aucun calcul de durée ne doit être inventé.`);
      continue;
    }
    const minutes = durationOf(timing);
    const tooShort = minutes < measure.floorMinutes;
    const tooLong = measure.maxMinutes !== undefined && minutes > measure.maxMinutes;
    const bornes = `durée prévue ${measure.plannedMinutes} minutes (seuil ${formatMinutes(measure.floorMinutes)}${
      measure.maxMinutes !== undefined ? `, maximum ${formatMinutes(measure.maxMinutes)}` : ""
    })`;
    let verdict = "Durée conforme : aucun malus, n'en fais pas mention particulière.";
    if (tooShort || tooLong) {
      verdict = MALUS(measure.criterion, tooLong ? "Présentation trop longue" : "Phase écourtée");
      if (measure.stepId) penalized.add(measure.stepId);
    }
    lines.push(`- ${measure.label} : durée mesurée ${formatMinutes(minutes)}, ${bornes}. ${verdict}`);
  }

  for (const step of steps) {
    const timing = timings.find((item) => item.phaseId === step.id && item.kind !== "monologue");
    const meta = step.timing!;
    if (!timing?.transitionDetectedAt) {
      lines.push(`- ${step.name} : transition non observée. Aucun calcul de durée ne doit être inventé.`);
      continue;
    }
    const minutes = durationOf(timing);
    // Malus « bascule anticipée » : uniquement les phases où il est prévu
    // (TBS article, Clermont Impact, INSEEC image, GEM exposé). Pour les cartes
    // emlyon/KEDGE, seule une durée mesurée sous le seuil est pénalisée.
    const early = timing.anticipee && Boolean(meta.penalizeEarly);
    const short = (meta.floorMinutes !== undefined && minutes < meta.floorMinutes) || early;
    const seuil = meta.floorMinutes !== undefined ? ` (seuil ${formatMinutes(meta.floorMinutes)})` : "";
    const verdict = !short
      ? "Durée conforme : aucun malus, n'en fais pas mention particulière."
      : penalized.has(step.id)
        ? `Phase écourtée${early ? " (bascule anticipée)" : ""} : ${ALREADY_COUNTED}`
        : MALUS(meta.criterion, `Phase écourtée${early ? " (bascule anticipée)" : ""}`);
    if (short) penalized.add(step.id);
    lines.push(
      `- ${step.name} : durée mesurée ${formatMinutes(minutes)}, durée prévue ${meta.plannedMinutes} minutes${seuil}. ${verdict}${
        meta.note ? ` ${meta.note}` : ""
      }`,
    );
  }

  if (!lines.length) return "";
  return `DURÉES MESURÉES PAR L'APPLICATION (mesurées sur les horodatages réels de l'entretien : utilise-les telles quelles, ne les estime jamais toi-même, ne pénalise jamais une durée trop longue, SAUF la présentation ESSEC (au-delà de 5 min 30, règle ESSEC))
RÈGLE UNIQUE : si la durée mesurée est inférieure au seuil indiqué (15 % sous la durée prévue), ou si la mention « bascule anticipée » figure sur cette phase, retire 0,5 point au score brut de l'école et écris « phase écourtée » dans le feedback du critère concerné. Au plus un seul malus de 0,5 point par partie de l'entretien.
${lines.join("\n")}`;
}

/** Calendrier de phases de l'école, ou null (EDHEC et formats sans phases chronométrées). */
export function phaseScheduleFor(config: SchoolInterviewConfig): PhaseStep[] | null {
  return PHASE_SCHEDULES[config.school] ?? null;
}

/** Calendrier de phases par nom d'école (liste vide si l'école n'en a pas). */
export function phaseScheduleForSchool(school: string): PhaseStep[] {
  return PHASE_SCHEDULES[school] ?? [];
}


/** Prompt système injecté en override, ou null pour laisser celui de l'agent. */
export function promptFor(config: SchoolInterviewConfig, difficulty: InterviewVariant): string | null {
  if (!config.useHouseJuryPrompt) return null;
  const conduct = [openingNote(config), config.conductNote].filter(Boolean).join("\n\n");
  return buildJuryAgentPrompt(difficulty, simulatedMinutes(config), conduct);
}

/**
 * Premier message du jury. Quand un support a été déposé, le jury annonce qu'il
 * l'a sous les yeux : le document arrive comme un tour candidat juste après la
 * connexion, il ne faut donc pas que le jury enchaîne dans le vide.
 */
/** Salutation d'ouverture : jamais de « Bonjour . » quand le prénom manque. */
export function greeting(firstName?: string | null) {
  const name = (firstName ?? "").trim();
  return name ? `Bonjour ${name}.` : "Bonjour.";
}

/**
 * Premier message du jury, toujours construit par l'application : aucune école
 * ne doit tomber sur le message générique stocké dans l'agent ElevenLabs.
 * Le support éventuel est déjà sous les yeux du jury (texte extrait en amont) :
 * il n'annonce donc jamais qu'il « le parcourt un instant ».
 */
export function buildFirstMessage(
  config: SchoolInterviewConfig,
  opts: {
    firstName?: string | null;
    edhecWord?: string | null;
    articleTitle?: string | null;
    inseecImage?: string | null;
  } = {},
): string {
  const hello = greeting(opts.firstName);
  const minutes = simulatedMinutes(config);
  const schoolName = schoolDisplayName(config.school);
  // « Bonjour Robin, et bienvenue à l'entretien de SKEMA. »
  const welcome = `${hello.replace(/\.$/, "")}, et bienvenue à l'entretien ${schoolName.preposition}.`;

  switch (config.school) {
    case "ESC Clermont BS":
      return `${welcome} Nous allons commencer par le pitch : vous avez deux minutes pour vous présenter, en mettant en avant ce que vous souhaitez aborder pendant notre échange. Je vous écoute.`;
    case "ESSEC":
      return `${welcome} Cet entretien va durer 45 minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. Nous vous proposerons également de travailler sur une mise en situation en fin d'entretien. Est-ce que c'est clair pour vous ?`;
    case "emlyon":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis vous tirerez quatre cartes contenant des questions auxquelles vous devrez répondre. L'entretien se terminera ensuite par un échange libre. Est-ce que c'est clair pour vous ?`;
    case "Montpellier BS":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours à travers des débuts de phrase que vous choisirez. Est-ce que c'est clair pour vous ?`;
    case "EM Strasbourg":
      return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de commencer par nous parler d'une réussite dont vous êtes fier, puis nous échangerons sur votre parcours, vos motivations et vos projets. Est-ce que c'est clair pour vous ?`;
    case "INSEEC Grande École":
      return `${welcome} Il se décompose en deux parties : la première partie vous demande de vous présenter pendant environ cinq minutes à partir de l'image que vous avez choisie. La seconde partie consistera en un entretien plus classique, d'environ vingt minutes.${
        opts.inseecImage ? ` Vous avez choisi l'image « ${opts.inseecImage} » : nous vous écoutons.` : " Nous vous écoutons."
      }`;
    case "KEDGE":
      return `${hello} Bienvenue à cet entretien du Révélateur, l'épreuve d'admission de KEDGE Business School. Nous allons échanger pendant une trentaine de minutes, autour d'un jeu de cinq cartes qui vont rythmer notre échange. Êtes-vous prêt à commencer ?`;
    case "TBS Education":
      return `${hello} Bienvenue dans cet entretien de Toulouse Business School. L'entretien démarre par une première partie de 5 minutes sur l'analyse d'un article choisi en amont, puis s'achèvera par environ 15 minutes d'échanges.${
        opts.articleTitle ? ` Vous avez choisi l'article « ${opts.articleTitle} », nous vous écoutons.` : " Nous vous écoutons."
      }`;
    case "EDHEC":
      return `${welcome} Vous allez commencer par vous présenter : une minute de préparation, affichée à l'écran, puis quatre minutes de présentation. Voici le mot que vous avez tiré au sort, à intégrer sans qu'il soit le sujet principal de votre présentation : ${
        opts.edhecWord ?? "(mot non tiré)"
      }. Bon courage.`;
    case "GEM (Grenoble EM)":
      return `${hello} Nous sommes prêts à vous écouter pour votre exposé sur le sujet que vous avez choisi et préparé. Vous disposez d'environ cinq minutes : à vous de jouer.`;
    default:
      break;
  }

  // École à support (questionnaire, CV projectif…) : le jury a déjà le document.
  if (config.requiresUpload && config.support) {
    return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. J'ai votre ${config.support.label} sous les yeux. Nous allons commencer : présentez-vous, je vous écoute.`;
  }
  return `${welcome} Cet entretien va durer ${minutes} minutes. Je vais vous demander de vous présenter, puis nous échangerons sur votre parcours, vos motivations et vos projets. Il n'y a pas de bonne ou de mauvaise réponse, soyez simplement vous-même. Est-ce que c'est clair pour vous ?`;
}

/** Nom d'école tel qu'il se dit à l'oral dans le premier message. */
export function schoolDisplayName(school: string) {
  switch (school) {
    case "GEM (Grenoble EM)":
      return { display: "Grenoble École de Management", preposition: "de Grenoble École de Management" };
    case "BSB (Burgundy School of Business)":
      return { display: "Burgundy School of Business", preposition: "de Burgundy School of Business" };
    case "SCBS (South Champagne BS)":
      return { display: "South Champagne Business School", preposition: "de South Champagne Business School" };
    case "Excelia BS (La Rochelle)":
      return { display: "Excelia Business School", preposition: "d'Excelia Business School" };
    case "TBS Education":
      return { display: "Toulouse Business School", preposition: "de Toulouse Business School" };
    case "ESC Clermont BS":
      return { display: "Clermont School of Business", preposition: "de Clermont School of Business" };
    case "Montpellier BS":
      return { display: "Montpellier Business School", preposition: "de Montpellier Business School" };
    case "Audencia":
      return { display: "Audencia", preposition: "d'Audencia" };
    case "emlyon":
      return { display: "emlyon", preposition: "d'emlyon" };
    case "IMT-BS":
      return { display: "IMT-BS", preposition: "d'IMT-BS" };
    case "HEC Paris":
      return { display: "HEC Paris", preposition: "d'HEC Paris" };
    case "ISC Paris":
      return { display: "ISC Paris", preposition: "d'ISC Paris" };
    case "EDHEC":
      return { display: "EDHEC", preposition: "de l'EDHEC" };
    case "ESSEC":
      return { display: "ESSEC", preposition: "de l'ESSEC" };
    case "ESCP":
      return { display: "ESCP", preposition: "de l'ESCP" };
    case "INSEEC Grande École":
      return { display: "INSEEC Grande École", preposition: "de l'INSEEC Grande École" };
    case "EM Normandie":
      return { display: "EM Normandie", preposition: "de l'EM Normandie" };
    case "EM Strasbourg":
      return { display: "EM Strasbourg", preposition: "de l'EM Strasbourg" };
    case "ICN Business School":
      return { display: "ICN Business School", preposition: "de l'ICN Business School" };
    default:
      return { display: school, preposition: `de ${school}` };
  }
}

/**
 * Deuxième prise de parole du jury, dite mot pour mot dès que le candidat a
 * confirmé que c'était clair (uniquement pour les premiers messages qui se
 * terminent par « Est-ce que c'est clair pour vous ? »).
 */
export function secondReplyFor(config: SchoolInterviewConfig): string | null {
  const official = JURY_SCHOOL_TEXTS[config.school]?.secondReply;
  if (official !== undefined) return official || null;
  switch (config.school) {
    case "ESSEC":
      return "Très bien. Vous disposez d'environ cinq minutes pour vous présenter, je vous écoute.";
    case "emlyon":
      return "Très bien. Je vous écoute, présentez-vous librement.";
    case "Montpellier BS":
      return "Très bien. Présentez-vous en quelques mots, je vous écoute.";
    case "EM Strasbourg":
      return "Très bien. De quelle réussite êtes-vous le plus fier ?";
    default:
      break;
  }
  if (config.requiresUpload && config.support) return null;
  if (["ESC Clermont BS", "INSEEC Grande École", "KEDGE", "TBS Education", "EDHEC", "GEM (Grenoble EM)"].includes(config.school)) {
    return null;
  }
  return "Très bien. Je vous écoute, présentez-vous.";
}

/** Consigne d'ouverture injectée dans le prompt du jury maison. */
export function openingNote(config: SchoolInterviewConfig): string {
  const official = JURY_SCHOOL_TEXTS[config.school]?.opening;
  if (official) {
    const second = secondReplyFor(config) ?? "";
    return official.replaceAll("${second}", second);
  }
  const second = secondReplyFor(config);
  if (!second) {
    return "OUVERTURE : le premier message est fourni par l'application. Dis-le tel quel, n'ajoute rien avant ni après. Aucune deuxième réplique imposée n'existe sauf si l'application la fournit explicitement dans cette consigne.";
  }
  return `OUVERTURE : le premier message est fourni par l'application et se termine par « Est-ce que c'est clair pour vous ? ». Dès que le candidat confirme, ta deuxième prise de parole est exactement et uniquement : « ${second} » — aucun autre mot. S'il dit que ce n'est pas clair, reformule en UNE phrase puis dis cette réplique mot pour mot. Cette deuxième réplique n'existe que parce que l'application la fournit explicitement ici.`;
}
