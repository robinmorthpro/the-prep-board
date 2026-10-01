/**
 * Banque de mots EDHEC BS (module 8, format spécial — partie 1 « Trilogie »).
 *
 * Sources :
 * - « Le grand guide des entretiens de motivation CPGE », Robin Morth (Ellipses),
 *   chapitre 4 §3, p.155-156 : liste de 62 mots proposés par l'EDHEC depuis 2017.
 * - « Le Manuel des entretiens de motivation » (Pinto & Sévigné), fiche 54.1,
 *   p.161 : liste des mots donnés en 2018 et 2019, avec quelques mots
 *   supplémentaires absents du livre.
 *
 * Par consigne explicite, seuls les MOTS du manuel sont repris ici (exemples).
 * La méthode, les règles de déroulé et les critères d'évaluation restent
 * exclusivement ceux du livre — voir le prompt de l'agent ElevenLabs dédié.
 *
 * L'oral EDHEC tire un mot au hasard pour la partie 1 (prise de parole en
 * public). L'agent ElevenLabs ne peut pas tirer ce mot lui-même de façon
 * fiable : c'est donc l'app qui fait le tirage et qui construit le premier
 * message, injecté en override de session (voir `firstMessageFor` dans
 * `school-interviews.ts`).
 */
export const EDHEC_WORDS: string[] = [
  // [Livre] p.155-156 — liste EDHEC depuis 2017
  "Adhésion",
  "Ami",
  "Argent",
  "Amour",
  "Ambitions",
  "Bienveillance",
  "Cause",
  "Cinéma",
  "Compromis",
  "Constellation",
  "Coopération",
  "Corruption",
  "Crise",
  "Culture",
  "Curiosité",
  "Danse",
  "Déchet",
  "Design",
  "Différence",
  "Digital",
  "Égalité",
  "Enfance",
  "Entreprise",
  "Équilibre",
  "Escroquerie",
  "Espoir",
  "Éthique",
  "Étoile",
  "Exclusion",
  "Fleur",
  "Flexibilité",
  "Gastronomie",
  "Histoire",
  "Liberté",
  "Livre",
  "Lumière",
  "Mode",
  "Musique",
  "Mythologie",
  "Paysage",
  "Peinture",
  "Philosophie",
  "Photographie",
  "Planète",
  "Poésie",
  "Pouvoir",
  "Proverbe",
  "Promesse",
  "Publicité",
  "Recette",
  "Résilience",
  "Révolution",
  "Richesse",
  "Sain",
  "Sentiment",
  "Start-Up",
  "Stéréotype",
  "Théâtre",
  "Valeur",
  "Ville",
  "Violence",
  "Voyage",
  // [Manuel] fiche 54.1 — mots supplémentaires (sujets 2018 et 2019), absents du livre
  "Bienveillant",
  "Ciel",
  "Croisière",
  "Dynamique",
  "Escalade",
  "Extraordinaire",
  "Humanité",
  "Incroyable",
  "Influence",
  "Papillon",
  "Partenaire",
  "Photo",
  "Xyloglotte",
];

/**
 * Tirage aléatoire du mot imposé pour la partie 1 de l'oral EDHEC. Le mot est
 * ensuite injecté dans l'ouverture du jury via {{edhec_mot}}.
 */
export function pickEdhecWord(): string {
  return EDHEC_WORDS[Math.floor(Math.random() * EDHEC_WORDS.length)] ?? EDHEC_WORDS[0]!;
}
