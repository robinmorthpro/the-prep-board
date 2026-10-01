# Plan de correction — compteur visible Partie 3

## Objectif
Rendre le compteur des éléments spécifiques clairement visible, sans devoir chercher dans la fiche.

## Diagnostic confirmé
Le compteur est actuellement rendu dans la section « Éléments spécifiques à mon projet professionnel », à l’intérieur du contenu déplié de chaque fiche. Il peut donc ne pas être vu si :
- la fiche est réduite ;
- l’utilisateur n’a pas encore scrollé jusqu’à cette section ;
- l’attention est portée sur le haut de la fiche ou le bouton d’enregistrement.

## Changement proposé
1. Afficher le compteur directement dans l’en-tête de chaque fiche école, à côté du statut « En cours / Terminée ».
2. Garder aussi une indication dans la section « Éléments spécifiques », mais avec un libellé plus explicite :
   - `0/3 éléments spécifiques complets`
   - `2/3 éléments spécifiques complets — 3 requis pour valider`
   - `3/3 éléments spécifiques complets — minimum atteint`
3. Utiliser une couleur de badge différente selon l’état :
   - incomplet : badge secondaire ou contour ;
   - minimum atteint : badge validé.
4. Si la fiche est réduite, le compteur restera visible dans l’en-tête.

## Résultat attendu
L’utilisateur voit immédiatement combien d’éléments spécifiques sont validés sur les 3 requis, même sans ouvrir ou parcourir toute la fiche.

## Détails techniques
- Modifier uniquement `src/routes/_app.partie-3.tsx`.
- Réutiliser le calcul existant `completeCount`.
- Déplacer/dupliquer l’affichage du badge dans la zone d’en-tête de `SheetCard`.
- Ne pas toucher à la logique de validation existante.
