# The Prepboard

Plateforme d'entraînement aux oraux d'admission en école de commerce (concours BCE / Ecricome) pour les étudiants de classe préparatoire. Le candidat construit son dossier module par module avec un retour de l'IA, puis passe un entretien de motivation **à la voix**, face à un jury simulé par IA qui reproduit le format réel de chaque école. Il reçoit ensuite une **évaluation chiffrée et un feedback rédigé**.

- **Production** : [www.theprepboard.fr](https://www.theprepboard.fr) (Vercel, fonctions serveur à Londres)
- **Rapports** : [QA](docs/qa/rapport-qa-2026-10-22.md) · [sécurité](docs/securite/rapport-audit-securite-2026-10-22.md) · [accessibilité](docs/accessibilite/rapport-accessibilite-2026-10-22.md)

---

## Fonctionnalités

| Espace | Ce que fait l'utilisateur |
|---|---|
| **Informations personnelles** et **Je me prépare** (modules 1 à 6) | Construit son dossier : informations personnelles, projet professionnel, fiches écoles, expériences et anecdotes, sujets d'actualité, supports d'entretien. Les modules de fond reçoivent un retour de l'IA. |
| **Je m'entraîne** (modules 7 et 8) | Répond aux questions clés (à l'écrit ou à la voix), puis passe un entretien vocal complet avec le jury de l'école choisie : structure officielle, phases chronométrées, tirages (cartes, articles, mises en situation). |
| **Feedback** | Note calculée à partir de la grille de l'école, percentile, points forts et axes de progrès appuyés sur des citations de la transcription. |
| **Tableau de bord** | Avancement des modules, priorités de travail, historique des entretiens. |
| **Pilotage** (admin) | Indicateurs en temps réel (Supabase Realtime), note moyenne par école, complétion des modules, liste et fiche de chaque candidat. Réservé au rôle admin. |
| **Site public** | Pages concours par école, test gratuit, blog, sitemap. |

---

## Stack technique

| Couche | Outil | Rôle |
|---|---|---|
| Génération puis édition du code | **Lovable**, puis **Claude Code** | Lovable pour la base de l'app, Claude Code pour les modifications ciblées, les audits et la mise en production |
| Front + serveur | **TanStack Start** (React 19, TypeScript, Vite) | Rendu, routing, fonctions serveur |
| UI | Tailwind CSS 4, shadcn/ui (Radix), Recharts | Composants, design system personnalisé, graphiques |
| Données | **Supabase** (PostgreSQL, Londres) | 14 tables, migrations versionnées, RLS, Realtime |
| Authentification | **Supabase Auth** | E-mail avec confirmation obligatoire, ou Google |
| Jury vocal | **ElevenLabs Conversational AI** | Agent vocal temps réel (voix, tours de parole) |
| IA | **Gemini 3.7 Flash** (API Google), **Claude Sonnet 5** (API Anthropic) | Gemini : note, retours des modules, transcription. Claude : rédaction du feedback. |
| E-mails | **Resend** | E-mail de confirmation d'inscription depuis `contact@theprepboard.fr` |
| Automatisation | **Claude Cowork** | Relance hebdomadaire des candidats inactifs (brouillons Gmail) |
| Tests | Vitest, Playwright | Tests unitaires ; QA et accessibilité sur le site en ligne |
| Hébergement | **Vercel** | Déploiement HTTPS à chaque fusion dans `main`, domaine personnalisé |

---

## Architecture de l'IA

L'IA n'a jamais le dernier mot sur la note : elle qualifie, le code calcule.

1. **Jury** (ElevenLabs) : conduit l'entretien, ne note rien. Le premier message, les phases et les bascules sont pilotés par l'application (`src/lib/phase-engine.ts`, `src/lib/school-interviews.ts`).
2. **Évaluateur** (`src/lib/evaluateur/`, Gemini) : renvoie uniquement un niveau par critère de la grille. Points, note, pénalités de durée et percentile sont **calculés par le code** à partir de `bareme.json`. La note est donc reproductible et vérifiable.
3. **Rédacteur** (`src/lib/redacteur/`, Claude) : rédige le feedback à partir de la note calculée. Les citations introuvables dans la transcription sont retirées par le code.

Tous les appels d'IA passent par des fonctions serveur (`src/lib/ai/providers.ts`) qui exigent une session connectée. Le détail de la configuration du jury est dans [`docs/agent-jury-elevenlabs.md`](docs/agent-jury-elevenlabs.md) (généré depuis le code, ne pas éditer à la main).

---

## Données et sécurité

- **14 tables** : `profiles`, `user_roles`, `career_projects`, `school_sheets`, `experiences`, `news_topics`, `interview_supports`, `question_answers`, `question_attempts`, `interview_sessions`, `interview_evaluations`, plus trois tables techniques (`bench_runs`, `bench_results`, `oauth_handoffs`).
- **RLS activée sur les 14 tables** : chaque candidat n'accède qu'à ses propres données. L'admin lit tout sans pouvoir écrire (rôle vérifié par `has_role()`).
- **Secrets côté serveur uniquement** : les clés d'API sont lues dans des fonctions serveur, déclarées dans Vercel, jamais exposées au navigateur ni versionnées.
- **Côté client**, seules l'URL Supabase et la clé publique (`anon`) sont utilisées. La protection des données repose sur les RLS.
- Détail des contrôles et des correctifs : [rapport d'audit de sécurité](docs/securite/rapport-audit-securite-2026-10-22.md).

---

## Installation locale

Prérequis : [Bun](https://bun.sh) (ou Node.js 20+ avec npm).

```sh
git clone https://github.com/robinmorthpro/the-prep-board.git
cd the-prep-board
bun install
bun run dev
```

### Variables d'environnement

Les variables publiques sont dans `.env`. Les secrets se déclarent dans l'hébergeur (ou dans un `.env.local` non versionné), jamais dans le dépôt.

| Variable | Où | Description |
|---|---|---|
| `VITE_SUPABASE_URL`, `SUPABASE_URL` | client et serveur | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY` | client et serveur | Clé publique (`anon`) Supabase |
| `VITE_SUPABASE_PROJECT_ID` | client | Identifiant du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | Clé de service Supabase (secret) |
| `GEMINI_API_KEY` | serveur | Clé API Google Gemini (secret) |
| `ANTHROPIC_API_KEY` | serveur | Clé API Anthropic (secret) |
| `ELEVENLABS_API_KEY` | serveur | Clé API ElevenLabs (secret) |
| `ELEVENLABS_AGENT_ID_CLASSIQUE` | serveur | Agent jury par défaut |

### Commandes

| Commande | Effet |
|---|---|
| `bun run dev` | Serveur de développement |
| `bun run build` | Build de production |
| `bun run test` | Tests unitaires (Vitest) |
| `bun run lint` | Lint ESLint |

---

## Utilisation

1. Créer un compte sur [www.theprepboard.fr](https://www.theprepboard.fr) (e-mail à confirmer, ou Google).
2. Remplir le module 1 : il personnalise la suite. Les modules 1 à 5 s'ouvrent dans l'ordre, les modules 6 à 8 dès le départ.
3. Soumettre les modules à l'IA, corriger, recommencer autant que nécessaire.
4. Dans le module 8, choisir une école, autoriser le micro et passer l'entretien. Cliquer sur « Terminer l'entretien » lance la notation et le feedback.

---

## Historique par étape

The Prepboard a démarré en août 2026 dans un premier projet Lovable. Le 1er octobre 2026, il a été **migré vers ce dépôt et un nouveau projet Supabase**. L'historique Git commence donc à cette date. Les **migrations SQL** (`supabase/migrations/`, datées depuis le 18/08/2026) gardent la trace du schéma depuis l'origine, et [`JOURNAL.md`](JOURNAL.md) détaille les jalons.

Le dépôt a été créé par Lovable : son premier commit est le modèle de départ, et non un commit « M0 - Setup initial ». Les commits « Changes », « Work in progress » ou « Update plan » sont des commits automatiques de Lovable. Comme l'historique ne se réécrit pas, ce tableau relie chaque étape du projet à ses commits clés.

| Étape | Dates | Commits clés | Ce qui a été fait |
|---|---|---|---|
| M0 · Mise en place | 01/10 | [`2ba076e`](https://github.com/robinmorthpro/the-prep-board/commit/2ba076e) | Projet TanStack Start créé par Lovable |
| M1 · Cadrage | septembre | Hors dépôt | Note de cadrage, personas, PRD et choix de stack, rédigés dans le Notion du projet |
| M2 · Données et authentification | 18/08 → 01/10 | [migrations](supabase/migrations), [`8843be2`](https://github.com/robinmorthpro/the-prep-board/commit/8843be2), [`c8c0283`](https://github.com/robinmorthpro/the-prep-board/commit/c8c0283) | Schéma avec RLS, nouveau projet Supabase, connexion Google via Supabase Auth |
| M3 · Interfaces et design system | 02/10 | [`af0e7a8`](https://github.com/robinmorthpro/the-prep-board/commit/af0e7a8), [`e91a5f0`](https://github.com/robinmorthpro/the-prep-board/commit/e91a5f0) | Brand kit « Encre et ciel » appliqué, refonte visuelle des pages d'après les maquettes |
| M4 · IA : évaluateur et jury vocal | 09/10 → 17/10 | [`ac1da9a`](https://github.com/robinmorthpro/the-prep-board/commit/ac1da9a), [`055035c`](https://github.com/robinmorthpro/the-prep-board/commit/055035c), [`6069d00`](https://github.com/robinmorthpro/the-prep-board/commit/6069d00), [`1cc6b41`](https://github.com/robinmorthpro/the-prep-board/commit/1cc6b41), [`aeeb83a`](https://github.com/robinmorthpro/the-prep-board/commit/aeeb83a) | Évaluateur et table des évaluations, réglages du jury vocal, corrections après deux tours de tests |
| M5 · Espace admin et documentation | 09/10 → 18/10 | [`51ef313`](https://github.com/robinmorthpro/the-prep-board/commit/51ef313), [`ff4e5a5`](https://github.com/robinmorthpro/the-prep-board/commit/ff4e5a5), [`2756d3c`](https://github.com/robinmorthpro/the-prep-board/commit/2756d3c) | README, page Pilotage en temps réel, alignement sur les seuils du tableau de bord |
| Mise en production | 18/10 → 22/10 | [`f82d8ee`](https://github.com/robinmorthpro/the-prep-board/commit/f82d8ee), [`5e20ff9`](https://github.com/robinmorthpro/the-prep-board/commit/5e20ff9) | IA appelée en direct (Gemini et Claude), déploiement Vercel sur www.theprepboard.fr, e-mail d'inscription et message de confirmation |
| Qualité, sécurité, accessibilité | 22/10 | [`90e4b8e`](https://github.com/robinmorthpro/the-prep-board/commit/90e4b8e), [`6ae6c61`](https://github.com/robinmorthpro/the-prep-board/commit/6ae6c61), [`189f511`](https://github.com/robinmorthpro/the-prep-board/commit/189f511), [`b4eb1b3`](https://github.com/robinmorthpro/the-prep-board/commit/b4eb1b3), [`eff1e3f`](https://github.com/robinmorthpro/the-prep-board/commit/eff1e3f) | QA avec Playwright et corrections, audit de sécurité et correctifs, audit WCAG AA et corrections, rapports archivés dans `docs/` |

---

## Contribuer

Ce dépôt reste synchronisé avec Lovable. **Ne jamais réécrire l'historique publié** (force push, rebase, amend ou squash de commits déjà poussés). Les modifications passent par une branche, puis une fusion dans `main`, qui déclenche le déploiement Vercel. Voir `AGENTS.md`.
