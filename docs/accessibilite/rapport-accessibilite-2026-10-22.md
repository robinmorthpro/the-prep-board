# Rapport d'accessibilité — The Prepboard

**Date** : 22/10/2026. **Référentiel** : WCAG 2.1 niveau AA, sur deux critères demandés par la formation (C8) : le contraste des couleurs et la navigation au clavier. S'y ajoutent les libellés des champs de formulaire.

> **En clair** :
> - Le **contraste**, c'est l'écart de luminosité entre un texte et son fond. Trop faible, le texte devient difficile à lire, surtout pour une personne malvoyante ou sur un écran au soleil. La norme demande au moins **4,5 fois** plus de contraste pour un texte normal, et **3 fois** pour un grand texte.
> - La **navigation au clavier** : quelqu'un qui ne peut pas utiliser de souris doit pouvoir tout faire avec la touche Tab, et voir à chaque instant où il se trouve (le « focus »).
> - Les **libellés** : chaque champ à remplir doit être relié à son intitulé, pour qu'un lecteur d'écran l'annonce.

## 1. Méthode

| Contrôle | Comment | Pages |
|---|---|---|
| Contraste | Script qui mesure chaque texte visible : couleur réelle du texte, fond effectif (couches semi-transparentes comprises), taille et graisse. Ratio calculé selon la formule WCAG. | 7 pages publiques, en desktop et en mobile. 14 pages de l'espace candidat. 2 pages admin. |
| Clavier | Parcours réel à la touche Tab avec Playwright (pages publiques), puis dans le navigateur (Pilotage). Pour chaque élément atteint : le focus est-il visible ? | Accueil, page concours, connexion, inscription, blog, Pilotage |
| Libellés | Champs sans libellé relié, boutons sans nom accessible | Toutes les pages ci-dessus |

## 2. Résultats avant corrections

| # | Où | Problème | Mesure | En clair |
|---|---|---|---|---|
| 1 | Accueil, onglets inactifs de « La méthode » | Gris clair #9AA3B2 sur blanc, texte de 40 px | 2,54:1 (minimum 3:1) | Les intitulés des onglets non sélectionnés étaient trop pâles. |
| 2 | Accueil (tableau comparatif) et pages concours (étiquettes « Prépa aux oraux », « Assistant généraliste ») | Gris #8A94A6 sur blanc ou bleu pâle | 3,06:1 et 2,63:1 (minimum 4,5:1) | Petits textes gris trop clairs. |
| 3 | Accueil, encadré boursiers | Graphite #4A5568 sur bleu ciel #A9C8FF | 4,44:1 (minimum 4,5:1) | Juste en dessous du seuil. |
| 4 | Tableau de bord, modules 1 à 6 | Badges « À compléter », « Prioritaire », « À perfectionner » : texte blanc sur orange | 2,13:1 | Texte blanc sur orange vif : difficile à lire. |
| 5 | Module 4 (actualité), retour de l'IA | Badge « Validé » : vert #15803D sur vert très pâle | 3,99:1 | Juste en dessous du seuil. |
| 6 | Module 7 (simulations) | Textes gris #8A94A6 sur blanc : durées, consignes, historique | 3,06:1 | Mêmes petits textes gris trop clairs. |
| 7 | Pages concours, questions fréquentes | Focus clavier invisible sur les questions dépliables | — | Avec la touche Tab, on ne voyait pas quelle question était sélectionnée. |
| 8 | Modules 2, 3 et 4 | 41 champs de fiche école et 1 champ d'expérience sans libellé relié ; champs et bouton « supprimer » des liens d'actualité sans nom | — | Un lecteur d'écran n'annonçait pas à quoi servait le champ. |

## 3. Corrections

| # | Correction | Après |
|---|---|---|
| 1 | Onglets inactifs en `--gris-doux` (#8A94A6) | 3,06:1 sur un texte de 40 px, conforme (grand texte) |
| 2, 6 | Nouveau gris de texte `--gris-texte` (#5F6B7F) pour les textes sur fond clair | 5,39:1 sur blanc, 4,63:1 sur bleu pâle |
| 3 | Texte de l'encadré en encre (`--ink-2`) | Plus de 10:1 |
| 4 | Badges orange : texte brun foncé (amber-950) au lieu de blanc | 6,97:1 |
| 5 | Badge « Validé » : vert foncé #166534 | 5,66:1 |
| 7 | Anneau de focus sur les questions dépliables. Ajout d'une règle globale : tout élément interactif sans style de focus propre reçoit un contour de 2 px, de la couleur du texte (visible sur fond clair comme sur fond sombre). | Focus visible partout |
| 8 | Libellés reliés aux champs (`htmlFor` / `id`), et noms accessibles (`aria-label`) sur les liens d'actualité, leur bouton « supprimer » et le champ de récit d'expérience | Chaque champ est annoncé |

## 4. Résultats après corrections
- **Contraste** : 0 écart sur les 7 pages publiques, en desktop et en mobile. 0 écart sur les pages admin. Les écarts de l'espace candidat sont corrigés par les mêmes couleurs.
- **Clavier** : sur l'accueil, la page concours, la connexion, l'inscription et le blog, chaque élément atteint au Tab a un focus visible. Ordre logique, et aucun ordre forcé (`tabindex` positif) sur les 11 pages de l'espace candidat vérifiées.
- **Pilotage** : parcours complet au clavier (menu, filtre par école, graphique, fiches), focus visible à chaque étape.
- **Textes alternatifs** : toutes les images des pages publiques ont un attribut `alt`.

## 5. Ce qui reste hors de cette passe
- **Textes posés sur une photo** (bandeau d'accueil) : le contraste dépend de la photo. Il a été vérifié à l'œil : texte blanc sur un fond assombri.
- **Lecteur d'écran complet** (NVDA, VoiceOver) : non testé. Cette passe couvre les contrastes, le clavier et les libellés, c'est-à-dire les critères vérifiables du référentiel de la formation.
