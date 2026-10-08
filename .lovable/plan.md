# Diagnostic : clés ElevenLabs absentes des fonctions serveur

## Réponses
1. **Où sont lus les secrets** : les fonctions serveur de ce projet tournent chez Lovable, pas dans Supabase. Elles lisent les **secrets du projet Lovable**. Les secrets des Edge Functions du Supabase externe ne sont jamais lus par elles. Si les clés ont été saisies dans Supabase, c'est pour ça qu'elles sont vides.
2. **Secrets visibles aujourd'hui** (noms seulement) :
   - LOVABLE_API_KEY (gérée automatiquement)
   - LOVABLE_CRON_SECRET (gérée automatiquement)
   - **Manquants** : ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID_CLASSIQUE, ELEVENLABS_AGENT_ID_RENNES_SB.
3. **LOVABLE_API_KEY** : elle est bien présente et fournie automatiquement. Le débrief n'a besoin d'aucune action.

## Marche à suivre (par le propriétaire, sans rien coller dans le chat)
1. Ouvrir le projet dans Lovable.
2. Cliquer sur le nom du projet (en haut à gauche), puis **Settings**.
3. Ouvrir l'onglet **Secrets**.
4. Cliquer sur **Add secret**. Nom : `ELEVENLABS_API_KEY`. Valeur : la clé API ElevenLabs (elevenlabs.io → Developers → API Keys). Enregistrer.
5. Recommencer avec `ELEVENLABS_AGENT_ID_CLASSIQUE`. Valeur : l'identifiant de l'agent classique (ElevenLabs → Agents → agent → Agent ID).
6. Facultatif : ajouter `ELEVENLABS_AGENT_ID_RENNES_SB` si l'agent dédié existe. Sinon, l'agent classique est utilisé à la place.
7. Respecter les noms à la lettre (majuscules, tirets bas, aucun espace).
8. Recharger la prévisualisation, puis relancer le test écrit sur l'ESSEC.

Aucun changement de code n'est nécessaire.
