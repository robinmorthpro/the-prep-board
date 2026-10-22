# Rapport de QA « utilisateur fou » — The Prepboard

22/10/2026 · https://www.theprepboard.fr · deux passes, avant et après corrections.

## Méthode
- **Pages publiques** : Playwright (Chromium), en desktop (1280 px) et en mobile (Pixel 7). Comportement humain : défilement lent, pauses, mouvements de souris. Vidéo et captures pour chaque test.
  - Pages : accueil, 5 pages concours, test gratuit, blog, connexion, inscription.
  - Cas limites : formulaire vide, double clic, adresse invalide, page inexistante, accès sans compte aux espaces protégés.
  - Contrôles : liens internes, navigation au clavier, erreurs de la console.
- **Espace candidat connecté** : navigateur de test, compte candidat, en desktop et en mobile (375 px).
  - Pages : 12 pages (parcours, tableau de bord, modules 1 à 8, ressources, premium).
  - Contrôles : débordements, images cassées, erreurs affichées, chargements bloqués.
- **Espace admin connecté** : compte admin, en desktop et en mobile.
  - Pages : Pilotage, fiche candidat, fiche inexistante, filtre par école.
- **Aucune donnée modifiée** : aucun compte créé, aucun formulaire envoyé avec de vraies valeurs.

## Première passe : 7 bugs, du plus grave au moins grave

| # | Gravité | Où | Bug | Reproduire | Statut |
|---|---|---|---|---|---|
| 1 | Grave | Accueil, desktop et mobile | Les 3 captures de l'app (onglets 01, 02, 03) ne s'affichent pas : erreur 404. Elles n'étaient hébergées que sur les serveurs de Lovable. | Ouvrir l'accueil, section « La méthode » | Corrigé |
| 2 | Moyen | Pages publiques, desktop de 1024 à environ 1410 px | Le haut de page déborde de 68 px : les boutons « Se connecter » et « Je commence ma préparation » sont coupés, et une barre de défilement horizontale apparaît | Fenêtre de 1280 px de large | Corrigé |
| 3 | Moyen | Connexion et inscription | Les messages d'erreur sont en anglais : « Anonymous sign-ins are disabled », « Password should be at least 6 characters. », « missing email or phone » | Valider les formulaires vides, ou avec un mot de passe trop court | Corrigé |
| 4 | Moyen | Pilotage (admin), mobile | La page déborde de 351 px. En cause : le libellé masqué d'une colonne du tableau, qui sortait de sa zone de défilement, et la liste des écoles, trop large. | Écran de 375 px, page Pilotage | Corrigé |
| 5 | Faible | Fiche candidat (admin), mobile | Les blocs « Modules » et « Entretiens » dépassent de 27 px | Écran de 375 px, ouvrir une fiche | Corrigé |
| 6 | Faible | Mobile, module « Projet professionnel » | Le bouton « Valider et débloquer le module 3 » dépasse de 9 px | Écran de 375 px, page /partie-2 | Corrigé |
| 7 | Faible | Blog | Pas de titre principal (h1) : gênant pour l'accessibilité et le référencement | Ouvrir /blog | Corrigé |

## Corrections
- **Bug 1** : les 3 captures sont désormais dans le dépôt (`src/assets/site/`).
- **Bug 2** : sous 1420 px, le haut de page passe au menu compact.
- **Bug 3** : messages en français (`src/lib/auth-messages.ts`, avec tests). Un formulaire vide n'est plus envoyé à Supabase.
- **Bugs 4 et 5** : la zone de défilement du tableau est rendue « relative », la liste des écoles s'adapte à l'écran, et les blocs ont une largeur minimale nulle.
- **Bug 6** : le bouton revient à la ligne.
- **Bug 7** : le titre de la page Blog est un h1.

## Deuxième passe, après corrections
- **Site public** (Playwright, desktop et mobile) : **31 tests sur 31 réussis**.
  - Aucune erreur de console, en dehors de la réponse 422 de Supabase, attendue pour un mot de passe trop court et affichée en français.
  - Aucun lien cassé, page 404 propre, espaces protégés redirigés vers la connexion.
- **Espace candidat** : aucun débordement en desktop ni en mobile, aucune image cassée, aucune erreur affichée.
- **Espace admin** :
  - En desktop, le Pilotage affiche ses 3 chiffres clés, ses 2 graphiques et le tableau des candidats.
  - Le filtre par école met à jour les chiffres clés.
  - La fiche d'un candidat inexistant affiche « Ce candidat n'existe pas ou a supprimé son compte. ».
  - Les débordements mobiles ont été corrigés et vérifiés sur la page en ligne.
- **Navigation au clavier** (accueil) : ordre logique, focus visible à chaque étape.

## Observations sans correction
- **Rechargement fréquent du Pilotage pendant le test.** Le navigateur de test passait de « masqué » à « visible » toutes les 2 secondes, et le Pilotage se recharge à chaque retour sur l'onglet. C'est le comportement normal de React Query. Avec un vrai navigateur, ça n'arrive que quand l'utilisateur revient sur l'onglet.
- **Le graphique « Note moyenne par école » reste complet quand on filtre sur une école.** C'est voulu : il sert à comparer les écoles, et un clic sur une école applique le filtre.

## Captures
- [Accueil : les captures de l'app s'affichent](captures/accueil-captures-app.png)
- [Haut de page à 1280 px, sans débordement](captures/haut-de-page-1280px.png)
- [Message d'erreur en français](captures/message-erreur-francais.png)

Les vidéos Playwright et le rapport HTML complet ne sont pas dans le dépôt : ils sont trop lourds et restent sur le poste de travail.
