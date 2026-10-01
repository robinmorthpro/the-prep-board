# Arbitrages sur les incohérences : mise en cohérence des grilles

## Décisions retenues

1. **Anecdote 1 valorisante (partie 4)** — On ne commence jamais une expérience par une anecdote négative. La question défaut (partie 6) reste le seul endroit où un échec est attendu, et l'échec y est valorisé s'il est bien exploité. Pas de contradiction à corriger, mais les libellés doivent le dire clairement.
2. **Statuts** — Parties 4 et 5 : 3 tags (Validé / À perfectionner / Manquant). Partie 6 : on abandonne la note sur 20 affichée au profit de Validé / À perfectionner / À retravailler. Partie 7 : évaluation en percentile (« meilleurs percentiles »).
3. **Lien futur** — Un seul axe suffit : un lien concret et nommé côté école OU côté projet pro valide le critère.
4. **Nombre d'anecdotes** — On garde 3 anecdotes exigées en partie 4.
5. **Actualité** — Un lien avec le projet pro est un plus, pas une obligation. En revanche le sujet doit tendre une perche vers un terrain que le candidat veut amener : école, projet pro, ou expérience personnelle (voyage, sport, expérience pro, etc.).

## Modifications prévues

### Partie 4 — grille d'expérience
- Préciser le critère de hiérarchisation : « la première anecdote est valorisante (pas un échec) ; les échecs se racontent uniquement quand le jury pose la question des défauts ».
- Ajouter au prompt de relecture une consigne explicite : ne jamais reprocher au candidat de ne pas parler d'échec dans la partie 4, et ne pas exiger que l'anecdote 1 illustre un défaut.
- Le critère « Présent → Futur » reste sur un seul axe (déjà en place) ; le prompt rappellera qu'un axe nommé suffit et qu'un domaine de métiers vaut un métier précis.

### Partie 5 — sujets d'actualité
- Reformuler le critère de lien : le sujet doit offrir une passerelle vers au moins un terrain choisi par le candidat (école, projet pro, ou expérience personnelle), le projet pro n'étant pas obligatoire.
- Le prompt cesse d'exiger un rattachement au projet pro et évalue à la place la qualité de la perche tendue.

### Partie 6 — questions clés
- Remplacer l'affichage de la note sur 20 par un verdict à 3 niveaux (Validé / À perfectionner / À retravailler), avec le même style de badge que les parties 4 et 5.
- Le prompt renvoie directement le niveau et une grille critère par critère, plus de note chiffrée.

### Partie 7 — entretien complet
- Remplacer la notation /5 par critère par un positionnement en percentile (ex. « top 20 % des candidats ») accompagné d'une justification courte par bloc.

## Détails techniques

- `src/lib/vivaldi-data.ts` : libellés des critères des parties 4 et 5, mention du triptyque ligne 279 alignée sur « école OU entreprise ».
- `src/lib/ai.functions.ts` : `reviewExperience`, `reviewNewsTopic`, `reviewAnswer` (partie 6) et le débrief de la partie 7 — consignes ajoutées, sortie de la partie 6 passée en 3 niveaux, sortie de la partie 7 en percentile.
- `src/components/vivaldi/AiFeedback.tsx` : réutilisation des badges existants pour les parties 6 et 7.
- `src/routes/_app.partie-6.tsx` et `src/routes/_app.partie-7.tsx` : affichage du verdict / percentile à la place des notes.
- `src/lib/feedback-cache.ts` : bump de version pour recalculer les feedbacks au format modifié.

## Validation

- Typecheck.
- Test preview : une expérience avec anecdote 1 valorisante ne doit plus recevoir de remarque sur l'absence d'échec ; un sujet d'actualité sans lien projet pro mais avec une perche vers une expérience personnelle doit pouvoir être « Validé » ; la partie 6 affiche un niveau et non une note.
