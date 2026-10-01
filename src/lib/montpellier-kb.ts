/**
 * Banque de situations comportementales pour l'entretien « situations »
 * de Montpellier BS (module 8, format spécial).
 *
 * Le candidat choisit lui-même sa situation à l'écran : l'application tire
 * une sélection une seule fois par session (voir `drawMontpellierSituations`)
 * et informe le jury du choix via une mise à jour contextuelle.
 */
export type MontpellierSituation = { id: string; text: string };

export const MONTPELLIER_SITUATIONS: MontpellierSituation[] = [
  { id: "perseverer", text: "Vous avez dû persévérer pour réaliser quelque chose" },
  { id: "probleme-complexe", text: "Vous avez résolu un problème complexe" },
  { id: "situation-inattendue", text: "Vous vous êtes trouvé(e) face à une situation inattendue" },
  { id: "projet-collectif", text: "Vous avez contribué à un projet collectif" },
  { id: "apporte-aide", text: "Vous avez apporté votre aide" },
  { id: "defense-quelquun", text: "Vous avez dû prendre la défense de quelqu'un" },
  { id: "trahir-secret", text: "Vous avez dû trahir un secret" },
  { id: "pris-risque", text: "Vous avez pris un risque" },
  { id: "maniere-efficace", text: "Vous avez trouvé une manière plus efficace de faire quelque chose" },
  { id: "recrute-equipe", text: "Vous avez été recruté(e) dans une équipe sportive, une entreprise ou une association" },
  { id: "impossible", text: "Vous avez dû gérer une situation qui semblait impossible" },
  {
    id: "association-accompli",
    text: "Vous vous êtes investi(e) dans une association et cela vous a permis d'accomplir quelque chose",
  },
  { id: "travail-appris", text: "Une expérience professionnelle vous a appris quelque chose d'important" },
  { id: "stress", text: "Vous avez vécu un moment de grand stress" },
  { id: "plus-fier", text: "Vous avez vécu une expérience dont vous êtes particulièrement fier ou fière" },
  { id: "decision-pression", text: "Vous avez dû prendre une décision difficile sous la pression du temps" },
  { id: "leadership", text: "Vous avez dû faire preuve de leadership sans en avoir le titre" },
  { id: "echec", text: "Vous avez dû gérer un échec ou une déception importante" },
  { id: "zone-confort", text: "Vous avez dû sortir de votre zone de confort" },
  { id: "convaincre", text: "Vous avez dû convaincre quelqu'un qui n'était pas d'accord avec vous" },
  { id: "adaptation-culture", text: "Vous avez dû vous adapter à un environnement ou une culture différente de la vôtre" },
  { id: "critique", text: "Vous avez reçu une critique qui vous a marqué(e)" },
  { id: "priorites", text: "Vous avez dû gérer plusieurs priorités en même temps" },
  { id: "parole-public", text: "Vous avez pris la parole devant un public pour la première fois" },
  { id: "encontre-groupe", text: "Vous avez fait un choix qui allait à l'encontre de l'avis du groupe" },
];

/**
 * Sélectionne au hasard 15 situations parmi les 25 pour la session.
 * Retourne aussi le reste (10) pour pouvoir piocher dedans si les 15 sont
 * épuisées avant la fin de l'entretien.
 */
export function drawMontpellierSituations(count = 15): {
  drawn: MontpellierSituation[];
  rest: MontpellierSituation[];
} {
  const shuffled = [...MONTPELLIER_SITUATIONS].sort(() => Math.random() - 0.5);
  return { drawn: shuffled.slice(0, count), rest: shuffled.slice(count) };
}
