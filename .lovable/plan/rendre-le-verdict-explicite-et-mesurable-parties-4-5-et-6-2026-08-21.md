# Rendre le verdict explicite et mesurable (parties 4, 5 et 6)

## D'où vient « À retravailler » aujourd'hui

Le verdict n'est pas calculé : c'est une ligne libre demandée à l'IA dans le prompt de relecture d'expérience, avec seulement deux valeurs possibles — « Prêt à soumettre » ou « À retravailler ». L'IA choisit elle-même, sans seuil ni score, à partir de la grille des 8 critères de la partie 4.

Autrement dit : aujourd'hui il n'y a que 2 verdicts, aucune mesure affichée, et rien qui explique au candidat pourquoi il tombe d'un côté ou de l'autre. C'est ça qu'on corrige.

## Ce que je propose : 3 niveaux de verdict

### Partie 4 — Expériences (grille à 8 critères)

**Critères essentiels** (un manque ici = verdict inférieur) :
1. **Anecdotes précises et concrètes** — un fait daté/situé/vécu, pas une généralité.
2. **Passé → Présent** — l'anecdote démontre réellement la qualité ou le défaut travaillé.
3. **Personnalisation** — discours à la première personne, rôle propre du candidat.
4. **Verbatim** — aucune formule qui se retourne contre le candidat (manque de temps, dénigrement, arrogance).

**Critères de forme** (peuvent être partiels sans bloquer la validation) :
5. **Contexte factuel** — quoi / où / quand / combien de temps, 30 secondes max.
6. **Récit court et lisible** — le jury situe l'expérience sans effort.
7. **Hiérarchisation** — la première anecdote est valorisante et importante.

**Critère spécifique « Présent → Futur » (traité à part, car il peut être perfectible sans être bloquant)** :
- **Validé** : le lien avec le futur est argumenté et illustré, et montre que le candidat connaît l'école, l'entreprise ou son projet pro (ex. association nommée, master ciblé, desk précis).
- **À perfectionner** : le candidat se projette mais sans exemple ni illustration concrète (ex. "dans les assos" sans nommer laquelle).
- **À retravailler** : il n'y a pas de lien avec le futur, ou le lien n'a pas de sens par rapport à l'expérience / au projet pro.

**Verdicts :**
- **Validé** : les 4 critères essentiels sont validés ET le critère « Présent → Futur » est validé. Au plus 1 critère de forme partiel. Les remarques restent des optimisations.
- **À perfectionner** : la structure tient, les 4 critères essentiels sont au moins partiels, mais 1 à 2 d'entre eux manquent encore de précision ; OU le « Présent → Futur » est à perfectionner. Le candidat peut avancer, il doit juste revenir affiner.
- **À retravailler** : au moins 1 critère essentiel est manquant ou franchement insuffisant ; OU le « Présent → Futur » est manquant ou sans sens. L'expérience n'est pas encore crédible à l'oral.

### Partie 5 — Sujets d'actualité (grille à 7 critères)

**Critères essentiels :**
1. Sujet délimité et réellement d'actualité.
2. Enjeux formulés (pas un résumé de presse).
3. Causes distinguées des conséquences.
4. Conséquences possibles prospectives et nuancées.
5. Appropriation personnelle sincère.
6. Lien explicite et crédible avec le candidat, son projet pro ou les écoles.

**Critère de forme :**
7. Sources identifiées.

**Verdicts :**
- **Validé** : les 6 critères essentiels sont validés, sources présentes.
- **À perfectionner** : les 6 essentiels sont partiels ou 1 à 2 d'entre eux manquent de précision ; le sujet tient mais doit être creusé.
- **À retravailler** : au moins 1 critère essentiel est manquant, ou le sujet n'est pas délimité / pas d'actualité / pas de lien personnel.

### Partie 6 — Questions clés (déjà notée sur 20)

On garde la note sur 20 mais on la traduit en 3 niveaux affichés :
- **Validé** : 16–20/20 — réponse excellente, prête à l'oral.
- **À perfectionner** : 12–15,5/20 — réponse correcte mais trop générique ou partielle sur 1–2 critères.
- **À retravailler** : < 12/20 — éléments essentiels manquants.

## Affichage

Dans la carte d'expérience de la partie 4 et dans la fiche sujet d'actualité, le feedback commence par :
- **une section « Grille »** listant chaque critère avec son statut (validé / partiel / manquant) et une justification courte citant les mots de l'étudiant ;
- **le verdict** avec son niveau (Validé / À perfectionner / À retravailler) et un badge visuel sémantique.

Le reste du feedback (Ce qui fonctionne / À rechallenger / Questions possibles du jury) reste identique.

## Détails techniques

- `src/lib/vivaldi-data.ts` : transformer `EXPERIENCE_GRID` en objets `{ label, essential }` pour que le prompt et l'UI partagent la même définition.
- `src/lib/ai.functions.ts` : dans `reviewExperience` et `reviewNewsTopic`, ajouter une section `## Grille` obligatoire avec un item par critère (format `Critère — statut — justification`), puis dériver le verdict selon les règles ci-dessus. Température déjà à 0, donc stable.
- `src/components/vivaldi/AiFeedback.tsx` : parser la section `## Grille` et afficher les statuts avec des badges de couleur ; le reste du markdown reste inchangé.
- `src/routes/_app.partie-6.tsx` : afficher le verdict 3 niveaux à partir de la note sur 20.
- Le cache de feedback (`feedback-cache.ts`) invalidera les anciens retours au prochain clic puisque le format change.

## Validation

- Typecheck.
- Test en preview :
  - une expérience incomplète → « À retravailler » avec le critère manquant nommé ;
  - une expérience complète mais perfectible → « À perfectionner » ;
  - une expérience solide → « Validé ».
