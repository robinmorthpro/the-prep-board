import { EDHEC_WORDS } from "@/lib/edhec-kb";
import { EMLYON_CREATIVITE, EMLYON_EXPERIENCE, EMLYON_PERSONNALITE, EMLYON_PROJET } from "@/lib/emlyon-kb";
import { ESSEC_SITUATIONS } from "@/lib/essec-kb";

/** Écoles BCE + Ecricome, classées dans l'ordre du classement SIGEM (aucun doublon). */
export const SCHOOLS: { name: string; concours: "BCE" | "Ecricome" }[] = [
  { name: "HEC Paris", concours: "BCE" },
  { name: "ESSEC", concours: "BCE" },
  { name: "ESCP", concours: "BCE" },
  { name: "EDHEC", concours: "BCE" },
  { name: "emlyon", concours: "BCE" },
  { name: "SKEMA", concours: "BCE" },
  { name: "Audencia", concours: "BCE" },
  { name: "NEOMA", concours: "Ecricome" },
  { name: "GEM (Grenoble EM)", concours: "BCE" },
  { name: "KEDGE", concours: "Ecricome" },
  { name: "TBS Education", concours: "Ecricome" },
  { name: "Rennes School of Business", concours: "BCE" },
  { name: "Montpellier BS", concours: "Ecricome" },
  { name: "ICN Business School", concours: "BCE" },
  { name: "Excelia BS (La Rochelle)", concours: "BCE" },
  { name: "EM Strasbourg", concours: "Ecricome" },
  { name: "BSB (Burgundy School of Business)", concours: "BCE" },
  { name: "EM Normandie", concours: "BCE" },
  { name: "ISC Paris", concours: "BCE" },
  { name: "ESC Clermont BS", concours: "BCE" },
  { name: "IMT-BS", concours: "BCE" },
  { name: "INSEEC Grande École", concours: "BCE" },
  { name: "SCBS (South Champagne BS)", concours: "BCE" },
  { name: "Brest Business School", concours: "BCE" },
];

export const ALL_SCHOOLS = SCHOOLS.map((s) => s.name);

export const PREPA_CLASSES = ["ECG 1re année", "ECG 2e année", "ECT 1re année", "ECT 2e année", "Cube / 5-2", "Autre"];

/**
 * Prépas EC (ECG) - les 145 établissements du classement L'Étudiant des prépas ECG
 * voie générale (5 pages du classement, 2026), au format « Ville - Établissement ».
 */
export const PREPA_LYCEES = [
  "Agadir - Lycée Reda-Slaoui",
  "Aix-en-Provence - Lycée Cézanne",
  "Aix-en-Provence - Lycée La Nativité",
  "Albi - Lycée Bellevue",
  "Amiens - Lycée Louis-Thuillier",
  "Amiens - Lycée Madeleine-Michelis",
  "Angers - Lycée Henri-Bergson",
  "Angers - Lycée Joachim-du-Bellay",
  "Annecy - Lycée Berthollet",
  "Antony - Lycée Descartes",
  "Arras - Lycée Gambetta",
  "Basse-Terre - Lycée Gerville-Réache",
  "Bayonne - Lycée René-Cassin",
  "Belfort - Lycée Courbet",
  "Besançon - Lycée Louis-Pergaud",
  "Bordeaux - Lycée Montaigne",
  "Bordeaux - Lycée Sainte-Marie-Grand-Lebrun",
  "Boulogne-sur-Mer - Lycée Nazareth-Haffreingue",
  "Bourg-en-Bresse - Lycée Edgar-Quinet",
  "Brest - Lycée Kerichen",
  "Caen - Lycée Charles-de-Gaulle",
  "Caen - Lycée Jeanne-d'Arc",
  "Caen - Lycée Malherbe",
  "Cahors - Lycée Clément-Marot",
  "Cannes - Lycée Stanislas",
  "Casablanca - Al Khansaa",
  "Casablanca - Lycée La Résidence + La Résidence Bouskoura",
  "Cergy-Pontoise - Lycée Alfred-Kastler",
  "Clermont-Ferrand - Lycée Blaise-Pascal",
  "Clermont-Ferrand - Lycée Saint-Alyre",
  "Dijon - Lycée Carnot",
  "Dijon - Lycée Saint-Bénigne",
  "Douai - Lycée Saint-Jean",
  "Dumbéa - Lycée Dick-Ukeiwé Grand-Nouméa",
  "Dunkerque - Lycée Jean-Bart",
  "El Jadida - Lycée Errazi",
  "Fontainebleau - Lycée François-Couperin",
  "Fort-de-France - Lycée Bellevue",
  "Fès - Al Cachy",
  "Gap - Lycée Dominique-Villars",
  "Grenoble - Lycée Champollion",
  "Guelmim - Bab Essahra",
  "Kenitra - Lycée Mohamed VI",
  "La Flèche - Prytanée National Militaire",
  "La Rochelle - Lycée Saint-Exupéry & La Rochelle Université",
  "Lagny-sur-Marne - Lycée Saint-Laurent La Paix ND",
  "Le Havre - Lycée François-1er",
  "Le Havre - Lycée Saint-Joseph",
  "Le Mans - Lycée Saint-Charles - Sainte-Croix",
  "Le Mans - Lycée Touchard",
  "Le Raincy - Lycée Schweitzer",
  "Lille - Lycée Faidherbe",
  "Lille - Lycée Gaston-Berger",
  "Lille - Lycée Saint-Paul",
  "Limoges - Lycée Gay-Lussac",
  "Lorient - Lycée Dupuy-de-Lôme",
  "Lyon - Lycée Ampère",
  "Lyon - Lycée Chartreux",
  "Lyon - Lycée Le Parc",
  "Lyon - Lycée Notre-Dame-des-Minimes",
  "Lyon - Lycée Saint-Just",
  "Lyon - Lycée Sainte-Marie",
  "Mantes-la-Jolie - Lycée Saint-Exupéry",
  "Marrakech - First Prepas Marrakech",
  "Marrakech - Lycée Ibn Ghazi",
  "Marseille - Lycée La Cadenelle",
  "Marseille - Lycée Notre-Dame-de-Sion",
  "Marseille - Lycée Saint-Charles",
  "Marseille - Lycée Saint-Exupéry",
  "Marseille - Lycée Thiers",
  "Massy - Lycée Parc-de-Vilgenis",
  "Meaux - Lycée Moissan",
  "Meknès - Audentia School",
  "Meknès - First Preparatory Classes of High Schools Private",
  "Meknès - Lycée Moulay Ismail",
  "Melun - Lycée Amyot",
  "Metz - Lycée Fabert",
  "Metz - Lycée Georges-de-La-Tour",
  "Montigny-lès-Metz - Lycée Jean-XXIII",
  "Montluçon - Lycée Madame-de-Staël",
  "Montpellier - Lycée Joffre",
  "Montpellier - Lycée Notre-Dame-de-La-Merci",
  "Mulhouse - Lycée Montaigne",
  "Nancy - Lycée Henri-Poincaré",
  "Nantes - Externat Chavagnes (ex-Enfants Nantais)",
  "Nantes - Lycée Clemenceau",
  "Nantes - Lycée Nelson-Mandela (ex-Vial)",
  "Nantes - Lycée Saint-Joseph-du-Loquidy",
  "Neuilly-sur-Seine - Lycée La Folie-Saint-James",
  "Neuilly-sur-Seine - Lycée Notre-Dame-de-Sainte-Croix",
  "Nice - Lycée Masséna",
  "Noisy-le-Sec - Lycée Olympe-de-Gouges",
  "Noyon - Lycée Jean-Calvin",
  "Nîmes - Lycée Daudet",
  "Nîmes - Lycée Emmanuel-d'Alzon",
  "Orléans - Lycée Pothier",
  "Orléans - Lycée Voltaire",
  "Ouarzazate - Centre CPGE",
  "Papeete - Lycée Paul-Gauguin",
  "Paris - ENC Bessières",
  "Paris - Intégrale",
  "Paris - Ipesup",
  "Paris - La Prépa Autrement",
  "Paris - Lycée Carnot",
  "Paris - Lycée Chaptal",
  "Paris - Lycée Claude-Bernard",
  "Paris - Lycée Claude-Monet",
  "Paris - Lycée Henri-IV",
  "Paris - Lycée Hélène-Boucher",
  "Paris - Lycée Jacques-Decour",
  "Paris - Lycée Janson-de-Sailly",
  "Paris - Lycée Lavoisier",
  "Paris - Lycée Louis-le-Grand",
  "Paris - Lycée Montaigne",
  "Paris - Lycée Saint-Jean-de-Passy",
  "Paris - Lycée Saint-Louis",
  "Paris - Lycée Saint-Louis-de-Gonzague",
  "Paris - Lycée Saint-Michel-de-Picpus",
  "Paris - Lycée Stanislas",
  "Paris - MyPrepa",
  "Paris - Prépa Diagonale",
  "Paris - WeiD Prépa",
  "Pau - Lycée Louis-Barthou",
  "Perpignan - Lycée Notre-Dame-de-Bon-Secours",
  "Pointe-à-Pitre - Lycée Baimbridge",
  "Poitiers - Lycée Aliénor-d'Aquitaine",
  "Provins - Lycée Sourdun",
  "Rabat - Lycée Ibn-Ghazi",
  "Rabat - Omar Al-Khayyam",
  "Reims - Lycée Clemenceau",
  "Rennes - Lycée Chateaubriand",
  "Rennes - Lycée Saint-Vincent-Providence",
  "Rouen - Lycée Corneille",
  "Rouen - Lycée Gustave-Flaubert",
  "Rueil-Malmaison - Lycée Madeleine-Daniélou",
  "Saint-Brieuc - Lycée Rabelais",
  "Saint-Cloud - Lycée Alexandre-Dumas (ex-Florent-Schmitt)",
  "Saint-Denis-de-la-Réunion - Lycée Marguerite Jauzelon (ex-Bellepierre)",
  "Saint-Etienne - Lycée Claude-Fauriel",
  "Saint-Germain-en-Laye - Lycée Jeanne-d'Albret",
  "Saint-Lô - Lycée Le Verrier",
  "Saint-Maur-des-Fossés - Lycée Marcelin-Berthelot",
  "Saint-Maur-des-Fossés - Lycée Teilhard-de-Chardin",
  "Sarcelles - Lycée Jean-Jacques-Rousseau",
  "Savigny-sur-Orge - Lycée Jean-Baptiste-Corot",
  "Sceaux - Lycée Lakanal",
  "Settat - Lycée Lycée Technique",
  "Sophia-Antipolis - CIV-Valbonne",
  "Strasbourg - Lycée Kléber",
  "Strasbourg - Lycée Saint-Etienne",
  "Tanger - Esprit Prépas",
  "Tanger - Lycée Moulay-Hassan",
  "Tarbes - Lycée Théophile-Gautier",
  "Taza - Acharif Al Idrissi",
  "Toulon - Lycée Dumont-d'Urville",
  "Toulouse - Lycée Ozenne",
  "Toulouse - Lycée Pierre-de-Fermat",
  "Toulouse - Lycée Saliège",
  "Tours - Lycée Descartes",
  "Tours - Lycée Philippine-Duchesne Itec-Boisfleury",
  "Troyes - Lycée Marie-de-Champagne",
  "Valence - Lycée Vernet",
  "Vanves - Lycée Michelet",
  "Versailles - Lycée Hoche",
  "Versailles - Lycée La Bruyère",
  "Versailles - Lycée Notre-Dame-du-Grandchamp",
  "Versailles - Lycée Sainte-Geneviève",
  "Villemomble - Lycée Blanche-de-Castille Servites",
  "Vincennes - Lycée Berlioz",
  "Autre",
];


export const ACQUISITION_CHANNELS = [
  "Bouche à oreille",
  "Instagram / TikTok",
  "Professeur de prépa",
  "Recherche Google",
  "LinkedIn",
  "Autre",
];

export const EXPECTATIONS = [
  "M'entraîner à l'oral sans limite",
  "Me préparer efficacement en maitrisant mon budget",
  "Bénéficier une préparation complète",
  "Autre : préciser",
];

export const EXPECTATION_OTHER = "Autre : préciser";

export const OTHER_PREPS = [
  "Aucune",
  "PGE-PGO",
  "Hello Prépa",
  "Les cours du Parnasse",
  "Cours Thalès",
  "Prépa Prévision",
  "Aurlom",
  "Cours Legendre",
  "Cours Aristote",
  "Autre",
];

export const EXPERIENCE_CATEGORIES = [
  "Expérience professionnelle ou bénévole",
  "Scolaire",
  "Sport",
  "Voyage",
  "Association",
  "Musique / Hobby",
] as const;

export type Anecdote = {
  title?: string;
  detail: string;
  learning: string;
  link: string;
};

export const EMPTY_ANECDOTE: Anecdote = { title: "", detail: "", learning: "", link: "" };


/** Justifications proposées (menu déroulant + texte libre possible). */
export const WHY_SUGGESTIONS = {
  master: [
    "Les cours correspondent aux compétences de mon métier cible",
    "Le master propose une spécialisation rare sur mon domaine",
    "Le format (alternance, projets, mémoire) colle à ma façon d'apprendre",
    "Les débouchés correspondent aux entreprises que je vise",
  ],
  association: [
    "Elle me fait pratiquer une compétence clé de mon projet pro",
    "Elle prolonge une expérience que j'ai déjà vécue",
    "Elle me met en contact avec des professionnels de mon secteur",
    "Elle me fait sortir de ma zone de confort",
  ],
  exchange: [
    "La spécialisation de l'université sert mon projet pro",
    "La langue / la culture est stratégique pour mon métier",
    "Le pays est un marché clé de mon secteur",
    "Le double diplôme ajoute une compétence technique",
  ],
  partner: [
    "L'entreprise est un acteur central de mon secteur",
    "Elle recrute sur le métier que je vise",
    "Elle intervient dans les cours ou propose des projets",
    "Elle propose des stages liés à mon projet",
  ],
};

/** Base de connaissance affichée en continu pendant le travail. */
export const KNOWLEDGE = {
  personal: {
    title: "Pourquoi ces informations",
    points: [
      "Le parcours est personnalisé : classe, lycée et écoles visées conditionnent les questions du jury simulé.",
      "Les écoles choisies servent de base aux fiches écoles du module 3.",
      "Vos choix 1, 2, 3 nous servent uniquement à hiérarchiser vos entraînements.",
    ],
  },
  career: {
    title: "Ce qu'un jury attend d'un projet professionnel",
    points: [
      "Un domaine de métiers assumé suffit (« les métiers de la finance ») : un intitulé de poste précis n'est pas exigé, mais un secteur seul ne suffit jamais.",
      "Une description personnelle : pourquoi vous, pourquoi maintenant, d'où vient l'intérêt.",
      "Le rôle réel dans l'entreprise ou l'écosystème : à qui vous parlez, ce que vous produisez.",
      "Les qualités nécessaires, et la preuve que vous les avez déjà mobilisées dans vos expériences.",
      "Une actualité récente du métier : signal que votre projet est vivant, pas théorique.",
    ],
  },
  schools: {
    title: "Pourquoi la connaissance de l'école compte",
    points: [
      "On s'intéresse à une école par ce qu'elle propose pour m'initier à mon projet pro actuel.",
      "Le socle générique (baseline, création, direction, campus) évite les fautes de culture d'école.",
      "Chaque élément spécifique doit être justifié en lien avec votre projet professionnel.",
      "Deux universités partenaires minimum : montrez que la destination a du sens (langue, spécialisation, marché).",
      "Les entreprises partenaires et éléments spécifiques servent de munitions de relance.",
    ],
  },
  experiences: {
    title: "Comment exploiter une expérience en entretien",
    points: [
      "Le contexte doit être court et factuel : quoi, quand, où, avec qui, combien de temps.",
      "Le récit tient en 5 lignes max : le jury doit comprendre l'enjeu sans effort.",
      "Trois anecdotes racontées à la première personne, avec un fait précis, pas une généralité.",
      "Chaque anecdote se termine par ce qu'elle dit de vous, puis par un lien vers une école, une entreprise ou votre projet pro.",
      "Une anecdote sans lien réutilisable est une anecdote perdue.",
    ],
  },
  news: {
    title: "Pourquoi travailler des sujets d'actualité",
    points: [
      "Le jury teste votre curiosité réelle : trois sujets maîtrisés valent mieux que dix survolés.",
      "Un sujet se délimite : un thème précis, daté, sur lequel vous pouvez citer vos sources.",
      "On attend une analyse, pas un résumé de presse : enjeux, causes, conséquences possibles.",
      "Distinguez causes et conséquences - c'est là que la plupart des candidats se perdent.",
      "Assumez un point de vue nuancé : le jury relance toujours pour savoir ce que vous en pensez.",
      "Terminez par le lien que vous voulez faire en entretien : avec vous, votre projet pro ou l'école.",
    ],
  },
};

/** Consignes théoriques détaillées du module 5 (sujets d'actualité). */
export const NEWS_THEORY = {
  title: "Ce qu'un jury attend sur un sujet d'actualité",
  intro:
    "L'objectif n'est pas de tout savoir, mais de montrer que vous savez lire le monde et le relier à votre projet. Trois sujets bien préparés suffisent pour tenir tout un oral.",
  sections: [
    {
      title: "Pourquoi travailler des sujets d'actualité",
      points: [
        "Le jury teste votre curiosité réelle : trois sujets maîtrisés valent mieux que dix survolés.",
        "Un sujet se délimite : un événement précis, daté, sur lequel vous pouvez citer vos sources.",
        "On attend une analyse, pas un résumé de presse : enjeux, causes, conséquences possibles.",
        "Distinguez causes et conséquences - c'est là que la plupart des candidats se perdent.",
        "Assumez un point de vue nuancé : le jury relance toujours pour savoir ce que vous en pensez.",
        "Terminez par le lien que vous voulez faire en entretien : avec vous, votre projet pro ou l'école.",
      ],
    },
    {
      title: "Ce que le jury attend concrètement",
      points: [
        "Choisissez des sujets que vous avez envie de défendre : un sujet subi s'entend immédiatement.",
        "Variez les registres : un sujet lié à votre secteur, un sujet de société, un sujet international.",
        "Une à cinq sources par sujet : presse de référence, étude, podcast - et sachez les citer.",
        "Formulez les enjeux sous forme de tension : qui gagne, qui perd, quel arbitrage est en jeu.",
        "Les causes expliquent pourquoi c'est arrivé ; les conséquences possibles se conjuguent au futur et restent prudentes.",
        "Préparez la phrase de bascule : « ce sujet m'intéresse parce que… et cela rejoint mon projet parce que… ».",
      ],
    },
    {
      title: "À savoir avant de commencer",
      points: [
        "Un sujet est validé quand toutes les rubriques sont remplies et qu'il a été relu par notre IA.",
        "The Prepboard ne vérifie ni les faits ni l'actualité de vos sources : la recherche reste votre travail.",
        "Appuyez-vous sur le travail des modules 2 (projet professionnel) et 3 (écoles) pour construire vos liens.",
      ],
    },
  ],
};

/** Nombre maximal de sujets d'actualité travaillés en module 5. */
export const MAX_NEWS_TOPICS = 3;

export const SCHOOL_DISCLAIMER =
  "The Prepboard ne vérifie ni la pertinence ni l'existence de ce que vous entrez. C'est à vous de faire le travail de recherche nécessaire à votre découverte de l'école. C'est comme ça que vous progresserez et que vous saurez ce que l'école propose spécifiquement pour votre projet.";

/** Modèle de fiche école, lié à un projet pro fictif. */
export const SCHOOL_SHEET_EXAMPLE = {
  project: "Projet pro fictif : chef de produit dans l'agroalimentaire",
  school: "École fictive : Meridian Business School",
  rows: [
    ["Baseline", "« Make it matter » - l'école met en avant l'impact des projets étudiants."],
    ["Année de création", "1921, école consulaire à l'origine tournée vers le commerce international."],
    ["Directeur / directrice", "Claire Marchand, depuis 2020, ancienne DG d'un groupe agroalimentaire."],
    ["Campus", "Campus principal à Lyon, campus secondaires à Paris et Singapour."],
    [
      "Master qui m'intéresse",
      "MSc Marketing & Brand Management - parce que le semestre « innovation produit » correspond exactement au travail d'un chef de produit food.",
    ],
    [
      "Association",
      "Junior Conseil Food & Retail - parce que j'y ferais mes premières études de marché terrain, ce que je n'ai jamais pratiqué.",
    ],
    [
      "Échanges / double diplôme",
      "Copenhagen BS (marché scandinave très en avance sur le clean label) et Universidad de Navarra (industrie agroalimentaire espagnole).",
    ],
    ["Entreprises partenaires", "Danone et Bel : elles recrutent des chefs de produit juniors et intervienent dans les cours."],
    ["Élément spécifique", "Le « food lab » du campus lyonnais permet de prototyper un produit sur un semestre."],
  ],
};

export const PARTS = [
  { id: 1, path: "/informations-personnelles", title: "Informations personnelles", subtitle: "J'entre mon identité, ma classe prépa et mes écoles présentées", premium: false },
  { id: 2, path: "/partie-2", title: "Projet professionnel", subtitle: "Je travaille les métiers qui m'attirent", premium: false },
  { id: 3, path: "/partie-3", title: "Fiches écoles", subtitle: "Je me renseigne sur ce qui m'attire dans chacune des écoles présentées", premium: false },
  { id: 4, path: "/partie-4", title: "Expériences personnelles", subtitle: "Je détaille l'ensemble de mes expériences personnelles", premium: false },
  { id: 5, path: "/partie-5", title: "Sujets d'actualités", subtitle: "Je cherche les sujets d'actualités que je souhaite aborder en entretien", premium: false },
  { id: 6, path: "/partie-6", title: "Supports d'entretien", subtitle: "Je prépare les questionnaires et le CV projectif demandés par mes écoles", premium: false },
  { id: 7, path: "/partie-7", title: "Questions clés", subtitle: "Je m'entraîne sur les questions classiques les plus importantes d'un entretien", premium: true },
  { id: 8, path: "/partie-8", title: "Simulations complètes", subtitle: "Je simule un entretien complet sur l'école de mon choix, comme le jour J", premium: true },
] as const;

/** Page dédiée « Informations personnelles », hors numérotation des modules. */
export const INFO_PART = PARTS[0];
/** Modules de « Je me prépare » (numérotés 1 à 5 à l'affichage). */
export const PREP_PARTS = PARTS.filter((p) => p.id >= 2 && p.id <= 6);
/** Modules de « Je m'entraîne » (numérotés 1 et 2 à l'affichage). */
export const TRAIN_PARTS = PARTS.filter((p) => p.id >= 7);
/** Numéro affiché d'un module : 2→1 … 6→5, puis 7→1, 8→2. */
export const moduleNumber = (id: number) => id - 1;

/** Mode test : les modules premium restent accessibles sans paiement. */
export const TEST_MODE_PREMIUM_FREE = true;

/* ------------------------------------------------------------------ */
/* Base de connaissance - Module 4 : parler de ses expériences        */
/* Source : « Parler de ses expériences en entretiens »               */
/* ------------------------------------------------------------------ */

export const EXPERIENCE_THEORY = {
  title: "Parler d'une expérience en entretien",
  intro:
    "Toute question du jury n'est qu'un prétexte pour en apprendre plus sur vous. Une expérience se raconte donc selon le triptyque Passé (l'anecdote) → Présent (la qualité ou le défaut travaillé) → Futur (comment vous capitaliserez dessus, en école OU côté projet pro : un seul de ces deux axes, nommé et illustré, suffit).",
  points: [
    "Commencez toujours par le contexte, en 30 secondes maximum : quoi, où, quand, combien de temps.",
    "Découpez l'expérience en « mini-expériences » (anecdotes) : difficulté, succès, échec, relation aux autres, prise d'initiative.",
    "Hiérarchisez vos anecdotes selon 3 critères : chronologie, importance, valorisation. Ne commencez jamais par un échec : le jury peut vous couper à tout moment.",
    "Racontez spontanément 3 ou 4 anecdotes (1 min 30 à 2 min de réponse) et gardez-en une ou deux « en poche » comme munitions de relance.",
    "Chaque anecdote débouche sur une qualité réelle (ou un défaut travaillé), amenée par le champ lexical : le jury doit la deviner avant que vous ne la nommiez.",
    "Terminez chaque anecdote par un lien concret avec le futur, en école ET en entreprise (master, association, échange, entreprise citée par son nom).",
    "Personnalisez : parlez de vous à la première personne, pas de « l'équipe », du coach ou du groupe.",
    "Ne survendez pas : citez des qualités vraies, pas les plus impressionnantes.",
    "Attention au verbatim : « j'ai arrêté par manque de temps » se lit comme un manque d'organisation. Assumez un choix, pas un abandon.",
  ],
};

/** Grille utilisée par l'IA pour évaluer une expérience (module 4). */
export type ExperienceCriterion = { label: string; essential: boolean };

export const EXPERIENCE_GRID: ExperienceCriterion[] = [
  { label: "Contexte : quoi / où / quand / avec qui / combien de temps, factuel et situé.", essential: false },
  { label: "Récit global détaillé : une véritable histoire (situation, enjeu, ce que le candidat y a fait), assez nourrie pour que le jury visualise l'expérience - un récit avare en détails est à perfectionner.", essential: false },
  { label: "Anecdotes précises et concrètes (un fait daté, situé, vécu, raconté en détail), jamais des généralités ni un résumé en deux lignes.", essential: true },
  { label: "Passé → Présent : l'anecdote démontre réellement la qualité ou le défaut travaillé annoncé, avec le bon champ lexical.", essential: true },
  { label: "Présent → Futur : un lien concret et nommé, en école (master, association, échange, entreprise partenaire) OU côté projet pro (un domaine de métiers suffit, un métier précis n'est pas exigé).", essential: true },
  { label: "Personnalisation du discours : récit à la première personne, avec mon rôle et mes actions à moi (« j'ai décidé », « j'ai organisé ») plutôt que ceux du groupe (« on a », « l'équipe a »).", essential: true },
  { label: "Hiérarchisation : la première anecdote est valorisante et importante, jamais un échec (les échecs ne se racontent que si le jury pose explicitement la question des défauts).", essential: false },
  { label: "Verbatim : aucune formule qui se retourne contre le candidat (manque de temps, dénigrement, arrogance).", essential: true },

];

/* ------------------------------------------------------------------ */
/* Base de connaissance - Module 2 : le projet professionnel (résumé) */
/* Source : « Oraux de motivation - Le projet professionnel »         */
/* ------------------------------------------------------------------ */

export const CAREER_THEORY = {
  title: "Le projet professionnel : le construire, en parler",
  intro:
    "On ne vous demande pas de signer un CDI. À ce stade, on parle de « pistes professionnelles » : le jury veut vérifier que votre piste vous ressemble, qu'elle est réaliste, et que vous savez ce que l'école y apportera. C'est le triptyque Vous - Métiers - École.",
  sections: [
    {
      title: "Dédramatiser : personne n'attend un projet définitif",
      points: [
        "Trois situations reviennent toujours : avoir un projet sans être sûr qu'il ne changera pas, avoir plusieurs projets très différents sans savoir choisir, ou n'avoir aucun projet. Les deux premières sont normales ; la troisième est en réalité une fausse excuse, car personne ne peut se renseigner un minimum sur les métiers accessibles après une école sans rien y trouver d'intéressant.",
        "L'origine du malaise est simple : à ce stade, vous ne connaissez pas assez les métiers pour être certain de votre choix. C'est normal - sinon l'école ne servirait à rien.",
        "Puisque vous ne pouvez pas tout connaître des métiers, partez de ce que vous connaissez le mieux : vous, vos centres d'intérêt, vos aptitudes, vos expériences. C'est la clarté de ce point de départ qui rend le projet crédible.",
        "Bernard Ramanantsoa, ancien directeur d'HEC : « Celui qui, à 20 ans, me dit qu'il sait déjà ce qu'il veut faire en sortant de l'école… je lui réponds qu'il a bien préparé l'entretien de l'ESSEC ! ». Parlez donc de « pistes professionnelles » plutôt que de projet gravé dans le marbre.",
      ],
    },
    {
      title: "Pourquoi le jury pose cette question",
      points: [
        "C'est d'abord une question normale quand on cherche à connaître quelqu'un : dans la vraie vie, après le prénom et la ville, on demande vite « et vous, vous faites quoi ? ».",
        "Surtout, la mission d'une école est de vous « donner » un métier : les cours, stages, échanges et associations ne sont que des moyens, et l'école est jugée sur l'employabilité de ses diplômés. Bonne nouvelle : vous et l'école avez le même objectif.",
        "Elle vérifie donc trois choses : que vous connaissez les métiers auxquels elle prépare, que votre projet est réaliste par rapport au marché, et qu'il vous ressemble assez pour convaincre un futur recruteur.",
        "Piège classique : viser un secteur qui a ses écoles spécialisées (hôtellerie, communication, sport, assurance) sans savoir défendre le choix d'une école de commerce généraliste - on vous demandera systématiquement pourquoi vous n'y allez pas directement.",
        "Piège classique : un métier trop niche (le marketing dans un club de foot, et rien d'autre) ou un métier en voie de disparition.",
        "Piège classique : un projet qui ne colle pas à ce que le jury perçoit de vous - dire qu'on veut faire du commercial avec un parcours fait uniquement d'activités solitaires. Dans ce cas, allez chercher d'autres expériences pour rassurer.",
        "À retenir : appuyez-vous sur votre passé pour montrer que le métier imaginé vous ressemble, puis montrez que vous avez compris comment l'école vous aidera à y arriver. C'est le triptyque Vous - Métiers - École, et il se construit en 4 étapes : se connaître, faire le lien avec le projet, comprendre le métier, définir le rôle de l'école.",
      ],
    },
    {
      title: "Étape 1 - Partir de soi",
      points: [
        "Listez toutes vos expériences, puis identifiez les raisons de vos choix, vos envies, et ce dont vous ne voulez pas.",
        "Repérez les qualités et défauts qui reviennent le plus souvent : ce sont eux qui relient votre passé à votre projet.",
        "Voyez large : c'est la juxtaposition de vos expériences qui fait apparaître le projet, comme un tableau pointilliste. Ne négligez rien.",
        "N'écartez pas les activités que vous jugez « peu valorisantes ». Le babysitting, par exemple, dit beaucoup : inspirer confiance à des parents, savoir animer, raconter, de la patience, un peu d'autorité, de l'intérêt pour les autres.",
        "Interrogez chaque registre : le sport (collectif ou individuel ? endurance ou vitesse ? capitaine ? esprit de compétition ?), l'associatif (tourné vers les autres ? recherche de sens ? passion technologie, art ?), les voyages (découvrir largement ou approfondir ? talent créatif ? talent d'organisation ?), et bien sûr les expériences professionnelles, les plus proches de ce que vous vivrez ensuite.",
        "Il ne s'agit pas de faire une liste à la Prévert des qualités que vous aimeriez avoir, mais de cerner celles qui vous caractérisent vraiment, preuves à l'appui.",
        "Un mot doit guider ce travail : la cohérence entre vous et le métier. Exemple : « la rigueur revient dans toutes mes expériences, et c'est indispensable en contrôle de gestion » ; ou « un stage de 3e en finance dans l'entreprise familiale a fait naître cet intérêt ». Une envie justifiée par une expérience rassure le jury.",
        "Repère utile - le modèle RIASEC de John Holland, six types de personnalité liés à des intérêts professionnels : Réaliste (besoin de concret, parfois physique), Investigateur (comprendre, analyser, résoudre), Artistique (originalité, émotions, intuition), Social (contact, écoute, aider), Entreprenant (défis, responsabilités, décision), Conventionnel (règles, minutie, précision).",
        "On identifie en général les 3 types les plus marqués chez soi, puis on les relie à une famille de métiers. Exemples : marketing (artistique + entreprenant), commercial (social + entreprenant), RH (social + investigateur), finance (conventionnel + investigateur).",
        "Méthode : pour chaque métier envisagé, clarifiez les profils RIASEC qu'il exige, puis demandez-vous si cela correspond à votre profil, vos envies et vos talents. Cet alignement est ce qui rend le projet crédible.",
        "Les tests RIASEC gratuits en ligne peuvent préciser votre profil, mais ne remplacent pas votre analyse : d'autres critères comptent aussi (type de structure - start-up, PME, multinationale -, type d'études, mode de vie).",
      ],
    },
    {
      title: "Étape 2 - Comprendre le métier",
      points: [
        "Commencez par une étude documentaire : jobteaser.com, jobirl.com, onisep.fr, et surtout de vraies offres d'emploi. Vous y verrez les missions d'une fonction et les compétences attendues.",
        "Mais le documentaire ne suffit pas à valider un choix : pour le ou les deux métiers qui vous intéressent réellement, il n'existe qu'une méthode, échanger avec des professionnels.",
        "Ces échanges donnent ce qu'aucune lecture ne donne : le poids réel de chaque mission, sa place dans la journée, la semaine, l'année, et ce que recouvrent vraiment les compétences annoncées. La « compétence commerciale » d'un acheteur qui négocie avec un fournisseur n'a rien à voir avec celle d'un commercial face à la grande distribution.",
        "« D'après les échanges que j'ai eus avec… » fait immédiatement la différence : chaque année, une ou deux personnes seulement dans une promo l'ont fait. Si votre interlocuteur est un ancien de l'école, l'effet est double.",
        "Commencez par votre entourage (famille, amis, amis d'amis), puis passez à LinkedIn - avoir un profil soigné y est aujourd'hui indispensable.",
        "Sur LinkedIn, cherchez par métier ET par école : « contrôleur de gestion » + l'école visée. Soyez précis sur l'intitulé pour obtenir des réponses pertinentes.",
        "Modèle de message : « Bonjour, je suis étudiant admissible aux concours des grandes écoles de commerce et je passe prochainement mon entretien de motivation. Votre métier et votre parcours m'intéressent beaucoup et j'aurais quelques questions à vous poser ainsi que des conseils à vous demander. Pensez-vous pouvoir me consacrer quelques minutes pour un entretien téléphonique ? Je vous en remercie par avance. Bien cordialement. »",
        "Règles de réseautage : demandez un conseil plutôt qu'un service, restez courtois, répondez et remerciez toujours, relancez avec tact, tenez votre interlocuteur au courant de vos résultats.",
        "Anticipez : il faut beaucoup de sollicitations et souvent une relance pour obtenir quelques réponses. Prenez-vous en avance.",
      ],
    },
    {
      title: "Étape 3 - Définir le rôle de l'école",
      points: [
        "L'enjeu est de montrer que vous n'êtes pas là par hasard : vous avez compris ce que chaque école apportera concrètement à votre projet. C'est un travail à refaire pour chacun de vos entretiens.",
        "Parlez d'abord des enseignements : c'est le cœur de métier d'une école. Justifier son choix par les associations ou les séjours à l'étranger devant un jury où siège un professeur est une erreur.",
        "Citez les cours que vous choisirez pour développer les compétences du métier visé : la première année sert à découvrir les fonctions de l'entreprise, la dernière à se spécialiser vers votre premier emploi. C'est cette spécialisation qui répond à « pourquoi notre école plutôt qu'une autre ? ».",
        "Un master ne représente qu'environ 400 heures : l'école fait donc des choix de modules (des cours de RSE dans un master finance, ou pas), de pondération (20 h ou 50 h sur l'internationalisation des marchés), de langue d'enseignement, d'entreprises partenaires, de professeurs « stars ».",
        "C'est en entrant dans ce niveau de détail que vous faites la différence : « toutes les écoles proposent un master en Marketing Management, mais X est la seule à insister autant sur la gestion de marque - ce qui compte pour moi car… ».",
        "Ce niveau d'information est rarement sur le site : appelez l'école pour demander le schéma pédagogique (ou syllabus) du master, qui liste les cours, leurs heures, leurs objectifs et leur contenu. Contactez aussi des étudiants de l'école. Vos concurrents ne le font jamais.",
        "Complétez ensuite avec les autres éléments de différenciation : entreprises partenaires (surtout si l'une vous intéresse), associations, échanges, professeurs reconnus, career center.",
        "Renseignez-vous enfin sur la région et les entreprises implantées : elles influencent les cours et ouvrent des possibilités de stage.",
        "Les liens avec le futur doivent être spécifiques à chaque école : masters, associations, universités et entreprises partenaires, nommés. Ceux de l'école X ne sont donc pas ceux de l'école Y.",
      ],
    },
    {
      title: "Étape 4 - Formuler son projet",
      points: [
        "Trois niveaux de formulation : le domaine d'activité (les métiers de la finance), le métier (contrôleur de gestion), le secteur (l'industrie textile). Le niveau attendu dépend de la maturité de votre parcours.",
        "En CPGE, le domaine d'activité suffit : « je suis intéressé par les métiers de la finance, de préférence dans le secteur du textile parce que… ».",
        "Après un BUT ou une licence, le jury attend plus de précision : « je veux commencer comme assistant contrôleur de gestion avant d'évoluer vers une direction financière, et j'aimerais particulièrement une entreprise comme Z dans le textile car… ».",
        "Appuyez-vous toujours sur votre passé pour montrer que le métier imaginé vous ressemble.",
      ],
    },
    {
      title: "Les pièges de formulation à éviter",
      points: [
        "« Manager » n'est pas un métier mais une responsabilité - humaine et financière - à laquelle on accède après quelques années d'expérience.",
        "« Chef de projet » et « consultant » sont trop imprécis : un chef de projet informatique n'a rien à voir avec un chef de projet événementiel. Précisez et justifiez le domaine.",
        "Aucun jury ne valorise un projet plutôt qu'un autre : il vérifie seulement que le projet est pertinent au regard des enseignements de l'école et cohérent avec ce qu'il perçoit de vous.",
        "Double vigilance sur l'entrepreneuriat : en parler faute d'autre idée, pour plaire à l'école ou « pour être son propre patron » est une erreur grave. Si l'envie est réelle, assumez-la : vous serez soigneusement questionné.",
        "Pour défendre un projet entrepreneurial, ayez en tête : un produit ou service qui apporte du nouveau à une cible précise, les investissements de lancement et les coûts opérationnels, le besoin de financement, l'appui d'une équipe et d'interlocuteurs plus expérimentés, et l'investissement personnel considérable (tout prend beaucoup plus de temps que prévu).",
        "On ne vous demande pas toutes les réponses, mais de montrer que vous vous êtes posé les questions essentielles.",
      ],
    },
  ],

};

/* ------------------------------------------------------------------ */
/* Base de connaissance - Module 6 : les questions clés décortiquées  */
/* Source : « Oraux de motivation - Les questions à connaître »       */
/* ------------------------------------------------------------------ */

export type KeyQuestion = {
  id: string;
  theme: string;
  /** Sous-partie éventuelle à l'intérieur d'un thème (ex. axes Clermont). */
  subTheme?: string;
  question: string;
  intent: string;
  criteria: string[];
  pitfalls: string[];
};

export const KEY_QUESTION_THEMES = [
  "Présentation",
  "Questions sur vous",
  "École de commerce",
  "Votre futur",
  "Actualité",
  "Région de l'école",
  "Management",
  "Questions déstabilisantes",
  "Conclusion",
  "Clermont SB",
  "EDHEC BS",
  "emlyon BS",
  "ESSEC BS",
] as const;

/** Ordre d'affichage des sous-parties Clermont SB. */
export const CLERMONT_SUB_THEMES = ["People", "Planet", "Profit"] as const;


export const KEY_QUESTIONS: KeyQuestion[] = [
  {
    id: "presentez-vous",
    theme: "Présentation",
    question: "Présentez-vous.",
    intent:
      "C'est la seule partie constante et prévisible de l'entretien, donc celle que vous devez maîtriser à 100 %. C'est aussi votre premier contact oral, le moment où vous êtes le plus stressé, et celui où le jury sort à peine de l'entretien précédent : c'est à vous d'aller chercher son attention, pas l'inverse. En 1 min 30 à 2 min, le jury attend une « carte de visite » claire, structurée, naturelle et dynamique - un premier aperçu de votre parcours scolaire et extra-scolaire - et surtout l'annonce des thèmes qu'il pourra creuser ensuite. Il vous pardonnera des hésitations dues au stress, beaucoup moins une présentation déstructurée ou récitée.",
    criteria: [
      "1) Identité : prénom puis nom (dans cet ordre), éventuellement l'âge et le lieu de résidence. Inutile de resaluer si les salutations ont déjà eu lieu.",
      "2) Parcours scolaire : le cursus actuel et le nom de l'établissement. Le bac et sa mention n'intéressent pas le jury à ce stade du concours - sauf s'il est « spécial » (européen, abibac), car il ajoute une dimension à votre profil.",
      "3) Expériences extra-scolaires, rangées en 5 catégories : stages et jobs, engagements associatifs, sports, voyages, hobbies/passions. On traite une catégorie entièrement avant de passer à la suivante.",
      "Pour chaque expérience, uniquement de la contextualisation : quand, combien de temps, où, quelle mission en une phrase, à quel niveau, quel titre ou rôle honorifique (capitanat, chef scout…).",
      "Classez les catégories par ordre décroissant d'importance pour votre candidature : l'attention du jury baisse au fil de votre discours, il doit entendre l'essentiel d'abord.",
      "Quand une catégorie contient beaucoup d'expériences (souvent voyages ou sports), sélectionnez les 2 ou 3 plus marquantes avec une tournure du type « j'ai eu l'occasion de pratiquer de nombreux sports, notamment… » : vous n'offrez au jury que de bonnes portes d'entrée.",
      "Ne sous-estimez pas les « petits jobs » (cours particuliers, saisonnier, agent d'entretien) : les membres du jury sont souvent des parents pour qui ces expériences comptent.",
      "4) Une conclusion qui tend une perche : une phrase qui aiguille le jury vers la question que vous voulez (« j'aimerais durant cet entretien pouvoir évoquer avec vous les qualités qui sont les miennes », « … les raisons qui me poussent à rejoindre l'EDHEC Business School »). Dans 70 à 90 % des cas, le jury prend la perche.",
      "Nommez l'école précisément : cela personnalise le discours.",
      "Du dynamisme : appuyer les moments clés par la voix, le regard, le sourire, et par les mots (« … et j'aimerais beaucoup vous détailler cela durant cet entretien »), sans surjouer ni sacrifier le naturel.",
      "Le projet professionnel reste hors de la présentation, sauf si vous êtes aussi à l'aise sur ce thème que sur vos expériences : mieux vaut l'aborder au cœur de l'entretien, une fois le jury démystifié.",
      "Préparez sans rédiger : ne l'écrivez pas mot à mot, et entraînez-vous à voix haute devant d'autres personnes, pas seul.",
    ],
    pitfalls: [
      "Réciter une poésie : un discours mécanique appris par cœur est très souvent coupé par le jury.",
      "Un discours déstructuré, avec des allers-retours entre thèmes (le sport, puis la musique, puis le sport) : le jury en conclut que vous ne savez pas vous faire comprendre.",
      "Donner des détails sans importance (arrondissement de naissance, mention du bac, intitulés de cours aimés) et noyer l'essentiel.",
      "Commencer par un stage dérisoire au détriment d'une expérience longue et engageante.",
      "Livrer déjà les apports et l'analyse de vos expériences : vous retirez au jury l'envie de vous interroger dessus, sans avoir eu le temps de bien répondre.",
      "Énumérer dix voyages sans hiérarchiser : le jury choisira au hasard, peut-être le moins marquant.",
      "Se tirer une balle dans le pied avec une information non demandée (« j'ai arrêté la natation à cause d'une blessure », « faute de temps »).",
      "Une conclusion ratée : le « euh… et voilà » suivi d'un silence, ou le « je suis ici pour vous montrer toute ma motivation à rejoindre votre école de commerce », impersonnel et suspect d'être servi à toutes les écoles.",
      "Un blanc : la première impression pèse sur tout le reste de l'entretien.",
    ],
  },
  {
    id: "presentation-5-min",
    theme: "Présentation",
    question: "Vous avez 5 minutes pour vous présenter.",
    intent:
      "Le jury impose parfois une présentation longue (3 à 5 min) par fatigue, par volonté de casser la routine ou par avance de timing. La structure et les exigences de la présentation courte restent valables ; ce qui change, c'est le niveau de développement attendu. Travaillez le format 5 minutes : il est plus facile d'enlever des éléments que d'en inventer le jour J.",
    criteria: [
      "Gardez exactement la même ossature : identité, parcours scolaire, catégories d'expériences hiérarchisées, conclusion avec une perche.",
      "Développez, pour vos expériences les plus importantes, un point précis en plus du contexte, selon le Passé-Présent-Futur : une anecdote passée, la qualité ou le défaut travaillé qu'elle révèle aujourd'hui, et la garantie donnée au jury pour demain.",
      "Prenez du recul sur 2 ou 3 expériences seulement, pas sur toutes : le reste reste au stade du contexte pour laisser des questions au jury.",
      "Faites des liens explicites avec le futur en école ET en entreprise (association ou master nommés, métier ou secteur visés).",
      "Montrez, comme dans la version courte, que vous vous êtes renseigné sur l'école, sans encore tout dérouler.",
      "Tenez le temps : un fil annoncé, des transitions nettes, une conclusion avant la limite - et la même perche finale, encore plus explicite.",
      "Restez naturel et dynamique sur 5 minutes : c'est la vraie difficulté de l'exercice long.",
    ],
    pitfalls: [
      "Meubler avec des détails scolaires ou anecdotiques pour « tenir » les 5 minutes.",
      "Tout livrer et n'avoir plus aucune munition pour la suite de l'entretien.",
      "Perdre la structure en développant au fil de l'inspiration.",
      "Passer 3 minutes sur une seule expérience et bâcler les autres catégories.",
      "Prendre du recul sur chaque expérience : la présentation devient un exposé et le jury n'a plus de question à poser.",
      "Dépasser franchement le temps imparti : le jury vous coupera, et c'est vous qui perdez la main.",
    ],
  },
  {
    id: "racontez-experience",
    theme: "Questions sur vous",
    question: "Racontez-nous cette expérience de…",
    intent:
      "Le jury vous lance sur une expérience repérée dans votre présentation, votre CV ou votre questionnaire. Rappelez-vous que toute question n'est qu'un prétexte pour en apprendre plus sur VOUS : l'expérience n'est que le support. Il attend donc les trois temps - le Passé (des anecdotes précises, ou « mini-expériences »), le Présent (la qualité développée ou le défaut travaillé qu'elles révèlent) et le Futur (comment vous capitaliserez concrètement en école ET en entreprise). Durée cible : 1 min 30 à 2 min.",
    criteria: [
      "Commencez impérativement par le contexte, 30 secondes maximum : de quoi s'agissait-il, où, quand, pendant combien de temps. Le jury doit situer l'expérience dans le temps et l'espace avant d'entendre vos anecdotes.",
      "Choisissez 3 ou 4 « mini-expériences » à raconter spontanément, et gardez-en une ou deux en réserve si le jury creuse.",
      "Hiérarchisez-les avec trois critères : la chronologie (le jury doit comprendre le chemin, pas seulement le titre final), l'importance (ce qui dit le plus sur vous passe tôt, car le jury peut vous couper) et la valorisation (ne commencez pas par un échec).",
      "Chaque anecdote sert une qualité ou un défaut travaillé : employez le champ lexical de cette qualité DANS le récit (« j'ai changé mes habitudes », « en m'adaptant à lui ») avant de la nommer, sinon la transition paraît plaquée.",
      "Parlez à la première personne : votre rôle, vos décisions, vos difficultés - pas celles du coach, des coéquipiers ou du « groupe ».",
      "Terminez par des liens avec le futur nommés et concrets, côté école (association, master, échange précis) et côté entreprise (métier, secteur, entreprises visées), car le jury mêle membres de l'école et professionnels.",
      "Ne mettez en avant que des qualités réellement vôtres : le jury creusera, et une qualité empruntée s'effondre à la première relance.",
      "Soignez le verbatim : c'est souvent un mot mal choisi qui crée un doute chez le jury.",
    ],
    pitfalls: [
      "Sauter le contexte et enchaîner directement les anecdotes : le jury est perdu et n'écoute plus.",
      "Rester en surface, énumérer des moments sans jamais dire ce que vous en retenez.",
      "Parler du groupe, de l'entraîneur ou des partenaires plutôt que de vous et de votre rôle.",
      "Commencer par le titre obtenu au bout de 15 ans, ou par un échec, alors que le jury peut vous couper à tout moment.",
      "« Balancer » une qualité sans anecdote qui la rende crédible : le jury coupe, et peut douter de votre sincérité.",
      "Oublier le futur : le jury reste sur sa faim et n'a aucune garantie pour vos années d'école et d'entreprise.",
      "Un verbatim qui vous dessert (« j'ai arrêté par manque de temps » laisse soupçonner un défaut d'organisation ; dites plutôt que c'était un choix pour privilégier vos objectifs académiques).",
      "Tout livrer d'un coup et n'avoir plus rien à dire si le jury reste longtemps sur cette expérience.",
    ],
  },
  {
    id: "apport-experience",
    theme: "Questions sur vous",
    question: "Qu'est-ce que cette expérience vous a apporté ?",
    intent:
      "Question cousine de la précédente, mais l'ordre s'inverse : ici le jury ne veut pas de contexte ni de récit d'entrée, il veut l'apport tout de suite - une qualité développée ou un défaut corrigé (Présent), éclairé ENSUITE par une anecdote de cette expérience (Passé), puis projeté dans le Futur. Si le jury vous pose cette question après vous avoir demandé de raconter l'expérience, c'est un signal : vous n'avez pas assez insisté sur les apports.",
    criteria: [
      "Répondez directement : pas de retour au contexte, pas d'anecdote en ouverture.",
      "Annoncez d'abord l'apport le plus important, puis illustrez-le par une anecdote courte et précise qui le rend crédible.",
      "Idéalement, combinez une qualité mise en valeur ET un défaut que l'expérience vous a permis de travailler : c'est ce mélange qui rassure le jury.",
      "Projetez chaque apport : à quoi il servira en école (association, master, échange nommés) et en entreprise (nouvel environnement, responsabilités croissantes).",
      "Une réponse construite et impactante plutôt que longue : gardez d'autres apports en stock, le jury en demandera peut-être davantage.",
      "Valorisez même les expériences anciennes ou modestes (stage de 3ᵉ, job saisonnier) : un premier contact avec l'entreprise à 14 ans n'est jamais anodin.",
    ],
    pitfalls: [
      "Dire qu'une expérience ne vous a rien apporté, ou la disqualifier parce qu'elle est ancienne ou courte (« je ne m'en souviens pas bien »).",
      "Confondre apports humains et compétences techniques : le jury cherche des qualités et des défauts travaillés.",
      "Dénigrer un métier, une usine, un environnement manuel : cela passe immédiatement pour de l'arrogance.",
      "Faire des « impasses » en ne parlant que des expériences qui vous arrangent : c'est aussi visible qu'une impasse sur un chapitre du programme.",
      "Rester au stade de l'affirmation (« ça m'a donné le goût du travail ») sans anecdote ni lien avec le futur.",
      "Repartir du contexte et refaire le récit : vous ne répondez pas à la question posée.",
    ],
  },
  {
    id: "trois-qualites",
    theme: "Questions sur vous",
    question: "Quelles sont vos 3 principales qualités ?",
    intent:
      "Le jury veut vous connaître (les qualités), être convaincu (l'anecdote passée) et être rassuré (le lien avec le futur). Il peut en demander une… ou cinq : préparez-en six, hiérarchisées, tirées d'expériences différentes.",
    criteria: [
      "Des qualités strictement professionnelles, affirmées sans précaution : on dit « je suis calme », pas « je crois que je suis plutôt calme ».",
      "Une anecdote datée et située par qualité, si possible deux issues d'expériences différentes, pour prouver la récurrence et non le hasard.",
      "Le champ lexical de la qualité employé dans le récit avant de la nommer, pour que la transition soit évidente pour le jury.",
      "Un lien avec le futur nommé (association précise de l'école, métier ou stage visé) sur la majorité des qualités ; on peut sauter un ou deux liens si le jury s'impatiente.",
      "Possibilité d'introduire une qualité par le regard des autres (« mes amis disent de moi que… »), ce qui la crédibilise.",
      "Une durée maîtrisée : environ 30 à 40 secondes par qualité, pas une minute.",
    ],
    pitfalls: [
      "Une réponse récitée : le jury sanctionne souvent en demandant deux qualités de plus, hors du script.",
      "Des qualités non professionnelles, ou annoncées sans anecdote qui les démontre.",
      "Les formules de doute (« j'imagine », « je crois ») : si vous n'êtes pas sûr, le jury ne le sera pas.",
      "Un lien avec le futur creux du type « je ferai pareil plus tard ».",
      "Passer si longtemps sur la première qualité que le jury pense que vous avez oublié qu'il en demandait trois.",
    ],
  },
  {
    id: "trois-defauts",
    theme: "Questions sur vous",
    question: "Quels sont vos 3 principaux défauts ?",
    intent:
      "Ce n'est pas un piège : le jury veut acter que vous connaissez vos faiblesses actuelles, comprendre comment vous travaillez dessus, et surtout ne pas avoir peur pour votre futur en école et en entreprise. L'objectif de votre réponse est de le rassurer.",
    criteria: [
      "Des défauts actuels, professionnels et réels : manque de rigueur, d'efficacité, de confiance en soi, impulsivité…",
      "Deux anecdotes par défaut : une qui l'illustre honnêtement, une plus positive qui montre que vous avez déjà commencé à le corriger - insistez davantage sur la seconde.",
      "Des situations futures précises, en école ET en entreprise, où vous savez que vous devrez être vigilant, et comment vous vous y prendrez (poste associatif visé, appui de collègues, méthode de travail).",
      "En préparer quatre : le jury peut en demander un de plus.",
      "Un ton assumé et préparé : l'hésitation trahit une question non travaillée.",
    ],
    pitfalls: [
      "Le défaut transformé en qualité, ou déclaré réglé au passé : ce n'est plus un défaut et cela ne répond pas à la question.",
      "Les faux défauts en « trop + qualité » (trop perfectionniste, trop ambitieux) : le jury n'est pas dupe.",
      "Les défauts non professionnels (gourmand, jaloux, têtu au quotidien).",
      "Annoncer des défauts sans aucun gage sur le futur : le jury repart inquiet pour vos années d'école.",
      "Sécher sur le troisième défaut, signe évident d'impréparation.",
    ],
  },
  {
    id: "amis-disent",
    theme: "Questions sur vous",
    question: "Qu'est-ce que vos amis disent de vous ?",
    intent:
      "Cette question est une cousine directe des qualités et défauts, mais elle change de point de vue : le jury ne veut plus votre auto-analyse, il veut le regard extérieur, celui qui se forme quand vous n'êtes plus en représentation - entre amis, en famille, en week-end de classe. C'est aussi un moyen détourné de vérifier la cohérence de votre discours : si les qualités « vues par les autres » contredisent celles annoncées plus tôt dans l'entretien, le jury flairera une réponse préfabriquée. Comptez 1 min environ, dans un registre plus détendu et plus personnel que le reste de l'entretien.",
    criteria: [
      "Annoncez 2 qualités et 1 défaut maximum : la règle du Passé-Présent-Futur reste valable, mais en version courte.",
      "Faites parler le regard des autres explicitement (« mes amis me disent souvent que… », « on me le fait souvent remarquer ») avant de nommer la qualité : c'est ce qui crédibilise la question et la différencie de « trois qualités ».",
      "Choisissez des anecdotes de vie collective - un voyage entre amis, une colocation, une organisation d'événement - jamais une performance solitaire ou scolaire.",
      "Gardez un ratio favorable : toujours plus de qualités que de défauts, sans pour autant balayer le défaut d'un revers de main.",
      "Reliez le défaut à une marge de progrès déjà amorcée, comme pour la question sur les défauts, pour rassurer sur votre vie en promotion.",
      "Variez les sources par rapport aux qualités déjà citées ailleurs dans l'entretien : montrez une autre facette de vous, pas un copier-coller.",
    ],
    pitfalls: [
      "Lister plus de défauts que de qualités : vous vous tirez une balle dans le pied sur une question censée être valorisante.",
      "Donner des adjectifs seuls (« sociable », « fidèle ») sans aucune anecdote de vie de groupe qui les rende crédibles.",
      "Réutiliser mot pour mot les qualités déjà énoncées plus tôt : le jury remarque la redite et doute de la sincérité du procédé.",
      "Répondre à la place de vos amis avec des formules impersonnelles (« je pense qu'on dirait que je suis... ») au lieu d'un vrai discours rapporté.",
      "Choisir une anecdote individuelle ou scolaire, qui rate l'angle « vie collective » attendu par la question.",
    ],
  },
  {
    id: "pourquoi-vous",
    theme: "Questions sur vous",
    question: "Pourquoi vous plutôt qu'un autre ?",
    intent:
      "Le jury pousse ici votre capacité à vous différencier des dizaines d'autres candidats qu'il a déjà entendus dans la journée, sans que cela ne vire à l'arrogance ni à la comparaison déplacée. Il attend une réponse construite comme une synthèse : ce sont vos singularités déjà évoquées dans l'entretien, reliées entre elles et projetées vers ce que vous apporterez concrètement. C'est une question de fin de parcours, souvent posée après plusieurs échanges, qui sert à vérifier que vous savez conclure votre propre plaidoyer en 1 minute environ.",
    criteria: [
      "Choisissez 2 ou 3 singularités réelles et déjà démontrées pendant l'entretien (via vos expériences), plutôt que d'en inventer de nouvelles à la dernière minute.",
      "Appuyez chaque singularité sur un fait précis et vérifiable, pas sur une déclaration d'intention.",
      "Formulez votre réponse en « je », centrée sur votre propre valeur ajoutée, jamais en comparaison directe des autres candidats.",
      "Terminez par un lien concret avec ce que vous apporterez à l'école et, plus loin, à l'entreprise ou au secteur visé.",
      "Adoptez un ton assumé mais mesuré : l'humilité de façade («je ne sais pas si je suis le meilleur ») affaiblit la réponse autant que l'arrogance.",
      "Profitez-en pour faire une synthèse de l'entretien : reprenez le fil rouge de votre parcours en une phrase de conclusion.",
    ],
    pitfalls: [
      "Se comparer explicitement aux autres candidats (« contrairement à d'autres, moi je... ») : cela sonne prétentieux et invérifiable pour le jury.",
      "Réciter des qualités génériques (motivé, travailleur, curieux) qu'on retrouve dans toutes les copies, sans aucune preuve qui les distingue.",
      "Répondre par une pirouette d'humilité (« je ne sais pas, il y a sûrement mieux que moi ») qui esquive complètement la question.",
      "Improviser une singularité qui n'a jamais été évoquée ailleurs dans l'entretien : le jury doute de sa sincérité.",
      "Oublier de refermer la réponse sur l'école ou l'entreprise, ce qui la rend abstraite et sans utilité pour le jury.",
    ],
  },
  {
    id: "apport-ecole",
    theme: "Questions sur vous",
    question: "Qu'apporteriez-vous à notre école ?",
    intent:
      "Cette question vérifie que vous vous projetez déjà comme un membre actif de la communauté et non comme un simple candidat en attente d'un sésame. Le jury veut des éléments nommés - associations, événements, compétences précises - qui prouvent une connaissance réelle de la vie de l'établissement, pas un discours qui pourrait s'appliquer à n'importe quelle école du classement. C'est aussi l'occasion pour vous de boucler la boucle Passé-Présent-Futur en montrant que vos apports futurs sont déjà annoncés par vos expériences passées.",
    criteria: [
      "Citez 2 ou 3 contributions concrètes : une association nommée avec son rôle réel dans l'école, un type de projet, une compétence transférable (organisation d'événement, réseau, langue rare…).",
      "Justifiez chaque apport par une preuve tirée de votre parcours : vous avez déjà fait la démonstration de cette compétence ailleurs.",
      "Montrez une connaissance réelle et récente de la vie associative et académique de l'école (nom exact des structures, actualité de l'école).",
      "Distinguez l'apport de court terme (dès la première année, dans une association) de l'apport de plus long terme (dans le réseau des anciens, dans le rayonnement de l'école).",
      "Restez mesuré dans le ton : vous proposez une contribution, vous ne promettez pas de « révolutionner » l'école.",
      "Gardez un ou deux apports en réserve si le jury creuse davantage sur ce point.",
    ],
    pitfalls: [
      "Rester dans les généralités (ma bonne humeur, mon sérieux, ma motivation) qui ne disent rien de spécifique à cette école.",
      "Citer une association ou un événement qui n'existe pas dans l'école visée : cela trahit un manque de recherche flagrant et coûte cher en crédibilité.",
      "Décrire un apport sans aucun lien avec une expérience passée, ce qui le rend gratuit et peu crédible aux yeux du jury.",
      "Confondre ce que l'école vous apportera et ce que vous lui apporterez : la question porte uniquement sur votre contribution.",
      "Une réponse trop ambitieuse ou déconnectée (« je vais transformer la vie associative ») qui sonne présomptueux pour un futur étudiant de première année.",
    ],
  },
  {
    id: "plus-gros-echec",
    theme: "Questions sur vous",
    question: "Quel est votre plus gros échec ?",
    intent:
      "Derrière cette question, le jury ne cherche pas à vous piéger ni à vous voir vous dénigrer : il veut mesurer votre lucidité sur vous-même et votre capacité de rebond, deux qualités déterminantes pour affronter la charge de travail en école puis en entreprise. Une réponse sincère, structurée en Passé (les faits et votre part de responsabilité), Présent (ce que vous en avez compris) et Futur (ce que vous avez changé depuis), rassure bien plus qu'une fausse humilité. Comptez 1 min à 1 min 30, sur un ton posé, sans dramatisation ni minimisation.",
    criteria: [
      "Choisissez un échec réel et assumé, daté et contextualisé en quelques phrases, quitte à ce qu'il soit modeste en apparence.",
      "Analysez honnêtement votre part de responsabilité, sans reporter la faute sur les circonstances ou sur les autres.",
      "Expliquez précisément ce que cet échec vous a fait comprendre sur vous-même ou sur votre méthode de travail.",
      "Montrez le changement concret opéré depuis (nouvelle organisation, nouvelle vigilance, nouveau réflexe).",
      "Reliez ce changement à une situation future précise, en école ou en entreprise, où il vous servira.",
      "Restez factuel plutôt que dramatique : le jury juge la maturité de l'analyse, pas la gravité de l'échec.",
    ],
    pitfalls: [
      "Présenter un faux échec, en réalité un succès déguisé (« mon échec, c'est de n'avoir eu que 18/20 ») : le jury perçoit l'esquive immédiatement.",
      "Rejeter la faute sur les autres, sur le professeur, sur le hasard : cela révèle un manque de recul inquiétant pour la vie de groupe en école.",
      "Rester dans la description des faits sans jamais dire ce que vous en avez retenu ni ce qui a changé depuis.",
      "Minimiser à outrance (« ce n'est pas vraiment un échec ») pour éviter le sujet, ce qui laisse penser que vous n'assumez rien.",
      "Choisir un échec si ancien ou si mineur qu'il ne dit plus rien de vous aujourd'hui.",
    ],
  },
  {
    id: "plus-belle-reussite",
    theme: "Questions sur vous",
    question: "Quelle est votre plus belle réussite ?",
    intent:
      "Le jury cherche ici ce qui compte vraiment pour vous, au-delà des lignes de votre CV, et surtout le rôle exact que vous y avez joué. Une bonne réponse suit le triptyque Passé (le contexte et les faits), Présent (la qualité personnelle que cette réussite démontre) et Futur (où elle vous servira encore). Ce n'est pas un concours du palmarès le plus impressionnant : une réussite modeste mais racontée à la première personne, avec du recul, vaut mieux qu'un trophée dont on ne sait pas ce que vous y avez apporté.",
    criteria: [
      "Choisissez une réussite qui vous ressemble vraiment, pas nécessairement la plus prestigieuse sur le papier.",
      "Racontez-la à la première personne, avec des faits précis sur votre rôle exact et vos décisions.",
      "Faites ressortir la qualité personnelle qu'elle démontre, en employant son champ lexical avant de la nommer.",
      "Expliquez brièvement le chemin parcouru (les obstacles, le temps investi) pour donner du relief au résultat final.",
      "Projetez cette qualité vers le futur, en école et en entreprise, avec un exemple concret d'usage à venir.",
      "Restez concis : 1 minute suffit, gardez d'autres réussites en réserve si le jury insiste.",
    ],
    pitfalls: [
      "Décrire une réussite collective sans jamais préciser votre rôle personnel, ce qui la rend invisible aux yeux du jury.",
      "Se contenter d'énoncer un palmarès ou un titre (« j'ai gagné tel concours ») sans aucun récit ni recul sur ce qu'il a demandé.",
      "Choisir une réussite trop ancienne ou trop scolaire qui ne dit plus rien de votre personnalité actuelle.",
      "Oublier le lien avec le futur, ce qui laisse la réponse comme un simple souvenir sans utilité pour le jury.",
      "Une réussite qui contredit le reste de votre discours (par exemple, une réussite très solitaire alors que vous vous présentez comme un profil très collectif).",
    ],
  },
  {
    id: "place-equipe",
    theme: "Questions sur vous",
    question: "Quelle est votre place dans un travail d'équipe ?",
    intent:
      "Le travail en groupe est un quotidien permanent en école (associations, études de cas) puis en entreprise (projets transverses, management) : le jury veut donc savoir comment vous vous positionnez réellement, pas quel rôle vous idéalisez. Une bonne réponse montre un rôle identifié, mais aussi la conscience des autres rôles et la capacité à s'adapter selon le contexte - l'équipe qui gagne n'est pas celle où tout le monde veut être leader. Comptez environ 1 minute, avec deux exemples de contextes différents pour prouver la constance de votre positionnement.",
    criteria: [
      "Identifiez clairement un rôle dominant (moteur, médiateur, exécutant méthodique, porte-parole…) sans forcément dire « leader ».",
      "Illustrez ce rôle par deux anecdotes issues de contextes différents (associatif et sportif, scolaire et professionnel) pour montrer sa constance.",
      "Montrez que vous savez reconnaître les autres rôles dans une équipe et que vous vous y adaptez selon les besoins du groupe.",
      "Donnez un exemple où vous avez dû changer de posture (prendre le lead exceptionnellement, ou au contraire vous effacer) pour servir l'équipe.",
      "Reliez explicitement votre rôle aux réalités de groupe en école (association, étude de cas) et en entreprise (équipe projet, management transverse).",
      "Restez honnête : votre rôle décrit ici doit être cohérent avec les autres réponses données pendant l'entretien.",
    ],
    pitfalls: [
      "Affirmer « je suis toujours leader » sans la moindre preuve : cela sonne comme une posture plutôt qu'un constat vécu.",
      "Décrire le fonctionnement de l'équipe en général plutôt que votre place précise à l'intérieur de celle-ci.",
      "Se présenter comme rigide dans un seul rôle, incapable de s'adapter selon les situations, ce qui inquiète pour la vie de promotion.",
      "Rester théorique (« je pense que je suis plutôt un bon communicant ») sans anecdote concrète pour l'étayer.",
      "Oublier tout lien avec l'école ou l'entreprise, ce qui rend la réponse abstraite et peu utile au jury.",
    ],
  },
  {
    id: "reorientation",
    theme: "Questions sur vous",
    question: "Pourquoi vous êtes-vous réorienté ?",
    intent:
      "Cette question ne cherche pas à vous faire justifier un « échec » mais à vérifier que le changement de trajectoire est un choix réfléchi et non une fuite subie. Le jury veut voir une décision structurée dans le temps : ce que l'ancien parcours vous a réellement apporté (Passé), le déclic et la réflexion qui ont suivi (Présent), et la cohérence de la trajectoire actuelle avec votre projet (Futur). C'est aussi un test de maturité : sait-on parler sereinement d'un choix qui n'a pas toujours été simple à assumer socialement ?",
    criteria: [
      "Racontez d'abord factuellement l'ancien parcours et ce qu'il vous a réellement apporté, sans le dénigrer.",
      "Identifiez clairement le déclencheur du changement (une découverte, un stage, un cours, une rencontre) plutôt qu'une formule vague.",
      "Détaillez le travail de recherche et de réflexion qui a suivi ce déclic, preuve que la décision a été mûrie et non impulsive.",
      "Montrez la cohérence explicite entre cette réorientation et votre projet professionnel actuel.",
      "Restez factuel et sans amertume sur l'ancien parcours, même s'il s'est mal passé.",
      "Terminez sur ce que cette expérience de réorientation vous a appris sur vous-même (remise en question, capacité de décision).",
    ],
    pitfalls: [
      "Critiquer ouvertement l'ancienne formation, ses professeurs ou son ambiance : cela sonne comme un règlement de comptes plutôt qu'une analyse.",
      "Laisser croire à une fuite ou à un échec non assumé, en éludant les vraies raisons du changement.",
      "Rester vague sur le déclencheur (« je ne me retrouvais pas »), ce qui ne convainc pas le jury de la solidité de la décision.",
      "Oublier de relier la réorientation au projet professionnel actuel, ce qui laisse penser à une trajectoire encore incertaine.",
      "Montrer trop d'hésitation ou de regret dans le ton, ce qui fragilise la crédibilité de votre choix actuel.",
    ],
  },
  {
    id: "individuel-collectif",
    theme: "Questions sur vous",
    question: "Préférez-vous le travail individuel ou collectif ?",
    intent:
      "C'est une question à faux dilemme : le jury n'attend ni un choix tranché et définitif, ni un « les deux » évasif, mais votre capacité à assumer une préférence tout en démontrant votre aisance dans l'autre mode. Il observe surtout la cohérence entre votre réponse et votre projet professionnel : un métier de conseil ou de commerce, par exemple, suppose une vraie aptitude au collectif, quelles que soient vos préférences personnelles. Comptez environ 45 secondes à 1 minute, avec un exemple pour chaque mode.",
    criteria: [
      "Assumez une préférence claire, sans faux-fuyant, tout en la nuançant immédiatement.",
      "Illustrez cette préférence par une anecdote précise et récente.",
      "Démontrez également votre aisance dans l'autre mode par un second exemple concret, pour prouver votre polyvalence.",
      "Reliez explicitement votre réponse au métier ou secteur visé (un commercial ou un consultant ne peut pas se présenter comme exclusivement solitaire).",
      "Restez cohérent avec le reste de l'entretien : votre profil affiché (leader, exécutant, médiateur) doit correspondre à votre réponse ici.",
      "Terminez en montrant comment cette nuance vous servira concrètement en école (travaux de groupe, mémoire) et en entreprise (missions en équipe et en autonomie).",
    ],
    pitfalls: [
      "Répondre « les deux, ça dépend » sans jamais trancher ni illustrer, ce qui laisse une impression de réponse creuse.",
      "Afficher une préférence en contradiction frontale avec le projet professionnel annoncé plus tôt (viser un métier très collectif tout en se disant exclusivement solitaire).",
      "Ne fournir qu'un seul exemple, ce qui ne prouve pas la polyvalence attendue par le jury.",
      "Décrire le travail collectif ou individuel en théorie, sans anecdote vécue qui l'ancre dans la réalité.",
      "Dévaloriser l'un des deux modes (« je déteste travailler seul », « le travail de groupe me fait perdre du temps »), ce qui inquiète sur votre adaptabilité future.",
    ],
  },
  {
    id: "jusquou-reussir",
    theme: "Questions sur vous",
    question: "Jusqu'où êtes-vous prêt à aller pour réussir ?",
    intent:
      "C'est une question de valeurs plus que de performance : le jury veut connaître votre définition personnelle de la réussite et surtout vos limites, car il recrute quelqu'un pour plusieurs années dans une communauté, pas uniquement un profil ambitieux. Une bonne réponse pose d'abord ce que « réussir » signifie pour vous, puis fixe des limites claires (éthique, équilibre de vie, respect des autres), avant de les illustrer par un effort réel déjà consenti dans le passé. Le jury se méfie autant du manque d'ambition que de l'absence totale de limites.",
    criteria: [
      "Définissez d'abord clairement ce que « réussir » représente pour vous, avant de parler des moyens.",
      "Posez des limites explicites et assumées (éthique professionnelle, respect des autres, équilibre de vie) plutôt que de les esquiver.",
      "Illustrez votre engagement par un exemple concret d'effort réel déjà fourni (temps investi, sacrifice ponctuel, persévérance).",
      "Montrez que l'ambition et les limites ne s'opposent pas : on peut vouloir réussir fortement tout en refusant certains compromis.",
      "Reliez votre réponse à votre projet professionnel, pour montrer que votre définition de la réussite est cohérente avec le métier visé.",
      "Gardez un ton mesuré et réfléchi : cette question mérite une vraie prise de position, pas une réponse toute faite.",
    ],
    pitfalls: [
      "Répondre « je ferais tout pour réussir » sans nuance : cela inquiète le jury sur votre rapport à l'éthique et aux autres.",
      "Livrer une réponse moralisatrice et récitée (« l'argent ne fait pas tout ») sans exemple vécu qui l'étaye.",
      "Ne fixer aucune limite concrète, ce qui laisse penser à un manque de repères personnels.",
      "À l'inverse, poser des limites si nombreuses que l'ambition semble absente, ce qui interroge sur votre motivation réelle.",
      "Rester abstrait sans jamais raconter un effort réellement fourni, ce qui prive la réponse de toute crédibilité.",
    ],
  },
  {
      id: "pourquoi-ecole-commerce",
      theme: "École de commerce",
      question: "Pourquoi une école de commerce ?",
      intent: "Le jury cherche à comprendre les raisons profondes qui poussent le candidat vers des études de management par la voie spécifique des écoles de commerce, et non vers une autre voie possible. Il faut bien saisir qu'il y a en réalité deux sujets imbriqués : pourquoi des études commerciales, et pourquoi le format école de commerce en particulier, sachant que ce format est concurrencé par les IAE, les licences universitaires, la voie professionnelle ou les universités étrangères. Le jury veut vérifier que le candidat a conscience de choisir une voie parmi d'autres, et non un parcours qui irait de soi. Une réponse qui présente l'école de commerce comme un passage obligé ou logique, y compris pour un élève de classe préparatoire, envoie le message que le candidat ne veut pas vraiment répondre à la question ou qu'il la juge dénuée de sens. Le jury en déduit alors un manque de réflexion sur son propre projet et un risque de désengagement une fois en école. À l'inverse, une réponse qui détaille le contenu réel des études et des expériences proposées prouve que le candidat s'est renseigné sérieusement, notamment en échangeant avec des étudiants ou de jeunes diplômés, ce qui rend son choix crédible.",
      criteria: [
        "Distinguer clairement les deux niveaux de la question : pourquoi des études commerciales en général, puis pourquoi la voie des écoles de commerce en particulier plutôt que les IAE, les licences universitaires, la voie professionnelle ou les universités étrangères.",
        "Se renseigner concrètement sur le contenu des études et des expériences en école de commerce, idéalement en discutant en amont avec des personnes en école ou tout juste diplômées, pour donner des arguments crédibles et non de simples poncifs.",
        "Suivre le schéma en trois temps recommandé pour chaque argument : 1) donner un argument de réponse à la question générale « pourquoi une école de commerce », 2) le justifier et le développer, 3) faire le lien avec l'école précise en montrant qu'elle propose quelque chose dans ce sens, sans que ce lien devienne l'essentiel de la réponse.",
        "Mettre en avant le caractère professionnalisant des écoles de commerce (stages nombreux, cours dispensés par des professionnels, étude de cas d'entreprise) comme argument central, car l'école a d'abord pour vocation de former à un métier.",
        "Évoquer les opportunités à l'international (études ou travail à l'étranger) comme un avantage complémentaire, mais jamais comme argument exclusif ni comme premier argument.",
        "Valoriser le réseau des anciens diplômés et les clubs professionnels qu'il propose (exemple donné dans le livre : un Club Finance) comme preuve d'une réflexion sur la carrière après l'école, en citant si possible un nom précis.",
        "Ne jamais dénigrer ni comparer ouvertement les autres formations (IAE, licences, universités étrangères) : il faut montrer qu'on choisit l'école de commerce pour ses atouts propres, et non par défaut ou par rejet des autres voies.",
        "Terminer par un lien avec l'école dont on passe l'entretien, mais seulement après avoir répondu à la question générale, car le jury a horreur d'entendre directement la réponse à « pourquoi notre école » quand on lui demande « pourquoi une école de commerce ».",
      ],
      pitfalls: [
        "Présenter les écoles de commerce comme le parcours « logique », y compris après une classe préparatoire : cela laisse penser que le candidat n'a pas vraiment fait de choix et qu'il ne prend pas la question au sérieux.",
        "Invoquer le taux d'insertion professionnelle (par exemple 98 % des diplômés en poste) comme argument de sécurité : le jury y voit la recherche d'une « planque » plutôt qu'une réelle envie de construire un métier.",
        "Ne citer que des poncifs génériques (travailler en entreprise, vivre à l'international) sans jamais préciser ce que l'école propose concrètement pour y parvenir : cela montre une méconnaissance du contenu réel des études, ce qui décrédibilise toute la motivation affichée.",
        "Critiquer les autres formations avec des arguments caricaturaux (la licence où l'on n'est pas suivi, l'IAE jugé moins prestigieux) : cela agace le jury sans jamais valoriser les vrais atouts de l'école de commerce.",
        "Mettre en avant l'international comme argument unique ou premier : le jury peut alors rétorquer qu'il vaudrait mieux étudier directement à l'étranger, retournant l'atout contre le candidat.",
        "Terminer sur un argument potentiellement intéressant (comme une association précise) sans le développer ni le relier à un projet plus large : cela donne une impression de réponse bâclée ou improvisée.",
        "Répondre directement à « pourquoi notre école » alors qu'on demande « pourquoi une école de commerce » : c'est l'erreur que le jury déteste le plus entendre, car elle montre que le candidat n'a pas écouté la question posée.",
      ],
    },
    {
      id: "pourquoi-notre-ecole",
      theme: "École de commerce",
      question: "Pourquoi notre école de commerce ?",
      intent: "Cette question revient systématiquement à chaque entretien et elle est essentielle car elle permet au jury de vérifier deux choses : que le candidat s'est renseigné sur l'école et sur ce qui la distingue de ses concurrentes, et que cette école précise peut répondre à ses attentes professionnelles et personnelles. Le jury sait que la concurrence entre écoles est si forte qu'aucune ne peut se permettre de ne pas proposer une formation en finance, des échanges à l'étranger ou une vie associative ; il attend donc du candidat qu'il aille chercher, au-delà des évidences communes à toutes les écoles, des différences fines dans le contenu des formations, des associations ou des programmes. Une réponse vague, fondée sur des classements, la proximité géographique avec la famille ou un proche, ou la simple récitation de la plaquette de l'école, prouve au jury que le candidat ne sait pas ce que l'école peut lui apporter en propre. Le jury en déduit alors qu'il tient le même discours à toutes les écoles qu'il présente, ce qui casse la personnalisation attendue et la crédibilité du projet. À l'inverse, des arguments précis, nommés et reliés au projet personnel du candidat démontrent ce que l'auteur appelle une « volonté éclairée », gage de motivation réelle.",
      criteria: [
        "Comprendre que la différenciation entre écoles se joue dans le détail : il faut « prendre une loupe » sur le contenu précis des Masters, des associations ou des échanges (par exemple un programme finance à la carte contre une préparation au CFA, une association mieux dotée mais un mandat plus court ailleurs) plutôt que de rester au niveau des grandes catégories communes à toutes les écoles.",
        "Obtenir ce niveau de détail en échangeant directement avec des étudiants ou jeunes diplômés de l'école, car le site internet, la plaquette ou le site admission sont accessibles à tous les candidats et ne suffisent plus à se différencier.",
        "Être très concret et toujours nommer les Masters, parcours, associations, échanges et entreprises partenaires évoqués : cela prouve au jury la personnalisation de la réponse et renforce la crédibilité des arguments.",
        "Utiliser la méthode du tableau à trois colonnes pour chaque argument retenu (jusqu'à 3 ou 4 maximum, en privilégiant la qualité à la quantité) : l'argument lui-même, le lien avec soi et la justification personnelle, puis ce qui distingue cet argument des autres écoles.",
        "Hiérarchiser les arguments en plaçant en premier celui qui répond aux attentes professionnelles, car l'école doit avant tout proposer une formation au métier visé ; c'est l'argument le plus difficile à ne pas mettre en tête.",
        "Ne jamais placer les associations en premier argument, pour trois raisons : le jury est composé de salariés de l'école ou de professionnels peu sensibles à cet aspect, la vie associative n'est pas le service principal acheté qu'est la formation, et cela donnerait une image frivole ou immature du candidat.",
        "Relier chaque argument choisi à son propre projet ou ses envies professionnelles plutôt qu'à des clichés associés à chaque école (la finance à l'EDHEC, les campus à SKEMA) sans volonté réelle d'en profiter : le jury doit sentir que l'école lui apporte quelque chose à LUI en particulier.",
        "Traiter la question de la ville avec prudence : elle ne peut constituer un argument recevable que si elle est reliée au tissu économique local, à des entreprises ou un secteur d'activité qui intéresse le candidat, jamais à la proximité familiale ou sentimentale.",
        "Éviter toute comparaison frontale ou nominative avec les autres écoles ; il s'agit de mettre en valeur l'école visée, jamais de critiquer ouvertement une concurrente, car le jury pourrait craindre le même traitement en retour.",
        "Soigner la forme de la réponse (enthousiasme, sourire, dynamisme) car le fond, aussi solide soit-il, peut être discrédité par une présentation sans conviction.",
      ],
      pitfalls: [
        "Invoquer le classement de l'école (par exemple une septième place dans un palmarès) comme argument principal : c'est un critère jugé futile qui ne dit rien du projet du candidat.",
        "Rester vague en ne citant aucun nom de Master, d'association ou de destination d'échange : le jury ne peut alors pas imaginer le candidat en école et ne peut pas être rassuré sur son parcours futur.",
        "Réciter la plaquette de l'école sans lien avec son propre projet : parler de la finance à l'EDHEC ou des campus à SKEMA sans vouloir réellement les exploiter donne l'impression que le candidat ne sait pas ce que l'école peut lui apporter à lui personnellement.",
        "Mettre en avant les associations avant les arguments professionnels : cela laisse penser que le candidat rejoint l'école d'abord pour la vie associative, ce qui paraît frivole et immature aux yeux d'un jury composé de professionnels.",
        "Citer la proximité avec la famille, un compagnon ou une compagne comme critère de choix : ce type d'argument n'est jamais recevable pour un jury et décrédibilise immédiatement la réponse.",
        "Évoquer la ville sans la relier au paysage économique local ou à un secteur d'intérêt : un argument géographique isolé paraît anecdotique et déconnecté du projet professionnel.",
        "Comparer frontalement et nommément l'école à ses concurrentes : le jury peut craindre que le candidat tienne le même discours critique ailleurs, ce qui nuit à son image.",
      ],
    },
    {
      id: "que-voulez-vous-faire-ecole",
      theme: "École de commerce",
      question: "Que voulez-vous faire dans notre école ?",
      intent: "Cette question, proche de « pourquoi notre école », peut se décliner sous des formes comme « racontez-moi vos premiers mois dans l'école » ou « que voulez-vous vivre dans notre école ». Elle sert d'abord à vérifier que le candidat sait où il met les pieds et qu'il s'est renseigné sur ce que propose une école de commerce, tant sur le plan académique qu'extra-académique. Elle permet ensuite au jury de juger ce que le candidat apprécie dans l'école et d'acter le fait qu'il pourrait s'y épanouir. Le jury attend un parcours envisagé de façon concrète, même s'il est amené à évoluer, avec des noms précis d'associations, de parcours, de Masters ou d'échanges. Le test implicite pour le jury est de savoir s'il a pu se représenter mentalement le candidat en train de vivre ce parcours pendant qu'il le racontait : si l'histoire est suffisamment détaillée, elle prouve la connaissance réelle de l'école. À l'inverse, une réponse faite de généralités montre que le candidat ne sait pas ce qu'il va trouver en école, ce qui pousse le jury à douter de sa capacité à s'y intégrer.",
      criteria: [
        "Construire une réponse concrète et chronologique du parcours envisagé en école, en acceptant qu'il puisse évoluer, plutôt que de rester dans des généralités abstraites.",
        "Nommer systématiquement les associations, parcours, Masters et échanges évoqués, car ces noms précis sont indispensables pour prouver que le candidat s'est renseigné.",
        "Couvrir plusieurs pans de la vie en école pour montrer une vision complète : intégration dans la promotion et événements d'accueil, cursus académique et spécialisation, expériences professionnelles (stages, année de césure), vie associative, éventuellement les échanges internationaux.",
        "Donner des repères temporels précis (première année, quatrième année, période de campagne pour un Bureau des Étudiants, mois de l'année pour un forum entreprises) pour ancrer le récit dans le réel et permettre au jury de se projeter.",
        "Relier les choix évoqués (stage, césure, spécialisation) à un projet professionnel naissant, même encore hypothétique, afin de montrer une cohérence entre le parcours envisagé et les envies actuelles.",
        "Préciser que le projet est amené à évoluer une fois en école : cela rassure le jury sur la maturité du candidat, qui construit sa réponse à partir de ses envies actuelles sans prétendre tout savoir définitivement.",
        "Se renseigner auprès d'anciens ou d'actuels étudiants de l'école pour obtenir des détails suffisamment fins, sans toutefois chercher à égaler la précision qu'aurait un étudiant déjà sur place.",
        "Terminer si possible sur un engagement associatif concret et daté (exemple donné : une candidature au Bureau des Étudiants avec une campagne de novembre à janvier) pour montrer une volonté de s'investir collectivement.",
      ],
      pitfalls: [
        "Se réfugier derrière le fait de ne pas encore être en école pour justifier une réponse vague : cette excuse ne convainc pas le jury, qui attend justement une projection préparée en amont.",
        "N'énoncer que des généralités sans aucun nom ni détail temporel (« je vais rentrer dans une association », « je pense me spécialiser en marketing ») : cela révèle une absence de connaissance réelle de l'école et une préparation insuffisante.",
        "Évoquer l'international comme simple envie personnelle de voyager (par exemple citer l'Amérique latine « qui attire ») sans lien avec un projet professionnel ou académique précis : cela paraît futile aux yeux du jury.",
        "Manquer de structure en énumérant des envies disparates sans fil conducteur ni hiérarchisation entre académique, professionnel et associatif.",
        "Donner l'impression d'improviser une réponse jamais préparée : le jury en conclut qu'il ne peut pas accepter un candidat qui ne sait pas ce qu'il va trouver dans l'école.",
        "Oublier de mentionner tout repère concret (nom de master, de banque partenaire, de forum, de club) alors que ces détails sont ce qui permet au jury de « voir » le candidat évoluer en école.",
      ],
    },
    {
      id: "qu-est-ce-que-notre-ecole-va-vous-apporter",
      theme: "École de commerce",
      question: "Qu'est-ce que notre école va vous apporter ?",
      intent: "Cette question appartient à la même famille que les précédentes : elle demande au candidat de se projeter concrètement dans l'école, de montrer qu'il a réfléchi à ce qu'il va y vivre et qu'il connaît les atouts d'une école de commerce. La nuance par rapport aux questions précédentes est qu'il faut insister davantage sur les connaissances et compétences que l'école va permettre de développer, et non uniquement sur les activités qui vont être menées. Le jury attend une prise de recul analytique : il ne suffit pas d'énumérer ce que l'on compte faire en école, il faut expliquer en quoi cela constitue un apport réel, suffisamment important pour justifier le coût financier d'une école de commerce. Une réponse purement factuelle, qui décrit des actions sans jamais donner d'opinion sur leur valeur ajoutée, ne répond pas vraiment à la question posée et laisse le jury sur sa faim. Le jury cherche aussi à vérifier que les avantages mis en avant ne sont pas disproportionnés par rapport au coût de la formation, ce qui exclurait par exemple de justifier un semestre à l'étranger uniquement par l'envie d'apprendre une langue.",
      criteria: [
        "Reprendre les mêmes prérequis que pour les questions sur l'école et son quotidien (concret, noms précis, connaissance du contenu), mais en insistant spécifiquement sur les connaissances et compétences développées plutôt que sur la simple description des activités.",
        "Adopter une posture analytique et donner son opinion sur la valeur de chaque expérience évoquée, et pas seulement énoncer des faits : expliquer en quoi telle rencontre, tel stage ou tel échange constitue un apport réel pour soi.",
        "Vérifier que chaque avantage cité est suffisamment important pour « justifier » le coût d'une école de commerce, en gardant à l'esprit le prisme de l'apport professionnel même si les apports personnels ne doivent pas être totalement négligés.",
        "Mettre en avant la diversité des profils rencontrés en école (classes préparatoires économiques ou littéraires, licences, écoles d'ingénieurs) comme un apport en termes de façons de raisonner différentes.",
        "Relier les cours, la spécialisation et les stages à un projet professionnel précis, en expliquant comment les connaissances théoriques des cours et les compétences pratiques des stages se complètent concrètement.",
        "Nommer les Masters, parcours ou destinations d'échange envisagés pour ancrer la réponse dans du concret, même si l'absence occasionnelle de noms d'entreprises ou d'universités peut être partiellement compensée par d'autres précisions.",
        "Présenter un éventuel échange à l'étranger comme un apport professionnel (découverte des pratiques métier dans un autre pays) plutôt que comme un simple moyen de perfectionner une langue, argument jugé disproportionné par rapport au coût de la scolarité.",
        "Construire un fil conducteur cohérent entre rencontres, formation académique, stages et éventuel échange, afin que chaque élément réponde bien à la question posée sur l'apport réel de l'école.",
      ],
      pitfalls: [
        "Se contenter d'un discours factuel qui énumère ce qu'on va faire en école sans jamais expliciter l'apport ou la valeur de ces expériences : cela ne répond pas à la question, qui porte sur ce que l'école « apporte » et non sur ce que le candidat compte y faire.",
        "Justifier l'apport de l'école uniquement par le taux d'insertion professionnelle affiché sur la plaquette : cet argument reste creux et impersonnel.",
        "Mettre en avant un futur travail en banque en se fondant uniquement sur le profil de certains admissurs, sans jamais citer une entreprise partenaire ou une expérience concrète : cela reste trop vague pour convaincre.",
        "Répondre que l'on ne pourra vraiment savoir ce que l'école apporte qu'une fois sur place : cette esquive montre un manque de préparation et déçoit un jury qui attend une réflexion déjà entamée.",
        "Justifier un semestre à l'étranger uniquement par l'envie d'apprendre ou de perfectionner une langue : l'argument paraît disproportionné face au coût élevé d'une année d'école de commerce.",
        "Rester vague en ne citant aucun nom d'association, d'université partenaire ou d'entreprise, ce qui empêche le jury de vérifier que le candidat connaît réellement l'école.",
      ],
    },
    {
      id: "quelle-est-la-devise-notre-ecole",
      theme: "École de commerce",
      question: "Quelle est la devise de notre école ?",
      intent: "En préparant les fiches écoles, le candidat doit être vigilant aux devises des établissements, car elles peuvent faire l'objet de questions directes du jury, parfois même déclinées sous une forme plus large : l'exemple donné dans le livre est celui d'un co-jury à Skema qui demandait systématiquement ce que représentait pour le candidat « l'économie de la connaissance ». Le jury veut vérifier que le candidat connaît un minimum l'identité et la communication de l'école, mais surtout qu'il est capable de donner du sens à cette devise en la reliant à sa propre personnalité, ses expériences ou ses projets futurs. Une réponse qui se contente d'annoncer la devise sans jamais la relier à soi est jugée moyenne, car elle ne prouve rien de la motivation réelle du candidat. À l'inverse, ne pas connaître la devise de l'école dont on passe l'entretien est perçu comme un manque de préparation difficilement rattrapable sur cette question précise.",
      criteria: [
        "Connaître par cœur la devise de chaque école dont on passe l'entretien, en la travaillant en amont dans ses fiches écoles.",
        "Ne jamais se contenter d'annoncer la devise brute : il faut systématiquement construire une interprétation personnelle de ce qu'elle signifie, avant de la relier à soi.",
        "Relier explicitement la devise à une expérience passée concrète du candidat, pour prouver que l'adéquation avec l'esprit de l'école n'est pas artificielle mais vécue.",
        "Prolonger le lien vers des envies ou projets futurs en école, afin de montrer que l'adhésion à la devise ne relève pas seulement du passé mais orientera aussi le comportement futur du candidat sur le campus.",
        "S'inspirer de l'exemple donné dans le livre (la devise « early makers » d'emlyon business school interprétée comme une invitation à prendre des initiatives sans se mettre de barrières liées à l'âge ou à l'inexpérience, reliée à la création d'un club de sport au lycée puis à des envies d'initiatives en école comme un parcours à la carte ou la création d'une section sportive) comme modèle de structure de réponse.",
        "Anticiper que la question peut être posée sous une forme élargie, en demandant d'interpréter un concept clé de l'identité de l'école plutôt que la devise littérale, et se préparer à donner du sens à ce type de notion également.",
      ],
      pitfalls: [
        "Ne pas connaître la devise de l'école dont on passe l'entretien : c'est l'erreur la plus pénalisante sur cette question, car elle est directement synonyme d'un manque de préparation basique.",
        "Se contenter d'annoncer la devise sans jamais la relier à soi, à ses expériences ou à ses projets : cette réponse moyenne ne permet pas au jury de juger l'adéquation réelle du candidat avec l'esprit de l'école.",
        "Donner une interprétation de la devise trop générale ou théorique, sans exemple personnel concret à l'appui, ce qui affaiblit la crédibilité de la réponse.",
        "Négliger de préparer cette question sous prétexte qu'elle semble secondaire, alors qu'elle revient régulièrement dans certains jurys, parfois sous une forme élargie et inattendue.",
      ],
    },
    {
      id: "quelles-sont-les-valeurs-notre-ecole",
      theme: "École de commerce",
      question: "Quelles sont les valeurs de notre école ?",
      intent: "Cette question obéit exactement aux mêmes règles de préparation que celle sur la devise de l'école : le jury veut vérifier que le candidat connaît les valeurs affichées par l'établissement et qu'il est capable de les relier concrètement à sa personnalité, ses expériences ou son projet professionnel. Il faut cependant veiller à bien distinguer, dans la communication de l'école, la devise, qui fonctionne comme une baseline courte, des valeurs, qui sont en général formulées de façon plus structurée, parfois sous forme de plusieurs mots clés. En cas de doute sur la formulation exacte des valeurs, le candidat est encouragé à se renseigner directement auprès de l'école plutôt que de risquer une erreur ou une approximation. Comme pour la devise, une réponse qui se limite à réciter les valeurs sans les incarner par un exemple personnel est jugée insuffisante, car elle ne prouve pas une adhésion réelle à l'identité de l'établissement.",
      criteria: [
        "Bien identifier et mémoriser les valeurs précises de chaque école, telles qu'elles sont formulées officiellement (exemple donné dans le livre : Care, Create, Share pour KEDGE).",
        "Distinguer clairement les valeurs de la devise dans son travail de préparation, car ce sont deux éléments différents de la communication de l'école qu'il ne faut pas confondre.",
        "En cas de doute sur la formulation exacte des valeurs, contacter directement l'école par téléphone plutôt que de prendre le risque d'une réponse erronée.",
        "Choisir, parmi les valeurs citées, celle qui résonne le plus fortement avec son propre projet professionnel ou personnel, et construire sa réponse autour de ce lien privilégié plutôt que de toutes les traiter de façon superficielle.",
        "Illustrer le lien choisi par une expérience concrète et vécue (exemple du livre : la valeur « Create » reliée à un projet de création d'entreprise, puis reliée elle-même à une pratique collective comme le sport en équipe) pour rendre la démonstration crédible.",
        "Construire un raisonnement qui enchaîne logiquement la valeur, le projet personnel, et une preuve vécue, afin que le jury perçoive une cohérence d'ensemble plutôt qu'une association artificielle.",
      ],
      pitfalls: [
        "Confondre les valeurs de l'école avec sa devise, ce qui révèle un manque de rigueur dans la préparation de la fiche école.",
        "Réciter les valeurs sans jamais les relier à sa propre personnalité, ses expériences ou son projet : cette réponse reste creuse et n'apporte aucune preuve d'adéquation avec l'école.",
        "Se tromper sur la formulation exacte des valeurs faute d'avoir vérifié l'information directement auprès de l'école en cas de doute.",
        "Vouloir se relier à toutes les valeurs de façon superficielle plutôt que de développer un lien fort et argumenté avec une seule d'entre elles, ce qui dilue la force de la démonstration.",
        "Ne pas préparer cette question en la jugeant secondaire, alors qu'elle suit exactement la même logique d'exigence que celle sur la devise et peut tout aussi bien être posée par le jury.",
      ],
    },
  {
      id: "dans-5-ans",
      theme: "Votre futur",
      question: "Où vous voyez-vous dans 5 ans ?",
      intent: "En posant cette question, le jury sait pertinemment que dans 5 ans vous ne serez qu'un tout jeune diplômé, et c'est justement ce qu'il attend de vérifier : que vous n'oubliez pas cette réalité et que vous ne vous projetez pas trop haut, trop vite. Derrière l'apparente question sur votre avenir professionnel se cache surtout une interrogation sur ce que l'école va vous apporter concrètement, sur les étapes que vous comptez y vivre et sur la manière dont vous comptez les enchaîner. Le jury veut aussi sonder votre état d'esprit de futur jeune diplômé : mobilité ou stabilité, spécialisation ou polyvalence, grande structure ou start-up. Une réponse évasive ou utopique trahit un manque de curiosité pour son propre parcours et une méconnaissance du fonctionnement de la vie en école. À l'inverse, une réponse précise, chronologique et argumentée rassure le jury sur le fait que vous ne serez pas perdu une fois admis, et que l'école aura un rôle actif et identifiable dans votre trajectoire.",
      criteria: [
        "Répondez d'abord clairement et sans détour à la question dans les toutes premières phrases, en donnant une situation professionnelle précise (métier, secteur, éventuellement zone géographique) plutôt qu'une idée vague.",
        "Déroulez ensuite le fil chronologique des 5 années à venir en citant les étapes réelles de la vie en école : engagement associatif, choix de spécialisation ou de Master, stage en France ou à l'étranger, semestre académique à l'étranger, projets menés avec des camarades de promotion.",
        "Nommez si possible le Master ou la spécialisation visée : un projet resté anonyme sur ce point est perçu comme un manque de préparation, même dans une bonne réponse.",
        "Justifiez votre choix professionnel en mentionnant que vous vous êtes renseigné, par exemple en ayant échangé avec des étudiants ou des professionnels du métier visé.",
        "Précisez votre état d'esprit de sortie d'école : voulez-vous rester mobile ou vous installer, vous spécialiser ou explorer plusieurs secteurs, démarrer en grande structure ou en petite structure comme une start-up.",
        "Évoquez les expériences internationales comme des pierres de construction de votre projet professionnel (stage, échange académique) et non comme un simple voyage ou une opportunité linguistique isolée.",
        "Si vous êtes encore incertain de votre voie, présentez tout de même la possibilité professionnelle la plus probable et la manière d'y parvenir, en précisant que ce choix pourra évoluer en école : cela suffit à rassurer le jury sur le fait que vous avez un cap.",
        "Terminez si besoin par une phrase de nuance assumée, du type 'il s'agit de mon souhait actuel, qui pourra évoluer', qui protège votre réponse sans l'affaiblir.",
      ],
      pitfalls: [
        "Se projeter comme manager d'équipe dès la sortie d'école : c'est utopique pour un jeune diplômé et cela révèle un manque de curiosité sur l'évolution réelle des carrières, comme dans l'exemple du candidat qui se voyait déjà manager en private equity.",
        "Rester vague sur les apports académiques de l'école, par exemple en ne citant pas le nom du Master visé : cela affaiblit fortement la crédibilité de la réponse, même si le reste est bien construit.",
        "Ne pas préciser quelles expériences internationales seront recherchées (stage ou échange) ni dans quel pays : le flou renvoie une impression d'improvisation.",
        "Présenter les expériences à l'étranger uniquement comme un 'voyage' permettant d'apprendre des langues, ce qui minimise leur rôle réel dans la construction du parcours professionnel et paraît maladroit face au jury.",
        "Rester silencieux sur son état d'esprit à la sortie d'école (mobilité, type de structure, spécialisation), ce qui prive le jury d'une partie essentielle de la réponse attendue.",
        "Donner une réponse trop générale sans aucune chronologie ni étape identifiable, ce qui empêche le jury de juger votre lucidité sur les opportunités qu'offre l'école.",
      ],
    },
    {
      id: "dans-10-ans",
      theme: "Votre futur",
      question: "Où vous voyez-vous dans 10 ans ?",
      intent: "Cette question suit la même logique que celle à 5 ans, mais la difficulté change de nature : à environ 30 ans, vous serez très probablement dans une position de manager avec des responsabilités et des projets à charge, et il faut donc que le jury sente un vrai jonglage entre ambition et modestie. Se projeter à 10 ans représente la moitié de votre vie actuelle, ce qui exige de rendre cohérent tout votre début de carrière, et non plus seulement votre parcours en école. Le jury cherche à vérifier que vous vous êtes renseigné sur l'évolution réelle des métiers évoqués et que votre ambition reste réaliste, ni trop timide ni démesurée. Une réponse qui invente une position de haut niveau sans justification trahit un manque de recherche et fait perdre toute crédibilité au candidat. À l'inverse, une trajectoire construite étape par étape, avec une ambition mesurée et un fil professionnel cohérent, démontre exactement la maturité que le jury recherche.",
      criteria: [
        "Répondez d'abord précisément à la question en donnant une situation professionnelle concrète, puis reprenez le fil de votre début de carrière plutôt que votre parcours en école, contrairement à la question sur les 5 ans.",
        "Vous pouvez évoquer l'école rapidement (Master obtenu, par exemple) mais sans qu'elle prenne une place importante dans la réponse : l'accent doit porter sur l'après-école.",
        "Construisez une trajectoire réaliste et progressive : par exemple commencer employé dans une structure pour apprendre le métier, avant d'envisager une évolution ou une création d'entreprise plusieurs années plus tard.",
        "Renseignez-vous en amont sur l'évolution de carrière typique des métiers que vous évoquez, pour montrer que votre ambition à 10 ans est fondée sur une connaissance réelle du secteur et non sur un fantasme.",
        "Dosez soigneusement ambition et modestie : ni une fonction dirigeante irréaliste pour un profil encore junior, ni une absence totale de perspective d'évolution.",
        "Ajoutez si possible un élément d'originalité cohérent avec votre parcours, par exemple un projet de mobilité géographique justifié par la connaissance d'un marché particulier, pour montrer une vraie appropriation du sujet.",
        "Terminez sur une note de clarté et de précision globale : le jury attend avant tout un raisonnement justifié, pas une prédiction exacte de votre futur.",
      ],
      pitfalls: [
        "Annoncer un poste de direction prestigieux (directeur marketing d'une grande maison de luxe, par exemple) sans étapes intermédiaires crédibles : c'est le défaut d'utopisme le plus fréquent et le plus pénalisant, révélateur d'un manque de recherche.",
        "Rester vague sur des notions comme 'l'international' sans préciser de quoi il s'agit concrètement : le flou affaiblit la réponse même s'il n'en est pas le principal défaut.",
        "Ne donner aucune indication sur le cheminement professionnel qui mène à la situation décrite, ce qui empêche le jury de juger la lucidité du candidat sur les opportunités réelles du secteur.",
        "Faire la même erreur qu'à la question sur les 5 ans en insistant trop sur la vie en école plutôt que sur le début de carrière, ce qui est hors sujet à cet horizon temporel plus lointain.",
        "Manquer d'ambition ou, à l'inverse, sombrer dans la démesure : le jury attend un équilibre précis entre les deux, faute de quoi la réponse paraît soit fade, soit peu crédible.",
      ],
    },
    {
      id: "projet-professionnel",
      theme: "Votre futur",
      question: "Quel est votre projet professionnel ?",
      intent: "Cette question classique vise à vérifier trois choses essentielles : que vous n'êtes pas là par hasard et que vos envies professionnelles correspondent à ce que propose l'école (lien Projet-École), que votre projet est cohérent avec votre personnalité (lien Projet-Soi), et que vous vous êtes réellement renseigné sur les métiers évoqués pour donner de la crédibilité à votre discours. Le jury ne juge pas tant le contenu de votre réponse, atypique ou classique, que la manière dont vous êtes arrivé à ce choix et la connaissance fine que vous en avez. Un candidat qui défend bien un projet classique (chef de produit, entrepreneur) est même parfois valorisé car le jury peut le comparer directement à d'autres profils similaires. Le fait de changer d'avis plus tard n'est jamais un problème : ce qui compte est de montrer qu'à l'instant présent, vous avez un projet réfléchi. Une réponse évasive ou reportant toute réflexion sur l'école suggère au contraire que le candidat est passif et n'a pas fait l'effort minimal de recherche attendu.",
      criteria: [
        "Structurez votre réponse en trois temps clairs : d'abord donner une définition rapide et exacte du métier visé pour prouver que vous savez de quoi vous parlez, ensuite établir le lien Projet-Soi, enfin établir le lien Projet-École.",
        "Montrez que vous vous êtes renseigné concrètement, par exemple en citant des discussions avec des professionnels ou la lecture de fiches métiers, plutôt qu'une simple intuition ou une impression issue d'un stage.",
        "Faites le lien entre les qualités requises par le métier et vos propres qualités, idéalement en tendant une perche au jury vers une expérience personnelle marquante (sportive, associative, professionnelle) qui l'illustre.",
        "Expliquez précisément en quoi l'école est nécessaire à votre projet : cursus spécifique, Master ciblé, certification complémentaire, année en entreprise, plutôt qu'une formule générale sur 'la formation de l'école'.",
        "N'hésitez pas à présenter deux métiers si vous hésitez réellement, à condition de justifier chacun selon les mêmes critères de cohérence avec vous-même et avec l'école.",
        "Ne cherchez pas à deviner si le jury préfère un projet atypique ou classique : privilégiez la sincérité et la solidité du raisonnement plutôt que l'originalité du métier choisi.",
        "Assumez que ce projet est celui de l'instant présent et qu'il pourra évoluer, sans que cela nuise à la réponse tant que le raisonnement actuel est cohérent et documenté.",
      ],
      pitfalls: [
        "Répondre que l'on compte sur l'école pour 'trouver sa voie' plutôt que présenter un projet déjà réfléchi : cela laisse penser au jury que le candidat est là par hasard.",
        "Confondre les contours d'un métier, par exemple assimiler marketing et vente : cette confusion trahit une méconnaissance grave du secteur visé et coûte très cher en crédibilité.",
        "S'appuyer uniquement sur un ressenti superficiel ('j'aime bien vendre') sans aucune démarche de renseignement (lecture, rencontres, discussions) pour étayer le choix.",
        "Ne pas relier le projet à sa propre personnalité ni à l'école de façon précise, ce qui prive la réponse des deux liens attendus par le jury (Projet-Soi et Projet-École).",
        "Insister sur le fait que l'on va 'sûrement changer d'avis', ce qui, loin de rassurer, peut donner l'impression d'un manque d'engagement réel dans la réflexion menée jusqu'ici.",
        "Se contenter d'annoncer un intitulé de métier sans jamais le définir ni expliquer pourquoi il correspond à ses propres qualités : cela ne prouve rien au jury sur le sérieux de la réflexion.",
      ],
    },
    {
      id: "projet-n-aboutit-pas",
      theme: "Votre futur",
      question: "Que faites-vous si votre projet n'aboutit pas ?",
      intent: "Cette question est posée en priorité aux candidats qui évoquent l'entrepreneuriat, mais elle peut concerner tout projet professionnel affirmé avec assurance. Le jury cherche à savoir si vous avez envisagé un plan B, et surtout à sentir comment vous réagissez face à l'éventualité d'un échec. Affirmer que l'échec est inenvisageable est perçu comme une forme d'aveuglement dangereux et comme une manière d'esquiver la question plutôt que d'y répondre. Il n'est en revanche pas nécessaire d'avoir un plan de secours parfaitement défini : ce qui compte est de montrer une démarche de rebond crédible et une capacité à faire preuve de recul sur soi-même. Une bonne réponse démontre de la maturité et de la connaissance de soi, notamment sur la manière de digérer un échec, tout en donnant malgré tout quelques pistes concrètes qui rassurent le jury sur votre capacité d'adaptation.",
      criteria: [
        "Ne dites jamais que l'échec est impossible ou inenvisageable : accueillez l'hypothèse sereinement, ce qui montre au jury une forme de lucidité plutôt que de la faiblesse.",
        "Décrivez d'abord votre manière personnelle de gérer un échec (prendre du recul, analyser ce qui n'a pas fonctionné, s'accorder du temps) avant même de parler de la suite professionnelle.",
        "Il n'est pas obligatoire d'avoir un métier de secours précis : vous pouvez assumer ne pas vous projeter dans un plan B détaillé, à condition de montrer une vraie démarche pour en trouver un le moment venu.",
        "Indiquez malgré tout une direction ou un domaine d'activité vers lequel vous vous tourneriez, par exemple en restant dans le même secteur mais sur un métier différent, pour donner une prise concrète au jury.",
        "Reliez ce domaine de repli à des qualités personnelles que vous maîtrisez réellement, car le jury peut rebondir dessus : ne mentionnez rien que vous ne seriez pas capable de développer si la question suit.",
        "Montrez de l'ouverture d'esprit et une capacité à rebondir plutôt qu'une fermeture sur un seul scénario possible, ce qui rassure sur votre flexibilité professionnelle future.",
        "Gardez un ton mesuré et réfléchi plutôt que défensif : la question n'a pas vocation à vous piéger sur le fond du projet, mais à observer votre rapport à l'échec.",
      ],
      pitfalls: [
        "Affirmer être 'quelqu'un qui n'envisage pas l'échec' et être 'certain' de la réussite du projet : cela revient à refuser de répondre à la question et pénalise lourdement le candidat.",
        "Déclarer ne pas avoir de plan B car on 'ne se voit pas faire autre chose' : cela montre une méconnaissance désinvolte des autres métiers auxquels l'école prépare pourtant.",
        "Accumuler les formulations maladroites qui trahissent un manque de recul, par exemple insister lourdement sur son refus d'être salarié sans nuance ni ouverture.",
        "Se fermer totalement à toute alternative professionnelle, ce qui inquiète le jury sur la capacité du candidat à s'adapter en cas de difficulté réelle en début de carrière.",
        "Répondre par une envolée de motivation ('je suis prêt à tout') plutôt que par une réflexion concrète sur la méthode de rebond envisagée après l'échec.",
      ],
    },
    {
      id: "ne-pas-changer-d-avis",
      theme: "Votre futur",
      question: "Comment pouvons-nous être certains que vous ne changerez pas d'avis ?",
      intent: "Cette question peut porter soit sur le choix des études en école de commerce, notamment pour les candidats déjà réorientés, soit sur le projet professionnel lui-même. Le cas du projet professionnel est le plus simple à traiter, puisque le candidat a le droit d'en changer tant qu'il respecte les règles de cohérence déjà exposées. Le cas de la réorientation d'études est en revanche plus délicat, car le jury demande explicitement des garanties sur la bonne intégration future du candidat et sur l'adéquation entre son projet et ce que propose réellement l'école. Le jury mise sur chaque candidat qu'il accepte, et le moindre doute exprimé sur l'engagement du candidat peut faire pencher la décision en sa défaveur. Une réponse efficace doit donc démontrer la cohérence et l'ancienneté du choix, tout en insistant sur les apports concrets et vérifiés de l'école de commerce, académiques comme professionnels.",
      criteria: [
        "Si la question porte sur votre projet professionnel, rappelez que vous avez le droit d'évoluer tant que votre choix actuel reste cohérent avec vous-même et avec l'école, sans minimiser pour autant votre engagement présent.",
        "Si la question porte sur une réorientation d'études, montrez que l'idée n'est pas récente en évoquant, si c'est vrai, une réflexion déjà amorcée plus tôt dans votre parcours (par exemple dès le lycée).",
        "Justifiez précisément les raisons de votre changement de voie par des exemples concrets vécus (contenu d'un cursus trop théorique, expérience de stage qui a révélé un autre attrait) plutôt que par des impressions générales.",
        "Insistez sur les apports réels et vérifiés de l'école de commerce, en évitant les généralités creuses, et en expliquant précisément pourquoi ils correspondent davantage à votre caractère que votre formation précédente.",
        "Ne laissez jamais entendre, même en une phrase, que vous pourriez de nouveau tout arrêter : le jury retiendra surtout ce risque perçu plutôt que vos arguments positifs.",
        "Évitez les arguments approximatifs ou les demi-vérités sur l'école (comme une 'grande liberté' dans le travail ou des 'voyages') qui peuvent être facilement retournés contre vous si le jury les connaît mieux que vous.",
        "Terminez en anticipant une objection possible du jury, du type 'pourquoi pas une autre formation similaire', en montrant que vous avez comparé les options et choisi l'école de commerce en connaissance de cause.",
      ],
      pitfalls: [
        "Dire que 'l'on ne peut jamais dire jamais' concernant une possible réorientation future : cette formule, même nuancée, laisse penser au jury que le candidat pourrait à nouveau tout arrêter.",
        "Justifier son choix par des arguments approximatifs et non vérifiés, comme une 'grande liberté dans le travail', alors que la réalité de l'école comprend souvent des deadlines contraignantes et un tronc commun imposé.",
        "Évoquer les séjours à l'étranger comme des 'voyages' plutôt que comme des échanges universitaires ou des stages en entreprise, ce qui peut être compris par le jury comme une confusion avec des vacances.",
        "Ne fournir aucun élément montrant l'ancienneté de la réflexion sur la réorientation, ce qui laisse penser à un choix précipité ou peu mûri.",
        "Rester dans le registre du ressenti général sans jamais illustrer par un exemple concret vécu (stage, cours, rencontre) les raisons du changement de voie.",
        "Oublier de rassurer explicitement sur l'adéquation entre le projet professionnel et l'offre de l'école, ce qui laisse la question sans véritable réponse aux yeux du jury.",
      ],
    },
    {
      id: "concilier-vie-pro-familiale",
      theme: "Votre futur",
      question: "Comment concilierez-vous vie professionnelle et familiale ?",
      intent: "Cette question, jugée par certains comme relativement hors sujet dans un entretien de motivation au point que plusieurs écoles l'interdisent à leurs jurys, peut malgré tout être posée, notamment aux candidates. Le jury n'attend pas de vous une méthode infaillible ni une certitude sur la question, car lui-même sait qu'il s'agit d'un sujet difficile pour lequel il n'a pas forcément de solution parfaite. Ce qu'il redoute avant tout, c'est un discours trop sûr de lui, qui pourrait sembler naïf ou même vexant si le jury lui-même vit cette difficulté au quotidien. L'essentiel est de montrer que vous avez conscience de la difficulté de l'équation et que vous avez une intention réelle, même modeste, de rechercher un équilibre entre les deux sphères de votre vie. Une réponse trop simpliste, qui laisse penser que la réussite dans ce domaine est facile ou universelle, dénote un manque de maturité sur un sujet pourtant sensible.",
      criteria: [
        "Prenez des précautions sémantiques dès le début de votre réponse et évitez tout ton trop définitif ou trop assuré sur votre future réussite à concilier les deux vies.",
        "N'hésitez pas à reconnaître honnêtement que vous n'y avez pas encore beaucoup réfléchi si c'est le cas, en expliquant que le sujet vous semble encore lointain : cette sincérité peut vous protéger plutôt que vous desservir.",
        "Appuyez-vous sur des observations concrètes de votre entourage ou de votre expérience pour illustrer une piste de réponse, par exemple l'importance de savoir 'couper' avec le travail lorsqu'on est en famille.",
        "Montrez que vous avez conscience que les deux vies, professionnelle et familiale, sont essentielles et doivent chacune laisser de la place à l'autre pour être pleinement épanouissantes.",
        "Évitez toute généralisation universelle du type 'tout le monde peut y arriver' : ce genre de formule peut vexer un jury pour qui la question reste une difficulté réelle et non résolue.",
        "Reconnaissez explicitement la difficulté de l'équation plutôt que de la présenter comme un simple problème d'organisation ou de volonté personnelle.",
        "Terminez sur une note d'engagement mesuré, montrant que vous ferez de votre mieux pour y répondre sans pour autant prétendre détenir la solution.",
      ],
      pitfalls: [
        "Affirmer que l'on pourra 'rapidement trouver l'équilibre' en travaillant beaucoup au début de carrière puis en levant le pied plus tard : cette vision est jugée naïve et trop simpliste par le jury.",
        "Conclure par une formule universelle comme 'quand il y a une volonté, il y a un chemin, tout le monde peut y arriver', qui risque de vexer un jury pour qui la conciliation des deux vies reste une difficulté persistante.",
        "Sembler trop sûr de soi ou trop convaincu de sa propre réussite future sur ce sujet, ce qui peut être perçu comme un manque de recul par des membres du jury confrontés eux-mêmes à cette difficulté.",
        "Ne fournir aucune illustration concrète ou vécue de sa réflexion, ce qui rend la réponse abstraite et peu crédible sur un sujet pourtant très personnel.",
        "Ignorer la possibilité d'avouer honnêtement son manque de réflexion sur le sujet, alors que cette sincérité, bien amenée, peut au contraire renforcer la crédibilité de la réponse.",
      ],
    },
  {
      id: "sujet-actualite-parler",
      theme: "Actualité",
      question: "De quel sujet d'actualité avez-vous envie de nous parler ?",
      intent:
        "Le jury se sert de cette question pour vérifier une soft skill essentielle en entreprise : la curiosité intellectuelle et le suivi du monde qui vous entoure. Il veut voir si vous êtes capable d'analyser un fait d'actualité, de prendre du recul et de forger un avis argumenté, à l'image d'un futur cadre appelé à échanger avec des clients ou des collègues sur des sujets non professionnels. Mais surtout, comme pour toute question d'entretien, il s'agit d'un prétexte pour en apprendre davantage sur vous : le choix du sujet compte autant que son traitement. Un sujet trop générique, impersonnel ou trop technique n'apporte rien au jury et vous expose à être moins pointu que lui sur le fond. À l'inverse, un sujet plus confidentiel relié à une passion, un voyage, un projet ou une pratique sportive vous permet de tendre une perche et de rebondir ensuite sur votre parcours. Le jury attend enfin que vous puissiez tenir plusieurs minutes de discussion sur ce thème, y compris sur des angles connexes.",
      criteria: [
        "Choisir un sujet récent, idéalement dans les trois derniers mois, et connaître la Une du jour avant l'entretien.",
        "Privilégier un sujet personnel plutôt que LE sujet d'actualité du moment, en le reliant à une passion, un voyage, un projet ou une pratique (exemple : un défilé Chanel à Cuba relié à un intérêt pour la mode).",
        "Maîtriser non seulement le fait en lui-même mais aussi les thèmes connexes, pour tenir la discussion si le jury creuse.",
        "Citer sa source d'information (un journal, un magazine, une émission) pour montrer un suivi régulier et crédible.",
        "Être capable de donner un avis personnel et argumenté sur le sujet choisi, pas seulement de le résumer.",
        "Anticiper que le jury peut enchaîner sur la passion ou le projet évoqué à travers le sujet d'actualité, pour préparer la suite de l'échange.",
        "Si un sujet très large est choisi (une campagne présidentielle par exemple), trouver un angle d'analyse précis plutôt que de tout balayer superficiellement.",
      ],
      pitfalls: [
        "Se dédouaner d'emblée en disant ne pas avoir suivi l'actualité, ce qui inquiète immédiatement le jury sur votre curiosité.",
        "Choisir un sujet trop complexe ou trop pointu sur lequel votre maîtrise sera inférieure à celle du jury, ce qui peut vous mettre en difficulté dès la première relance.",
        "Opter pour un sujet impersonnel qui n'apprend rien au jury sur vous et ne permet aucune perche vers votre parcours.",
        "Aborder un sujet sans intérêt pour l'entretien, comme une anecdote sportive isolée sans portée.",
        "Prendre un sujet clivant, religieux ou politique, qui peut mener à un échange tendu dont le candidat sort toujours perdant.",
        "Traiter un sujet trop vaste dans sa globalité sans angle précis, ce qui rend la réponse interminable et diluée.",
      ],
    },
    {
      id: "quavez-vous-a-dire-sur",
      theme: "Actualité",
      question: "Qu'avez-vous à dire sur… ?",
      intent:
        "Cette question est une variante de la précédente, mais cette fois c'est le jury qui impose le sujet plutôt que le candidat qui le choisit. Elle vise autant à vérifier que vous suivez l'actualité qu'à observer votre réaction face à une situation potentiellement inconfortable si le thème imposé vous est peu familier. Rassurez-vous : le jury choisit en général soit un sujet incontournable du moment, soit un sujet en lien indirect avec votre profil, vos voyages, vos passions ou vos sports, ce qui suppose d'anticiper ces liens en amont. Le jury observe alors votre honnêteté intellectuelle et votre capacité à gérer une situation où vous n'avez pas la main, ce qui est aussi une compétence professionnelle utile. Il attend une réaction posée plutôt qu'un bluff, et apprécie qu'un candidat sache proposer une alternative constructive plutôt que de rester silencieux.",
      criteria: [
        "Anticiper les sujets d'actualité connexes à son propre profil (un voyage aux États-Unis peut amener une question sur la présidence américaine, une pratique sportive sur l'économie du sport).",
        "Répondre avec précision et assurance si le sujet imposé est maîtrisé, en montrant qu'on connaît les faits.",
        "Être honnête et reconnaître calmement une connaissance nulle ou trop parcellaire si le sujet est réellement inconnu.",
        "Demander poliment au jury l'autorisation de développer un sujet connexe que l'on maîtrise mieux, plutôt que de l'imposer.",
        "Illustrer, si possible, sa réponse sur le sujet connexe accepté par un exemple concret et personnel pour tendre une perche malgré la contrainte initiale.",
      ],
      pitfalls: [
        "Tenter de bluffer ou d'improviser sur un sujet mal maîtrisé, ce qui se voit rapidement et fragilise la crédibilité du candidat.",
        "Proposer spontanément de changer de sujet sans l'accord du jury, ce qui peut être perçu comme un passage en force malvenu.",
        "Rester bloqué sans réaction ni proposition alternative face à un sujet inconnu, ce qui laisse une impression de passivité.",
        "Ne pas avoir anticipé les liens entre son propre profil et l'actualité, et se retrouver totalement démuni sur un thème pourtant prévisible.",
      ],
    },
    {
      id: "maire-ville-ecole",
      theme: "Région de l'école",
      question: "Quel est le maire de la ville de l'école ?",
      intent:
        "Cette question sert avant tout de prétexte pour vérifier que le candidat s'est renseigné sur son futur environnement de vie et sur le paysage politique local. Le jury veut s'assurer d'une curiosité minimale pour la ville et la région où l'école est implantée, au-delà du seul programme pédagogique. Dans certaines villes comme Marseille, Bordeaux, Nantes, Lille ou Montpellier, le maire actuel ou ancien est une figure politique nationale, et ne pas connaître son nom serait particulièrement mal perçu. Cette information doit logiquement figurer dans les fiches école préparées en amont, au même titre que d'autres données pratiques et politiques sur la ville.",
      criteria: [
        "Connaître le nom du maire actuel de la ville de l'école ainsi que sa couleur politique.",
        "Connaître la tendance politique dominante lors des dernières élections législatives ou régionales dans la zone.",
        "Repérer si le maire est une figure politique nationalement connue et savoir la situer dans son parti.",
        "Intégrer ces informations dans une fiche école préparée à l'avance, au même titre que les données économiques et culturelles.",
      ],
      pitfalls: [
        "Ne pas connaître le nom du maire, en particulier lorsqu'il s'agit d'une personnalité politique nationale, ce qui est perçu comme un manque flagrant de préparation.",
        "Ignorer la couleur politique du maire alors que la question invite implicitement à démontrer une culture politique locale.",
        "Ne pas avoir consulté de fiche école regroupant ces informations, alors qu'elles sont facilement trouvables en amont de l'entretien.",
      ],
    },
    {
      id: "tissu-economique-ville-region",
      theme: "Région de l'école",
      question: "Quel est le tissu économique de la ville / région ?",
      intent:
        "Cette question est le pendant économique de celle sur le maire de la ville : elle vérifie la curiosité du candidat pour l'environnement économique dans lequel il va évoluer pendant ses études. La plupart des régions françaises possèdent une spécialité économique reconnue, comme l'aérospatiale à Toulouse, la grande distribution dans le Nord ou les nouvelles technologies en Rhône-Alpes et à Sophia Antipolis. Le jury attend a minima que le candidat puisse citer cette spécialité et, idéalement, quelques entreprises locales représentatives, y compris des partenaires de l'école. Cette question est aussi l'occasion de faire le lien entre le tissu économique local et son propre projet professionnel, ce qui renforce la cohérence perçue du choix de l'école.",
      criteria: [
        "Identifier la ou les spécialités économiques majeures de la région (exemple : aérospatiale à Toulouse, technologies en Rhône-Alpes, grande distribution dans le Nord).",
        "Citer quelques entreprises implantées localement, en particulier celles qui sont partenaires de l'école.",
        "Faire le lien, si pertinent, entre son projet professionnel et le tissu économique local pour renforcer la cohérence de sa candidature.",
        "Préparer ces éléments en amont dans une fiche école dédiée à la ville et à la région.",
      ],
      pitfalls: [
        "Ne pas être capable de citer une seule spécialité économique ou entreprise locale, ce qui trahit un manque de préparation.",
        "Manquer de cohérence entre son projet professionnel affiché et le tissu économique local alors qu'un lien évident existait.",
        "Se limiter à des généralités vagues sur l'économie régionale sans exemple concret et vérifiable.",
      ],
    },
    {
      id: "bon-manager",
      theme: "Management",
      question: "Qu'est-ce qu'un bon manager selon vous ?",
      intent:
        "Même si le candidat n'a le plus souvent qu'une expérience très modeste de l'entreprise, le jury veut savoir s'il a déjà réfléchi à ce qu'est un manager et aux qualités qui en font un bon manager, puisqu'il se prépare précisément à le devenir. Il attend d'abord une définition claire du rôle : une personne responsable d'une mission et à la tête d'une équipe qu'elle anime, coordonne et motive avec les moyens dont elle dispose, avec une responsabilité à la fois humaine et financière, sans que ce soit nécessairement un chef d'entreprise. Le jury veut ensuite voir cette définition illustrée par des exemples concrets, tirés de l'entreprise (stages, jobs saisonniers) mais aussi d'expériences hors du monde professionnel, comme un entraîneur sportif ou un professeur de musique assimilables à des managers. Enfin, comme pour toute question, il attend que le candidat fasse le lien entre les qualités décrites et ses propres qualités, avec une modestie affichée sur son potentiel plutôt qu'une certitude prématurée d'être déjà un bon manager.",
      criteria: [
        "Définir clairement ce qu'est un manager : une personne responsable d'une mission et d'une équipe, avec une responsabilité humaine et financière, sans que ce soit forcément un chef d'entreprise.",
        "Illustrer chaque qualité citée par un exemple vécu, en entreprise (stage, job saisonnier) ou en dehors (sport, association, musique).",
        "Structurer la réponse autour de deux ou trois qualités clés plutôt que d'énumérer une liste vague de traits de caractère.",
        "S'appuyer, si utile, sur des figures connues de managers ou de patrons, en connaissant bien leur parcours et leur entreprise.",
        "Faire explicitement le lien entre les qualités décrites et ses propres qualités ou son potentiel personnel.",
        "Conserver une modestie affichée en parlant de potentiel à développer plutôt que d'acquis déjà maîtrisés.",
      ],
      pitfalls: [
        "Donner une réponse courte et générique, sans exemple concret pour l'illustrer.",
        "Ne faire aucun lien entre les qualités décrites et sa propre personnalité ou ses propres expériences.",
        "Remettre implicitement en cause la pertinence de la question, par exemple en insistant d'emblée sur son manque total d'expérience du management.",
        "Se présenter comme un manager déjà accompli, ce qui donne une image hautaine et peu crédible pour un jeune candidat.",
        "Se limiter à des figures de patrons connus sans connaître réellement leur parcours ou leur entreprise, ce qui fragilise l'argumentation si le jury creuse.",
      ],
    },
    {
      id: "modele",
      theme: "Management",
      question: "Avez-vous un modèle ?",
      intent:
        "Cette question est proche de celle sur le bon manager mais s'ouvre plus largement à toute personne admirée pour son caractère, son parcours ou ses engagements, sans se limiter au seul champ managérial. Le jury cherche avant tout à mieux connaître le candidat à travers les qualités qu'il valorise chez autrui et la manière dont il s'identifie à elles. Il est généralement plus simple et moins risqué de choisir une figure connue de tous plutôt qu'un proche inconnu du jury, car l'échange s'installe plus facilement à partir d'une personnalité publique ; un proche reste toutefois acceptable si le sujet a été suffisamment travaillé. L'essentiel est de mettre en avant les qualités, l'engagement ou les convictions du modèle plutôt que la seule liste de ses réalisations, puis de faire le lien avec ses propres aspirations, passions ou projet. Si le modèle choisi est très courant, comme Steve Jobs ou Elon Musk, il faut apporter un angle ou des arguments qui distinguent la réponse de celles des autres candidats.",
      criteria: [
        "Choisir de préférence une figure connue de tous, pour faciliter l'échange avec le jury, ou un proche si le sujet a été suffisamment préparé.",
        "Mettre en avant les qualités, l'engagement ou les convictions du modèle plutôt que la seule énumération de ses réalisations.",
        "Illustrer ces qualités par des moments précis du parcours du modèle, pour montrer une connaissance réelle du personnage.",
        "Expliquer explicitement en quoi le candidat s'identifie à ces qualités ou aspire à les développer.",
        "Relier le modèle choisi à ses propres passions, engagements ou projet professionnel pour tendre une perche au jury.",
        "Apporter un angle original si le modèle choisi est très fréquemment cité en entretien, pour se distinguer des autres candidats.",
      ],
      pitfalls: [
        "Se contenter de décrire les réalisations du modèle sans analyser les qualités humaines qui les ont rendues possibles.",
        "Ne faire aucun lien entre le modèle choisi et ses propres aspirations ou son propre parcours.",
        "Choisir un modèle sans connaître suffisamment son parcours ou sa personnalité, ce qui fragilise la réponse si le jury pose des questions de précision.",
        "Donner une réponse générique et superficielle sur un modèle très connu, sans angle personnel qui la distingue.",
        "Choisir un proche inconnu du jury sans avoir suffisamment préparé le sujet, ce qui rend l'échange plus difficile à installer.",
      ],
    },
  {
      id: "faites-nous-rire",
      theme: "Questions déstabilisantes",
      question: "Faites-nous rire !",
      intent:
        "Le jury pose cette question uniquement pour observer votre réaction face à une demande inattendue, jamais pour évaluer un véritable talent d'humoriste. Il sait que le stress de l'entretien empêche presque toujours de raconter une blague de façon convaincante, donc il attend surtout de voir si vous savez gérer une situation inconfortable avec calme. Une mauvaise réponse, comme une blague ratée ou un refus de jouer le jeu, laisse penser que vous perdez vos moyens dès qu'on sort du cadre préparé. À l'inverse, une réponse maligne qui détourne la question vers une anecdote personnelle démontre de la répartie et une bonne connaissance de soi. Le jury en déduit aussi si vous savez transformer un piège apparent en occasion de valoriser une qualité. C'est une question qui juge l'attitude bien plus que le contenu de la réponse elle-même.",
      criteria: [
        "Annoncer d'emblée que le stress de l'entretien ne permet pas de raconter une blague avec le naturel nécessaire, ce qui désamorce la pression sans décevoir le jury.",
        "Proposer à la place une anecdote personnelle vécue, comme l'exemple du candidat en jean-baskets devant 150 personnes en costume, qui a fait sourire l'assistance à l'époque.",
        "Choisir une anecdote qui permet de rebondir sur une qualité développée, un défaut corrigé ou un projet mené, jamais une situation qui vous tourne simplement en ridicule.",
        "Terminer en tendant une perche vers l'école, par exemple en reliant la qualité illustrée (gestion du stress) à une activité future comme un engagement associatif.",
        "Viser à faire sourire plutôt qu'à faire rire franchement, l'objectif n'étant pas la performance comique mais la mise en valeur de soi.",
        "Avoir réfléchi à l'avance à ce type de question, car l'improvisation totale sur ce terrain est risquée.",
      ],
      pitfalls: [
        "Raconter une véritable blague, qui risque fortement de faire un bide compte tenu du stress et du contexte peu propice à l'humour.",
        "Refuser purement et simplement de répondre à la question, ce qui donne une image rigide et peu adaptable.",
        "Choisir une anecdote ridicule ou de mauvais goût, qui nuit à l'image sérieuse que vous avez construite pendant l'entretien.",
        "Oublier de relier l'anecdote à une qualité ou à un projet, ce qui fait perdre toute la valeur ajoutée de la réponse.",
        "Se limiter à l'anecdote sans lien avec le futur, alors qu'un lien avec la vie en école renforce nettement l'impact de la réponse.",
      ],
    },
    {
      id: "surprenez-nous",
      theme: "Questions déstabilisantes",
      question: "Surprenez-nous !",
      intent:
        "Cette question classique vise à emmener le candidat sur un terrain inconfortable pour vérifier s'il existe une facette de sa personnalité qui tranche avec l'image donnée depuis le début de l'entretien. Le jury la pose souvent lorsqu'il vous trouve trop lisse, trop récité, ou mono-sujet, pour tester votre capacité à sortir du cadre préparé. Elle peut aussi être posée quand vous n'avez évoqué qu'une seule facette de votre personnalité, par exemple uniquement des expériences collectives ou uniquement un profil sérieux, afin de vérifier s'il existe un contrepoids. Une réponse plate ou déjà évoquée signale au jury que vous manquez de profondeur ou de spontanéité. À l'inverse, une anecdote qui apporte réellement un élément nouveau prouve que vous avez plus à offrir que ce qui a été dit jusque-là. Le livre rappelle d'ailleurs que, pour cette question plus que pour toute autre, on a les questions que l'on mérite.",
      criteria: [
        "Choisir une anecdote qui contredit ou nuance l'image donnée jusqu'ici, par exemple révéler une pratique inattendue si vous êtes apparu trop sérieux ou trop discret.",
        "S'appuyer sur du vécu réel et non sur une construction artificielle, comme l'exemple du candidat réservé qui anime un cours de fitness en plein air pour des inconnus.",
        "Utiliser cette question pour rééquilibrer la perception du jury si vous n'avez parlé que d'un seul sujet ou d'une seule facette de vous durant l'entretien.",
        "Terminer si possible sur une projection vers l'avenir en école, pour transformer la surprise en perche vers la vie associative ou académique.",
        "Garder à l'esprit que le jury cherche avant tout à mieux vous connaître, donc traiter la question comme une opportunité et non comme une agression.",
      ],
      pitfalls: [
        "Raconter une situation qui vous tourne en ridicule sans rien en retirer de positif pour votre image.",
        "Présenter une expérience banale déjà évoquée précédemment, qui ne surprend en réalité personne.",
        "Se réfugier dans une simple blague, ce qui ne répond pas à l'attente réelle du jury.",
        "Rester sur les mêmes registres que le reste de l'entretien, ce qui prouve exactement le défaut que la question cherchait à sonder.",
        "Ne pas prendre le risque de se dévoiler, ce qui laisse une impression de candidat trop formaté ou trop réservé.",
      ],
    },
    {
      id: "qu-est-ce-qui-vous-emeut",
      theme: "Questions déstabilisantes",
      question: "Qu'est-ce qui vous émeut ?",
      intent:
        "Cette question déstabilise surtout parce qu'elle est rarement préparée par les candidats, alors qu'elle vise simplement à savoir ce qui vous touche personnellement, que ce soit un événement, une situation, un souvenir ou un lieu. Le jury cherche une réponse sincère qui révèle votre sensibilité, sans pour autant vous pousser vers l'intime au point de vous faire perdre vos moyens. Une réponse centrée sur un échec scolaire, par exemple un concours blanc raté, laisse penser que vous gérez mal l'échec et que vous êtes hors sujet, puisque la question porte sur quelque chose de plus général que le cadre scolaire. Une bonne réponse, ancrée dans la vie personnelle plutôt que professionnelle, permet au contraire de montrer une émotion authentique et récurrente. Le jury en déduit votre capacité à parler de vous avec justesse et sans se dévaloriser.",
      criteria: [
        "Évoquer un événement, une situation, un souvenir ou un lieu personnel qui suscite une émotion réelle et récurrente.",
        "Privilégier la vie personnelle plutôt que les expériences scolaires ou professionnelles, plus pertinentes pour cette question précise.",
        "S'appuyer sur un exemple concret et vécu plusieurs fois, comme le dernier cours donné à des élèves particuliers et les nouvelles reçues ensuite.",
        "Éviter le trop intime ou le trop sensible, qui risquerait de vous faire perdre vos moyens devant le jury.",
        "Profiter de l'anecdote pour tendre une perche vers une expérience ou une qualité personnelle déjà valorisée dans l'entretien.",
      ],
      pitfalls: [
        "Choisir un sujet trop intime ou trop sensible, au risque de perdre ses moyens en pleine réponse.",
        "Mettre en avant un échec scolaire ou une mauvaise gestion d'une déception, ce qui révèle un défaut plutôt qu'une émotion positive.",
        "Rester dans le cadre scolaire ou professionnel, ce qui est jugé légèrement hors sujet par rapport à l'esprit de la question.",
        "Raconter une anecdote isolée sans montrer une émotion générale ou récurrente, ce qui affaiblit la sincérité perçue.",
      ],
    },
    {
      id: "pensez-vous-avoir-reussi-l-entretien",
      theme: "Questions déstabilisantes",
      question: "Pensez-vous avoir réussi l'entretien ?",
      intent:
        "Cette question est une occasion pour le jury de voir si vous êtes capable d'auto-évaluation lucide, ni dans l'autosatisfaction excessive ni dans l'auto-flagellation. Elle permet aussi d'insister sur des points déjà bien traités ou de corriger discrètement ce qui a été mal exprimé plus tôt. Si vous répondez par l'affirmative sans justifier votre sentiment, le jury juge la réponse fragile, surtout si vous êtes visiblement seul à le penser dans la salle. Si vous répondez par la négative, il attend des raisons précises du mécontentement, ce qui peut d'ailleurs vous donner l'occasion de vous rattraper immédiatement. Une conclusion maladroite, comme évoquer l'envie de fêter sa réussite, donne une image d'insouciance déplacée. Le jury cherche donc autant votre capacité de recul que votre capacité à reprendre la main sur la fin de l'entretien.",
      criteria: [
        "Si la réponse est positive, justifier précisément ce sentiment, par exemple en citant les expériences ou motivations que vous avez pu développer complètement.",
        "Nuancer systématiquement une réponse positive, par exemple en évoquant un léger regret sur un sujet non abordé, pour éviter toute autosatisfaction excessive.",
        "Si la réponse est négative, détailler les raisons du mécontentement, ce qui donne au jury l'occasion de vous laisser vous rattraper.",
        "Utiliser la fin de la réponse pour orienter subtilement le jury vers un sujet que vous souhaitez développer, comme le projet professionnel.",
        "Rester mesuré et sûr de soi sans excès, en gardant à l'esprit que vous n'êtes peut-être pas seul dans la salle à juger de la qualité de l'entretien.",
      ],
      pitfalls: [
        "Affirmer une réussite sans justification concrète, ce qui fragilise immédiatement la crédibilité de la réponse.",
        "Donner une impression d'autosatisfaction excessive, en particulier si le jury n'a pas le même ressenti que vous.",
        "Se dévaloriser sans nuance en cas de réponse négative, sans saisir l'occasion de se rattraper sur un point précis.",
        "Terminer sur une note maladroite, comme évoquer l'envie de faire la fête, qui donne une image d'insouciance déplacée juste avant le verdict du jury.",
        "Ne pas exploiter la question pour orienter la suite de l'entretien vers un sujet que vous maîtrisez mieux.",
      ],
    },
    {
      id: "que-feriez-vous-si-vous-etiez-refuse-dans-notre-ecole",
      theme: "Questions déstabilisantes",
      question: "Que feriez-vous si vous étiez refusé dans notre école ?",
      intent:
        "Le jury amène ici le candidat à envisager l'échec dans son école précise, pour vérifier sa maturité et la solidité de son projet professionnel au-delà d'un seul établissement. Il sait que la plupart des candidats passent plusieurs écoles, donc une ambition réaliste consiste à intégrer une école de commerce plutôt qu'un établissement unique. Répondre que l'on retentera le concours l'année suivante paraît souvent peu sincère et peut instaurer un doute sur la solidité du projet, notamment si celui-ci dépend d'un partenariat ou d'un échange trop spécifique à cette école. À l'inverse, reconnaître que l'on intégrerait une autre école est perçu comme une preuve de maturité et non comme un désintérêt. Le jury évalue aussi, à travers cette question, la capacité du candidat à gérer un échec sans se laisser abattre.",
      criteria: [
        "Répondre avec sincérité que vous intégreriez une autre école de commerce, votre projet visant avant tout ce type de cursus plutôt qu'un seul établissement.",
        "Expliquer que vous chercherez à matérialiser votre projet professionnel ailleurs, sans entrer dans les détails d'une école précise.",
        "Profiter de la question pour donner une information sur votre gestion de l'échec, par exemple votre capacité à ne pas ressasser une déception.",
        "Terminer en réaffirmant, sans excès, vos motivations réelles pour l'école qui vous interroge, sans que ce module prenne le pas sur le reste de la réponse.",
        "Construire la réponse en trois temps : réponse claire à la question, gestion de l'échec, puis rappel bref des motivations pour l'école.",
      ],
      pitfalls: [
        "Annoncer que vous retenterez le concours l'année suivante, ce qui paraît souvent peu sincère et peu nécessaire pour prouver sa motivation.",
        "Fonder son attachement à l'école sur un élément trop spécifique, comme un échange ou un stage précis, qui fragilise le propos si cet élément venait à manquer.",
        "Refuser d'envisager l'échec ou affirmer ne pas pouvoir s'épanouir ailleurs, ce qui trahit une forme d'immaturité aux yeux du jury.",
        "Laisser la partie sur les motivations pour l'école prendre le pas sur le reste de la réponse, alors qu'elle ne doit rester qu'un complément bref.",
      ],
    },
    {
      id: "entre-notre-ecole-et-une-autre-que-choisissez-vous",
      theme: "Questions déstabilisantes",
      question: "Entre notre école et une autre, que choisissez-vous ?",
      intent:
        "Le jury pose souvent cette question en comparant son école à un établissement plus coté, pour tester la sincérité et la lucidité du candidat sur son choix d'orientation. Il sait que pour la grande majorité des candidats, le choix n'est pas encore arrêté à ce stade, puisque le tour de France des oraux réserve souvent des surprises et fait changer d'avis sur l'école numéro un. S'engager de manière définitive sur une préférence peut se retourner contre le candidat si ce choix change quelques jours plus tard, surtout s'il n'est encore accepté nulle part. À l'inverse, une réponse sincère qui reconnaît une réflexion encore en cours, tout en valorisant les atouts concrets de l'école qui interroge, est perçue comme mature. Le jury cherche donc à mesurer votre honnêteté plus qu'un engagement ferme.",
      criteria: [
        "Faire preuve de sincérité en reconnaissant que le choix n'est pas encore définitivement arrêté, si c'est effectivement le cas.",
        "Justifier la place de l'école dans votre hiérarchie actuelle par des opportunités concrètes déjà évoquées pendant l'entretien.",
        "Expliquer que vous étudierez la question de près après les oraux, une fois toutes les informations récoltées.",
        "Mettre en avant votre démarche active de renseignement, par exemple auprès des admisseurs et des professeurs rencontrés sur place.",
        "Si vous préférez sincèrement cette école, le dire en justifiant ce choix par des opportunités concrètes, sur le modèle d'une réponse condensée à la question sur les motivations pour l'école.",
      ],
      pitfalls: [
        "Affirmer un choix définitif qui pourrait être contredit quelques jours plus tard, ce qui nuit à la sincérité perçue de la réponse.",
        "Minimiser l'intérêt réel pour l'école qui vous interroge, surtout si vous n'êtes accepté nulle part ailleurs pour l'instant.",
        "Ne pas savoir justifier concrètement les atouts de l'école si vous affirmez la placer favorablement.",
        "Répondre de manière évasive sans démontrer une véritable démarche de réflexion et de renseignement structurée.",
      ],
    },
    {
      id: "vendez-moi-ce-stylo",
      theme: "Questions déstabilisantes",
      question: "Vendez-moi ce stylo.",
      intent:
        "Il s'agit de la plus classique des mises en situation, souvent posée aux candidats visant un métier de la vente ou à ceux qui affichent une aisance jugée trop grande dans l'entretien. Le jury veut mesurer la capacité à gérer une situation inconfortable ainsi que la capacité d'adaptation du candidat face à un exercice concret. Trois comportements sont particulièrement pénalisés : refuser d'obtempérer, mentir en survalorisant l'objet, ou se focaliser uniquement sur la description du produit sans écouter l'interlocuteur. Une vente réussie commence toujours par des questions sur les besoins réels de l'acheteur, comme le budget ou la fréquence d'utilisation, avant d'adapter le discours en conséquence. Le jury en déduit, à travers cet exercice, votre sens de l'écoute et votre capacité stratégique, deux qualités attendues chez un futur manager ou commercial.",
      criteria: [
        "Commencer par interroger l'interlocuteur sur ses attentes réelles, comme son budget, sa fréquence d'utilisation ou ses couleurs privilégiées.",
        "Adapter ensuite le discours de vente aux réponses obtenues, en valorisant uniquement les caractéristiques du stylo qui répondent réellement à ces besoins.",
        "Rester honnête sur les caractéristiques de l'objet, sans jamais inventer une origine prestigieuse ou une qualité inexistante.",
        "Éviter de se focaliser uniquement sur une description unilatérale du produit, l'écoute étant la qualité commerciale la plus valorisée par cet exercice.",
        "Laisser la parole finale à l'interlocuteur en lui demandant s'il a d'autres questions, ce qui installe une posture professionnelle et confortable.",
      ],
      pitfalls: [
        "Refuser d'obtempérer à la mise en situation, ce que le jury sanctionne fortement.",
        "Mentir sur les caractéristiques de l'objet, par exemple en inventant une origine prestigieuse qui se heurte ensuite au budget annoncé par l'acheteur.",
        "Se focaliser uniquement sur la description du produit sans jamais interroger les besoins de l'interlocuteur.",
        "Contredire son propre discours, par exemple en vantant un stylo prestigieux puis en bradant son prix dès que le budget est évoqué.",
        "Manquer de professionnalisme dans l'approche, ce qui trahit une méconnaissance des bases de la démarche commerciale.",
      ],
    },
    {
      id: "vous-venez-de-gagner-1-million-d-euros-qu-en-faites-vous",
      theme: "Questions déstabilisantes",
      question: "Vous venez de gagner 1 million d'euros. Qu'en faites-vous ?",
      intent:
        "Cette question déstabilise souvent les candidats alors que la clé de réussite tient simplement à l'honnêteté, qui permet au jury d'en apprendre davantage sur ses valeurs et sa personnalité. Le jury attend un moment où le candidat se permet de rêver, en détaillant des projets variés et crédibles plutôt qu'une gestion trop calculée ou trop vertueuse de la somme. Une réponse qui consacre tout l'argent à des dépenses futiles donne une mauvaise image, mais une réponse trop frileuse ou trop altruiste, comme tout placer en banque ou tout donner à une association, paraît peu sincère et suscite le doute. Miser l'intégralité sur un seul type de placement risqué, comme la bourse, interroge aussi la capacité à gérer de l'argent avec discernement. Le montant exact importe peu : ce que le jury évalue, c'est la diversité et la sincérité des projets évoqués, révélatrice de la personnalité du candidat.",
      criteria: [
        "Détailler plusieurs types de projets : un plaisir personnel raisonnable, un investissement réfléchi, et un geste tourné vers les autres ou la famille.",
        "Faire preuve d'honnêteté et de spontanéité, en assumant de vouloir aussi se faire plaisir avec une partie de la somme.",
        "Éviter de détailler la somme euro par euro, le montant exact étant secondaire par rapport à la diversité et à la sincérité des projets.",
        "Profiter de la question pour révéler des goûts personnels ou des engagements, comme une activité associative, qui tendent une perche au jury.",
        "Adopter un ton léger et enthousiaste, qui permet au jury de rêver avec vous plutôt que de simplement lister des dépenses.",
      ],
      pitfalls: [
        "Consacrer l'intégralité de la somme à des dépenses jugées futiles, comme des vêtements ou des voitures, ce qui donne une mauvaise image.",
        "Adopter une gestion trop frileuse, comme tout placer en banque, ou trop vertueuse, comme tout donner à une association, ce qui paraît peu sincère.",
        "Concentrer l'intégralité de la somme sur un seul type de placement risqué, comme la bourse, ce qui interroge la capacité de gestion financière.",
        "Livrer une réponse trop comptable, détaillant chaque euro dépensé, ce qui casse l'effet de rêve attendu par le jury.",
        "Manquer de spontanéité au point de ne rien révéler d'intéressant sur ses goûts ou ses valeurs personnelles.",
      ],
    },
    {
      id: "question-ou-ajouter",
      theme: "Conclusion",
      question: "Avez-vous une question à nous poser ou quelque chose à ajouter ?",
      intent:
        "Il s'agit de la question la plus classique posée en fin d'entretien, et elle constitue une dernière opportunité réelle de briller ou de corriger le tir. Le jury veut voir si le candidat sait saisir cette dernière chance avec enthousiasme plutôt que de la traiter comme une simple formalité de politesse. Quand les deux options sont proposées, le choix doit se porter sur celle qui sert le mieux le candidat à ce moment précis de l'entretien. Ajouter quelque chose est pertinent si un sujet essentiel du parcours a été oublié ou si une question clé a été mal traitée, car le jury laisse alors la possibilité de se reprendre. Poser une question, en revanche, doit refléter un intérêt sincère et non une question posée par pure convenance ou pour se donner bonne conscience. Répondre simplement « non » est la pire option possible, car c'est la dernière impression laissée juste avant que le jury ne se demande s'il vous imagine dans l'école.",
      criteria: [
        "Choisir, quand les deux options sont offertes, celle qui vous est réellement la plus utile à ce stade de l'entretien.",
        "Si vous ajoutez quelque chose, évoquer un sujet essentiel oublié comme un sport, un voyage marquant ou un projet qui vous tient à cœur, en demandant simplement la permission d'y revenir.",
        "Si une question clé a été mal traitée, comme « pourquoi notre école » ou « pourquoi vous », expliquer que vous êtes insatisfait de votre réponse et proposer de la compléter.",
        "Si vous posez une question, choisir un sujet dont la réponse vous intéresse sincèrement, par exemple sur le réseau des anciens ou les entreprises partenaires si un membre du jury est diplômé de l'école.",
        "Adresser une question très précise à une seule personne du jury en demandant d'abord la permission aux autres, sans jamais sous-estimer l'ego d'un jury.",
        "Poser une question générale, comme celle sur les qualités d'un bon manager, à l'ensemble des membres du jury lorsqu'ils peuvent tous y répondre.",
        "Ne jamais répondre « non » à cette question, quitte à toujours garder une question de secours en réserve.",
      ],
      pitfalls: [
        "Poser une question par simple formalité, qui laisse penser que vous vous fichez réellement de la réponse.",
        "Utiliser cette opportunité pour placer un « pourquoi moi » maladroit et incomplet en une minute, sans réel apport nouveau.",
        "Adresser une question trop précise à un seul membre du jury sans avoir demandé la permission aux autres au préalable.",
        "Poser une question dont vous êtes censé connaître la réponse, ce qui trahit un manque de préparation.",
        "Répondre « non », ce qui laisse une dernière impression négative juste avant la délibération du jury.",
      ],
    },
    {
      id: "mot-de-la-fin",
      theme: "Conclusion",
      question: "Vous avez le mot de la fin.",
      intent:
        "Le jury attend ici un mot unique, et non une phrase ou une question, ce qui suppose d'abord de vérifier que la consigne n'est pas une simple tournure de langage. Il cherche un mot qui résume fidèlement votre état d'esprit actuel ou votre personnalité, révélateur de votre capacité de synthèse en fin d'entretien. Un mot trop générique, entendu dans de nombreux entretiens, comme « détermination », « ambition » ou « réussite », n'apporte rien et peut même se retourner contre vous s'il ne correspond pas à l'attitude observée pendant l'entretien. Le jury évalue aussi la cohérence entre le mot choisi et le message porté depuis le début de l'entretien : dire « enthousiaste » après avoir paru clairement paralysé par le stress serait incohérent. Enfin, la manière de le dire, notamment avec le sourire, compte presque autant que le mot lui-même.",
      criteria: [
        "Vérifier d'abord que le jury attend bien un seul mot et non une phrase déguisée en question.",
        "Choisir un mot qui qualifie sincèrement votre état d'esprit à ce moment précis ou qui résume votre personnalité.",
        "Veiller à la cohérence entre le mot choisi et l'attitude adoptée pendant tout l'entretien.",
        "Éviter les mots trop souvent entendus comme le nom de l'école, « détermination », « ambition » ou « réussite ».",
        "Prononcer ce mot avec le sourire, l'attitude comptant autant que le choix du mot lui-même.",
      ],
      pitfalls: [
        "Répondre par une phrase ou plusieurs mots alors que la consigne demande un mot unique.",
        "Choisir un mot trop générique et entendu dans de nombreux entretiens, comme « ambition » ou « réussite », qui n'apporte rien de personnel.",
        "Choisir un mot incohérent avec l'attitude réellement observée pendant l'entretien, par exemple « enthousiaste » après une prestation marquée par le stress.",
        "Prononcer le mot sans sourire ni conviction, ce qui affaiblit l'impact de cette conclusion.",
      ],
    },
    {
      id: "quelle-question-auriez-vous-aime",
      theme: "Conclusion",
      question: "Quelle question auriez-vous aimé qu'on vous pose ?",
      intent:
        "Cette question offre une dernière et belle opportunité de parler de ce dont le candidat a réellement envie, en apportant un élément nouveau sur lui-même. Le jury attend que le candidat prenne quelques secondes de réflexion pour identifier un aspect de son parcours, de ses expériences ou de ses projets qui n'a pas encore été évoqué. Répondre que toutes les questions souhaitées ont déjà été posées est perçu comme un aveu de précipitation, révélant surtout l'envie d'en finir plutôt qu'une réflexion sincère. Il n'existe pas de bonne réponse unique, mais toute réponse doit démontrer que le candidat a encore quelque chose à apporter. Si le jury saisit effectivement la perche et pose la question suggérée, l'idéal est de conclure sur un lien avec l'avenir en école, pour terminer l'entretien sur une note tournée vers le futur.",
      criteria: [
        "Prendre quelques secondes pour réfléchir sincèrement à un aspect du parcours, des expériences ou des projets qui n'a pas encore été abordé.",
        "Apporter un élément réellement nouveau sur soi, plutôt qu'une reformulation de ce qui a déjà été dit pendant l'entretien.",
        "Illustrer la question suggérée avec un exemple concret, comme une pratique personnelle marquante développée sur plusieurs années.",
        "Si le jury pose ensuite la question suggérée, saisir l'occasion de terminer sur un lien avec l'avenir, le projet ou la vie en école.",
        "Éviter toute précipitation en montrant que l'on prend cette dernière question au sérieux plutôt que comme une simple formalité de fin d'entretien.",
      ],
      pitfalls: [
        "Répondre que toutes les questions souhaitées ont déjà été posées, ce qui trahit une précipitation à vouloir terminer l'entretien.",
        "Ne pas avoir d'élément supplémentaire réel à apporter, ce qui suggère une préparation incomplète ou un manque de profondeur du parcours.",
        "Répéter un point déjà largement développé plus tôt dans l'entretien au lieu d'apporter une information réellement nouvelle.",
        "Ne pas relier la réponse à l'avenir en école si l'occasion se présente, ce qui prive l'entretien d'une conclusion tournée vers le futur.",
      ],
    },
  {
    id: "clermont-people-01",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Votre génération est-elle plus difficile à manager ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-02",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Le télétravail à 100 % est-il une chance ou un piège pour le lien social en entreprise ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-03",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Comment une entreprise peut-elle concrètement agir en faveur de l'égalité hommes-femmes au-delà des discours ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-04",
    theme: "Clermont SB",
    subTheme: "People",
    question: "L'intelligence artificielle va-t-elle détruire le management humain ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-05",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Le quiet quitting est-il un signal d'alarme pour les entreprises ou une réponse saine à la charge de travail ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-06",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Faut-il imposer des quotas pour accélérer la diversité dans les comités de direction ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-07",
    theme: "Clermont SB",
    subTheme: "People",
    question: "La semaine de 4 jours est-elle une vraie solution ou un effet de mode managérial ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-08",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Peut-on encore parler de loyauté envers une entreprise chez les jeunes diplômés ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-09",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Le bien-être au travail doit-il être la responsabilité de l'entreprise ou celle de l'individu ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-10",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Le management à distance rend-il les équipes plus autonomes ou plus isolées ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-11",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Faut-il un vrai droit à la déconnexion, même si cela pèse sur la compétitivité des entreprises ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-people-12",
    theme: "Clermont SB",
    subTheme: "People",
    question: "Les soft skills comptent-elles plus que les diplômes pour manager une équipe aujourd'hui ?",
    intent:
      "Question Impact de Clermont School of Business, axe People : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'humain et au management, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-01",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Train, avion ou vélo électrique : quelle est votre mobilité ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-02",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Peut-on concilier sobriété énergétique et croissance économique ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-03",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Que pensez-vous du « greenwashing » (éco-blanchiment) pratiqué par certaines grandes marques ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-04",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Faut-il interdire ou taxer massivement la fast-fashion ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-05",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "La voiture électrique est-elle vraiment écologique si l'on compte toute sa chaîne de production ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-06",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Faut-il rationner certains produits pour respecter les limites planétaires ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-07",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "La sobriété est-elle compatible avec le modèle de croissance des entreprises ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-08",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Le nucléaire est-il un mal nécessaire pour réussir la transition énergétique ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-09",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Les entreprises doivent-elles être notées et sanctionnées sur leur impact carbone comme sur leurs résultats financiers ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-10",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Le tourisme de masse est-il compatible avec la lutte contre le réchauffement climatique ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-11",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "Faut-il interdire la publicité pour les produits les plus polluants ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-planet-12",
    theme: "Clermont SB",
    subTheme: "Planet",
    question: "La transition écologique doit-elle être imposée par la loi ou portée par les choix des consommateurs ?",
    intent:
      "Question Impact de Clermont School of Business, axe Planet : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'environnement et à la transition écologique, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-01",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Bill Gates : plutôt génie, mécène ou businessman ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-02",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Une entreprise peut-elle être rentable tout en étant 100 % éco-responsable ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-03",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Que vous inspire le modèle des entreprises à mission ou certifiées B-Corp ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-04",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Le boycott d'une marque par les consommateurs est-il une arme économique efficace ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-05",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Une entreprise doit-elle privilégier ses actionnaires ou l'ensemble de ses parties prenantes ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-06",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "La finance verte est-elle un vrai levier de transformation ou un outil de communication ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-07",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Faut-il plafonner les écarts de salaires au sein d'une même entreprise ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-08",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Les cryptomonnaies ont-elles un avenir dans l'économie réelle ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-09",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Le low-cost est-il un modèle économique condamné à disparaître ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-10",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Une entreprise peut-elle être à la fois low-cost et socialement responsable ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-11",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Faut-il davantage taxer les superprofits des grandes entreprises en période de crise ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
  {
    id: "clermont-profit-12",
    theme: "Clermont SB",
    subTheme: "Profit",
    question: "Le mécénat d'entreprise est-il un acte désintéressé ou une stratégie d'image ?",
    intent:
      "Question Impact de Clermont School of Business, axe Profit : teste votre capacité à prendre position immédiatement sur un sujet de société lié à l'économie et à la finance responsable, sans préparation, et à la tenir si le jury vous oppose l'inverse.",
    criteria: [
      "Prenez position dès les premières secondes : oui, non, ou une nuance assumée — jamais un pour/contre qui ne tranche pas.",
      "Illustrez immédiatement avec un exemple concret et récent plutôt qu'une explication abstraite.",
      "Acceptez qu'il n'y ait pas de bonne réponse : une hésitation honnête et argumentée vaut mieux qu'une posture d'expert plaquée — c'est la consigne officielle de l'école.",
      "Si le jury prend le contre-pied de votre position, tenez-la avec un argument supplémentaire ou nuancez-la avec courtoisie plutôt que de vous rétracter au premier mot.",
      "Si un lien naturel existe avec vous-même, votre projet professionnel ou l'école, vous pouvez le tendre en fin de réponse — sans jamais forcer ce rapprochement.",
    ],
    pitfalls: [
      "Un long silence de réflexion avant de répondre : mieux vaut une réponse imparfaite tout de suite qu'un blanc.",
      "Une réponse uniquement théorique ou générale, sans aucun exemple concret.",
      "Se rétracter immédiatement dès que le jury propose l'inverse de votre position, sans tenter d'argumenter.",
      "Réciter une opinion toute faite entendue ailleurs, sans être capable de la défendre si on la questionne.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Banques d'entraînement par école (formats spéciaux du module 8)     */
/*                                                                     */
/* Chaque banque reprend 50 % des éléments tirés à l'oral (un sur     */
/* deux, dans l'ordre source, ce qui inclut une partie des éléments   */
/* inventés), plus quelques mots inédits pour l'EDHEC. La banque      */
/* Clermont SB ci-dessus reprend, elle, l'intégralité des Questions   */
/* Impact.                                                            */
/* ------------------------------------------------------------------ */

/** Mots inédits ajoutés uniquement à la banque d'entraînement EDHEC. */
const EDHEC_TRAINING_EXTRA_WORDS = [
  "Confiance",
  "Écran",
  "Frontière",
  "Hasard",
  "Horizon",
  "Racines",
  "Silence",
  "Tempête",
];

const EDHEC_TRAINING_INTENT =
  "Première partie de l'entretien EDHEC (« Trilogie ») : le jury vous impose un mot et vous devez prendre la parole dessus, sans préparation. L'exercice teste votre capacité à construire un propos personnel et structuré à partir d'un seul mot, puis à échanger avec le jury sur ce que vous avez dit.";
const EDHEC_TRAINING_CRITERIA = [
  "Appropriez-vous le mot immédiatement : définissez-le à votre manière ou racontez ce qu'il évoque pour vous, plutôt que de donner une définition de dictionnaire.",
  "Structurez votre prise de parole : une entrée en matière, deux ou trois idées clairement articulées, une conclusion nette.",
  "Personnalisez : appuyez-vous sur vos expériences, vos lectures ou vos centres d'intérêt pour illustrer le mot.",
  "Tenez environ 2 minutes de propos continu, sans blanc long ni décrochage.",
  "Si le jury rebondit sur vos propos, défendez vos choix sans vous rétracter au premier mot.",
];
const EDHEC_TRAINING_PITFALLS = [
  "Rester muet en cherchant une idée parfaite : lancez-vous, même imparfaitement.",
  "Un exposé scolaire et abstrait, sans aucun lien avec vous.",
  "Épuiser le mot en quelques phrases générales puis décrocher.",
  "Ignorer le mot pour dérouler un discours préparé qui n'a rien à voir.",
];

/** Prend un élément sur deux d'une banque (ordre source conservé). */
function everyOther<T>(items: T[]): T[] {
  return items.filter((_, i) => i % 2 === 0);
}

const EMLYON_CARD_INTENT: Record<string, string> = {
  Expérience:
    "Carte « Expérience » de l'épreuve des 4 cartes emlyon : le jury veut un récit concret tiré de votre vécu, pas une généralité. C'est l'occasion de montrer ce que vos expériences disent de vous.",
  Personnalité:
    "Carte « Personnalité » de l'épreuve des 4 cartes emlyon : la question sonde qui vous êtes vraiment. Le jury attend une réponse assumée, illustrée par des exemples personnels.",
  Projet:
    "Carte « Projet » de l'épreuve des 4 cartes emlyon : le jury vérifie la cohérence et la maturité de votre projet d'études et professionnel, et votre connaissance de l'emlyon.",
  Créativité:
    "Carte « Créativité » de l'épreuve des 4 cartes emlyon : question décalée sans bonne réponse. Le jury juge votre capacité à jouer le jeu, à improviser et à ramener malgré tout la réponse vers vous.",
};
const EMLYON_CARD_CRITERIA = [
  "Répondez directement à la question posée, sans long préambule.",
  "Ancrez votre réponse dans votre propre expérience, votre personnalité ou votre projet : c'est la personnalisation que le jury attend sur chaque carte.",
  "Tenez 3 à 4 minutes maximum : une réponse claire et rythmée plutôt qu'un monologue exhaustif.",
  "Si le jury relance ou vous contredit, tenez votre position en l'ajustant intelligemment.",
];
const EMLYON_CARD_PITFALLS = [
  "Une réponse factuelle ou générique qui pourrait être celle de n'importe quel candidat.",
  "Chercher la « bonne » réponse au lieu de donner la vôtre.",
  "Rester sec sur une carte : mieux vaut une réponse imparfaite développée qu'un silence.",
  "Sur la Créativité, refuser de jouer le jeu ou rester hors-sol sans jamais se ramener à soi.",
];

const ESSEC_TRAINING_INTENT =
  "Mise en situation de la partie structurée de l'entretien ESSEC : le jury vous soumet un scénario concret et évalue la solution personnelle que vous construisez, pas une bonne réponse théorique.";
const ESSEC_TRAINING_CRITERIA = [
  "Prenez un court instant de réflexion, puis proposez une solution personnelle claire : ce que vous faites, dans quel ordre, et pourquoi.",
  "Justifiez vos choix avec des hypothèses explicites : les données de l'énoncé ou celles que vous posez vous-même.",
  "Structurez votre réponse : diagnostic rapide de la situation, décision, mise en œuvre concrète.",
  "Face à une relance ou une contradiction du jury, tenez votre position en l'ajustant — ni rigidité, ni capitulation.",
  "Si un lien naturel existe avec une de vos qualités, votre projet ou l'ESSEC, tendez-le sans le plaquer.",
];
const ESSEC_TRAINING_PITFALLS = [
  "Réciter une méthode toute faite sans jamais trancher sur ce que VOUS feriez.",
  "Improviser au hasard sans justifier aucun choix.",
  "Abandonner votre solution dès que le jury la conteste, ou au contraire refuser toute remise en question.",
  "Rester dans le vague : le jury attend des actions concrètes et un ordre de priorité.",
];

/** Génère les questions d'entraînement d'une banque école (module « Questions clés »). */
function buildTrainingQuestions(): KeyQuestion[] {
  const edhecWords = [...everyOther(EDHEC_WORDS), ...EDHEC_TRAINING_EXTRA_WORDS];
  const edhec: KeyQuestion[] = edhecWords.map((word, i) => ({
    id: `edhec-mot-${i + 1}`,
    theme: "EDHEC BS",
    question: `Mot imposé : « ${word} »`,
    intent: EDHEC_TRAINING_INTENT,
    criteria: EDHEC_TRAINING_CRITERIA,
    pitfalls: EDHEC_TRAINING_PITFALLS,
  }));

  const emlyonBanks: { subTheme: string; bank: string[] }[] = [
    { subTheme: "Expérience", bank: EMLYON_EXPERIENCE },
    { subTheme: "Personnalité", bank: EMLYON_PERSONNALITE },
    { subTheme: "Projet", bank: EMLYON_PROJET },
    { subTheme: "Créativité", bank: EMLYON_CREATIVITE },
  ];
  const emlyon: KeyQuestion[] = emlyonBanks.flatMap(({ subTheme, bank }) =>
    everyOther(bank).map((q, i) => ({
      id: `emlyon-${subTheme.toLowerCase()}-${i + 1}`,
      theme: "emlyon BS",
      subTheme,
      question: q,
      intent: EMLYON_CARD_INTENT[subTheme]!,
      criteria: EMLYON_CARD_CRITERIA,
      pitfalls: EMLYON_CARD_PITFALLS,
    })),
  );

  const essec: KeyQuestion[] = everyOther(ESSEC_SITUATIONS).map((s, i) => ({
    id: `essec-situation-${i + 1}`,
    theme: "ESSEC BS",
    subTheme: s.competence,
    question: s.enonce,
    intent: ESSEC_TRAINING_INTENT,
    criteria: ESSEC_TRAINING_CRITERIA,
    pitfalls: ESSEC_TRAINING_PITFALLS,
  }));

  return [...edhec, ...emlyon, ...essec];
}

KEY_QUESTIONS.push(...buildTrainingQuestions());


