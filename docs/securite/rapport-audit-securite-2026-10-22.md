# Rapport d'audit de sécurité — The Prepboard

**Date** : 22/10/2026. **Outil** : Claude Code (audit outillé, demandé par la formation). **Périmètre** :
- le dépôt GitHub `robinmorthpro/the-prep-board`, code actuel et historique complet ;
- la base Supabase (projet The Prep Board, région de Londres) ;
- le site en ligne https://www.theprepboard.fr, hébergé sur Vercel.

> **En clair** : on a vérifié trois choses.
> 1. Personne ne peut lire ou modifier les données d'un autre utilisateur.
> 2. Aucune clé secrète (mot de passe d'accès aux services payants) ne traîne dans le code public.
> 3. Le site ne présente pas de faille connue.
>
> Tout ce qui a été trouvé est corrigé ou justifié ci-dessous.

## 1. Méthode

La méthode suit la checklist d'audit de la formation (leçon « Lovable : la méthode pas à pas (sécurité + SEO) » et semaine 5, exercice 3).

| Contrôle | Comment | En clair |
|---|---|---|
| RLS et règles d'accès | Lecture des règles des 14 tables, alertes du Security Advisor de Supabase | Chaque table de la base a ses règles « qui a le droit de voir quoi ». On les a toutes relues. |
| Test à deux comptes (A / B) | Requêtes exécutées avec l'identité d'un candidat, puis sans connexion | On s'est fait passer pour un candidat, puis pour un visiteur, pour voir ce qu'ils peuvent réellement lire. |
| Secrets | Recherche de clés (Anthropic, Google, Resend, Stripe, Supabase secrète, clés privées, jetons) dans le code actuel et dans les 406 commits de l'historique | On a fouillé tout le code, y compris les anciennes versions, à la recherche d'une clé oubliée. |
| Fonctions serveur | Authentification et validation des entrées des 15 fonctions serveur | Le code qui tourne côté serveur (appels à l'IA, à la voix) vérifie qui l'appelle et ce qu'on lui envoie. |
| Stockage | Visibilité du bucket et règles d'accès aux fichiers | Les documents déposés par les candidats sont-ils privés ? |
| Dépendances | `npm audit` sur les dépendances de production | Les briques de code externes utilisées par l'app ont-elles des failles connues ? |
| Site en ligne | HTTPS, en-têtes de sécurité, réponse des routes | Ce que voit un navigateur quand il se connecte au site. |
| GitHub et données personnelles | Réglages du dépôt, adresses e-mail dans l'historique | Ce que le dépôt public révèle. |

## 2. Ce qui est en place

| Point | Constat technique | En clair |
|---|---|---|
| RLS | Activée sur les 14 tables. Chaque candidat ne voit et ne modifie que ses lignes (`auth.uid() = user_id`). L'admin lit tout, sans pouvoir écrire. | Chaque candidat a son coffre. L'admin peut regarder dans tous les coffres, mais rien y changer. |
| Test A / B | Un candidat voit 0 profil, 0 entretien, 0 réponse, 0 évaluation et 0 fichier d'un autre candidat. Toute tentative de modification est refusée. Sans connexion : rien de lisible. | Testé pour de vrai : impossible de voir ou de toucher les données d'un autre. |
| Rôles | Rôles dans `user_roles`, lecture seule pour les utilisateurs, vérifiés par `has_role()`. Formule (`profiles.plan`) protégée par un déclencheur. | Un candidat ne peut pas se donner le rôle admin, ni passer seul en formule payante. |
| Espace admin | Doublement protégé : l'interface redirige les comptes non admin, et la base refuse leurs lectures. | Même en contournant l'écran, la base refuse. |
| Stockage | Bucket `interview-supports` privé, accès limité au dossier `{user_id}/` de chaque candidat. | Les documents déposés ne sont visibles que par leur auteur. |
| Secrets | Aucune clé secrète dans le code ni dans l'historique. Seul jeton trouvé : la clé publique `anon` de Supabase, publique par conception. | Aucun mot de passe de service n'a fuité. La seule clé visible est faite pour l'être. |
| Variables d'environnement | Clés Gemini, Anthropic, ElevenLabs et clé de service Supabase stockées uniquement dans Vercel, en mode « sensible ». | Les vraies clés sont dans le coffre de l'hébergeur, illisibles même pour le propriétaire du compte. |
| Fonctions serveur | Les 15 exigent une session valide (`requireSupabaseAuth`) et valident leurs entrées avec zod. Celles qui utilisent la clé de service vérifient d'abord la propriété des données. | Le serveur vérifie l'identité, et refuse les données mal formées. |
| Injections et XSS | Aucun `eval`. Aucun HTML injecté à partir de données utilisateur : seul `dangerouslySetInnerHTML` du composant graphique shadcn, qui génère du CSS fixe. Aucun journal de données sensibles. | Impossible de glisser du code malveillant dans une page. |
| Authentification | Confirmation de l'adresse e-mail obligatoire, envois limités à 30 par heure, connexion anonyme désactivée. Seuls l'e-mail et Google sont activés. Adresses de retour sur le domaine réel. | On ne crée pas de compte avec l'adresse de quelqu'un d'autre, et les liens de connexion ne renvoient que vers le vrai site. |
| Voix | Agent ElevenLabs avec jeton signé, et liste des sites autorisés (www.theprepboard.fr). | L'agent vocal refuse les appels venant d'un autre site. |
| Transport | HTTPS partout, HSTS (2 ans). | Les échanges sont chiffrés, et le navigateur refuse toute version non chiffrée du site. |

## 3. Problèmes trouvés et traitement

| # | Gravité | Problème (technique) | En clair | Traitement | Statut |
|---|---|---|---|---|---|
| 1 | Élevé | `@modelcontextprotocol/sdk` 1.28 (5 failles connues, sans correctif publié), embarquée par `@lovable.dev/mcp-js`. Elle servait une route `/mcp` ajoutée par Lovable et inutilisée par l'app. | Lovable avait ajouté une porte d'entrée pour assistants IA, dont l'app ne se sert pas. Elle reposait sur une brique de code qui a des failles connues. | Retrait complet : plugin, routes `/mcp`, `/.mcp/*`, `/.well-known/oauth-protected-resource`, outils, dépendance. Vérifié en ligne : `/mcp` répond 404. | Corrigé |
| 2 | Moyen | La RLS permet à un candidat d'insérer ses propres évaluations et de modifier le percentile ou le lien d'évaluation de ses entretiens, en appelant l'API directement. | Un candidat malin pourrait s'attribuer une fausse note, sans passer par l'app. Il ne peut toucher qu'à sa propre note, jamais à celle d'un autre. | La note est écrite par la page de l'entretien à la fin du feedback. La protéger demande de déplacer cette écriture côté serveur, donc de toucher l'enchaînement de fin d'entretien, la fonction centrale de l'app. Risque faible : un candidat ne peut fausser que sa propre note, et l'évaluation d'origine reste en base. Correctif planifié : écriture côté serveur seulement et déclencheur de protection des colonnes. | Assumé, correctif planifié |
| 3 | Moyen | Adresse e-mail personnelle comme auteur de 14 commits du dépôt public (01/10 au 17/10). L'historique ne peut pas être réécrit (synchronisation avec Lovable). | Une adresse e-mail personnelle apparaît dans d'anciennes versions publiques du code. | Option GitHub « Keep my email addresses private » activée, avec blocage des envois qui exposeraient cette adresse. Tous les commits depuis le 18/10 utilisent l'adresse anonyme GitHub. | Corrigé pour l'avenir |
| 4 | Moyen | Fonctions serveur Vercel exécutées à Washington (`iad1`), base à Londres. | Les données des candidats faisaient un aller-retour par les États-Unis à chaque action. | Région fixée à Londres (`lhr1`) dans la configuration du projet. Vérifié en ligne (`x-vercel-id: lhr1::lhr1`). | Corrigé |
| 5 | Faible | Protection contre les mots de passe fuités (HaveIBeenPwned) désactivée : elle n'existe que sur les formules payantes de Supabase. | Supabase ne peut pas, sur l'offre gratuite, refuser les mots de passe déjà piratés ailleurs. | En compensation : 8 caractères minimum, lettres et chiffres obligatoires. Message d'erreur en français aligné sur cette règle. | Compensé |
| 6 | Faible | En-têtes de sécurité absents : `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`. | Le site ne donnait pas au navigateur quelques consignes de prudence classiques. | En-têtes ajoutés à toutes les réponses du serveur. `frame-ancestors` interdit d'afficher le site dans un autre site (sauf l'éditeur Lovable), et `Permissions-Policy` n'autorise le micro qu'au site lui-même. Vérifié en ligne. | Corrigé |
| 7 | Moyen | Protections GitHub désactivées : graphe des dépendances, alertes Dependabot, Secret Protection, analyse CodeQL. | GitHub ne surveillait ni les failles des briques de code, ni les clés publiées par erreur. | Activés : alertes Dependabot, Secret Protection avec blocage des envois contenant une clé (push protection), analyse CodeQL à chaque envoi. | Corrigé |
| 8 | Info | `.env` versionné. | Un fichier de réglages est publié dans le dépôt. | Justifié : il ne contient que l'URL du projet et la clé publique `anon`, faites pour être exposées et protégées par la RLS. Ces valeurs sont de toute façon envoyées au navigateur. Les fichiers `.env.local` sont ignorés par git. | Justifié |
| 9 | Info | Dépôt public (la checklist de la formation recommande un dépôt privé). | Le code est visible par tous. | Justifié : le jury doit pouvoir lire le dépôt et son historique. Aucun secret, ce que vérifient désormais en continu les protections de GitHub. | Justifié |
| 10 | Info | Pas de sauvegarde téléchargeable sur la formule gratuite de Supabase. | Pas de copie de secours automatique des données. | La structure de la base est versionnée (`supabase/migrations`) et peut être recréée. Données d'un MVP sans clients payants : risque assumé. Formule Pro (sauvegardes quotidiennes) au lancement commercial. | Assumé |
| 11 | Info | Alertes « SECURITY DEFINER exécutable » (`has_role`, `admin_emails`, relais de connexion Google) et « RLS sans règle » sur `oauth_handoffs`. | Supabase signale des fonctions qui s'exécutent avec des droits élevés. | Volontaire et contrôlé. `admin_emails()` ne renvoie rien à un non-admin. Le relais Google exige un jeton aléatoire d'au moins 32 caractères, valable 5 minutes et à usage unique. `oauth_handoffs` est fermée à tous, sauf à ces fonctions. | Justifié |
| 12 | Info | esbuild : lecture de fichiers possible via le serveur de développement sous Windows. | Faille d'un outil de développement, qui ne tourne pas sur le site en ligne. | Sans effet en production. Mise à jour à la prochaine révision des dépendances. | Justifié |
| 13 | Info | Alertes de performance Supabase : clés étrangères sans index, `auth.uid()` réévalué à chaque ligne. | Des optimisations de vitesse possibles pour plus tard. | Sans effet sur la sécurité, négligeable au volume actuel. | Justifié |

## 4. RGPD : données sensibles et hébergement

| Donnée | Où elle est stockée ou traitée | En clair |
|---|---|---|
| Identité (nom, prénom, e-mail) | Supabase, Londres | En Europe (Royaume-Uni, reconnu adéquat par l'UE). |
| Parcours, expériences, projet professionnel, réponses | Supabase, Londres | Idem. |
| Transcriptions d'entretiens, notes, feedbacks | Supabase, Londres | Idem. |
| Enregistrements audio des entretiens | ElevenLabs, conservés 30 jours | L'audio est effacé automatiquement au bout de 30 jours. |
| Textes envoyés à l'IA (réponses, transcriptions, supports) | Google (Gemini) et Anthropic (Claude), via leurs API | Ces fournisseurs ne s'entraînent pas sur les données envoyées par API. |
| E-mails transactionnels | Resend, Irlande | Envoi des e-mails de confirmation depuis contact@theprepboard.fr. |
| Traitement serveur | Vercel, Londres (`lhr1`) | Le code serveur tourne au même endroit que la base. |

La documentation utilisateur présente ces traitements, les durées de conservation et la procédure de suppression du compte.

## 5. Suivi
- **Correctif planifié** : écriture de la note côté serveur uniquement (point 2).
- **À chaque nouvelle fonctionnalité** : audit ciblé (règles RLS des nouvelles tables, validation des entrées).
- **Chaque mois** : audit complet et relecture des alertes Dependabot, CodeQL et Secret Protection.
