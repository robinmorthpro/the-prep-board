import {
  CAREER_THEORY,
  EXPERIENCE_THEORY,
  KNOWLEDGE,
  NEWS_THEORY,
  type KeyQuestion,
} from "./vivaldi-data";

export type TheorySection = { title: string; points: string[] };

/** Consignes théoriques d'une question clé (module 6). */
export function questionSections(q: KeyQuestion): TheorySection[] {
  return [
    { title: "Intention du jury", points: [q.intent] },
    { title: "Critères d'une bonne réponse", points: q.criteria },
    { title: "Pièges à éviter", points: q.pitfalls },
  ];
}

/* ------------------------------------------------------------------ */
/* Modules 2 à 5 : consignes de découverte du thème, pas de questions  */
/* On explique la matière à construire, pas encore la façon d'y        */
/* répondre à l'oral (c'est l'objet des modules 6 et 7).               */
/* ------------------------------------------------------------------ */

/** Module 2 - le projet professionnel. */
export const CAREER_THEORY_SECTIONS: TheorySection[] = [
  ...CAREER_THEORY.sections,
  {
    title: "Ce que votre projet doit contenir à la fin de ce module",
    points: KNOWLEDGE.career.points,
  },
  {
    title: "Le bon niveau de précision",
    points: [
      "Trois niveaux existent : le domaine d'activité (« les métiers de la finance »), le métier (« contrôleur de gestion »), le secteur (« l'industrie textile »). En CPGE, le domaine assumé suffit, complété si possible d'un secteur qui vous attire.",
      "Un secteur seul (« le luxe », « le conseil ») ne dit rien de ce que vous voulez faire : c'est le point le plus fragile des projets de candidats.",
      "Plus votre parcours est déjà spécialisé (stages, options, engagements ciblés), plus vous devez descendre dans le détail : poste de départ, missions concrètes, évolution imaginée.",
      "Décrivez le rôle réel dans l'organisation : à qui vous parlez au quotidien, ce que vous produisez, avec quels outils, dans quel type de structure (grand groupe, PME, cabinet, start-up).",
      "Il n'est pas grave de ne pas connaître le titre exact du poste ; il est grave de ne pas savoir décrire une journée de travail.",
    ],
  },
  {
    title: "Ancrer le projet dans votre histoire",
    points: [
      "Un projet crédible vient de quelque part : une rencontre, un stage, une lecture, une matière, une expérience associative ou sportive. Notez précisément cette origine, c'est elle qui rend le projet vivant.",
      "Listez les qualités que le métier demande, et pour chacune l'expérience de votre vie qui prouve que vous l'avez déjà mobilisée : ce travail sera directement réutilisé en module 4.",
      "Regardez aussi ce qui vous déplaît ou vous fait douter : un projet nuancé est plus solide qu'un projet parfait.",
      "Renseignez-vous sur le quotidien du métier auprès de professionnels, d'interviews, de podcasts, de rapports de stage : c'est la matière qui vous évitera les généralités.",
      "Gardez une actualité récente du domaine sous la main : elle montre que votre intérêt est actuel, pas scolaire.",
    ],
  },
  {
    title: "Se projeter dans le temps, sans se figer",
    points: [
      "Préparez une trajectoire simple et cohérente : la sortie d'école, les premières années, puis l'évolution que vous imaginez à moyen terme. On attend une direction, pas un plan de carrière minuté.",
      "Une trajectoire tient debout si chaque étape prépare la suivante : première expérience pour apprendre le métier, puis élargissement (management, international, spécialisation).",
      "Assumez l'incertitude de façon constructive : « voilà la direction, et voici ce que l'école va me permettre d'explorer pour la confirmer ».",
      "Anticipez le scénario où le projet n'aboutit pas : identifiez ce qui est transférable (compétences, secteur, type de structure) plutôt que d'improviser un plan B sorti de nulle part.",
      "Ce que vous écrivez ici est la base des liens que vous ferez ensuite avec les écoles (module 3), vos expériences (module 4) et vos sujets d'actualité (module 5).",
    ],
  },
];

/** Module 3 - la connaissance des écoles. */
export const SCHOOLS_THEORY_SECTIONS: TheorySection[] = [
  { title: KNOWLEDGE.schools.title, points: KNOWLEDGE.schools.points },
  {
    title: "Le socle générique : ne jamais être pris au dépourvu",
    points: [
      "Baseline, année de création, histoire (consulaire, associative, fusion), direction actuelle, campus et implantations : ce sont des informations attendues, pas valorisantes. Les ignorer coûte cher, les connaître ne rapporte rien.",
      "Retenez aussi la devise, les valeurs affichées et deux ou trois éléments de culture d'école (temps fort, événement étudiant emblématique, engagement revendiqué).",
      "Sachez d'où viennent vos informations : site de l'école, brochure du programme, presse, témoignages d'étudiants. Une information mal sourcée se retourne contre vous.",
      "Notez ce socle une fois par école, dans la fiche : vous le relirez juste avant l'oral.",
    ],
  },
  {
    title: "Les éléments spécifiques : c'est là que se joue la différence",
    points: [
      "Un master ne représente qu'environ 400 heures de cours : l'école a donc fait des choix de modules, de pondération, de langue d'enseignement, de professeurs et d'entreprises associées. C'est ce niveau de détail qui montre un vrai travail de découverte.",
      "Pour chaque élément retenu (master, association, échange, entreprise partenaire, dispositif original), écrivez la raison personnelle : ce que vous venez y chercher pour votre projet, ou ce qu'il vous permettra de tester.",
      "Deux universités partenaires au minimum, choisies pour une raison tangible : langue, spécialisation du programme, marché du secteur visé.",
      "Les associations comptent autant que les cours : nommez-en une ou deux et dites ce que vous y feriez concrètement, pas juste que « la vie associative est riche ».",
      "Les entreprises partenaires et les dispositifs originaux (laboratoire, incubateur, semestre en entreprise, certification) sont vos munitions de relance : le jury adore creuser dessus.",
      "Un élément spécifique sans justification liée à vous est un élément inutile : c'est du catalogue, et le jury l'entend immédiatement.",
    ],
  },
  {
    title: "L'école dans son territoire",
    points: [
      "Renseignez la ville et la région : taille, dynamisme, réputation, cadre de vie, ce qui vous y attire vraiment.",
      "Le tissu économique compte : filières dominantes, entreprises implantées, pôles de compétitivité, bassin de stages. C'est souvent ce qui relie l'école à votre projet professionnel.",
      "Quelques repères factuels sur la ville (maire, actualité locale, projets urbains) évitent une gêne inutile si le sujet arrive.",
      "Sachez dire ce qu'implique une installation : mobilité, logement, distance familiale - le jury vérifie que le choix est réfléchi.",
    ],
  },
  {
    title: "Méthode de travail et vérification",
    points: [
      "Travaillez école par école : deux fiches copiées-collées se repèrent instantanément, et les liens que vous ferez sonneront faux.",
      "Sourcez chaque information avec un lien : vous devez pouvoir y revenir et vérifier avant l'oral.",
      "The Prepboard ne vérifie ni l'existence ni l'exactitude de ce que vous entrez : la recherche est votre travail, et c'est précisément ce travail qui vous fera progresser.",
      "Une fiche est utile quand, en la relisant, vous pouvez dire en trois phrases pourquoi cette école-là pour votre projet-là.",
    ],
  },
];

/** Module 4 - les expériences personnelles. */
export const EXPERIENCE_THEORY_SECTIONS: TheorySection[] = [
  { title: EXPERIENCE_THEORY.title, points: EXPERIENCE_THEORY.points },
  {
    title: "Poser le contexte avant tout",
    points: [
      "Le contexte se raconte en 30 secondes maximum : de quoi il s'agissait, où, quand, pendant combien de temps, avec qui, à quel niveau ou dans quel rôle.",
      "Le lecteur - puis le jury - doit pouvoir situer l'expérience dans le temps et l'espace avant d'entendre quoi que ce soit d'autre.",
      "Restez factuel ici : ni analyse, ni qualité, ni conclusion. Ces éléments viennent avec les anecdotes.",
      "Une expérience longue (plusieurs années) mérite une phrase sur son évolution : comment vous y êtes entré, ce que vous y êtes devenu.",
    ],
  },
  {
    title: "Découper l'expérience en anecdotes précises",
    points: [
      "Cherchez dans l'expérience des « mini-expériences » : une difficulté traversée, un succès, un échec, un conflit ou une relation marquante, une initiative que vous avez prise, une responsabilité assumée.",
      "Une anecdote est un fait daté et situé, raconté en détail : un moment précis, pas un résumé de saison ni une habitude générale.",
      "Trois anecdotes par expérience suffisent pour ce module ; gardez-en une ou deux « en poche » comme réserve si l'échange s'approfondit.",
      "Chaque anecdote doit avoir sa propre temporalité et son propre enjeu : trois anecdotes qui racontent la même chose n'en font qu'une.",
      "Écrivez à la première personne : votre rôle, vos décisions, vos hésitations. Le « on » et « l'équipe » effacent exactement ce qu'on cherche à découvrir chez vous.",
    ],
  },
  {
    title: "Passé → Présent → Futur",
    points: [
      "Passé : l'anecdote elle-même, avec ses détails concrets.",
      "Présent : la qualité qu'elle révèle, ou le défaut sur lequel elle vous a fait travailler. Faites-la sentir dans le récit par le vocabulaire employé (« j'ai changé ma façon de faire », « en m'adaptant à lui ») avant de la nommer, sinon la conclusion paraît plaquée.",
      "Futur : un lien nommé et concret, soit côté école (un master, une association, un échange, une entreprise partenaire identifiés en module 3), soit côté projet professionnel (le domaine de métiers travaillé en module 2). Un seul de ces deux axes, mais nommé et illustré.",
      "Ne retenez que des qualités réellement vôtres : tout ce que vous avancez ici pourra être creusé, et une qualité empruntée s'effondre dès la première relance.",
      "Une anecdote sans lien réutilisable est une anecdote perdue : c'est le lien qui la rend utile le jour de l'oral.",
    ],
  },
  {
    title: "Hiérarchiser et surveiller les mots",
    points: [
      "Classez vos anecdotes selon trois critères : la chronologie (on doit comprendre le chemin parcouru), l'importance (ce qui dit le plus sur vous vient tôt) et la valorisation (ne jamais ouvrir sur un échec).",
      "Un échec se raconte, mais choisi et travaillé : ce que vous en avez tiré, ce que vous faites différemment aujourd'hui.",
      "Attention aux formules qui se retournent contre vous : « j'ai arrêté par manque de temps », « ça ne me servait pas », ou tout dénigrement d'un coéquipier, d'un encadrant ou d'une structure.",
      "Ne survendez pas : un fait modeste raconté précisément vaut mieux qu'un exploit vague.",
      "N'oubliez pas les expériences que vous jugez « petites » (job saisonnier, cours particuliers, aide familiale) : elles sont souvent les plus parlantes.",
    ],
  },
];

/** Module 5 - les sujets d'actualité. */
export const NEWS_THEORY_SECTIONS: TheorySection[] = [
  ...NEWS_THEORY.sections,
  {
    title: "Choisir et délimiter un événement",
    points: [
      "Partez d'un événement, pas d'une tendance : quelque chose qui s'est produit, à une date identifiable (une décision, une élection, un accord, un rachat, une publication, une crise, un procès).",
      "Un bon sujet se nomme en une phrase courte et se situe : quoi, quand, où, qui est impliqué.",
      "Choisissez des sujets récents (quelques mois) et des sujets que vous avez envie de défendre : un sujet subi s'entend tout de suite.",
      "Variez les registres sur l'ensemble de vos sujets : un lié à votre projet ou à votre secteur, un de société, un international.",
      "Vérifiez que vous pouvez tenir deux minutes dessus sans support : sinon, le sujet est trop large ou trop peu travaillé.",
    ],
  },
  {
    title: "Construire l'analyse",
    points: [
      "Résumez d'abord les faits, sobrement : le jury doit comprendre l'événement même s'il ne l'a pas suivi.",
      "Formulez l'enjeu comme une tension : qui gagne, qui perd, quel arbitrage est en jeu, quel équilibre est menacé.",
      "Distinguez rigoureusement les causes (pourquoi c'est arrivé, au passé) des conséquences possibles (au conditionnel ou au futur, avec prudence). C'est là que la plupart des candidats se perdent.",
      "Notez les acteurs et leurs intérêts respectifs : États, entreprises, salariés, consommateurs, ONG, territoires.",
      "Assumez un point de vue nuancé, argumenté, et sachez présenter l'argument opposé : on relancera toujours pour savoir ce que vous en pensez.",
      "Une à cinq sources par sujet, de qualité et identifiées : presse de référence, étude, rapport, podcast. Vous devez pouvoir les citer.",
    ],
  },
  {
    title: "Faire le lien avec vous",
    points: [
      "L'objectif final n'est pas le sujet : c'est ce qu'il révèle de vous. Chaque sujet doit ouvrir une porte vers une expérience personnelle (module 4), votre projet professionnel (module 2) ou l'école présentée (module 3).",
      "Préparez explicitement la phrase de bascule : « ce sujet m'intéresse parce que… et cela rejoint mon projet / mon expérience de… parce que… ».",
      "Écrivez aussi pourquoi cet événement vous a marqué personnellement : c'est ce qui distingue votre analyse de celle d'un manuel.",
      "Notez la ou les perches que vous voulez tendre : ce sont elles qui orienteront la suite de l'échange vers un terrain que vous maîtrisez.",
      "The Prepboard ne vérifie ni les faits ni la fraîcheur de vos sources : le travail de recherche et de vérification reste le vôtre.",
    ],
  },
];
