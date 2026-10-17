/* Source unique de la méthode des modules 1 à 4.
 * Ces chapitres alimentent À LA FOIS le bouton « À lire avant de commencer » des modules
 * (via theory.ts) et la page Ressources théoriques. Reformulation pédagogique de la
 * méthode des livres : aucune reprise mot pour mot. */

export type ResourceLink = "/partie-2" | "/partie-3" | "/partie-4" | "/partie-5" | "/partie-6" | "/partie-7" | "/partie-8";

export type ResourceSection = {
  id: string;
  title: string;
  keywords: string[];
  /** Phrase d'accroche : l'idée à retenir si on ne lit qu'une ligne. */
  lead?: string;
  /** Petit libellé au-dessus du titre (ex. thème d'une question). */
  group?: string;
  body?: string[];
  /** Liste à puces simple. */
  points?: string[];
  faire?: string[];
  eviter?: string[];
  faireLabel?: string;
  eviterLabel?: string;
  exemple?: string;
};

export type Chapter = {
  id: string;
  title: string;
  intro: string;
  link?: { to: ResourceLink; label: string };
  sections: ResourceSection[];
};

export const METHODE_PROJET: Chapter = {
  id: "projet",
  title: "Le projet professionnel",
  intro:
    "Le fil rouge de l'entretien. Il relie trois éléments : vous, les métiers visés et ce que l'école vous apportera. Il se construit en quatre étapes : se connaître, comprendre le métier, définir le rôle de l'école, puis formuler le projet.",
  link: { to: "/partie-2", label: "Travailler mon projet pro" },
  sections: [
    {
      id: "projet-attentes",
      title: "Ce que le jury attend vraiment",
      keywords: ["pistes", "doute", "pas de projet", "employabilité", "insertion", "réaliste", "cohérence"],
      lead: "Une piste argumentée, qui vous ressemble et que l'école peut servir. Pas un contrat signé.",
      body: [
        "Hésiter entre plusieurs voies, ou craindre de changer d'avis, est normal : à votre âge, on ne connaît pas encore assez les métiers pour trancher. C'est même la raison d'être de l'école. Parlez donc de « pistes professionnelles ».",
        "« Je n'ai aucune idée » ne tient pas en revanche : quelques heures sur les débouchés d'une école de commerce suffisent pour trouver au moins une direction qui attire.",
        "Le jury pose la question pour deux raisons. C'est naturel quand on veut connaître quelqu'un. Et l'école est jugée sur l'insertion de ses diplômés : cours, stages, échanges et associations ne sont que des moyens au service d'un premier emploi. Vous visez donc le même objectif qu'elle.",
        "Il vérifie trois choses : vous connaissez les métiers auxquels l'école prépare, votre piste est réaliste, et elle vous ressemble assez pour convaincre un futur recruteur.",
      ],
      eviter: [
        "Un secteur qui a ses propres écoles spécialisées (hôtellerie, sport, communication, assurance) sans savoir dire pourquoi passer par une école généraliste : la question tombera à coup sûr.",
        "Un projet si étroit qu'il ne laisse aucune alternative, ou un métier qui disparaît.",
        "Un projet en décalage avec votre profil, par exemple un métier très relationnel avec un parcours fait d'activités solitaires. Allez alors chercher des expériences qui rassurent.",
      ],
    },
    {
      id: "projet-soi",
      title: "Étape 1 · Partir de soi",
      keywords: ["qualités", "défauts", "inventaire", "personnalité", "petits jobs", "baby-sitting", "origine", "motivation"],
      lead: "Vous ne pouvez pas tout savoir des métiers, mais vous vous connaissez. C'est ce point de départ qui rend le projet crédible.",
      body: [
        "Recensez toutes vos expériences sans tri, puis cherchez ce qui a motivé chaque choix, ce qui vous a plu et ce que vous avez fui. Le projet apparaît par accumulation de petits indices : ne négligez rien.",
        "Questionnez chaque registre. En sport : collectif ou individuel, endurance ou explosivité, compétiteur ou capitaine ? En association : tourné vers les autres, vers une cause, vers la technique ? En voyage : explorateur ou organisateur ? Et les jobs ou stages, les plus proches de votre futur quotidien.",
        "Les expériences jugées modestes parlent souvent le plus : garder des enfants suppose d'inspirer confiance aux parents, d'animer, d'être patient et d'avoir un peu d'autorité.",
        "Notez précisément l'origine de votre intérêt : une rencontre, un stage, une lecture, une matière. Un projet qui vient de quelque part est un projet vivant.",
        "Pensez aussi au cadre qui vous convient : grand groupe, PME, start-up, cabinet, rythme de vie. Et à ce qui vous déplaît ou vous fait douter : un projet nuancé est plus solide qu'un projet parfait.",
      ],
      faire: [
        "Retenir les qualités qui reviennent dans plusieurs expériences, preuves à l'appui.",
        "Relier explicitement un trait au métier : « la rigueur revient dans toutes mes expériences, et elle est indispensable en audit ».",
        "Pour chaque qualité demandée par le métier, noter l'expérience qui prouve que vous l'avez déjà mobilisée : ce travail resservira au module 3.",
      ],
      eviter: ["Aligner les qualités que l'on aimerait avoir plutôt que celles que l'on a vraiment."],
    },
    {
      id: "projet-metier",
      title: "Étape 2 · Comprendre le métier",
      keywords: ["métier", "professionnels", "linkedin", "réseau", "journée type", "offres d'emploi", "onisep", "rôle"],
      lead: "Lire sur un métier ne suffit pas : il faut en parler avec ceux qui l'exercent.",
      body: [
        "Commencez par les ressources documentaires : portails métiers, Onisep, et surtout de vraies offres d'emploi, qui listent missions et compétences attendues.",
        "Pour le ou les deux métiers qui vous attirent vraiment, échangez avec des professionnels. Eux seuls vous diront le poids réel de chaque mission dans la journée, la semaine, l'année, et ce que cache une compétence affichée : négocier avec un fournisseur n'a rien à voir avec vendre à la grande distribution.",
        "Vous devez pouvoir décrire le rôle réel : à qui l'on parle au quotidien, ce que l'on produit, avec quels outils. Ne pas connaître l'intitulé exact d'un poste n'est pas grave ; ne pas savoir décrire une journée de travail l'est.",
        "« D'après les échanges que j'ai eus avec… » distingue immédiatement un candidat : très peu le font. Si la personne est diplômée de l'école visée, l'effet est encore plus fort.",
        "Gardez une actualité récente du domaine sous la main : elle montre un intérêt actuel, pas scolaire.",
      ],
      faire: [
        "Commencer par l'entourage, puis LinkedIn avec un profil soigné.",
        "Chercher en croisant l'intitulé précis du poste et le nom de l'école visée.",
        "Écrire un message bref : qui vous êtes, l'oral qui approche, la demande de quelques minutes d'échange téléphonique.",
        "Demander un conseil plutôt qu'un service, remercier, relancer avec tact, donner des nouvelles de vos résultats.",
        "S'y prendre tôt : il faut beaucoup de demandes, souvent une relance, pour obtenir quelques réponses.",
      ],
      exemple:
        "« En échangeant avec une contrôleuse de gestion dans l'agroalimentaire, j'ai compris que la moitié de son temps se passe avec les équipes de production. C'est ce qui m'a convaincu : je veux un métier de chiffres au contact du terrain. »",
    },
    {
      id: "projet-ecole",
      title: "Étape 3 · Le rôle de l'école",
      keywords: ["master", "cours", "syllabus", "400 heures", "spécialisation", "enseignement", "professeurs", "maquette"],
      lead: "Montrez ce que cette école précise apporte à votre piste, en commençant par ses enseignements.",
      body: [
        "L'enseignement est le cœur de métier d'une école. Justifier son choix d'abord par les associations ou l'international, devant un jury où siège un enseignant, est une maladresse.",
        "La première année fait découvrir les grandes fonctions de l'entreprise ; la dernière spécialise vers le premier emploi. C'est cette spécialisation qui répond à « pourquoi nous plutôt qu'une autre ? ».",
        "Un master ne pèse qu'environ 400 heures : chaque école choisit ses modules (de la RSE dans un master finance, ou non), leur volume, leur langue, ses intervenants. C'est à ce niveau de détail qu'on se différencie.",
        "Ces informations sont rarement sur le site : demandez la maquette pédagogique du master et interrogez des étudiants actuels. Vos concurrents ne le font presque jamais.",
        "Complétez avec les entreprises partenaires, les associations, les échanges, les professeurs reconnus, le service carrières, la région. Et refaites ce travail pour chaque école : les liens de l'une ne valent pas pour l'autre.",
      ],
      exemple:
        "« Plusieurs écoles proposent un master marketing, mais celui-ci consacre un module entier à la gestion de marque, ce qui correspond exactement au métier de chef de produit que je vise. »",
    },
    {
      id: "projet-formuler",
      title: "Étape 4 · Formuler son projet",
      keywords: ["précision", "domaine", "métier", "secteur", "niveau", "formulation"],
      lead: "En sortie de prépa, un domaine de métiers bien argumenté suffit ; un secteur seul ne suffit jamais.",
      body: [
        "Trois niveaux existent : le domaine (les métiers de la finance), le métier (contrôleur de gestion), le secteur (l'industrie textile). Un secteur seul (« le luxe », « le conseil ») ne dit rien de ce que vous voulez faire.",
        "Plus votre parcours est spécialisé (BUT, licence, stages ciblés), plus le jury attend de précision : poste de départ, missions, évolution imaginée.",
        "Une bonne réponse tient en trois temps : définir rapidement et justement le métier, montrer comment vous vous êtes renseigné, expliquer pourquoi il vous correspond et ce que l'école y apporte.",
      ],
      exemple:
        "« Je m'oriente vers les métiers de la finance d'entreprise, de préférence dans l'industrie, parce que j'aime comprendre comment une décision se traduit en chiffres. »",
    },
    {
      id: "projet-futur",
      title: "Se projeter, et prévoir l'imprévu",
      keywords: ["5 ans", "10 ans", "trajectoire", "carrière", "évolution", "plan b", "changer d'avis", "alternative"],
      lead: "À 5 ans, vous serez un jeune diplômé ; à 10 ans, sans doute à un premier poste de responsabilité. Une direction, pas un plan minuté.",
      body: [
        "Répondez d'abord directement, par une situation professionnelle précise, puis déroulez le chemin. Chaque étape doit préparer la suivante : apprendre le métier, puis élargir (management, international, expertise).",
        "À 10 ans, montrez que vous avez réfléchi à ce qu'implique encadrer une équipe.",
        "Si le projet n'aboutit pas : accueillez l'hypothèse sereinement, dites comment vous réagissez face à un obstacle, puis ce qui resterait transférable (compétences, secteur, type de structure).",
        "« Comment être sûr de ne pas changer d'avis ? » : votre projet peut évoluer tant qu'il reste cohérent avec votre profil, et l'école sert justement à affiner ce choix.",
      ],
      eviter: ["Se voir directeur général cinq ans après le diplôme.", "Improviser un plan B sans lien avec le reste du projet."],
    },
    {
      id: "projet-pieges",
      title: "Les formulations qui coûtent cher",
      keywords: ["pièges", "manager", "chef de projet", "consultant", "entrepreneuriat", "niche"],
      lead: "Aucun jury ne préfère un projet à un autre : il vérifie la cohérence avec l'école et avec ce qu'il perçoit de vous. Certains mots trahissent pourtant un projet peu travaillé.",
      eviter: [
        "« Manager » : c'est une responsabilité acquise après quelques années, pas un métier.",
        "« Chef de projet » ou « consultant » sans domaine : un chef de projet informatique et un chef de projet événementiel n'ont rien en commun.",
        "L'entrepreneuriat par défaut, pour plaire, ou « pour être mon propre patron ».",
      ],
      body: [
        "Si l'envie d'entreprendre est réelle, assumez-la et préparez-vous à parler de l'offre et de sa cible, des coûts de lancement, du financement, de l'équipe et de l'investissement personnel (tout prend plus de temps que prévu). On n'attend pas toutes les réponses, mais la preuve que vous vous êtes posé les bonnes questions.",
      ],
    },
    {
      id: "projet-contenu",
      title: "Ce que votre projet doit contenir",
      keywords: ["module", "contenu", "validation", "ia"],
      lead: "À la fin du module 1, chaque rubrique doit être remplie avec vos mots.",
      points: [
        "Un domaine de métiers assumé, et si possible un secteur qui vous attire.",
        "Pourquoi ce projet : d'où vient l'intérêt, avec plusieurs raisons.",
        "Le rôle réel dans l'entreprise : interlocuteurs, production, outils.",
        "Les qualités nécessaires, chacune prouvée par une expérience.",
        "Une actualité récente du métier et quelques entreprises de référence.",
        "Ce travail sert ensuite de base aux liens avec les écoles (module 2), vos expériences (module 3) et vos sujets d'actualité (module 4).",
      ],
    },
  ],
};

export const METHODE_ECOLES: Chapter = {
  id: "ecoles",
  title: "Les écoles",
  intro:
    "On s'intéresse à une école pour ce qu'elle propose à votre projet. Connaître l'école ne rapporte des points que lorsque chaque élément cité est relié à vous.",
  link: { to: "/partie-3", label: "Remplir mes fiches écoles" },
  sections: [
    {
      id: "ecoles-socle",
      title: "Le socle : à connaître sans exception",
      keywords: ["baseline", "devise", "valeurs", "histoire", "création", "directeur", "campus", "socle"],
      lead: "Le socle ne fait pas gagner de points, mais l'ignorer en fait perdre beaucoup.",
      faire: [
        "Date de création et histoire (consulaire, associative, fusion).",
        "Direction actuelle, campus et implantations.",
        "Baseline ou devise, valeurs affichées, deux ou trois temps forts de la vie étudiante.",
        "Tout revérifier sur le site officiel juste avant l'oral : ces éléments changent.",
      ],
      body: [
        "Sur la devise et les valeurs, citer ne suffit pas : donnez la formulation exacte, ce qu'elle signifie pour vous, puis reliez-la à une expérience. Le jury attend la rencontre entre les valeurs de l'école et les vôtres.",
      ],
    },
    {
      id: "ecoles-specifique",
      title: "Ce qui fait la différence",
      keywords: ["master", "cours obligatoires", "électifs", "400 heures", "associations", "entreprises partenaires", "incubateur", "échange", "université", "international"],
      lead: "Un élément spécifique sans raison personnelle n'est que du catalogue, et le jury l'entend tout de suite.",
      body: [
        "Le master visé d'abord : un master ne pèse qu'environ 400 heures, l'école a donc fait des choix de modules, de volume, de langue et d'intervenants. Citez deux ou trois cours précis et la raison de chaque choix.",
        "Deux universités partenaires au minimum, chacune justifiée par une raison concrète : la langue, la spécialisation du programme, le poids du marché dans votre secteur. Le climat ou la réputation festive n'en sont pas.",
        "Une ou deux associations nommées, et ce que vous y feriez concrètement. Les entreprises partenaires qui recrutent dans votre domaine. Un dispositif original (laboratoire, incubateur, semestre en entreprise) : c'est souvent là que le jury creuse.",
      ],
      eviter: ["Citer un cours électif comme s'il était suivi par tous les étudiants.", "« La vie associative est riche », sans rien nommer."],
      exemple: "« Je vise un semestre à Rotterdam, premier port d'Europe, parce que je m'oriente vers la supply chain. »",
    },
    {
      id: "ecoles-territoire",
      title: "La ville et la région",
      keywords: ["territoire", "ville", "région", "maire", "tissu économique", "entreprises locales", "pôle de compétitivité"],
      lead: "S'intéresser à l'endroit où l'on va vivre plusieurs années est une marque de sincérité.",
      faire: [
        "Connaître le maire de la ville, sa couleur politique et la tendance des dernières élections.",
        "Identifier les filières dominantes de la région, quelques entreprises implantées, les pôles de compétitivité : ils nourrissent les cours et les stages.",
        "Savoir ce qui vous attire réellement dans la ville, et ce qu'implique une installation (logement, mobilité, distance familiale).",
      ],
    },
    {
      id: "ecoles-questions",
      title: "Les questions sur l'école",
      keywords: ["pourquoi notre école", "école de commerce", "que ferez-vous", "apport", "refusé", "autre école", "classement"],
      lead: "« Pourquoi une école de commerce ? », « Pourquoi la nôtre ? », « Qu'y ferez-vous ? » : trois questions différentes, à préparer séparément.",
      body: [
        "Pourquoi une école de commerce : distinguez l'envie d'étudier le management de la voie particulière des grandes écoles (stages, vie associative, réseau, international).",
        "Pourquoi notre école : la différence se joue dans le détail des masters, des cours et des partenariats, toujours rattachés à votre projet.",
        "Que voulez-vous y faire : un parcours concret et chronologique, avec cours, associations et échanges nommés, en acceptant qu'il évolue. Ce que l'école va vous apporter : les compétences que vous viendrez y acquérir.",
        "Le jury sait que vous passez plusieurs écoles. En cas de refus, vous poursuivriez votre projet ailleurs : c'est la preuve qu'il ne dépend pas d'un seul établissement. Face à une école mieux classée, donnez les critères qui guideront votre choix.",
      ],
      eviter: ["Le classement ou le prestige comme argument principal.", "Le même discours servi à toutes les écoles.", "Une fidélité jouée plutôt qu'une réponse sincère."],
    },
    {
      id: "ecoles-methode",
      title: "Construire une fiche utile",
      keywords: ["fiche", "méthode", "sources", "copier-coller", "vérification"],
      lead: "Une fiche est réussie quand, en la relisant, vous pouvez dire en trois phrases pourquoi cette école pour ce projet.",
      faire: [
        "Travailler école par école : deux fiches copiées-collées se repèrent instantanément.",
        "Noter la source de chaque information (site, brochure, presse, étudiants) pour la revérifier avant l'oral.",
        "Écrire, pour chaque élément retenu, la raison personnelle qui vous y amène.",
      ],
      body: [
        "The Prepboard ne vérifie ni l'existence ni l'exactitude de ce que vous entrez : la recherche est votre travail, et c'est elle qui vous fera progresser.",
      ],
    },
  ],
};

export const METHODE_EXPERIENCES: Chapter = {
  id: "experiences",
  title: "Les expériences",
  intro:
    "Toute question du jury est un prétexte pour mieux vous connaître. Une expérience racontée doit révéler une qualité et ouvrir sur l'avenir ; sinon, elle n'est qu'un souvenir.",
  link: { to: "/partie-4", label: "Détailler mes expériences" },
  sections: [
    {
      id: "exp-ppf",
      title: "La méthode : Passé, Présent, Futur",
      keywords: ["passé", "présent", "futur", "méthode", "qualité", "champ lexical", "lien"],
      lead: "Un fait vécu, la qualité qu'il démontre, l'usage que vous en ferez demain.",
      body: [
        "Passé : une anecdote précise, datée, située, racontée à la première personne.",
        "Présent : la qualité qu'elle prouve, ou le défaut qu'elle vous a appris à travailler. Faites-la sentir par les mots du récit (« j'ai changé ma façon de faire ») avant de la nommer, sinon la conclusion paraît plaquée.",
        "Futur : un lien concret et nommé, soit vers l'école (master, association, échange, entreprise partenaire), soit vers votre projet professionnel (un domaine de métiers suffit). Un seul axe, mais nommé et illustré.",
        "Une anecdote sans lien réutilisable est une anecdote perdue : c'est le lien qui la rend utile le jour de l'oral.",
      ],
      exemple:
        "« La veille du tournoi, notre fournisseur a annulé. J'ai appelé trois clubs voisins et récupéré le matériel en deux heures. J'ai appris à garder mon sang-froid quand tout se dérègle, ce que je veux mettre au service du pôle événementiel du bureau des sports. »",
    },
    {
      id: "exp-raconter",
      title: "Poser le décor, puis découper en anecdotes",
      keywords: ["contexte", "30 secondes", "anecdotes", "mini-expériences", "difficulté", "succès", "initiative", "réserve", "relances"],
      lead: "Trente secondes de contexte, puis trois ou quatre moments forts, un ou deux gardés en réserve.",
      body: [
        "Le contexte d'abord, factuel : de quoi il s'agit, où, quand, combien de temps, avec qui, dans quel rôle. Pour une expérience longue, une phrase sur son évolution. L'analyse viendra avec les anecdotes.",
        "Une expérience contient plusieurs histoires : une difficulté, une réussite, un échec, une relation marquante, une initiative, une responsabilité. Chacune a son propre enjeu ; trois récits qui disent la même chose n'en font qu'un.",
        "Une anecdote est un moment précis raconté en détail, pas un résumé de saison. Comptez une minute trente à deux minutes pour l'ensemble.",
      ],
      eviter: ["Plonger dans le récit sans contexte : le jury se perd et décroche.", "Le « on » et « l'équipe » qui effacent votre propre rôle."],
    },
    {
      id: "exp-hierarchiser",
      title: "Hiérarchiser et surveiller ses mots",
      keywords: ["ordre", "chronologie", "importance", "valorisation", "verbatim", "manque de temps", "dénigrer", "survendre"],
      lead: "Le jury peut vous couper à tout moment : l'essentiel arrive en premier, et un mot mal choisi suffit à créer un doute.",
      faire: [
        "Suivre une chronologie qui montre le chemin parcouru.",
        "Placer tôt ce qui dit le plus sur vous, et ouvrir sur un moment valorisant.",
        "Garder les expériences jugées « petites » (job saisonnier, cours particuliers, aide familiale) : elles sont souvent les plus parlantes.",
      ],
      eviter: [
        "Commencer par un échec, ou par le titre obtenu au bout de dix ans sans raconter le chemin.",
        "« J'ai arrêté par manque de temps » : cela s'entend comme un manque d'organisation. Parlez d'un choix assumé.",
        "Critiquer un coéquipier, un encadrant ou une structure.",
        "Survendre : un fait modeste raconté précisément vaut mieux qu'un exploit flou.",
      ],
    },
    {
      id: "exp-qualites",
      title: "Qualités, défauts, échec et réussite",
      keywords: ["qualités", "défauts", "amis", "points forts", "points faibles", "échec", "réussite", "fierté", "lucidité"],
      lead: "Préparez six qualités et trois défauts, chacun prouvé par une anecdote. L'échec mesure votre lucidité, la réussite ce qui compte pour vous.",
      body: [
        "Les qualités s'affirment sans précaution (« je suis calme », pas « je crois être plutôt calme ») et s'appuient idéalement sur deux expériences différentes, pour prouver qu'elles sont constantes. Ne retenez que des qualités réellement vôtres : une qualité empruntée s'effondre à la première relance.",
        "Les défauts sont réels, actuels et professionnels. Pour chacun : une situation qui l'illustre honnêtement, une autre qui montre que vous le travaillez, et les moments à venir où vous resterez vigilant.",
        "Un échec : un fait réel, même modeste, votre part de responsabilité sans accuser les circonstances, ce que vous avez compris et ce que vous faites autrement aujourd'hui. Une réussite : pas la plus prestigieuse, celle qui vous ressemble, avec votre rôle exact.",
        "« Que disent vos amis de vous ? » demande un regard extérieur : choisissez des anecdotes de vie collective (voyage, colocation, organisation entre amis).",
      ],
      eviter: ["Le faux défaut déguisé en qualité (« je suis trop perfectionniste »)."],
    },
    {
      id: "exp-equipe",
      title: "Travail d'équipe et réorientation",
      keywords: ["équipe", "collectif", "individuel", "rôle", "réorientation", "changement"],
      lead: "Décrivez le rôle que vous tenez réellement, pas celui que vous idéalisez.",
      body: [
        "En équipe : identifiez votre rôle habituel (moteur, médiateur, organisateur…), illustrez-le dans deux contextes différents et montrez que vous savez reconnaître celui des autres.",
        "Individuel ou collectif : assumez une préférence, puis prouvez votre aisance dans l'autre mode.",
        "Après une réorientation : présentez l'ancien parcours sans le dénigrer, le déclic précis, puis la réflexion qui a mûri la décision.",
      ],
    },
  ],
};

export const METHODE_ACTUALITE: Chapter = {
  id: "actualite",
  title: "L'actualité",
  intro:
    "Le jury teste votre curiosité et votre capacité à raisonner, pas votre culture encyclopédique. Trois sujets maîtrisés valent mieux que dix survolés.",
  link: { to: "/partie-5", label: "Préparer mes sujets d'actu" },
  sections: [
    {
      id: "actu-choix",
      title: "Choisir et délimiter ses sujets",
      keywords: ["choix", "événement", "daté", "récent", "registres", "secteur", "international", "société"],
      lead: "Un événement précis et daté, plutôt qu'une grande tendance.",
      faire: [
        "Une décision, un accord, un rachat, une élection, une crise : quelque chose qui s'est produit à une date identifiable, et qui se résume en une phrase (quoi, quand, où, qui).",
        "Des sujets des derniers mois, que vous avez envie de défendre : un sujet subi s'entend tout de suite.",
        "Trois registres : un lié à votre projet ou votre secteur, un de société, un international.",
        "Vérifier que vous tenez deux minutes sans support ; lire la Une du jour avant l'oral.",
      ],
      eviter: ["Le sujet que tout le monde choisit, sans lien avec vous.", "Un thème trop large (« l'intelligence artificielle ») au lieu d'un événement."],
    },
    {
      id: "actu-analyse",
      title: "Analyser et prendre position",
      keywords: ["analyse", "enjeu", "causes", "conséquences", "tension", "acteurs", "sources", "avis", "opinion", "nuance"],
      lead: "Faits, enjeu, causes, conséquences, avis : c'est la séparation des causes et des conséquences qui fait la différence.",
      body: [
        "Résumez sobrement les faits, pour qu'un jury qui n'a rien suivi comprenne.",
        "Formulez l'enjeu comme une tension : qui gagne, qui perd, quel arbitrage se joue. Repérez les acteurs et leurs intérêts (États, entreprises, salariés, consommateurs, ONG, territoires).",
        "Les causes expliquent au passé ; les conséquences possibles se disent au conditionnel, avec prudence. C'est là que la plupart des candidats se perdent.",
        "Le jury relancera toujours pour savoir ce que vous en pensez : assumez une position nuancée et argumentée, et sachez exposer l'argument opposé.",
        "Gardez une à cinq sources de qualité que vous pouvez citer : presse de référence, étude, rapport, podcast.",
      ],
    },
    {
      id: "actu-bascule",
      title: "Revenir vers soi",
      keywords: ["bascule", "transition", "lien", "projet", "perche"],
      lead: "Le sujet n'est qu'une porte : il doit ramener vers votre projet, une expérience ou l'école.",
      body: [
        "Préparez explicitement la phrase de bascule, et dites pourquoi cet événement vous a marqué personnellement : c'est ce qui distingue votre analyse de celle d'un manuel.",
        "Notez les perches que vous voulez tendre : elles orienteront la suite vers un terrain que vous maîtrisez.",
      ],
      exemple:
        "« Ce sujet me touche parce que je m'oriente vers les achats : arbitrer entre coût et approvisionnement responsable sera mon quotidien. »",
    },
    {
      id: "actu-impose",
      title: "Quand le jury impose le sujet",
      keywords: ["sujet imposé", "qu'avez-vous à dire", "anticiper", "ignorer"],
      lead: "Anticipez les sujets liés à votre profil : un séjour aux États-Unis appelle une question sur la politique américaine.",
      body: [
        "Si vous ne connaissez pas le sujet, dites-le simplement plutôt que d'improviser, puis proposez ce que vous savez de proche.",
        "The Prepboard ne vérifie ni les faits ni la fraîcheur de vos sources : la recherche et la vérification restent votre travail.",
      ],
    },
  ],
};

/** Convertit un chapitre en consignes de module (même contenu, présenté en liste). */
export function chapterToTheory(chapter: Chapter): { title: string; points: string[] }[] {
  return chapter.sections.map((s) => ({
    title: s.title,
    points: [
      ...(s.lead ? [s.lead] : []),
      ...(s.body ?? []),
      ...(s.points ?? []),
      ...(s.faire ?? []),
      ...(s.eviter ?? []).map((e) => `À éviter : ${e}`),
      ...(s.exemple ? [`Exemple : ${s.exemple}`] : []),
    ],
  }));
}
