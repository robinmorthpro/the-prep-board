## Diagnostic ElevenLabs (401) — aucune modification

Dernière erreur (08:29:39 UTC) : `ElevenLabs signed-url 401: {"detail":{"type":"authentication_error","code":"unauthorized","message":"Invalid API key","status":"invalid_api_key","request_id":"ca528f1cbd10e61ec2ca482306e2fd3e"}}`

Verdict : clé refusée comme invalide, ce n'est pas une permission manquante.

Piste : l'erreur vient de la version publiée de l'aperçu, pas du serveur redémarré, qui a pourtant la nouvelle clé (sk_…f8c2). Cette version a pu garder l'ancienne valeur. Sinon, la clé f8c2 a été supprimée ou vient d'un autre compte ElevenLabs.

### Prochaine étape proposée (sur feu vert uniquement)
1. Relancer la version de l'aperçu sans toucher au code, pour qu'elle relise les secrets.
2. Refaire le test ESSEC et relire les journaux.
3. Si l'erreur « Invalid API key » revient : vérifier dans ElevenLabs (Settings → API Keys) qu'une clé se terminant par f8c2 existe et est active, sur le même compte que l'agent.
