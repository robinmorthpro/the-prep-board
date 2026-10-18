import type { SchoolInterviewConfig } from "@/lib/school-interviews";

type Step = { label: string; detail: string; duration?: string };
type Brief = { steps: Step[]; note?: string; durationLabel?: string };
const classic: Step = { label: "Entretien classique", detail: "Présentez-vous, puis échangez avec le jury sur votre parcours, vos expériences, votre projet professionnel et vos motivations pour l’école." };
const documentBrief = (label: string, detail: string): Brief => ({ steps: [
  { label: "Présentation", detail: "Présentez votre parcours et les éléments que vous souhaitez mettre en avant." },
  { label, detail },
] });

const BRIEFS: Record<string, Brief> = {
  ESSEC: { steps: [
    { label: "Présentation", duration: "3 min à 5 min 30", detail: "Présentez-vous devant le jury." },
    { label: "Entretien classique", detail: "Un échange libre avec le jury pour approfondir votre parcours, votre personnalité et vos motivations." },
    { label: "Mise en situation", duration: "À la 35e minute", detail: "Proposez une solution et défendez votre raisonnement face aux relances du jury." },
  ] },
  ESCP: documentBrief("Entretien classique appuyé sur le questionnaire", "Le jury approfondit vos expériences, vos centres d’intérêt et ce que vous en avez retiré, à partir de vos réponses écrites."),
  NEOMA: documentBrief("Entretien classique appuyé sur le questionnaire", "Vos réponses écrites servent de point de départ. Le jury les approfondit et aborde aussi les thèmes qui n’y figurent pas."),
  "EM Strasbourg": { steps: [
    { label: "Pitch sur une réussite", duration: "Environ 3 min", detail: "Présentez un succès personnel dont vous êtes fier ou fière." },
    { label: "Entretien classique appuyé sur la cartographie", detail: "Expliquez vos choix de cours, d’associations, de destinations et d’entreprises au fil du programme." },
  ], note: "Le découpage des temps est indicatif." },
  "EM Normandie": documentBrief("Entretien classique appuyé sur le dossier", "Le jury approfondit vos réponses au dossier de motivation, y compris celle rédigée en anglais."),
  "BSB (Burgundy School of Business)": documentBrief("Entretien classique appuyé sur le Student’s Path", "Votre document oriente environ 80 % des questions. Le jury peut approfondir chacun des éléments que vous y avez inscrits."),
  SKEMA: documentBrief("Entretien classique appuyé sur le CV projectif", "Justifiez la cohérence de votre parcours imaginé, du premier stage au poste envisagé dans dix ans."),
  EDHEC: { steps: [
    { label: "Présentation à partir d’un mot", duration: "1 min + 4 min", detail: "Un mot est tiré au sort. Préparez votre présentation, puis développez-la devant un jury silencieux." },
    { label: "Entretien classique", duration: "20 min", detail: "Échange sur votre personnalité, vos motivations et votre connaissance de l’EDHEC, sans retour sur l’exercice collectif." },
  ], note: "L’exercice collectif de l’épreuve réelle n’est pas simulé ici." },
  emlyon: { steps: [
    { label: "Présentation courte", duration: "Environ 1 min", detail: "Présentez-vous." },
    { label: "Les quatre cartes", duration: "Environ 15 min", detail: "Une question par thème : Expérience, Personnalité, Projet et Créativité. Choisissez l’ordre de vos réponses." },
    { label: "Entretien classique", duration: "Environ 8 à 10 min", detail: "Poursuivez par un échange libre avec le jury." },
  ], durationLabel: "Environ 30 minutes" },
  "GEM (Grenoble EM)": { steps: [
    { label: "Exposé et rebond", duration: "5 min + 2 min", detail: "Présentez un sujet d’actualité choisi et préparé en amont. Le jury l’approfondit ensuite." },
    { label: "Interview inversée", duration: "9 min + 1 min", detail: "Interrogez un membre du jury, puis faites une synthèse." },
    { label: "Entretien classique", duration: "15 min", detail: "Échange, avec une courte présentation, sur votre parcours, vos motivations et votre projet." },
  ], durationLabel: "Environ 30 minutes" },
  KEDGE: { steps: [
    { label: "Lancement et tirage des cartes", detail: "Cinq cartes sont tirées : Trait d’Union (un ODD, fil conducteur), Autoportrait, Trait d’Action, Trait de Pensée et Trait d’Esprit." },
    { label: "Présentation Autoportrait", duration: "Environ 3 min", detail: "Présentez votre parcours en vous appuyant sur le mot tiré." },
    { label: "Cartes et entretien classique", detail: "Choisissez l’ordre des cartes Action, Pensée et Esprit. Chacune ouvre un échange qui peut approfondir vos expériences, votre projet et votre connaissance de KEDGE. Gardez l’ODD comme fil conducteur." },
    { label: "Conclusion", detail: "Répondez à la question de clôture du jury avant de terminer l’entretien." },
  ] },
  "TBS Education": { steps: [
    { label: "Avis sur l’article", duration: "5 min", detail: "Présentez un avis personnel argumenté sur l’article choisi et préparé en amont." },
    { label: "Entretien classique", duration: "Environ 15 min", detail: "Présentez-vous, puis échangez sur votre parcours, votre personnalité, votre projet et l’école." },
  ] },
  "ESC Clermont BS": { steps: [
    { label: "Pitch", duration: "2 min", detail: "Présentez-vous et ouvrez les sujets que vous souhaitez approfondir." },
    { label: "Question Impact", duration: "Environ 5 min", detail: "Choisissez à l’oral People, Planet ou Profit. Une question vous est alors proposée : répondez sans préparation, puis échangez avec le jury. Votre réponse et l’échange se partagent ce temps." },
    { label: "Entretien classique", duration: "18 min", detail: "Échange sur votre parcours, votre personnalité, votre projet et l’école." },
  ] },
  "Montpellier BS": { steps: [
    { label: "Présentation courte", duration: "1 à 2 min", detail: "Présentez votre identité et votre parcours." },
    { label: "Situations et expériences vécues", detail: "Choisissez parmi les 15 situations proposées à l’écran et racontez une expérience personnelle. Le jury l’approfondit, puis vous passez à une autre situation. Comptez généralement 2 à 4 situations." },
    { label: "Question d’actualité finale", detail: "L’entretien se termine par une question d’actualité." },
  ], note: "Ce format évalue vos compétences comportementales : ni le projet professionnel ni la connaissance de l’école ne sont interrogés." },
  "INSEEC Grande École": { steps: [
    { label: "Présentation à partir d’une image", duration: "5 min", detail: "Reliez l’image choisie à une expérience vécue : ce que vous avez fait, ce que cela révèle de vous et où cela vous servira." },
    { label: "Entretien classique", duration: "20 min", detail: "Échange sur vos motivations, votre ouverture d’esprit, votre connaissance de l’école et votre projet." },
  ], durationLabel: "Environ 25 minutes" },
  Audencia: { steps: [classic], note: "La phase collective Regards Croisés n’est pas simulée ici." },
  "ICN Business School": { steps: [classic], note: "L’exercice LEGO® Serious Play n’est pas simulé ici." },
  "Brest Business School": { steps: [classic], note: "L’exercice collectif n’est pas simulé ici." },
  "IMT-BS": { steps: [classic], note: "L’oral collectif n’est pas simulé ici." },
};

/** Display only: do not use these labels to drive interview phases. */
export function interviewBrief(config: SchoolInterviewConfig): Brief & { minutes: number } {
  return { ...(BRIEFS[config.school] ?? { steps: [classic] }), minutes: config.durationSeconds / 60 };
}

/** Écoles dont le support se prépare dans le module 5 « Mes supports d'entretien » (/partie-6). */
const SUPPORT_MODULE_SCHOOLS = new Set([
  "ESCP",
  "NEOMA",
  "EM Strasbourg",
  "EM Normandie",
  "BSB (Burgundy School of Business)",
  "SKEMA",
]);

/**
 * Ligne unique affichée à la place du simple nom du support : le nom du support,
 * puis le module où il se prépare. Null quand le support ne se prépare pas ici.
 */
export function supportModuleMention(config: SchoolInterviewConfig): string | null {
  if (!config.support || !SUPPORT_MODULE_SCHOOLS.has(config.school)) return null;
  return `${config.support.label} — ce support est travaillé au module « Mes supports d’entretien »`;
}

export function briefSupportInstructions(config: SchoolInterviewConfig): string {
  const instructions: Record<string, string> = {
    ESCP: "Répondez aux six questions ci-dessous, puis déposez votre document. Le jury s’appuiera sur vos réponses pendant l’entretien.",
    NEOMA: "Répondez aux six questions ci-dessous en respectant la limite de 400 caractères par réponse, puis déposez votre questionnaire.",
    "EM Strasbourg": "Complétez votre cartographie de projection dans le programme, puis déposez-la. Chaque cours, association, destination ou entreprise nommé pourra être approfondi par le jury.",
    "EM Normandie": "Complétez les huit questions du dossier, dont celle en anglais, puis déposez votre document. Le jury pourra approfondir chacune de vos réponses.",
    SKEMA: "Construisez votre CV projectif jusqu’à dix ans, puis déposez-le. Préparez-vous à justifier les formations, expériences et postes imaginés.",
    "TBS Education": "Choisissez un article dans la liste ci-dessous, lisez-le et préparez un avis argumenté avant de démarrer. Cette liste sert à l’entraînement : TBS fournira sa propre sélection officielle aux candidats admissibles.",
  };
  return instructions[config.school] ?? config.support?.instructions ?? "";
}
