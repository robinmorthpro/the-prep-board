/**
 * BANC D'ESSAI DE L'ÉTAPE 3.5
 *
 * Entretiens complets, en texte, face au VRAI agent ElevenLabs du jury, avec le
 * prompt, le premier message, les variables, les tirages (piles du jury), le
 * moteur de phases et la régie de l'application actuelle. Le candidat est joué
 * par Claude Sonnet 5. Chaque entretien est ensuite noté et rédigé par la vraie
 * chaîne (évaluateur puis rédacteur) avec deux modèles.
 *
 * Résultats : tables bench_runs et bench_results (admin seulement). Aucun
 * fichier de résultats n'est écrit dans le dépôt.
 *
 * Usage :
 *   bun scripts/jury-bench-run.ts --plan=pilote [--lot=pilote]
 *   bun scripts/jury-bench-run.ts --plan=principal|limites|stabilite --lot=<nom>
 * Reprise : relancer la même commande ; ce qui est « ok » n'est pas refait.
 *
 * ---------------------------------------------------------------------------
 * CE QUI EST RECOPIÉ DE `src/routes/_app.partie-8.tsx` (non exporté là-bas),
 * vérifié par empreinte dans src/lib/bench.test.ts (voir RECOPIES, bench-lib.ts) :
 *  1. variables du jury (bloc `agent.start`) ;
 *  2. Clermont : vérification et secours de la question Impact ;
 *  3. Clermont : axe repéré dans la réponse du candidat ;
 *  4. detectImpactAxis ;
 *  5. emlyon : consigne du tirage des cartes ;
 *  6. clôture (« bonne continuation ») et secours « main rendue sans question » ;
 *  7. EDHEC : fin de la présentation ;
 *  8. Montpellier : message envoyé au jury au clic sur une situation.
 * Tout le reste est importé de `src/`.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { PhaseEngine, REGIE_PREFIX, isRegieMessage, MONTPELLIER_PASSAGE_RE } from "../src/lib/phase-engine";
import {
  buildAnswerSendPlan,
  cleanJuryMessage,
  normalizeInterviewText,
  INVITATION_RE,
  CLERMONT_AXIS_OFFER_RE,
  isImposedQuestionAsked,
} from "../src/lib/interview-text";
import {
  CLASSIQUE_AGENT_ENV,
  EMLYON_CARDS_PHRASE,
  buildClermontImpactVariables,
  buildFirstMessage,
  difficultiesFor,
  getSchoolInterviewConfig,
  monologueMeasuresFor,
  phaseScheduleFor,
  promptFor,
  simulatedMinutes,
} from "../src/lib/school-interviews";
import { difficultyBlock } from "../src/lib/elevenlabs-agent-prompt";
import { pickGemPersona } from "../src/lib/gem-kb";
import { pickEssecSituationTiree } from "../src/lib/essec-kb";
import { drawEmlyonCards, emlyonCartesEtiquetees } from "../src/lib/emlyon-kb";
import { pickEdhecWord } from "../src/lib/edhec-kb";
import { drawKedgeCards } from "../src/lib/kedge-kb";
import { IMPACT_AXIS_LABEL, type ImpactAxis } from "../src/lib/esc-clermont-kb";
import { EmlyonCardsSilence } from "../src/lib/emlyon-trigger";
import { TBS_ARTICLES } from "../src/lib/tbs-articles";
import { INSEEC_IMAGES } from "../src/lib/inseec-kb";
import { drawMontpellierSituations } from "../src/lib/montpellier-kb";
import { supportForSchool, PROJECTIVE_CV, PROJECTIVE_CV_SCHOOL } from "../src/lib/supports-kb";
import { evaluerSession } from "../src/lib/evaluateur/run";
import { redigerFeedbackSession } from "../src/lib/redacteur/run";
import { callEvaluator, createRunIdFetch, type Message } from "../src/lib/evaluateur/gateway";
import { contextBlock } from "../src/lib/ai.functions";
import type { Tirages } from "../src/lib/tirages";
import {
  CANDIDAT_MODELE,
  CAS_LIMITES,
  MODELES_NOTATION,
  REPONSE_FERMEE_S,
  estQuestionFermee,
  fourchettePresentation,
  montpellierChoixMessage,
  type EntreeJournal,
  PROFIL_PAR_ECOLE,
  SCENARIO_NORMAL,
  coutJetons,
  dureeParoleMs,
  graineEcole,
  motsPourSecondes,
  pourCandidat,
  seeded,
  withSeed,
  type Jetons,
  type Jury,
  type Profil,
  type Scenario,
} from "./bench-lib";

// ------------------------------------------------------------------ réglages
const IDLE_MS = 3_500;
const TURN_TIMEOUT_MS = 90_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const db = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
  auth: { persistSession: false },
});

// ------------------------------------------- relevé des jetons de la passerelle
let poste = "autre";
const jetons: Record<string, Record<string, Jetons>> = {};
const noter = (modele: string, entree: number, sortie: number, reflexion = 0) => {
  const p = (jetons[poste] ??= {});
  const j = (p[modele] ??= { entree: 0, sortie: 0, appels: 0, reflexion: 0 });
  j.entree += entree;
  j.sortie += sortie;
  j.reflexion = (j.reflexion ?? 0) + reflexion;
  j.appels += 1;
};
const fetchOrigine = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const res = await fetchOrigine(input as never, init);
  const url = String(input instanceof Request ? input.url : input);
  if (!url.startsWith("https://ai.gateway.lovable.dev/") || !res.ok) return res;
  let modele = "?";
  try {
    modele = JSON.parse(String(init?.body ?? "{}")).model ?? "?";
  } catch {
    /* corps illisible */
  }
  const copie = res.clone();
  void (async () => {
    const texte = await copie.text();
    if (url.endsWith("/messages")) {
      const e = [...texte.matchAll(/"input_tokens":\s*(\d+)/g)].map((m) => Number(m[1]));
      const c = [...texte.matchAll(/"cache_read_input_tokens":\s*(\d+)/g)].map((m) => Number(m[1]));
      const s = [...texte.matchAll(/"output_tokens":\s*(\d+)/g)].map((m) => Number(m[1]));
      const r = [...texte.matchAll(/"thinking_tokens":\s*(\d+)/g)].map((m) => Number(m[1]));
      noter(modele, (e[0] ?? 0) + (c[0] ?? 0), s.length ? Math.max(...s) : 0, r.length ? Math.max(...r) : 0);
    } else {
      try {
        const u = JSON.parse(texte).usage ?? {};
        noter(modele, u.prompt_tokens ?? 0, u.completion_tokens ?? 0, u.completion_tokens_details?.reasoning_tokens ?? 0);
      } catch {
        noter(modele, 0, 0);
      }
    }
  })();
  return res;
}) as typeof fetch;

function totalJetons(p: string) {
  const out: Record<string, Jetons & { cout: number | null }> = {};
  for (const [m, j] of Object.entries(jetons[p] ?? {})) out[m] = { ...j, cout: coutJetons(m, j) };
  return out;
}

// --------------------------------------------------------------- profils
type ProfilDef = {
  niveau: Profil;
  prenom: string;
  nom: string;
  lycee: string;
  classe: string;
  experiences: { titre: string; dates: string; anecdotes: string }[];
  qualites: string;
  defauts: string;
  projet: string;
  ecole: string;
  actualite: string;
  comportement: string;
  duree_reponse_s: [number, number];
};
const PROFILS = (await Bun.file(new URL("./bench-profils.json", import.meta.url)).json()) as Record<Profil, ProfilDef>;

function ficheProfil(p: ProfilDef) {
  return [
    `Identité : ${p.prenom} ${p.nom}, ${p.classe}, ${p.lycee}.`,
    "Expériences :",
    ...p.experiences.map((e) => `- ${e.titre} (${e.dates}) : ${e.anecdotes}`),
    `Qualités : ${p.qualites}`,
    `Défauts : ${p.defauts}`,
    `Projet professionnel : ${p.projet}`,
    `Ce que tu sais de l'école : ${p.ecole}`,
    `Sujet d'actualité que tu suis : ${p.actualite}`,
  ].join("\n");
}

// ----------------------------------------------------- URL signée ElevenLabs
async function signedUrlFor(school: string) {
  const config = getSchoolInterviewConfig(school);
  const agentId = process.env[config.agentIdEnv] ?? process.env[CLASSIQUE_AGENT_ENV];
  const res = await fetchOrigine(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId ?? "")}`,
    { headers: { "xi-api-key": process.env["ELEVENLABS_API_KEY"] ?? "" } },
  );
  if (!res.ok) throw new Error(`URL signée ElevenLabs ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { signed_url: string }).signed_url;
}

async function creditsConversation(id: string | null) {
  if (!id) return null;
  for (let i = 0; i < 12; i++) {
    const res = await fetchOrigine(`https://api.elevenlabs.io/v1/convai/conversations/${id}`, {
      headers: { "xi-api-key": process.env["ELEVENLABS_API_KEY"] ?? "" },
    });
    if (res.ok) {
      const j = (await res.json()) as { status?: string; metadata?: { cost?: number; call_duration_secs?: number } };
      if (j.metadata?.cost != null && j.status !== "processing" && j.status !== "in-progress") return j.metadata.cost;
    }
    await sleep(5_000);
  }
  return null;
}

// ------------------------------------------------------------- le candidat
async function direCandidat(system: string, historique: Message[], cibleMots: number) {
  poste = "candidat";
  const f = createRunIdFetch();
  for (let essai = 0; essai < 2; essai++) {
    const consigne = `\n\n(Pour ta prochaine prise de parole : environ ${cibleMots} mots, à l'oral.)`;
    const msgs = historique.map((m, i) => (i === historique.length - 1 ? { ...m, content: m.content + consigne } : m));
    const brut = await callEvaluator(f, CANDIDAT_MODELE, system, msgs, undefined, { json: false });
    const texte = brut
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s*\n+\s*/g, " ")
      .replace(/^\(?[A-ZÉ][a-zé]+ ?:\s*/, "")
      .trim();
    const n = texte.split(/\s+/).length;
    if (essai === 0 && (n < cibleMots * 0.7 || n > cibleMots * 1.3) && cibleMots > 25) continue;
    return texte;
  }
  throw new Error("Candidat : réponse impossible.");
}

function systemeCandidat(p: ProfilDef, ecole: string, scenario: Scenario, document: string) {
  return `Tu es ${p.prenom} ${p.nom}, candidat(e) en ${p.classe}, à l'oral d'admission de ${ecole}. Tu passes un entretien face à un jury.

TON PROFIL (tu ne connais rien d'autre de toi-même) :
${ficheProfil(p)}
${document ? `\nLE DOCUMENT QUE TU AS REMIS À L'ÉCOLE :\n${document}\n` : ""}
TA FAÇON D'ÊTRE À L'ORAL : ${p.comportement}
${scenario.consigne ? `\nCONSIGNE PARTICULIÈRE POUR CET ENTRETIEN : ${scenario.consigne}\n` : ""}
RÈGLES :
- Tu parles comme à l'oral : phrases parlées, enchaînements naturels, quelques hésitations selon ton profil. Aucune mise en forme, aucune liste, aucun titre, aucune didascalie, aucun nom de locuteur.
- Tu ne sors jamais de ton rôle. Tu ne commentes jamais l'exercice.
- Tu n'inventes rien de précis sur l'école (noms de cours, de masters, d'associations, chiffres) au-delà de ce que ton profil te donne.
- Tu réponds à la dernière prise de parole du jury, y compris aux exercices et mises en situation.
- Tu respectes la longueur indiquée entre parenthèses à la fin du message du jury.`;
}

// ------------------------------------------------- documents des écoles
async function genererDocument(ecole: string, p: ProfilDef) {
  const config = getSchoolInterviewConfig(ecole);
  if (!config.support) return { label: "", texte: "" };
  poste = "document";
  const label = config.support.label;
  const f = createRunIdFetch();
  let consigne: string;
  if (ecole === PROJECTIVE_CV_SCHOOL) {
    consigne = `Rédige le CV projectif de ce candidat pour ${ecole}, section par section :\n${PROJECTIVE_CV.sections.map((s) => `- ${s}`).join("\n")}\nRègles : ${PROJECTIVE_CV.rules.join(" ")}`;
  } else {
    const s = supportForSchool(ecole);
    const qs = s?.questions ?? [];
    consigne = `Remplis le document « ${label} » de ${ecole} pour ce candidat. Réponds à chaque question, dans l'ordre, en recopiant son intitulé exact puis la réponse (longueur adaptée à l'espace indiqué) :\n${qs.map((q) => `- ${q.label}${q.space ? ` (espace : ${q.space})` : ""}`).join("\n")}`;
  }
  const texte = await callEvaluator(
    f,
    CANDIDAT_MODELE,
    `Tu es ce candidat et tu remplis toi-même ton document de candidature, en texte simple, sans markdown. Tu n'utilises que les faits de ton profil ; tu n'inventes aucun nom précis sur l'école.\n\nPROFIL :\n${ficheProfil(p)}`,
    [{ role: "user", content: consigne }],
    undefined,
    { json: false },
  );
  return { label, texte: texte.trim() };
}

// ---------------------------------------------------------- un entretien
type Plan = { lot: string; ecole: string; jury: Jury; profil: Profil; scenario: Scenario; graine: number };

async function jouerEntretien(plan: Plan, document: { label: string; texte: string }) {
  const { ecole: school, jury: variant, scenario } = plan;
  const config = getSchoolInterviewConfig(school);
  const profil = PROFILS[plan.profil];
  const rnd = seeded(plan.graine);
  const hasard = (a: number, b: number) => a + (b - a) * rnd();

  // Tirages (graine fixe) — mêmes fonctions que l'application.
  const d = withSeed(plan.graine, () => ({
    gemPersona: config.school === "GEM (Grenoble EM)" ? pickGemPersona() : "",
    essecTiree: config.school === "ESSEC" ? pickEssecSituationTiree() : null,
    emlyonDraw: config.school === "emlyon" ? drawEmlyonCards() : null,
    kedgeDraw: config.school === "KEDGE" ? drawKedgeCards() : null,
    edhecDraw: config.school === "EDHEC" ? pickEdhecWord() : null,
    clermontVariables: buildClermontImpactVariables(config.school),
    mbs: config.school === "Montpellier BS" ? drawMontpellierSituations() : null,
  }));
  const { gemPersona, essecTiree, emlyonDraw, kedgeDraw, edhecDraw, clermontVariables, mbs } = d;
  const essecSituation = essecTiree?.enonce ?? null;
  const chosenArticle = config.school === "TBS Education" ? TBS_ARTICLES[Math.floor(rnd() * TBS_ARTICLES.length)]! : null;
  const chosenImage = config.school === "INSEEC Grande École" ? INSEEC_IMAGES[Math.floor(rnd() * INSEEC_IMAGES.length)]! : null;
  const uploaded = chosenArticle
    ? {
        label: `${config.support?.label ?? "Article de presse"} — ${chosenArticle.title}`,
        text: `Titre : ${chosenArticle.title}\nSource : ${chosenArticle.source}\nDate : ${chosenArticle.date}\nURL : ${chosenArticle.url}\n\nRésumé : ${chosenArticle.summary}`,
      }
    : document.texte
      ? { label: document.label, text: document.texte }
      : null;
  const clermontQuestions: Record<ImpactAxis, string> = {
    people: clermontVariables.clermont_q_people,
    planet: clermontVariables.clermont_q_planet,
    profit: clermontVariables.clermont_q_profit,
  };
  let tirages: Tirages = {
    ...(emlyonDraw ? { emlyon_cartes: emlyonCartesEtiquetees(emlyonDraw) } : {}),
    ...(kedgeDraw
      ? {
          kedge_cartes: [
            { nom: "Trait d'Union", texte: kedgeDraw.odd },
            { nom: "Autoportrait", texte: kedgeDraw.autoportrait },
            { nom: "Trait d'Action", texte: kedgeDraw.action },
            { nom: "Trait de Pensée", texte: kedgeDraw.pensee },
            { nom: "Trait d'Esprit", texte: kedgeDraw.esprit },
          ],
        }
      : {}),
    ...(edhecDraw ? { edhec_mot: edhecDraw } : {}),
    ...(essecTiree ? { essec_situation: essecTiree } : {}),
    ...(chosenArticle ? { tbs_article: chosenArticle.title } : {}),
    ...(gemPersona ? { gem_personnage: gemPersona } : {}),
  };
  const context = { school: config.school, studentName: `${profil.prenom} ${profil.nom}` };
  const hasDifficulties = difficultiesFor(config).length > 0;

  // RECOPIE partie-8 : variables du jury (agent.start)
  const dynamicVariables: Record<string, string> = {
    school: context.school || "école non précisée",
    student_name: context.studentName || "le candidat",
    prepa: "",
    career_project: "",
    school_sheet: "",
    experiences: "",
    news_topics: "",
    support_text: uploaded?.text || "",
    difficulty_block: hasDifficulties ? difficultyBlock(variant) : "Entretien standard, jury neutre.",
    gem_persona: gemPersona,
    situation_enonce: essecSituation ?? "",
    inseec_image: chosenImage
      ? `Image choisie par le candidat pour se présenter : ${chosenImage.shortLabel}. Description : ${chosenImage.description}`
      : "",
    card_experience: emlyonDraw?.experience ?? "",
    card_personnalite: emlyonDraw?.personnalite ?? "",
    card_projet: emlyonDraw?.projet ?? "",
    card_creativite: emlyonDraw?.creativite ?? "",
    edhec_mot: edhecDraw ?? "",
    kedge_odd: kedgeDraw?.odd ?? "",
    kedge_autoportrait: kedgeDraw?.autoportrait ?? "",
    kedge_action: kedgeDraw?.action ?? "",
    kedge_pensee: kedgeDraw?.pensee ?? "",
    kedge_esprit: kedgeDraw?.esprit ?? "",
    ...clermontVariables,
  };
  const prompt = promptFor(config, variant);
  const firstMessage = buildFirstMessage(config, {
    firstName: profil.prenom,
    edhecWord: edhecDraw,
    articleTitle: chosenArticle?.title ?? null,
    inseecImage: chosenImage?.shortLabel ?? null,
  });
  const totalMinutes = simulatedMinutes(config);

  // Horloge virtuelle.
  const t0 = Date.parse("2026-01-06T09:00:00.000Z");
  let now = t0;
  const engine = new PhaseEngine({
    school,
    schedule: phaseScheduleFor(config) ?? [],
    monologues: monologueMeasuresFor(school),
    totalMinutes,
    startedAt: t0,
    variables: dynamicVariables,
  });

  type Turn = { question: string; answer: string; askedAt: string; answeredAt: string };
  const turns: Turn[] = [];
  let question = "";
  let askedAt = new Date(t0).toISOString();
  let answered = true;
  let juryCount = 0;
  let closed = false;
  let stopped = false;
  let lastMessageAt = 0;
  let mainRendu = 0;
  let handRescue: string | null = null;
  let nudgeSent = false;
  let edhecStage: "word" | "after" = "word";
  let edhecStarted = false;
  let clermontOffered = false;
  let clermontSent = false;
  let clermontAxis: ImpactAxis | null = null;
  let clermontRescueDone = false;
  let emlyonPresentationAsked = false;
  let emlyonArmed = false;
  let emlyonTriggered = false;
  let emlyonInstruction: string | null = null;
  const emlyonSilence = new EmlyonCardsSilence();
  let emlyonDue = false;
  const beforeQueue: string[] = [];
  const nudges: string[] = [];
  let conversationId: string | null = null;
  const historique: Message[] = [];
  let presentationFaite = false;
  // Journal ordonné, horloge simulée : consignes [RÉGIE], contextes et TOUS les messages du jury.
  const journal: EntreeJournal[] = [];
  const noterJournal = (type: EntreeJournal["type"], texte: string) => {
    journal.push({ t: new Date(now).toISOString(), type, texte });
  };
  // Montpellier : situations utilisées / situation en cours / grille affichée.
  const mbsUsed = new Set<string>();
  let mbsActive: { id: string; text: string } | null = null;
  let mbsGrille = false;
  let attentesVides = 0;

  const signedUrl = await signedUrlFor(school);
  const socket = new WebSocket(`${signedUrl}${signedUrl.includes("?") ? "&" : "?"}source=js_sdk&version=bench`);
  const send = (payload: unknown) => socket.send(JSON.stringify(payload));
  const sendNudge = (instruction: string) => {
    nudgeSent = true;
    nudges.push(instruction);
  };
  const startPhase = (id: string, label: string) => engine.markPhaseStart(id, now, label);
  const recordClermontImpact = (axis: ImpactAxis) => {
    tirages = { ...tirages, clermont_impact: { axe: IMPACT_AXIS_LABEL[axis], question: clermontQuestions[axis] } };
  };

  await new Promise<void>((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", () => reject(new Error("WebSocket en erreur à l'ouverture.")));
  });
  send({
    type: "conversation_initiation_client_data",
    conversation_config_override: {
      agent: { ...(prompt ? { prompt: { prompt } } : {}), first_message: firstMessage, language: "fr" },
      conversation: { text_only: true, max_duration_seconds: (totalMinutes + 10) * 60 },
    },
    dynamic_variables: dynamicVariables,
  });

  function handleJuryQuestion(text: string) {
    juryCount += 1;
    const normalized = normalizeInterviewText(text);
    handRescue = null;
    question = !answered && question ? `${question}\n${text}` : text;
    if (answered) askedAt = new Date(now).toISOString();
    answered = false;
    // RECOPIE partie-8 : EDHEC : fin de la présentation
    if (juryCount > 1 && /nous passons maintenant a l'entretien individuel/.test(normalized)) {
      edhecStage = "after";
      engine.markPhaseEnd("edhec-presentation", now);
    }
    if (config.school === "ESC Clermont BS" && CLERMONT_AXIS_OFFER_RE.test(normalized)) clermontOffered = true;
    // RECOPIE partie-8 : Clermont : vérification et secours de la question Impact
    if (config.school === "ESC Clermont BS" && !clermontRescueDone && juryCount > 1) {
      const detectedAxis = detectImpactAxis(normalized);
      const axis = clermontAxis ?? detectedAxis;
      if (axis) {
        if (detectedAxis && !clermontSent) {
          clermontSent = true;
          clermontAxis = detectedAxis;
          recordClermontImpact(detectedAxis);
          startPhase("clermont-impact", "Question Impact");
        }
        const q = clermontQuestions[axis];
        clermontRescueDone = true;
        if (q && !isImposedQuestionAsked(q, normalized)) {
          sendNudge(`Pose maintenant, mot pour mot, sans l'introduire ni la commenter, la question suivante : « ${q} »`);
        }
      }
    }
    if (config.school === "emlyon" && emlyonInstruction && juryCount > 1) {
      const instruction = emlyonInstruction;
      emlyonInstruction = null;
      if (!isImposedQuestionAsked(EMLYON_CARDS_PHRASE, normalized)) sendNudge(instruction);
    }
    if (config.school === "emlyon" && juryCount > 1 && /presentez-vous|presentation/.test(normalized)) emlyonPresentationAsked = true;
    if (config.school === "Montpellier BS" && MONTPELLIER_PASSAGE_RE.test(normalized)) mbsGrille = true;
    if (juryCount > 1 && /passer a une autre situation/.test(normalized) && mbsActive) {
      mbsUsed.add(mbsActive.id);
      mbsActive = null;
    }
    // RECOPIE partie-8 : clôture et secours « main rendue »
    if (juryCount > 1 && /bonne continuation/.test(normalized)) {
      if ((now - t0) / 1000 >= totalMinutes * 60 - 180 || engine.closingSent) {
        closed = true;
        return;
      }
    }
    const justNudged = nudgeSent;
    nudgeSent = false;
    const eligible =
      text.trim().length > 8 &&
      !text.includes("?") &&
      mainRendu < 3 &&
      juryCount > 1 &&
      !justNudged &&
      !INVITATION_RE.test(normalized) &&
      !(config.school === "EDHEC" && edhecStage !== "after") &&
      !(config.school === "GEM (Grenoble EM)" && turns.length === 0);
    if (eligible) {
      handRescue =
        "Tu viens de rendre la main sans poser de question. Pose immédiatement ta question suivante, en une phrase, sans revenir sur ce que tu as déjà dit.";
    }
  }

  // RECOPIE partie-8 : detectImpactAxis
  function detectImpactAxis(t: string, loose = false): ImpactAxis | null {
    if (!loose && !/l'axe retenu est/.test(t)) return null;
    if (t.includes("people")) return "people";
    if (t.includes("planet")) return "planet";
    if (t.includes("profit")) return "profit";
    return null;
  }

  // RECOPIE partie-8 : emlyon : consigne du tirage des cartes
  function triggerEmlyonCards() {
    emlyonTriggered = true;
    startPhase("emlyon-cartes", "Épreuve des 4 cartes");
    const instruction = `La présentation est terminée. Ta prochaine prise de parole commence par cette phrase et ne contient aucune autre question avant : « ${EMLYON_CARDS_PHRASE} », dite mot pour mot, puis énonce les quatre questions tirées (Expérience, Personnalité, Projet, Créativité) telles qu'elles figurent dans ta conduite, sans les reformuler, et laisse le candidat choisir son ordre en terminant par « Par quelle carte souhaitez-vous commencer ? ».`;
    emlyonInstruction = instruction;
    beforeQueue.push(instruction);
  }

  function handleCandidateAnswer(text: string) {
    turns.push({ question, answer: text, askedAt, answeredAt: new Date(now).toISOString() });
    answered = true;
    // RECOPIE partie-8 : Clermont : axe repéré dans la réponse du candidat
    if (config.school === "ESC Clermont BS" && clermontOffered && !clermontSent) {
      const axis = detectImpactAxis(normalizeInterviewText(text), true);
      if (axis) {
        clermontSent = true;
        clermontAxis = axis;
        recordClermontImpact(axis);
        startPhase("clermont-impact", "Question Impact");
      }
    }
    const answeredPresentation = emlyonPresentationAsked && /presentez-vous|presentation/.test(normalizeInterviewText(question));
    if (config.school === "emlyon" && !emlyonTriggered) {
      if (answeredPresentation || (!emlyonPresentationAsked && turns.length >= 2)) emlyonArmed = true;
      if (emlyonArmed) {
        // Mode écrit : 5 s de silence à partir de l'envoi, sur l'horloge virtuelle.
        // Mode écrit : 5 s de silence à partir de l'envoi (horloge virtuelle).
        emlyonSilence.answerEnded(now);
        emlyonDue = true;
      }
    }
  }

  socket.addEventListener("message", (event) => {
    const m = JSON.parse(String((event as MessageEvent).data)) as Record<string, any>;
    if (m["type"] === "ping") return send({ type: "pong", event_id: m["ping_event"]?.event_id });
    if (m["type"] === "error" || m["type"] === "client_error") console.log("    ElevenLabs :", JSON.stringify(m).slice(0, 300));
    if (m["type"] === "conversation_initiation_metadata") {
      conversationId = m["conversation_initiation_metadata_event"]?.conversation_id ?? null;
      return;
    }
    if (m["type"] !== "agent_response") return;
    const raw = m["agent_response_event"]?.agent_response as string | undefined;
    const text = raw ? cleanJuryMessage(raw).trim() : "";
    if (raw?.trim()) {
      noterJournal("jury", raw.trim());
      if (!text || isRegieMessage(text)) journal[journal.length - 1]!.statut = "filtre";
    }
    if (!text || isRegieMessage(text)) return;
    now += dureeParoleMs(text, 160);
    lastMessageAt = Date.now();
    for (const r of engine.onJuryMessage(text, now)) sendNudge(r);
    handleJuryQuestion(text);
    const visible = pourCandidat(text);
    if (visible) {
      const last = historique[historique.length - 1];
      if (last?.role === "user") last.content += `\n${visible}`;
      else historique.push({ role: "user", content: visible });
    }
  });

  async function waitForJury() {
    const deadline = Date.now() + TURN_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await sleep(400);
      if (socket.readyState > 1) return;
      if (lastMessageAt && Date.now() - lastMessageAt >= IDLE_MS) return;
    }
  }

  const systeme = systemeCandidat(profil, school, scenario, document.texte);
  const phaseMaxMin = totalMinutes + 10;
  while ((now - t0) / 60_000 <= phaseMaxMin && !closed && socket.readyState <= 1) {
    await waitForJury();
    if (closed || socket.readyState > 1) break;
    if (nudges.length) {
      const n = nudges.splice(0);
      for (const i of n) {
        noterJournal("regie", `${REGIE_PREFIX} ${i}`);
        send({ type: "user_message", text: `${REGIE_PREFIX} ${i}` });
      }
      lastMessageAt = 0;
      continue;
    }
    if (handRescue) {
      const i = handRescue;
      handRescue = null;
      mainRendu += 1;
      sendNudge(i);
      continue;
    }
    if (scenario.stopMinute && (now - t0) / 60_000 >= scenario.stopMinute) {
      stopped = true;
      break;
    }
    if (config.school === "EDHEC" && !edhecStarted && juryCount >= 1) {
      edhecStarted = true;
      now += 60_000;
      engine.markPhaseStart("edhec-presentation", now, "Présentation EDHEC");
    }
    if (!historique.length || historique[historique.length - 1]!.role !== "user") {
      lastMessageAt = 0;
      attentesVides += 1;
      console.log(`    … jury silencieux (${attentesVides})`);
      if (attentesVides >= 3) break;
      continue;
    }
    attentesVides = 0;
    // Longueur visée.
    const phase = engine.currentPhaseId;
    const demande = normalizeInterviewText(historique[historique.length - 1]!.content);
    let [a, b] = scenario.reponseS ?? profil.duree_reponse_s;
    const kedgeAutoportrait =
      school === "KEDGE" && !!kedgeDraw && (/autoportrait/.test(demande) || demande.includes(normalizeInterviewText(kedgeDraw.autoportrait).slice(0, 40)));
    const estPresentation =
      !presentationFaite &&
      (kedgeAutoportrait || (school !== "KEDGE" && /presentez|pitch|presentation|expose/.test(demande) && turns.length <= 2));
    if (estPresentation) {
      [a, b] = fourchettePresentation(school, Boolean(config.support), scenario.presentationS);
      presentationFaite = true;
    } else if (!scenario.reponseS && estQuestionFermee(demande)) {
      [a, b] = REPONSE_FERMEE_S;
    }
    // Montpellier : le candidat choisit une situation à l'écran (même message que le clic), puis la raconte.
    let mbsChoix: { id: string; text: string } | null = null;
    if (mbs && mbsGrille && !mbsActive && (now - t0) / 60_000 < 20) {
      const restantes = mbs.drawn.filter((x) => !mbsUsed.has(x.id));
      const offertes = restantes.length ? restantes : mbs.rest.filter((x) => !mbsUsed.has(x.id));
      if (offertes.length) {
        mbsChoix = offertes[Math.floor(rnd() * offertes.length)]!;
        mbsActive = mbsChoix;
        tirages = { ...tirages, montpellier_situations: [...(tirages.montpellier_situations ?? []), mbsChoix.text] };
        const last = historique[historique.length - 1]!;
        last.content += `\n(Tu as choisi à l'écran la situation : « ${mbsChoix.text} ». Annonce-la puis raconte-la.)`;
      }
    }
    if (phase === "clermont-impact" && scenario.impactS) [a, b] = [scenario.impactS * 0.8, scenario.impactS * 1.2];
    const answer = await direCandidat(systeme, historique, motsPourSecondes(hasard(a, b)));
    historique.push({ role: "assistant", content: answer });
    console.log(`    [${((now - t0) / 60000).toFixed(1)} min] jury : ${historique[historique.length - 2]!.content.slice(0, 90).replace(/\n/g, " ")} → candidat : ${answer.split(/\s+/).length} mots`);
    // Journal : le dernier message du jury reçoit la réponse, les précédents ont été fusionnés.
    const enAttente = journal.filter((e) => e.type === "jury" && !e.statut);
    enAttente.forEach((e, i) => (e.statut = i === enAttente.length - 1 ? "repondu" : "fusionne"));
    now += dureeParoleMs(answer);
    const updates = engine.onCandidateAnswer(answer, now);
    handleCandidateAnswer(answer);
    const plan = buildAnswerSendPlan({ before: beforeQueue.splice(0), answer, after: updates });
    if (mbsChoix) {
      // RECOPIE partie-8 : Montpellier : message au clic sur une situation
      const msg = montpellierChoixMessage(mbsChoix.text);
      noterJournal("contexte", msg);
      send({ type: "contextual_update", text: msg });
    }
    for (const s of plan.filter((x) => x.kind === "context")) {
      noterJournal("contexte", s.text);
      send({ type: "contextual_update", text: s.text });
    }
    await sleep(300);
    send({ type: "user_message", text: answer });
    if (emlyonDue) {
      emlyonDue = false;
      if (emlyonSilence.isDue(now + 5_000)) triggerEmlyonCards();
    }
    lastMessageAt = 0;
  }
  try {
    socket.close(1000, "fin du banc");
  } catch {
    /* déjà fermé */
  }
  // Messages du jury restés sans réponse (phrase de sortie finale, etc.).
  for (const e of journal) if (e.type === "jury" && !e.statut) e.statut = "sans_reponse";
  return {
    turns,
    journal,
    phase_timings: engine.timings,
    tirages,
    conversationId,
    statut: closed ? "ok" : stopped ? "interrompu" : "erreur",
    dureeSimuleeS: Math.round((now - t0) / 1000),
    sessionStatus: closed ? "done" : "stopped",
    supportLabel: uploaded?.label ?? "",
    supportText: uploaded?.text ?? "",
  };
}

// ---------------------------------------------------------- notation
async function noterRun(runId: string, run: Record<string, any>, modele: string, essai: number, avecRedaction: boolean) {
  const { data: deja } = await db.from("bench_results").select("id,status").eq("run_id", runId).eq("modele", modele).eq("essai_n", essai).maybeSingle();
  if (deja?.status === "ok" && !process.argv.includes("--force")) return;
  const p = PROFILS[run["profil"] as Profil];
  const session = {
    id: runId,
    user_id: "00000000-0000-0000-0000-000000000000",
    school: run["ecole"],
    status: run["statut"] === "ok" ? "done" : "stopped",
    difficulty: run["jury"],
    turns: run["turns"],
    phase_timings: run["phase_timings"],
    support_label: run["support_label"],
    support_text: run["document"],
    inseec_image: "",
    tirages: run["tirages"],
  };
  const pe = `eval:${runId}:${modele}:${essai}`;
  poste = pe;
  const erreurs: string[] = [];
  const ev = await evaluerSession(session, { model: modele, triggeredBy: "bench" });
  await sleep(1500);
  let feedback = "";
  let retirees: unknown[] = [];
  let dureeRed = 0;
  const pr = `red:${runId}:${modele}:${essai}`;
  if (avecRedaction && ev.status === "ok") {
    poste = pr;
    try {
      const contexte = contextBlock({
        school: run["ecole"],
        studentName: `${p.prenom} ${p.nom}`,
        prepa: p.classe,
        careerProject: p.projet,
        schoolSheet: p.ecole,
        experiences: p.experiences.map((e) => `${e.titre} (${e.dates}) : ${e.anecdotes}`).join("\n"),
        newsTopics: p.actualite,
      });
      const r = await redigerFeedbackSession(session, { ...ev, id: crypto.randomUUID() } as never, contexte, { model: modele });
      feedback = r.debrief;
      retirees = r.citations_retirees;
      dureeRed = r.duration_ms;
    } catch (e) {
      erreurs.push(`Rédacteur : ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(1500);
  }
  const je = totalJetons(pe);
  const jr = totalJetons(pr);
  const cout = [...Object.values(je), ...Object.values(jr)].reduce((s, j) => s + (j.cout ?? 0), 0);
  const row = {
    run_id: runId,
    modele,
    essai_n: essai,
    status: ev.status === "ok" && (!avecRedaction || feedback) ? "ok" : ev.status === "ok" ? "redaction_echec" : ev.status,
    attempts: ev.attempts,
    evaluation_brute: ev.raw_output as never,
    evaluation_texte: ev.raw_text,
    case_points: ev.case_points as never,
    criterion_points: ev.criterion_points as never,
    unrated_criteria: ev.unrated_criteria as never,
    penalties: ev.penalties as never,
    warnings: ev.warnings as never,
    score_20: ev.score_20,
    final_score: ev.final_score,
    percentile: ev.percentile,
    feedback,
    citations_retirees: retirees as never,
    duree_eval_ms: ev.duration_ms,
    duree_redaction_ms: dureeRed,
    jetons: { evaluation: je, redaction: jr } as never,
    cout_estime: cout,
    erreurs: [...ev.errors, ...erreurs] as never,
  };
  const { error } = await db.from("bench_results").upsert(row, { onConflict: "run_id,modele,essai_n" });
  if (error) throw new Error(`bench_results : ${error.message}`);
  console.log(`  notation ${modele} #${essai} : ${row.status}, ${row.final_score ?? "—"}/20, P${row.percentile ?? "—"}, ${(ev.duration_ms / 1000).toFixed(0)} s + ${(dureeRed / 1000).toFixed(0)} s, ~${cout.toFixed(3)} $`);
}

// ---------------------------------------------------------- un plan
async function executer(plan: Plan, docCache: Map<string, { label: string; texte: string }>) {
  const cle = { lot: plan.lot, ecole: plan.ecole, jury: plan.jury, scenario: plan.scenario.id, graine: plan.graine };
  const { data: existant } = await db.from("bench_runs").select("*").match(cle).maybeSingle();
  let run = existant as Record<string, any> | null;
  if (!run || (run["statut"] !== "ok" && run["statut"] !== "interrompu")) {
    const docKey = `${plan.ecole}|${plan.profil}`;
    let doc = docCache.get(docKey);
    if (!doc) {
      doc = await genererDocument(plan.ecole, PROFILS[plan.profil]);
      docCache.set(docKey, doc);
    }
    const base = { ...cle, profil: plan.profil, statut: "en_cours", document: doc.texte, support_label: doc.label };
    const { data: ins, error } = await db.from("bench_runs").upsert(base, { onConflict: "lot,ecole,jury,scenario,graine" }).select("*").single();
    if (error) throw new Error(`bench_runs : ${error.message}`);
    const debut = Date.now();
    poste = `cand:${ins.id}`;
    const erreurs: string[] = [];
    let r: Awaited<ReturnType<typeof jouerEntretien>> | null = null;
    try {
      r = await jouerEntretien(plan, doc);
    } catch (e) {
      erreurs.push(e instanceof Error ? e.message : String(e));
    }
    jetons[`cand:${ins.id}`] = { ...(jetons["candidat"] ?? {}) };
    const jc = totalJetons("candidat");
    delete jetons["candidat"];
    const credits = await creditsConversation(r?.conversationId ?? null);
    const maj = {
      turns: (r?.turns ?? []) as never,
      journal: (r?.journal ?? []) as never,
      phase_timings: (r?.phase_timings ?? []) as never,
      tirages: (r?.tirages ?? {}) as never,
      document: r?.supportText ?? doc.texte,
      support_label: r?.supportLabel ?? doc.label,
      conversation_id: r?.conversationId ?? null,
      duree_ms: Date.now() - debut,
      duree_simulee_s: r?.dureeSimuleeS ?? 0,
      cout_jury_credits: credits,
      cout_candidat_estime: Object.values(jc).reduce((s, j) => s + (j.cout ?? 0), 0),
      jetons_candidat: jc as never,
      statut: erreurs.length ? "erreur" : r!.statut,
      erreurs: [...erreurs, ...(r && r.statut === "erreur" ? ["Entretien non clos par le jury."] : [])] as never,
    };
    const { data: fin, error: e2 } = await db.from("bench_runs").update(maj).eq("id", ins.id).select("*").single();
    if (e2) throw new Error(`bench_runs : ${e2.message}`);
    run = fin;
    console.log(`${plan.ecole} / ${plan.jury} : ${maj.statut}, ${maj.turns.length} réponses, ${Math.round(maj.duree_simulee_s / 60)} min simulées, ${(maj.duree_ms / 60000).toFixed(1)} min réelles, ${credits ?? "?"} crédits, candidat ~${maj.cout_candidat_estime.toFixed(3)} $`);
  }
  if (!run || run["statut"] === "erreur") return;
  return run;
}

// ---------------------------------------------------------- lancement
const quel = arg("plan") ?? "pilote";
const lot = arg("lot") ?? quel;
const plans: Plan[] = [];
const juries: Jury[] = ["classique", "classique_dur"];
if (quel === "pilote") {
  for (const jury of juries) plans.push({ lot, ecole: "ESC Clermont BS", jury, profil: "bon", scenario: SCENARIO_NORMAL, graine: graineEcole("ESC Clermont BS", 1) });
} else if (quel === "principal") {
  for (const [ecole, profil] of Object.entries(PROFIL_PAR_ECOLE))
    for (const jury of juries) plans.push({ lot, ecole, jury, profil, scenario: SCENARIO_NORMAL, graine: graineEcole(ecole, 1) });
} else if (quel === "limites") {
  for (const c of CAS_LIMITES) plans.push({ lot, ecole: c.ecole, jury: c.jury, profil: c.profil, scenario: c.scenario, graine: graineEcole(c.ecole, c.graine) });
}

if (quel === "renoter") {
  // Rejoue la notation (évaluateur + rédacteur) d'un lot existant pour un seul modèle.
  const modeles = arg("modele") ? [arg("modele")!] : [...MODELES_NOTATION];
  const { data: runs } = await db.from("bench_runs").select("*").eq("lot", arg("source") ?? "pilote").order("created_at");
  for (const r of runs ?? []) {
    console.log(`${r.ecole} / ${r.jury}`);
    for (const modele of modeles) await noterRun(r.id, r, modele, 1, true);
  }
} else if (quel === "journal") {
  // Reconstitue le journal d'entretiens déjà joués à partir de la transcription ElevenLabs.
  // Horloge simulée approchée : chaque message est daté par le tour enregistré qu'il précède ou suit.
  const { data: runs } = await db.from("bench_runs").select("*").eq("lot", arg("source") ?? "pilote");
  for (const r of runs ?? []) {
    if (!r.conversation_id) continue;
    const res = await fetchOrigine(`https://api.elevenlabs.io/v1/convai/conversations/${r.conversation_id}`, {
      headers: { "xi-api-key": process.env["ELEVENLABS_API_KEY"] ?? "" },
    });
    if (!res.ok) {
      console.log(`${r.ecole} / ${r.jury} : transcription indisponible (${res.status})`);
      continue;
    }
    const conv = (await res.json()) as { transcript?: { role: string; message?: string | null }[] };
    const turns = (r.turns ?? []) as { answer: string; askedAt: string; answeredAt: string }[];
    const debut = turns[0]?.askedAt ?? r.created_at;
    let k = 0;
    let t = debut;
    const journal: EntreeJournal[] = [];
    for (const m of conv.transcript ?? []) {
      const texte = (m.message ?? "").trim();
      if (!texte) continue;
      if (m.role === "agent") {
        journal.push({ t: turns[k]?.askedAt && k < turns.length ? (t > turns[k]!.askedAt ? t : turns[k]!.askedAt) : t, type: "jury", texte });
      } else if (texte.startsWith(REGIE_PREFIX)) {
        journal.push({ t, type: "regie", texte });
      } else {
        const enAttente = journal.filter((e) => e.type === "jury" && !e.statut);
        enAttente.forEach((e, i) => (e.statut = i === enAttente.length - 1 ? "repondu" : "fusionne"));
        t = turns[k]?.answeredAt ?? t;
        k += 1;
      }
    }
    for (const e of journal) if (e.type === "jury" && !e.statut) e.statut = "sans_reponse";
    const { error } = await db.from("bench_runs").update({ journal: journal as never }).eq("id", r.id);
    console.log(`${r.ecole} / ${r.jury} : ${error ? error.message : `${journal.length} entrées (${journal.filter((e) => e.type === "regie").length} régie, ${journal.filter((e) => e.type === "jury").length} jury), ${k}/${turns.length} réponses retrouvées`}`);
  }
} else if (quel === "stabilite") {
  const source = arg("source") ?? "principal";
  const { data: runs } = await db.from("bench_runs").select("*").eq("lot", source).eq("statut", "ok").order("created_at");
  const vus = new Set<string>();
  const choisis = (runs ?? []).filter((r) => !vus.has(r.ecole) && vus.add(r.ecole)).slice(0, 10);
  for (const r of choisis) for (const m of MODELES_NOTATION) for (const n of [2, 3, 4]) await noterRun(r.id, r, m, n, false);
} else {
  const docs = new Map<string, { label: string; texte: string }>();
  for (const p of plans) {
    const run = await executer(p, docs);
    if (run) for (const m of MODELES_NOTATION) await noterRun(run["id"], run, m, 1, true);
  }
}
console.log("Banc terminé.");
