# Corriger l'allowlist ElevenLabs et vérifier l'agent classique

## Ce qui bloque
Le champ Allowlist contient un hôte invalide : `id-preview--e7ef6967-38b4-4ad7-9964-23cb7e3ed8a4.lovable.app p`.
Le caractère en trop (espace + `p`) fait échouer la validation. ElevenLabs n'accepte qu'un nom d'hôte pur par entrée : pas d'espace, pas de `https://`, pas de chemin.

## À faire côté ElevenLabs (2 minutes)
1. Supprimer l'entrée fautive (icône poubelle).
2. « Add host » → `id-preview--e7ef6967-38b4-4ad7-9964-23cb7e3ed8a4.lovable.app`
3. « Add host » → `project--e7ef6967-38b4-4ad7-9964-23cb7e3ed8a4.lovable.app`
4. Laisser « Fail when Origin header is missing » activé.
5. Vérifier que les overrides sont autorisés dans Security : prompt, first message, dynamic variables.

## Vérification dans l'app
Ouvrir la partie 7, format « Entretien classique », lancer une simulation et contrôler :
- l'agent parle dès le démarrage (première question du jury),
- il tutoie le contexte du candidat (école visée, prépa, projet) — preuve que les overrides passent,
- le fil de l'entretien reste masqué pendant la session,
- « Terminer l'entretien » débloque le debrief et l'export PDF.

Si l'agent démarre à vide ou refuse la connexion, le message d'erreur remonté par ElevenLabs indiquera soit l'origine bloquée (allowlist) soit un override non autorisé (Security).

## Détails techniques
Aucun changement de code nécessaire : le token de session est déjà récupéré côté serveur via `src/lib/elevenlabs.functions.ts`, et le prompt est injecté par `src/hooks/useJuryAgent.ts` à partir de `buildJuryAgentPrompt`. Le secret `ELEVENLABS_AGENT_ID_CLASSIQUE` est en place. Le blocage est purement de la configuration dans le tableau de bord ElevenLabs.
