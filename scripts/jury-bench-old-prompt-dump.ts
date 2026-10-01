/**
 * DUMP DES PROMPTS « ANCIENNE VERSION »
 *
 * Ce script est exécuté DANS UN WORKTREE GIT temporaire positionné sur un
 * ancien commit : il y appelle le `buildJuryAgentPrompt` de l'époque, avec
 * exactement les mêmes arguments que ceux de la version courante (niveau de
 * difficulté, durée simulée, conduite de l'école). Aucun prompt n'est donc
 * reconstruit par remplacement de texte : c'est bien le code d'origine qui parle.
 *
 * Usage : bun scripts/jury-bench-old-prompt-dump.ts <specs.json> <sortie.json>
 * specs.json : [{ school, variant, durationMinutes, conductNote }]
 */
import { buildJuryAgentPrompt } from "../src/lib/elevenlabs-agent-prompt";

type Spec = {
  school: string;
  variant: string;
  durationMinutes: number;
  conductNote: string;
};

const [specPath, outPath] = process.argv.slice(2);
if (!specPath || !outPath) {
  console.error("Usage : bun scripts/jury-bench-old-prompt-dump.ts <specs.json> <sortie.json>");
  process.exit(1);
}

const specs = (await Bun.file(specPath).json()) as Spec[];
const out: Record<string, string> = {};
for (const spec of specs) {
  out[spec.school] = buildJuryAgentPrompt(
    spec.variant as never,
    spec.durationMinutes,
    spec.conductNote || undefined,
  );
}
await Bun.write(outPath, JSON.stringify(out, null, 2));
console.log(`${specs.length} prompt(s) « ancienne version » écrits dans ${outPath}.`);
