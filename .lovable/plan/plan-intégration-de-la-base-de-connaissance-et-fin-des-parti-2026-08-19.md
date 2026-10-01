# Plan : intégration de la base de connaissance et fin des parties 5 & 6

## Objectif
Finaliser le prototype Vivaldi (parcours 6 parties) en intégrant la base de connaissance que tu vas m'envoyer, puis implémenter les parties 5 et 6 de manière cohérente avec les parties 1-4 existantes.

## Traitement de la base de connaissance

### Ce que je vais en faire
- La découper en données structurées et typées :
  - **Fiches écoles de référence** : éléments attendus par école (generic + specific), exemples validés.
  - **Banque de questions clés (partie 5)** : question, intention du jury, critères d'une bonne réponse, éventuellement exemples de réponse.
  - **Déroulé de l'entretien complet (partie 6)** : durée, séquences, relances, grille d'évaluation du débrief.
  - **Contenus théoriques complémentaires** : conseils projet pro / écoles / expériences, intégrés à la page Ressources et aux panneaux d'aide.

### Où je la stocke
- Dans le fichier `src/lib/vivaldi-data.ts`, à côté des données statiques existantes (liste SIGEM, CPGE, etc.).
- Avantage : pas d'appel base de données pour du contenu de référence, typage TS, versionné avec le code.
- Les saisies utilisateur restent dans Supabase (`profiles`, `school_sheets`, `experiences`, `career_projects`).

## Implémentation partie 5 : Questions clés

- Créer un mode d'entraînement par question :
  - Affichage de la question + intention du jury + critères (depuis `vivaldi-data.ts`).
  - Réponse orale via `OralAnswer` (enregistrement + transcription).
  - Soumission à l'IA d'évaluation (`reviewExperience` ou nouvelle fonction `reviewAnswer`) avec retour structuré.
  - Suivi des questions passées / à refaire.
- Mettre à jour `computeProgress` : partie 5 terminée quand un certain nombre de questions ont été pratiquées et évaluées.

## Implémentation partie 6 : Entretien complet

- Créer un simulateur d'entretien structuré :
  - Déroulé chronométré basé sur la grille envoyée (introduction, questions, relances, conclusion).
  - Enregistrement oral global ou par séquence.
  - À la fin : génération d'un débrief IA basé sur la grille d'évaluation (structure, contenu, posture, etc.).
- Stockage du résultat en base (`experiences` ou nouvelle table dédiée si pertinent).

## Mise à jour transversale

- `src/routes/_app.dashboard.tsx` : afficher les 6 parties avec les bons libellés et la logique de déblocage (75% des expériences de la partie 4 pour débloquer 5 et 6, mode test actif).
- `src/routes/_app.ressources.tsx` : enrichir avec les nouveaux contenus théoriques.
- `src/lib/vivaldi-queries.ts` : ajuster les types et la logique de progression si nécessaire.

## Validation

- Vérifier le build (`tsgo` / `bun run build`).
- Parcourir les 6 parties en preview pour s'assurer de la cohérence du flux.
- Vérifier que les réponses orales, transcriptions et évaluations IA fonctionnent sur les parties 5 et 6.
