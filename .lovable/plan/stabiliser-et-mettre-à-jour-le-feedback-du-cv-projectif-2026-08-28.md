# Stabiliser et mettre à jour le feedback du CV projectif

## Diagnostic confirmé

- Le CV enregistré est toujours associé au verdict **« Validé »** dans la base : le travail de l'étudiant n'a pas régressé.
- L'écran affiche encore un **ancien feedback enregistré**, avec les rubriques « Le pourquoi de chaque élément » et « Ce qu'il faut savoir défendre ».
- Les nouvelles consignes du prompt existent bien, mais une modification du prompt ne rend pas automatiquement obsolète ce feedback historique. C'est pourquoi les tags **Cohérence** et **Connaissance** ne sont pas visibles.
- La stabilité dépend actuellement en partie du cache local du navigateur. Ce n'est pas assez robuste : un autre navigateur ou un cache effacé peut provoquer une nouvelle évaluation du même CV.

## Corrections prévues

1. **Préserver le verdict d'un CV inchangé**
   - Comparer le CV courant au CV enregistré, indépendamment du navigateur.
   - Si le contenu n'a pas changé, conserver exactement le verdict déjà attribué.
   - Ne permettre une nouvelle notation que lorsque le contenu du CV change réellement.

2. **Migrer une seule fois les anciens feedbacks vers le nouveau format**
   - Détecter les feedbacks qui contiennent encore les deux anciennes rubriques.
   - Lors de la prochaine demande d'analyse, demander à l'IA de restructurer le retour sans modifier le verdict existant.
   - Enregistrer ce nouveau retour afin que les anciennes rubriques ne réapparaissent plus.

3. **Afficher les questions dans une seule section claire**
   - Supprimer visuellement « Le pourquoi de chaque élément » et « Ce qu'il faut savoir défendre ».
   - Réintégrer tout leur contenu dans « Questions possibles du jury ».
   - Afficher chaque question avec un tag visible **Cohérence** ou **Connaissance**, ainsi que « Ce qu'il faut pouvoir répondre ».
   - Conserver autant de questions que le CV le justifie, sans limite artificielle à trois.

4. **Valider le résultat de bout en bout**
   - Vérifier qu'un CV inchangé conserve « Validé » lors de plusieurs demandes successives.
   - Vérifier que les deux anciennes rubriques ont disparu.
   - Vérifier que les deux types de tags sont visibles dans le rendu réel et que le nouveau feedback reste enregistré après rechargement.

## Détail technique

La stabilité sera fondée sur le contenu enregistré du CV et le verdict persistant, pas uniquement sur `localStorage`. Un feedback ancien pourra être reformaté une fois, avec une instruction explicite de conservation du verdict, puis sera traité comme le feedback de référence tant que le CV ne change pas.
