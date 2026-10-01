# Créer, paramétrer et connecter l'agent vocal ElevenLabs (entretien classique)

Cet agent ne servira **que** pour la simulation d'entretien classique (les trois niveaux
découverte / normal / plus dur). L'architecture est prévue dès maintenant pour accueillir
plus tard d'autres agents (entretiens spéciaux : triptyque, débat, etc.) sans rien réécrire.

## Ce que tu fais de ton côté (5 étapes, ~10 minutes)

1. **Compte ElevenLabs** : créer un compte sur elevenlabs.io (l'offre gratuite suffit pour
   tester, mais la voix temps réel consomme des crédits ; prévoir un plan payant pour des
   entretiens de 25 minutes répétés).
2. **Créer l'agent** : section « Agents » → nouvel agent vide, nommé
   `Vivaldi — Jury entretien classique`.
3. **Coller la configuration** : je te fournis le document `docs/agent-jury-elevenlabs.md`
   (déjà généré, je le mets à jour dans cette passe). Tu copies section par section :
   réglages de voix et de latence, prompt système du jury, trame, banque de questions,
   variables dynamiques, premier message.
4. **Autoriser les overrides** : dans les réglages de sécurité de l'agent, cocher
   « prompt », « first message », « language » et « dynamic variables ». Sans ça
   l'application ne peut pas injecter le niveau de difficulté ni le dossier du candidat.
5. **Copier l'Agent ID** puis lancer la connexion depuis le chat Lovable : je t'ouvre la
   carte de connexion ElevenLabs, tu la valides avec ta clé API.

Je t'accompagne pas à pas : à chaque étape tu me dis « fait » et je te donne la suivante,
avec les valeurs exactes à saisir.

## Ce que je construis dans l'app

1. **Registre des formats d'entretien** : un fichier qui associe chaque format d'oral à son
   agent vocal. Aujourd'hui une seule entrée, `classique`, avec son Agent ID. Les formats
   spéciaux viendront s'ajouter comme nouvelles entrées, chacune avec son propre agent et
   son propre prompt — le code de la page 7 ne bougera plus.
2. **Agent ID configurable** : stocké en variable d'environnement du projet
   (`VITE_ELEVENLABS_AGENT_CLASSIQUE`), pas codé en dur, pour pouvoir changer d'agent sans
   redéploiement de code.
3. **Jeton de session côté serveur** : une fonction serveur génère le jeton de conversation
   WebRTC avec la clé API ElevenLabs, qui ne quitte jamais le serveur.
4. **Branchement de la partie 7** : le bouton « Démarrer l'entretien » ouvre la connexion
   vocale au lieu de la boucle actuelle. Le niveau choisi et le dossier du candidat (projet
   pro, fiche école, expériences) sont envoyés en overrides au démarrage.
5. **Fil de l'entretien** : les questions du jury et tes réponses sont captées en direct
   depuis la transcription de la session, exactement au même format qu'aujourd'hui.
6. **Débrief et historique inchangés** : même grille, même percentile, même face-à-face
   jury / candidat / feedback, mention « entretien incomplet » si tu coupes avant la fin,
   seuls les entretiens terminés dans l'historique.
7. **Repli propre** : micro refusé, réseau coupé, agent mal configuré ou crédits épuisés →
   retour à l'écran de départ avec un message qui dit précisément quoi corriger.
8. **Documentation à jour** : `docs/agent-jury-elevenlabs.md` est régénéré et complété d'une
   section « Créer l'agent pas à pas » et d'une note indiquant que ce prompt vaut pour
   l'entretien classique uniquement.

Les parties 1 à 6 ne changent pas.

## Détails techniques

- Connecteur ElevenLabs à lier au projet (`ELEVENLABS_API_KEY` côté serveur uniquement).
- `bun add @elevenlabs/react` ; `useConversation` avec `connectionType: "webrtc"`.
- `createServerFn` → `GET /v1/convai/conversation/token?agent_id=…` avec l'en-tête
  `xi-api-key` ; jamais d'appel ElevenLabs depuis le navigateur.
- Nouveau `src/lib/interview-agents.ts` : `{ format: "classique", agentId, buildPrompt,
  firstMessage }`, alimenté par `buildJuryAgentPrompt(variant)` de
  `src/lib/elevenlabs-agent-prompt.ts`.
- `overrides.agent.prompt` + `firstMessage` + `language: "fr"` + `dynamicVariables`
  (`school`, `student_name`, `prepa`, `career_project`, `school_sheet`, `experiences`,
  `difficulty_block`).
- `onMessage` : `agent_response` → tour jury, `user_transcript` → tour candidat ; même
  tableau `turns` que `useLiveMic` produit aujourd'hui, persisté dans `interview_sessions`.
- `debriefInterview` dans `src/lib/ai.functions.ts` n'est pas modifié.
- `useLiveMic` / `useJuryVoice` restent en place pour les parties 1 à 6.
