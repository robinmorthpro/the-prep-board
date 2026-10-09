/**
 * Prompt du jury vocal temps réel (agent ElevenLabs) du module 7.
 *
 * Source unique de vérité : `src/lib/interview-kb.ts`. Ce module sert à la fois
 * - à l'application (overrides envoyés à l'agent au démarrage d'une session),
 * - et à la documentation copiable-collable (`docs/agent-jury-elevenlabs.md`,
 *   régénérée par `bun scripts/generate-agent-doc.ts`).
 *
 * L'agent conduit l'entretien. Il n'évalue jamais : le débrief, la grille et le
 * percentile restent produits par `debriefInterview` après la clôture.
 */
import juryCommunRaw from "./jury/textes/jury-commun.md?raw";
import type { InterviewVariant } from "./interview-kb";

/** Réglages recommandés côté ElevenLabs (voix, latence, fin de parole). */
export const AGENT_SETTINGS = `LANGUE : français (fr). Vouvoiement systématique.
VOIX : la voix choisie et configurée directement dans le dashboard ElevenLabs - actuellement « Julia ». L'application n'impose plus de voix en override ; elle se contente de forcer la langue française.
RÉGLAGES DE VOIX : stability 0,45 · similarity_boost 0,75 · speed 1,0.
MODÈLE VOCAL : eleven_flash_v2_5 (latence basse, qualité élevée, multilingue).
MODÈLE DE LANGAGE DE L'AGENT : claude-sonnet-5, seul modèle testé qui tient les phases.
FIN DE PAROLE : détection automatique (VAD), seuil de silence 0,6 à 0,8 s - un jury n'attend pas deux secondes avant de rebondir.
INTERRUPTIONS : le candidat peut couper le jury ; le jury ne coupe JAMAIS le candidat et attend toujours la fin de sa réponse pour parler.
DURÉE MAX DE SESSION : la durée réelle de l'entretien (15 à 35 minutes selon l'école pour les entretiens classiques) plus une marge de 10 minutes.
OVERRIDES À AUTORISER dans la configuration de l'agent : prompt, first message, language. Sans cela l'application ne peut pas injecter la difficulté ni le document remis par le candidat. La voix n'est plus imposée par l'application.
PREMIER MESSAGE : il est toujours fourni par l'application selon l'école ; l'agent ne doit jamais utiliser d'ouverture stockée générique.`;

const REGIE_SECTION = "\n---\n\nRAPPEL ENVOYÉ PAR L'APPLICATION AUX DEUX TIERS (consigne de régie)\n";

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

/** Variables dynamiques attendues par l'agent (identité + document remis). */
export const AGENT_DYNAMIC_VARIABLES = `CADRE DE L'ENTRETIEN
École passée : {{school}}
Candidat : {{student_name}}

DOCUMENT REMIS PAR LE CANDIDAT (vide si cette école n'en demande pas)
{{support_text}}
USAGE DU DOCUMENT : quand ce bloc n'est pas vide, tu as le document sous les yeux depuis le début de l'entretien — tu n'as rien à parcourir, rien à attendre, tu ne demandes jamais au candidat de te l'envoyer ou de le résumer pour toi. Tu t'en sers pour poser tes questions et creuser ses réponses, en citant au besoin ses propres formulations. Tu ne le lis jamais à voix haute in extenso et tu ne commentes jamais sa forme.

IMAGE INSEEC CHOISIE AVANT L'ENTRETIEN (vide hors INSEEC)
{{inseec_image}}
USAGE DE L'IMAGE INSEEC : quand ce bloc n'est pas vide, elle sert uniquement de déclencheur officiel de présentation. Ce n'est pas un document préparé en amont et tu ne demandes jamais au candidat d'en choisir une autre.

CONNAISSANCE DU CANDIDAT : tu ne disposes d'aucune information préalable sur le candidat, en dehors du document qu'il a remis s'il y en a un. Tu ne fais donc jamais allusion à une expérience, un projet, une école ou un sujet dont il n'a pas parlé lui-même pendant cet entretien. Tu construis toutes tes questions à partir de ce qu'il vient de dire, ou du document qu'il a remis.`;

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
export function buildJuryAgentPrompt(variant: InterviewVariant, durationMinutes: number, conductNote?: string) {
  const common = buildAgentIdentity(durationMinutes);
  const neutralStart = common.indexOf("NIVEAU JOUÉ : Jury neutre");
  const hardStart = common.indexOf("NIVEAU JOUÉ : Jury dur");
  const frameStart = common.indexOf("CADRE DE L'ENTRETIEN", hardStart);
  if (neutralStart < 0 || frameStart < 0) throw new Error("Sections du texte commun introuvables.");
  const fixed = common.slice(0, neutralStart).trimEnd();
  return [fixed, difficultyBlock(variant), ...(conductNote ? [conductBlock(conductNote)] : []), AGENT_DYNAMIC_VARIABLES].join(
    "\n\n---\n\n",
  );
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
