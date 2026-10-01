# Partie 7 — niveaux de difficulté au lieu d'« attitude du jury »

## 1. Le sélecteur

Le label du menu devient **Difficulté**, et les trois options sont réordonnées et renommées :

1. **Entretien de découverte — jury aidant** (l'actuelle variante C)
2. **Entretien classique — jury normal** (l'actuelle variante A)
3. **Entretien classique — jury plus dur** (l'actuelle variante B)

Sous le sélecteur, une phrase de conseil : pour un premier entraînement, choisir l'entretien de découverte, où le jury ouvre lui-même les portes et accompagne ; puis basculer vers les entretiens classiques, qui exigent de produire la matière soi-même.

Les codes internes deviennent `decouverte`, `classique`, `classique_dur` — plus de lettres A/B/C, qui devenaient trompeuses après réordonnancement. Les anciennes sessions déjà enregistrées gardent leur libellé d'origine dans l'historique.

## 2. Une vraie différence de fond, de forme et d'exigence

Aujourd'hui, les trois variantes ne changent presque que le ton : le prompt du jury reçoit la même trame, la même banque de questions et les mêmes douze cases quel que soit le choix. C'est ce qui explique que la différence ne se voit pas assez. Chaque niveau reçoit donc son propre cadrage.

**Découverte — jury aidant**
- Fond : uniquement les questions simples et concrètes de la banque (se présenter, raconter une expérience, une qualité, pourquoi une école de commerce, où vous voyez-vous). Aucune question déstabilisante, aucune mise en situation, aucune question de région ou de management.
- Forme : le jury ouvre lui-même les portes, une question = un seul objet, il reformule et propose un autre angle quand ça bloque, il annonce ses transitions.
- Profondeur : s'arrête au cran du « pourquoi ». Ni preuve, ni limite.
- Exigences : les douze cases restent la cible, mais le cycle est raccourci comme le prévoit la trame — le fait, la scène, une seule qualité, une projection minimale.

**Classique — jury normal**
- Fond : banque complète, douze cases, une question déstabilisante possible si le candidat a convaincu.
- Forme : ton chaleureux, reformulations, transitions explicites, interruptions rares et annoncées.
- Profondeur : crans concret et pourquoi systématiques, preuve dès que le candidat tient, limite s'il tient la preuve.

**Classique — jury plus dur**
- Forme : ton neutre, aucune approbation, aucune reformulation, pas de transition, interruptions franches, rythme plus rapide. Les deux dernières minutes repassent en attitude bienveillante, comme le prévoit la trame.
- Fond : questions plus exigeantes prises dans la banque — familles déstabilisantes, mise en situation, management, actualité, région entrent dans le jeu, et le jury croise deux réponses éloignées pour les faire tenir ensemble.
- Profondeur : creusement plus poussé. La preuve devient systématique dès la deuxième relance sur un sujet, la limite est demandée dès que le candidat tient la preuve, et les ordres de grandeur, acteurs nommés et plan B sont exigés.
- Arbitrage assumé : la trame dit que la dureté ne porte que sur l'attitude et que le fond est identique au jury normal. Ce niveau s'en écarte volontairement, sur ta décision, pour que la marche de difficulté soit réellement perceptible. Les garde-fous de la trame restent en vigueur : jamais agressif, jamais méprisant, jamais ironique, bascule obligatoire en bienveillance si le candidat se ferme, se dévalorise ou perd le fil deux fois de suite.

Le niveau est aussi injecté dans le calibrage du débrief : en découverte, le percentile reste calculé sur ce que le candidat a produit avec l'aide du jury, et l'échafaudage reçu est signalé explicitement dans la synthèse ; en jury plus dur, aucun point n'est retiré pour une hésitation causée par l'absence de signaux, et le débrief précise que le creusement était renforcé.


## 3. Le niveau visible dans les feedbacks et l'historique

- Le débrief affiche en tête un badge **Difficulté : …** avec le libellé complet du niveau joué.
- Chaque ligne de l'historique affiche ce même badge à côté de l'école et de la date, et le détail déplié le rappelle au-dessus du fil des échanges.
- Le niveau est stocké dans une colonne dédiée `difficulty` de `interview_sessions` (migration + valeur par défaut pour les lignes existantes), au lieu d'être concaténé dans le champ « école » comme aujourd'hui.

## Détails techniques

- `src/lib/interview-kb.ts` : `INTERVIEW_VARIANTS` réécrit (nouveaux codes, ordre, labels, hints) et enrichi de trois champs par niveau : `questionScope`, `depth`, `checklist`. `INTERVIEW_TRAME` est découpé pour que la partie « cases à cocher » et « crans de creusement » soit paramétrable par niveau.
- `src/lib/ai.functions.ts` : `jurySystem()` compose la trame avec le périmètre de questions, la profondeur et la checklist du niveau ; les schémas Zod passent de `z.enum(["A","B","C"])` à l'enum des nouveaux codes ; `debriefInterview` reçoit le libellé du niveau et le rappelle en tête de sortie.
- Migration : `ALTER TABLE interview_sessions ADD COLUMN difficulty text`, backfill des lignes existantes, GRANT déjà en place.
- `src/lib/vivaldi-queries.ts` : `InterviewSession` gagne `difficulty`.
- `src/routes/_app.partie-7.tsx` : label « Difficulté », phrase de conseil, insert avec `difficulty`, badge dans l'historique.
- `src/components/vivaldi/InterviewDebrief.tsx` : accepte et affiche le badge de difficulté.

## Vérification
Lancer un entretien à chaque niveau et comparer les 3 premières questions et le cadrage du débrief, pour confirmer que la différence est audible.
