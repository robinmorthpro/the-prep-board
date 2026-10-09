/**
 * Banques de questions emlyon (module 8, format spécial).
 *
 * Sources : « Le grand guide des entretiens de motivation CPGE », Robin Morth
 * (Ellipses), chapitre 4 §2, p.148-155, et « Le Manuel des entretiens de
 * motivation » (Pinto & Sévigné), fiche 54.2, p.166-180.
 *
 * L'entretien emlyon se déroule en trois temps : une présentation initiale du
 * candidat, puis l'épreuve des 4 cartes (une question par thème : Expérience,
 * Personnalité, Projet, Créativité), puis un échange libre avec le jury.
 *
 * L'agent ElevenLabs ne peut pas tirer une carte lui-même de façon fiable :
 * c'est donc l'app qui fait le tirage (`drawEmlyonCards`) et qui transmet les
 * 4 questions à l'agent via des variables dynamiques (card_experience,
 * card_personnalite, card_projet, card_creativite) — mécanisme identique à
 * `situation_enonce` pour l'ESSEC.
 */
export const EMLYON_EXPERIENCE: string[] = [
  // [Livre] p.150-154
  "Quel est votre plus gros échec et comment l'avez-vous surmonté ?",
  "Évoquez une performance collective que vous avez réalisée.",
  "Parlez-nous d'une situation déstabilisante rencontrée.",
  "Quelle situation vous a donné un sentiment de culpabilité et pourquoi ?",
  "Si vous pouviez recommencer vos études, qu'étudieriez-vous ?",
  "En quoi votre parcours vous différencie-t-il des autres candidats ?",
  "À quand remonte votre dernier doute ?",
  "Qu'avez-vous fait de vos mains ?",
  "Quelle est votre expérience la plus originale ?",
  "Parlez-nous de vos meilleures vacances.",
  "Quand avez-vous fait preuve d'innovation ?",
  "Pensez-vous que l'échec fait grandir ?",
  "Avez-vous déjà eu un rôle de médiateur ?",
  "Avez-vous déjà eu un « petit boulot » ?",
  "Quel échec d'un de vos proches auriez-vous aimé vivre ?",
  "Que retenez-vous d'un de vos échecs ?",
  "Racontez-nous votre dernier voyage.",
  "Pouvez-vous évoquer une expérience ratée ?",
  "Quelle expérience vous différencie des autres candidats à l'emlyon ?",
  "Quelle est la période la plus significative de votre vie ?",
  "Avez-vous eu des expériences déroutantes ?",
  "Quelle expérience voudriez-vous avoir vécue à 50 ans ?",
  "Si un proche était là, quel serait votre échec le plus décevant à ses yeux ?",
  "Qu'est-ce que l'expérience selon vous ?",
  "Dans votre précédente formation, quels sont les enseignements qui vous ont intéressé et à l'inverse ceux que vous avez moins aimés ?",
  "Avez-vous déjà mené un projet de A à Z ? Lequel ?",
  "Quel est le cadeau le plus improbable que vous ayez déjà fait ?",
  "Parlez-nous d'une expérience structurante.",
  // [Manuel] fiche 54.2
  "Quelles compétences avez-vous acquises autres que celles de votre parcours académique ?",
  "Qu'avez-vous appris lors de votre dernier séjour loin de chez vous et de vos proches ?",
  "Quelle a été votre expérience la plus enrichissante et épanouissante ?",
  "Racontez-nous une expérience où vous avez fait preuve de collectif.",
  "Quel est le plus beau jour de votre vie ?",
  "Racontez une situation où vous vous êtes dépassé.",
  "Avez-vous vécu une expérience interculturelle ?",
  "Citez une expérience que vous avez faite au moins une fois et que vous ne referez plus.",
  "Quelle expérience avez-vous vécue que vous n'aimeriez pas revivre ?",
  "Racontez-nous un échec. Comment avez-vous rebondi ?",
  "Racontez-nous un moment où vous avez le plus douté de vous-même.",
  "Racontez-nous une expérience où vous avez à tort ou à raison suivi votre intuition.",
  "Si vous aviez le choix, referiez-vous les mêmes études ?",
  "Avez-vous déjà eu des expériences associatives ? Lesquelles ?",
  "Quel est votre dernier fou rire inextinguible ?",
  "Quelle est la chose la plus folle que vous ayez faite ?",
  "Quel a été le plus grand changement dans votre vie ?",
  "À quel moment de votre vie avez-vous pris le plus de risque(s), qu'est-ce que cela vous a apporté ?",
];

export const EMLYON_PERSONNALITE: string[] = [
  // [Livre] p.150-154
  "Êtes-vous un « early maker » ?",
  "Aimez-vous travailler ?",
  "Aimez-vous prendre des risques ?",
  "Comment gérez-vous le stress ? Vous galvanise-t-il ou fait-il perdre vos moyens ?",
  "Comment réagissez-vous si l'entreprise dans laquelle vous travaillez fait faillite ?",
  "Quel est votre comportement à l'intégration d'un groupe que vous connaissez bien ?",
  "Si vous pouviez prendre la place de votre supérieur, le feriez-vous ?",
  "Quelle question aimeriez-vous que le jury vous pose ?",
  "Quel fait d'actualité vous a marqué récemment ?",
  "Parlez-nous de 3 événements récents en France qui vous ont fait peur.",
  "Que faites-vous pour vous rassurer quand vous prenez une décision importante ?",
  "Préférez-vous le court terme ou le long terme ?",
  "Pouvez-vous aller contre l'avis de vos amis ?",
  "Que vous apportent vos amis ?",
  "Quel patron n'aimeriez-vous pas avoir ?",
  "À quel personnage public n'aimeriez-vous pas ressembler ?",
  "Quel personnage fictif vous ressemble ?",
  "Quelle personnalité politique vous inspire ?",
  "Si vous deviez rencontrer un entrepreneur, qui serait-il et pourquoi ?",
  "Quel est le pays que vous n'aimeriez pas visiter ? Pourquoi ?",
  "Êtes-vous créatif ?",
  "Quel rêve d'enfant a évolué au cours de votre vie ?",
  "Qu'est-ce que réussir sa vie et qu'est-ce que rater sa vie ?",
  "Quel jeu de société préférez-vous ?",
  "Que trouvez-vous laid ?",
  "Vous devez convaincre un banquier de vous accorder un crédit indispensable à votre projet de vie. Comment faites-vous ?",
  "Pourquoi quitteriez-vous une entreprise ?",
  "Qu'aimez-vous le moins dans l'humanité ?",
  "Qu'est-ce qui vous agace le plus ?",
  "On vous demande de remplacer l'assistant personnel d'un dirigeant désagréable et impopulaire, quelle est votre réaction ?",
  "Lors d'un dîner avec le dictateur nord-coréen, que lui dites-vous ?",
  "Entre « apprendre à coder » et « apprendre à parler en public », quel cours choisissez-vous d'étudier en Business School ?",
  "Comment gérez-vous l'interculturalité ?",
  "Comment avez-vous ou envisagez-vous votre responsabilité sociale durant vos études ?",
  "Utilisez-vous les réseaux sociaux, et pourquoi ?",
  "Un enfant traverse la route et vous met face à un dilemme : soit vous l'écrasez et sauvez les passagers de votre voiture, soit vous détournez la voiture dans un mur qui sauve l'enfant mais tue tout le monde dans la voiture. Que faites-vous ?",
  "Quels sont vos critères de choix d'un livre ?",
  "Gourmand ou gourmet ?",
  "Quelle question poseriez-vous à un candidat pour le déstabiliser ?",
  "Si vous deviez prendre la tête d'un projet humanitaire, lequel serait-il et pourquoi ?",
  "Quelle remarque pourrait vous vexer au plus haut point en entreprise ?",
  "Qu'est-ce que vous ne voulez pas faire dans la vie ?",
  "Qu'est-ce qui vous met hors de vous ?",
  "Quel défaut aimeriez-vous supprimer ?",
  "Êtes-vous capable de gérer votre e-réputation ? Comment ?",
  "Si vous suiviez votre cœur, quels choix feriez-vous actuellement ?",
  "Êtes-vous quelqu'un de théorique ou de pratique ?",
  // [Manuel] fiche 54.2
  "Comment définiriez-vous votre caractère en 3 mots ?",
  "Si vous n'avez pas d'électricité, d'internet et de téléphone pendant 24h, que faites-vous ?",
  "Vous devez monter un projet associatif, lequel et pourquoi ?",
  "Comment gagnez-vous de l'argent dans votre vie ou lors de vos voyages ?",
  "Quelle place a le travail dans votre vie ?",
  "Réfléchissez-vous longtemps avant de prendre une décision ?",
  "Pourriez-vous travailler gratuitement et si oui, pourquoi ?",
  "Si vous aviez un groupe de 8 enfants de moins de 10 ans sous votre responsabilité, comment vous y prendriez-vous ?",
  "Qu'est-ce qui pourrait vous faire vous brouiller avec un(e) ami(e) ?",
  "Accepteriez-vous un job mal payé et peu valorisant ?",
  "Quelle a été votre opinion la plus difficile à défendre ?",
  "Qu'est-ce que Google représente pour vous ?",
  "Plutôt argent ou pouvoir ?",
  "Êtes-vous plutôt maçon ou architecte dans l'esprit ? Et dans les faits ?",
  "Sur quel sujet êtes-vous intarissable ?",
  "Quelle est votre devise ?",
  "Sur quel principe ne transigez-vous jamais ?",
  "Citez 3 qualités sur vous en les illustrant avec des exemples.",
];

export const EMLYON_PROJET: string[] = [
  // [Livre] p.150-154
  "Pourquoi voulez-vous intégrer l'emlyon ?",
  "Pourquoi voulez-vous intégrer une école de commerce ?",
  "Quelles sont les particularités du Programme Grande École de l'emlyon ?",
  "Pensez-vous que l'emlyon vous apportera un esprit critique ?",
  "Que souhaitez-vous apprendre à l'emlyon ?",
  "Comment envisagez-vous le futur ?",
  "Quels sont vos projets pour cet été ?",
  "Avez-vous plus d'affinité avec des métiers ? À l'inverse, lesquels ne vous attirent pas ?",
  "Quel est le métier que vous aimeriez exercer et qui n'existe pas encore ?",
  "Que choisissez-vous entre avoir 1/3 de votre temps dédié aux stages et 2/3 aux cours, et l'inverse ?",
  "Dans quel pays ne souhaiteriez-vous pas partir en échange universitaire ?",
  "Où voudriez-vous travailler ?",
  "Que choisissez-vous entre un stage chez Cartier, un autre chez HSBC, et un dernier en start-up ? Justifiez votre réponse.",
  "Vous créez une entreprise. Sur quel(s) critère(s) ou profils choisissez-vous vos deux premiers collaborateurs ?",
  "Citez 3 cours que vous aimeriez suivre à l'emlyon et expliquez pourquoi.",
  "Vous devez vivre hors de France, où aimeriez-vous vivre ?",
  "Où vous voyez-vous dans 20 ans ?",
  "Où vous voyez-vous en 2030 ?",
  "Si vous aviez le don d'ubiquité que feriez-vous en plus de vos études dans notre école ?",
  "Quels métiers qui n'existaient pas il y a quelques années vous attirent aujourd'hui ?",
  "Quel est selon vous le plus beau métier du monde ? Et le pire ?",
  "Quel est votre projet professionnel à moyen terme ?",
  "Quel serait votre premier stage idéal ?",
  "Qu'est-ce qu'une entreprise socialement responsable selon vous ?",
  "Pensez-vous qu'il est important de tolérer l'échec et de redonner sa chance dans la vie professionnelle ?",
  "Quels seront pour vous les trois apports de l'emlyon BS ?",
  // [Manuel] fiche 54.2
  "Quel métier souhaitez-vous découvrir le plus rapidement possible ?",
  "Quel poste voulez-vous exercer en entreprise ?",
  "Pour quelle raison ne pourriez-vous pas être entrepreneur(se) ?",
  "Est-ce qu'il est important d'avoir un premier stage en rapport avec son projet professionnel ?",
  "Pendant votre carrière, combien de fois comptez-vous changer de postes/d'entreprises ?",
  "Quel type d'épanouissement recherchez-vous dans votre projet professionnel ?",
  "Dans quelle entreprise ne souhaiteriez-vous absolument pas travailler après l'obtention de votre diplôme ?",
  "Quelle serait l'entreprise que vous rêveriez d'intégrer ?",
  "Où aimeriez-vous travailler pendant les 5 prochaines années, hors de France ?",
  "Un produit à inventer qui vous manque actuellement.",
  "Vous êtes face à un dilemme entre travailler dans une banque ou une start-up : que choisissez-vous ?",
  "Voulez-vous accumuler un maximum d'expérience ?",
  "Pourquoi une business school ?",
  "Quels sont les 3 cours que vous attendez avec impatience à l'emlyon ?",
  "Quel est le principal atout de l'emlyon selon vous ?",
];

export const EMLYON_CREATIVITE: string[] = [
  // [Livre] p.150-154
  "Vous voulez convaincre votre banquier de financer votre voyage sur une autre planète, comment faites-vous ?",
  "Comment définissez-vous une start-up à un enfant ?",
  "Comment expliquez-vous Google à un enfant ?",
  "Donnez-nous votre horoscope du jour.",
  "Qui aimeriez-vous être ?",
  "Comment utiliseriez-vous 2 millions d'euros ?",
  "Citez une personne innovante qui vous inspire.",
  "Donnez votre avis sur la citation de Karl Marx : « la religion est l'opium du peuple ».",
  "Dans quel pays aimeriez-vous vous téléporter ?",
  "Vous passez une heure avec Xi Jinping, que lui dites-vous ?",
  "Le terme « maker » est très moderne. Que signifie-t-il pour vous ?",
  "Si vous deviez inventer une fête nationale : que célébrerait-elle et quelles seraient ses traditions ?",
  "Si vous étiez doué en programmation informatique, qu'aimeriez-vous créer ?",
  "Quelle serait l'œuvre folle que vous aimeriez créer ?",
  "Préférez-vous explorer l'océan Pacifique ou aller sur la planète Mars ?",
  "Si vous étiez un dessert ou une boisson : que seriez-vous ?",
  "Quel personnage de cirque seriez-vous ?",
  "Connaissez-vous des diplômés de l'emlyon ?",
  "Que dira de vous un étudiant de l'emlyon dans 100 ans ?",
  "Quelle entreprise aimeriez-vous diriger pendant 1 an si vous aviez toutes les compétences requises ?",
  "Qu'aimeriez-vous voir dans une boule de cristal ?",
  "Vous avez la charge d'un groupe de personnes âgées 5 après-midi pendant 3 semaines, qu'organisez-vous ?",
  "Pouvez-vous nous parler de Google ?",
  "On dit que « le ridicule ne tue pas » et que « ce qui ne nous tue pas nous rend plus fort » : pensez-vous que le ridicule rend plus fort ?",
  "Si vous aviez 1 million d'euros à dépenser mais pas pour vous, que feriez-vous ?",
  "Que vous inspire le pays des merveilles ?",
  "Qui emmenez-vous sur Mars avec vous ?",
  "Qui emmèneriez-vous avec vous dans votre navette spatiale si c'était la fin du monde ?",
  "Si vous étiez avocat, qui défendriez-vous et pourquoi ?",
  "Si vous aviez un don, lequel serait-il ?",
  "Que feriez-vous avec une baguette magique ?",
  "Quel vœu feriez-vous au génie de la lampe ?",
  "Vous êtes intégré(e) dans une tribu indienne qui désigne ses membres par des surnoms métaphoriques. Quel serait votre surnom ?",
  "À vos yeux, que doit rechercher un système éducatif ?",
  "Choisissez 2 célébrités pour remplacer vos parents.",
  "Vous emmenez en voyage un extra-terrestre pendant 1 mois. Que faites-vous ?",
  "Donnez-nous envie de manger votre plat préféré.",
  "Sur une île déserte, qu'est-ce qui vous manquerait le plus ?",
  "Est-ce vous ou vos parents qui souhaitent que vous intégriez une école de commerce ?",
  "L'innovation permet d'augmenter par trois l'espérance de vie, qu'en pensez-vous ?",
  "Que vous évoque le terme « early makers » ?",
  "Quel est votre avis sur l'uberisation ?",
  "Faites-nous rire.",
  "Surprenez-nous.",
  // [Manuel] fiche 54.2
  "Si vous aviez une cape d'invisibilité pendant 1 heure, que feriez-vous ?",
  "Si vous aviez une imprimante 3D, citez trois objets que vous imprimeriez en premier.",
  "Si vous deviez passer un jour dans la vie d'une personne, laquelle et pourquoi ?",
  "Si vous aviez une machine à billets de 100 euros, que feriez-vous ?",
  "Si vous deviez inviter une personne morte ou vivante à dîner, qui serait-ce et quelle question lui poseriez-vous ?",
  "Vous êtes responsable d'un groupe de 5 enfants de 3 à 6 ans pendant 2 heures, que faites-vous ?",
  "Vous êtes propulsé dirigeant d'une entreprise. Quelle est votre première décision ? Que faites-vous les 100 premiers jours ?",
  "Si vous étiez un pays et une ville, lesquels seriez-vous ?",
  "Si vous étiez un animal, lequel seriez-vous ? Pour quelles caractéristiques ?",
  "Vous pouvez revenir dans le temps pour une heure, à quel événement historique assistez-vous ?",
  "Expliquez l'éthique et la mixité sociale à un enfant de 8 ans.",
  "Vous inventez une nouvelle mode pour 2025 : quel style, quelles valeurs ?",
  "Si l'État subit un recours en justice pour cause de non-respect de l'environnement, quelles réformes devrait-il entreprendre ?",
  "Un homme richissime vous demande d'organiser son mariage. Que faites-vous ?",
  "Si vous deviez écrire un roman, quelle serait l'intrigue ?",
  "Changez la devise de la France.",
  "Donnez-nous une question décalée de l'entretien.",
  "Si on tournait un film sur vous, qui serait la personne qui jouerait votre rôle ?",
  "Vous organisez une soirée déguisée, donnez les 3 critères de notation du déguisement.",
  "Vous devez créer une fête nationale, laquelle ? Et qu'est-ce que vous mettriez en place ?",
];

/** Tirage aléatoire d'une question dans une banque donnée. */
function pickOne(bank: string[]): string {
  return bank[Math.floor(Math.random() * bank.length)] ?? bank[0]!;
}

export type EmlyonPile = "Expérience" | "Personnalité" | "Projet" | "Créativité";

const BANKS: Record<EmlyonPile, string[]> = {
  Expérience: EMLYON_EXPERIENCE,
  Personnalité: EMLYON_PERSONNALITE,
  Projet: EMLYON_PROJET,
  Créativité: EMLYON_CREATIVITE,
};

/**
 * Piles séparées (une seule liste partagée) : le module Questions clés publie
 * les cartes de rang impair (1re, 3e, 5e…) ; le jury ne tire que dans les autres.
 */
export const EMLYON_MODULE: Record<EmlyonPile, string[]> = Object.fromEntries(
  Object.entries(BANKS).map(([pile, bank]) => [pile, bank.filter((_, i) => i % 2 === 0)]),
) as Record<EmlyonPile, string[]>;
export const EMLYON_JURY: Record<EmlyonPile, string[]> = Object.fromEntries(
  Object.entries(BANKS).map(([pile, bank]) => [pile, bank.filter((_, i) => i % 2 === 1)]),
) as Record<EmlyonPile, string[]>;

/** Critère où se note une carte (texte de l'évaluateur emlyon). */
export type EmlyonCritere =
  | "Expériences et personnalité"
  | "Projet professionnel"
  | "École"
  | "Ouverture sur le monde"
  | "Gestion des situations déstabilisantes (l'imprévu)";

/** Cartes dont le critère n'est pas celui de leur pile (décision du fondateur). */
export const EMLYON_ETIQUETTES_EXCEPTIONS: Record<string, EmlyonCritere> = {
  // Pile Créativité
  "Citez une personne innovante qui vous inspire.": "Expériences et personnalité",
  "Donnez votre avis sur la citation de Karl Marx : « la religion est l'opium du peuple ».": "Ouverture sur le monde",
  "Vous passez une heure avec Xi Jinping, que lui dites-vous ?": "Ouverture sur le monde",
  "Le terme « maker » est très moderne. Que signifie-t-il pour vous ?": "École",
  "Connaissez-vous des diplômés de l'emlyon ?": "École",
  "Que dira de vous un étudiant de l'emlyon dans 100 ans ?": "École",
  "Quelle entreprise aimeriez-vous diriger pendant 1 an si vous aviez toutes les compétences requises ?": "Projet professionnel",
  "Pouvez-vous nous parler de Google ?": "Ouverture sur le monde",
  "À vos yeux, que doit rechercher un système éducatif ?": "Ouverture sur le monde",
  "Est-ce vous ou vos parents qui souhaitent que vous intégriez une école de commerce ?": "École",
  "L'innovation permet d'augmenter par trois l'espérance de vie, qu'en pensez-vous ?": "Ouverture sur le monde",
  "Que vous évoque le terme « early makers » ?": "École",
  "Quel est votre avis sur l'uberisation ?": "Ouverture sur le monde",
  "Si l'État subit un recours en justice pour cause de non-respect de l'environnement, quelles réformes devrait-il entreprendre ?": "Ouverture sur le monde",
  // Pile Projet : cartes qui portent sur l'école
  "Pourquoi voulez-vous intégrer l'emlyon ?": "École",
  "Pourquoi voulez-vous intégrer une école de commerce ?": "École",
  "Quelles sont les particularités du Programme Grande École de l'emlyon ?": "École",
  "Pensez-vous que l'emlyon vous apportera un esprit critique ?": "École",
  "Que souhaitez-vous apprendre à l'emlyon ?": "École",
  "Citez 3 cours que vous aimeriez suivre à l'emlyon et expliquez pourquoi.": "École",
  "Si vous aviez le don d'ubiquité que feriez-vous en plus de vos études dans notre école ?": "École",
  "Quels seront pour vous les trois apports de l'emlyon BS ?": "École",
  "Pourquoi une business school ?": "École",
  "Quels sont les 3 cours que vous attendez avec impatience à l'emlyon ?": "École",
  "Quel est le principal atout de l'emlyon selon vous ?": "École",
};

const CRITERE_PAR_PILE: Record<EmlyonPile, EmlyonCritere> = {
  Expérience: "Expériences et personnalité",
  Personnalité: "Expériences et personnalité",
  Projet: "Projet professionnel",
  Créativité: "Gestion des situations déstabilisantes (l'imprévu)",
};

/** Étiquette d'une carte : exception éventuelle, sinon le critère de sa pile. */
export function emlyonCritere(pile: EmlyonPile, question: string): EmlyonCritere {
  return EMLYON_ETIQUETTES_EXCEPTIONS[question] ?? CRITERE_PAR_PILE[pile];
}

export type EmlyonCarteTiree = { pile: EmlyonPile; question: string; critere: EmlyonCritere };

/** Les 4 cartes tirées, avec leur étiquette, dans l'ordre des piles. */
export function emlyonCartesEtiquetees(draw: ReturnType<typeof drawEmlyonCards>): EmlyonCarteTiree[] {
  const list: [EmlyonPile, string][] = [
    ["Expérience", draw.experience],
    ["Personnalité", draw.personnalite],
    ["Projet", draw.projet],
    ["Créativité", draw.creativite],
  ];
  return list.map(([pile, question]) => ({ pile, question, critere: emlyonCritere(pile, question) }));
}

/**
 * Tire les 4 cartes de l'épreuve emlyon : une question par thème (Expérience,
 * Personnalité, Projet, Créativité), tirée au hasard dans la part de sa pile
 * réservée au jury (jamais une carte publiée dans le module Questions clés).
 */
export function drawEmlyonCards() {
  return {
    experience: pickOne(EMLYON_JURY.Expérience),
    personnalite: pickOne(EMLYON_JURY.Personnalité),
    projet: pickOne(EMLYON_JURY.Projet),
    creativite: pickOne(EMLYON_JURY.Créativité),
  };
}
