# Convention de nommage des modifications

Chaque modification (le titre saisi au démarrage d'une édition, qui devient le message de commit GitHub) doit suivre la convention ci-dessous. Le projet est évalué sur la lisibilité de son historique Git.

## Structure du titre

1. **Commencer par le module concerné, suivi de « - »** :
   - **M1** : cadrage, PRD, documentation projet
   - **M2** : base de données Supabase, RLS, authentification, déploiement
   - **M3** : interface, UX, design system, accessibilité (WCAG, navigation clavier)
   - **M4** : IA, agent vocal, automatisations, variables d'environnement
   - **M5** : qualité, sécurité, tests, README, documentation utilisateur, mise en production
2. **Décrire en français, en une phrase courte, ce qui a changé.**

## Exemples

- « M3 - Contraste des boutons conforme WCAG AA »
- « M4 - Relance automatique de l'évaluateur »
- « M5 - Correction des erreurs console du tableau de bord »

## Titres interdits

- « Changes »
- « Update »
- « Work in progress »
- « Update plan »

## Règles Git associées

Ne jamais réécrire l'historique Git : pas de force push, de rebase, d'amend ni de squash.
