/**
 * Contenu éditorial du site vitrine The Prepboard.
 * Aucun appel réseau : tout est statique, donc rendu côté serveur et indexable.
 * NB : les témoignages sont des exemples de mise en page à remplacer par de vrais
 * verbatims recueillis auprès des candidats (champ `placeholder: true`).
 */

export const BRAND = {
  name: "The Prepboard",
  baseline: "La préparation aux concours, réinventée.",
  promise:
    "S'entraîner autant de fois qu'il le faut à l'oral, jusqu'au jour du concours.",
  email: "contact@theprepboard.fr",
  price: 99,
  priceBoursier: 79,
} as const;

export type Temoignage = {
  quote: string;
  author: string;
  detail: string;
  placeholder?: boolean;
};

export type Concours = {
  slug: string;
  nav: string;
  h1: string;
  title: string;
  description: string;
  chapo: string;
  publics: string[];
  epreuve: {
    format: string;
    duree: string;
    jury: string;
    coefficient: string;
    calendrier: string;
  };
  attendus: { titre: string; texte: string }[];
  questions: string[];
  parcours: { titre: string; texte: string }[];
  differenciants: string[];
  temoignages: Temoignage[];
  faq: { q: string; a: string }[];
};

export const CONCOURS: Concours[] = [
  {
    slug: "oral-sciences-po-paris",
    nav: "Oral Sciences Po Paris",
    h1: "Préparer l'oral d'admission de Sciences Po Paris",
    title: "Oral Sciences Po Paris : préparation et simulations illimitées | The Prepboard",
    description:
      "Entraînez-vous à l'entretien d'admission de Sciences Po Paris : format de l'épreuve, attentes du jury, simulations illimitées avec feedback chiffré. 99 € (79 € boursiers).",
    chapo:
      "L'entretien de Sciences Po Paris n'évalue pas ce que vous savez, mais la manière dont vous pensez devant trois personnes qui vous coupent. Cela ne se travaille pas en lisant : cela se travaille en parlant, plusieurs dizaines de fois.",
    publics: ["Terminale · procédure nationale", "Candidats internationaux", "Réorientations"],
    epreuve: {
      format:
        "Entretien oral d'admission en visioconférence ou en présentiel, à partir d'un dossier et d'une vidéo de motivation déposée en amont.",
      duree: "Environ 30 minutes d'échange.",
      jury: "Deux à trois évaluateurs : enseignants, alumni, professionnels.",
      coefficient:
        "L'oral est la phase décisive de l'admission : il départage des dossiers déjà excellents sur le papier.",
      calendrier: "Convocations au printemps, après l'examen du dossier et de la vidéo.",
    },
    attendus: [
      {
        titre: "Une motivation située, pas récitée",
        texte:
          "Le jury cherche une trajectoire : d'où vient l'intérêt pour les sciences sociales, ce qui l'a confirmé, ce que le campus choisi y ajoute concrètement.",
      },
      {
        titre: "Un rapport au monde argumenté",
        texte:
          "Une actualité citée doit être datée, sourcée, et suivie d'une position que vous pouvez défendre sous contradiction.",
      },
      {
        titre: "La résistance à la relance",
        texte:
          "La question qui suit votre réponse compte plus que votre réponse. Le jury pousse jusqu'à la limite de ce que vous maîtrisez.",
      },
      {
        titre: "La clarté de la parole",
        texte:
          "Débit, structure, absence de tics. Une idée par phrase. Un plan implicite audible en trente secondes.",
      },
    ],
    questions: [
      "Pourquoi Sciences Po plutôt qu'une licence de droit ou d'économie ?",
      "Racontez-moi une lecture qui a changé votre avis sur un sujet.",
      "Quel événement de l'année vous a le plus marqué, et pourquoi celui-ci ?",
      "Vous dites vouloir travailler sur les inégalités : lesquelles, mesurées comment ?",
      "Qu'est-ce que le campus de Reims a que Paris n'a pas ?",
      "Quelle est la faiblesse de votre dossier ?",
    ],
    parcours: [
      {
        titre: "Votre dossier devient une matière d'oral",
        texte:
          "Expériences, engagements, lectures : chaque élément est repris, daté, transformé en récit de deux minutes défendable sous questions.",
      },
      {
        titre: "Trois actualités tenues",
        texte:
          "Vous construisez trois sujets d'actualité solides, faits, sources, controverse, position, que le jury pourra attaquer.",
      },
      {
        titre: "Simulations d'entretien complètes",
        texte:
          "Un jury vocal mène l'entretien de bout en bout, rebondit sur vos réponses, et ne rend son évaluation qu'à la fin.",
      },
    ],
    differenciants: [
      "Un jury qui relance sur ce que vous venez de dire, pas une liste de questions préenregistrées.",
      "Un feedback chiffré : durée de parole, verbatims, positionnement par rapport aux autres candidats.",
      "Un historique complet : vous revoyez votre oral n°1 le jour de votre oral n°12.",
    ],
    temoignages: [
      {
        quote:
          "J'ai passé onze simulations avant l'oral. Le jour J, la seule question qui m'a surprise était une question que j'avais déjà eue.",
        author: "Lina",
        detail: "Admise, campus de Reims",
        placeholder: true,
      },
      {
        quote:
          "Le feedback m'a montré que je parlais 4 minutes sur une réponse de 2. C'est le genre de chose qu'un ami ne vous dit pas.",
        author: "Marc",
        detail: "Terminale, Lyon",
        placeholder: true,
      },
    ],
    faq: [
      {
        q: "Combien de simulations d'oral Sciences Po puis-je faire ?",
        a: "Autant que nécessaire. L'accès à 99 € ne limite pas le nombre d'entretiens : la moyenne observée est d'une dizaine de simulations avant le jour J.",
      },
      {
        q: "L'entretien se prépare-t-il vraiment à l'oral ?",
        a: "Oui. Une motivation écrite tient rarement à l'oral : le débit change, la relance déstabilise. Il faut avoir dit son propos à voix haute plusieurs dizaines de fois.",
      },
      {
        q: "The Prepboard remplace-t-il une prépa privée à l'oral ?",
        a: "Une prépa privée propose en général deux à quatre simulations pour plusieurs centaines d'euros. The Prepboard propose un nombre illimité de simulations pour 99 €, avec un feedback écrit après chacune.",
      },
    ],
  },
  {
    slug: "oraux-ecoles-de-commerce-cpge",
    nav: "Oraux écoles de commerce · CPGE",
    h1: "Préparer les oraux de motivation des écoles de commerce (voie CPGE)",
    title: "Oraux écoles de commerce CPGE : entretien de personnalité, simulations | The Prepboard",
    description:
      "BCE et Ecricome : préparez l'entretien de personnalité et de motivation des écoles de commerce après prépa. Parcours guidé, jury vocal, entraînements illimités. 99 €.",
    chapo:
      "Après deux ans de prépa, tout se joue en vingt-cinq minutes d'entretien. Les écrits classent, les oraux décident : c'est là que se font les écarts de plusieurs dizaines de places.",
    publics: ["ECG · ECT · B/L", "Khûbes", "BCE et Ecricome"],
    epreuve: {
      format:
        "Entretien de personnalité et de motivation, souvent précédé d'un travail préparatoire (question de réflexion, mise en situation, photo, article selon l'école).",
      duree: "20 à 40 minutes selon l'école.",
      jury: "Deux à trois membres : professeur, étudiant de l'école, professionnel.",
      coefficient:
        "L'oral pèse fréquemment de 30 % à plus de 50 % du total d'admission selon les écoles.",
      calendrier: "Oraux de mi-juin à mi-juillet, après les résultats d'admissibilité.",
    },
    attendus: [
      {
        titre: "Se connaître, avec des preuves",
        texte:
          "Une qualité annoncée sans anecdote est perdue. Chaque trait doit s'appuyer sur une situation précise, datée, avec ce que vous avez fait vous.",
      },
      {
        titre: "Un projet professionnel tenable",
        texte:
          "Ni « manager », ni « consultant » : un métier, un secteur, une première étape crédible, et ce que l'école y apporte réellement.",
      },
      {
        titre: "Connaître l'école, pas son classement",
        texte:
          "Associations, parcours, électifs, doubles diplômes, campus : ce que vous citerez doit exister et vous concerner.",
      },
      {
        titre: "Tenir la contradiction",
        texte:
          "Le jury teste la solidité, pas la conformité. Une opinion assumée et argumentée vaut mieux qu'une réponse lisse.",
      },
    ],
    questions: [
      "Présentez-vous en deux minutes.",
      "Parlez-moi d'un échec et de ce que vous en avez tiré.",
      "Pourquoi notre école plutôt que celle qui la précède au classement ?",
      "Quelle association intégreriez-vous, et pour y faire quoi ?",
      "Quel est votre projet professionnel à cinq ans ?",
      "Qu'est-ce qui vous a marqué dans l'actualité cette semaine ?",
    ],
    parcours: [
      {
        titre: "Sept étapes avant le jour J",
        texte:
          "Identité, projet professionnel, fiches écoles, expériences et anecdotes, actualité, questions classiques, puis entretien complet.",
      },
      {
        titre: "Une fiche par école visée",
        texte:
          "Vous construisez votre fiche pour chaque école : ce que vous y cherchez, ce que vous y apportez, ce que vous citerez si on vous pousse.",
      },
      {
        titre: "L'entretien complet, en conditions",
        texte:
          "Découverte, classique, exigeant : trois niveaux de jury. L'évaluation ne tombe qu'à la fin, comme au concours.",
      },
    ],
    differenciants: [
      "Un parcours construit avec des jurys de concours des plus grandes écoles.",
      "Des fiches écoles vérifiées et exportables en PDF pour réviser hors ligne.",
      "Le positionnement par rapport aux candidats qui visent les mêmes écoles.",
    ],
    temoignages: [
      {
        quote:
          "Sur mes trois premières simulations, le même reproche revenait : je répondais à côté de la question posée. Je l'ai vu écrit noir sur blanc.",
        author: "Clara",
        detail: "ECG 2, admise à l'ESSEC",
        placeholder: true,
      },
      {
        quote:
          "Ma prépa privée m'offrait deux simulations à 450 €. J'en ai fait dix-neuf ici.",
        author: "Hugo",
        detail: "ECT, admis à l'EDHEC",
        placeholder: true,
      },
    ],
    faq: [
      {
        q: "Les oraux BCE et Ecricome se préparent-ils de la même façon ?",
        a: "Le fond est commun, connaissance de soi, projet, motivation pour l'école, mais les formats diffèrent : certaines écoles imposent un travail préparatoire, d'autres un entretien libre. Les fiches écoles de The Prepboard distinguent les deux.",
      },
      {
        q: "Quand commencer la préparation des oraux ?",
        a: "Le travail introspectif (expériences, projet) peut commencer dès le début de la deuxième année. Les simulations prennent leur sens dès les admissibilités.",
      },
      {
        q: "Combien coûte la préparation ?",
        a: "99 € pour l'ensemble de la préparation et des simulations illimitées, 79 € pour les boursiers.",
      },
    ],
  },
  {
    slug: "oraux-ecoles-de-commerce-ast",
    nav: "Oraux écoles de commerce · AST",
    h1: "Préparer les oraux d'admission sur titre (AST) des écoles de commerce",
    title: "Oraux AST écoles de commerce : entretien de motivation et projet | The Prepboard",
    description:
      "Admissions sur titre : préparez l'entretien de motivation des écoles de commerce en AST1 et AST2. Cohérence de parcours, projet professionnel, simulations illimitées. 99 €.",
    chapo:
      "En admission sur titre, le jury n'a pas deux ans de prépa pour vous situer. Il a un parcours à comprendre en vingt minutes, et une question centrale : pourquoi maintenant, pourquoi ici.",
    publics: ["Licence · Bachelor", "Master 1", "Réorientations et années à l'étranger"],
    epreuve: {
      format:
        "Entretien de motivation, souvent doublé d'un entretien de personnalité ou d'une mise en situation, sur la base d'un dossier de candidature et de scores (TAGE MAGE, GMAT, TOEIC…).",
      duree: "20 à 45 minutes selon l'école.",
      jury: "Professeurs, alumni, professionnels, parfois un entretien individuel puis collectif.",
      coefficient:
        "Après l'admissibilité sur dossier et tests, l'oral est très majoritairement décisif.",
      calendrier: "Plusieurs vagues d'admission de février à juillet.",
    },
    attendus: [
      {
        titre: "Une cohérence de parcours",
        texte:
          "Chaque bifurcation doit être expliquée et assumée : ce que vous êtes allé y chercher, ce que vous en avez tiré, où cela mène.",
      },
      {
        titre: "Une valeur ajoutée démontrable",
        texte:
          "Le jury AST cherche ce que votre profil apporte à la promotion : compétence, expérience terrain, secteur, international.",
      },
      {
        titre: "Un projet argumenté par le marché",
        texte:
          "Métier ciblé, entreprises identifiées, compétences manquantes, et l'école positionnée comme la marche à franchir.",
      },
      {
        titre: "La maîtrise du programme visé",
        texte:
          "Majeures, électifs, césure, alternance : citer ce qui existe, et dire ce que vous y ferez.",
      },
    ],
    questions: [
      "Pourquoi une école de commerce après votre licence ?",
      "Qu'apportez-vous à la promotion que les candidats issus de prépa n'apportent pas ?",
      "Expliquez cette année entre deux diplômes.",
      "Quel métier visez-vous, et quelle est votre première étape après le diplôme ?",
      "Pourquoi ce programme et pas celui d'à côté ?",
      "Que ferez-vous si vous n'êtes pas admis ?",
    ],
    parcours: [
      {
        titre: "Reconstruire le fil du parcours",
        texte:
          "Chaque étape est reprise et transformée en argument : ce que vous avez choisi, ce que vous avez appris, ce que cela prouve.",
      },
      {
        titre: "Aligner projet et programme",
        texte:
          "Vous construisez la fiche du programme visé et vous vérifiez que votre projet s'y accroche point par point.",
      },
      {
        titre: "Simulations exigeantes",
        texte:
          "Le jury AST creuse les zones grises du parcours. Vous vous entraînez à les tenir sans vous justifier.",
      },
    ],
    differenciants: [
      "Un travail spécifique sur les ruptures de parcours, angle mort des préparations généralistes.",
      "Des simulations adaptées au format AST, plus courtes et plus frontales.",
      "Un coût sans commune mesure avec un coaching individuel.",
    ],
    temoignages: [
      {
        quote:
          "Ma césure était mon point faible. Après six simulations, c'était devenu mon meilleur argument.",
        author: "Inès",
        detail: "AST2, admise à emlyon",
        placeholder: true,
      },
      {
        quote: "Je préparais l'oral seul depuis ma L3. Là, j'avais enfin quelqu'un en face.",
        author: "Théo",
        detail: "AST1, Bachelor",
        placeholder: true,
      },
    ],
    faq: [
      {
        q: "L'oral AST est-il plus facile que l'oral CPGE ?",
        a: "Il est différent. Le jury attend moins de références académiques mais beaucoup plus de cohérence de parcours et de précision sur le projet professionnel.",
      },
      {
        q: "Puis-je préparer plusieurs écoles en même temps ?",
        a: "Oui. Vous créez une fiche par école ou programme visé et vous simulez un entretien école par école.",
      },
    ],
  },
  {
    slug: "oraux-ecoles-de-commerce-post-bac",
    nav: "Oraux écoles de commerce · post-bac",
    h1: "Préparer les oraux des écoles de commerce post-bac",
    title: "Oraux écoles de commerce post-bac : entretien de motivation (Sésame, Accès) | The Prepboard",
    description:
      "Concours Sésame, Accès, Pass et concours propres : préparez l'entretien de motivation post-bac. Format de l'épreuve, attentes du jury, simulations illimitées. 99 €.",
    chapo:
      "À dix-sept ans, on vous demande un projet. Le jury sait très bien qu'il ne sera pas définitif : il veut voir comment vous l'avez construit, pas que vous l'ayez déjà réalisé.",
    publics: ["Terminale", "Concours Sésame et Accès", "Concours propres et Parcoursup"],
    epreuve: {
      format:
        "Entretien de motivation individuel, parfois complété d'un entretien collectif, d'une synthèse de document ou d'un exercice de créativité selon le concours.",
      duree: "20 à 30 minutes.",
      jury: "Deux évaluateurs, souvent un enseignant et un étudiant ou un professionnel.",
      coefficient:
        "L'entretien pèse lourd dans le classement final des concours post-bac : c'est le seul moment où le dossier devient une personne.",
      calendrier: "Oraux d'avril à mai, après les épreuves écrites.",
    },
    attendus: [
      {
        titre: "Une curiosité qui se prouve",
        texte:
          "Lectures, podcasts, engagements, jobs d'été : le jury cherche des traces réelles, pas des intentions.",
      },
      {
        titre: "Une raison d'être là",
        texte:
          "Pourquoi une école de commerce, pourquoi celle-ci, pourquoi maintenant plutôt qu'après une prépa ou une licence.",
      },
      {
        titre: "Une maturité de discours",
        texte:
          "Parler de soi sans se vanter ni s'excuser. Nommer une difficulté et ce qu'on en a fait.",
      },
      {
        titre: "Un projet en construction, assumé comme tel",
        texte:
          "Deux pistes explorées et documentées valent mieux qu'une certitude récitée.",
      },
    ],
    questions: [
      "Pourquoi une école de commerce après le bac plutôt qu'une prépa ?",
      "Quelles sont vos spécialités, et pourquoi celles-là ?",
      "Racontez-moi une initiative que vous avez prise vous-même.",
      "Quelle actualité économique vous a intéressé récemment ?",
      "Qu'attendez-vous des cinq années à venir ?",
      "Que diraient vos professeurs de vous ?",
    ],
    parcours: [
      {
        titre: "Faire l'inventaire de ce que vous avez déjà vécu",
        texte:
          "Association, sport, job, voyage, projet de classe : on extrait la matière avant de la mettre en récit.",
      },
      {
        titre: "Construire un projet crédible à dix-sept ans",
        texte:
          "Méthode d'exploration : intérêts, métiers, entretiens réseau, programme de l'école.",
      },
      {
        titre: "S'entraîner jusqu'à ne plus réciter",
        texte:
          "Simulations complètes, feedback après chaque entretien, comparaison avec vos propres passages précédents.",
      },
    ],
    differenciants: [
      "Une méthode pensée pour des candidats sans expérience professionnelle.",
      "Un ton exigeant mais factuel : le produit corrige, il ne flatte pas.",
      "Un tarif accessible aux familles : 99 €, 79 € pour les boursiers.",
    ],
    temoignages: [
      {
        quote: "Je récitais. Au bout de la cinquième simulation, je parlais.",
        author: "Sarah",
        detail: "Terminale, concours Sésame",
        placeholder: true,
      },
      {
        quote:
          "Le rapport après chaque entretien reprenait mes phrases exactes. Impossible de se mentir.",
        author: "Adam",
        detail: "Terminale, concours Accès",
        placeholder: true,
      },
    ],
    faq: [
      {
        q: "Faut-il un projet professionnel précis à dix-sept ans ?",
        a: "Non. Le jury attend une démarche : des pistes explorées, des sources, des rencontres. Une certitude non documentée est plus fragile qu'une hésitation argumentée.",
      },
      {
        q: "L'entretien collectif est-il couvert ?",
        a: "La préparation porte sur l'entretien individuel, qui structure le fond du discours. Le fond travaillé sert directement en épreuve collective.",
      },
    ],
  },
  {
    slug: "oraux-pass-las",
    nav: "Oraux PASS · LAS",
    h1: "Préparer les oraux d'admission PASS et LAS",
    title: "Oraux PASS LAS : préparation à l'entretien du second groupe | The Prepboard",
    description:
      "PASS et LAS : préparez l'oral d'admission en santé (MMI, entretien de motivation, communication). Format, critères, simulations illimitées avec feedback. 99 €.",
    chapo:
      "L'oral du second groupe se joue sur des compétences que la première année n'entraîne pas : écouter, structurer sous pression, argumenter une position éthique en trois minutes.",
    publics: ["PASS", "LAS 1, 2 et 3", "Redoublants et réorientations"],
    epreuve: {
      format:
        "Selon l'université : entretiens multiples courts (MMI), entretien de motivation, analyse d'une situation ou d'un texte, épreuve de communication.",
      duree: "Séries de 5 à 10 minutes (MMI) ou entretien unique de 15 à 30 minutes.",
      jury: "Enseignants, soignants, représentants d'usagers, parfois étudiants.",
      coefficient:
        "L'oral détermine l'admission des candidats du second groupe : à ce stade, les écarts de dossier sont minimes.",
      calendrier: "Oraux en juin, après publication des admissibilités.",
    },
    attendus: [
      {
        titre: "Une motivation qui résiste à la question « pourquoi »",
        texte:
          "« Aider les gens » ne suffit pas. Le jury cherche l'origine concrète du choix et sa confrontation au réel.",
      },
      {
        titre: "Le raisonnement éthique",
        texte:
          "Identifier les parties prenantes, poser le conflit de valeurs, trancher et assumer. La méthode compte plus que la conclusion.",
      },
      {
        titre: "La communication soignante",
        texte:
          "Écoute, reformulation, vocabulaire accessible, silences tenus. On évalue la relation, pas la performance.",
      },
      {
        titre: "La connaissance du système de santé",
        texte:
          "Métiers, filières, réalités du terrain : parler de la profession telle qu'elle est, pas telle qu'on l'imagine.",
      },
    ],
    questions: [
      "Pourquoi médecine, et depuis quand exactement ?",
      "Un patient refuse un traitement qui pourrait le sauver. Que faites-vous ?",
      "Quelle qualité vous manque aujourd'hui pour exercer ?",
      "Qu'avez-vous fait pour vérifier que ce métier vous correspondait ?",
      "Comment expliqueriez-vous un diagnostic difficile à un proche du patient ?",
      "Si vous n'êtes pas admis, que faites-vous l'an prochain ?",
    ],
    parcours: [
      {
        titre: "Documenter le choix",
        texte:
          "Stages, bénévolat, lectures, rencontres : on transforme le vécu en preuves utilisables à l'oral.",
      },
      {
        titre: "Méthode de la situation éthique",
        texte:
          "Une grille en quatre temps pour tenir trois minutes sur un dilemme sans se contredire.",
      },
      {
        titre: "Séries d'entretiens courts",
        texte:
          "Enchaîner des formats brefs, contradictoires, minutés : c'est ce qui rapproche le plus des MMI.",
      },
    ],
    differenciants: [
      "Un entraînement au format court, minuté, répété, impossible à obtenir en tutorat à grande échelle.",
      "Un feedback qui cite vos phrases plutôt que de noter une impression.",
      "Une disponibilité totale en période de révisions, y compris la nuit.",
    ],
    temoignages: [
      {
        quote:
          "En MMI, on n'a pas le temps de réfléchir. Il faut avoir déjà pensé. C'est exactement ce que l'entraînement m'a donné.",
        author: "Camille",
        detail: "LAS 2",
        placeholder: true,
      },
      {
        quote: "Je disais « aider les gens » à chaque réponse. On me l'a fait remarquer trois fois.",
        author: "Yanis",
        detail: "PASS",
        placeholder: true,
      },
    ],
    faq: [
      {
        q: "Les formats d'oral varient selon les facultés : est-ce couvert ?",
        a: "Oui. Vous choisissez le format d'entraînement (entretien long ou séries courtes façon MMI) et le niveau d'exigence du jury.",
      },
      {
        q: "Peut-on s'entraîner au raisonnement éthique avec un outil ?",
        a: "The Prepboard ne donne pas la bonne réponse : il vérifie que votre démarche est complète, que vous avez posé le conflit de valeurs et que vous avez tranché.",
      },
    ],
  },
];

export function getConcours(slug: string) {
  return CONCOURS.find((c) => c.slug === slug);
}

export const VS_PREPA = {
  titre: "The Prepboard vs une préparation classique aux oraux",
  lignes: [
    { critere: "Nombre de simulations", prepa: "2 à 4, selon les créneaux disponibles", repetia: "Illimité" },
    { critere: "Coût", prepa: "300 € à 1 500 € selon la formule", repetia: "99 € (79 € boursiers)" },
    { critere: "Disponibilité", prepa: "Créneaux à réserver, en semaine", repetia: "24 h/24, y compris la veille de l'oral" },
    { critere: "Feedback", prepa: "Oral, immédiat, rarement écrit", repetia: "Écrit, chiffré, archivé après chaque oral" },
    { critere: "Progression mesurée", prepa: "Impression du coach", repetia: "Comparaison avec vos oraux précédents et les candidats visant les mêmes écoles" },
    { critere: "Trace du travail", prepa: "Des notes manuscrites", repetia: "Transcripts et rapports exportables en PDF" },
  ],
} as const;

export const VS_CHATBOT = {
  titre: "The Prepboard vs un assistant conversationnel généraliste",
  lignes: [
    { critere: "Connaissance de l'épreuve", chat: "Généraliste, souvent approximative sur les formats", repetia: "Trames et critères construits avec des jurys de concours" },
    { critere: "Format", chat: "Échange écrit, à votre rythme", repetia: "Oral vocal, en temps réel, avec relances et silences" },
    { critere: "Posture", chat: "Complaisant : il valide et encourage", repetia: "Correcteur : il constate, cite, et pointe ce qui manque" },
    { critere: "Mémoire du parcours", chat: "Contexte perdu d'une session à l'autre", repetia: "Votre dossier, vos écoles, vos anecdotes, tous vos oraux passés" },
    { critere: "Évaluation", chat: "Aucune grille stable", repetia: "Grille d'évaluation fixe, verbatims cités, positionnement" },
    { critere: "Pression", chat: "Nulle", repetia: "Conditions du jour J : minuteur, contradiction, jury exigeant" },
  ],
} as const;

export const METHODE_ETAPES = [
  { n: "01", titre: "Votre identité de candidat", texte: "Parcours, écoles visées, calendrier. Tout ce que le jury lira avant de vous voir." },
  { n: "02", titre: "Votre projet professionnel", texte: "Du métier au premier poste : exploration documentée, méthode RIASEC, entretiens réseau." },
  { n: "03", titre: "Vos écoles", texte: "Une fiche par école : programmes, associations, arguments, ce que vous y apportez." },
  { n: "04", titre: "Vos expériences", texte: "Trois anecdotes par expérience, en récit, à la première personne, avec ce que vous avez fait vous." },
  { n: "05", titre: "Votre actualité", texte: "Trois événements datés, sourcés, avec une position défendable sous contradiction." },
  { n: "06", titre: "Les questions classiques", texte: "Une base de questions du jury, avec les attendus, les critères et les pièges de chacune." },
  { n: "07", titre: "L'entretien complet", texte: "Un jury vocal, trois niveaux d'exigence, une évaluation détaillée à la fin." },
] as const;

export const FAQ_GENERALE = [
  {
    q: "Qu'est-ce que The Prepboard ?",
    a: "Une préparation en ligne aux concours, pilotée par l'IA. Les premières préparations disponibles sont les oraux d'admission : un parcours guidé pour construire votre discours, puis des simulations d'entretien vocales illimitées face à un jury construit par des experts, qui rend une évaluation détaillée et vous compare aux autres candidats. Vous gardez par ailleurs accès à tout votre historique de travail.",
  },
  {
    q: "Combien coûte The Prepboard ?",
    a: "99 € pour l'accès complet jusqu'à votre concours, sans limite d'entraînements. 79 € pour les boursiers, sur justificatif.",
  },
  {
    q: "Quels concours sont couverts ?",
    a: "À ce jour, l'oral d'admission de Sciences Po Paris, les oraux des écoles de commerce en voie CPGE, en admission sur titre (AST) et en post-bac, ainsi que les oraux d'admission PASS et LAS. D'autres épreuves arrivent très bientôt.",
  },
  {
    q: "En quoi est-ce différent d'un assistant IA généraliste ?",
    a: "The Prepboard a été construit par des experts de chaque épreuve, qui connaissent les exigences sur le bout des doigts. Vous vous entraînez donc face à un jury expert de votre concours, ce qu'une IA généraliste n'est pas.",
  },
  {
    q: "En quoi est-ce différent d'une prépa privée ?",
    a: "Une préparation classique propose trop peu d'entraînements, une personnalisation quasi absente et un tarif à quatre chiffres une fois les coûts indirects comptés. The Prepboard vous permet de vous entraîner sans limite, avec une personnalisation poussée, à un prix enfin abordable.",
  },
  {
    q: "Mes données personnelles sont-elles en sécurité ?",
    a: "Oui. Vos données et vos entraînements sont hébergés en Europe, chiffrés et accessibles à vous seul depuis votre compte. Ils ne sont ni revendus ni utilisés pour entraîner des modèles, et vous pouvez supprimer un passage ou l'ensemble de votre historique à tout moment.",
  },
  {
    q: "Faut-il un micro particulier ?",
    a: "Non. Un navigateur récent et un casque ou les micros intégrés suffisent : tout se déroule dans le navigateur, sans installation.",
  },
] as const;

/* ------------------------------------------------------- The Prepboard en chiffres */

export const CHIFFRES = [
  { value: "∞", label: "Entraînements personnalisés possibles" },
  { value: "100 %", label: "Personnalisation du travail" },
  { value: "250", label: "Candidats s'entraînent déjà sans limite" },
  { value: "99 €", label: "Un prix unique, 5 à 10 fois moins cher qu'une prépa classique" },
] as const;

/* ------------------------------------------------------ comparatif 3 colonnes */

export const COMPARATIF = {
  colonnes: ["Prépa classique", "IA seule", "The Prepboard"] as const,
  lignes: [
    {
      critere: "Expertise",
      prepa: "Fluctuante",
      ia: "Généraliste, souvent approximative",
      repetia: "Programme construit avec des experts des épreuves et des jurys de concours",
    },
    {
      critere: "Personnalisation",
      prepa: "Un professeur pour vingt candidats en moyenne",
      ia: "Travail individuel, mais sans connaissance du profil",
      repetia: "Entraînement 100 % personnalisé, adapté au profil et à la progression",
    },
    {
      critere: "Nombre d'entraînements",
      prepa: "Limité",
      ia: "Illimité si vous souscrivez un plan payant",
      repetia: "Illimité",
    },
    {
      critere: "Travail guidé",
      prepa: "Dépend de la qualité de l'ingénierie pédagogique",
      ia: "Faible, l'IA n'est pas experte de l'épreuve",
      repetia: "Préparation clé en main, pensée et alimentée par des experts. Laissez-vous guider.",
    },
    {
      critere: "Comparaison aux autres candidats",
      prepa: "Faible, au mieux aux étudiants de la prépa",
      ia: "Absente",
      repetia: "Comparaison aux performances des autres candidats après chaque épreuve",
    },
    {
      critere: "Souplesse",
      prepa: "Quasiment absente",
      ia: "Illimitée si vous souscrivez un plan payant",
      repetia: "Totale, vous travaillez quand vous voulez",
    },
    {
      critere: "Suivi de la progression",
      prepa: "Absent, le volume d'élèves est trop important",
      ia: "Mémoire souvent perdue d'une session à l'autre",
      repetia: "Historique complet, suivi de la progression après chaque entraînement",
    },
    {
      critere: "Prix",
      prepa: "600 € à 2 000 €, hors frais annexes (logement, repas, transports)",
      ia: "Environ 20 € par mois",
      repetia: "99 € (79 € boursiers)",
    },
  ],
} as const;

/* ------------------------------------------------------------- nos épreuves */

export const EPREUVES = [
  { slug: "oraux-ecoles-de-commerce-cpge", titre: "Écoles de commerce CPGE", sous: "Oraux de motivation" },
  { slug: "oraux-ecoles-de-commerce-ast", titre: "Écoles de commerce AST1 & AST2", sous: "Oraux de motivation" },
  { slug: "oraux-ecoles-de-commerce-post-bac", titre: "Écoles de commerce post-bac", sous: "Oraux de motivation Accès et Sésame" },
  { slug: "oral-sciences-po-paris", titre: "Sciences Po Paris", sous: "Oral d'admission" },
  { slug: "oraux-pass-las", titre: "PASS et LAS", sous: "Oraux de première année" },
] as const;

/* -------------------------------------------------------------- témoignages */
/* Verbatims d'exemple, à remplacer par de vrais retours candidats. */

export const TEMOIGNAGES_HOME: readonly Temoignage[] = [
  { quote: "J'ai passé onze entretiens avant l'oral. Le jour J, la seule question qui m'a surprise, je l'avais déjà eue ici.", author: "Lina", detail: "Admise à Sciences Po, campus de Reims", placeholder: true },
  { quote: "Sur mes trois premiers passages, le même reproche revenait : je répondais à côté. Je l'ai vu écrit noir sur blanc.", author: "Clara", detail: "ECG 2, admise à l'ESSEC", placeholder: true },
  { quote: "Ma prépa privée m'offrait deux simulations à 450 €. J'en ai fait dix-neuf ici.", author: "Hugo", detail: "ECT, admis à l'EDHEC", placeholder: true },
  { quote: "Ma césure était mon point faible. Après six entraînements, c'était devenu mon meilleur argument.", author: "Inès", detail: "AST2, admise à emlyon", placeholder: true },
  { quote: "Je récitais. Au bout du cinquième passage, je parlais.", author: "Sarah", detail: "Terminale, concours Sésame", placeholder: true },
  { quote: "En MMI, on n'a pas le temps de réfléchir, il faut avoir déjà pensé. C'est exactement ce que l'entraînement m'a donné.", author: "Camille", detail: "LAS 2", placeholder: true },
  { quote: "Le rapport reprenait mes phrases exactes. Impossible de se mentir.", author: "Adam", detail: "Terminale, concours Accès", placeholder: true },
  { quote: "Je préparais l'oral seul depuis ma L3. Là, j'avais enfin quelqu'un en face.", author: "Théo", detail: "AST1, Bachelor", placeholder: true },
  { quote: "Je disais « aider les gens » à chaque réponse. On me l'a fait remarquer trois fois.", author: "Yanis", detail: "PASS", placeholder: true },
  { quote: "Voir ma position par rapport aux autres candidats m'a fait comprendre où je devais bosser.", author: "Marion", detail: "ECG 2, admise à l'EM Lyon", placeholder: true },
] as const;
