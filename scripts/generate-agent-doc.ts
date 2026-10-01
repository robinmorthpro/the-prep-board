/**
 * Génère `docs/agent-jury-elevenlabs.md` depuis la base de connaissance
 * (`src/lib/interview-kb.ts` + `src/lib/elevenlabs-agent-prompt.ts`).
 *
 * Usage : bun scripts/generate-agent-doc.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  AGENT_DYNAMIC_VARIABLES,
  buildAgentFirstMessage,
  buildAgentIdentity,
  AGENT_SETTINGS,
  AGENT_TEST_PROTOCOL,
  difficultyBlock,
} from "../src/lib/elevenlabs-agent-prompt";
import { buildInterviewTrame, INTERVIEW_QUESTION_BANK, INTERVIEW_VARIANTS } from "../src/lib/interview-kb";

const fence = (body: string) => "```text\n" + body.trim() + "\n```";

const doc = `# Agent jury vocal - configuration ElevenLabs (partie 7)

> Document généré depuis \`src/lib/interview-kb.ts\` par \`bun scripts/generate-agent-doc.ts\`.
> Ne pas éditer à la main : modifier la base de connaissance, puis régénérer.

Cet agent **conduit** l'entretien. Il n'évalue rien : le débrief, la grille interne et le
percentile sont produits par l'application après la clôture.

---

## 1. Réglages de l'agent

${fence(AGENT_SETTINGS)}

## 2. Prompt système - cadre du jury

À coller en tête du champ « System prompt » de l'agent.

${fence(buildAgentIdentity(25))}

## 3. Prompt système - trame de l'entretien

La durée de 25 minutes utilisée ci-dessous n'est qu'une durée d'illustration : en production, chaque école reçoit sa durée réelle.

À coller à la suite.

${fence(buildInterviewTrame(25))}

## 4. Prompt système - banque de questions

À coller à la suite.

${fence(INTERVIEW_QUESTION_BANK)}

## 5. Blocs de difficulté

L'application injecte automatiquement le bloc correspondant au niveau choisi par le candidat
(variable \`{{difficulty_block}}\`). Les trois blocs sont reproduits ici pour pouvoir tester
l'agent à la main depuis l'interface ElevenLabs.

${INTERVIEW_VARIANTS.map((v) => `### ${v.label}\n\n${fence(difficultyBlock(v.code))}`).join("\n\n")}

## 6. Variables dynamiques et premier message

À coller en fin de prompt système. Les valeurs sont fournies par l'application au démarrage
de chaque session.

${fence(AGENT_DYNAMIC_VARIABLES)}

Premier message de l'agent :

${fence(buildAgentFirstMessage(25))}

Exemple de valeurs envoyées :

${fence(`school = "EDHEC Business School"
student_name = "Camille Durand"
prepa = "ECG 2 - Lycée Saint-Just"
career_project = "Métier / domaine : les métiers du conseil en stratégie\\nSecteur : conseil\\n…"
school_sheet = "Baseline : …\\nMaster : Finance - pourquoi : …\\nAssociation : …"
experiences = "- Trésorier du BDE (associatif, 09/2024 → 06/2025)\\nContexte : …\\nRécit : …"
difficulty_block = "<bloc de la section 5 correspondant au niveau choisi>"`)}

## 7. Ce que l'agent ne fait pas

${fence(`- Aucune note, aucun percentile, aucune grille, aucun conseil pendant l'entretien.
- Aucun signal de résultat, même à la demande explicite du candidat.
- Aucun débrief : le fil complet de l'entretien est renvoyé à l'application, qui produit
  l'évaluation avec la grille interne (critères de la grille, malus, conversion en percentile).
- Aucune lecture à voix haute du dossier du candidat.`)}

## 8. Protocole de test

${fence(AGENT_TEST_PROTOCOL)}
`;

const out = resolve(import.meta.dirname, "../docs/agent-jury-elevenlabs.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, doc, "utf8");
console.log(`écrit : ${out} (${doc.length} caractères)`);
