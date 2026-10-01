/**
 * Base de connaissance « Les supports de l'entretien » (module 6).
 * Source : chapitre 5 de l'ouvrage - questionnaires des écoles + CV projectif de SKEMA.
 * Les libellés d'écoles reprennent EXACTEMENT les noms de SCHOOLS (vivaldi-data.ts).
 */
import type { TheorySection } from "./theory";

export type SupportQuestion = {
  id: string;
  /** Intitulé exact de la question du questionnaire. */
  label: string;
  /** Espace réel laissé par l'école, pour calibrer la longueur de la réponse. */
  space?: string;
  /** Conseils issus de l'ouvrage : c'est la grille de lecture du jury IA. */
  advice: string;
};

export type SupportSchool = {
  school: string;
  intro: string;
  questions: SupportQuestion[];
};

/** Principes communs à tous les supports : ils servent aussi de grille au jury IA. */
export const SUPPORT_PRINCIPLES = [
  "Le support est le premier contact avec le jury : la forme (orthographe, phrases complètes, propreté) pèse autant que le fond. « La forme est le fond qui remonte à la surface. »",
  "L'objectif n'est jamais d'être exhaustif ni trop précis : on tend des perches, on suscite la curiosité du jury. Trop de précision lui enlève l'envie de vous interroger.",
  "Chaque réponse doit être contextualisée (quand, combien de temps, où, quel rôle, quel niveau) et hiérarchisée : l'essentiel d'abord.",
  "On doit pouvoir parler de tout ce qui est écrit : ne citez que des éléments que vous maîtrisez et sur lesquels vous acceptez d'être questionné.",
  "On varie les expériences citées d'une question à l'autre : jamais deux fois la même sous un angle différent.",
  "Les réponses sur l'école exigent des recherches réelles (masters, associations, échanges, entreprises partenaires) : reprenez vos fiches écoles du module 3.",
  "Le questionnaire se remplit à la main en trois exemplaires minimum (ou en ligne quand l'école l'impose, comme NEOMA), et jamais la veille de l'oral.",
];

export const SUPPORT_SCHOOLS: SupportSchool[] = [
  {
    school: "ESCP",
    intro:
      "L'ESCP décode elle-même son questionnaire : « L'épreuve d'entretien doit permettre au jury de découvrir votre personnalité. ESCP ne recherche pas un profil en particulier mais est attentive aux personnes ouvertes, curieuses, imaginatives et sachant communiquer leurs centres d'intérêt. Soyez bref/brève dans le questionnaire lui-même. » Particularité : presque toutes les questions demandent des expériences - attention aux répétitions, visez un panel large et divers.",
    questions: [
      {
        id: "escp-1",
        label: "Quels sont vos centres d'intérêt ou activités extrascolaires ? Soyez concis(e) et précis(e).",
        advice:
          "Trois éléments maximum, sinon le jury s'engouffre dans l'anecdotique. Contextualisez chacun : depuis combien de temps, quelle fréquence, compétitions, titres, capitanat. Variez : ne parlez pas que de sports.",
      },
      {
        id: "escp-2",
        label: "Citez un projet, une réalisation ou une prise de responsabilités dont vous êtes fier/fière.",
        advice:
          "Une seule expérience, aboutie ou non, qui montre engagement ou capacité d'adaptation - et si possible l'une des qualités citées par l'école (ouverture, curiosité, imagination, communication). Structure : citation de l'expérience + quelques mots de contextualisation + une perche vers ce que vous en tirez (une perche, pas un développement).",
      },
      {
        id: "escp-3",
        label: "Avez-vous déjà travaillé, quelle expérience avez-vous du monde du travail ?",
        advice:
          "Stages, jobs ponctuels, rencontres marquantes, visites d'entreprise comptent. N'en citez pas trop : hiérarchisez et mettez en valeur la principale par une formule du type « mon expérience la plus importante… ». Une phrase de contextualisation factuelle maximum par expérience (lieu, durée, mission).",
      },
      {
        id: "escp-4",
        label: "Quelles sont vos expériences de différentes cultures ?",
        advice:
          "Les voyages ne sont pas la seule réponse : travaux scolaires, rencontres, expositions, lectures ouvrent le champ. Choisissez avec soin et gardez le reste en back-up pour l'échange oral.",
      },
      {
        id: "escp-5",
        label: "Décrivez une expérience marquante. Que vous a-t-elle appris sur vous-même ?",
        advice:
          "Une seule expérience, et une réponse scindée en deux : annonce/description, puis prise de recul. Ne répétez pas une expérience déjà citée plus haut.",
      },
      {
        id: "escp-6",
        label: "Quelles autres informations souhaitez-vous communiquer au jury ?",
        advice:
          "Profitez de la seule question qui ne porte pas sur une expérience pour diversifier : atouts de l'ESCP à vos yeux, projets que vous voulez y mener, projet professionnel, ou un élément surprenant dont le jury se souviendra.",
      },
    ],
  },
  {
    school: "NEOMA",
    intro:
      "Questionnaire de personnalité à remplir en ligne sur le site des admissibles : il est imprimé par l'école et remis aux jurys, et sert de trame à tout l'entretien. Contrainte majeure : 400 caractères par réponse. Chaque mot compte - on hiérarchise, on contextualise en quelques mots, et on tend des perches plutôt que de tout dire.",
    questions: [
      {
        id: "neoma-1",
        label:
          "De quelle action / réalisation individuelle ou au sein d'une organisation (association, entreprise, club de sport…) êtes-vous le plus fier ? Pourquoi ?",
        space: "400 caractères",
        advice:
          "Une seule réalisation, et de préférence menée en équipe : l'école travaille énormément en groupe et le jury cherche à vérifier que vous vous y intégrerez. Structure en deux temps : la réalisation contextualisée (quand, où, votre rôle, le résultat) puis le « pourquoi » - la fierté vient d'un aboutissement, d'un obstacle franchi ou d'une qualité développée. Ne dévoilez pas tout : le détail se garde pour l'oral.",
      },
      {
        id: "neoma-2",
        label: "Quelle contribution pensez-vous apporter à notre École si vous l'intégrez ?",
        space: "400 caractères",
        advice:
          "Impossible à traiter sans recherches précises : reprenez votre fiche NEOMA du module 3. Citez une ou deux associations ou projets réellement existants (ou une création d'association / d'entreprise) et l'image que vous en avez, sans les décrire longuement. Restez volontairement succinct : l'objectif est que le jury vous relance pour que vous montriez à l'oral votre connaissance de l'école.",
      },
      {
        id: "neoma-3",
        label: "Qu'attendez-vous du Programme Grande École de NEOMA ?",
        space: "400 caractères",
        advice:
          "C'est le « pourquoi notre école ? » côté académique. Hiérarchisez : commencez par les spécialisations ou masters qui servent votre projet professionnel, puis les parcours (double diplôme, international, incubateur, partenariats). Nommez précisément, mais n'expliquez pas tout : gardez le développement pour l'échange. Ne répétez pas la question sur la contribution.",
      },
      {
        id: "neoma-4",
        label: "Qu'attendez-vous d'une expérience internationale ? Quelles zones géographiques ou quelles cultures vous attirent en particulier ?",
        space: "400 caractères",
        advice:
          "Deux temps : ce que vous en attendez (apports personnels et professionnels), puis une zone ou une culture nommée et justifiée - langue, expérience déjà vécue, secteur, projet. Appuyez-vous sur les échanges, doubles diplômes, stages à l'international ou VIE réellement possibles à NEOMA. Une ambition franco-française est acceptable si elle est assumée et justifiée.",
      },
      {
        id: "neoma-5",
        label: "Avez-vous déjà fait preuve d'innovation ou de créativité ? À quelle occasion ?",
        space: "400 caractères",
        advice:
          "Une seule occasion, différente de celle de la question 1. La créativité n'est pas réservée à l'artistique : une organisation repensée, un mode de financement trouvé, une communication inventée, une solution bricolée comptent. Dites concrètement ce qui était nouveau et le résultat obtenu.",
      },
      {
        id: "neoma-6",
        label: "Qu'appréciez-vous le plus, et le moins, dans le travail en équipe ?",
        space: "400 caractères",
        advice:
          "Répondez bien aux deux volets, le « moins » compris : c'est une question déguisée sur vos qualités et vos limites. Positionnez-vous clairement (moteur, leader, organisateur, suiveur constructif) en vous appuyant sur une situation vécue, et dites avec quels profils vous aimez travailler - la diversité des profils est un bon angle. Restez honnête sur ce que vous appréciez le moins, en montrant comment vous le gérez.",
      },
    ],
  },
  {
    school: "Rennes School of Business",
    intro:
      "Édition antérieure, à confirmer pour le cycle actuel : ce questionnaire n'a pas été retrouvé dans la version actuelle du format « PUMA » de l'école - traitez-le comme un entraînement, pas comme le document officiel du cycle en cours. Questionnaire prépa en trois parties : Activités, Expériences, Projet professionnel. L'espace est très réduit sur les premières questions : chaque mot compte.",

    questions: [
      {
        id: "rennes-1",
        label: "Activités associatives (précisez lesquelles).",
        space: "1,5 ligne",
        advice:
          "Nom de l'association, votre rôle, et la durée si la place le permet. Ne pas préciser l'objectif de l'association peut être une manière d'attirer la question du jury.",
      },
      {
        id: "rennes-2",
        label: "Loisirs et sports.",
        space: "moins d'une ligne",
        advice: "Uniquement la nature et la durée des activités pratiquées.",
      },
      {
        id: "rennes-3",
        label: "Séjours / vacances à l'étranger (précisez les pays, l'année, la durée).",
        space: "2 lignes",
        advice:
          "L'école donne les éléments attendus : donnez-les tous, et si vous pouvez, précisez le type de séjour (touristique, linguistique, seul, en famille, entre amis).",
      },
      {
        id: "rennes-4",
        label: "Avez-vous eu une expérience marquante ? Si oui, laquelle ?",
        space: "2 lignes",
        advice:
          "Le jury reviendra forcément dessus : choisissez-la avec soin. Décrivez-la rapidement et dites en quelques mots en quoi elle a été importante. Suscitez la curiosité.",
      },
      {
        id: "rennes-5",
        label: "Expériences professionnelles.",
        advice:
          "Listez-les en les contextualisant rapidement ; les phrases complètes ne sont pas obligatoires vu l'espace. Un stage de 3e ou une expérience non rémunérée compte.",
      },
      {
        id: "rennes-6",
        label: "Avez-vous un projet professionnel ? Si oui, lequel ?",
        advice:
          "Vous pouvez être incertain, mais vous ne pouvez pas répondre « non ». Citez les appétences qui vous amènent en école de commerce : métiers, domaines de métiers et/ou secteurs d'activité.",
      },
      {
        id: "rennes-7",
        label: "Où vous voyez-vous dans 5 ans ? Dans 10 ans ?",
        advice: "Une phrase par horizon, pas d'exhaustivité. Appuyez-vous sur les questions clés du module 7.",
      },
      {
        id: "rennes-8",
        label: "Précisez en quelques mots vos motivations pour Rennes School of Business.",
        advice:
          "C'est « pourquoi notre école ? » : soyez très concret et hiérarchisez. Commencez par le programme académique et les spécialisations, finissez par les éléments importants mais moins essentiels (association, université partenaire).",
      },
    ],
  },
  {
    school: "ICN Business School",
    intro:
      "Édition antérieure, à confirmer pour le cycle actuel : les informations récentes sur l'entretien de l'ICN mentionnent un CV transmis en amont plutôt qu'un questionnaire - traitez ces questions comme un entraînement, pas comme le document officiel du cycle en cours. Trois axes : dimension personnelle, dimension internationale, dimension professionnelle. Une bonne moitié des questions exige de connaître les opportunités associatives, internationales et académiques de l'ICN.",

    questions: [
      {
        id: "icn-1",
        label: "Selon votre entourage, quels sont vos principaux traits de caractère ?",
        advice:
          "Vos principales qualités, avec des perches vers les expériences où elles se manifestent. Inutile d'introduire un défaut : la question 2 s'en charge.",
      },
      {
        id: "icn-2",
        label: "Quel trait de votre personnalité souhaiteriez-vous améliorer, le cas échéant ?",
        advice: "Votre défaut principal, en commençant à dire concrètement comment vous tentez de l'améliorer.",
      },
      {
        id: "icn-3",
        label: "Quels sont vos centres d'intérêt et vos principaux loisirs ?",
        advice:
          "Trois ou quatre hobbies principaux, variés (pas uniquement des sports). Inutile d'énoncer les qualités développées grâce à eux.",
      },
      {
        id: "icn-4",
        label:
          "Avez-vous déjà voyagé à l'étranger ? Si oui, dans quel(s) pays et à quelle(s) occasion(s) ? (séjour linguistique, tourisme, activité professionnelle…)",
        advice: "Listez et hiérarchisez vos expériences internationales, en variant les types de voyages.",
      },
      {
        id: "icn-5",
        label: "À ICN, les opportunités d'expériences internationales sont multiples. Qu'envisagez-vous de réaliser dans ce domaine ?",
        advice:
          "Échanges universitaires, doubles diplômes, stages à l'étranger dans des entreprises partenaires, voyages associatifs ou humanitaires : voyez large et nommez précisément.",
      },
      {
        id: "icn-6",
        label: "Parlez-nous d'une expérience dans laquelle vous vous êtes investi et dont vous êtes particulièrement fier.",
        advice:
          "Ne répétez pas la question 3. Décrivez l'expérience, puis consacrez la dernière phrase à ce que vous en avez retiré.",
      },
      {
        id: "icn-7",
        label: "Dans le cadre de vos études à ICN, quel engagement associatif pourrait vous intéresser ?",
        advice:
          "Nommez une association réellement proposée par l'ICN et justifiez votre choix en quelques mots, en tendant des perches vers vos passions, expériences ou projets.",
      },
      {
        id: "icn-8",
        label: "À ICN, quels enseignements ou activités pourraient nourrir vos ambitions ?",
        advice:
          "Partez de vos envies, puis listez les cours, parcours, projets associatifs, échanges et entreprises partenaires de l'ICN qui vous donnent les clés - et dites explicitement quelles ambitions ils éclairent.",
      },
    ],
  },
  {
    school: "EM Strasbourg",
    intro:
      "Support spécifique : une « cartographie » de projection dans le programme, à compléter année par année (PGE1 à PGE5) avant l'oral. Ce n'est pas un questionnaire de personnalité mais une preuve de recherches réelles : chaque case doit citer des enseignements, associations, entreprises et destinations qui existent vraiment. Le jury s'en sert pour l'échange central de l'entretien : tout ce que vous nommez peut être creusé.",
    questions: [
      {
        id: "emstrasbourg-1",
        label: "PGE1 : 3 enseignements électifs, choix d'association, entreprise de stage rêvée, LV2/LV3.",
        advice:
          "Nommez précisément trois électifs existants et dites en quelques mots ce que chacun sert dans votre projet. Pour l'association, une seule, avec le rôle que vous viseriez. L'entreprise de stage doit être cohérente avec le secteur que vous visez, pas un nom prestigieux au hasard. Les langues se justifient par un usage (zone géographique, secteur, mobilité).",
      },
      {
        id: "emstrasbourg-2",
        label: "PGE2 : mêmes rubriques (électifs, association, entreprise de stage, langues).",
        advice:
          "Montrez une progression plutôt qu'une répétition : électifs plus spécialisés, responsabilité associative plus lourde, stage plus exigeant que celui de PGE1. Variez les exemples cités en PGE1 - la cartographie se lit comme une trajectoire, pas comme deux colonnes identiques.",
      },
      {
        id: "emstrasbourg-3",
        label: "PGE3 : mobilité internationale (sur place ou à l'étranger), stage international.",
        advice:
          "Tranchez : une destination nommée, une université partenaire réelle, et la raison (langue, secteur, culture, projet). Le stage international se justifie de la même manière. Si vous choisissez de rester sur place, assumez-le et expliquez ce que l'international « à Strasbourg » vous apporte - c'est un choix défendable si vous le motivez.",
      },
      {
        id: "emstrasbourg-4",
        label: "PGE4 : immersion entreprise intensive ou parcours flexible, majeure si immersion.",
        advice:
          "Le jury attend un choix, pas une hésitation : dites lequel des deux parcours et pourquoi, en une phrase liée à votre projet professionnel. Si vous choisissez l'immersion, nommez la majeure et dites ce qu'elle vous ouvre. Ne cochez jamais les deux options « au cas où ».",
      },
      {
        id: "emstrasbourg-5",
        label:
          "PGE5 : spécialisation parmi 6 si immersion, ou choix entre spécialisation / double diplôme / année à l'étranger si flexible.",
        advice:
          "C'est l'année qui révèle la cohérence de tout le reste : la spécialisation ou le double diplôme cité doit conduire au premier poste que vous visez. Nommez-le explicitement en fin de cartographie, même brièvement : c'est la perche la plus rentable de tout le document.",
      },
    ],
  },
  {
    school: "EM Normandie",
    intro:
      "Dossier de motivation en 8 questions à compléter avant l'oral. Il sert de trame à l'échange central : le jury reprend vos réponses une à une. Deux particularités - une question de synthèse en une seule phrase, et une dernière question posée en anglais, à laquelle on répond en anglais.",
    questions: [
      {
        id: "emnormandie-1",
        label: "Quel parcours souhaitez-vous suivre à l'EM Normandie et pourquoi ?",
        advice:
          "Impossible à traiter sans recherches : nommez un ou deux masters ou parcours réellement proposés, et le campus si votre choix est arrêté. Le « pourquoi » se relie à votre projet professionnel, pas à la réputation de l'école. Restez court : le jury doit avoir envie de vous faire développer.",
      },
      {
        id: "emnormandie-2",
        label: "Décrivez une expérience à l'étranger que vous avez vécue ou que vous aimeriez vivre ?",
        advice:
          "Une seule expérience, contextualisée (où, quand, combien de temps, avec qui, dans quel cadre). Si vous n'avez pas voyagé, l'option projetée est pleinement légitime : nommez une destination et une raison précise. Terminez par ce que vous en avez tiré ou en attendez, en une phrase.",
      },
      {
        id: "emnormandie-3",
        label: "Quels sont vos centres d'intérêts ? Par quoi êtes-vous motivé(e) ?",
        advice:
          "Trois centres d'intérêt maximum, chacun contextualisé en quelques mots (depuis quand, quelle fréquence, quel niveau). Variez les registres plutôt que d'empiler trois sports. Le « par quoi êtes-vous motivé » est une question sur vos moteurs : répondez-y explicitement, ne la laissez pas absorber par la liste.",
      },
      {
        id: "emnormandie-4",
        label: "Avez-vous une idée de projet professionnel et/ou personnel ? Si oui, quels sont-ils ?",
        advice:
          "Un secteur, une fonction, un type de structure valent mieux qu'un intitulé de poste vague. Une hésitation entre deux voies est acceptable si elle est nommée et argumentée. Reliez le projet au parcours cité en question 1 : c'est la cohérence que le jury vérifie.",
      },
      {
        id: "emnormandie-5",
        label: "Que pensez-vous apporter à la vie de l'École ? Quel(s) type(s) de projet(s) ?",
        advice:
          "Citez une ou deux associations ou projets qui existent réellement à l'EM Normandie, et le rôle que vous y prendriez, en vous appuyant sur une expérience déjà vécue - c'est ce qui rend la promesse crédible. Ne décrivez pas l'association : le jury la connaît.",
      },
      {
        id: "emnormandie-6",
        label: "Qu'attendez-vous de l'EM Normandie ?",
        advice:
          "Ne redites pas la question 1 : passez ici de l'académique à l'humain et à l'environnement (réseau, campus, international, accompagnement, ancrage territorial). Hiérarchisez : une attente principale, une ou deux secondaires.",
      },
      {
        id: "emnormandie-7",
        label: "Décrivez-vous en une phrase :",
        advice:
          "Une phrase réellement, et une phrase que vous saurez défendre : elle sera la première relance du jury. Deux ou trois qualités adossées à un fait, plutôt qu'une formule publicitaire. Évitez l'humour à risque et les superlatifs.",
      },
      {
        id: "emnormandie-8",
        label: 'What does "thinking outside of the box" mean to you?',
        advice:
          "Répondez en anglais, en phrases simples et correctes : la maîtrise passe avant l'élégance. Donnez une définition personnelle en une phrase, puis un exemple vécu très bref - une organisation repensée, une solution trouvée avec peu de moyens. Préparez-vous à ce que le jury poursuive en anglais.",
      },
    ],
  },
  {
    school: "BSB (Burgundy School of Business)",
    intro:
      "Support spécifique appelé « Student's Path » (« De mon 1er jour à BSB, à mon 1er job »), manuscrit et remis en trois exemplaires avant l'entretien. Il oriente environ 80 % des questions du jury : tout ce que vous y écrivez sera creusé, et rien de ce que vous n'y écrivez pas ne sera abordé spontanément. Six rubriques, à traiter comme un récit continu plutôt que comme un formulaire.",
    questions: [
      {
        id: "bsb-1",
        label: "Ce que mon entourage (famille, amis) dit de moi",
        advice:
          "Deux ou trois traits, rapportés comme des paroles réelles et non comme un autoportrait flatteur. Adossez chacun à une situation où votre entourage l'a constaté. Un trait légèrement inconfortable mais assumé rend l'ensemble crédible.",
      },
      {
        id: "bsb-2",
        label: "Ce que j'aime faire, ce qui m'anime",
        advice:
          "Distinguez les deux : ce que vous faites (activités, contextualisées en quelques mots) et ce qui vous met en mouvement (transmettre, organiser, créer, convaincre). C'est la rubrique où le jury cherche votre énergie : soyez concret, pas lyrique.",
      },
      {
        id: "bsb-3",
        label: "Mes qualités, mes valeurs",
        advice:
          "Trois qualités maximum, chacune prouvée par un fait bref, et deux valeurs que vous saurez défendre si le jury les met à l'épreuve. Évitez les mots creux (« rigueur », « motivation ») sans exemple derrière : ils appellent une relance que vous ne pourrez pas soutenir.",
      },
      {
        id: "bsb-4",
        label: "Mon chemin à BSB : académique, associatif, international, professionnel",
        advice:
          "La rubrique la plus exigeante en recherches : un ou deux éléments nommés par volet (majeure ou master, association réelle, destination ou double diplôme, type de stage ou d'alternance). Montrez une progression d'année en année et laissez volontairement des zones à creuser plutôt que de tout détailler.",
      },
      {
        id: "bsb-5",
        label: "Ce que BSB va m'apporter",
        advice:
          "Répondez au « pourquoi cette école » sans flatterie : ce que l'école apporte doit combler un manque identifié ou servir un projet nommé. Une attente académique, une humaine, et évitez les arguments valables pour n'importe quelle école du concours.",
      },
      {
        id: "bsb-6",
        label: "Ma vie professionnelle et personnelle après BSB",
        advice:
          "C'est la fin du récit : elle doit être la conséquence logique de la rubrique 4. Secteur, fonction, type de structure, éventuellement pays. Le volet personnel est autorisé et souvent apprécié (équilibre, ancrage, engagements) à condition de rester sobre.",
      },
    ],
  },
];


export const PROJECTIVE_CV_SCHOOL = "SKEMA";

/** Exigences du CV projectif de SKEMA BS (jury IA + consignes affichées). */
export const PROJECTIVE_CV = {
  intro:
    "SKEMA BS ne demande pas un questionnaire mais un CV projectif : un CV dans lequel vous racontez votre parcours tel que vous l'imaginez au sein de SKEMA puis dans les dix années qui suivent votre diplôme. Les éléments futurs doivent se distinguer visuellement des éléments réels (couleur particulière). C'est un exercice à faire même pour les autres écoles : il force à travailler la précision de votre projet.",
  rules: [
    "Obsession du « pourquoi » : avant d'inscrire un élément projectif, soyez certain de pouvoir répondre « pourquoi souhaitez-vous vivre / faire cela ? ». La grande majorité des questions du jury commencent par « pourquoi ».",
    "Cohérence du parcours : les cours et spécialisations doivent coller aux métiers cités, la progression des stages et emplois doit être crédible (on ne passe pas d'assistant chef de projet à directeur marketing), et les métiers doivent coller à la personnalité que vous défendez à l'oral.",
    "Gardez des expériences passées réelles : un CV 100 % projectif vous prive des perches que vous maîtrisez le mieux et enferme l'entretien hors de votre zone de confort.",
    "Sous chaque métier cité, mettez des missions précises : c'est ce qui prouve que vous vous êtes renseigné et vous permet d'en parler intelligemment.",
    "SKEMA insiste sur l'international : un CV uniquement français n'est pas éliminatoire mais sera fortement questionné.",
    "Cohérence géographique et académique : ne citez pas un master ou une association qui n'existe pas sur le campus visé, ni une langue sans expérience dans un pays qui la parle. Respectez aussi la structure réelle des études à SKEMA (pas de stage de 6 mois dès la rentrée).",
    "Un CV a toujours un titre : le vôtre est votre poste « en cours » à la fin des dix ans.",
    "Coordonnées projetées : email professionnel (plus de @gmail.com), téléphone et adresse du pays où vous exercez.",
    "Sachez parler de tous les noms propres et sujets connexes cités (entreprise, secteur, ville, pays, personnage) : anticipez chaque question possible.",
    "Hésitation entre deux projets : montrez-la sur les deux stages de césure (deux options différentes), puis tranchez pour la spécialisation de master et le premier poste, en justifiant votre choix.",
  ],
  sections: [
    "Titre : le poste occupé au terme des 10 ans",
    "Identité et coordonnées projetées (âge, ville, pays, email pro, téléphone)",
    "Formation : prépa, puis parcours SKEMA détaillé (campus, master, césures) et éventuels doubles diplômes",
    "Parcours professionnel : du stage de césure au poste actuel, chaque poste avec entreprise, lieu, dates et 2-3 missions précises",
    "Langues et compétences",
    "Vie associative (réelle et projetée en école)",
    "Informations complémentaires : sports, engagements, voyages, centres d'intérêt",
  ],
};

export const SUPPORTS_THEORY_SECTIONS: TheorySection[] = [
  {
    title: "Pourquoi le support est décisif",
    points: [
      "C'est le premier contact avec le jury : il dresse votre « portrait-robot » avant même de vous voir.",
      "Un jury qui notait la forme et le fond des supports avant de recevoir les candidats n'a jamais bougé sa note finale de plus de deux points.",
      "Le support sert de réservoir de questions au jury quand un sujet est épuisé : vos réponses sont les perches que vous lui tendez.",
    ],
  },
  {
    title: "Les règles de forme",
    points: [
      "Zéro faute, zéro rature, phrases complètes dans la plupart des cas.",
      "Remplissage manuscrit (sauf le CV projectif et les questionnaires en ligne comme NEOMA), un exemplaire par membre du jury, trois minimum.",
      "Ne jamais le remplir la veille ou dans le train : certaines écoles imposent un envoi en ligne bien avant l'oral.",
    ],
  },
  {
    title: "Les règles de fond",
    points: [
      "Ne cherchez jamais l'exhaustivité : la trop grande précision décourage le jury de vous questionner. Gardez le détail pour l'oral.",
      "Contextualisez (quand, où, combien de temps, quel rôle) et hiérarchisez vos réponses.",
      "Variez les expériences citées d'une question à l'autre, et sachez parler de tout ce que vous écrivez.",
      "Les questions sur l'école supposent des recherches réelles : appuyez-vous sur vos fiches écoles.",
    ],
  },
  {
    title: "Le CV projectif de SKEMA",
    points: PROJECTIVE_CV.rules.slice(0, 6),
  },
  {
    title: "Comment travailler vos supports ici",
    points: [
      "Seules les écoles que vous présentez et qui demandent un support apparaissent dans ce module : modifiez vos écoles dans le module 1 si la liste vous semble incomplète.",
      "The Prepboard ne vérifie pas l'exactitude de ce que vous écrivez : le jury IA évalue le respect des attendus de l'école, la précision, le calibrage et les perches tendues.",
      "Travaillez le contenu ici, puis reportez-le sur le support de l'école (manuscrit ou formulaire en ligne) le moment venu.",
    ],
  },
];


export function supportForSchool(school: string) {
  return SUPPORT_SCHOOLS.find((s) => s.school === school) ?? null;
}

/** Écoles concernées par un support (questionnaire ou CV projectif). */
export const SUPPORT_SCHOOL_NAMES = [...SUPPORT_SCHOOLS.map((s) => s.school), PROJECTIVE_CV_SCHOOL];
