/**
 * Banques de cartes du « Révélateur », l'épreuve d'admission de KEDGE
 * Business School (module 8, format spécial).
 *
 * Contenu extrait verbatim du prompt de l'ancien agent ElevenLabs dédié.
 * Auparavant, les cinq cartes étaient tirées en interne par le LLM lui-même :
 * ni vérifiable, ni affichable à l'écran. Désormais l'application tire les
 * cinq cartes (aléatoire pur, aucune mémoire d'une session à l'autre, comme
 * tous les autres tirages spéciaux) et les transmet au jury via des variables
 * dynamiques (kedge_odd, kedge_autoportrait, kedge_action, kedge_pensee,
 * kedge_esprit) ; elles sont aussi affichées au candidat pendant l'entretien.
 */

/** Carte Trait d'Union : l'ODD qui sert de fil conducteur à tout l'entretien. */
export const KEDGE_ODD: string[] = [
  "Pas de pauvreté",
  "Faim « zéro »",
  "Bonne santé et bien-être",
  "Éducation de qualité",
  "Égalité entre les sexes",
  "Eau propre et assainissement",
  "Énergie propre et d'un coût abordable",
  "Travail décent et croissance économique",
  "Industrie, innovation et infrastructure",
  "Inégalités réduites",
  "Villes et communautés durables",
  "Consommation et production responsables",
  "Lutte contre les changements climatiques",
  "Vie aquatique",
  "Vie terrestre",
  "Paix, justice et institutions efficaces",
  "Partenariats pour la réalisation des objectifs",
];

/** Carte Autoportrait : le mot à partir duquel le candidat se présente. */
export const KEDGE_AUTOPORTRAIT: string[] = [
  "Peur",
  "Métamorphose",
  "Relations",
  "Ego",
  "Échec",
  "Liberté",
  "Racines",
  "Silence",
  "Audace",
  "Doute",
  "Équilibre",
  "Frontières",
  "Résilience",
  "Curiosité",
  "Transmission",
  "Ambition",
  "Vulnérabilité",
  "Rupture",
  "Empreinte",
  "Renaissance",
];

/** Carte Trait d'Action : le verbe à illustrer par une action concrète. */
export const KEDGE_ACTION: string[] = [
  "Promouvoir",
  "Détruire",
  "Interdire",
  "Militer",
  "Construire",
  "Réparer",
  "Partager",
  "Transmettre",
  "Rassembler",
  "Innover",
  "Protéger",
  "Transformer",
  "Sensibiliser",
  "Entreprendre",
  "Coopérer",
  "Résister",
  "Anticiper",
  "Réinventer",
  "Fédérer",
  "Oser",
];

/** Carte Trait de Pensée : l'affirmation clivante à défendre puis à contredire. */
export const KEDGE_PENSEE: string[] = [
  "L'agriculture intensive permet de garantir les approvisionnements.",
  "Le progrès nuit à la solidarité.",
  "La légalisation de la marijuana génère des revenus fiscaux.",
  "Le télétravail est l'avenir du travail.",
  "Les voyages dans l'espace sont superflus en temps de récession.",
  "L'intelligence artificielle va détruire plus d'emplois qu'elle n'en crée.",
  "La mondialisation profite davantage aux entreprises qu'aux individus.",
  "Les réseaux sociaux nuisent plus qu'ils ne rapprochent.",
  "La croissance économique est incompatible avec la protection de l'environnement.",
  "Le mérite individuel explique la réussite plus que le contexte social.",
  "La gratuité des transports en commun est une fausse bonne idée.",
  "Le tourisme de masse abîme davantage les territoires qu'il ne les enrichit.",
  "La semaine de quatre jours améliore la productivité des entreprises.",
  "L'obsolescence programmée est le prix à payer pour l'innovation.",
  "Les influenceurs ont aujourd'hui plus de pouvoir que les médias traditionnels.",
  "La viande de synthèse est une solution d'avenir pour l'alimentation.",
  "Le sport de haut niveau est un mauvais exemple pour la jeunesse.",
  "La ville de demain doit se passer de la voiture individuelle.",
  "L'intelligence collective vaut mieux que l'expertise individuelle.",
  "L'uniforme à l'école réduit les inégalités entre élèves.",
];

/** Carte Trait d'Esprit : la phrase évocatrice à interpréter librement. */
export const KEDGE_ESPRIT: string[] = [
  "Trésor sans valeur",
  "Victoire amère",
  "Choix imposés",
  "Miroir transparent",
  "Silence assourdissant",
  "Liberté surveillée",
  "Échec fécond",
  "Ordre chaotique",
  "Solitude choisie",
  "Lenteur productive",
  "Doute constructif",
  "Générosité intéressée",
  "Routine libératrice",
  "Excès de prudence",
  "Confort inconfortable",
  "Absence présente",
  "Certitude fragile",
  "Simplicité complexe",
  "Distance rapprochée",
  "Silence éloquent",
];

/** Tirage aléatoire d'un élément dans une banque. */
function pickOne(bank: string[]): string {
  return bank[Math.floor(Math.random() * bank.length)] ?? bank[0]!;
}

/**
 * Tire les cinq cartes du Révélateur pour la session : une par banque, en
 * aléatoire pur. Appelé une seule fois au démarrage de l'entretien.
 */
export function drawKedgeCards() {
  return {
    odd: pickOne(KEDGE_ODD),
    autoportrait: pickOne(KEDGE_AUTOPORTRAIT),
    action: pickOne(KEDGE_ACTION),
    pensee: pickOne(KEDGE_PENSEE),
    esprit: pickOne(KEDGE_ESPRIT),
  };
}
