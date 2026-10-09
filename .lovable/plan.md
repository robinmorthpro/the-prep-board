# Étape 3 — Nouveau texte du jury vocal

## Résultat visé

Remplacer le texte injecté à l’agent ElevenLabs par les nouveaux textes communs et les 15 variantes école, puis aligner la régie applicative sur ces textes. L’agent ElevenLabs, sa voix et sa configuration dans le tableau de bord ElevenLabs restent inchangés : tout sera fourni par les `overrides` de l’application.

Les deux références ont déjà été contrôlées :
- `jury-commun.md` : `66c80177b87ae57678c516ed9a7ed8ccceb0ce2cd0582d2fe7907e1264c715d7`
- `jury-ecoles-final.md` : `4111cab825f9326463468a7d3b930931c443fcb08a66aa8a9338ee863d4d94c6`

## Fichiers, précisément

### Textes et construction du prompt

- **Créer `src/lib/jury/textes/jury-commun.md`** par copie exacte du fichier final, puis contrôler son SHA-256.
- **Créer `src/lib/jury/textes/jury-ecoles-final.md`** par copie exacte du fichier final, puis contrôler son SHA-256.
- **Modifier `src/lib/elevenlabs-agent-prompt.ts`** pour importer ces références en `?raw`, résoudre les variables dynamiques et assembler le prompt réellement envoyé. Les lignes `Réglage du code :` resteront des spécifications, jamais du texte envoyé au jury. La dernière section `[RÉGIE]` du texte commun restera hors prompt et sera envoyée par le moteur de phases.
- **Modifier `src/lib/interview-kb.ts`** uniquement pour le niveau joué : `classique` → « Jury neutre », `classique_dur` → « Jury dur », et `decouverte` → même texte neutre. La valeur historique `decouverte` reste acceptée ; aucun écran ni enregistrement existant ne change.
- **Modifier `src/lib/school-interviews.ts`** pour les premiers messages, deuxièmes répliques, consignes d’ouverture, conduites, phrases de transition, calendriers et mesures propres aux écoles.
- **Modifier `src/hooks/useJuryAgent.ts`** seulement si nécessaire pour transmettre les nouveaux blocs/variables sans changer la connexion ElevenLabs ni la voix.

### Régie et déclencheurs

- **Modifier `src/lib/phase-engine.ts`** pour :
  - ne plus ajouter systématiquement « Termine… par une question » quand une phrase imposée, un silence ou une étape sans question est attendu ;
  - distinguer une phase imposée d’un échange libre ;
  - envoyer en échange libre le rappel court « Tu es dans… encore environ N min : ne change pas de partie » ;
  - gérer les exceptions ESSEC, GEM, Montpellier et emlyon ;
  - éviter une seconde consigne de clôture quand la sortie anticipée contient déjà la question finale.
- **Modifier `src/lib/interview-text.ts`** pour reconnaître « quelques secondes pour réfléchir » comme une invitation et empêcher une question parasite.
- **Modifier `src/routes/_app.partie-8.tsx`** uniquement pour les déclencheurs non visuels : pauses de régie, début/fin de mesure, bascules reconnues et rappels. Aucun texte ni comportement d’écran ne sera retouché.
- **Modifier `src/lib/essec-kb.ts` et `src/lib/vivaldi-data.ts`** seulement après résolution du point ESSEC ci-dessous, afin que le module Questions clés et le jury utilisent une répartition explicitement partagée.
- **Modifier `src/lib/emlyon-kb.ts`** pour exposer l’étiquette de thème de chaque carte, nécessaire au rappel de transition vers l’échange libre, sans enregistrer les tirages en base.

### Tests

- **Modifier `src/lib/elevenlabs-agent-prompt.test.ts`** : texte commun reconstruit exactement, variables résolues, absence des lignes explicatives/régie, deux niveaux seulement au runtime.
- **Créer `src/lib/school-interviews.test.ts`** : pour chacune des 15 écoles, vérifier premier message, deuxième réplique éventuelle, ouverture, conduite, phrases imposées et variables.
- **Modifier `src/lib/phase-engine.test.ts`** : repères imposés/libres, suffixe question conditionnel, rappels commun/sans actualité/Montpellier, sorties anticipées et exceptions école.
- **Modifier `src/lib/interview-text.test.ts`** : invitation ESSEC et absence de question parasite.
- **Ajouter/adapter les tests de mesure** : seuils exacts du barème, démarrage/arrêt et reprises de monologue.
- Exécuter tous les tests, contrôler les deux SHA-256 et vérifier la construction.

## Changements école par école

1. **ESSEC** — textes finaux exacts ; présentation 5 min et échange libre 40 min ; cas ordonné à 35 min pour 8 min ; repères libres raccourcis ; pas de suffixe-question à l’entrée du cas ; pause d’environ 30 s après « réfléchir » ; invitation reconnue ; clôture non doublée ; mesure de présentation **2 min 30 à 5 min 30**. Le jury tirera dans le complément du module Questions clés selon la décision à confirmer ci-dessous.
2. **emlyon** — textes exacts ; présentation 3 min, cartes 15 min, échange libre 9 min ; seuil cartes 12 min 45 inchangé ; garde-fou « deux repères » neutralisé ; transition anticipée reconnue ; rappel calculé à partir des thèmes réellement tirés ; chronomètre des cartes démarré avec la première réponse à la première carte.
3. **EDHEC** — textes exacts ; ouverture commune simplifiée ; mesure de présentation corrigée à **3 min 15 sur 4 min** ; silences applicatifs suspendus jusqu’à la transition vers l’entretien individuel ; rappel des deux tiers conservé sur la durée totale de 25 min. La variable `edhec_mot` reste disponible mais n’est pas injectée dans un texte qui ne l’emploie pas.
4. **GEM** — textes exacts ; durée totale **32 min** ; exposé + rebond jusqu’à la minute 7, interview inversée 10 min, échange libre 15 min ; mesure de l’exposé **4 min 15 sur 5 min** seulement, sans inclure les 2 min de rebond ; interview inversée à partir de la minute 7 ; enveloppes sans suffixe-question pour l’interview inversée et la minute de synthèse ; silences suspendus pendant l’interview inversée hors synthèse ; reprise du candidat incluse dans la mesure de l’exposé ; rappel sans actualité.
5. **TBS Education** — textes exacts ; ouverture simplifiée ; rappel sans actualité ; repères libres non contradictoires ; mesure **4 min 15 sur 5 min** inchangée.
6. **ESC Clermont BS** — textes exacts ; ouverture simplifiée ; rappel sans actualité ; mesure **4 min 15 sur 5 min** inchangée.
7. **KEDGE** — textes exacts ; suppression de la phase technique `kedge-conclusion` au profit de la clôture commune ; seuil Autoportrait **2 min 30** au lieu de 2 min 33 ; libellé de mesure sans « (C1) » ; conduite et transitions alignées sur le texte final.
8. **INSEEC Grande École** — textes exacts ; repère propre à la présentation par l’image ; aucun lien école/projet ni contradiction imposés dans cette partie ; passage vers l’échange classique sans suffixe-question parasite ; rappel et échange libre communs ensuite ; mesure **4 min 15 sur 5 min** inchangée.
9. **Montpellier BS** — textes exacts ; maintien du rappel spécifique des deux tiers ; phrase de passage sans suffixe-question ; interdiction de forcer projet/école ; aucun changement de l’écran de choix des situations.
10. **EM Strasbourg** — textes exacts ; conduite sur plusieurs lignes ; ajout de la mesure du pitch **2 min 30 sur 3 min**, démarrée à la deuxième prise de parole du jury selon la spécification.
11. **ESCP** — textes exacts ; nouvelle ouverture dédiée aux écoles avec document, sans deuxième réplique ; conduite multiligne.
12. **NEOMA** — même branche « document » dédiée ; textes exacts ; conduite multiligne.
13. **SKEMA** — même branche « document » dédiée ; textes exacts ; conduite multiligne.
14. **EM Normandie** — même branche « document » dédiée ; textes exacts ; conduite multiligne.
15. **BSB** — même branche « document » dédiée ; textes exacts ; conduite multiligne.

## Alignement avec le barème intégré

Différences à corriger dans `MONOLOGUE_MEASURES` / `floorMinutes` :
- ESSEC : `3` → `2.5` ; maximum `5.5` conservé.
- EDHEC : `3 + 25/60` → `3.25`.
- GEM exposé : ajout de `4.25` pour une durée notée de 5 min ; l’interview inversée reste à `8.5/10`.
- KEDGE : `2.55` → `2.5`, et libellé nettoyé.
- EM Strasbourg : ajout de `2.5/3`.
- emlyon `12.75/15`, TBS, Clermont et INSEEC `4.25/5` sont déjà alignés et resteront inchangés.

## Corrections retenues ou laissées de côté

### Retenues

- Repères conditionnels et distinction phase imposée/échange libre.
- Trois rappels : commun, sans actualité pour GEM/TBS/Clermont, propre à Montpellier.
- Ouverture dédiée aux cinq écoles à document et ouverture commune simplifiée ailleurs.
- Deux niveaux de jury au runtime, avec repli de `decouverte` vers neutre.
- Mesures, seuils, calendriers et durées listés ci-dessus.
- Déclencheurs ESSEC, emlyon, GEM et silences dont le comportement est spécifié sans ambiguïté.
- Tests de prompt, régie, transitions, mesures et compatibilité historique.

### Laissées volontairement

- Tous les changements marqués **Écran** : conseils, accueil, site, fenêtres, détail visuel des phases et libellé historique des anciens entretiens.
- Tableau de bord « +X percentiles ».
- `debriefSupplement`, évaluateur, barème et rédacteur.
- Enregistrement des tirages en base.
- Points explicitement notés **« à vérifier au test »** : réglage fin de tour ElevenLabs, micro/synthèse GEM, pauses orales qui pourraient couper un monologue. Ils seront signalés dans le compte rendu, pas modifiés à l’aveugle.
- Toute nouvelle voix, tout agent supplémentaire et toute modification dans le tableau de bord ElevenLabs.

## Deux confirmations nécessaires

1. **ESSEC : conflit dans les pièces.** Le texte final demande que le jury tire les numéros pairs, complément exact des numéros impairs affichés dans Questions clés. `corrections-code-3.4.md` demande aussi de passer les numéros 24 et 30 en « Créativité » et vise 3 situations par compétence, mais ces deux retouches ne donnent pas 3/3/3/3/3 avec la liste actuelle. Proposition : faire primer le texte final — partage impair/pair exact, sans retoucher les catégories 24/30 — et signaler la répartition obtenue.
2. **emlyon : déclenchement des cartes.** « Après la réponse à la présentation » est ambigu quand la présentation arrive en plusieurs morceaux. Proposition robuste : laisser le prompt demander la fin de présentation et démarrer les cartes sur la transition réellement prononcée par le jury, plutôt que sur le premier silence détecté ; aucun délai ElevenLabs ne sera changé.

Après confirmation de ces deux choix, l’exécution ne nécessitera aucune action dans ElevenLabs.
