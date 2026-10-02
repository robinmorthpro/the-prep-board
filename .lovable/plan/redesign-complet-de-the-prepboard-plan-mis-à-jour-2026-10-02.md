# Redesign complet de The Prepboard — plan mis à jour

## Références et règles de réalisation

- Les cinq fichiers HTML fournis sont la référence exacte à 1440 px pour les couleurs, typographies, tailles, graisses, espacements, rayons, ombres, dégradés, ordre, interactions et textes des écrans maquettés.
- Leur présentation sera transposée en composants React/Tailwind, jamais intégrée comme une page HTML autonome.
- Les images nommées dans les maquettes seront reliées aux fichiers existants de `src/assets/site` et `src/assets/schools`. Les trois nouvelles captures `preparation.jpg`, `entretien.jpg` et `feedback.jpg` serviront uniquement dans la section « La méthode ».
- Les deux SVG officiels fournis remplaceront le logo actuel selon le fond. Aucun logo ne sera redessiné. Le favicon et l’icône d’app attendront les fichiers annoncés pour l’étape 1.
- Sur mobile, l’adaptation préservera fidèlement la hiérarchie, le contenu et les interactions. Une capture à 390 px accompagnera chaque validation.
- Les couleurs particulières sont confirmées : `#2E46C8` pour les petits textes bleus sur `#E6EEFF`, et `#2F5BFF` pour les autres accents bleus sur fond clair.
- Les nombres animés de l’accueil reprendront le comportement CSS de la maquette, avec une version sans animation si l’utilisateur préfère réduire les mouvements.
- Les balises `<sc-if>` et valeurs `{{…}}` seront remplacées par les états et données réels du produit.

## Périmètre intangible

- Refonte visuelle par étapes, avec arrêt et validation de Robin après chaque étape.
- Aucun changement de données, Supabase, authentification, règles d’accès, progression, verrouillage, sauvegarde, IA, prompt, ElevenLabs, jury vocal, chronométrage, transcription, percentile, historique ou PDF.
- Les données d’exemple des maquettes ne seront jamais injectées à la place des données réelles.
- Les contenus pédagogiques existants seront repris sans réécriture, sauf les changements éditoriaux expressément validés ci-dessous.
- Le projet de sauvegarde et le commit `9bd4ee8` restent intouchables.
- Avant chaque étape : capture de l’existant. Après chaque étape : contrôles à 1440 px et 390 px, interactions concernées, erreurs et comparaison avec la référence ; puis arrêt pour validation.

## Étape 1 — Identité visuelle et composants communs

**À réaliser**
- Mettre en place la palette officielle, Inter 400/500/600/700, la hiérarchie typographique et les styles communs exacts des maquettes.
- Harmoniser boutons pilules, cartes, champs, listes, menus, accordéons, badges, interrupteurs, fonds, bordures, ombres et états actifs.
- Installer les deux logos SVG officiels sur fond clair et sombre.
- Installer le favicon et l’icône d’app dès réception des fichiers annoncés.
- Ne modifier que les fondations visuelles ; aucune donnée ni logique.

**Fichiers concernés**
- `src/styles.css`, `src/routes/__root.tsx`
- `src/components/repetia/Mark.tsx`
- Primitives visuelles utilisées dans `src/components/ui/`
- Fichiers de favicon/icône dans `public/` après réception

**Validation** : planche des principaux éléments visuels, plus captures ordinateur/mobile d’une page témoin. Aucun code avant le feu vert explicite de Robin.

## Étape 2 — Page d’accueil

**À réaliser**
- Reproduire `maquette-accueil.html` avec les données et liens réels.
- Ordre confirmé : ouverture photo et chiffres, méthode en trois étapes, comparatif, épreuves, prix, témoignages selon décision à venir, FAQ, appel final et pied de page.
- Supprimer la section « Un oral ne s’improvise pas. Il se répète… ».
- Remplacer entièrement l’ancienne section méthode par le titre, le texte, les trois étapes et les trois captures de la maquette.
- Méthode : survol ou clic sur ordinateur, sélection au clavier, trois étapes empilées avec leur capture sur mobile.
- Conserver les destinations existantes, sauf le nouveau lien « Je teste gratuitement » vers `/test-gratuit`.
- Créer la page d’attente `/test-gratuit` seulement après réception et validation de son titre et de son texte exacts.

**Fichiers concernés**
- `src/routes/_site.index.tsx`
- `src/components/repetia/site.tsx`
- `src/lib/site-content.ts` pour les textes validés
- Nouvelle route `/test-gratuit` après fourniture de sa copie
- Pointeurs des trois nouvelles captures dans `src/assets/`

**Point encore bloqué** : affichage temporaire de la section témoignages, à arbitrer avant cette étape.

## Étape 3 — Autres pages publiques

**À réaliser**
- Décliner l’identité approuvée sur l’en-tête, le pied de page, les cinq pages concours, le blog, la connexion/inscription, les erreurs et la page introuvable.
- Conserver les contenus concours, formulaires, redirections, messages d’authentification et relais OAuth.
- Garder le blog comme écran d’attente tant qu’aucun contenu réel n’est fourni.

**Fichiers concernés**
- Layout public et routes concours, blog et authentification dans `src/routes/`
- `src/components/repetia/site.tsx`
- `src/lib/site-content.ts` uniquement pour les libellés validés

## Étape 4 — Barre latérale et accueil étudiant

**À réaliser**
- Reproduire `maquette-app-dashboard.html` avec le logo officiel, la navigation active et le défilement existant.
- Conserver « Module 7 » pour Questions clés et « Module 8 » pour Simulations complètes partout, y compris dans la barre latérale.
- Placer « Déconnexion » sous « Ressources théoriques » en conservant son action.
- Refaire l’accueil avec cinq cartes : Tableau de bord, Informations personnelles, Je me prépare, Je m’entraîne, Ressources théoriques.
- Relier « Informations personnelles » à l’écran existant.
- Afficher uniquement les progressions réelles ; ne jamais reprendre les chiffres d’exemple.

**Fichiers concernés**
- `src/routes/_app.tsx`, `_app.dashboard.tsx`
- `src/components/vivaldi/SectionHub.tsx`
- Association des images existantes, sans changer les calculs

## Étape 5 — Modules 1 à 7

**À réaliser**
- Prendre `maquette-app-module-1.html` comme gabarit visuel : navigation, bandeau photo, introduction et formulaire.
- Garder « Module 1 » à « Module 5 » pour la préparation, puis « Module 7 » pour Questions clés ; les Informations personnelles restent une page dédiée non numérotée.
- Utiliser « À lire au démarrage », « Objectif » et « À savoir » avec les textes existants, sans les réécrire, lorsque la structure du module s’y prête.
- Garder l’encart ouvert par défaut et son état seulement local à la page, sans mémorisation.
- Si un module ne se prête pas à cette structure, conserver sa structure actuelle et suspendre sa seule adaptation pour arbitrage.
- Harmoniser tous les usages du retour IA, y compris le CV projectif du module 6, sans modifier son contenu ni son analyse.
- Préserver les particularités de chaque module, leurs seuils, sauvegardes, validations, aides, historiques et corrections.

**Fichiers concernés**
- Composants partagés des modules dans `src/components/vivaldi/`
- `src/routes/_app.informations-personnelles.tsx`
- `src/routes/_app.partie-2.tsx` à `_app.partie-7.tsx`

## Étape 6 — Module 8 : réglages et entretien

**À réaliser**
- Reproduire la présentation de `maquette-app-module-8-entretien.html` avec les états et données réels.
- Garder « Module 8 » partout.
- Refaire visuellement l’introduction, les réglages, le briefing, la carte école, le chrono, la question, l’écoute, le bouton de fin et les cartes propres aux écoles.
- Conserver visibles le mode test écrit et les paliers de silence.
- Exclure pour l’instant la pastille « Micro actif » et l’onde vocale ; elles feront l’objet d’un chantier séparé.
- Préserver toutes les variantes d’école, le mute, le démarrage, l’interruption, la récupération et le chronométrage.

**Fichiers concernés**
- Parties de présentation de `src/routes/_app.partie-8.tsx`
- Composants visuels partagés du briefing et de la navigation

**Fichiers exclus**
- Jury vocal, ElevenLabs, phases, textes d’entretien et configurations d’école dans les hooks et bibliothèques métier

## Étape 7 — Feedback et historique

**À réaliser**
- Reproduire `maquette-app-feedback.html` avec le percentile global et le contenu réellement renvoyé.
- Conserver les paragraphes actuels : aucune transformation en puces et aucun changement de prompt.
- Ne pas afficher de percentile par moment ; seul le percentile global existant sera montré.
- Refaire visuellement le feedback général, les priorités, les moments repliables et le transcript.
- Garder l’historique dans la page du module 8, avec ouverture sur place.
- Renommer le bouton « Exporter le feedback et le transcript en PDF » sans modifier le document généré.

**Fichiers concernés**
- `src/components/vivaldi/InterviewDebrief.tsx`
- Parties de présentation de l’historique dans `src/routes/_app.partie-8.tsx`
- Présentation partagée de `AiFeedback`

**Fichiers exclus**
- Prompts, calcul du percentile, analyse du débrief et génération PDF

## Étape 8 — Écrans non maquettés

**À réaliser**
- Décliner directement le système validé sur le tableau de bord détaillé, Informations personnelles, Je me prépare, Je m’entraîne, Questions clés, Ressources et Formule complète.
- Fournir des captures ordinateur/mobile pour validation après chaque famille d’écrans.
- Relooker seulement Formule complète : textes et paiement simulé restent inchangés.
- Préserver calculs du cockpit, formulaires, sauvegardes et progression.

**Fichiers concernés**
- Routes étudiantes correspondantes dans `src/routes/`
- `src/components/vivaldi/SectionHub.tsx` et composants déjà approuvés

## Changements de texte validés

- « La préparation aux concours, réinventée. » → « Entraînez-vous aux oraux d’admission, sans limite »
- CTA principaux → « Je commence ma préparation »
- « Entraînements personnalisés possibles » → « Entraînements personnalisés »
- « 100 % — Personnalisation du travail » → « +6 — points de progression »
- « 5 à 10 fois moins cher » → « 3 à 10 fois moins cher »
- Ancienne méthode → titre, texte et trois étapes exacts de la maquette
- Nouveaux titres du comparatif exacts de la maquette
- « Bienvenue Robin dans votre espace de préparation » → « Robin, bienvenue dans votre espace de préparation »
- Correction « les une après les autres » → « les unes après les autres »
- Carte « Mon tableau de bord » → « Tableau de bord »
- Ajout de la carte et du texte « Informations personnelles » de la maquette
- Correction du texte d’introduction du module 8 : « L’évaluation n’arrive qu’à la fin, quand vous cliquez… »
- Pendant l’entretien : « Terminer l’entretien en avance »
- « Exporter le transcript en PDF » → « Exporter le feedback et le transcript en PDF »
- « Feedback détaillé des différents moments de l’entretien » → « Feedback détaillé »
- Tous les autres textes des maquettes font foi pour les écrans concernés, sauf données d’exemple, témoignages non validés, percentiles par moment, pastille micro et onde vocale.

## Deux décisions encore nécessaires

1. Quel titre et quel texte exacts faut-il afficher sur la future page `/test-gratuit` ? Elle ne sera pas créée avant réception de cette copie.
2. En attendant les vrais témoignages et portraits, faut-il :
   - **Option A — recommandée :** masquer entièrement la section témoignages ;
   - **Option B :** afficher des cartes sans photo, clairement marquées « Exemples de mise en page — témoignages à venir » ?

Le favicon et l’icône d’app ne constituent pas une question : ils seront simplement intégrés à l’étape 1 dès leur réception.
