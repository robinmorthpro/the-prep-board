# Saisir les clés ElevenLabs via le formulaire sécurisé

## Constat
Les fonctions serveur lisent les secrets du projet Lovable. Les secrets Supabase ne sont pas lus. Seules LOVABLE_API_KEY (automatique) et LOVABLE_CRON_SECRET sont présentes. ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID_CLASSIQUE et ELEVENLABS_AGENT_ID_RENNES_SB manquent.

## Étapes
1. Ouvrir le formulaire sécurisé avec trois champs :
   - `ELEVENLABS_API_KEY` : clé API ElevenLabs (elevenlabs.io → Developers → API Keys)
   - `ELEVENLABS_AGENT_ID_CLASSIQUE` : Agent ID de l'agent classique (ElevenLabs → Agents)
   - `ELEVENLABS_AGENT_ID_RENNES_SB` : facultatif. Laisser vide si l'agent dédié n'existe pas : l'agent classique sert alors de repli.
2. Le propriétaire remplit les champs lui-même. Les valeurs vont directement dans le coffre chiffré, sans passer par le chat.
3. Vérification : la liste des noms de secrets doit afficher les nouvelles clés. Ensuite, relancer le test écrit sur l'ESSEC dans l'aperçu.

Aucun fichier ni code modifié.
