# Étape 2 : le nouveau rédacteur du feedback

## Ce qui change pour l'utilisateur
Rien à l'écran : même écran de chargement, même affichage du feedback (les 4 sections, VERBATIMS: / FEEDBACK:). Seul le texte vient désormais du rédacteur, qui s'appuie sur l'évaluation de l'étape 1. Si quoi que ce soit échoue, l'ancien debrief est produit comme aujourd'hui.

## Déroulé à la fin de l'entretien

```text
Fin d'entretien
  -> session enregistrée (tours, durées, statut final « done » / « stopped »)   [attendu]
  -> évaluation (étape 1)                                                       [attendue]
       statut « ok » ?  non -> ancien debrief (debriefInterview), source « ancien »
  -> rédacteur                                                                  [attendu]
       échec ?          oui -> ancien debrief, source « ancien »
  -> feedback enregistré (texte + percentile + source) -> affichage
```

- Interrupteur : une constante `NOUVEAU_FEEDBACK_ACTIF` (true). Sur false, tout le monde reçoit l'ancien debrief, en une ligne.
- L'appel en arrière-plan de l'étape 1 est retiré, puisque l'évaluation est maintenant attendue dans l'enchaînement. Cela évite une double évaluation. L'outil administrateur `rerunEvaluation` ne change pas.
- `debriefInterview` et ses suppléments d'école ne sont ni modifiés ni supprimés.

## 1. Les 13 textes
- Les 10 fichiers joints sont copiés par `cp` dans `src/lib/redacteur/textes/` (`redacteur-commun.md`, `criteres.md`) et `src/lib/redacteur/textes/ecoles/`, puis contrôlés par sha256. Les 3 fichiers restants seront copiés de la même façon au message de validation.
- Règle de nommage : les fichiers joints s'appellent `essec-2.md`, `emlyon-2.md`, etc. Ils sont copiés sous les noms que vous avez donnés (`essec.md`, `emlyon.md`…). Seul le nom change, le contenu reste identique octet pour octet.
- Ils sont ajoutés à `.prettierignore` pour ne jamais être reformatés, et chargés par import `?raw`.
- Correspondance école → bloc : une table dans le code, d'après votre liste. Elle s'appuie sur les noms d'école réellement enregistrés, avec la même table d'alias qu'à l'étape 1. Les autres écoles n'ont pas de bloc.

## 2. Appel du rédacteur (fonction serveur authentifiée `redigerFeedback`)
- Entrée : identifiant de la session et identifiant de l'évaluation retenue. Les deux sont relus en base sous l'identité de l'utilisateur, qui ne voit que les siens. Le contexte des modules est transmis comme aujourd'hui.
- Message système : `redacteur-commun.md` + `criteres.md` + le bloc de l'école, séparés par une ligne vide. Puis, seulement si c'est le cas, vos deux paragraphes tels quels (document remis, image INSEEC).
- Message utilisateur, dans votre ordre :
  1. l'école ;
  2. le jury joué ;
  3. « Entretien interrompu : oui/non » ;
  4. le JSON de l'évaluation ;
  5. le bloc « calculé par le code » : percentile, pénalités retenues (durée mesurée et seuil), critères non notés, cases évaluées classées par points perdus avec les noms du critère et de la case ;
  6. `contextBlock` (réutilisé tel quel) ;
  7. la transcription horodatée de l'étape 1 ;
  8. « CONTENU DU SUPPORT (libellé) », s'il y a un support.
- Passerelle Lovable AI, `google/gemini-3.7-flash`, température 0. Le modèle peut être changé par appel, comme à l'étape 1.

## 3. Traitement du texte par le code (fonctions pures)
- Ligne du percentile insérée juste sous « ## Ce que ce classement signifie », au format exact : `P67 - vous faites mieux que 67 % des candidats (± 5 percentiles).` Si l'entretien est interrompu, c'est la ligne exacte « Entretien interrompu : pas de note ni de percentile. Voici un retour sur ce que vous avez fait. » qui est insérée.
- Citations : chaque « … » d'une ligne VERBATIMS est recherchée dans la transcription ou le document remis, avec la normalisation de l'étape 1. Une citation introuvable est retirée ; si une ligne VERBATIMS se retrouve vide, elle est gardée vide.
- Contrôle : s'il manque une des 4 sections, ou si « P » suivi d'un nombre apparaît dans le texte rendu, un seul nouvel appel est fait. Si ça échoue encore, le rédacteur est considéré en échec et l'ancien debrief prend le relais.
- Les citations retirées sont journalisées côté serveur, pour contrôle.

## 4. Base de données (migration)
```sql
ALTER TABLE public.interview_sessions
  ADD COLUMN percentile integer NULL CHECK (percentile BETWEEN 1 AND 99),
  ADD COLUMN feedback_source text NULL CHECK (feedback_source IN ('nouveau','ancien')),
  ADD COLUMN feedback_evaluation_id uuid NULL REFERENCES public.interview_evaluations(id);
```
- Aucune règle d'accès ne change : les règles actuelles de la session s'appliquent.
- `feedback_evaluation_id` indique quelle évaluation a servi au feedback.
- Avec l'ancien debrief, le percentile est lu dans son texte comme aujourd'hui, et vide s'il n'y en a pas.

## 5. Tests
- Automatiques :
  - insertion de la ligne du percentile ;
  - ligne « Entretien interrompu » ;
  - citation inventée retirée ;
  - citation vraie gardée (y compris une citation du document remis) ;
  - contrôle « P + nombre » et section manquante ;
  - secours vers l'ancien debrief quand l'évaluation est « invalide », quand elle échoue et quand le rédacteur échoue (enchaînement testé avec des appels simulés) ;
  - choix du bloc d'école.
- Test réel : l'entretien fictif NEOMA avec Gemini (évaluation puis rédaction). Je vous montre le feedback complet et la durée totale.

## Durée attendue pour l'utilisateur
- Évaluation : environ 25 s (1 appel) à 50 s (2 appels), d'après l'étape 1.
- Rédaction : environ 20 à 40 s (estimation, à mesurer au test réel).
- Total : environ 45 s à 1 min 30, contre un seul appel aujourd'hui.
- En cas de secours : on ajoute la durée de l'ancien debrief, donc jusqu'à environ 2 min.

## Fichiers
- Créés :
  - les 13 textes ;
  - dans `src/lib/redacteur/` : `textes.ts`, `message.ts` (message système et utilisateur), `texte.ts` (percentile, citations, contrôles), `run.ts`, et leurs tests ;
  - `src/lib/redacteur.functions.ts` ;
  - `src/lib/feedback-enchainement.ts` (enchaînement et secours, testable).
- Modifiés :
  - `src/routes/_app.partie-8.tsx` : uniquement la fonction de fin d'entretien et l'enregistrement (`persist`) des nouvelles colonnes ;
  - `src/lib/evaluateur.functions.ts` : `evaluateInterview` renvoie aussi l'identifiant de l'évaluation enregistrée ;
  - `.prettierignore`, `AGENTS.md`, `roadmap.md`.
- Inchangés : `debriefInterview`, `InterviewDebrief.tsx`, le tableau de bord, le jury vocal.

## Questions
1. **Jury joué** : l'app a trois niveaux (`decouverte`, `classique`, `classique_dur`). Je propose `classique_dur` → « Jury dur », les deux autres → « Jury neutre ». D'accord ?
2. **Statut à l'évaluation** : aujourd'hui la session est en « debriefing » pendant le debrief. Je propose d'enregistrer le statut final (« done » ou « stopped ») avant d'évaluer, pour que l'évaluateur voie bien un entretien terminé ou interrompu. D'accord ?
3. **Citations du document** : le texte commun permet de citer le document remis. Je cherche donc chaque citation dans la transcription OU dans le document. D'accord ?

## Risques
- Attente plus longue : environ 1 min au lieu d'un seul appel. Ça ne change rien à l'écran de chargement.
- Une évaluation « invalide » coûte l'attente de l'évaluation, plus celle de l'ancien debrief.
- Le percentile du tableau de bord se lit toujours dans le texte (`P67`). Le format de la ligne insérée est identique, donc rien ne change de ce côté.
- Les 3 textes manquants sont nécessaires avant la mise en service. Montpellier, EM Strasbourg et les 5 écoles « à document » tomberaient sinon sans bloc.
