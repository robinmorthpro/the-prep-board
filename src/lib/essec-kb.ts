/**
 * Banque de mises en situation pour la partie structurée de l'entretien
 * ESSEC (module 8, format spécial ESSEC).
 *
 * 30 scénarios au total, tagués selon les 5 compétences que l'ESSEC dit
 * évaluer dans cette partie de l'entretien (sens des valeurs et intégrité,
 * compétences collectives, capacités entrepreneuriales, capacités
 * d'organisation, créativité) :
 * - 5 cas officiels, adaptés depuis les exemples publiés par l'ESSEC
 *   elle-même et reproduits dans l'ouvrage de Robin (« Le grand guide des
 *   entretiens de motivation CPGE », chapitre 4, section 1).
 * - 10 scénarios sourcés sur internet (source fiable, sessions récentes),
 *   sélectionnés et validés par Robin parmi 16 candidats.
 * - 15 scénarios originaux, rédigés et validés par Robin.
 */
export interface EssecSituation {
  competence: string;
  enonce: string;
}

export type NumberedEssecSituation = EssecSituation & { numero: number };

export const ESSEC_SITUATIONS: EssecSituation[] = [
  // --- 5 cas officiels ESSEC ---
  {
    competence: "Sens des valeurs et intégrité",
    enonce:
      "Vous devenez trésorier ou trésorière d'une association de l'ESSEC qui organise des activités de soutien scolaire. Vous découvrez que le trésorier précédent s'est fait rembourser des notes de frais illégales, et que rendre ce fait public risque d'abîmer gravement l'image de l'association, voire de la faire disparaître. Comment gérez-vous cette situation ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Dans une équipe de six étudiants d'une association sportive de l'ESSEC, vous remportez une récompense offerte par une entreprise partenaire. Vous prenez seul ou seule l'initiative de choisir la récompense sous forme de bons d'achat de 50 euros par étudiant. Une fois les bons d'achat arrivés, les autres membres de l'équipe vous disent qu'ils ne sont pas du tout favorables à ce choix. Comment réagissez-vous ?",
  },
  {
    competence: "Capacités entrepreneuriales",
    enonce:
      "Un client se présente dans le magasin que vous dirigez pour récupérer un téléphone portable qu'il a laissé en réparation. Il a perdu sa facture et son bon de caisse, mais affirme que vous le reconnaissez, alors que vous n'en avez vous-même aucun souvenir précis. Comment gérez-vous cette situation ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Vous organisez à l'ESSEC, dans le cadre d'une nouvelle association, un week-end « entreprise en herbe » destiné à des élèves de primaire, pour leur faire découvrir de façon ludique le monde de l'entreprise. L'événement a lieu dans trois mois. Comment procédez-vous pour mener à bien cette mission ?",
  },
  {
    competence: "Créativité",
    enonce:
      "On vous confie la reprise de la conception d'un spot télévisé qui doit vanter l'intérêt de consommer des insectes lyophilisés, dans une région de France plutôt attachée à une cuisine traditionnelle. La précédente campagne a été un échec et a fait baisser la consommation régionale de ces insectes. Quelle formule proposez-vous pour ce nouveau spot ?",
  },

  // --- 10 scénarios sourcés (validés par Robin) ---
  {
    competence: "Capacités d'organisation",
    enonce:
      "Vous êtes secrétaire du BDS (bureau des sports) et devez traiter une centaine de mails pour l'événement que vous organisez, mais le temps vous manque. Comment vous organisez-vous ?",
  },
  {
    competence: "Créativité",
    enonce:
      "On vous demande de concevoir une campagne publicitaire originale pour promouvoir l'ESSEC auprès de futurs candidats. Quelle formule proposez-vous ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Vous avez la garde d'un enfant pour l'après-midi et devez organiser son emploi du temps. Comment procédez-vous ?",
  },
  {
    competence: "Créativité",
    enonce: "On vous confie la conception d'un escape game original. Quel concept proposez-vous ?",
  },
  {
    competence: "Créativité",
    enonce: "On vous demande de repenser entièrement la salle d'attente d'un aéroport. Quelles sont vos propositions ?",
  },
  {
    competence: "Capacités entrepreneuriales",
    enonce:
      "Vous dirigez un journal dont les ventes s'effondrent depuis plusieurs mois. Comment redressez-vous la situation ?",
  },
  {
    competence: "Créativité",
    enonce:
      "Dans votre groupe projet, trois membres sur six ne participent pas depuis le début du travail. Comment réagissez-vous ?",
  },
  {
    competence: "Sens des valeurs et intégrité",
    enonce:
      "Vous dirigez un restaurant. Un de vos employés n'a pas les moyens de s'habiller correctement pour le service. Comment gérez-vous cette situation ?",
  },
  {
    competence: "Créativité",
    enonce:
      "Vous êtes stagiaire dans une agence de voyage et devez proposer un concept de « voyage frisson ». Que proposez-vous ?",
  },
  {
    competence: "Sens des valeurs et intégrité",
    enonce:
      "En tant que membre du bureau d'une association étudiante, vous devez choisir les sponsors de votre prochain événement. Comment faites-vous ce choix ?",
  },

  // --- 15 scénarios originaux (Robin) ---
  {
    competence: "Capacités entrepreneuriales",
    enonce:
      "Vous êtes trésorier ou trésorière d'une association étudiante. Votre principal partenaire financier se désengage deux semaines avant l'événement phare de l'année. Comment réagissez-vous ?",
  },
  {
    competence: "Compétences collectives",
    enonce:
      "Dans votre groupe de projet de six personnes, deux membres ne se parlent plus après un désaccord, et le rendu est dans trois jours. Comment gérez-vous la situation ?",
  },
  {
    competence: "Sens des valeurs et intégrité",
    enonce: "Un ami proche vous demande vos notes la veille d'un examen qu'il n'a pas du tout préparé. Que faites-vous ?",
  },
  {
    competence: "Capacités entrepreneuriales",
    enonce: "On vous confie un local vide dans le hall de votre établissement pour un mois. Qu'en faites-vous ?",
  },
  {
    competence: "Créativité",
    enonce:
      "Vous devez faire découvrir votre ville à un étudiant étranger qui ne dispose que de six heures avant son train. Comment organisez-vous ce temps ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Vous organisez un voyage associatif pour quarante personnes. La moitié des participants annule trois jours avant le départ. Comment réagissez-vous ?",
  },
  {
    competence: "Sens des valeurs et intégrité",
    enonce:
      "Un collègue s'attribue publiquement tout le mérite d'un projet auquel vous avez pourtant largement contribué. Comment réagissez-vous ?",
  },
  {
    competence: "Capacités entrepreneuriales",
    enonce:
      "Vous disposez d'un mois et de deux cents euros pour tester une idée de petit commerce sur votre campus. Que faites-vous ?",
  },
  {
    competence: "Compétences collectives",
    enonce:
      "On vous demande une intervention de vingt minutes dans votre lycée d'origine pour donner envie à des lycéens de faire une classe préparatoire. Comment construisez-vous cette intervention ?",
  },
  {
    competence: "Compétences collectives",
    enonce:
      "Vous animez un atelier avec des enfants de huit ans. L'un d'eux refuse de participer et s'isole. Comment réagissez-vous ?",
  },
  {
    competence: "Sens des valeurs et intégrité",
    enonce: "Votre voisin de table copie ouvertement sur son téléphone pendant un partiel. Que faites-vous ?",
  },
  {
    competence: "Capacités entrepreneuriales",
    enonce:
      "La cafétéria de votre établissement perd de l'argent depuis un an, sans budget supplémentaire disponible. Comment redressez-vous la situation ?",
  },
  {
    competence: "Compétences collectives",
    enonce:
      "Vous êtes seul ou seule à avoir fini votre partie d'un dossier collectif ; les autres membres du groupe ne répondent plus, et le rendu est dans trois jours. Que faites-vous ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Vous devez réserver une salle, un traiteur et un intervenant pour un événement dans dix jours. L'intervenant se désiste la veille de la date limite de réservation de la salle. Comment réagissez-vous ?",
  },
  {
    competence: "Capacités d'organisation",
    enonce:
      "Une association caritative que vous représentez voit ses dons chuter de moitié cette année. Vous devez inverser la tendance sans passer par les réseaux sociaux. Que proposez-vous ?",
  },
];

/** Numérotation éditoriale stable (1 à 30) partagée par le module et le jury. */
export const ESSEC_SITUATIONS_NUMEROTEES: NumberedEssecSituation[] = ESSEC_SITUATIONS.map((situation, index) => ({
  ...situation,
  numero: index + 1,
}));

/** Les trois plus petits numéros de chaque compétence sont visibles dans Questions clés. */
export const ESSEC_SITUATIONS_MODULE: NumberedEssecSituation[] = (() => {
  const counts = new Map<string, number>();
  return ESSEC_SITUATIONS_NUMEROTEES.filter((situation) => {
    const count = counts.get(situation.competence) ?? 0;
    if (count >= 3) return false;
    counts.set(situation.competence, count + 1);
    return true;
  });
})();

const ESSEC_MODULE_NUMBERS = new Set(ESSEC_SITUATIONS_MODULE.map((situation) => situation.numero));

/** Complément exact des situations du module, réservé au tirage du jury. */
export const ESSEC_SITUATIONS_JURY = ESSEC_SITUATIONS_NUMEROTEES.filter(
  (situation) => !ESSEC_MODULE_NUMBERS.has(situation.numero),
);

if (
  ESSEC_SITUATIONS_MODULE.length !== 15 ||
  new Set(ESSEC_SITUATIONS_MODULE.map((situation) => situation.competence)).size !== 5
) {
  throw new Error("La banque ESSEC doit fournir exactement trois situations par compétence au module.");
}

/**
 * Sélectionne au hasard l'énoncé de la mise en situation proposée au
 * candidat pendant l'échange libre de l'entretien ESSEC, injecté via la
 * variable dynamique `{{situation_enonce}}` du prompt ElevenLabs. Le candidat
 * ne doit découvrir cet énoncé qu'au moment où le jury le lui pose réellement
 * (cf. `conductNote` d'ESSEC dans school-interviews.ts) — jamais avant.
 */
export function pickEssecSituation(): string {
  const index = Math.floor(Math.random() * ESSEC_SITUATIONS_JURY.length);
  return (ESSEC_SITUATIONS_JURY[index] ?? ESSEC_SITUATIONS_JURY[0]!).enonce;
}
