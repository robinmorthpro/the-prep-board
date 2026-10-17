/* Contenus de la page Ressources théoriques.
 * Reformulation pédagogique de la méthode des livres (aucune reprise mot pour mot).
 * Ordre des chapitres = ordre de préparation : comprendre l'épreuve, construire la
 * matière (projet, écoles, expériences, actualité), puis la restituer à l'oral. */

import type { TheorySection } from "./theory";
import { PROJECTIVE_CV, SUPPORTS_THEORY_SECTIONS } from "./supports-kb";
import { KEY_QUESTIONS, KEY_QUESTION_THEMES } from "./vivaldi-data";
import { isCanonicalQuestion } from "./cockpit";
import {
  METHODE_ACTUALITE,
  METHODE_ECOLES,
  METHODE_EXPERIENCES,
  METHODE_PROJET,
  type Chapter,
  type ResourceSection,
} from "./methode";

export type { Chapter, ResourceLink, ResourceSection } from "./methode";

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Consignes d'un module, reprises de la même source que le bouton du module (source unique). */
function moduleSections(prefix: string, group: string, sections: TheorySection[]): ResourceSection[] {
  return sections.map((s, i) => ({
    id: `${prefix}-consigne-${i + 1}-${slug(s.title)}`,
    title: s.title,
    group,
    keywords: [],
    points: s.points,
  }));
}

/** Les 44 questions clés canoniques (module 6), mêmes attendus que dans le module. */
const QUESTION_SECTIONS: ResourceSection[] = KEY_QUESTION_THEMES.flatMap((theme) =>
  KEY_QUESTIONS.filter((q) => q.theme === theme && isCanonicalQuestion(q.id)).map((q) => ({
    id: `question-${q.id}`,
    title: q.question,
    group: q.theme,
    keywords: [q.theme],
    lead: q.intent,
    faire: q.criteria,
    eviter: q.pitfalls,
    faireLabel: "Critères d'une bonne réponse",
    eviterLabel: "Pièges à éviter",
  })),
);

export const CHAPTERS: Chapter[] = [
  {
    id: "epreuve",
    title: "Comprendre l'entretien",
    intro: "Avant de préparer quoi que ce soit, il faut savoir ce que le jury cherche réellement pendant ces trente minutes.",
    sections: [
      {
        id: "epreuve-pretexte",
        title: "Chaque question parle de vous",
        keywords: ["jury", "objectif", "prétexte", "motivation", "personnalité"],
        lead: "Quelle que soit la question, le sujet véritable reste le même : qui vous êtes, et ce que vous ferez de l'école.",
        body: [
          "Un stage, un sport, un sujet d'actualité ou un modèle admiré ne sont que des supports. Le jury s'en sert pour observer votre manière de penser, vos qualités et la cohérence de votre parcours.",
          "Une réponse réussie part donc du sujet posé mais revient toujours vers vous : ce que vous avez fait, ce que cela révèle, ce que vous en ferez demain.",
        ],
      },
      {
        id: "epreuve-trois-attentes",
        title: "Les trois choses que le jury vérifie",
        keywords: ["connaître", "convaincre", "rassurer", "attentes", "évaluation"],
        lead: "Mieux vous connaître, être convaincu par des preuves, être rassuré sur votre avenir dans l'école.",
        faire: [
          "Faire découvrir une personnalité : des qualités et des défauts réels, assumés.",
          "Apporter des preuves : des faits datés et situés, pas des déclarations.",
          "Rassurer : montrer que vous savez ce que vous viendrez chercher et apporter, en école puis en entreprise.",
        ],
      },
      {
        id: "epreuve-jury",
        title: "Qui est en face de vous",
        keywords: ["jury", "professeur", "professionnel", "ancien", "composition"],
        lead: "Le jury mêle généralement un membre de l'école et un professionnel : vos réponses doivent parler aux deux.",
        body: [
          "Le représentant de l'école attend que vous connaissiez ses enseignements et sa vie étudiante. Le professionnel veut sentir un futur collègue crédible, au fait de la réalité des métiers.",
          "C'est pour cette raison qu'un bon lien avec l'avenir nomme à la fois un élément de l'école (master, association, échange) et un horizon professionnel (domaine, secteur, entreprise).",
        ],
      },
      {
        id: "epreuve-preparer",
        title: "Préparer sans réciter",
        keywords: ["préparation", "par cœur", "naturel", "entraînement", "voix haute"],
        lead: "Connaître sa matière par cœur, jamais ses phrases.",
        faire: [
          "Travailler des idées, des anecdotes et des liens, pas un texte rédigé.",
          "S'entraîner à voix haute, devant d'autres personnes, plusieurs fois.",
          "Construire la matière module par module : chaque partie nourrit les autres le jour J.",
        ],
        eviter: ["Un discours appris mot à mot : il s'entend immédiatement et le jury coupe."],
      },
    ],
  },
  METHODE_PROJET,
  METHODE_ECOLES,
  METHODE_EXPERIENCES,
  METHODE_ACTUALITE,
  {
    id: "oral",
    title: "Le jour de l'oral",
    intro: "Toute la matière est prête. Reste à la restituer : se présenter, orienter l'échange, tenir face aux questions inattendues et bien finir.",
    link: { to: "/partie-7", label: "M'entraîner aux questions clés" },
    sections: [
      {
        id: "oral-presentation",
        title: "Se présenter en deux minutes",
        keywords: ["présentation", "2 minutes", "présentez-vous", "carte de visite", "structure", "catégories"],
        lead: "La seule partie prévisible de l'entretien : elle doit être maîtrisée parfaitement.",
        body: [
          "C'est votre premier contact, le moment où le stress est maximal et où le jury sort à peine du candidat précédent. À vous d'aller chercher son attention.",
        ],
        faire: [
          "Identité : prénom puis nom.",
          "Parcours scolaire actuel et établissement (le bac seulement s'il est particulier).",
          "Expériences classées par catégorie (stages et jobs, associations, sports, voyages, passions), de la plus importante à la moins importante.",
          "Pour chaque expérience, uniquement le contexte : quand, où, combien de temps, quel rôle.",
          "Une phrase finale qui tend une perche vers le sujet que vous voulez aborder.",
        ],
        eviter: [
          "Livrer déjà l'analyse de vos expériences : le jury n'a plus de raison de vous interroger.",
          "Aller et venir entre les thèmes.",
          "Finir sur « et voilà » ou sur une phrase de motivation passe-partout.",
          "Parler du projet professionnel si vous n'êtes pas encore à l'aise dessus : gardez-le pour le cœur de l'entretien.",
        ],
      },
      {
        id: "oral-5min",
        title: "La version longue (5 minutes)",
        keywords: ["5 minutes", "présentation longue", "développer"],
        lead: "Même ossature, mais deux ou trois expériences développées avec Passé, Présent, Futur.",
        body: ["Préparez la version longue en premier : il est plus facile de couper le jour J que d'inventer."],
        eviter: ["Meubler avec des détails, ou tout livrer et n'avoir plus rien pour la suite."],
      },
      {
        id: "oral-perches",
        title: "Tendre des perches",
        keywords: ["perches", "orienter", "relances", "conclusion", "piloter"],
        lead: "Évoquer un point sans le développer, pour que le jury ait envie d'y revenir.",
        body: [
          "En fin de présentation comme en fin de réponse, une phrase bien placée oriente la question suivante vers un terrain que vous avez préparé. Le jury la saisit très souvent.",
        ],
        exemple: "« J'aimerais pendant cet entretien vous expliquer pourquoi le master Supply Chain de votre école correspond à mon projet. »",
      },
      {
        id: "oral-destabilisantes",
        title: "Les questions déstabilisantes",
        keywords: ["déstabilisant", "faites-nous rire", "surprenez-nous", "stylo", "million", "émotion", "stress"],
        lead: "Le jury observe votre réaction, pas la performance.",
        body: [
          "« Faites-nous rire » : reconnaissez avec le sourire que le stress n'aide pas, puis racontez une anecdote drôle que vous avez vécue.",
          "« Surprenez-nous » : montrez une facette qui nuance l'image donnée jusqu'ici, toujours à partir de faits réels.",
          "« Vendez-moi ce stylo » : interrogez d'abord votre interlocuteur sur ses besoins avant de vanter le produit.",
          "« Vous gagnez un million » : soyez honnête et mêlez plaisir personnel, proches et projet qui a du sens.",
        ],
        faire: ["S'accorder quelques secondes de réflexion.", "Rester calme : ni agressivité, ni capitulation."],
      },
      {
        id: "oral-management",
        title: "Management et modèles",
        keywords: ["manager", "bon manager", "modèle", "admiration", "leadership"],
        lead: "Définir avant de qualifier, et illustrer chaque idée.",
        body: [
          "Un manager porte la responsabilité d'une mission et d'une équipe, sur le plan humain comme financier. Citez ensuite les qualités qui comptent selon vous, chacune appuyée par un exemple observé.",
          "Pour un modèle, choisissez de préférence une personne connue de tous, et expliquez ce que son parcours ou ses engagements disent de vos propres valeurs.",
        ],
      },
      {
        id: "oral-conclusion",
        title: "Bien terminer",
        keywords: ["conclusion", "question au jury", "mot de la fin", "ajouter", "dernière question"],
        lead: "La dernière question est une dernière chance de marquer des points ou de corriger le tir.",
        body: [
          "« Avez-vous une question ou quelque chose à ajouter ? » : préparez une vraie question sur l'école, ou revenez sur un point que vous n'avez pas pu développer.",
          "« Le mot de la fin » : un seul mot, qui résume votre état d'esprit, expliqué en une phrase.",
          "« Quelle question auriez-vous aimé qu'on vous pose ? » : prenez le temps, puis apportez un élément nouveau sur vous.",
        ],
        eviter: ["Répondre « non, rien à ajouter » et laisser passer l'occasion."],
      },
    ],
  },
  {
    id: "formats",
    title: "Épreuves propres à certaines écoles",
    intro: "Quelques écoles remplacent ou complètent l'entretien classique par un exercice particulier. La méthode de fond reste la même.",
    link: { to: "/partie-8", label: "Lancer une simulation" },
    sections: [
      {
        id: "fmt-edhec",
        title: "EDHEC — Le mot imposé",
        keywords: ["edhec", "mot imposé", "trilogie", "4 minutes", "monologue"],
        lead: "Une minute de préparation, quatre minutes de parole sans interruption.",
        faire: [
          "S'approprier le mot : ce qu'il évoque pour vous, plutôt qu'une définition de dictionnaire.",
          "Structurer : une entrée en matière, deux ou trois idées, une conclusion nette.",
          "Ramener le mot vers vos expériences et votre projet déjà préparés.",
        ],
      },
      {
        id: "fmt-emlyon",
        title: "emlyon — Les quatre cartes",
        keywords: ["emlyon", "cartes", "expérience", "personnalité", "projet", "créativité"],
        lead: "Quatre familles de cartes (Expérience, Personnalité, Projet, Créativité), environ trois à quatre minutes chacune.",
        body: [
          "Répondez directement, sans long préambule, et ancrez chaque réponse dans votre vécu. La carte Créativité n'a pas de bonne réponse : le jury regarde si vous jouez le jeu et ramenez la question vers vous.",
        ],
      },
      {
        id: "fmt-essec",
        title: "ESSEC — Les mises en situation",
        keywords: ["essec", "mise en situation", "scénario", "décision", "diagnostic"],
        lead: "On attend votre solution personnelle, pas une réponse théorique.",
        faire: [
          "Prendre un court temps de réflexion.",
          "Poser un diagnostic, décider, puis expliquer la mise en œuvre.",
          "Rendre vos hypothèses explicites et tenir votre position face à la contradiction.",
        ],
      },
      {
        id: "fmt-clermont",
        title: "Clermont — Les questions Impact",
        keywords: ["clermont", "impact", "people", "planet", "profit", "rse", "prise de position"],
        lead: "Trois axes, People, Planet, Profit : prendre position clairement sur un sujet de société, sans préparation.",
        body: [
          "Tranchez après quelques secondes de réflexion, argumentez avec des exemples, et tenez votre position si le jury défend l'inverse, tout en reconnaissant la part de vérité de l'autre camp.",
        ],
      },
    ],
  },
];

const actuIndex = CHAPTERS.findIndex((c) => c.id === "actualite");
CHAPTERS.splice(
  actuIndex + 1,
  0,
  {
    id: "supports",
    title: "Les supports d'entretien",
    intro: "Questionnaires des écoles et CV projectif : votre premier contact écrit avec le jury.",
    link: { to: "/partie-6", label: "Préparer mes supports" },
    sections: [
      ...moduleSections("supports", "Consignes du module 5", SUPPORTS_THEORY_SECTIONS),
      ...moduleSections("supports-cv", "CV projectif", [
        { title: "CV projectif : ce que le jury vérifie", points: PROJECTIVE_CV.rules },
        { title: "CV projectif : les rubriques attendues", points: PROJECTIVE_CV.sections },
      ]),
    ],
  },
  {
    id: "questions",
    title: "Les questions clés",
    intro: `Les ${QUESTION_SECTIONS.length} questions incontournables, avec l'intention du jury, les critères d'une bonne réponse et les pièges à éviter.`,
    link: { to: "/partie-7", label: "M'entraîner aux questions clés" },
    sections: QUESTION_SECTIONS,
  },
);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Recherche insensible aux accents et à la casse dans titres, mots-clés et textes. */
export function searchResources(query: string) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const out: { chapter: Chapter; index: number; section: ResourceSection }[] = [];
  CHAPTERS.forEach((chapter, ci) => {
    for (const section of chapter.sections) {
      const hay = norm(
        [section.title, section.lead ?? "", section.group ?? "", ...section.keywords, ...(section.body ?? []), ...(section.points ?? []), ...(section.faire ?? []), ...(section.eviter ?? []), section.exemple ?? ""].join(" "),
      );
      if (terms.every((t) => hay.includes(t))) out.push({ chapter, index: ci + 1, section });
    }
  });
  return out;
}
