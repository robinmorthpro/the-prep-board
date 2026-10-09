/**
 * Banque de questions « Impact » de Clermont School of Business (ESC Clermont).
 *
 * Les listes sont ORDONNÉES : l'ordre est l'ordre de tirage en round robin
 * (position 0 à 23), piloté par l'application — jamais par le jury.
 * Les 12 premières questions de chaque axe (index 0-11) sont aussi publiées en
 * clair dans le module 7 ; les 12 suivantes (index 12-23) sont réservées à
 * l'oral et ne sont jamais affichées en entraînement écrit.
 */
export type ImpactAxis = "people" | "planet" | "profit";

export const CLERMONT_IMPACT_QUESTIONS: Record<ImpactAxis, string[]> = {
  people: [
    "Votre génération est-elle plus difficile à manager ?",
    "Le télétravail à 100 % est-il une chance ou un piège pour le lien social en entreprise ?",
    "Comment une entreprise peut-elle concrètement agir en faveur de l'égalité hommes-femmes au-delà des discours ?",
    "L'intelligence artificielle va-t-elle détruire le management humain ?",
    "Le quiet quitting est-il un signal d'alarme pour les entreprises ou une réponse saine à la charge de travail ?",
    "Faut-il imposer des quotas pour accélérer la diversité dans les comités de direction ?",
    "La semaine de 4 jours est-elle une vraie solution ou un effet de mode managérial ?",
    "Peut-on encore parler de loyauté envers une entreprise chez les jeunes diplômés ?",
    "Le bien-être au travail doit-il être la responsabilité de l'entreprise ou celle de l'individu ?",
    "Le management à distance rend-il les équipes plus autonomes ou plus isolées ?",
    "Faut-il un vrai droit à la déconnexion, même si cela pèse sur la compétitivité des entreprises ?",
    "Les soft skills comptent-elles plus que les diplômes pour manager une équipe aujourd'hui ?",
    "Le présentiel obligatoire est-il encore justifiable dans une entreprise moderne ?",
    "Faut-il évaluer les employés sur leurs résultats plutôt que sur leur temps de présence ?",
    "L'intergénérationnel en entreprise est-il une richesse ou une source de conflits ?",
    "Une entreprise doit-elle recruter sur les compétences ou sur la personnalité ?",
    "Le CDI est-il encore le contrat qui rassure le plus les jeunes actifs ?",
    "Faut-il repenser l'entretien d'embauche traditionnel ?",
    "L'ubérisation du travail profite-t-elle vraiment aux travailleurs indépendants ?",
    "Un manager doit-il être un expert du métier qu'il encadre ?",
    "La transparence totale des salaires en entreprise est-elle souhaitable ?",
    "Le mentorat est-il devenu indispensable pour réussir en entreprise ?",
    "Faut-il limiter le nombre d'e-mails envoyés hors des horaires de travail ?",
    "La marque employeur compte-t-elle plus que le salaire pour attirer les jeunes diplômés ?",
  ],
  planet: [
    "Train, avion ou vélo électrique : quelle est votre mobilité ?",
    "Peut-on concilier sobriété énergétique et croissance économique ?",
    "Que pensez-vous du « greenwashing » (éco-blanchiment) pratiqué par certaines grandes marques ?",
    "Faut-il interdire ou taxer massivement la fast-fashion ?",
    "La voiture électrique est-elle vraiment écologique si l'on compte toute sa chaîne de production ?",
    "Faut-il rationner certains produits pour respecter les limites planétaires ?",
    "La sobriété est-elle compatible avec le modèle de croissance des entreprises ?",
    "Le nucléaire est-il un mal nécessaire pour réussir la transition énergétique ?",
    "Les entreprises doivent-elles être notées et sanctionnées sur leur impact carbone comme sur leurs résultats financiers ?",
    "Le tourisme de masse est-il compatible avec la lutte contre le réchauffement climatique ?",
    "Faut-il interdire la publicité pour les produits les plus polluants ?",
    "La transition écologique doit-elle être imposée par la loi ou portée par les choix des consommateurs ?",
    "Faut-il imposer un quota de matières recyclées dans les produits vendus en France ?",
    "La viande cultivée en laboratoire est-elle une solution crédible face à l'élevage intensif ?",
    "Le télétravail réduit-il vraiment l'empreinte carbone d'une entreprise ?",
    "Faut-il taxer davantage les vols intérieurs au profit du train ?",
    "La sobriété numérique (streaming, data, IA) doit-elle devenir une priorité des entreprises ?",
    "Les entreprises françaises sont-elles prêtes pour la fin des véhicules thermiques neufs en 2035 ?",
    "Faut-il conditionner les aides publiques aux entreprises à des engagements climatiques réels ?",
    "L'économie circulaire est-elle un vrai modèle économique ou un argument marketing ?",
    "Le nucléaire et les renouvelables sont-ils complémentaires ou concurrents dans la transition énergétique française ?",
    "Faut-il réguler davantage l'intelligence artificielle au nom de son empreinte énergétique ?",
    "La rénovation énergétique des bâtiments doit-elle être obligatoire pour les propriétaires ?",
    "Le « flight shaming » (la honte de prendre l'avion) est-il un levier efficace pour changer les comportements ?",
  ],
  profit: [
    "Bill Gates : plutôt génie, mécène ou businessman ?",
    "Une entreprise peut-elle être rentable tout en étant 100 % éco-responsable ?",
    "Que vous inspire le modèle des entreprises à mission ou certifiées B-Corp ?",
    "Le boycott d'une marque par les consommateurs est-il une arme économique efficace ?",
    "Une entreprise doit-elle privilégier ses actionnaires ou l'ensemble de ses parties prenantes ?",
    "La finance verte est-elle un vrai levier de transformation ou un outil de communication ?",
    "Faut-il plafonner les écarts de salaires au sein d'une même entreprise ?",
    "Les cryptomonnaies ont-elles un avenir dans l'économie réelle ?",
    "Le low-cost est-il un modèle économique condamné à disparaître ?",
    "Une entreprise peut-elle être à la fois low-cost et socialement responsable ?",
    "Faut-il davantage taxer les superprofits des grandes entreprises en période de crise ?",
    "Le mécénat d'entreprise est-il un acte désintéressé ou une stratégie d'image ?",
    "Les entreprises françaises doivent-elles préférer la croissance organique à la croissance par acquisitions ?",
    "Le rachat d'actions (« share buyback ») profite-t-il à l'économie réelle ou seulement aux actionnaires ?",
    "Faut-il plafonner la rémunération des dirigeants du CAC 40 ?",
    "L'IA va-t-elle rendre certains métiers de la finance obsolètes ?",
    "Une entreprise doit-elle privilégier le court terme (résultats trimestriels) ou le long terme ?",
    "Le private equity est-il bon ou mauvais pour les entreprises qu'il rachète ?",
    "Faut-il davantage réguler les banques centrales dans leurs décisions de taux d'intérêt ?",
    "L'inflation profite-t-elle davantage aux entreprises qu'aux ménages ?",
    "Le made in France a-t-il un avenir économique face aux coûts de production à l'étranger ?",
    "Une start-up doit-elle privilégier la rentabilité ou la croissance à tout prix (« growth at all costs ») ?",
    "Les fonds souverains étrangers sont-ils une menace ou une opportunité pour les entreprises françaises ?",
    "Faut-il taxer davantage les holdings pour financer les services publics ?",
  ],
};

/** Nombre de questions par axe : le round robin reboucle à 0 après la dernière. */
export const CLERMONT_IMPACT_COUNT = 24;

/** Questions 1 à 12 de chaque axe : publiées dans le module Questions clés. */
export const CLERMONT_IMPACT_MODULE: Record<ImpactAxis, string[]> = {
  people: CLERMONT_IMPACT_QUESTIONS.people.slice(0, 12),
  planet: CLERMONT_IMPACT_QUESTIONS.planet.slice(0, 12),
  profit: CLERMONT_IMPACT_QUESTIONS.profit.slice(0, 12),
};

/** Questions 13 à 24 de chaque axe : réservées au jury, jamais publiées. */
export const CLERMONT_IMPACT_JURY: Record<ImpactAxis, string[]> = {
  people: CLERMONT_IMPACT_QUESTIONS.people.slice(12),
  planet: CLERMONT_IMPACT_QUESTIONS.planet.slice(12),
  profit: CLERMONT_IMPACT_QUESTIONS.profit.slice(12),
};

/** Libellé affiché / prononcé pour chaque axe. */
export const IMPACT_AXIS_LABEL: Record<ImpactAxis, string> = {
  people: "People",
  planet: "Planet",
  profit: "Profit",
};
