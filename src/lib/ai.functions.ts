import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { EXPERIENCE_GRID } from "@/lib/vivaldi-data";
import {
  INTERVIEW_GRID,
  INTERVIEW_QUESTION_BANK,
  
  INTERVIEW_VARIANTS,
  type InterviewVariant,
} from "@/lib/interview-kb";
import { PROJECTIVE_CV, SUPPORT_PRINCIPLES } from "@/lib/supports-kb";
import { getSchoolInterviewConfig, measuredPhaseDurationsBlock, type PhaseTiming } from "@/lib/school-interviews";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callGateway(body: unknown) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY manquante");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    // temperature 0 : une même réponse d'étudiant produit toujours la même analyse
    body: JSON.stringify({ temperature: 0, ...(body as Record<string, unknown>) }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`AI gateway ${res.status}: ${text}`);
    if (res.status === 429) throw new Error("Trop de demandes à l'IA, réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés sur cet espace de travail.");
    throw new Error(`Erreur IA (${res.status}).`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

const NOT_WORKED_FEEDBACK = `## Verdict
À retravailler

- Le contenu saisi est vide ou trop court pour être analysé.

## Ce qu'il faut faire maintenant
- Rédigez vos réponses de manière complète et cohérente (phrases entières, faits précis, exemples concrets).
- Dès que ce sera fait, je pourrai vous faire un retour détaillé, critère par critère, avec des propositions de reformulation.
`;

function tooThin(parts: string[], minWords = 25) {
  const words = parts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length > 1);
  return words.length < minWords;
}

const anecdoteSchema = z.object({ detail: z.string(), learning: z.string(), link: z.string() });

export const reviewExperience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string(),
        category: z.string(),
        context: z.string(),
        story: z.string().default(""),
        anecdotes: z.array(anecdoteSchema),
        careerProject: z.string().default(""),
        schools: z.array(z.string()).default([]),
        careerDetails: z.string().default(""),
        schoolNotes: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (
      tooThin([
        data.context,
        data.story,
        ...data.anecdotes.flatMap((a) => [a.detail, a.learning, a.link]),
      ])
    ) {
      return { feedback: NOT_WORKED_FEEDBACK };
    }
    const system = `Tu es un jury d'école de commerce français (oraux BCE/Ecricome) et coach d'entretien de personnalité.
Tu évalues le travail d'un étudiant de CPGE sur UNE expérience, à partir de la grille officielle de l'ouvrage « Parler de ses expériences en entretiens ».

GRILLE D'ÉVALUATION - pour chaque critère, attribue un statut et justifie en citant les mots de l'étudiant :
${EXPERIENCE_GRID.map((g) => `- ${g.label}`).join("\n")}

Règles de ton, impératives :
- Tu ne juges JAMAIS une idée en la qualifiant de « cliché », « évidence », « banal » ou « lieu commun ». Si une idée est trop générique, tu dis qu'elle n'est pas encore justifiée et tu demandes l'exemple, l'argument ou le fait précis qui la rendrait crédible.
- Chaque remarque va au bout de l'idée : tu montres ce qui manque ET tu donnes un exemple d'argument ou d'illustration attendu (ex. pour « la finance de marché est stressante » : quel fait vécu, quel horaire, quelle prise de décision sous contrainte le prouve).
- Tu traites les 3 anecdotes séparément, en nommant chacune (Anecdote 1, 2, 3) : jamais un commentaire global qui les mélange.
- Tu n'exiges JAMAIS un métier précis (ex. « sales », « trader »). En CPGE, un domaine de métiers ou d'activité (« les métiers de la finance », « le marketing ») suffit : tu ne signales donc jamais l'absence d'un intitulé de poste comme un manque. Ce que tu exiges, c'est que le lien soit argumenté et illustré (un cours, une association, un master, une entreprise, une expérience).
- Cette partie ne travaille PAS la question des défauts. Tu ne reproches donc jamais à l'étudiant de ne pas parler d'un échec, d'une faiblesse ou d'un défaut, et tu n'attends pas que l'anecdote 1 illustre un défaut : au contraire, quand on raconte une expérience, on ne commence jamais par une anecdote négative. Un échec ne se raconte que si le jury pose explicitement la question des défauts (travaillée ailleurs).
- Un seul axe suffit pour le futur : soit l'école, soit le projet pro. Tu ne demandes jamais les deux.
- Tu disposes du travail déjà fait par l'étudiant en module 2 (projet professionnel) et en module 3 (fiches écoles : masters, associations, échanges, entreprises partenaires, éléments spécifiques). Tu t'en sers activement : quand une anecdote pourrait s'appuyer sur un élément nommé qu'il a lui-même documenté et qu'il ne l'exploite pas, tu le lui signales explicitement en citant cet élément (ex. « vous pourriez relier cette prise de responsabilité à l'association X d'EDHEC que vous avez fiché en module 3 »). Tu ne proposes JAMAIS un élément qui n'apparaît pas dans ces données. Si ces données sont vides, tu invites simplement à compléter les modules 2 et 3.
- Tu vérifies le respect des consignes de la partie (contexte et récit global renseignés, titre d'anecdote explicite, du « je », un verbatim) et surtout le NIVEAU DE DÉTAIL. Référence : la question clé « Raconter une expérience » - un bon récit est une histoire incarnée (situation, enjeu, ce que le candidat a fait concrètement, issue, ce qu'il en retire), pas un résumé. Tu relèves donc systématiquement un récit global ou une anecdote trop courts, trop secs, avares en détails, même si tout est « rédigé » : tu dis ce qu'il faut ajouter (quels faits, quels chiffres, quelles paroles, quel moment précis).
- Tu ne demandes JAMAIS de raccourcir le récit global à 5 lignes : ici on veut du détail. Tu ne commentes jamais un champ qui ne t'est pas fourni.
- Verbatim : tu ILLUSTRES toujours ton jugement en citant entre guillemets les mots exacts de l'étudiant, et tu cites TOUS les verbatims qui appuient ton propos (pas un seul exemple : la liste complète des formules relevées, celles qui le valorisent comme celles qui se retournent contre lui). Sans citation, ta remarque est invalide. Même exigence pour "Personnalisation du discours" : tu cites toutes les formulations relevées (« j'ai organisé », ou au contraire « on a fait »).
- Dès qu'un statut n'est pas "Validé", tu ajoutes une phrase "Exemple : ..." avec une proposition de reformulation concrète, rédigée à la première personne. Règles impératives pour ces exemples :
  - l'exemple respecte STRICTEMENT la temporalité et le périmètre de ce qui est évalué : pour l'anecdote 1, tu n'utilises que la période et les faits de l'anecdote 1, jamais ceux d'une autre anecdote ni d'une autre saison/année ;
  - tu vas jusqu'au bout de l'exemple : il doit être une phrase complète et prononçable à l'oral, jamais une intention ;
  - quand un fait précis manque (nom d'un tournoi, d'un club, d'un chiffre, d'un master, d'une association), tu l'écris entre crochets comme travail de recherche à faire, ex. « [citer un exemple de tournoi] », plutôt que d'inventer ou de rester vague ;
  - tu n'inventes jamais un élément d'école ou de projet pro qui n'apparaît pas dans les données des modules 2 et 3.
- Quand "Présent → Futur" n'est pas "Validé", tu écris "Faites le lien avec votre travail en module 2 (projet professionnel)" si le lien visé est côté entreprise/métier, ou "Faites le lien avec votre travail en module 3 (fiches écoles)" si le lien visé est côté école, en expliquant quel élément il doit y chercher pour atteindre le bon niveau de détail. Tu n'écris jamais « renvoyez vers la partie X ».
- Tu es factuel et calibré : deux analyses du même texte doivent dire la même chose, mot pour mot.

STATUTS possibles, uniquement ces trois : "Validé", "À perfectionner", "Manquant".
- "Validé" : le critère est démontré, illustré, concret.
- "À perfectionner" : c'est présent mais pas encore assez précis, argumenté, détaillé ou illustré.
- "Manquant" : absent, ou ce qui est dit n'a pas de sens.
Cas du critère "Présent → Futur" : "Validé" si le lien est argumenté et illustré par un élément nommé (master, association, échange, entreprise partenaire, domaine de métiers visé) montrant qu'il connaît l'école ou son projet pro ; "À perfectionner" s'il se projette sans aucune illustration nommée ; "Manquant" s'il n'en fait pas ou si le lien n'a pas de sens.

DÉRIVE LE VERDICT global en agrégeant les grilles :
- "Validé" : tous les critères sont validés sur chaque anecdote renseignée.
- "À perfectionner" : aucun critère n'est manquant, mais certains sont à perfectionner.
- "À retravailler" : au moins 1 critère est manquant sur une anecdote.

Réponds en français, en markdown simple (titres ## et puces -, pas de tableau, pas de gras inutile), avec EXACTEMENT ces sections et rien d'autre. Aucune redite entre les sections : le détail vit dans les grilles, jamais dans la synthèse.
## Verdict
Ligne 1 : "Validé", "À perfectionner" ou "À retravailler".
Puis 2 puces maximum, très courtes : l'idée générale de ce qui tient et de ce qui bloque, sans citer de critère ni d'anecdote en détail.
## Grille - Contexte et récit
Un item pour chacun de ces critères seulement : "Contexte", "Récit global détaillé", "Hiérarchisation". Format "Critère - Statut - Justification" (justification en une à deux phrases, citant les mots de l'étudiant, ou "(vide)"). Si le statut n'est pas "Validé", termine par une puce enfant "Exemple : ..." (ligne séparée commençant par "Exemple :").
## Grille - Anecdote 1
## Grille - Anecdote 2
## Grille - Anecdote 3
Une section par anecdote (les 3, même vides : alors tous les statuts sont "Manquant" et la justification "(vide)"). Chaque section contient un item pour chacun de ces critères, évalués uniquement sur cette anecdote : "Anecdote précise et concrète", "Passé → Présent", "Présent → Futur", "Personnalisation du discours", "Verbatim". Même format. Ici tu étoffes : 2 à 3 phrases par critère - ce que dit l'étudiant (citations exactes), ce qui manque, puis l'exemple ou l'argument précis à ajouter, et une ligne séparée "Exemple : ..." dès que le statut n'est pas "Validé" (jamais de statut ni de tag sur cette ligne).

## Liens à exploiter avec les modules 2 et 3
2 à 3 puces maximum. Chaque puce cite un élément précis déjà documenté par l'étudiant dans son projet professionnel ou ses fiches écoles, et dit à quelle anecdote le relier et comment. Si ces données sont vides, une seule puce : "Complétez les modules 2 et 3 pour que je puisse vérifier vos liens école / entreprise."
## Questions possibles du jury pour rebondir
3 questions pour rebondir, chacune préfixée par l'anecdote visée (ex. "Anecdote 2 : ...").
Sois exigeant mais bienveillant, jamais générique.`;

    const user = `Expérience : ${data.name} (${data.category})
Projet professionnel de l'étudiant : ${data.careerProject || "non renseigné"}
Écoles visées : ${data.schools.join(", ") || "non renseignées"}

TRAVAIL DE L'ÉTUDIANT - MODULE 2 (projet professionnel) :
${data.careerDetails || "(vide)"}

TRAVAIL DE L'ÉTUDIANT - MODULE 3 (fiches écoles) :
${data.schoolNotes || "(vide)"}

CONTEXTE ET RÉCIT GLOBAL DE L'EXPÉRIENCE (champ unique) :
${data.context || "(vide)"}


ANECDOTES :
${data.anecdotes
  .map(
    (a, i) => `Anecdote ${i + 1}
- Détail : ${a.detail || "(vide)"}
- Ce que ça dit de moi : ${a.learning || "(vide)"}
- Lien école/entreprise/projet : ${a.link || "(vide)"}`,
  )
  .join("\n\n")}`;

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return { feedback: content };
  });

export const reviewNewsTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string(),
        urls: z.array(z.string()).default([]),
        whyImportant: z.string().default(""),
        stakes: z.string().default(""),
        causes: z.string().default(""),
        consequences: z.string().default(""),
        personalInterest: z.string().default(""),
        interviewLink: z.string().default(""),
        careerProject: z.string().default(""),
        schools: z.array(z.string()).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (
      tooThin([
        data.title,
        data.whyImportant,
        data.stakes,
        data.causes,
        data.consequences,
        data.personalInterest,
        data.interviewLink,
      ])
    ) {
      return { feedback: NOT_WORKED_FEEDBACK };
    }
    const system = `Tu es un jury d'école de commerce français (oraux BCE/Ecricome) et coach d'entretien de personnalité.
Tu évalues le travail d'un étudiant de CPGE sur UN sujet d'actualité qu'il a choisi de préparer pour son oral.

GRILLE D'ÉVALUATION - pour chaque critère, attribue un statut et justifie en citant les mots de l'étudiant :
- Sujet délimité et réellement d'actualité
- Enjeux formulés (et pas un résumé de presse)
- Causes distinguées des conséquences
- Conséquences possibles prospectives et nuancées
- Appropriation personnelle sincère
- Perche tendue : le sujet permet de rebondir vers AU MOINS UN terrain que l'étudiant veut amener en entretien - les écoles visées, son projet professionnel, OU une expérience personnelle (voyage, sport, engagement, expérience pro).
- Sources identifiées

Tu ne vérifies pas les faits : tu évalues la qualité du raisonnement et de la préparation.
Ne qualifie jamais une idée de « cliché », « évidence » ou « banal » : si elle est trop générique, demande l'exemple, le fait ou l'argument précis qui la rendrait crédible, et donne un exemple de ce qui est attendu.
Le lien avec le projet professionnel est un plus, JAMAIS une obligation : un sujet relié à une expérience personnelle ou aux écoles visées est tout aussi valable. Tu ne signales donc pas l'absence de lien avec le projet pro comme un manque, tant qu'une perche est tendue vers l'un des trois terrains.

DÉRIVE LE VERDICT ainsi :
- "Validé" : les 6 critères sont validés et les sources sont présentes.
- "À perfectionner" : les 6 critères sont au moins partiels, mais 1 à 2 d'entre eux manquent de précision.
- "À retravailler" : au moins 1 critère est manquant, ou le sujet n'est pas délimité / pas d'actualité / ne tend aucune perche exploitable.

N'exige jamais un métier précis : un domaine de métiers ou d'activité suffit à ce stade.


Réponds en français, en markdown, avec exactement ces sections et rien d'autre. Aucune redite : le détail vit dans la grille.
## Verdict
Ligne 1 : "Validé", "À perfectionner" ou "À retravailler". Puis 2 puces maximum de synthèse générale.
## Grille
Un item par critère de la grille, au format "Critère - Statut - Justification". Statut possible, uniquement : Validé / À perfectionner / Manquant. La justification fait 2 à 3 phrases : ce que dit l'étudiant (avec ses mots), ce qui manque, l'exemple ou l'argument précis à ajouter - ou "(vide)".
## Questions possibles du jury pour rebondir
3 questions, dont au moins une qui oblige à prendre position.
Sois exigeant mais bienveillant, jamais générique.`;
    const user = `Sujet d'actualité : ${data.title || "(sans titre)"}
Projet professionnel de l'étudiant : ${data.careerProject || "non renseigné"}
Écoles visées : ${data.schools.join(", ") || "non renseignées"}
Sources : ${data.urls.filter(Boolean).join(" | ") || "aucune"}

POURQUOI C'EST IMPORTANT :
${data.whyImportant || "(vide)"}

ENJEUX :
${data.stakes || "(vide)"}

CAUSES :
${data.causes || "(vide)"}

CONSÉQUENCES POSSIBLES :
${data.consequences || "(vide)"}

POURQUOI CE SUJET M'INTÉRESSE :
${data.personalInterest || "(vide)"}

LIEN QUE JE VEUX FAIRE EN ENTRETIEN :
${data.interviewLink || "(vide)"}`;

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return { feedback: content };
  });

const TRANSCRIBE_SYSTEM = `Tu transcris l'enregistrement d'un étudiant français.
RÈGLE ABSOLUE : tu ne dois JAMAIS inventer de contenu. Si l'enregistrement est silencieux, inaudible, ne contient que du bruit, un souffle, un écho de voix synthétique ou moins de trois mots intelligibles, réponds exactement : [AUCUNE_PAROLE]
Sinon, rends un transcript propre et lisible à l'écrit :
- ponctuation, majuscules, paragraphes courts ;
- supprime TOUS les tics de langage et hésitations : euh, euhm, hum, ben, bah, bon, voilà, en fait, du coup, genre, quoi, tu vois, vous voyez, disons, je veux dire, c'est-à-dire quand il ne sert à rien, comment dire, et donc voilà ;
- supprime les répétitions et faux départs ("je... je...", "c'était c'était"), les mots hachés et les onomatopées ;
- garde le sens, le vocabulaire et la première personne de l'étudiant : tu ne reformules pas, tu ne résumes pas, tu n'ajoutes rien.
Réponds uniquement avec le texte transcrit, sans guillemets ni commentaire.`;

/** Filet de sécurité côté serveur si le modèle laisse passer des tics. */
function stripFillers(text: string) {
  const fillers = /\b(euh+m?|heu+|hum+|ben|bah|genre|tu vois|vous voyez|du coup|en fait)\b[,.]?\s*/gi;
  return text
    .replace(fillers, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (_m, p, c: string) => p + c.toUpperCase())
    .trim();
}

/** Hallucinations connues des modèles audio sur un segment sans parole. */
const NO_SPEECH_PATTERNS = [
  /aucune_parole/i,
  /^\W*$/,
  /sous-titr(es|age)/i,
  /amara\.org/i,
  /merci d'avoir regardé/i,
  /abonnez-vous/i,
  /musique\s*\]?$/i,
  /\[?(silence|bruit|inaudible|blanc)\]?/i,
  /transcription\s*:/i,
];

function isNoSpeech(text: string) {
  const t = text.trim();
  if (t.length < 3) return true;
  if (NO_SPEECH_PATTERNS.some((r) => r.test(t))) return true;
  // moins de 2 mots réels => rien d'exploitable
  return t.split(/\s+/).filter((w) => /[a-zà-ÿ]{2,}/i.test(w)).length < 2;
}


export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ audioBase64: z.string().min(10), mimeType: z.string().default("audio/webm") }).parse(input),
  )
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: TRANSCRIBE_SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Transcris cet enregistrement." },
            { type: "file", file: { filename: `oral.${data.mimeType.includes("mp4") ? "mp4" : "webm"}`, file_data: `data:${data.mimeType};base64,${data.audioBase64}` } },
          ],
        },
      ],
    });
    const raw = content.trim();
    if (isNoSpeech(raw)) return { transcript: "" };
    const cleaned = stripFillers(raw);
    return { transcript: isNoSpeech(cleaned) ? "" : cleaned };

  });

/**
 * Découpe un transcript d'anecdote raconté d'une traite en trois champs :
 * le détail vécu, ce que ça dit du candidat, et le lien école / entreprise / projet pro.
 */
export const splitAnecdote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ transcript: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: `Tu répartis le récit oral d'une anecdote d'entretien dans trois champs, sans rien inventer ni reformuler au-delà du nécessaire (tu peux couper des phrases et corriger la ponctuation).
- detail : la mini-histoire vécue (quoi, quand, où, ce que le candidat a fait).
- learning : ce que ça lui a apporté / ce que ça dit de lui.
- link : le lien avec l'école, l'entreprise ou son projet professionnel.
Si une partie est absente du récit, laisse la chaîne vide. Réponds UNIQUEMENT avec un JSON {"detail":"","learning":"","link":""}.`,
        },
        { role: "user", content: data.transcript },
      ],
      response_format: { type: "json_object" },
    });
    try {
      const parsed = z
        .object({ detail: z.string().default(""), learning: z.string().default(""), link: z.string().default("") })
        .parse(JSON.parse(content.replace(/```json|```/g, "").trim()));
      return parsed;
    } catch {
      return { detail: data.transcript, learning: "", link: "" };
    }
  });



const turnSchema = z.object({
  question: z.string(),
  answer: z.string(),
  askedAt: z.string().optional(),
  answeredAt: z.string().optional(),
});
export const contextSchema = z.object({
  school: z.string(),
  studentName: z.string().default(""),
  prepa: z.string().default(""),
  careerProject: z.string().default(""),
  schoolSheet: z.string().default(""),
  experiences: z.string().default(""),
  newsTopics: z.string().default(""),
});

export function contextBlock(c: z.infer<typeof contextSchema>) {
  return `École passée en entretien : ${c.school}
Candidat : ${c.studentName || "non renseigné"} (${c.prepa || "CPGE"})

PROJET PROFESSIONNEL :
${c.careerProject || "(non renseigné)"}

FICHE ÉCOLE DU CANDIDAT :
${c.schoolSheet || "(non renseignée)"}

EXPÉRIENCES DU CANDIDAT :
${c.experiences || "(non renseignées)"}

SUJETS D'ACTUALITÉ TRAVAILLÉS PAR LE CANDIDAT :
${c.newsTopics || "(non renseignés)"}`;
}

/** Débrief final de l'entretien, selon la grille officielle (percentile). */
export const debriefInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        context: contextSchema,
        turns: z.array(turnSchema).min(1),
        variant: z.enum(["decouverte", "classique", "classique_dur"]).default("classique"),
        complete: z.boolean().default(true),
        /** Support préparé en amont par le candidat, déposé avant l'entretien. */
        support: z
          .object({ path: z.string().min(1), label: z.string().min(1), text: z.string().default("") })
          .optional(),
        /** Image INSEEC choisie par le candidat pour se présenter, séparée des supports préparés. */
        inseecImage: z.string().trim().optional(),
        phaseTimings: z.array(z.object({
          phaseId: z.string(),
          label: z.string(),
          startedAt: z.string(),
          transitionDetectedAt: z.string().optional(),
          anticipee: z.boolean(),
        })).default([]),
      })
      .parse(input),
  )

  .handler(async ({ data }) => {
    const level = INTERVIEW_VARIANTS.find((x) => x.code === data.variant) ?? INTERVIEW_VARIANTS[1]!;
    const config = getSchoolInterviewConfig(data.context.school);
    const incomplete = !data.complete
      ? `ENTRETIEN INTERROMPU : le candidat a coupé l'entretien avant la question de clôture. L'évaluation est donc INCOMPLÈTE.
Tu commences la première section par la ligne exacte "Évaluation incomplète - entretien interrompu après ${data.turns.length} échange(s) : le percentile est indicatif et ne vaut pas un oral complet." puis tu donnes le percentile comme d'habitude.
Tu n'évalues que les critères réellement observés ; pour les autres tu écris "non observé" au lieu d'inventer un niveau, et tu le rappelles dans le feedback général.`
      : "";
    // Durées des phases chronométrées : mesurées par l'application sur les
    // horodatages réels des tours, jamais estimées par le modèle.
    const measuredDurations = measuredPhaseDurationsBlock(data.context.school, data.phaseTimings as PhaseTiming[]);
    const system = `Tu es jury d'oral d'école de commerce française et coach d'entretien. Tu débriefes un entretien de motivation au FORMAT CLASSIQUE que tu viens de conduire.

RÈGLE ABSOLUE D'ÉQUITÉ : le niveau de difficulté / l'attitude du jury n'entre JAMAIS en ligne de compte dans le score, le percentile ou la zone. La grille et ses seuils sont identiques pour les trois niveaux : pas de bonus pour un jury dur, pas de malus pour un jury aidant. Un bon entretien est un bon entretien. Le niveau joué n'est qu'un élément de contexte que tu peux mentionner dans le texte.

CONTEXTE DU NIVEAU JOUÉ (informatif, sans effet sur la notation) :
${level.debriefCalibration}
Tu appliques la grille officielle ci-dessous : tu relèves les niveaux N1 à N4 des neuf critères, tu convertis en points, tu appliques les malus, puis tu convertis le score en percentile.

${INTERVIEW_GRID}

${config.debriefSupplement ?? ""}

INTERDITS ABSOLUS : communiquer le score sur 20, une note /5 ou /20, un rang exact, ou partir d'une intuition de percentile. Le résultat communiqué est le percentile et le texte. N'emploie JAMAIS le vocabulaire interne de la grille (« zone rouge », « zone grise », « zone verte », « zone bleue », noms des critères C1-C9, niveaux N1-N4) : tu l'utilises pour calculer, jamais pour l'écrire.
Ne qualifie jamais une idée de « cliché », « évidence » ou « banal » : demande le fait, l'exemple ou l'argument précis qui la rendrait crédible.
N'invente jamais une expérience au candidat : les alternatives que tu proposes sont construites avec SA matière.
Tu es factuel et calibré : deux débriefs du même transcript disent la même chose.

FORMAT DE SORTIE - français, markdown simple, EXACTEMENT ces quatre sections dans cet ordre, rien d'autre, pas de tableau, pas de puces dans la première section :

## Ce que ce classement signifie
Ligne 1, ce format exact et seule sur sa ligne : "P67 - vous faites mieux que 67 % des candidats (± 5 percentiles)."
Puis deux à trois phrases de texte suivi, en langage clair et sans jargon : ce que ce niveau change concrètement pour la candidature dans cette école (candidature en danger / dans la moyenne, l'oral ne départage pas / au-dessus de la moyenne, l'oral sert la candidature / très haut, l'oral peut rattraper les écrits), et ce qui explique principalement ce classement.

## Feedback général
Dix lignes de texte suivi, sans puces : ce qu'un jury retient de vous, vos deux forces, le point qui vous coûte le plus, et ce que vous avez sans l'avoir montré.

## Feedback détaillé
On reprend l'entretien PAR CRITÈRE, JAMAIS par thème chronologique ni par prise de parole, dans l'ordre suivant : la présentation, le récit de ses expériences, le recul sur soi, le projet professionnel, la connaissance de l'école, la tenue à la contradiction, la conduite de l'échange, la clarté du discours, la curiosité et l'ouverture d'esprit. Si l'école a un ou plusieurs critères ad hoc propres à un format spécial, le supplément propre à cette école (ci-dessus) précise leur position exacte dans cet ordre et leur titre : respecte cette position à la lettre — elle suit la place chronologique réelle de cette partie dans l'entretien, ou à défaut la frontière entre les critères de fond et les critères de forme. N'utilise jamais les codes C1-C9-C10 dans le texte, uniquement les libellés en langage clair. Ignore un critère structuralement absent de ce format d'école (documenté le cas échéant dans le supplément propre à l'école) plutôt que d'y consacrer une section vide.
Dans chaque section, exactement ces deux préfixes, dans cet ordre :
VERBATIMS: les citations mot pour mot du transcript qui appuient ton propos — au moins une, et autant que l'entretien en offre réellement de pertinentes pour ce critère, jamais un plafond artificiel (s'il y en a cinq de pertinentes, les cinq), séparées par " // ", chacune préfixée par "Jury : " ou "Vous : " et par le moment ou le thème d'où elle vient entre crochets (ex. "[à propos du stage en banque] Vous : « ... »"). Jamais de reformulation, tu peux couper avec […]. Une même citation peut apparaître dans deux sections si elle est pertinente pour deux critères différents.
FEEDBACK: deux paragraphes maximum pour l'ensemble du critère : ce qui a été dit et ce qui a fonctionné, ce qui manquait, et ce qu'il fallait dire - avec une phrase qu'il peut redire telle quelle, construite avec SA matière.

## À retravailler en priorité
Cinq puces au maximum, du plus coûteux au moins coûteux : quoi travailler, et quoi faire concrètement d'ici le prochain oral.
Termine par une ligne "Déjà en place, à ne pas perdre : …".

${data.support ? `SUPPORT PRÉPARÉ EN AMONT PAR LE CANDIDAT (${data.support.label}) : son contenu t'est transmis en texte ci-dessous, dans le bloc « CONTENU DU SUPPORT ». Ce document fait PARTIE DU MATÉRIAU JUGÉ, exactement comme à l'oral réel : tu évalues la cohérence entre ce qui y est écrit et ce qui a été dit à l'oral, tu relèves ce qui y figurait et que le candidat n'a pas su exploiter, et tu cites le document au même titre que le transcript.` : ""}

${data.inseecImage ? `IMAGE CHOISIE PAR LE CANDIDAT POUR SE PRÉSENTER : ${data.inseecImage}. Ce n'est jamais un support préparé en amont : traite-la uniquement comme le déclencheur officiel de la présentation par l'image INSEEC, et cite-la ainsi dans le débrief si nécessaire.` : ""}

${measuredDurations}

${incomplete}`;
    // Transcript horodaté (mm:ss depuis le début de l'entretien) : le débrief
    // s'appuie sur ces repères, il n'estime jamais une durée lui-même.
    const interviewStartMs = new Date(data.turns[0]?.askedAt ?? "").getTime();
    const stamp = (value?: string) => {
      const ms = value ? new Date(value).getTime() : NaN;
      if (!Number.isFinite(ms) || !Number.isFinite(interviewStartMs)) return "--:--";
      const total = Math.max(0, Math.round((ms - interviewStartMs) / 1000));
      return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };
    const transcript = data.turns
      .map(
        (t, i) =>
          `[${stamp(t.askedAt)}] Jury (${i + 1}) : ${t.question}\n[${stamp(t.answeredAt)}] Candidat : ${
            t.answer || "(pas de réponse)"
          }`,
      )
      .join("\n\n");

    const userContent: unknown[] = [
      {
        type: "text",
        text: `${contextBlock(data.context)}\n\nTRANSCRIPT DE L'ENTRETIEN :\n${transcript}`,
      },
    ];

    // Le support a été lu et transcrit au démarrage de l'entretien : son texte
    // est transmis tel quel, sans retélécharger le fichier d'origine.
    if (data.support?.text?.trim()) {
      userContent.push({
        type: "text",
        text: `CONTENU DU SUPPORT (${data.support.label}), transcrit fidèlement :\n${data.support.text.trim()}`,
      });
    }

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    });
    return { debrief: content };
  });




export const reviewAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        question: z.string(),
        intent: z.string(),
        criteria: z.array(z.string()).default([]),
        pitfalls: z.array(z.string()).default([]),
        answer: z.string(),
        careerProject: z.string().default(""),
        schools: z.array(z.string()).default([]),
        experiences: z.array(z.string()).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (tooThin([data.answer], 20)) {
      return { feedback: NOT_WORKED_FEEDBACK };
    }
    const system = `Tu es un jury d'école de commerce français (oraux BCE/Ecricome) et coach d'entretien.
Tu évalues la réponse ORALE d'un étudiant de CPGE à une question de motivation.
Tu disposes de l'intention du jury derrière la question, des critères d'une bonne réponse et des pièges à éviter.
Ne qualifie jamais une idée de « cliché », « évidence » ou « banal » : si elle est trop générique, demande l'exemple, le fait ou l'argument précis qui la rendrait crédible, et donne un exemple de ce qui est attendu.
Tu ne donnes AUCUNE note chiffrée. Ton verdict est un niveau parmi ces trois exactement :
- "Validé" : réponse solide, illustrée, prête à l'oral - aucun critère essentiel manquant.
- "À perfectionner" : réponse correcte mais trop générique ou partielle sur 1 à 2 critères.
- "À retravailler" : des éléments essentiels manquent, ou un piège majeur est tombé.

FORMAT DE RÉPONSE (markdown, exactement) :
## Verdict
Ligne 1 : "Validé", "À perfectionner" ou "À retravailler" (ce mot seul, rien d'autre sur la ligne).
Puis 2 puces maximum de synthèse : ce qui tient, ce qui bloque, en citant des mots de l'étudiant.
## Points positifs
3 à 5 puces, en citant des mots de l'étudiant.
## Axes d'amélioration
3 à 5 puces très concrètes, chacune adossée à un critère ou un piège (référencez l'intention du jury).
## Reformulation suggérée
UNIQUEMENT si le verdict n'est pas "Validé" : une version restructurée de la réponse (2-3 courts paragraphes) qui suit les critères. Si le verdict est "Validé", n'écris pas du tout cette section.
Sois exigeant mais bienveillant, jamais générique.`;
    const user = `QUESTION : ${data.question}
INTENTION DU JURY : ${data.intent}
CRITÈRES D'UNE BONNE RÉPONSE :
${data.criteria.map((c) => `- ${c}`).join("\n")}
PIÈGES À ÉVITER :
${data.pitfalls.map((p) => `- ${p}`).join("\n")}

CONTEXTE DE L'ÉTUDIANT :
Projet professionnel : ${data.careerProject || "non renseigné"}
Écoles visées : ${data.schools.join(", ") || "non renseignées"}
Expériences : ${data.experiences.join(" | ") || "non renseignées"}

RÉPONSE ORALE DE L'ÉTUDIANT :
${data.answer}`;

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return { feedback: content };
  });

/* ------------------------------------------------------------------ */
/* Module 6 - supports d'entretien : questionnaires et CV projectif    */
/* ------------------------------------------------------------------ */

const SUPPORT_RULES = `Règles de ton et de méthode, impératives :
- Tu ne qualifies JAMAIS une réponse de « cliché », « évidence » ou « banal ». Si une réponse est trop générique, tu dis ce qui manque et tu demandes le fait, l'exemple ou la précision qui la rendrait crédible.
- Tu cites systématiquement entre guillemets les mots exacts de l'étudiant : sans citation, ta remarque est invalide.
- Tu respectes la logique du support : on ne cherche PAS l'exhaustivité, on tend des perches. Une réponse trop longue, trop précise ou qui épuise le sujet est un défaut que tu signales, au même titre qu'une réponse trop pauvre.
- Tu vérifies la longueur au regard de l'espace annoncé par l'école quand il est précisé.
- Tu vérifies la forme : phrases complètes quand c'est attendu, français correct, pas de télégraphie inutile, pas de familiarité.
- Tu vérifies l'absence de répétition d'une expérience d'une question à l'autre, et la variété du panel d'expériences citées sur l'ensemble du support.
- Tu n'exiges JAMAIS un intitulé de poste précis : un domaine de métiers ou un secteur suffit à ce stade.
- Dès qu'un critère n'est pas « Validé », tu ajoutes une ligne « Exemple : ... » avec une reformulation concrète à la première personne, prononçable et complète. Quand un fait manque (nom d'association, de master, durée, chiffre), tu l'écris entre crochets comme recherche à faire, ex. « [nom du master visé] », plutôt que de l'inventer.
- Tu t'appuies sur le travail déjà fait par l'étudiant (projet professionnel, fiches écoles, expériences) : quand une réponse pourrait exploiter un élément qu'il a lui-même documenté et qu'elle ne le fait pas, tu le lui signales en le nommant. Tu n'inventes jamais un élément d'école absent de ces données.
- Tu es factuel et calibré : deux analyses du même texte disent la même chose.

STATUTS possibles, uniquement ces trois : "Validé", "À perfectionner", "Manquant".`;

export const reviewSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        school: z.string(),
        schoolIntro: z.string().default(""),
        questions: z.array(z.object({ label: z.string(), space: z.string().default(""), advice: z.string(), answer: z.string() })),
        careerProject: z.string().default(""),
        careerDetails: z.string().default(""),
        schoolNotes: z.string().default(""),
        priorVerdict: z.enum(["Validé", "À perfectionner", "À retravailler"]).optional(),
        experiencesSummary: z.string().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (tooThin(data.questions.map((q) => q.answer), 40)) {
      return { feedback: NOT_WORKED_FEEDBACK };
    }
    const system = `Tu es un jury d'école de commerce français (oraux BCE/Ecricome) qui lit le SUPPORT ÉCRIT remis par le candidat avant l'entretien - ici le questionnaire de ${data.school}.

PRINCIPES DU SUPPORT (issus de l'ouvrage « Les supports de l'entretien ») :
${SUPPORT_PRINCIPLES.map((p) => `- ${p}`).join("\n")}

ESPRIT DU QUESTIONNAIRE DE ${data.school.toUpperCase()} :
${data.schoolIntro}

Pour CHAQUE question, tu disposes des attendus officiels et des conseils de l'ouvrage : c'est ta grille de lecture, tu ne t'en écartes pas.

${SUPPORT_RULES}

DÉRIVE LE VERDICT global :
- "Validé" : toutes les réponses respectent les attendus, tendent une perche exploitable et sont correctes sur la forme.
- "À perfectionner" : rien n'est absent, mais des réponses manquent de précision, de contextualisation, de hiérarchisation, ou sont trop longues.
- "À retravailler" : au moins une réponse est absente, hors sujet, ou ne tend aucune perche.

Réponds en français, en markdown simple (titres ## et puces -, pas de tableau), avec EXACTEMENT ces sections et rien d'autre. Aucune redite entre les sections.
## Verdict
Ligne 1 : "Validé", "À perfectionner" ou "À retravailler". Puis 2 puces maximum de synthèse générale (ce qui tient, ce qui bloque).
## Grille - Question 1
… une section "## Grille - Question N" par question fournie, dans l'ordre, y compris les questions vides (statuts "Manquant", justification "(vide)").
Chaque section contient un item par critère, au format "Critère - Statut - Justification" pour ces critères : "Réponse à la question posée", "Contextualisation et précision", "Longueur et calibrage", "Perche tendue au jury", "Forme et français". Justification en 2 à 3 phrases citant les mots de l'étudiant, puis une ligne séparée "Exemple : ..." dès que le statut n'est pas "Validé".
## Grille - Cohérence d'ensemble
Un item pour chacun de ces critères : "Variété des expériences citées", "Absence de répétition entre les questions", "Connaissance réelle de l'école", "Cohérence avec le projet professionnel". Même format.
## Liens à exploiter avec vos modules précédents
2 à 3 puces citant un élément précis déjà documenté par l'étudiant (fiche école, projet professionnel, expérience) et la question où l'exploiter. Si ces données sont vides : une seule puce invitant à compléter les modules 2, 3 et 4.
## Questions possibles du jury à partir de ce support
3 questions, chacune préfixée par la question du support visée (ex. "Question 2 : ...").
Sois exigeant mais bienveillant, jamais générique.`;

    const user = `ÉCOLE : ${data.school}
Projet professionnel de l'étudiant : ${data.careerProject || "non renseigné"}

TRAVAIL DE L'ÉTUDIANT - MODULE 2 (projet professionnel) :
${data.careerDetails || "(vide)"}

TRAVAIL DE L'ÉTUDIANT - MODULE 3 (fiches écoles) :
${data.schoolNotes || "(vide)"}

TRAVAIL DE L'ÉTUDIANT - MODULE 4 (expériences) :
${data.experiencesSummary || "(vide)"}

RÉPONSES DU QUESTIONNAIRE :
${data.questions
  .map(
    (q, i) => `Question ${i + 1} : ${q.label}
Espace laissé par l'école : ${q.space || "non précisé"}
Attendus et conseils : ${q.advice}
Réponse de l'étudiant : ${q.answer?.trim() || "(vide)"}`,
  )
  .join("\n\n")}`;

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return { feedback: content };
  });

export const reviewProjectiveCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        cvText: z.string().default(""),
        fileBase64: z.string().default(""),
        fileName: z.string().default("cv-projectif.pdf"),
        fileMimeType: z.string().default("application/pdf"),
        careerProject: z.string().default(""),
        careerDetails: z.string().default(""),
        schoolNotes: z.string().default(""),
        priorVerdict: z.enum(["Validé", "À perfectionner", "À retravailler"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!data.fileBase64 && tooThin([data.cvText], 40)) {
      return { feedback: NOT_WORKED_FEEDBACK };
    }
    const system = `Tu es un jury de SKEMA BS qui lit le CV PROJECTIF d'un candidat de CPGE : un CV où il raconte son parcours au sein de SKEMA puis dans les dix années suivant son diplôme, les éléments futurs se distinguant des éléments réels.

CONTEXTE ET EXIGENCES (issus de l'ouvrage « Les supports de l'entretien ») :
${PROJECTIVE_CV.intro}
${PROJECTIVE_CV.rules.map((r) => `- ${r}`).join("\n")}

${SUPPORT_RULES}

RÈGLE INTERNE DE COMPLÉTUDE : si le CV n'a pas au minimum un titre (poste dans 10 ans), des coordonnées projetées, une formation réelle ET une formation projetée nommée précisément, au moins trois expériences détaillées dont au moins une réelle et une projetée, et des langues, alors le verdict est "À retravailler" et tu dis clairement que le CV est encore insuffisamment travaillé, en listant ce qu'il faut ajouter avant de le resoumettre.

CALIBRAGE DE TES RETOURS : tu t'adresses à un étudiant de CPGE qui n'est PAS encore en école. Tu n'exiges jamais qu'il connaisse la vie interne de SKEMA, le nom d'un intervenant, d'un club confidentiel, d'un process interne ou d'un chiffre d'entreprise. Tu restes sur ce qu'un candidat peut réellement documenter : masters et campus publiés, échanges et doubles diplômes, secteurs, métiers, entreprises connues, associations affichées par l'école.

${data.priorVerdict ? `STABILITÉ DU VERDICT : ce CV identique a déjà été évalué « ${data.priorVerdict} ». Tu restructures uniquement le retour dans le nouveau format ci-dessous et tu conserves EXACTEMENT ce verdict.` : ""}

Réponds en français, en markdown simple, avec EXACTEMENT ces sections et rien d'autre.
## Verdict
Ligne 1 : "Validé", "À perfectionner" ou "À retravailler". Puis une synthèse développée, organisée en 4 puces catégorisées (une par catégorie, 2 à 3 phrases chacune, appuyées sur des éléments précis du CV) : "Forme et lisibilité - ...", "Cohérence du parcours - ...", "Précision et documentation - ...", "Ambition et international - ...".
Dérive le verdict ainsi :
- "Validé" : parcours cohérent et documenté, missions précises, mélange d'éléments réels et projetés, dimension internationale, cohérence campus/master/langues, titre et coordonnées projetés.
- "À perfectionner" : rien d'absent, mais des métiers sans missions, des choix insuffisamment justifiables, une progression trop rapide ou peu d'international.
- "À retravailler" : incohérence de parcours, absence d'expériences réelles, éléments impossibles à SKEMA, ou CV trop pauvre pour être défendu.
## Grille - Forme du CV
Un item par critère : "Titre du CV (poste en cours)", "Coordonnées projetées", "Lisibilité et distinction réel / projeté", "Français et rigueur". Format "Critère - Statut - Justification", puis "Exemple : ..." si le statut n'est pas "Validé".
## Grille - Parcours académique
Un item par critère : "Parcours SKEMA nommé précisément (campus, master, césures)", "Cohérence campus / master / associations", "Dimension internationale", "Respect de la structure réelle des études".
## Grille - Parcours professionnel
Un item par critère : "Missions précises sous chaque poste", "Progression crédible des postes", "Cohérence secteur / métier / personnalité", "Présence d'expériences réelles passées".
## Questions possibles du jury
Une seule liste de puces, sans sous-titre. Chaque puce commence par un tag entre crochets qui indique le type de question :
- "[Cohérence] " quand la question porte sur le « pourquoi » d'un élément du CV (choix de campus, de master, de césure, de poste, enchaînement du parcours, cohérence avec la personnalité et le projet).
- "[Connaissance] " quand la question porte sur ce qu'il faut savoir défendre sur un thème présenté (entreprise, secteur, métier, ville, pays, association, dispositif nommé dans le CV).
Format de chaque puce, sur deux lignes dans la même puce :
[Tag] « Question du jury » (guillemets français, question précise citant l'élément du CV)
Ce qu'il faut pouvoir répondre : 2 phrases - la logique à expliciter ou les connaissances à maîtriser, et ce qui rendrait la réponse crédible depuis la prépa.
Ne te limite pas : couvre TOUS les éléments réellement exposés du CV, au moins 5 puces "[Cohérence]" et au moins 4 puces "[Connaissance]", davantage si le CV le justifie. Alterne librement l'ordre mais garde les tags exacts.
N'utilise JAMAIS de tiret long (- uniquement).
Sois exigeant mais bienveillant, jamais générique.`;

    const userText = `Projet professionnel de l'étudiant : ${data.careerProject || "non renseigné"}

TRAVAIL DE L'ÉTUDIANT - MODULE 2 (projet professionnel) :
${data.careerDetails || "(vide)"}

TRAVAIL DE L'ÉTUDIANT - MODULE 3 (fiches écoles) :
${data.schoolNotes || "(vide)"}

CV PROJECTIF ${data.fileBase64 ? "(fourni en pièce jointe, et éventuellement saisi ci-dessous)" : "(saisi dans l'outil)"} :
${data.cvText || "(voir la pièce jointe)"}`;

    const content = await callGateway({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: data.fileBase64
            ? [
                { type: "text", text: userText },
                {
                  type: "file",
                  file: {
                    filename: data.fileName,
                    file_data: `data:${data.fileMimeType};base64,${data.fileBase64}`,
                  },
                },
              ]
            : userText,
        },
      ],
    });
    return { feedback: content };
  });
