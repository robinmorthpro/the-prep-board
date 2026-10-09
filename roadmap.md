# Roadmap

## Fait
- [x] Partie 8 pilotée par l'école (configs par école, popup de structure, agent résolu par école)
  - [x] `src/lib/school-interviews.ts` : configs par école + défaut classique
  - [x] Popup de structure officielle avant démarrage (phases, simulé/exclu, durée réelle vs simulée)
  - [x] Premier message toujours construit par l'application (`buildFirstMessage`), plus aucun repli sur le message stocké
- [x] Supports d'entretien sans envoi de fichier à l'agent vocal
  - [x] `src/lib/support-text.functions.ts` : lecture du support et extraction fidèle du texte côté serveur
  - [x] Texte transmis au jury en variable `{{support_text}}` et réutilisé tel quel par le débrief
  - [x] TBS : article transmis en texte (titre, source, date, résumé), sans fichier
- [x] Repères de temps : durée max imposée, repère uniquement après chaque réponse candidat, clôture unique à 2 minutes de la fin
- [x] Consignes de régie `[RÉGIE]` : transitions et tirages fiables (Clermont, emlyon), jamais affichées ni enregistrées
- [x] Données du dossier reconstruites (fiche école par éléments, projet professionnel complet, expériences et anecdotes, sujets d'actualité)
- [x] Fil de l'entretien : prises de parole consécutives du jury concaténées, interruption récupérable, erreurs traduites en français

## Suivant
- [ ] Créer l'agent dédié Rennes SB puis enregistrer `ELEVENLABS_AGENT_ID_RENNES_SB` (école affichée « bientôt disponible »)
- [ ] Généraliser les configs aux 24 écoles (lots suivants)
- [ ] Contenu du questionnaire Rennes SB (PUMA) quand il sera figé

## Lot 2 — qualité du jury (fait)
- [x] Premiers messages validés par école (prénom + nom de l'école) et 2e réplique verbatim après « c'est clair ? »
- [x] INSEEC : image choisie dans le popup avant le démarrage, transmise au jury et au débrief
- [x] ESSEC : deux mises en situation (15-20 min puis 28-35 min), C10 en moyenne des deux, total /23 inchangé
- [x] Style du jury : interdiction de se répéter, amorces variées, « et si » limité, interruption et clarification cadrées, tensions réelles, curiosité, couverture minimale
- [x] Durées planchers par école (TBS, Clermont, emlyon, KEDGE, GEM, ESSEC, INSEEC, EDHEC)
- [x] Cohérence : la conduite de l'école prime sur le niveau joué ; actualité exclue pour GEM et MBS ; cartes emlyon nettoyées
- [x] docs/agent-jury-elevenlabs.md régénéré

## Relecture lot 2 — corrections module 8
- [x] Premiers messages exacts, élisions et deuxièmes répliques vérifiés
- [x] INSEEC : libellés courts, colonne dédiée et débrief adapté
- [x] Prompts alignés sans contradictions restantes
- [x] Cartes emlyon sensibles remplacées
- [x] Tirage ESSEC non biaisé et typecheck OK

## Lot 3 — bascules de phase pilotées par l'application (fait)
- [x] Calendrier de phases par école (TBS, Clermont, ESSEC, INSEEC, GEM, emlyon, KEDGE) ; EDHEC inchangé
- [x] Repère de temps enrichi (phase en cours / ordre de bascule), aucun nouvel envoi
- [x] Ordre de bascule répété jusqu'à détection de la phrase de transition verbatim
- [x] Clôture à Y−2 prioritaire : la bascule est abandonnée
- [x] Tronc commun : bloc DURÉE DES PHASES réécrit, durées planchers retirées des conduites
- [x] docs/agent-jury-elevenlabs.md régénéré et typecheck OK

## Relecture des bascules — corrections bloquantes (fait)
- [x] Normalisation partagée de toutes les phrases détectées et exclusion du premier message du jury
- [x] Calendriers relatifs ESSEC, GEM et Clermont ; phrases TBS et cartes emlyon corrigées
- [x] Source unique des durées dans le hook, persistée en session et transmise telle quelle au débrief
- [x] Présentations ESSEC et EDHEC mesurées depuis leurs véritables points de départ
- [x] Mode écrit ordonné réponse puis repère ; clôture prématurée ignorée

## Lot 4 — compléments aux bascules de phase (fait)
- [x] Le jury ne coupe jamais le candidat (consignes d'interruption supprimées partout)
- [x] Relances variées imposées pendant les phases chronométrées (TBS, Clermont, INSEEC, GEM)
- [x] Bascule anticipée tolérée : cartes toutes traitées (emlyon, KEDGE) ou 3 relances sans élément nouveau ; jamais pour l'ESSEC
- [x] Durées de phase mesurées par l'application, transcript horodaté et malus unique de 0,5 point si phase écourtée
- [x] docs/agent-jury-elevenlabs.md régénéré et typecheck OK

## Évaluateur v2 — étape 1 (en coulisses)
- [x] Textes et barème copiés octet pour octet (sha256 identiques)
- [x] Appel, vérifications, calcul, table interview_evaluations, déclenchement en arrière-plan, outil admin
- [x] Décision Robin : ignorer les ** (gras) des textes dans la vérification de « manque_pour_n4 »
- [ ] Étape suivante : enregistrer les tirages (cartes, mot EDHEC, article TBS, situation ESSEC)

## Rédacteur du feedback — étape 2
- [x] 13 textes copiés (sha256), rédacteur, enchaînement avec secours, colonnes percentile / feedback_source / feedback_evaluation_id, tests, essai NEOMA

## Jury vocal — étape 3
- [ ] Copier le texte commun et la référence des 15 écoles, avec contrôle SHA-256
- [ ] Intégrer mot pour mot les 15 textes école dans le code et les vérifier depuis la référence
- [ ] Appliquer les corrections de régie, niveaux, phases, durées et mesures retenues
- [ ] Répartir les 30 situations ESSEC : 3 par compétence dans Questions clés, complément dans le jury
- [ ] Compléter les tests et vérifier la construction

## Écrans — étape 4
- [ ] Passer à deux jurys, afficher le positionnement complet et préserver l’historique
- [ ] Recalculer évolution et radar depuis les évaluations structurées, avec 0 à 3+ simulations testées
- [ ] Retirer HEC des nouveaux choix et passer Rennes/ISC au format classique
- [ ] Aligner les écrans et phases des dix écoles listées
- [ ] Vérifier tous les tests, la construction et capturer tableau de bord et feedback si accessibles
