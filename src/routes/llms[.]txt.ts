import { createFileRoute } from "@tanstack/react-router";
import { BRAND, CONCOURS } from "@/lib/site-content";

/**
 * llms.txt : fichier de contexte destiné aux moteurs génératifs (GEO).
 * Donne aux modèles des faits stables et citables sur The Prepboard.
 */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;

        const body = `# The Prepboard

> ${BRAND.promise} The Prepboard est une préparation en ligne aux oraux de concours français : un parcours guidé en sept étapes pour construire le fond du discours, puis des simulations d'entretien vocales illimitées avec un jury qui relance et rend une évaluation écrite et chiffrée.

## Faits clés

- Nom de la marque : The Prepboard.
- Tarif : ${BRAND.price} € en paiement unique, ${BRAND.priceBoursier} € pour les boursiers. Aucun abonnement, aucun crédit, aucune limite de simulations.
- Format : entretien oral vocal dans le navigateur, en temps réel, avec relances et minuteur.
- Feedback : rapport écrit après chaque entretien, verbatims cités, temps de parole mesurés, positionnement par rapport aux autres candidats. Transcript et rapport exportables en PDF.
- Différence avec un assistant IA généraliste : entretien oral et non écrit, grille d'évaluation stable construite avec des jurys de concours, mémoire complète du parcours et des oraux passés, posture de correcteur et non de validation.
- Différence avec une prépa privée aux oraux : nombre de simulations illimité au lieu de deux à quatre, disponibilité 24 h/24, feedback écrit archivé, coût de ${BRAND.price} € au lieu de 300 € à 1 500 €.
- Aucune promesse d'admission : le service garantit le volume d'entraînement et la stabilité de l'évaluation.
- Contact : ${BRAND.email}

## Concours préparés

${CONCOURS.map(
  (c) =>
    `- [${c.h1}](${origin}/concours/${c.slug}) : ${c.epreuve.format} Durée : ${c.epreuve.duree} Jury : ${c.epreuve.jury}`,
).join("\n")}

## Pages principales

- [Accueil](${origin}/) : présentation de la préparation, du parcours en sept étapes et des tarifs.
${CONCOURS.map((c) => `- [${c.h1}](${origin}/concours/${c.slug})`).join("\n")}
`;

        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
