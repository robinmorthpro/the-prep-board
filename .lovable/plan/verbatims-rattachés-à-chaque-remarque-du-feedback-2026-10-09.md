# Verbatims rattachés à chaque remarque du feedback

## Résultat attendu
Le nouveau feedback détaillé affichera chaque citation directement sous la remarque qu’elle justifie. Les anciens feedbacks déjà enregistrés conserveront exactement leur présentation actuelle, avec leur bloc global « Verbatims qui illustrent » en fin de critère.

## 1. Remplacer uniquement le texte commun du rédacteur
- Copier `redacteur-commun-3.md` vers `src/lib/redacteur/textes/redacteur-commun.md` avec `cp`, sans transformation ni reformulation.
- Contrôler avant et après copie l’empreinte SHA-256 attendue : `dc65a76ee5992166c5bbc0b609272ed6dad8a239ec586540f391c6f9edfb6417`.
- Ajouter un test d’empreinte qui lit ce fichier et vérifie cette valeur exacte, afin qu’un reformatage ultérieur soit détecté.
- Ne modifier aucun des 12 autres textes du rédacteur.

## 2. Filtrer toutes les lignes de verbatims
Dans `src/lib/redacteur/texte.ts` :
- conserver le contrôle ligne par ligne actuel, qui traite déjà indépendamment chaque ligne `VERBATIMS:` et fonctionne donc avec plusieurs lignes dans un même critère ;
- continuer à retirer seulement les citations absentes de la transcription et du document remis ;
- si aucune citation valide ne subsiste sur une ligne, retirer cette ligne entière au lieu de laisser `VERBATIMS:` vide ;
- préserver l’ordre des puces, des lignes et des citations restantes.

## 3. Faire coexister les deux formats à l’affichage
Dans `src/components/vivaldi/InterviewDebrief.tsx` :
- faire évoluer `parseReview` pour reconnaître le format de chaque critère :
  - **nouveau format** : une puce, suivie éventuellement de sa ligne `VERBATIMS:` ;
  - **ancien format** : une ligne `VERBATIMS:` globale, puis `FEEDBACK:` et les puces ;
  - **texte libre** : notamment « Pas mesuré dans cet entretien. » ;
- pour le nouveau format, produire une liste structurée de remarques, chacune avec ses propres citations ; une puce sans ligne `VERBATIMS:` reste valide ;
- afficher chaque remarque avec le style de puce actuel, puis ses citations juste dessous, légèrement en retrait, dans les blocs à bordure bleue existants ; ne pas répéter de titre au-dessus de ces citations ;
- pour l’ancien format, conserver le rendu actuel sans changement : feedback d’abord, puis titre « Verbatims qui illustrent » et citations globales en fin de critère ;
- conserver tel quel le rendu du texte libre, les sections repliables, leur ordre, le bandeau et le transcript.

## 4. Adapter le texte de l’export PDF
Dans `src/lib/transcript-pdf.ts`, limiter la transformation `plain` à deux ajouts avant le nettoyage Markdown existant :
- remplacer chaque préfixe `VERBATIMS:` par `Verbatims :` ;
- supprimer chaque préfixe `FEEDBACK:` de l’ancien format, sans supprimer le contenu qui suit.

## 5. Tests et vérifications
Ajouter des tests unitaires ciblés couvrant :
- nouveau format avec plusieurs puces et citations correctement rattachées ;
- nouveau format avec une puce sans citation ;
- plusieurs lignes `VERBATIMS:` dans un même critère ;
- ancien format reconnu et rendu selon sa structure actuelle ;
- texte libre « Pas mesuré dans cet entretien. » conservé ;
- ligne `VERBATIMS:` entièrement invalidée puis supprimée ;
- ligne contenant plusieurs citations dont seules les citations valides restent ;
- export PDF : `Verbatims :` remplace `VERBATIMS:` et `FEEDBACK:` disparaît ;
- empreinte exacte du nouveau `redacteur-commun.md`.

Puis lancer toute la suite de tests et vérifier la construction de l’aperçu. Une vérification visuelle ciblée confirmera le nouveau rendu et la compatibilité d’un ancien feedback.

## Fichiers concernés
- `src/lib/redacteur/textes/redacteur-commun.md` — remplacement octet pour octet.
- `src/lib/redacteur/texte.ts` — suppression des lignes de citations devenues vides.
- `src/components/vivaldi/InterviewDebrief.tsx` — analyse et rendu compatibles avec les deux formats.
- `src/lib/transcript-pdf.ts` — libellés du PDF.
- Tests ciblés existants ou nouveaux, uniquement pour les comportements ci-dessus.

## Hors périmètre
Aucun changement de l’évaluateur, du barème, du jury, des 12 autres textes du rédacteur, de l’enchaînement de fin d’entretien, de la base, du bandeau, des sections repliables, de leur ordre ou du transcript.

## Risque principal traité
Une simple détection de la présence de `FEEDBACK:` suffit à distinguer les sessions historiques du nouveau format. Les anciens textes restent donc interprétés par leur branche actuelle, tandis que les nouveaux conservent l’association immédiate entre chaque remarque et ses citations.
