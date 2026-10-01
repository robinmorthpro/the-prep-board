# Corriger la documentation ElevenLabs

## Changements
- Confirmer que `AGENT_SETTINGS` n’est pas inclus dans le prompt envoyé au jury.
- Mettre à jour uniquement les réglages documentaires demandés dans `AGENT_SETTINGS`.
- Remplacer « 8 critères » par « critères de la grille » dans le générateur documentaire.
- Régénérer la documentation produite, sans modifier le comportement applicatif.

## Vérifications
- Contrôler le diff pour confirmer que seuls les trois fichiers documentaires attendus changent.
- Lancer `npx vitest run` et restituer sa sortie exacte.
- Fournir l’avant/après exact et la liste des fichiers modifiés.
