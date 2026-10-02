# Redesign complet de The Prepboard — plan soumis à validation

## Cadre intangible

- Refonte strictement visuelle, réalisée par lots successifs avec validation de Robin après chaque lot.
- Aucun changement de route, de données, de schéma Supabase, de règle d’accès, d’authentification/OAuth, de server function, d’ElevenLabs, de jury vocal, de prompt, de calcul de percentile, de génération PDF ou de contenu pédagogique.
- Les états, validations, déverrouillages, sauvegardes, historiques, exports, minuteries, variantes propres aux écoles et comportements mobiles existants seront conservés.
- Le projet de sauvegarde et le commit `9bd4ee8` ne seront jamais modifiés.
- Avant chaque lot : capture de l’existant concerné. Après chaque lot : vérification ordinateur/mobile, contrôle des interactions et arrêt pour validation.
- Toute ambiguïté découverte pendant l’exécution suspendra le lot concerné jusqu’à la réponse de Robin.

## Étape 1 — Design system, logo et fondations

**Travail prévu**
- Installer la palette officielle : Encre `#0B1220`, Encre 2 `#121B2D`, Ciel `#A9C8FF`, Bleu `#2F5BFF` ou `#2E46C8` selon arbitrage, Gris clair `#F2F4F7`, Gris texte `#4A5568`, Gris sur sombre `#AEB8C9`, blanc.
- Passer toute l’interface à Inter 400/500/600/700, avec les tailles, graisses et interlettrages des maquettes.
- Refaire les variantes communes : boutons pilules, cartes 24–28 px, champs, menus, accordéons, badges, interrupteurs, fonds et états actifs.
- Remplacer le logo actuellement recomposé dans le code par les deux SVG officiels ; remplacer favicon et icône d’app après réception des fichiers.
- Conserver des styles adaptés aux petits écrans et aux préférences de réduction des animations.

**Fichiers prévus**
- `src/styles.css`, `src/routes/__root.tsx`
- `src/components/ui/button.tsx`, `card.tsx`, et uniquement les primitives réellement utilisées à harmoniser (`input`, `textarea`, `select`, `tabs`, `accordion`, `switch`, `badge`, etc.)
- `src/components/repetia/Mark.tsx`
- `public/favicon.*`, `public/apple-touch-icon.png` uniquement après réception des fichiers officiels

**Garantie** : styles, fontes et fichiers de marque uniquement ; aucune logique ni donnée.

## Étape 2 — Page d’accueil

**Travail prévu**
- Recomposer la page dans l’ordre de la maquette : photo d’ouverture + chiffres, méthode en trois étapes, comparatif par critères, épreuves en cartes photo, prix, témoignages photo, FAQ, appel final photo et pied de page.
- Reproduire les interactions visibles (étapes de méthode, témoignages, accordéons) sans changer leur finalité ni leurs données.
- Préserver toutes les destinations de liens existantes ; aucune nouvelle offre ou fonctionnalité ne sera inventée.

**Fichiers prévus**
- `src/routes/_site.index.tsx`
- `src/components/repetia/site.tsx`
- `src/lib/site-content.ts` seulement pour les textes explicitement validés
- Les images de `src/assets/site/`, seulement si Robin confirme qu’elles sont les sources définitives

**Garantie** : présentation et textes validés uniquement ; aucune logique applicative ni donnée utilisateur.

## Étape 3 — Autres pages publiques

**Travail prévu**
- Décliner le système approuvé sur l’en-tête, le pied de page, les cinq pages concours, le blog, la connexion/inscription, les erreurs et la page introuvable.
- Conserver tous les contenus concours, métadonnées, formulaires, redirections, messages d’authentification et relais OAuth.
- Le blog restera un écran d’attente tant qu’aucun contenu réel n’est fourni.

**Fichiers prévus**
- `src/routes/_site.tsx`, `_site.concours.$slug.tsx`, `blog.index.tsx`, `auth.tsx`, `auth.callback.tsx`, `__root.tsx`
- `src/components/repetia/site.tsx`
- `src/lib/site-content.ts` uniquement si un libellé est validé

**Garantie** : aucune modification de Supabase, de l’inscription, de la connexion ou d’OAuth.

## Étape 4 — Barre latérale et accueil étudiant

**Travail prévu**
- Barre latérale Encre de 330 px avec SVG officiel, navigation active Ciel et ordre de la maquette ; conserver le défilement récemment corrigé.
- Placer « Déconnexion » juste sous « Ressources théoriques », tout en gardant son action actuelle.
- Refaire l’accueil avec le bandeau photo et cinq cartes : Tableau de bord, Informations personnelles, Je me prépare, Je m’entraîne, Ressources théoriques.
- Afficher les avancements existants sans changer leurs calculs ni les règles de verrouillage.

**Fichiers prévus**
- `src/routes/_app.tsx`, `_app.dashboard.tsx`
- `src/components/vivaldi/SectionHub.tsx`
- `src/components/repetia/Mark.tsx`
- `src/components/vivaldi/module-banners.ts` seulement pour l’association des images existantes

**Garantie** : liens, session, déconnexion, progression et verrouillages inchangés.

## Étape 5 — Gabarit des modules 1 à 7

**Travail prévu**
- Appliquer le gabarit approuvé : navigation précédent/suivant, bandeau photo, introduction repliable si validée, formulaire blanc titré, contrôles harmonisés.
- Respecter les structures propres à chaque module : fiches écoles, expériences/anecdotes, actualités, supports/CV projectif et questions clés ne seront pas artificiellement uniformisés.
- Conserver les validations, seuils, sauvegardes, corrections IA, transcription orale, historiques et états verrouillés.

**Fichiers prévus**
- `src/components/vivaldi/PartHeader.tsx`, `PartNav.tsx`, `TheoryDialog.tsx`, `AiFeedback.tsx`, `OralAnswer.tsx`, `MonthPicker.tsx`
- `src/routes/_app.partie-2.tsx` à `_app.partie-7.tsx`
- `src/routes/_app.informations-personnelles.tsx` uniquement pour sa présentation ; sa place hors numérotation reste inchangée

**Garantie** : aucune requête Supabase, condition de validation, contenu théorique, feedback IA ou historique ne change.

## Étape 6 — Module 8 : réglages et entretien en direct

**Travail prévu**
- Refaire visuellement l’introduction, les réglages, le briefing, la carte école, le chrono, la question, l’état de prise de parole, le bouton de fin et les blocs propres à chaque école.
- Préserver le mode test écrit actuellement présent, les formats, difficultés, mute, démarrage, interruption, récupération, chronométrage et toutes les variantes EDHEC/emlyon/KEDGE/INSEEC/Montpellier.
- Ne pas ajouter de pastille micro ni d’onde animée sans décision explicite.

**Fichiers prévus**
- `src/routes/_app.partie-8.tsx` pour le JSX et les styles seulement
- `src/components/vivaldi/InterviewBriefDialog.tsx`, `PartHeader.tsx`, `PartNav.tsx`

**Fichiers explicitement exclus**
- `src/hooks/useJuryAgent.ts`, `src/lib/elevenlabs.functions.ts`, `src/lib/elevenlabs-agent-prompt.ts`, `src/lib/phase-engine.ts`, `src/lib/interview-text.ts`, `src/lib/school-interviews.ts`

**Garantie** : aucune modification du jury, d’ElevenLabs, des phases, du minuteur ou des données de session.

## Étape 7 — Feedback et historique

**Travail prévu**
- Recomposer le bandeau école, le percentile global existant, le feedback général, les priorités, les moments repliables et le transcript.
- Refaire visuellement le classement par école, l’ouverture d’un entretien, l’export et la suppression sans toucher à leur comportement.
- Ne pas créer de percentile par moment et ne pas transformer les paragraphes en puces sans accord sur les prompts.

**Fichiers prévus**
- `src/components/vivaldi/InterviewDebrief.tsx`
- Parties de présentation de l’historique dans `src/routes/_app.partie-8.tsx`
- `src/components/vivaldi/AiFeedback.tsx` seulement si l’effet partagé avec le module 6 est approuvé

**Fichiers explicitement exclus**
- `src/lib/ai.functions.ts`, tous les prompts, `src/lib/cockpit.ts`, `src/lib/transcript-pdf.ts`

**Garantie** : percentile global, parsing, débrief, transcript, historique et PDF inchangés ; seul le libellé visible du bouton PDF pourra changer après validation.

## Étape 8 — Écrans non maquettés

**Travail prévu**
- Décliner le langage visuel validé, écran par écran : tableau de bord détaillé, informations personnelles, hubs Je me prépare/Je m’entraîne, questions clés, ressources, formule complète et états secondaires.
- Présenter d’abord une proposition/capture pour chaque famille d’écran non maquettée ; ne rien inventer fonctionnellement.

**Fichiers prévus**
- `src/routes/_app.mon-tableau-de-bord.tsx`, `_app.informations-personnelles.tsx`, `_app.je-me-prepare.tsx`, `_app.je-m-entraine.tsx`, `_app.ressources.tsx`, `_app.premium.tsx`
- `src/components/vivaldi/SectionHub.tsx` et primitives partagées déjà validées

**Garantie** : calculs du cockpit, formulaires, sauvegarde automatique, progression et formule de test restent intacts.

## Textes certains à valider avant modification

### Accueil et navigation publique
- « La préparation aux concours, réinventée. » → « Entraînez-vous aux oraux d’admission, sans limite »
- « Je me lance » → « Je commence ma préparation »
- En-tête : « Je commence l’entraînement » → « Je commence ma préparation »
- « Entraînements personnalisés possibles » → « Entraînements personnalisés »
- « 100 % — Personnalisation du travail » → « +6 — points de progression »
- « Un prix unique, 5 à 10 fois moins cher qu’une prépa classique » → « Un prix unique, 3 à 10 fois moins cher qu’une prépa classique »
- « Préparez vos concours sans limite » → « La méthode The Prepboard »
- Méthode actuelle en texte continu → trois intitulés visibles : « Préparation guidée », « Entretiens illimités », « Feedbacks avec positionnement »
- « Prépa classique, IA seule ou The Prepboard ? » et « Huit critères, trois façons de se préparer. » : nouveaux titres visibles au-dessus du comparatif actuel
- Pied de page : « Je me lance » → « Je commence ma préparation »
- Nouveau lien visible dans la maquette : « Je teste gratuitement » → destination et existence à décider

### Accueil étudiant
- « Bienvenue Robin dans votre espace de préparation » → « Robin, bienvenue dans votre espace de préparation »
- « Travaillez les sections les une après les autres… » → « Travaillez les sections les unes après les autres… »
- « Mon tableau de bord » (carte d’accès) → « Tableau de bord »
- Nouvelle carte visible : « Informations personnelles » avec « Les réponses à cette section permettront de personnaliser la suite de votre préparation. »
- CTA de cartes « Voir les sous-sections » conservé ; les valeurs d’avancement resteront dynamiques et non celles des exemples.

### Modules 1 à 7
- Nouveaux libellés génériques montrés par la maquette : « À lire au démarrage », « Objectif », « À savoir » — **non appliqués sans arbitrage**, car les introductions existantes ne partagent pas toutes la même structure.
- Nouveau titre dans la carte formulaire du module 1 : « Mon projet professionnel » — **non ajouté sans validation**.
- Tous les champs, aides, avertissements, consignes théoriques et boutons de validation actuels restent inchangés sauf liste complémentaire fournie par Robin.

### Module 8, feedback et historique
- Correction proposée : « L’évaluation n’arrive qu’à la fin que quand vous cliquez… » → « L’évaluation n’arrive qu’à la fin, quand vous cliquez… »
- « Terminer l’entretien » → « Terminer l’entretien en avance » pendant l’entretien ; les autres états (« Obtenir mon débrief », clôture atteinte) restent inchangés.
- « Exporter le transcript en PDF » → « Exporter le feedback et le transcript en PDF »
- « Feedback détaillé des différents moments de l’entretien » → « Feedback détaillé »
- La pastille « Micro actif », l’onde animée et les percentiles par moment ne sont pas des changements de texte : ce sont des fonctionnalités absentes, donc elles restent exclues sans accord spécifique.

## Questions à Robin avant tout code

1. Pour les petits textes bleus sur fond `#E6EEFF`, faut-il garder `#2E46C8` comme dans les maquettes, ou utiliser partout le Bleu officiel `#2F5BFF` ?
2. Pouvez-vous envoyer les deux SVG officiels, ainsi que le symbole seul en SVG/PNG pour le favicon et l’icône d’app ? Aucun logo ne sera recomposé.
3. Les photographies exactes et captures d’application utilisées dans les maquettes seront-elles fournies séparément ? À défaut, faut-il réutiliser les images déjà présentes dans le projet, même si le cadrage diffère ?
4. Avez-vous des maquettes mobiles, ou faut-il adapter fidèlement ces compositions desktop aux petits écrans en conservant le contenu et les interactions ?
5. La section actuelle « Un oral ne s’improvise pas. Il se répète… », absente de la nouvelle maquette d’accueil, doit-elle être conservée et déplacée, ou Robin autorise-t-il sa suppression ?
6. La méthode actuelle contient un texte explicatif et une photo qui ne figurent pas tels quels dans la maquette. Faut-il les conserver dans la nouvelle section, ou valider leur remplacement par le texte et les trois étapes de la maquette ?
7. Validez-vous tous les changements de texte listés ci-dessus, notamment `+6 points de progression`, `3 à 10 fois moins cher`, les CTA et la correction grammaticale du module 8 ? Quelle est la source vérifiable du chiffre `+6` ?
8. Le lien « Je teste gratuitement » n’existe pas aujourd’hui. Faut-il l’omettre, le faire pointer vers l’inscription actuelle, ou prévoir ultérieurement une offre distincte ?
9. Les témoignages actuels sont explicitement marqués comme exemples dans le code. La maquette en retient trois avec photos. Confirmez-vous qu’ils peuvent être publiés tels quels, et fournissez-vous les trois portraits séparés ?
10. Pour l’interaction des trois étapes de la méthode : au survol seulement sur ordinateur, quel comportement souhaitez-vous au clavier et sur mobile (clic/accordéon, carrousel, ou première étape fixe) ?
11. Sur l’accueil étudiant, confirmez-vous l’ajout de la cinquième carte « Informations personnelles », qui pointe vers l’écran existant, sans changer la navigation ni les données ?
12. La maquette appelle les entraînements « Module 1 / Module 2 » dans la barre latérale, alors que l’en-tête actuel des Questions clés affiche « Module 7 » et celui des Simulations « Module 8 ». Faut-il conserver cette double numérotation, ou uniformiser les en-têtes avec la barre latérale ?
13. Pour les modules 1 à 7, autorisez-vous l’ajout purement visuel des libellés « À lire au démarrage », « Objectif » et « À savoir » en répartissant les textes existants, sans réécriture ? Pour les modules qui n’ont pas ces trois blocs, faut-il garder leur structure actuelle ?
14. La carte « À lire au démarrage » doit-elle être ouverte par défaut sur chaque module, et son état doit-il être mémorisé ou seulement local à la page ?
15. La maquette du module 8 montre une pastille « Micro actif » et une onde vocale. Souhaitez-vous les exclure comme demandé, ou autorisez-vous une étape fonctionnelle séparée utilisant uniquement les états audio déjà disponibles ?
16. Confirmez-vous que le mode test écrit et les « Paliers de silence » actuellement visibles dans le module 8 doivent rester visibles après redesign ?
17. Pour le feedback, faut-il conserver les paragraphes actuels tels quels dans la nouvelle mise en page, sans chercher à imiter les puces de la maquette ?
18. Confirmez-vous l’absence de percentiles par moment : aucun badge `P62`, `P88`, etc. ne sera affiché ; seul le percentile global existant sera conservé.
19. Le bouton PDF peut-il être renommé « Exporter le feedback et le transcript en PDF » sans modifier le document généré ?
20. L’historique doit-il rester dans la page du module 8 comme aujourd’hui, avec ouverture sur place, ou la maquette implique-t-elle un écran distinct ? Un écran distinct serait une nouvelle route et ne sera pas créé sans accord.
21. Le redesign de `AiFeedback` affecterait aussi le CV projectif du module 6. Faut-il harmoniser tous ses usages, ou limiter le nouveau rendu au feedback des entretiens ?
22. Pour les écrans non maquettés, souhaitez-vous une déclinaison directe du système validé après l’étape 7, ou des propositions visuelles intermédiaires avant chaque famille d’écrans ?
23. La page « Formule complète » contient actuellement un paiement simulé et un texte « Prototype ». Doit-elle être seulement relookée à l’étape 8, ou laissée visuellement inchangée jusqu’à la mise en place d’un vrai paiement ?

## Validation de chaque étape

Pour chaque lot : contrôle du rendu à 1440 px et 390 px, vérification des textes et débordements, test des interactions touchées, contrôle des erreurs, puis comparaison visuelle avec la maquette. Un compte rendu et des captures seront fournis, puis le chantier s’arrêtera jusqu’à la validation de Robin.
