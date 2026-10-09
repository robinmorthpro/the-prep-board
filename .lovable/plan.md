# Étape 5 — le reste de la liste (A à G)

Rien ne touche au barème ni aux textes du jury et du rédacteur. Seuls les 3 textes de l'évaluateur joints sont remplacés.

## A. Textes de l'évaluateur
Fichiers : `src/lib/evaluateur/textes/commun.md`, `ecoles/essec.md`, `ecoles/emlyon.md`. Copie octet pour octet, et contrôle des empreintes. Les empreintes des fichiers joints sont déjà vérifiées et identiques à celles annoncées.

Différences mesurées avec les fichiers actuels :
- commun.md : 2 lignes ajoutées après la ligne 37.
  - « - **Refus de se livrer** du début à la fin : toutes les cases à N1. »
  - « - **Question de fin** : seule la question de clôture compte, jamais « Avez-vous autre chose à ajouter sur cette partie ? ». »
- essec.md : 1 ligne ajoutée après la ligne 40 : « - une mise en situation commencée puis écourtée par la clôture reste notée. »
- emlyon.md, ligne 15 : la phrase « À l'emlyon, la durée et la phrase de fin ne comptent pas dans les niveaux de la Présentation : le N4 reste accessible sans elles. » est ajoutée en fin de ligne.

Test : un nouveau test d'empreinte SHA-256 sur les 3 fichiers (`57fb15b0…89fa`, `c23947bc…9b7c`, `f68a16e9…bf42`). Aucun test d'empreinte de l'évaluateur n'existe aujourd'hui.

## B. Pénalité du pitch EM Strasbourg
Dans `src/lib/evaluateur/durees.ts`, `pitch: []` devient `pitch: ["em-strasbourg-pitch"]`. C'est la mesure déjà enregistrée par l'application, de 2 min 30 sur 3 min.
Tests : pitch de 2 min 10 → pénalité ; pitch de 2 min 40 → aucune ; pitch non mesuré → aucune.

## C. Suppression du feedback de secours
**Ce qui est retiré :**
- `debriefInterview` dans `ai.functions.ts`. Les fonctions partagées (`contextBlock`, `contextSchema`) sont conservées.
- Dans `_app.partie-8.tsx` : son import, `askDebrief` et la fonction `ancien`.
- `NOUVEAU_FEEDBACK_ACTIF` et le paramètre `actif`/`ancien` de `produireFeedback`.
- Le commentaire qui cite `debriefInterview` dans `elevenlabs-agent-prompt.ts`.
- La règle de `AGENTS.md` sur le secours. Elle est remplacée par : « Feedback = évaluation puis rédacteur, une relance automatique, puis écran d'échec ».

**Relance automatique :** dans `feedback-enchainement.ts`, `produireFeedback` lance la chaîne complète (évaluation puis rédacteur). En cas d'échec ou d'évaluation non « ok », elle relance une seule fois. Après un second échec, elle renvoie un résultat « échec », sans texte.

**Écran d'échec (partie 8, à la place du feedback) :**
- Texte : « Votre feedback n'a pas pu être généré. Réessayez dans quelques minutes. »
- Bouton « Réessayer », qui relance la chaîne sur la même session.
- Le transcript reste affiché et exportable.
- Aujourd'hui, en cas d'erreur, l'écran revient à « entretien en cours » (`setPhase("running")`) avec un message d'erreur. Ce comportement est retiré.

**Historique :**
- Les sessions qui ont déjà un feedback (nouveau ou ancien) s'affichent telles quelles. `percentileDuTexte` est gardé pour lire le percentile des anciennes.
- Une session terminée sans feedback affiche le même écran d'échec, avec « Réessayer ».

Tests : succès au 1er essai ; échec puis succès (2 appels) ; deux échecs → « échec » sans texte ; évaluation « invalide » deux fois → « échec ». Les tests de l'ancien secours sont retirés.

## D. Ce que l'application a tiré, transmis au rédacteur
Aujourd'hui, ces tirages ne sont pas enregistrés : `interview_sessions` n'a que `support_*` et `inseec_image`.

Ajout d'une colonne `tirages` (jsonb, `{}` par défaut) dans `interview_sessions`, par migration sur votre Supabase. Elle est remplie au démarrage, puis complétée pendant l'entretien. Le rédacteur reçoit un bloc « CE QUE L'APPLICATION A TIRÉ », placé après la transcription.

| École | Tirage transmis | Forme |
|---|---|---|
| emlyon | 4 cartes | `Carte Expérience : « … » (critère : Expériences et personnalité)`, une ligne par carte |
| EDHEC | mot | `Mot imposé : « audace »` |
| Montpellier | situation(s) choisie(s) à l'écran, dans l'ordre | `Situation choisie : « … »` |
| ESSEC | situation | `Mise en situation : « énoncé » — compétence visée : Créativité`* |
| Clermont | question Impact réellement posée | `Question Impact (axe Planet) : « … »` |
| TBS | article choisi | `Article : « titre »` |
| INSEEC | image | déjà transmise : inchangé |
| GEM | personnage | `Personnage de l'interview inversée : prénom, poste, secteur, fil rouge` (texte de `pickGemPersona`) |

\* Aujourd'hui, `pickEssecSituation` ne renvoie que l'énoncé. Elle renverra aussi la compétence, depuis la liste partagée.

Tests : le bloc rendu pour chaque école, et aucun bloc quand rien n'a été tiré.

## E. Jury et régie
**CONNAISSANCE DU CANDIDAT**

Où le bloc est assemblé : `buildJuryAgentPrompt` coupe le texte commun avant « NIVEAU JOUÉ ». Toute la section « CADRE DE L'ENTRETIEN » de `jury-commun.md` est donc écartée, puis remplacée par la constante `AGENT_DYNAMIC_VARIABLES`, qui contient l'ancienne version.

Le bloc est donc envoyé **une seule fois, mais dans l'ancienne version**. Il manque « ni écrit dans le document qu'il a remis » et « sauf quand tu ouvres un nouveau thème (APRÈS CHAQUE RÉPONSE, cas 5) ».

Correction : `AGENT_DYNAMIC_VARIABLES` est extraite telle quelle de `jury-commun.md` (section CADRE, jusqu'au `---` suivant). Le double espace « Tu construis  tes » est conservé.
Test : le texte envoyé est identique à celui du fichier et ne contient qu'une seule occurrence de « CONNAISSANCE DU CANDIDAT ».

**I68, suffixe « Termine ta prochaine prise de parole par une question. »**

Ce suffixe n'est plus ajouté au repère :
- avant la deuxième réplique, quand l'école en a une ;
- pendant la présentation EDHEC, tant que la phrase de transition n'est pas dite ;
- pendant le pitch de Clermont (phase `clermont-pitch`) et celui d'EM Strasbourg (tant que la mesure du pitch est ouverte) ;
- au repère qui suit la phrase de passage de Montpellier.

**Autres réglages de régie :**
- **ESSEC, pause de 30 s** : elle part à la fin de la prise de parole du jury qui contient « prenez quelques secondes pour réfléchir ». Aujourd'hui, elle part au démarrage de la phase.
- **ESSEC, sortie anticipée** : si le jury a dit « La mise en situation est terminée » et sa question de clôture, `closeImmediately` n'envoie plus de seconde consigne de clôture.
- **EDHEC** : relances de silence suspendues jusqu'à la phrase de transition. Aujourd'hui, elles ne le sont que pendant l'écran de préparation. Le rappel des deux tiers est calculé sur la durée de l'entretien individuel (à confirmer à la lecture du code au début de la mise en œuvre).
- **KEDGE** : « la présentation Autoportrait (C1) » devient « la présentation Autoportrait ».
- **I29, GEM** : pendant l'interview inversée, les questions courtes du candidat ne comptent plus comme réponses « à sec ». La bascule sur un « non » à « Avez-vous d'autres questions ? » reste.
- **I52, GEM** : relances de silence suspendues pendant `gem-inversee` (pas pendant la minute de synthèse).
- **I33, Clermont** : la question Impact n'est tirée que parmi les questions réservées à l'oral. Voir la question 2 plus bas.
- **I62, emlyon** : aujourd'hui, le chronomètre des cartes part au tirage (`startPhase` dans `triggerEmlyonCards`). Il partira à la première prise de parole du candidat après l'énoncé des cartes. La mesure reste `emlyon-cartes`.
- **I66** : « EXEMPLES DE TON (extraits d'oraux réels) » devient « EXEMPLES DE TON », puis `docs/agent-jury-elevenlabs.md` est régénéré.

Tests : un par règle ci-dessus, dans `phase-engine.test.ts` et `jury-rendu.test.ts`.

## F. Modules d'entraînement
**Piles séparées (I50)**

Le module garde ses cartes actuelles (un élément sur deux, rangs 1, 3, 5…). Le jury ne tire plus que dans les autres.

| Pile | Total | Module | Jury |
|---|---|---|---|
| emlyon Expérience | 46 | 23 | 23 |
| emlyon Personnalité | 65 | 33 | 32 |
| emlyon Projet | 41 | 21 | 20 |
| emlyon Créativité | 64 | 32 | 32 |
| Mots EDHEC | 75 | 38 (+ 8 mots propres au module) | 37 |

Une seule liste partagée par le module et le jury, sur le modèle de l'ESSEC.
Test : aucune intersection entre les deux listes, et chaque tirage du jury appartient à sa liste.

**Textes visibles**

| Point | Texte actuel | Nouveau |
|---|---|---|
| I20 (`ai.functions.ts`, l. 97) | « … Un échec ne se raconte que si le jury pose explicitement la question des défauts (travaillée ailleurs). » | phrase retirée, le reste de la ligne est inchangé |
| I20 (l. 98) | « - Un seul axe suffit pour le futur : soit l'école, soit le projet pro. Tu ne demandes jamais les deux. » | ligne retirée |
| I23 (cartes emlyon) | « Si le jury relance ou vous contredit, tenez votre position en l'ajustant intelligemment. » | retiré |
| I25 | « Tenez 3 à 4 minutes maximum : une réponse claire et rythmée plutôt qu'un monologue exhaustif. » | « Développez chaque carte, environ 3 à 4 minutes, sans monologue exhaustif. » |
| I28 (EDHEC) | « … vous devez prendre la parole dessus, sans préparation. » | « … vous disposez d'1 minute de préparation, puis vous présentez pendant 4 minutes, sans intervention du jury. » |
| I28 | « Tenez environ 2 minutes de propos continu, sans blanc long ni décrochage. » | retiré |
| I34 (36 fiches Clermont) | « Prenez position dès les premières secondes : oui, non, ou une nuance assumée… » | « Prenez position clairement, dès le début ou après quelques phrases de réflexion : oui, non, ou une nuance assumée… » |
| I34 | « … teste votre capacité à prendre position immédiatement sur … » | « … teste votre capacité à prendre position clairement sur … » |
| Montpellier (l. 946) | « … une dizaine de situations sous forme de débuts de phrase … » | « … 15 situations … » |
| Montpellier (l. 939) | « … des situations sous forme de débuts de phrase à compléter (« J'ai dû faire face à une difficulté inattendue quand… »). » | « … des situations (« … ») », avec un exemple de situation complète tiré de la liste |

Tests : les phrases retirées sont absentes des textes.

## G. Étiquettes des cartes emlyon
- **Stockage** : une table d'étiquettes dans `emlyon-kb.ts`. Par défaut, une carte prend le critère de sa pile. S'y ajoutent les 14 exceptions Créativité de la liste, toutes retrouvées mot pour mot dans la banque, et les cartes Projet sur l'école.
- **Tirage** : `drawEmlyonCards` renvoie `{ pile, question, critere }` pour chaque carte. Le tirage est enregistré dans `tirages.emlyon_cartes`.
- **Évaluateur** : bloc « Cartes tirées (critère où chaque carte se note) » dans son message utilisateur, à côté du document et de l'image.
- **Rédacteur** : même bloc, présenté en D.

**Cartes Projet qui portent sur l'école (proposition à valider)**

Sûres :
- « Pourquoi voulez-vous intégrer l'emlyon ? »
- « Quelles sont les particularités du Programme Grande École de l'emlyon ? »
- « Pensez-vous que l'emlyon vous apportera un esprit critique ? »
- « Que souhaitez-vous apprendre à l'emlyon ? »
- « Citez 3 cours que vous aimeriez suivre à l'emlyon et expliquez pourquoi. »
- « Quels seront pour vous les trois apports de l'emlyon BS ? »
- « Quels sont les 3 cours que vous attendez avec impatience à l'emlyon ? »
- « Quel est le principal atout de l'emlyon selon vous ? »

Douteuses (laissées en Projet sauf avis contraire) :
- « Si vous aviez le don d'ubiquité que feriez-vous en plus de vos études dans notre école ? »
- « Pourquoi voulez-vous intégrer une école de commerce ? »
- « Pourquoi une business school ? »
- « Que choisissez-vous entre avoir 1/3 de votre temps dédié aux stages et 2/3 aux cours, et l'inverse ? »
- « Dans quel pays ne souhaiteriez-vous pas partir en échange universitaire ? »

Tests : les 14 exceptions, une carte par défaut de chaque pile, une carte Projet sur l'école, et la présence de l'étiquette dans les deux messages.

## Points ambigus ou contraires à l'app
1. **Évaluateur** : son texte commun dit « Tu reçois … la transcription. Rien d'autre ». Il reçoit pourtant déjà le document et l'image, et G y ajoute les cartes. Je l'applique ainsi, sans toucher au texte.
2. **Clermont, I33** : aujourd'hui, le module publie les 72 questions Impact (24 par axe). Aucune n'est réservée à l'oral. Proposition : même partage qu'emlyon, soit 12 questions par axe dans le module (36 au lieu de 72) et 12 réservées au jury. À valider.
3. **KEDGE** : les 5 cartes tirées ne figurent pas dans la liste D. Je propose de les transmettre aussi. À valider.
4. **Montpellier** : le premier message du jury dit « à travers des débuts de phrase que vous choisirez ». Il est figé depuis l'étape 3, donc je ne change que l'écran.
5. **I20** : ces deux phrases n'existent que dans `ai.functions.ts` : rien à corriger dans `vivaldi-data.ts`.
6. **I62** : le chronomètre part aujourd'hui au tirage, contrairement à ce qui était indiqué à l'étape précédente.
7. **D, migration** : la nouvelle colonne est ajoutée sur votre Supabase « The Prep Board ». Les anciennes sessions gardent `{}`.

## Vérifications finales
Tous les tests, la construction, la liste des fichiers modifiés et le tableau des empreintes.
