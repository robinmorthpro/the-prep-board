# Plan : Supprimer l'override de voix pour laisser ElevenLabs choisir Julia

## Contexte
L'utilisateur a changé la voix de l'agent ElevenLabs pour **Julia** dans le dashboard ElevenLabs. Actuellement, le code côté application force un override de voix (`ttsOverrides`) avec l'ID de la voix Eric. Pour que l'agent utilise la voix configurée dans le dashboard (Julia), il faut supprimer cet override.

## Étapes

### 1. Retirer l'override de voix dans `useJuryAgent.ts`
- Supprimer le bloc `ttsOverrides` (voiceId Eric).
- Supprimer la clé `tts` dans l'objet `overrides` passé à `conversation.startSession`.
- Conserver l'override agent (`prompt`, `firstMessage`, `language`, `dynamicVariables`).

### 2. Mettre à jour `src/lib/elevenlabs-agent-prompt.ts`
- Modifier la ligne `VOIX RECOMMANDÉE` pour ne plus mentionner Eric ni l'ID `cjVigY5qzO86Huf0OWal`.
- Indiquer que la voix est désormais choisie et configurée directement dans le dashboard ElevenLabs, et que l'application n'impose plus de voix.

### 3. Mettre à jour `docs/agent-jury-elevenlabs.md`
- Remplacer la section "VOIX RECOMMANDÉE" pour refléter que la voix est définie dans le dashboard (Julia actuellement).
- Supprimer les mentions de George/Charlie comme recommandation forcée par le code.

### 4. Vérification
- S'assurer qu'il ne reste aucune référence à `ttsOverrides` ou à un `voiceId` en dur dans le code de la partie 7.
- Vérifier que le build passe et que la partie 7 démarre toujours correctement.

## Livrables
- `src/hooks/useJuryAgent.ts` sans override de voix.
- Prompts et documentation cohérents avec la voix choisie dans ElevenLabs.
- Parcours Partie 7 testable avec la voix Julia.
