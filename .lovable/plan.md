# Étape 4 — Écrans

## Périmètre

Modifier uniquement les écrans, leurs données et les calculs du tableau de bord. Ne pas toucher au barème, à la notation, à l’évaluateur, au rédacteur, aux textes du jury ni à la configuration ElevenLabs.

## 1. Deux jurys au lieu de trois

**Fichiers concernés**
- `src/lib/interview-kb.ts` : ne proposer que `classique` et `classique_dur`, tout en gardant un alias historique explicite `decouverte → Jury neutre`.
- `src/lib/school-interviews.ts` : les difficultés proposées viennent de cette liste.
- `src/routes/_app.partie-8.tsx` : sélecteur, conseil et libellés de l’historique.
- `src/components/repetia/home.tsx`, `src/components/repetia/site.tsx`, `src/lib/site-content.ts` : mentions publiques des niveaux.
- `src/lib/ai.functions.ts` reste compatible avec `decouverte` pour les anciennes sessions ; aucune logique d’évaluation ou de jury n’est changée.

**Textes actuels → nouveaux**
- Deux options actuelles portent « Jury neutre » (`decouverte` et `classique`) et une porte « Jury dur » → seulement « Jury neutre » (`classique`) et « Jury dur » (`classique_dur`).
- « Trois niveaux d'exigence, de la découverte au jury difficile » → « Deux niveaux d'exigence : un jury neutre et un jury difficile ».
- « Découverte, classique, exigeant : trois niveaux de jury. L'évaluation ne tombe qu'à la fin, comme au concours. » → « Deux niveaux d'exigence : un jury neutre et un jury difficile. L'évaluation ne tombe qu'à la fin, comme au concours. »
- Conseil actuel : « Pour un premier entraînement, nous vous conseillons de choisir l'entretien de découverte, avec un jury un peu plus aidant. Basculez ensuite vers les entretiens classiques, qui vous mettront face aux exigences du jour J. »
- **Proposition à valider** : « Pour un premier entraînement, choisissez le jury neutre, qui conduit l'échange comme le jour J. Passez ensuite au jury dur pour vous entraîner à répondre sous davantage de pression. »

Les sessions anciennes en `decouverte` resteront affichées « Jury neutre » ; elles ne seront ni réécrites ni supprimées.

## 2. Afficher « Ce que ce classement signifie »

**Fichiers concernés**
- `src/components/vivaldi/InterviewDebrief.tsx` : conserver le percentile dans le bandeau et rendre, juste après, la section déjà extraite du feedback.
- `src/routes/_app.partie-8.tsx` : appliquer le même rendu au feedback courant et à l’historique.

**Actuel → nouveau**
- Actuel : le bandeau affiche « Percentile indicatif », `P…` et « Sur cet entretien, vous faites mieux que … % des candidats (± 5 percentiles). » ; le bloc markdown `## Ce que ce classement signifie` est ensuite masqué en entier.
- Nouveau : même bandeau, puis première section « Ce que ce classement signifie » avec uniquement ses 2 ou 3 phrases explicatives, sans répéter la ligne `P…`.

Le même parseur sera utilisé pour les anciens feedbacks et conservera l’alias historique « Positionnement ».

## 3. Tableau de bord

### 3a. « Mes repères »

**Fichiers concernés**
- `src/lib/vivaldi-queries.ts` : lire `interview_sessions.percentile`, `feedback_evaluation_id` et l’évaluation liée (`status`, `interrupted`, `score_20`, `final_score`, `percentile`, `case_points`, `criterion_points`, `grille`). La lecture reste protégée par les règles d’accès propriétaire existantes.
- `src/lib/cockpit.ts` : remplacer l’extraction `P…` depuis le texte du feedback par les colonnes structurées.
- `src/routes/_app.mon-tableau-de-bord.tsx` : texte d’évolution.

**Actuel → nouveau**
- « Évolution sur vos simulations : +X percentiles entre votre première et votre dernière simulation. » est actuellement calculé depuis le markdown et affiché pour tout écart → même phrase, mais seulement si l’écart absolu entre la première et la dernière note atteint 1 point sur 20.
- Sous 1 point → « Évolution sur vos simulations : Niveau stable. »
- Avec moins de deux simulations complètes → conserver « Passez au moins deux simulations complètes pour visualiser votre progression. »

Une simulation compte si son évaluation liée est `ok`, non interrompue et possède note et percentile. Le percentile affiché vient de `interview_sessions.percentile`, avec cohérence vérifiée contre celui de l’évaluation.

### 3b. Radar « Mon niveau par thème »

**Calcul de la part simulations**
1. Prendre les 3 évaluations complètes les plus récentes, dans l’ordre de `interview_sessions.created_at`.
2. Pour chaque entretien et chaque thème, sommer les valeurs de `case_points` retenues.
3. Construire le maximum correspondant depuis `bareme.json`, case par case. Une case `null`/non observée est retirée du numérateur et du maximum ; un thème sans case notée est ignoré pour cet entretien.
4. Convertir en pourcentage, puis faire la moyenne arithmétique des pourcentages disponibles sur les 3 entretiens.
5. Injecter ce score propre à chaque thème dans la combinaison actuelle avec les Questions clés ; les scores, volumes et poids de la part Questions clés ne changent pas.

**Correspondance exacte, toutes grilles**
- Écoles : `ecole`.
- Introspection : le critère de présentation (`presentation`, `presentation_longue_essec`, `presentation_mot_edhec`, `autoportrait_kedge`, `presentation_image_inseec`, `pitch_em_strasbourg`) + `experiences.recit/recul` ou `experiences_montpellier.recit/recul`.
- Projet pro : `projet`.
- Futur : `experiences.projection` ; Montpellier n’a pas cette case, donc n’alimente pas ce thème.
- Aisance orale : `conduite`, `clarte`, `destabilisantes`.
- Exclus du radar : `ouverture`, `mise_en_situation_essec`, `expose_gem`, `interview_inversee_gem`, `article_tbs`, `odd_kedge`, `question_impact_clermont`. Ils restent dans la note et le percentile.

**Légende actuelle → proposition du fondateur à valider**
- Actuelle : « Chaque thème est alimenté par les verdicts du jury IA sur vos questions clés (module « Questions clés ») et par le percentile de vos trois dernières simulations complètes. L'aisance orale pèse davantage sur les simulations, car elle ne s'évalue vraiment qu'en situation. »
- Nouvelle : le texte exact fourni dans `etape-4-ecrans.md`, sans modification avant validation.

## 4. Liste des écoles

**Fichiers concernés**
- `src/lib/vivaldi-data.ts` et `src/routes/_app.informations-personnelles.tsx` : retirer HEC Paris des choix futurs, sans effacer HEC d’un ancien profil.
- `src/lib/school-interviews.ts` : supprimer le format spécial Rennes et faire hériter Rennes et ISC Paris du format classique.
- `src/routes/_app.partie-8.tsx` : options réellement proposées.
- `src/lib/elevenlabs.functions.ts` ne nécessite pas de changement fonctionnel.

**Actuel → nouveau**
- HEC Paris est proposée dans la liste BCE → elle ne l’est plus.
- Rennes : « Rennes SB — format PUMA (mise en situation + débrief) », questionnaire obligatoire, 13 minutes simulées, `comingSoon`, agent dédié déclaré mais secret absent avec repli actuel sur l’agent classique → format classique complet, agent classique partagé, prompt maison, aucun questionnaire, plus de statut « à venir ».
- ISC Paris : aucun format dédié aujourd’hui ; elle utilise déjà le format et l’agent classiques → rendre ce choix explicite/testé, sans changement visible attendu.

## 5. Écrans et phases par école

Toutes ces chaînes viennent de `src/lib/school-interviews.ts` et sont rendues par `InterviewBriefDialog.tsx`. Les changements de séquencement touchent aussi `src/lib/phase-engine.ts` et, pour Montpellier, `src/routes/_app.partie-8.tsx`.

- **ESSEC** — « après une présentation d'environ 5 minutes » → « après une présentation de 3 minutes à 5 minutes 30 » ; « échange libre de 35 minutes » → « échange libre de 40 minutes » ; « L'entretien se termine par vos questions au jury. » → « L'entretien se termine par une question de fin. » ; retirer la phase « Questions du candidat au jury ».
- **emlyon** — « Vous vous présentez librement, sans minutage imposé » → « Vous vous présentez en une minute environ » ; « Puis 10 minutes d'échange libre » → « Puis 8 à 10 minutes d'échange libre » ; « Présentation libre du candidat, sans minutage strict » → « Présentation du candidat, en une minute environ ».
- **EDHEC** — « … sans retour sur l'exercice collectif ni sur la présentation » → « … sans retour sur l'exercice collectif » ; dans le popup, « sans retour sur cet exercice de groupe ni sur votre présentation » → « sans retour sur cet exercice de groupe ».
- **GEM** — « Durée réelle et simulée : 30 minutes (5 + 10 + 15). » → « Durée réelle et simulée : 32 minutes (5 + 2 + 10 + 15). » ; ajouter « Rebond sur l’exposé — 2 minutes » entre exposé et interview inversée.
- **TBS** — détail « Présentation puis entretien de motivation classique sur le parcours, la personnalité et le projet » → « … le parcours, la personnalité, le projet et l'école » ; accueil actuel « … votre présentation, votre parcours et votre motivation » → formulation harmonisée « … votre parcours, votre personnalité, votre projet et l'école ».
- **ESC Clermont** — « … le parcours, la personnalité et le projet » → « … le parcours, la personnalité, le projet et l'école » dans le détail et l’accueil.
- **KEDGE** — « Présentation du parcours et de la personnalité à partir du mot tiré » → « Présentation du parcours à partir du mot tiré ». Le popup réutilise ce détail de phase : une seule source sera modifiée.
- **INSEEC** — « Futur (le lien avec l'école ou votre projet, si naturel) » → « Futur (où cette qualité vous servira, à l'école ou en entreprise) ».
- **Montpellier** — une phase unique « Les situations — 25 minutes » → « Présentation — 1 à 2 minutes », puis situations ; ajouter à l’écran « L'entretien se termine par une question d'actualité. ». La grille restera cachée jusqu’à la réplique existante « Merci. Passons maintenant aux situations : à vous de choisir celle qui vous inspire. » ; « Votre situation en cours » disparaîtra à 20 minutes sans arrêter l’entretien ni modifier le jury.
- **EM Normandie** — « en reprenant vos réponses une à une — y compris la question posée en anglais » → « en s'appuyant sur vos réponses pour les creuser — y compris celle rédigée en anglais ».

## Tests et vérifications

- Niveaux : exactement deux choix ; `decouverte` ancien reste « Jury neutre » ; toutes les mentions publiques passent à deux niveaux.
- Feedback : percentile présent une seule fois ; section explicative première ; compatibilité avec les anciens titres/formats.
- Données structurées : simulations interrompues ou sans évaluation ignorées ; ordre chronologique correct ; seuil d’évolution à `0,99`, `1,00` et `-1,00` point.
- Radar : un test par mapping spécial de présentation, exclusion de chaque critère propre, projection isolée, case non observée ignorée, moyenne des 3 dernières uniquement, Montpellier sans Futur, part Questions clés inchangée.
- Écoles : HEC absente des nouveaux choix ; anciens profils HEC lisibles ; Rennes et ISC sur l’agent/config classiques, sans questionnaire Rennes.
- Phases : textes exacts et calendriers ESSEC/GEM/Montpellier ; déclenchement de la grille Montpellier seulement après la phrase imposée et masquage à 20 minutes ; autres libellés école vérifiés mot pour mot.
- Lancer toute la suite de tests et vérifier la construction et les écrans concernés sur formats ordinateur et mobile.

## Points à valider avant application

1. Le texte de conseil proposé au point 1.
2. La légende du radar fournie par le fondateur.
3. Pour l’évolution, j’utiliserai `final_score` (note sur 20 après éventuelles pénalités), plutôt que `score_20` avant pénalités.
4. Pour TBS, le texte d’accueil actuel ne dit pas exactement « parcours, personnalité, projet » ; je propose de l’harmoniser entièrement en « parcours, personnalité, projet et école », conformément à l’intention du fichier.
