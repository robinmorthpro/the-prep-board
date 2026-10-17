import { type KeyQuestion } from "./vivaldi-data";
import { METHODE_ACTUALITE, METHODE_ECOLES, METHODE_EXPERIENCES, METHODE_PROJET, chapterToTheory } from "./methode";

export type TheorySection = { title: string; points: string[] };

/** Consignes théoriques d'une question clé (module 6). */
export function questionSections(q: KeyQuestion): TheorySection[] {
  return [
    { title: "Intention du jury", points: [q.intent] },
    { title: "Critères d'une bonne réponse", points: q.criteria },
    { title: "Pièges à éviter", points: q.pitfalls },
  ];
}

/* Modules 1 à 4 : consignes issues de la source unique (methode.ts), partagée avec
 * la page Ressources théoriques. Modifier le contenu là-bas, jamais ici. */

/** Module 1 - le projet professionnel. */
export const CAREER_THEORY_SECTIONS: TheorySection[] = chapterToTheory(METHODE_PROJET);
/** Module 2 - la connaissance des écoles. */
export const SCHOOLS_THEORY_SECTIONS: TheorySection[] = chapterToTheory(METHODE_ECOLES);
/** Module 3 - les expériences personnelles. */
export const EXPERIENCE_THEORY_SECTIONS: TheorySection[] = chapterToTheory(METHODE_EXPERIENCES);
/** Module 4 - les sujets d'actualité. */
export const NEWS_THEORY_SECTIONS: TheorySection[] = chapterToTheory(METHODE_ACTUALITE);
