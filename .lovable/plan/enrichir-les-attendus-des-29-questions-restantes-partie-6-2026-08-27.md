# Enrichir les attendus des 29 questions restantes (partie 6)

Non, votre document n'est pas trop lourd. Le problème est identifié : il fait **85 pages**, et l'outil de lecture de documents s'arrête à 50 pages. Les 15 premières questions (présentation, questions sur vous) ont donc été enrichies à partir du contenu réel du livre, mais tout ce qui vient après la page 50 — « Les questions sur l'école de commerce », « Votre futur », « Actualité », « Région de l'école », « Management », « Questions déstabilisantes » — n'a jamais été lu. Ces 29 questions sont restées sur mes résumés maison, d'où l'écart de qualité que vous voyez sur « Pourquoi une école de commerce ? ».

## Ce que je vais faire

1. Extraire le texte intégral des 85 pages (extraction texte directe, sans limite de pages), y compris les encadrés « mauvais exemple / bon exemple » et les analyses.
2. Réécrire, question par question, les trois blocs affichés dans « Les attendus de la question » au même niveau de détail que « Présentez-vous » :
   - **Intention du jury** : un paragraphe développé (ce qu'il cherche vraiment, pourquoi il pose la question, ce qu'il en déduit).
   - **Critères d'une bonne réponse** : 6 à 12 points méthodologiques, structurés et concrets, reprenant la logique du livre (axes de réponse, ordre, exemples à citer, formulations types).
   - **Pièges à éviter** : 5 à 9 pièges expliqués, avec la raison pour laquelle ils coûtent cher.
3. Couvrir les 29 questions concernées :
   - École de commerce (6) : pourquoi une école de commerce, pourquoi notre école, que voulez-vous y faire, ce que l'école va vous apporter, la devise, les valeurs.
   - Votre futur (6) : dans 5 ans, dans 10 ans, projet professionnel, si le projet n'aboutit pas, ne pas changer d'avis, concilier vie pro / familiale.
   - Actualité (2), Région de l'école (2), Management (2).
   - Questions déstabilisantes (11) : faites-nous rire, surprenez-nous, ce qui vous émeut, avez-vous réussi l'entretien, si vous étiez refusé, notre école ou une autre, vendez-moi ce stylo, etc.
4. Vérifier le rendu dans la fenêtre « Les attendus de la question » (listes longues lisibles, scroll correct) et la compilation.

## Détails techniques

- Extraction : `pdftotext -layout` sur le PDF monté en lecture seule (aucune limite de 50 pages).
- Édition : uniquement `KEY_QUESTIONS` dans `src/lib/vivaldi-data.ts` (champs `intent`, `criteria`, `pitfalls`), lignes ~897 à ~1360. Aucun changement de schéma, de requête ou de composant, sauf ajustement d'affichage si une liste longue s'affiche mal.
- Travail découpé par thème et confié à plusieurs sous-agents en parallèle (chacun reçoit les pages du livre correspondant à son thème), puis relecture d'ensemble pour l'homogénéité du ton.
- Contrôle final : typecheck et vérification visuelle d'une question par thème.

## Hors périmètre

Le wording de l'interface de la partie 6 et les prompts de feedback IA ne changent pas ici.
