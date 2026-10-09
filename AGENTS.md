<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Official logos are served from public/brand/logo-fond-{clair,sombre}.svg via Wordmark; never recompose the logo in code (brand kit forbids it).
<!-- Reconstruction de l'aperçu pour relire les secrets (08/10/2026). -->
- Load linked interview evaluations with session history because dashboard scores must use structured, canonical evaluation data rather than parsed feedback text.
- Count completed simulations through one shared validity predicate so dashboard metrics and priorities cannot diverge.

- L'évaluateur IA (src/lib/evaluateur/) ne rend que des niveaux par case ; points, note, pénalités de durée et percentile sont calculés par le code à partir de bareme.json : la note reste reproductible et vérifiable.
- Les textes de l'évaluateur et bareme.json sont copiés octet pour octet depuis les originaux et ne sont jamais reformatés (exclus de Prettier).

- Le feedback de fin d'entretien suit `src/lib/feedback-enchainement.ts` : évaluation (src/lib/evaluateur/) puis rédacteur (src/lib/redacteur/), avec secours vers debriefInterview ; l'interrupteur NOUVEAU_FEEDBACK_ACTIF y revient en une ligne. Pourquoi : l'utilisateur doit toujours recevoir un feedback.
- Le rédacteur ne note jamais : la ligne du percentile est insérée par le code et les citations VERBATIMS non retrouvées sont retirées par le code. Pourquoi : le percentile affiché doit être exactement celui calculé.
- Les textes du rédacteur (src/lib/redacteur/textes/) sont copiés octet pour octet et exclus de Prettier. Pourquoi : vérification par empreinte avec les originaux.
