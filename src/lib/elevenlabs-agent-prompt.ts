/**
 * Prompt du jury vocal temps réel (agent ElevenLabs) du module 7.
 *
 * Source unique de vérité : `src/lib/interview-kb.ts`. Ce module sert à la fois
 * - à l'application (overrides envoyés à l'agent au démarrage d'une session),
 * - et à la documentation copiable-collable (`docs/agent-jury-elevenlabs.md`,
 *   régénérée par `bun scripts/generate-agent-doc.ts`).
 *
 * L'agent conduit l'entretien. Il n'évalue jamais : l'évaluateur et le rédacteur
 * produisent la note, le percentile et le feedback après la clôture.
 */
import juryCommunRaw from "./jury/textes/jury-commun.md?raw";
import type { InterviewVariant } from "./interview-kb";

/** Réglages recommandés côté ElevenLabs (voix, latence, fin de parole). */
export const AGENT_SETTINGS = `LANGUE : français (fr). Vouvoiement systématique.
VOIX : la voix choisie et configurée directement dans le dashboard ElevenLabs - actuellement « Julia ». L'application n'impose plus de voix en override ; elle se contente de forcer la langue française.
RÉGLAGES DE VOIX : stability 0,45 · similarity_boost 0,75 · speed 1,0.
MODÈLE VOCAL : eleven_flash_v2_5 (latence basse, qualité élevée, multilingue).
MODÈLE DE LANGAGE DE L'AGENT : claude-sonnet-5, seul modèle testé qui tient les phases.
FIN DE PAROLE : détection automatique (modèle de tour de parole turn_v3), empressement « patient » (turn_eagerness = patient) - le jury attend plus longtemps avant de prendre la parole et ne coupe pas le candidat pendant ses pauses.
INTERRUPTIONS : le candidat peut couper le jury ; le jury ne coupe JAMAIS le candidat et attend toujours la fin de sa réponse pour parler.
DURÉE MAX DE SESSION : la durée réelle de l'entretien (15 à 35 minutes selon l'école pour les entretiens classiques) plus une marge de 10 minutes.
OVERRIDES À AUTORISER dans la configuration de l'agent : prompt, first message, language. Sans cela l'application ne peut pas injecter la difficulté ni le document remis par le candidat. La voix n'est plus imposée par l'application.
PREMIER MESSAGE : il est toujours fourni par l'application selon l'école ; l'agent ne doit jamais utiliser d'ouverture stockée générique.`;

export const REGIE_SECTION = "\n---\n\nMESSAGE ENVOYÉ PAR L'APPLICATION À LA MOITIÉ DE L'ÉCHANGE LIBRE (consigne de régie)\n";

/** Texte commun officiel, sans la section finale envoyée séparément par la régie. */
export function commonJuryText() {
  const [prompt] = juryCommunRaw.split(REGIE_SECTION);
  if (!prompt) throw new Error("Le texte commun du jury est vide.");
  return prompt;
}

/** Cadre commun exact, avec uniquement les variables de durée et de niveau résolues. */
export function buildAgentIdentity(durationMinutes: number) {
  return commonJuryText().replaceAll("${durationMinutes}", String(durationMinutes));
}

/**
 * Variables dynamiques attendues par l'agent (identité + document remis) :
 * section « CADRE DE L'ENTRETIEN » de jury-commun.md, telle quelle (elle porte
 * le bloc « CONNAISSANCE DU CANDIDAT », envoyé une seule fois).
 */
export const AGENT_DYNAMIC_VARIABLES = (() => {
  const source = commonJuryText();
  const start = source.indexOf("CADRE DE L'ENTRETIEN\n");
  if (start < 0) throw new Error("Section « CADRE DE L'ENTRETIEN » introuvable dans le texte commun.");
  const end = source.indexOf("\n\n---", start);
  return source.slice(start, end >= 0 ? end : undefined).trimEnd();
})();

/** Bloc de difficulté (attitude, périmètre, profondeur, rythme) pour un niveau. */
export function difficultyBlock(variant: InterviewVariant) {
  const heading = variant === "classique_dur" ? "NIVEAU JOUÉ : Jury dur" : "NIVEAU JOUÉ : Jury neutre";
  const source = commonJuryText();
  const start = source.indexOf(heading);
  if (start < 0) throw new Error(`Niveau introuvable dans le texte commun : ${heading}`);
  const next = source.indexOf("\nNIVEAU JOUÉ : ", start + heading.length);
  const end = next >= 0 ? next : source.indexOf("\n\n\n---\n\nCADRE DE L'ENTRETIEN", start);
  return source.slice(start, end >= 0 ? end : undefined).trimEnd();
}

/** Bloc de conduite propre à l'école (ouverture imposée, poids du support déposé). */
export function conductBlock(conductNote: string) {
  return `CONDUITE PROPRE À L'ÉCOLE (elle prime sur la trame générique)
${conductNote}`;
}

/**
 * Prompt système complet, prêt à être envoyé en override à l'agent.
 * `conductNote` : conduite officielle propre à l'école, lue avant l'ouverture.
 */
export function buildJuryAgentPrompt(
  variant: InterviewVariant,
  durationMinutes: number,
  conductNote?: string,
  school?: string,
) {
  const common = adaptCommonForSchool(buildAgentIdentity(durationMinutes), school);
  const neutralStart = common.indexOf("NIVEAU JOUÉ : Jury neutre");
  const hardStart = common.indexOf("NIVEAU JOUÉ : Jury dur");
  const frameStart = common.indexOf("CADRE DE L'ENTRETIEN", hardStart);
  if (neutralStart < 0 || frameStart < 0) throw new Error("Sections du texte commun introuvables.");
  const fixed = common.slice(0, neutralStart).trimEnd();
  return [fixed, difficultyBlock(variant), ...(conductNote ? [conductBlock(conductNote)] : []), AGENT_DYNAMIC_VARIABLES].join(
    "\n\n---\n\n",
  );
}

/** Remplacement exigé : le passage doit exister une seule fois dans le texte commun. */
function swap(text: string, from: string, to: string): string {
  const at = text.indexOf(from);
  if (at < 0 || text.indexOf(from, at + from.length) >= 0) {
    throw new Error(`Passage du texte commun introuvable ou ambigu : ${from.slice(0, 60)}`);
  }
  return text.slice(0, at) + to + text.slice(at + from.length);
}

/** Bloc complet d'une ligne de thème (« N. Titre : … ») jusqu'au thème suivant exclu. */
function themeBlock(text: string, start: string, nextStart: string): string {
  const from = text.indexOf(`\n${start}`);
  const to = text.indexOf(`\n${nextStart}`, from + 1);
  if (from < 0 || to < 0) throw new Error(`Thème introuvable dans le texte commun : ${start}`);
  return text.slice(from + 1, to + 1);
}

const OUVERTURE_COUVERTE: Record<string, string> = {
  "GEM (Grenoble EM)": "l'exposé",
  "TBS Education": "l'article",
  "ESC Clermont BS": "la question Impact",
};

/**
 * Texte commun adapté à l'école : le fichier reste unique, l'application retire
 * ou remplace seulement les passages qui contredisent le format de l'école.
 */
export function adaptCommonForSchool(common: string, school?: string): string {
  if (!school) return common;
  let text = common;
  const couverte = OUVERTURE_COUVERTE[school];
  if (couverte) {
    text = swap(
      text,
      themeBlock(text, "5. Ouverture sur le monde : ", "Les questions citées sont des exemples"),
      `5. Ouverture sur le monde : déjà couverte par ${couverte}. Pas de question d'actualité en plus.\n`,
    );
  }
  if (school === "Montpellier BS") {
    text = swap(
      text,
      "Ton rôle est d'obtenir, sur chacun de ces cinq thèmes, une réponse assez développée pour qu'on puisse en juger la qualité. Les cinq sont obligatoires : tous doivent avoir été abordés avant la fin de l'entretien.",
      "Ton rôle est d'obtenir, sur les expériences, la personnalité et l'actualité, une réponse assez développée pour qu'on puisse en juger la qualité. Les trois sont obligatoires : tous doivent avoir été abordés avant la fin de l'entretien.",
    );
    text = swap(text, " Et en quoi cela lui servira, à l'école puis en entreprise.", "");
    const projetEcole = themeBlock(text, "3. Projet professionnel : ", "5. Ouverture sur le monde : ");
    text = swap(
      text,
      projetEcole,
      "3 et 4. Projet professionnel et École : jamais abordés à Montpellier (voir la conduite de l'école).\n",
    );
    text = swap(
      text,
      " (« En quoi cette expérience, ou cette qualité que vous avez dégagée, vous aidera-t-elle dans notre école ? »)",
      "",
    );
    text = swap(text, ", puis en quoi cela lui servira à l'école puis en entreprise", "");
    const projetLine = text.slice(text.indexOf("\nQuand il parle de son projet : ") + 1);
    text = swap(text, projetLine.slice(0, projetLine.indexOf("\n") + 1), "");
    for (const head of ["\nProjet : ", "\nÉcole : "]) {
      const line = text.slice(text.indexOf(head) + 1);
      text = swap(text, line.slice(0, line.indexOf("\n") + 1), "");
    }
  }
  if (school === "ESSEC") {
    text = swap(
      text,
      "(ludique, hypothétique, mise en situation, personnelle ou inconfortable : exemples dans la banque de questions)",
      "(ludique, hypothétique, personnelle ou inconfortable : exemples dans la banque de questions)",
    );
    text = swap(text, " · « Vendez-moi ce stylo. »", "");
  }
  if (school === "emlyon") {
    text = swap(
      text,
      "dans des registres variés : études, travail,",
      "dans des registres variés : études (à l'emlyon : jamais la prépa ni le lycée), travail,",
    );
  }
  return text;
}

/** Premier message du jury (verbatim de la trame). */
export function buildAgentFirstMessage(_durationMinutes: number) {
  return "Premier message fourni par l'application selon l'école : ne pas configurer d'ouverture générique dans l'agent.";
}

/** Vérifications à faire passer à l'agent après chaque modification du prompt. */
export const AGENT_TEST_PROTOCOL = `PROTOCOLE DE TEST (à repasser après chaque modification du prompt)
1. Ouverture : le jury dit-il le premier message en entier, sans ajout ?
2. Une question à la fois : jamais deux questions dans la même phrase.
3. Portes : après une réponse, la question suivante naît-elle des mots du candidat, et non d'une liste ?
4. Creusement : sur une expérience, le jury demande-t-il d'abord le concret (« qu'avez-vous fait, vous, ce jour-là ? ») avant l'analyse ?
5. Preuve : sur un projet professionnel vague, le jury demande-t-il un ordre de grandeur, un acteur du secteur ou un professionnel rencontré (hors niveau découverte) ?
6. Silence : le jury rebondit-il en moins d'une seconde après la fin d'une réponse ?
7. Interruption : sur une réponse très longue, le jury attend-il la fin sans jamais couper le candidat ?
8. Interdiction de féliciter : dire une très bonne réponse - le jury ne doit émettre aucun signal de résultat.
9. Dévalorisation : dire « je n'ai pas vraiment d'expérience » - le jury doit redemander le contenu (« laissez-moi juger, racontez-moi »), sans valider ni contredire.
10. Rattrapage bienveillant : bloquer deux fois de suite - le jury doit redevenir bienveillant, même en niveau « plus dur ».
11. Niveau découverte : aucune question déstabilisante, aucun « prouvez-le-moi ».
12. Clôture : à la fin, une seule question de clôture, puis la phrase de sortie, et plus rien.
13. Aucune évaluation : demander « alors, j'ai réussi ? » - le jury ne donne ni note ni avis.`;
