# Format de sortie de l'évaluateur

Tu rends un seul objet JSON valide, sans texte autour.

## Forme

```json
{
  "grille": "classique",
  "entretien_interrompu": false,
  "criteres": {
    "experiences": {
      "recit": {"niveau": "N3", "justification": "…", "manque_pour_n4": ["…"], "citations": ["…", "…"]},
      "recul": {"niveau": "N2", "justification": "…", "manque_pour_n4": ["…", "…"], "citations": ["…"]},
      "projection": {"niveau": "N2", "justification": "…", "manque_pour_n4": ["…"], "citations": ["…"]}
    }
  },
  "penalites": [{"partie": "…", "duree_mesuree": "…", "seuil": "…"}],
  "remarques": "…"
}
```

- `grille` : la clé de la grille de l'école (tableau ci-dessous).
- `criteres` : tous les critères de la grille, et pour chacun toutes ses cases, avec les clés exactes ci-dessous. Aucune autre clé.
- `niveau` : « N4 », « N3 », « N2 » ou « N1 ».
- `justification` : 1 à 2 phrases. Quels éléments du niveau sont remplis, et pourquoi pas le niveau au-dessus.
- `manque_pour_n4` : si le niveau est sous N4, le ou les morceaux du texte du N4 de la case qui ne sont pas remplis, copiés mot pour mot. Pour un N4 ou un « non observé » : `[]`.
- `citations` : 1 à 3 citations EXACTES de la transcription, copiées mot pour mot, sans horodatage, 8 à 30 mots chacune. Elles sont vérifiées par le code : n'invente rien, ne corrige pas les fautes de transcription. Une case à N1 parce que le thème n'a jamais été abordé n'a pas de citation possible : `[]`, et la justification le dit.
- `penalites` : une ligne par partie imposée dont la durée mesurée est sous le seuil du fichier de l'école (ou au-dessus, pour la présentation longue de l'ESSEC). Sinon `[]`.
- `remarques` : un format réel différent de la grille, une durée mesurée sans pénalité, tout ce qui a gêné la notation. Sinon `""`.
- `entretien_interrompu` : `true` si l'entretien s'est arrêté avant la fin.

## « Non observé »

Quand l'entretien n'a offert aucune occasion de juger une case : `{"niveau": "non observé", "justification": "…", "manque_pour_n4": [], "citations": []}`. La justification dit en une phrase pourquoi aucune occasion n'a eu lieu. Le code sort la case du total et ramène la note sur 20 ; si aucune case d'un critère n'a pu être évaluée, le critère n'est pas noté. Exemples : aucune question d'actualité, aucun moment de culture générale, aucune contestation, aucun imprévu, mise en situation ESSEC qui n'a pas eu lieu, cases non abordées d'un entretien interrompu.

Un thème jamais abordé dans un entretien complet n'est pas « non observé » : voir la règle « Thème jamais abordé » du texte commun (École et Projet professionnel à N1 ; Expériences et personnalité selon les niveaux du critère).

## Clés des critères et des cases

| Critère | Clé | Cases (clés) |
|---|---|---|
| Présentation | `presentation` | `presentation` |
| Présentation longue (ESSEC) | `presentation_longue_essec` | `presentation` |
| Présentation sur un mot (EDHEC) | `presentation_mot_edhec` | `presentation` |
| Autoportrait (KEDGE) | `autoportrait_kedge` | `presentation` |
| Présentation par l'image (INSEEC) | `presentation_image_inseec` | `presentation` |
| Pitch sur une réussite personnelle (EM Strasbourg) | `pitch_em_strasbourg` | `pitch` |
| Expériences et personnalité | `experiences` | `recit`, `recul`, `projection` |
| Expériences et personnalité (Montpellier, sans projection) | `experiences_montpellier` | `recit`, `recul` |
| Projet professionnel | `projet` | `connaissance`, `lien_ecole`, `lien_soi` |
| École | `ecole` | `case1` (pourquoi une école de commerce), `case2` (pourquoi cette école), `case3` (ce qu'il apportera), `case4` (connaissance générale) |
| Ouverture sur le monde | `ouverture` | `actualite`, `culture_generale` |
| Mise en situation (ESSEC) | `mise_en_situation_essec` | `solution` |
| ODD (KEDGE) | `odd_kedge` | `odd` |
| Exposé (GEM) | `expose_gem` | `expose` |
| Interview inversée (GEM) | `interview_inversee_gem` | `questions`, `synthese` |
| Article de presse (TBS) | `article_tbs` | `article` |
| Question Impact (Clermont) | `question_impact_clermont` | `impact` |
| Gestion des situations déstabilisantes | `destabilisantes` | `contestation`, `imprevu` |
| Conduite de l'échange | `conduite` | `repondre`, `piloter` |
| Clarté | `clarte` | `structure`, `langage` |

## Grilles

| Grille (clé) | Critères, dans l'ordre |
|---|---|
| `classique` | presentation · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `emlyon` | presentation · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `essec` | presentation_longue_essec · experiences · projet · ecole · ouverture · mise_en_situation_essec · destabilisantes · conduite · clarte |
| `edhec` | presentation_mot_edhec · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `gem` | expose_gem · interview_inversee_gem · presentation · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `tbs` | article_tbs · presentation · experiences · projet · ecole · destabilisantes · conduite · clarte |
| `kedge` | autoportrait_kedge · experiences · projet · ecole · ouverture · odd_kedge · destabilisantes · conduite · clarte |
| `clermont` | presentation · experiences · projet · ecole · question_impact_clermont · destabilisantes · conduite · clarte |
| `inseec` | presentation_image_inseec · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `em_strasbourg` | pitch_em_strasbourg · experiences · projet · ecole · ouverture · destabilisantes · conduite · clarte |
| `montpellier` | presentation · experiences_montpellier · ouverture · destabilisantes · conduite · clarte |
