# Plan : Finaliser la connexion ElevenLabs pour la Partie 7

## Contexte
L'intégration ElevenLabs est en place côté application, mais le dashboard ElevenLabs n'a pas encore les bons overrides activés. Sans ces overrides, l'agent ne reçoit pas le contexte élève, la voix George, la langue française ou le prompt Vivaldi injectés par le code.

## Étapes à suivre

### 1. Activer les overrides dans ElevenLabs
Dans le dashboard ElevenLabs, ouvrir l'agent classique puis **Security > Overrides** et cocher :
- **System prompt** — obligatoire pour injecter le prompt Vivaldi et le contexte élève.
- **First message** — obligatoire pour contrôler la première phrase du jury.
- **Voice** — obligatoire pour forcer la voix George.
- **Language** — obligatoire pour forcer le français.
- **Dynamic variables** — obligatoire pour transmettre nom, école, prépa, etc.
- **Textonly** — déjà coché, à conserver si on veut pouvoir basculer en mode texte.

### 2. Vérifier la configuration côté app
- S'assurer que `ELEVENLABS_API_KEY` et `ELEVENLABS_AGENT_ID_CLASSIQUE` sont bien présents dans les secrets.
- Vérifier que l'app envoie bien les overrides (prompt, first_message, language, voice) via `conversation.startSession`.
- Vérifier que le provider `ConversationProvider` est bien monté au niveau de la route `/partie-7`.

### 3. Test A → Z en Partie 7
- Lancer un entretien classique.
- Vérifier que le jury commence par une première phrase personnalisée (prénom, école, prépa).
- Vérifier la latence et la qualité vocale (George, français).
- Vérifier que l'entretien s'arrête quand on clique sur "Terminer l'entretien" et que le débrief s'affiche.

### 4. Gestion des cas limites
- Si la connexion reste bloquée sur "Connexion vocale en cours..." plus de 15 secondes : afficher une erreur claire et proposer de vérifier les overrides.
- Si la voix reste robotique : vérifier que le modèle est bien `eleven_flash_v2_5` et la voix `George`.

## Livrables
- Dashboard ElevenLabs configuré avec tous les overrides utiles activés.
- Code prêt à injecter dynamiquement le contexte et le prompt.
- Parcours Partie 7 testable de bout en bout.