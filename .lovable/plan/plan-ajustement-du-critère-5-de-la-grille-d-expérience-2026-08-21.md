# Plan : Ajustement du critère 5 de la grille d'expérience

## Objectif
Modifier le libellé du critère 5 dans `EXPERIENCE_GRID` pour refléter une alternative "école OU entreprise" plutôt qu'une conjonction "école ET entreprise".

## Modification prévue
Dans `src/lib/vivaldi-data.ts`, ligne 299, remplacer :

```text
5. Présent → Futur : un lien concret et nommé, en école ET en entreprise (master, association, échange, entreprise, projet pro).
```

par :

```text
5. Présent → Futur : un lien concret et nommé, en école (master, association, échange, entreprise) OU en entreprise (projet pro).
```

## Impact
- Le feedback de `reviewExperience` dans `src/lib/ai.functions.ts` utilisera automatiquement ce nouveau libellé, car il injecte `EXPERIENCE_GRID` tel quel dans le prompt.
- Aucune autre modification de code ou de base de données n'est nécessaire.

## Vérification
- Relire la ligne 299 de `src/lib/vivaldi-data.ts` après édition.
- Vérifier que `bun run build` ou `tsgo` passe sans erreur de type.
