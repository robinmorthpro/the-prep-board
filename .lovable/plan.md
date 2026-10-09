# Étape 3.5 — Banc d'essai complet

Rien ne change dans l'application elle-même. Ce qui change : le banc (`scripts/`), deux tables réservées à l'admin, et des tests.

## 1. `scripts/jury-bench-run.ts` remis sur l'app actuelle

- **Retiré** : les versions old / new / v2, `OLD_COMMIT`, `oldPrompts`, les campagnes « ordre d'envoi », « mode écrit » et « oral », les rapports de comparaison et l'écriture de fichiers dans `scripts/bench-output/`. Le dossier est supprimé (46 fichiers) et ajouté au `.gitignore`.
- **Importé depuis `src/`** : tout ce qui a une source dans l'app.
  - Le jury : `buildJuryAgentPrompt`, `buildAgentIdentity`, `difficultyBlock` et les textes de `src/lib/jury/`.
  - L'entretien : configuration de l'école, premier message, deuxième réplique, consigne d'ouverture et déroulé des phases (`school-interviews.ts`), moteur de phases et préfixe de régie (`phase-engine.ts`), règle des 5 s d'emlyon (`emlyon-trigger.ts`), découpage des réponses (`interview-text.ts`).
  - Les tirages, dans les seules piles du jury : `drawEmlyonCards`, `pickEdhecWord`, `CLERMONT_IMPACT_JURY` via `buildClermontImpactVariables`, `pickEssecSituationTiree`, `drawKedgeCards`, `pickGemPersona`, et l'article TBS de `tbs-articles.ts`. Le tout est assemblé par `src/lib/tirages.ts`.
  - La notation : `evaluerSession` puis `redigerFeedbackSession`, sans aucune modification.
- **Ce qui reste recopié de `src/routes/_app.partie-8.tsx`**, parce que c'est écrit dans le composant et pas dans une fonction exportée :
  1. l'assemblage des variables envoyées au jury (bloc `agent.start`) ;
  2. la construction de l'objet `tirages` au démarrage ;
  3. les secours du jury : question Impact de Clermont, annonce des cartes emlyon, « main rendue sans question » ;
  4. le compte des silences et les règles de pause (30 s de l'ESSEC, présentation EDHEC, interview inversée GEM) ;
  5. la suite de la présentation EDHEC (`edhecStage`) et le choix de situation de Montpellier.

  Ces blocs sont recopiés tels quels en tête du script, entre balises `// RECOPIE partie-8 : <nom>`. Pour chacun, le script garde l'empreinte SHA-256 du texte source (lignes repérées par des marqueurs de début et de fin, sans dépendre des numéros de ligne).
- **Test de divergence** (`src/lib/bench-recopie.test.ts`) : il relit `_app.partie-8.tsx`, extrait chaque bloc et compare son empreinte à celle du script. Si la source change, le test échoue et nomme le bloc concerné. Comme on ne touche pas à l'app, je repère les blocs par des phrases déjà présentes dans le code, sans ajouter de commentaire-marqueur.
- **Horloge virtuelle** : la même qu'aujourd'hui. Durée d'une prise de parole du candidat = nombre de mots / 150 mots par minute. Le jury reste au débit actuel du banc. Les silences (5 s d'emlyon, 30 s de l'ESSEC) sont avancés sur l'horloge sans attente réelle. Les mesures de durée (`phase_timings`) viennent du moteur de phases, exactement comme dans l'app.

## 2. Le candidat joué par une IA

- **Modèle** : `anthropic/claude-sonnet-5`, appelé par la passerelle sur `/v1/messages` en flux, la méthode déjà utilisée par `gateway.ts`.
- **Consigne fixe** :
  - « Tu es [prénom], candidat en 2e année de prépa ECG, à l'oral d'admission de [école]. »
  - Il parle comme à l'oral : phrases parlées, quelques hésitations selon le profil, aucune mise en forme.
  - Il ne sort jamais de son rôle et ne connaît que son profil. Il n'invente rien de précis sur l'école au-delà de ce que son profil lui donne.
  - Une longueur cible lui est donnée en mots. Exemple : 40 s à 1 min 30 donne 100 à 225 mots, tirés au hasard à partir de la graine.
- **Les consignes [RÉGIE] ne lui parviennent jamais** : elles sont retirées de ce qu'il reçoit, avec `isRegieMessage` et `cleanJuryMessage`. Un test le vérifie.
- **Les durées sont réalistes à deux niveaux** :
  1. la consigne vise un nombre de mots ;
  2. le code contrôle le résultat : une réponse en dehors de la fourchette de plus de 30 % est redemandée une fois.

  Pour les présentations, pitchs et exposés, la cible vient de la durée attendue par l'école, ou de la durée imposée par un scénario « trop court ».
- **5 profils**, dans un nouveau fichier `scripts/bench-profils.json` : excellent, bon, moyen, faible, passif, avec tous les champs de la spécification. Je rédige les profils (contenu inventé) et je vous les montre avant le pilote. Ce que chaque profil sait de l'école reste générique et commun à toutes les écoles.
- **Scénarios**, dans `scripts/bench-scenarios.ts` : « normal », plus les 13 cas limites. Chaque cas limite ajoute une consigne au candidat, par exemple « tu arrêtes à la 10e minute », ou un réglage de durée (exposé de 3 min, pitch de 1 min 30…). L'arrêt de TBS est joué comme le bouton « Arrêter » de l'app : statut `stopped`.

## 3. Documents des 5 écoles à document

- ESCP, NEOMA, SKEMA, EM Normandie et BSB : Claude Sonnet 5 remplit, à partir du profil, exactement les questions du document de l'école prises dans `src/lib/supports-kb.ts` (CV projectif ou questionnaire, avec les mêmes intitulés). Il ne se sert que du profil.
- Le texte est mis en forme comme `support_text` dans l'app, puis passé au jury dans la même variable et avec le même libellé. Il est enregistré dans la session du banc (`document`). Le même document sert devant les deux jurys.

## 4. Les deux tables (migration)

Les deux tables ne sont accessibles qu'aux comptes qui ont le rôle admin, par `has_role(auth.uid(), 'admin')`. Aucun autre compte ne peut les lire, et aucune lecture n'est ouverte aux visiteurs.

**`bench_runs`** (un entretien) :
- `lot`, `ecole`, `jury` (`classique` / `classique_dur`), `profil`, `scenario`, `graine`, `essai_n`
- `turns` (jsonb, même format que `interview_sessions.turns`), `phase_timings`, `tirages`, `document`, `support_label`
- `conversation_id` (ElevenLabs), `duree_ms`, `duree_simulee_s`
- `cout_jury_estime`, `cout_candidat_estime`, `jetons_candidat` (jsonb)
- `statut` (`en_cours` / `ok` / `erreur` / `interrompu`), `erreurs` (jsonb)
- `created_at`, `updated_at`
- un index unique sur (`lot`, `ecole`, `jury`, `scenario`, `graine`), qui sert à la reprise

**`bench_results`** (une notation) :
- `run_id` → `bench_runs`, `modele`, `essai_n`
- `evaluation_brute` (sortie complète), `status`, `attempts`, `case_points`, `criterion_points`, `unrated_criteria`, `penalties`, `score_20`, `final_score`, `percentile`, `warnings`
- `feedback`, `citations_retirees`
- `duree_eval_ms`, `duree_redaction_ms`, `jetons` (jsonb, par étape), `cout_estime`, `erreurs`
- `created_at`
- un index unique sur (`run_id`, `modele`, `essai_n`)

**Droits** : le compte admin peut lire et modifier les deux tables, et le service (`service_role`) a tous les droits. Le banc écrit avec le service, uniquement depuis la machine de travail, jamais depuis le navigateur. Comme il n'y a pas d'interface dans l'app, la lecture admin servira à des requêtes ou à un futur écran.

## 5. La chaîne évaluateur + rédacteur, sans compte utilisateur

- Le banc appelle directement `evaluerSession(sessionDuBanc, { model, triggeredBy: "bench" })` puis `redigerFeedbackSession(sessionDuBanc, eval, contexte, { model })`. Ce sont les fonctions internes des fonctions serveur, sans passer par `createServerFn` ni par la connexion.
- La « session du banc » a la même forme qu'une ligne de `interview_sessions` : école, niveau de jury, tours, mesures, tirages, document. Le `user_id` est fixe et ne sert qu'à la forme de l'objet. Rien n'est écrit dans `interview_evaluations` ni dans `interview_sessions`.
- Le contexte du rédacteur est construit avec `contextBlock` (de `ai.functions.ts`) à partir du profil, comme l'app le fait avec les fiches de l'élève.
- Deux modèles, l'un après l'autre :
  - A : `google/gemini-3.7-flash`
  - B : `anthropic/claude-sonnet-5`

  Le rédacteur ne tourne que si l'évaluation est « ok ». Sinon, la ligne est enregistrée avec son statut et ses erreurs.
- **Stabilité** : pour 10 entretiens d'écoles différentes, l'évaluateur seul est relancé 3 fois par modèle (`essai_n` 1 à 3), sans rédacteur. Si vous voulez aussi relancer le rédacteur, dites-le.

## 6. Où et comment le banc s'exécute

- **Lieu** : sur ma machine de travail (le bac à sable), avec `bun scripts/jury-bench-run.ts --lot <nom> --plan pilote|principal|limites|stabilite`. Les clés ElevenLabs, passerelle et service Supabase y sont déjà présentes, et vérifiées.
- **Ordre** : les entretiens d'un lot s'enchaînent un par un. L'agent ElevenLabs ne supporte que peu de conversations à la fois, et la passerelle partage une seule limite d'appels. Les notations d'un entretien terminé tournent en parallèle de l'entretien suivant, avec 2 au plus en même temps.
- **Durée estimée** :
  - Un entretien de 25 à 30 min simulées compte environ 40 à 60 échanges. Chaque échange prend environ 3 à 8 s pour le jury, en texte, et 5 à 15 s pour le candidat. Total : environ **10 à 15 min réelles par entretien**.
  - Notation par modèle : environ 1 min avec Gemini (35 s + 24 s au dernier essai), 2 à 3 min avec Claude.
  - Lot principal (46 entretiens) : **environ 9 à 12 h**. Cas limites : environ 3 h. Stabilité : environ 1 h 30.
  - Une commande ne peut pas dépasser 10 minutes : le banc tourne en arrière-plan et j'en suis l'avancement. Il faudra plusieurs tours de conversation pour un grand lot.
- **Reprise** : avant chaque entretien, le banc cherche (`lot`, `ecole`, `jury`, `scenario`, `graine`).
  - Statut `ok` : il passe directement à la notation manquante.
  - `erreur` ou `en_cours` (coupure) : il rejoue l'entretien en remplaçant la ligne.
  - Une notation (`run_id`, `modele`, `essai_n`) déjà « ok » n'est jamais refaite.
- **Erreurs de la passerelle** : les erreurs 429 et 5xx sont relancées avec attente, 3 fois au plus. Les erreurs 402 et 403, ou un refus du modèle, arrêtent tout le lot et vous sont signalées.

## 7. Estimation des coûts

- **Passerelle** : le banc lit, sans toucher au code de l'app, le nombre de jetons de chaque réponse (`usage` en clair, `message_delta.usage` en flux). Le coût est estimé à partir de ces jetons, au tarif public du modèle inscrit dans le script, puis enregistré par étape : candidat, document, évaluation, rédaction. La passerelle ne donne pas le montant réellement facturé : c'est une estimation.
- **ElevenLabs** : après chaque conversation, le banc lit `GET /v1/convai/conversations/{id}`, qui donne la durée et le coût en crédits, et le crédit consommé sur l'abonnement (`/v1/user/subscription`, avant et après). Le coût en euros = crédits × prix du crédit de votre formule, à me confirmer.

## 8. L'essai pilote

- Lot `pilote` : ESC Clermont BS, profil « bon », scénario normal, même graine pour les deux passages. Premier entretien devant le jury neutre, second devant le jury dur.
- Pour chacun : notation par Gemini puis par Claude (évaluateur et rédacteur), soit 4 lignes dans `bench_results`.
- **Ce que je vous rends** :
  - la durée réelle de chaque entretien et de chaque notation ;
  - le coût par poste : jury (crédits ElevenLabs), candidat, évaluation et feedback, par modèle ;
  - un contrôle de l'enregistrement : transcription horodatée, `phase_timings` (pitch, question Impact), tirages (axe et question Impact, pris parmi les questions 13 à 24), identifiant de conversation, notes sur 20, pénalités, percentiles, citations retirées ;
  - la transcription et les deux feedbacks, à lire dans la base ou exportés dans un fichier hors du dépôt (`/mnt/documents/banc-3.5/pilote.md`) si vous le voulez.
- Rien d'autre n'est lancé avant votre validation.

## 9. Tests ajoutés

- `bench-recopie.test.ts` : les empreintes des blocs recopiés de `partie-8`.
- Les tests des fonctions pures du banc (`src/lib/jury-bench.ts`) :
  - le candidat ne reçoit jamais de [RÉGIE] ;
  - la durée d'une prise de parole = mots / 150 ;
  - l'affectation des profils aux 23 écoles est celle de la spécification, et les 13 cas limites aussi ;
  - la clé de reprise est la même d'une exécution à l'autre ;
  - les tirages viennent des piles du jury.
- `jury-bench.test.ts` est mis à jour : les tests qui portent sur les versions old / new disparaissent.

## Points ambigus ou impossibles

1. **Rennes** : `ELEVENLABS_AGENT_ID_RENNES_SB` est absent des secrets. Je propose de jouer Rennes avec l'agent du jury classique, ce que fait l'app aujourd'hui sans ce secret. À confirmer.
2. **« Jury classique_dur »** : c'est le même agent ElevenLabs, avec un texte différent (bloc de difficulté). Aucun second agent n'est nécessaire.
3. **Banc en texte** : le jury reçoit et rend du texte. Ni la voix ni la détection de silence à l'oral ne sont testées. Les règles des 5 s d'emlyon et des pauses passent par l'horloge virtuelle, comme en mode test écrit.
4. **Durée totale** : avec la limite de 10 minutes par commande, le lot principal demandera plusieurs tours de suivi de ma part. Il ne peut pas tourner tout seul jusqu'au bout pendant un seul de mes tours.
5. **Coûts** : ce sont des estimations, d'après les tarifs publics pour la passerelle, et d'après les crédits et le prix de votre formule pour ElevenLabs.
6. **Dépôt public** : aucun résultat n'est écrit dans `scripts/`. Les profils et les scénarios, eux, sont dans le dépôt : ce sont des personnages inventés, sans donnée réelle.
7. **ISC Paris, cas 12 et 13** : les deux graines changent les tirages et les choix aléatoires du candidat. La variété des questions du jury dépend aussi du modèle d'ElevenLabs, que nous ne contrôlons pas.
