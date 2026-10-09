# Étape 1 : nouvel évaluateur et calcul de la note, en coulisses

Rien ne change pour l'étudiant : l'ancien debrief (`debriefInterview`), son affichage, le jury vocal, ElevenLabs et le tableau de bord restent intacts. Aucune donnée supprimée.

## 1. Textes (copie octet pour octet)
- `src/lib/evaluateur/textes/commun.md`, `format-sortie.md`
- `src/lib/evaluateur/textes/ecoles/` : `classique.md`, `clermont.md`, `edhec.md`, `em-strasbourg.md`, `emlyon.md`, `essec.md`, `gem.md`, puis `inseec.md`, `kedge.md`, `montpellier.md`, `tbs.md` (joints au message de validation)
- `src/lib/evaluateur/bareme.json`
- Copie par `cp` depuis les fichiers joints (aucune réécriture), contrôle par empreinte `sha256` avant/après, résultat donné dans le compte rendu. Chargement par import `?raw` (textes) et import JSON (barème).
- Ajout d'un `.prettierignore` pour `src/lib/evaluateur/textes/**` et `bareme.json`, afin qu'aucun formatage automatique ne les touche.

## 2. Fonction serveur `evaluateInterview` (authentifiée, comme `debriefInterview`)
- Entrée : `sessionId`, `model` optionnel. Lit la session via le client de l'utilisateur (sécurité de base : il ne lit que les siennes).
- Grille : `bareme.ecoles[session.school]` ; fichier `ecoles/<clé>.md` (`em_strasbourg` → `em-strasbourg.md`). École inconnue → évaluation enregistrée « invalide » avec la raison.
- Système = `commun.md` + fichier école + `format-sortie.md`, concaténés tels quels (séparés par un simple saut de ligne — voir question 1).
- Utilisateur = école, transcription `mm:ss Jury : …` / `mm:ss Candidat : …` (calculée depuis `askedAt`/`answeredAt` et le premier horodatage), puis `support_text`, l'image INSEEC (`inseec_image`), et les tirages s'ils sont enregistrés.
- Passerelle Lovable AI, température 0, JSON imposé.
  - Gemini (`google/gemini-3.7-flash`, défaut) : `/v1/chat/completions` comme le code actuel.
  - Claude Sonnet 5 : identifiant exact **`anthropic/claude-sonnet-5`**, servi uniquement par `/v1/messages` (format Anthropic, réponse lue en flux puis assemblée côté serveur). Un petit aiguillage par préfixe de modèle choisit le bon chemin.

## 3. Vérifications (code pur, `src/lib/evaluateur/validation.ts`)
- JSON valide ; `grille` = clé attendue ; critères et cases exactement ceux de `bareme.json` (ni manquant, ni en trop).
- `niveau` ∈ N4, N3, N2, N1, « non observé ».
- Citations présentes mot pour mot dans la transcription (texte des répliques, sans horodatages) après normalisation : espaces, apostrophes ’/', guillemets « » “ ” " → une forme unique. Rien d'autre.
- `manque_pour_n4` : chaque morceau présent dans les textes de l'évaluateur (même normalisation) ; vide pour N4 et « non observé ».
- Échec → un seul nouvel appel avec la liste précise des erreurs ; second échec → statut « invalide », sans note.

## 4. Calcul (fonction pure `src/lib/evaluateur/calcul.ts`)
Suit `ordre_de_calcul` et `regles` à la lettre : interrompu → ni note ni percentile ; « non observé » hors total et hors diviseur ; critère sans case évaluée non noté ; plancher 0 par critère ; note sur 20 sans arrondi intermédiaire ; −0,5 par pénalité de durée, plancher 0 ; percentile par ligne inférieure, borné P1–P99.
- Interrompu = `entretien_interrompu` vrai, ou session non terminée (`status` ≠ terminé), ou panne technique enregistrée.
- Pénalités mesurées par le code à partir de `phase_timings` et des horodatages, seuils lus dans `regles.penalites_duree.seuils_par_grille` (ESSEC 2 min 30 et au-delà de 5 min 30, EDHEC 3 min 15, etc.) ; exceptions du barème appliquées quand le code peut les détecter. Le champ `penalites` de l'IA est conservé pour contrôle, jamais utilisé.
- Tests (`calcul.test.ts`) : classique tout N4 = 20/20 ; case non observée hors diviseur ; critère entièrement non observé non noté ; Montpellier (10,5 ramené sur 20) ; pitch EM Strasbourg N1 = 0,5 ; pénalité et plancher à 0 ; lecture du percentile ; interrompu sans note. Plus un test de validation (citation inventée rejetée, clé en trop rejetée).

## 5. Enregistrement
Table `interview_evaluations` (voir migration). Plusieurs évaluations par session.

## 6. Déclenchement en arrière-plan
Dans `_app.partie-8.tsx`, à l'endroit où le debrief est demandé, un seul ajout : appel de `evaluateInterview` sans attente, erreurs avalées (`.catch(() => {})`), rien d'affiché. C'est la seule modification d'un fichier existant de l'app. Côté serveur, l'appel est indépendant du debrief.

## 7. Outil administrateur
Fonction `rerunEvaluation({ sessionId, model, n })` (n ≤ 10, appels successifs pour ménager la limite de débit) qui renvoie les évaluations créées. Accès vérifié par `has_role(auth.uid(), 'admin')` ; aucun e-mail dans le code. Lecture/écriture de sessions d'autres utilisateurs par le client administrateur, chargé seulement après la vérification du rôle. Le propriétaire s'attribue le rôle en insérant une ligne dans `user_roles` depuis Supabase (instruction donnée, sans e-mail dans le dépôt).

## Fichiers
Créés : `src/lib/evaluateur/` (textes, `bareme.json`, `transcription.ts`, `validation.ts`, `calcul.ts`, `calcul.test.ts`, `validation.test.ts`, `gateway.ts`), `src/lib/evaluateur.functions.ts`, migration.
Modifiés : `src/routes/_app.partie-8.tsx` (une ligne d'appel en arrière-plan), `src/integrations/supabase/types.ts` (régénéré), `.prettierignore`, `AGENTS.md` (règle : la note est calculée par le code, l'IA ne rend que des niveaux).

## Migration proposée
```sql
create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create table public.interview_evaluations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  model text not null,
  grille text not null default '',
  status text not null check (status in ('ok','invalide')),
  attempts int not null default 1,
  errors jsonb not null default '[]',
  raw_output jsonb,               -- sortie brute (texte conservé si JSON illisible)
  raw_text text not null default '',
  case_points jsonb not null default '{}',
  criterion_points jsonb not null default '{}',
  unrated_criteria jsonb not null default '[]',
  penalties jsonb not null default '[]',   -- partie, durée mesurée, seuil
  interrupted boolean not null default false,
  score_20 numeric,
  final_score numeric,
  percentile int,
  duration_ms int not null default 0,
  triggered_by text not null default 'auto'  -- 'auto' ou 'admin'
);
create index on public.interview_evaluations (session_id);
grant select, insert on public.interview_evaluations to authenticated;
grant all on public.interview_evaluations to service_role;
alter table public.interview_evaluations enable row level security;
create policy "read own evaluations" on public.interview_evaluations for select to authenticated using (auth.uid() = user_id);
create policy "insert own evaluations" on public.interview_evaluations for insert to authenticated with check (auth.uid() = user_id);
```
Aucune modification ni suppression sur les tables existantes.

## Questions et risques
1. Séparateur entre les trois textes du message système : un saut de ligne vide suffit-il (« sans rien ajouter » pris au sens strict) ?
2. Tirages au sort : aujourd'hui seuls `support_text` et `inseec_image` sont enregistrés. Les cartes emlyon, le mot EDHEC, l'article TBS et la situation ESSEC ne le sont pas. À cette étape, je les omets (« si disponible »). Les enregistrer demanderait une nouvelle colonne et un ajout dans l'écran d'entretien : à prévoir dans une étape suivante ?
3. Noms d'école : la clé est cherchée avec le nom exact de `session.school` ; si l'app enregistre un nom différent de ceux du barème (ex. « GEM » vs « GEM (Grenoble EM) »), je vérifierai sur les vraies données et ajouterai une table de correspondance plutôt que de toucher au barème.
4. Durées : certaines exceptions (« jury qui a dysfonctionné », « candidat interrompu » à l'ESSEC) ne sont pas toujours détectables par le code ; je les applique seulement quand l'information existe, sinon la durée est notée sans pénalité dans un champ de contrôle. À confirmer.
5. Coût : chaque entretien déclenche désormais un second appel IA (et jusqu'à deux en cas de reprise) ; l'outil admin multiplie par N. Débité sur les crédits de l'espace.
6. Claude Sonnet 5 : température 0 acceptée ; JSON imposé via le format de sortie Anthropic (`output_config.format`). Le modèle conserve des données chez le fournisseur ; il est actuellement autorisé dans l'espace.
7. Vérification en direct : sans compte de test, je testerai l'appel IA et le calcul sur une transcription fictive depuis mon environnement, pas l'écran connecté.
