# Partie 7 — un jury vocal réaliste, sans latence

## Ce qui rend l'expérience actuelle lente et robotique

Aujourd'hui chaque prise de parole enchaîne quatre attentes successives, en série :

```text
tu parles → 1,4 s de silence à attendre → transcription de l'audio
        → rédaction de la question par l'IA → génération du fichier voix complet
        → lecture
```

Chaque étape attend la fin de la précédente : 6 à 12 s entre ta dernière phrase et la voix du jury. La voix vient d'un modèle de synthèse « neutre », d'où le rendu plat.

## Comparaison des deux options (ta question)

Ce n'est pas pareil, et l'écart est net pour le candidat :

- **Voix naturelle + streaming** : la voix devient vraiment humaine, mais la boucle reste en tour par tour. Il reste 2 à 4 s de blanc après chaque réponse, et on ne peut pas se couper la parole naturellement. Rendu : un très bon entretien « en visio avec du lag ».
- **Agent vocal temps réel** : réponse en ~0,5 s, intonations, interruptions, relances spontanées, respiration. Rendu : un vrai jury en face de soi. C'est nettement le plus qualitatif, et c'est ce que je recommande pour un outil dont la valeur est justement le réalisme du stress d'oral.

Le seul vrai coût de l'option temps réel : la conduite de l'entretien passe dans le prompt de l'agent vocal, donc la trame est appliquée avec un peu moins de rigueur mécanique qu'aujourd'hui (le jury improvise davantage). On compense en gardant l'évaluation dans ton IA actuelle, qui relit le fil complet à la fin.

## Ce que je construis

Un jury vocal temps réel pour la partie 7, avec ta grille et ton débrief inchangés.

1. **Agent vocal temps réel** : connexion vocale directe entre le candidat et le jury (voix française expressive, écoute continue, interruptions possibles). Plus de bouton, plus d'attente entre les tours.
2. **Trame et difficulté conservées** : la trame « par les portes », la banque de questions et les trois niveaux (découverte / classique / plus dur) sont injectés au démarrage de la session comme consignes du jury, avec le contexte personnel du candidat (projet pro, fiche école, expériences) déjà calculé dans la page.
3. **Fil de l'entretien** : chaque question du jury et chaque réponse du candidat sont captées en direct depuis la transcription de la session et enregistrées comme aujourd'hui.
4. **Débrief inchangé** : à la fin (« Terminer l'entretien »), le fil est envoyé à l'IA d'évaluation actuelle — même grille, même percentile, même face-à-face jury / candidat / feedback, même mention « entretien incomplet ».
5. **Historique inchangé** : seuls les entretiens terminés apparaissent, avec fil et débrief, suppression possible.
6. **Repli** : si la connexion vocale temps réel échoue (micro refusé, réseau, service indisponible), la page revient à l'écran de départ avec un message clair. La voix améliorée reste utilisée pour la relance après silence.

Les autres parties (1 à 6) ne changent pas : leur oral reste sur la transcription actuelle.

## La documentation à coller dans l'agent ElevenLabs

Je produis un document dédié, `docs/agent-jury-elevenlabs.md`, écrit pour être copié-collé tel quel dans la configuration de l'agent. Il contient :

1. **Réglages de l'agent** : langue française, voix recommandée (voix FR posée, réglages d'expressivité et de débit), modèle vocal basse latence, seuils de fin de parole et interruptions autorisées, durée max de session.
2. **Prompt système du jury**, en sections numérotées et testables :
   - identité et cadre (membre du jury d'une école de commerce, 25 minutes, vouvoiement, une question à la fois, 25 mots max) ;
   - le principe des portes et le cycle de creusement (les 4 crans : le concret, le pourquoi, la preuve, la limite) ;
   - les douze cases à couvrir et le rythme (1 question toutes les 45-75 s, 15-25 % de temps de parole) ;
   - la banque de questions par familles (P, V, E, F, C, D, M, R, A) ;
   - les garde-fous absolus : aucun sujet interdit, aucun jugement à voix haute, aucun signal de résultat, bascule bienveillante si le candidat se ferme, jamais d'évaluation pendant l'entretien ;
   - la clôture explicite qui marque la fin de l'entretien.
3. **Trois blocs de difficulté** (découverte / classique / plus dur) reprenant mot pour mot l'attitude, le périmètre de questions, la profondeur autorisée et le rythme définis dans notre base de connaissance, à injecter selon le niveau choisi.
4. **Variables dynamiques** attendues par l'agent (`{{school}}`, `{{student_name}}`, `{{prepa}}`, `{{career_project}}`, `{{school_sheet}}`, `{{experiences}}`, `{{difficulty_block}}`) avec un exemple de valeurs, plus le premier message du jury.
5. **Ce que l'agent ne fait PAS** : pas de note, pas de percentile, pas de débrief — l'évaluation reste dans l'app, après la clôture.
6. **Protocole de test** : une liste de vérifications rapides (le jury creuse-t-il avant de changer de sujet, respecte-t-il l'interdiction de féliciter, clôture-t-il correctement).

Ce document est généré depuis `src/lib/interview-kb.ts` pour rester la même source de vérité que le débrief : si on fait évoluer la trame, le document et le prompt bougent ensemble.



## Détails techniques

- Connecteur ElevenLabs à lier au projet ; jeton de session WebRTC généré côté serveur (`createServerFn`) pour ne jamais exposer la clé au navigateur.
- `@elevenlabs/react` (`useConversation`) côté page 7 ; `overrides.agent.prompt` + `firstMessage` + `language: "fr"` pour porter `INTERVIEW_TRAME`, `INTERVIEW_QUESTION_BANK` et la consigne de difficulté depuis `src/lib/interview-kb.ts`.
- `onMessage` : `agent_response` → question, `user_transcript` → réponse ; construction du même tableau `turns` que `useLiveMic` produit aujourd'hui, persisté dans `interview_sessions`.
- `useLiveMic` et `useJuryVoice` restent en place pour les parties 1 à 6 ; `speakJury` passe sur une voix ElevenLabs streamée pour les relances.
- `debriefInterview` dans `src/lib/ai.functions.ts` n'est pas modifié.
- Un agent ElevenLabs doit être créé côté ElevenLabs (avec overrides autorisés) ; je te guiderai en une étape si nécessaire.
