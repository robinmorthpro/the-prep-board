# Corriger l'erreur « Should have a queue » sur le module 8

## Diagnostic

L'erreur React « Should have a queue / Hooks conditionnels » est apparue sur `/partie-8` après l'ajout du mode écrit.

- Vérification faite : aucun hook n'est appelé sous condition dans `src/routes/_app.partie-8.tsx` ni dans `src/hooks/useJuryAgent.ts`.
- Cause réelle : le rechargement à chaud (HMR) a gardé en mémoire l'ancienne version du hook `useJuryAgent`, qui comptait un hook de moins (`useServerFn(juryAgentSignedUrl)` a été ajouté pour la connexion signée du mode écrit). React détecte alors une liste de hooks différente entre deux rendus et plante.

## Correctif

1. Redémarrer le serveur de développement pour purger l'état du rechargement à chaud.
2. Recharger la page `/partie-8` et vérifier dans le navigateur que l'erreur a disparu et que le module 8 s'affiche normalement (sélecteur oral/écrit visible).
3. Si l'erreur persistait malgré le redémarrage (peu probable), rendre le démarrage du mode écrit paresseux (import dynamique de la fonction serveur au clic) au lieu d'un hook dédié.

## Périmètre

Aucune modification du code métier n'est prévue dans l'étape 1-2 ; l'étape 3 n'est qu'un plan de secours. Le fonctionnement de l'entretien, de l'évaluation et du débrief reste identique à l'oral comme à l'écrit.
