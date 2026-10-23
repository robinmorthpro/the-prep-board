# Journal du projet — The Prepboard

Carnet de bord des étapes clés, par module de la formation (M0 à M5).
Les commits « Changes » / « Work in progress » sont les commits automatiques de Lovable ;
chaque jalon ci-dessous renvoie vers le travail correspondant.

## Août – septembre 2026 : premier projet Lovable (avant migration)

Trace conservée par les migrations SQL datées (`supabase/migrations/`).

- 18/08/2026 : M2 - Schéma initial : profils, expériences, projet professionnel, fiches école, avec RLS ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260818125346_0d4e6420-ef4f-4eb6-affd-e0799d8270cf.sql))
- 19/08/2026 : M2 - Réponses aux questions et sessions d'entretien ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260819154251_b1a71642-1ab3-47e6-9056-5c2c78db5462.sql))
- 20/08/2026 : M2 - Sujets d'actualité ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260820112158_11e39cbd-35cd-471b-a7ef-9b67fde96aea.sql))
- 21/08/2026 : M2 - Historique des tentatives par question ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260821141811_23b6296a-6dc0-46a5-84f4-35500425a3f7.sql))
- 25/08/2026 : M2 - Création automatique du profil à l'inscription ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260825115804_169be639-023b-477d-a20b-2f6b548f7d2d.sql))
- 28/08/2026 : M2 - Supports d'entretien ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260828143544_698b16f8-3b26-4a17-af12-01e660fd193e.sql))
- 04/09/2026 : M2 - Stockage des fichiers limité à chaque utilisateur ([migration](https://github.com/robinmorthpro/the-prep-board/blob/main/supabase/migrations/20260904081433_85a5762e-0715-4fa0-85b3-3214a440b4cb.sql))

## Octobre 2026 : migration vers ce dépôt

- 01/10/2026 : M0 - Initialisation du projet ([2ba076e](https://github.com/robinmorthpro/the-prep-board/commit/2ba076e))
- 01/10/2026 : M2 - Connexion du nouveau projet Supabase ([8843be2](https://github.com/robinmorthpro/the-prep-board/commit/8843be2))
- 01/10/2026 : M2 - Authentification Google via Supabase Auth ([c8c0283](https://github.com/robinmorthpro/the-prep-board/commit/c8c0283))
- 02/10/2026 : M3 - Brand kit v1 appliqué ([af0e7a8](https://github.com/robinmorthpro/the-prep-board/commit/af0e7a8))
- 02/10/2026 : M3 - Refonte visuelle des pages ([e91a5f0](https://github.com/robinmorthpro/the-prep-board/commit/e91a5f0))
- 09/10/2026 : M4 - Évaluateur IA : rôles admin et table des évaluations ([ac1da9a](https://github.com/robinmorthpro/the-prep-board/commit/ac1da9a))
- 09/10/2026 : M4 - Itérations sur le jury vocal ([055035c](https://github.com/robinmorthpro/the-prep-board/commit/055035c))
- 09/10/2026 : M5 - README complet ([51ef313](https://github.com/robinmorthpro/the-prep-board/commit/51ef313))
- 09/10/2026 : M5 - Journal du projet : jalons M0 à M4
- 10/10/2026 : M4 - Corrections du jury après le tour 1 de tests ([6069d00](https://github.com/robinmorthpro/the-prep-board/commit/6069d00), [1cc6b41](https://github.com/robinmorthpro/the-prep-board/commit/1cc6b41))
- 17/10/2026 : M4 - Correctifs et banc du tour 2 du jury ([aeeb83a](https://github.com/robinmorthpro/the-prep-board/commit/aeeb83a))
- 17/10/2026 : M5 - Page Pilotage admin en temps réel ([ff4e5a5](https://github.com/robinmorthpro/the-prep-board/commit/ff4e5a5))
- 18/10/2026 : M5 - Pilotage aligné sur les objectifs du tableau de bord ([2756d3c](https://github.com/robinmorthpro/the-prep-board/commit/2756d3c))

## Mise en production et audits

- 18/10/2026 : IA appelée en direct (Gemini et Claude), déploiement Vercel sur www.theprepboard.fr ([f82d8ee](https://github.com/robinmorthpro/the-prep-board/commit/f82d8ee))
- 22/10/2026 : Message « Vérifiez votre boîte mail » après l'inscription ([5e20ff9](https://github.com/robinmorthpro/the-prep-board/commit/5e20ff9))
- 22/10/2026 : QA avec Playwright, corrections et rapport ([90e4b8e](https://github.com/robinmorthpro/the-prep-board/commit/90e4b8e), [6ae6c61](https://github.com/robinmorthpro/the-prep-board/commit/6ae6c61))
- 22/10/2026 : Audit de sécurité, correctifs et rapport ([189f511](https://github.com/robinmorthpro/the-prep-board/commit/189f511), [b4eb1b3](https://github.com/robinmorthpro/the-prep-board/commit/b4eb1b3))
- 22/10/2026 : Audit d'accessibilité WCAG AA, corrections et rapport ([eff1e3f](https://github.com/robinmorthpro/the-prep-board/commit/eff1e3f))
- 23/10/2026 : README à jour, avec l'historique par étape
