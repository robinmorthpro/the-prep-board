# Le compteur « Échange X / 14 » n'est pas une limite

Vous n'êtes pas limité à 14 échanges. Dans le code de la partie 7, `14` est une simple constante d'affichage utilisée uniquement pour écrire « Échange X / 14 ». Le jury vocal continue à rebondir autant qu'il veut.

## Correction proposée

Supprimer le compteur d'échange et ne garder que le chronomètre de l'entretien (environ 25 minutes) pendant la session.

- `src/routes/_app.partie-7.tsx` : suppression de la constante `TOTAL_QUESTIONS` (ligne 33), et suppression du badge « Échange X / 14 » dans l'en-tête de session (ligne 436). Le chronomètre déjà présent reste affiché.
- Aucun changement de logique côté agent, base de données ou évaluation.
