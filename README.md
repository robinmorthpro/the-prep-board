# The Prep Board

Plateforme d'entraînement aux oraux d'admission en école de commerce (concours BCE / Ecricome) pour les étudiants de classe préparatoire. Le candidat passe un entretien de motivation **à la voix**, face à un jury simulé par IA qui reproduit le format réel de chaque école, puis reçoit une **évaluation chiffrée et un feedback rédigé**.

- **Production** : déploiement Vercel avec domaine personnalisé en cours
- **Note de cadrage et PRD** : [Notion — Note de cadrage PrepBoard](https://app.notion.com/p/M1-5-Note-de-cadrage-PrepBoard-3e65ecea4d9b81298d5bdef2596143b9)

---

## Fonctionnalités

| Espace | Ce que fait l'utilisateur |
|---|---|
| **Je me prépare** (parties 1 à 7) | Construit son dossier : fiche école, projet professionnel, expériences et anecdotes, sujets d'actualité, questions clés. Exports PDF. |
| **Je m'entraîne** (partie 8) | Passe un entretien vocal complet avec le jury de l'école choisie : structure officielle, phases chronométrées, tirages (cartes, articles, mises en situation). |
| **Feedback** | Note calculée à partir de la grille de l'école, percentile, points forts et axes de progrès appuyés sur des citations de sa transcription. |
| **Mon tableau de bord** | Évolution des notes, radar par compétence, priorités de travail, historique des simulations. |
| **Site public** | Pages concours par école, test gratuit, blog, sitemap. |

---

## Stack technique

| Couche | Outil | Rôle |
|---|---|---|
| Génération et édition | **Lovable** | Vibe coding, synchronisation bidirectionnelle avec ce dépôt |
| Front + serveur | **TanStack Start** (React 19, TypeScript, Vite) | Rendu, routing, fonctions serveur |
| UI | Tailwind CSS 4, shadcn/ui (Radix), Recharts | Composants, design system personnalisé, graphiques |
| Données | **Supabase** (PostgreSQL) | 12 tables, migrations versionnées, RLS |
| Authentification | **Supabase Auth** | E-mail et connexion Google |
| Jury vocal | **ElevenLabs Conversational AI** | Agent vocal temps réel (voix, tours de parole) |
| Évaluation et feedback | **Google Gemini** via la passerelle IA Lovable | Évaluateur (niveaux par critère) puis rédacteur du feedback |
| Tests | Vitest | 233 tests unitaires |
| Hébergement | Lovable (migration vers Vercel prévue) | Déploiement HTTPS |

---

## Architecture de l'IA

L'IA n'a jamais le dernier mot sur la note : elle qualifie, le code calcule.

1. **Jury** (ElevenLabs) : conduit l'entretien, ne note rien. Le premier message, les phases et les bascules sont pilotés par l'application (`src/lib/phase-engine.ts`, `src/lib/school-interviews.ts`).
2. **Évaluateur** (`src/lib/evaluateur/`) : renvoie uniquement un niveau par critère de la grille. Points, note, pénalités de durée et percentile sont **calculés par le code** à partir de `bareme.json`. La note est donc reproductible et vérifiable.
3. **Rédacteur** (`src/lib/redacteur/`) : rédige le feedback à partir de la note calculée. Les citations introuvables dans la transcription sont retirées par le code.

Le détail de la configuration du jury est dans [`docs/agent-jury-elevenlabs.md`](docs/agent-jury-elevenlabs.md) (généré depuis le code, ne pas éditer à la main).

---

## Données et sécurité

- **12 tables** : `profiles`, `user_roles`, `school_sheets`, `career_projects`, `experiences`, `news_topics`, `question_answers`, `question_attempts`, `interview_sessions`, `interview_supports`, `interview_evaluations`, `oauth_handoffs`.
- **RLS activée sur les 12 tables** : chaque utilisateur n'accède qu'à ses propres données ; les rôles sont gérés dans `user_roles`.
- **Secrets côté serveur uniquement** : `ELEVENLABS_API_KEY`, `LOVABLE_API_KEY` et les identifiants d'agents sont lus dans des fonctions serveur et ne sont jamais exposés au navigateur ni versionnés.
- **Côté client**, seules l'URL Supabase et la clé publique (`anon`) sont utilisées ; la protection des données repose sur les RLS.

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

Les variables client sont dans `.env` ; les secrets serveur sont à déclarer dans l'hébergeur (jamais dans le dépôt).

| Variable | Où | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | client | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Clé publique (`anon`) Supabase |
| `VITE_SUPABASE_PROJECT_ID` | client | Identifiant du projet Supabase |
| `ELEVENLABS_API_KEY` | serveur | Clé API ElevenLabs (secret) |
| `ELEVENLABS_AGENT_ID_CLASSIQUE` | serveur | Agent jury par défaut |
| `LOVABLE_API_KEY` | serveur | Accès à la passerelle IA (secret) |

### Commandes

| Commande | Effet |
|---|---|
| `bun run dev` | Serveur de développement |
| `bun run build` | Build de production |
| `bun run test` | Tests unitaires (Vitest) |
| `bun run lint` | Lint ESLint |

---

## Historique du projet

Le projet a démarré en août 2026 sous le nom **Repetia**. Le 1er octobre 2026, il a été **migré vers ce dépôt et un nouveau projet Supabase** pour repartir sur une base propre (nouvelle configuration Supabase, authentification Google via Supabase Auth, images rapatriées). L'historique Git commence donc à cette date ; les **migrations SQL** (`supabase/migrations/`, datées depuis le 18/08/2026) conservent la trace de l'évolution du schéma depuis l'origine.

Les commits intitulés « Changes » ou « Work in progress » sont les commits automatiques de Lovable. Les jalons du projet :

| Module | Commit | Jalon |
|---|---|---|
| M0 | [`2ba076e`](https://github.com/robinmorthpro/the-prep-board/commit/2ba076e) | Initialisation du projet (template TanStack Start) |
| M2 | [`8843be2`](https://github.com/robinmorthpro/the-prep-board/commit/8843be2) | Connexion du nouveau projet Supabase |
| M2 | [`c8c0283`](https://github.com/robinmorthpro/the-prep-board/commit/c8c0283) | Authentification Google via Supabase Auth (relais OAuth pour l'aperçu) |
| M3 | [`af0e7a8`](https://github.com/robinmorthpro/the-prep-board/commit/af0e7a8) | Application du brand kit v1 |
| M3 | [`e91a5f0`](https://github.com/robinmorthpro/the-prep-board/commit/e91a5f0) | Validation et refonte visuelle des pages |
| M4 | [`055035c`](https://github.com/robinmorthpro/the-prep-board/commit/055035c) | Itérations sur le jury vocal (tours de parole, débit, relances) |

La suite (sécurisation, audit, documentation) est tracée par des commits nommés `M4 - …` et `M5 - …`.

---

## Contribuer avec Lovable

Ce dépôt est synchronisé avec Lovable : tout push sur `main` revient dans l'éditeur. **Ne jamais réécrire l'historique publié** (force push, rebase, amend ou squash de commits déjà poussés), sous peine de perdre l'historique côté Lovable. Voir `AGENTS.md`.
