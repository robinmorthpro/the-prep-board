# Regrouper les questions Clermont sous une seule section

Aujourd'hui les 36 questions Clermont sont réparties en trois sections distinctes (« Clermont SB - People », « Clermont SB - Planet », « Clermont SB - Profit ») dans le module « Questions clés ». Elles n'apparaissent pas sur votre écran parce que l'affichage est réservé aux candidats dont les écoles visées contiennent « ESC Clermont BS », ce qui n'est pas le cas de votre profil (EDHEC, ESCP, emlyon, KEDGE, NEOMA, SKEMA, Rennes, TBS). Le filtrage est conservé tel quel.

## Ce qui change

- Une seule section « Clermont SB » (emoji dédié), avec le total de 36 questions affiché.
- À l'ouverture de la section, trois sous-parties apparaissent dans l'ordre : People 🤝, Planet 🌍, Profit 💰, chacune avec son intitulé, son nombre de questions et la liste de ses 12 questions.
- Les questions elles-mêmes, leurs consignes et leurs statuts de progression restent identiques ; aucune progression n'est perdue.
- Le comportement des autres sections du module reste inchangé.

## Détails techniques

- `src/lib/vivaldi-data.ts` : remplacer les trois entrées de `KEY_QUESTION_THEMES` par une seule `"Clermont SB"` ; ajouter un champ optionnel `subTheme` au type `KeyQuestion` et passer les 36 questions Clermont sur `theme: "Clermont SB"` avec `subTheme: "People" | "Planet" | "Profit"`. Les `id` (`clermont-people-01`…) ne changent pas, donc les réponses déjà enregistrées restent rattachées.
- `src/routes/_app.partie-7.tsx` : `THEME_EMOJI` et `SCHOOL_RESERVED_THEMES` ne référencent plus que `"Clermont SB"` ; dans le rendu d'une section, si ses questions portent un `subTheme`, les grouper par sous-thème (ordre People, Planet, Profit) avec un intitulé et un compteur, au lieu d'une liste plate. Les sections sans `subTheme` gardent le rendu actuel.
- Vérification : `bunx tsgo --noEmit`.
