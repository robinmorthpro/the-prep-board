# Mode écrit temporaire pour tester un entretien complet

Objectif : minimum de changements, clairement isolés, pour pouvoir revenir à « oral seul » en une seule demande après vos tests.

## Ce qui ne marchait pas

Le choix « À l'écrit » ouvrait la session avec un type de connexion incompatible avec le jeton utilisé par l'application : la session ne démarrait donc jamais en écrit, seul l'oral fonctionnait.

Correction : garder exactement la même connexion que l'oral et ajouter uniquement l'indicateur « sans audio ». Le jury écrit ses questions, le micro n'est jamais demandé, le déroulé, le transcript et le débrief restent identiques.

## Ce qui sera visible

- Un seul petit bouton « Mode test : écrit / oral » dans la ligne de réglages de la carte, avant « Démarrer l'entretien », bien lisible.
- Pendant un entretien écrit : la zone de saisie déjà en place, avec le bandeau « Entretien à l'écrit ».
- Rien d'autre ne change ; le popup de structure n'est pas touché.

## Détails techniques

- `src/hooks/useJuryAgent.ts` : dans `start`, conserver `connectionType: "webrtc"` avec `conversationToken` et ne passer que `textOnly: true` (`PrivateWebRTCSessionConfig` interdit `websocket` avec un jeton).
- `src/routes/_app.partie-8.tsx` : remplacer le `Select` « Passation » par un bouton bascule, entouré de commentaires `MODE TEST ÉCRIT — à retirer` pour un retrait propre.
- Vérification : `bunx tsgo --noEmit` puis un lancement réel en mode écrit dans le navigateur pour confirmer que la première question du jury arrive en texte, sans demande de micro.
