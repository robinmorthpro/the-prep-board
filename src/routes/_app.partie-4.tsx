import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { EXPERIENCE_THEORY_SECTIONS } from "@/lib/theory";
import { MonthPicker, formatMonth } from "@/components/vivaldi/MonthPicker";
import { OralAnswer } from "@/components/vivaldi/OralAnswer";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { reviewExperience } from "@/lib/ai.functions";
import { downloadExperiencePdf } from "@/lib/experience-pdf";
import { AiFeedback } from "@/components/vivaldi/AiFeedback";
import { isSameInput, rememberInput } from "@/lib/feedback-cache";
import { useCareerProject, useExperiences, useProfile, useSchoolSheets, type Experience } from "@/lib/vivaldi-queries";
import { EMPTY_ANECDOTE, EXPERIENCE_CATEGORIES, KNOWLEDGE, type Anecdote } from "@/lib/vivaldi-data";
import { PartNav } from "@/components/vivaldi/PartNav";

function ReqLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-destructive"> *</span>
    </>
  );
}

type VerdictLevel = "Validé" | "À perfectionner" | "À retravailler";

function parseVerdict(feedback: string): VerdictLevel {
  const match = feedback.match(/## Verdict\n\s*(Validé|À perfectionner|À retravailler)/i);
  return (match?.[1] as VerdictLevel) ?? "À retravailler";
}

function verdictBadge(level: VerdictLevel) {
  if (level === "Validé") return <Badge className="bg-success text-success-foreground">Validé</Badge>;
  if (level === "À perfectionner") return <Badge className="bg-amber-500 text-white">À perfectionner</Badge>;
  return <Badge variant="destructive">À retravailler</Badge>;
}

function anecdoteMissingFields(a: Anecdote): string[] {
  const missing: string[] = [];
  if (!a.title?.trim()) missing.push("Titre");
  if (!a.detail?.trim()) missing.push("Détail");
  if (!a.learning?.trim()) missing.push("Apport");
  if (!a.link?.trim()) missing.push("Lien");
  return missing;
}

export const Route = createFileRoute("/_app/partie-4")({
  head: () => ({
    meta: [
      { title: "Module 3 - Mes expériences | The Prepboard" },
      { name: "description", content: "Listez vos expériences puis creusez contexte, récit et trois anecdotes, avec un jury IA." },
      { property: "og:title", content: "Je travaille mes expériences personnelles | The Prepboard" },
      { property: "og:description", content: "Transformez vos expériences en munitions d'entretien." },
    ],
  }),
  component: Part4,
});

function Part4() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: experiences = [] } = useExperiences(user?.id);
  const { data: career } = useCareerProject(user?.id);
  const { data: sheets = [] } = useSchoolSheets(user?.id);
  const { data: profile } = useProfile(user?.id);

  const careerDetails = career
    ? [
        ["Métier ou domaine visé", career.job_or_field],
        ["Intitulés de postes", career.job_names],
        ["Secteur", career.sector],
        ["Entreprises cibles", career.companies],
        ["Rôle en entreprise", career.company_role],
        ["Description", career.description],
        ["Qualités mobilisées", career.qualities],
        ["Actualités du secteur", career.news],
        ["Autres éléments", career.extra_info],
      ]
        .filter(([, v]) => (v ?? "").toString().trim())
        .map(([k, v]) => `- ${k} : ${v}`)
        .join("\n")
    : "";

  const schoolNotes = sheets
    .map((sh) => {
      const items = (sh.items ?? [])
        .filter((i) => i.name?.trim())
        .map((i) => `  - ${i.kind} « ${i.name} » : ${i.description || "(sans description)"} → pourquoi : ${i.why || "(non précisé)"}`)
        .join("\n");
      return `École ${sh.school}${sh.baseline ? ` (baseline : ${sh.baseline})` : ""}\n${items || "  - (aucun élément spécifique renseigné)"}`;
    })
    .join("\n\n");

  const targetSchools = [profile?.choice_1, profile?.choice_2, profile?.choice_3].filter(
    (s): s is string => Boolean(s && s.trim()),
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["experiences", user?.id] });

  const addExp = useMutation({
    mutationFn: async (category: string) => {
      const { error } = await supabase
        .from("experiences")
        .insert({ user_id: user!.id, category, name: "", start_date: "", end_date: "", anecdotes: [] });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const submitted = experiences.filter((e) => e.status === "submitted").length;

  return (
    <div>
      <PartNav prev="/partie-3" next="/partie-5" nextEnabled={Boolean(experiences.length > 0 && submitted / experiences.length >= 0.75)} nextMessage="Validez au moins 75 % de vos expériences (3 anecdotes chacune) pour continuer." className="mb-6" />
      <PartHeader
        step="Module 3"
        title="Mes expériences"
      >
        <div className="mt-4">
          <TheoryDialog
            title={KNOWLEDGE.experiences.title}
            intro="À quoi servent les expériences en entretien, comment les travailler, et ce que le jury attend quand il vous demande de raconter une expérience."
            sections={EXPERIENCE_THEORY_SECTIONS}
          />
        </div>
      </PartHeader>

      <Card className="mb-6 flex gap-3 border-accent/50 bg-secondary/50 p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent" />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            L'objectif de ce module est de détailler, à l'écrit ou à l'oral, l'ensemble de vos expériences
            personnelles, scolaires ou extra-scolaires, puis de faire ensuite le lien avec l'école ou votre projet
            professionnel. Appuyez-vous et faites donc des liens avec le travail effectué dans les deux sections
            précédentes.
          </p>
          <p>
            Avant de commencer, nous vous recommandons de consulter la rubrique « Consignes théoriques » pour comprendre
            les attentes.
          </p>
          <div>
            <p className="font-medium text-foreground">À savoir :</p>
            <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
              <li>
                Dans ce module, The Prepboard ne vérifie pas l'exactitude des informations que vous renseignez sur vous.
                Par définition, il n'était pas là lorsque vous avez vécu ces expériences. Il vous appartient de prendre
                le temps de faire avec soin le travail d'introspection nécessaire. C'est ainsi que vous progresserez et
                que vous saurez réellement ce que vous ont apporté vos expériences et comment elles rassureront le jury
                sur votre futur en école et/ou en entreprise.
              </li>
              <li>
                Vous avez la possibilité de faire tout ou partie de ce travail à l'oral. Ce n'est pas obligatoire,
                l'entraînement à l'oral viendra un petit peu plus tard.
              </li>
              <li>
                Une expérience est validée quand elle contient les informations générales + au moins 3 anecdotes
                travaillées. Pour valider une expérience, il vous faudra la faire valider par notre IA.
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {submitted} / {Math.max(experiences.length, 1)} expérience(s) validée(s)
          </span>
          <span className="text-muted-foreground">Au moins 3 requises pour travailler la section suivante</span>
        </div>
        <Progress value={Math.min(submitted / 3, 1) * 100} />
      </Card>

      <Card className="mb-6 space-y-3 p-6">
        <h2 className="text-2xl">Ajouter une expérience</h2>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_CATEGORIES.map((c) => (
            <Button
              key={c}
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => addExp.mutate(c)}
              disabled={addExp.isPending}
            >
              <Plus className="size-4" />
              {c}
            </Button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune expérience pour l'instant.</p>
        ) : (
          experiences.map((e) => (
            <ExperienceCard
              key={e.id}
              exp={e}
              careerLabel={career?.job_or_field ?? ""}
              careerDetails={careerDetails}
              schoolNotes={schoolNotes}
              schools={targetSchools}
              onChanged={invalidate}
            />
          ))
        )}
      </div>

      <PartNav prev="/partie-3" next="/partie-5" nextEnabled={Boolean(experiences.length > 0 && submitted / experiences.length >= 0.75)} nextMessage="Validez au moins 75 % de vos expériences (3 anecdotes chacune) pour continuer." className="mt-10" />
    </div>
  );
}

/** Exemples de rédaction attendue (5 à 10 lignes), affichés en placeholder du champ Contexte, par catégorie. */
const CONTEXT_PLACEHOLDERS: Record<string, string> = {
  "Expérience professionnelle ou bénévole": `Exemple de rédaction attendue :
En juin 2025, j'ai effectué un stage de trois semaines dans une agence immobilière de ma ville, une structure de six personnes, en binôme avec une négociatrice, du lundi au vendredi, environ 35 heures par semaine.
J'étais chargé de préparer les visites : je constituais les dossiers de biens, j'appelais les propriétaires pour vérifier les informations et j'accompagnais les visites de deux appartements.
Dès la fin de la première semaine, j'ai dû tenir seul l'accueil téléphonique un après-midi, alors que je n'avais jamais eu de client au téléphone.
J'ai compris que le métier reposait moins sur la technique que sur ma capacité à écouter et à rassurer, et que je devais apprendre à dire « je vais vérifier » plutôt qu'improviser une réponse.
À la fin du stage, j'ai rédigé deux annonces qui ont été publiées telles quelles, et je retiens surtout de cette expérience mon goût du contact client et mon exigence de fiabilité.`,
  Scolaire: `Exemple de rédaction attendue :
En première année de prépa ECG, j'ai travaillé de septembre à mars sur un projet collectif consacré à l'accès à l'eau potable, environ deux heures par semaine, avec deux camarades.
Je devais produire avec eux une note de synthèse et une présentation orale devant mes professeurs d'économie et de géopolitique, sans consigne détaillée sur la méthode.
Au bout de deux mois, mon plan a été jugé trop descriptif : j'ai dû tout reprendre à six semaines de l'échéance, alors que j'enchaînais les colles.
Ce recadrage a changé ma manière de travailler : j'ai appris à formuler une problématique avant de collecter mes données, et à répartir explicitement les rôles pour tenir un délai.
J'ai obtenu la meilleure note du groupe, et je retiens surtout ma capacité à accepter une critique de fond et à réorganiser un travail sous contrainte de temps.`,
  Sport: `Exemple de rédaction attendue :
J'ai joué au football en club pendant six ans, de mes 12 ans à mes 18 ans, au FC de ma ville, en équipe U18 : je m'entraînais le mardi et le jeudi soir et je jouais presque chaque samedi, soit environ huit heures par semaine en plus de mes cours.
J'évoluais dans un groupe d'une vingtaine de joueurs encadré par un entraîneur bénévole, avec un niveau très hétérogène et un vestiaire où les tensions étaient fréquentes.
En troisième année, j'ai reçu le brassard de capitaine alors que je n'étais pas le joueur le plus technique du groupe.
Ce rôle a changé mon rapport au collectif : j'ai appris à parler devant les autres, à gérer des désaccords après une défaite et à tenir mes engagements même les semaines de concours blancs.
Sur mes deux dernières saisons, j'ai contribué à faire passer l'équipe du milieu de tableau à la course à la montée, et je retiens ma capacité à faire avancer un groupe qui ne me devait rien.`,
  Voyage: `Exemple de rédaction attendue :
En août 2024, je suis parti seul trois semaines en Irlande pour un séjour linguistique, hébergé dans une famille d'accueil près de Galway, avec des cours le matin et des après-midi libres.
Je ne connaissais personne et mon anglais oral était très scolaire : je comprenais les textes mais je n'osais pas prendre la parole.
Au bout de la première semaine, j'ai accompagné le fils de la famille à un match de hurling avec ses amis, une journée entière sans repère et sans traduction possible.
Ce séjour a modifié mon rapport à la langue et à l'inconnu : j'ai compris que progresser passait par l'acceptation de mal dire les choses, et j'ai pris l'habitude de poser des questions plutôt que de rester en retrait.
Je suis rentré capable de tenir une conversation d'une heure en anglais, et je retiens une autonomie que je ne me connaissais pas.`,
  Association: `Exemple de rédaction attendue :
Depuis deux ans, je suis bénévole dans une association d'aide aux devoirs de mon quartier, tous les mercredis de 14h à 17h, auprès de deux collégiens de quatrième.
J'y intervenais avec une quinzaine d'autres bénévoles pour une quarantaine d'élèves, avec peu de moyens et un encadrement très léger.
En janvier de ma première année, l'un de mes élèves a arrêté de venir sans explication et j'ai été chargé de reprendre contact avec sa famille.
Cette situation a changé ma manière d'aider : j'ai compris que la difficulté scolaire était rarement seulement scolaire, et j'ai appris à adapter mes séances plutôt qu'à dérouler un programme.
Il est revenu et a validé son année, et je retiens ma patience et mon sens de l'engagement dans la durée.`,
  "Musique / Hobby": `Exemple de rédaction attendue :
Je pratique le piano depuis huit ans, d'abord au conservatoire de ma ville puis en cours particulier depuis mon entrée en prépa, à raison de quatre à cinq heures de travail personnel par semaine.
Je travaille seul l'essentiel du temps, je vois mon professeur une heure le samedi matin et je joue en public deux fois par an.
En 2024, je me suis inscrit à une audition avec une pièce nettement au-dessus de mon niveau, et j'ai dû jouer devant une soixantaine de personnes après trois mois de préparation.
Cette échéance a changé ma méthode de travail : j'ai appris à découper une difficulté en très petites étapes et à accepter de répéter longtemps un passage de quatre mesures.
J'ai joué la pièce en entier sans m'arrêter malgré deux erreurs, et je retiens ma rigueur et ma gestion du trac avant une prise de parole.`,
};

const NAME_PLACEHOLDERS: Record<string, string> = {
  "Expérience professionnelle ou bénévole": "Stage en agence immobilière",
  Scolaire: "Projet collectif de TIPE en première année",
  Sport: "Pratique du football en club",
  Voyage: "Séjour linguistique en Irlande",
  Association: "Bénévolat en aide aux devoirs",
  "Musique / Hobby": "Pratique du piano",
};

/** Placeholders d'anecdote cohérents avec l'exemple de contexte de chaque catégorie. */
const ANECDOTE_PLACEHOLDERS: Record<string, { title: string; detail: string; learning: string }> = {
  "Expérience professionnelle ou bénévole": {
    title: "Ex. : L'après-midi où j'ai tenu seul l'accueil téléphonique",
    detail:
      "Exemple : Le mercredi de ma deuxième semaine, la négociatrice est partie en rendez-vous et m'a laissé le téléphone de l'agence. J'ai reçu sept appels en deux heures, dont un propriétaire mécontent d'une visite annulée. Je ne connaissais pas le dossier : j'ai pris ses coordonnées, noté sa demande et je l'ai rappelé une heure plus tard avec la réponse exacte.",
    learning:
      "Exemple : J'ai appris à assumer de ne pas savoir et à rappeler avec une réponse fiable plutôt qu'à improviser. C'est ce qui me rend utile dans une relation client.",
  },
  Scolaire: {
    title: "Ex. : Le jour où mon plan a été jugé trop descriptif",
    detail:
      "Exemple : En novembre, mon professeur d'économie m'a dit devant le trinôme que mon plan n'était qu'une accumulation de faits. J'ai repris seul le week-end suivant la problématique, j'ai relu trois articles [citer une source] et j'ai proposé une nouvelle structure en deux axes que mes camarades ont validée le lundi.",
    learning:
      "Exemple : J'ai appris à poser une problématique avant de collecter des données, et à transformer une critique de fond en méthode de travail.",
  },
  Sport: {
    title: "Ex. : Le vestiaire à recadrer après la défaite de [citer un match]",
    detail:
      "Exemple : Un samedi de janvier, nous perdons 4-0 et deux joueurs s'accusent dans le vestiaire. Comme capitaine, j'ai demandé à l'entraîneur cinq minutes seul avec le groupe : j'ai rappelé ce qui avait manqué sur le terrain plutôt que de désigner un responsable, et j'ai proposé qu'on arrive quinze minutes plus tôt au prochain entraînement.",
    learning:
      "Exemple : J'ai appris à prendre la parole dans un moment de tension et à ramener un groupe sur des faits plutôt que sur des reproches.",
  },
  Voyage: {
    title: "Ex. : La journée au match de hurling sans repère",
    detail:
      "Exemple : Le samedi de ma première semaine, j'ai passé la journée avec le fils de ma famille d'accueil et cinq de ses amis à un match de hurling. Je ne comprenais ni les règles ni la moitié des phrases. J'ai choisi de poser des questions simples toute la journée plutôt que de rester silencieux, et je suis rentré capable de raconter le match au dîner.",
    learning:
      "Exemple : J'ai compris que je progressais en acceptant de mal dire les choses, et j'ai gagné en autonomie face à une situation inconnue.",
  },
  Association: {
    title: "Ex. : L'élève qui a arrêté de venir en janvier",
    detail:
      "Exemple : Après trois absences, la responsable m'a demandé d'appeler la famille de l'un de mes collégiens. J'ai découvert que ses horaires avaient changé. J'ai proposé de décaler notre séance d'une heure et de commencer par vingt minutes de méthode plutôt que par les exercices, et il est revenu chaque semaine jusqu'en juin.",
    learning:
      "Exemple : J'ai appris à chercher la cause réelle d'un décrochage et à adapter ma séance à la personne au lieu de dérouler mon programme.",
  },
  "Musique / Hobby": {
    title: "Ex. : L'audition de 2024 avec une pièce au-dessus de mon niveau",
    detail:
      "Exemple : En janvier, je me suis inscrit à l'audition avec [citer la pièce], que je ne jouais pas encore en entier. Pendant trois mois, j'ai travaillé quatre mesures par séance, en enregistrant chaque passage. Le jour venu, j'ai joué devant une soixantaine de personnes et j'ai enchaîné malgré deux fausses notes au deuxième mouvement.",
    learning:
      "Exemple : J'ai appris à découper une difficulté en très petites étapes et à gérer mon trac avant une prise de parole en public.",
  },
};

const DEFAULT_ANECDOTE_PLACEHOLDERS = {
  title: "Ex. : Le moment précis, daté, où j'ai dû agir",
  detail: "La mini-histoire, à la première personne : quand, avec qui, ce que j'ai fait concrètement, l'issue.",
  learning: "Ce que j'en retire sur moi : compétence, qualité, changement de méthode ou de regard.",
};

const LINK_PLACEHOLDERS: Record<string, string> = {
  "Expérience professionnelle ou bénévole":
    "En quoi ce que j'ai vécu ici confirme mon projet professionnel et ce que je viens chercher dans l'école ciblée.",
  Scolaire:
    "En quoi cette méthode de travail me servira dans le cursus de l'école ciblée et dans mon projet professionnel.",
  Sport:
    "En quoi cette expérience collective éclaire mon projet professionnel et le type d'école que je recherche (associations, esprit de promo…).",
  Voyage:
    "En quoi cette ouverture internationale rejoint mon projet professionnel et un élément concret de l'école ciblée (échange, campus, double diplôme…).",
  Association:
    "En quoi cet engagement rejoint mon projet professionnel et la vie associative de l'école ciblée.",
  "Musique / Hobby":
    "En quoi cette pratique dit quelque chose d'utile pour mon projet professionnel et pour ma place dans l'école ciblée.",
};

const DEFAULT_LINK_PLACEHOLDER =
  "En quoi cette anecdote éclaire mon projet professionnel et ce que je viens chercher dans l'école ciblée.";


function ExperienceCard({
  exp,
  careerLabel,
  careerDetails,
  schoolNotes,
  schools,
  onChanged,
}: {
  exp: Experience;
  careerLabel: string;
  careerDetails: string;
  schoolNotes: string;
  schools: string[];
  onChanged: () => void;
}) {
  const review = useServerFn(reviewExperience);
  const [open, setOpen] = useState(exp.status !== "submitted");
  const [f, setF] = useState(exp);
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>(exp.anecdotes ?? []);

  useEffect(() => {
    setF(exp);
    setAnecdotes(exp.anecdotes ?? []);
  }, [exp]);


  const persist = async (status?: string, feedback?: string) => {
    const { error } = await supabase
      .from("experiences")
      .update({
        category: f.category,
        name: f.name,
        start_date: f.start_date,
        end_date: f.end_date,
        context: f.context,
        story_title: f.story_title,
        story: f.story,
        anecdotes: anecdotes as unknown as never,
        ...(status ? { status } : {}),
        ...(feedback !== undefined ? { ai_feedback: feedback } : {}),
      })
      .eq("id", exp.id);
    if (error) throw error;
  };

  // Auto-enregistrement : 1,2 s après la dernière frappe, sans toast ni refetch.
  const snapshot = JSON.stringify({
    category: f.category,
    name: f.name,
    start_date: f.start_date,
    end_date: f.end_date,
    context: f.context,
    anecdotes,
  });
  const lastSaved = useRef(snapshot);
  useEffect(() => {
    if (snapshot === lastSaved.current) return;
    const t = setTimeout(() => {
      lastSaved.current = snapshot;
      persist().catch(() => undefined);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  useEffect(() => {
    lastSaved.current = JSON.stringify({
      category: exp.category,
      name: exp.name,
      start_date: exp.start_date,
      end_date: exp.end_date,
      context: exp.context,
      anecdotes: exp.anecdotes ?? [],
    });
  }, [exp]);

  const save = useMutation({
    mutationFn: () => persist(),
    onSuccess: () => {
      toast.success("Expérience enregistrée.");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewSignature = () => ({
    context: (f.context ?? "").trim(),
    anecdotes: anecdotes.map((a) =>
      [a.title, a.detail, a.learning, a.link].map((v) => (v ?? "").trim()).join("\u0001"),
    ),
    careerLabel: careerLabel.trim(),
    careerDetails: careerDetails.trim(),
    schoolNotes: schoolNotes.trim(),
  });

  const submit = useMutation({
    mutationFn: async () => {
      await persist("submitted");
      // Signature normalisée : même contenu = même signature, quel que soit l'ordre des clés en base.
      const payload = reviewSignature();
      if (isSameInput("experience", exp.id, payload, Boolean(exp.ai_feedback))) {
        return null;
      }
      const res = await review({
        data: {
          name: f.name,
          category: f.category,
          context: f.context,
          anecdotes,
          careerProject: careerLabel,
          careerDetails,
          schoolNotes,
          schools,
        },
      });
      await persist("submitted", res.feedback);
      rememberInput("experience", exp.id, payload);
      return res.feedback;
    },
    onSuccess: (result) => {
      toast.success(
        result === null
          ? "Votre réponse n'a pas changé : l'analyse du jury reste la même."
          : "Le jury IA a relu votre expérience.",
      );
      setOpen(false);
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markUnfinished = useMutation({
    mutationFn: () => persist("todo"),
    onSuccess: () => {
      setOpen(false);
      toast.message("Expérience marquée comme inachevée.");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("experiences").delete().eq("id", exp.id);
      if (error) throw error;
    },
    onSuccess: onChanged,
    onError: (e: Error) => toast.error(e.message),
  });

  const setAnec = (i: number, k: keyof Anecdote, v: string) =>
    setAnecdotes(anecdotes.map((a, idx) => (idx === i ? { ...a, [k]: v } : a)));

  const addAnecdote = () => setAnecdotes((prev) => [...prev, { ...EMPTY_ANECDOTE }]);
  const removeAnecdote = (i: number) => setAnecdotes((prev) => prev.filter((_, idx) => idx !== i));

  const completeAnecdotes = anecdotes.filter((a) => anecdoteMissingFields(a).length === 0).length;
  const anecdotesMinimumReached = completeAnecdotes >= 3;
  const anecdotesSectionLabel = anecdotesMinimumReached
    ? `${completeAnecdotes}/3 anecdotes complètes - minimum atteint`
    : `${completeAnecdotes}/3 anecdotes complètes - 3 requises pour valider`;

  // Récit validé par le jury IA et non remodifié depuis.
  const isValidated =
    exp.status === "submitted" &&
    Boolean(exp.ai_feedback) &&
    parseVerdict(exp.ai_feedback) === "Validé" &&
    isSameInput("experience", exp.id, reviewSignature(), true);


  return (
    <Card className="space-y-5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div
          className="min-w-0 cursor-pointer"
          onClick={() => setOpen((o) => !o)}
        >
          <h3 className="truncate text-2xl">{f.name?.trim() || "Nouvelle expérience"}</h3>

          <p className="text-xs text-muted-foreground">
            {exp.category} · {formatMonth(exp.start_date)} → {formatMonth(exp.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant={exp.status === "submitted" ? "default" : "outline"} className="gap-1">
            {exp.status === "submitted" ? <Check className="size-3" /> : null}
            {exp.status === "submitted" ? "Validée" : "Inachevée"}
          </Badge>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Réduire" : "Déplier"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => downloadExperiencePdf({ ...exp, ...f, anecdotes })}
          >
            <Download className="size-4" />
            PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => del.mutate()}
            disabled={del.isPending}
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {open ? (
        <>
          <section className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Informations générales</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`expname-${exp.id}`}>
                  <ReqLabel>Nom que je donne à l'expérience</ReqLabel>
                </Label>
                <Input
                  id={`expname-${exp.id}`}
                  value={f.name ?? ""}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                  placeholder={NAME_PLACEHOLDERS[f.category] ?? "Nom de l'expérience"}
                />
              </div>
              <div />
              <MonthPicker
                label={<ReqLabel>Date de début</ReqLabel>}
                value={f.start_date}
                onChange={(v) => setF({ ...f, start_date: v })}
              />
              <div className="space-y-1.5">
                <MonthPicker
                  label="Date de fin"
                  value={f.end_date}
                  onChange={(v) => setF({ ...f, end_date: v })}
                  disabled={!f.end_date}
                  minDate={f.start_date || undefined}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`ongoing-${exp.id}`}
                    checked={!f.end_date}
                    onCheckedChange={(checked) => {
                      if (checked === true) setF({ ...f, end_date: "" });
                    }}
                  />
                  <Label htmlFor={`ongoing-${exp.id}`} className="cursor-pointer font-normal">
                    Expérience toujours en cours
                  </Label>
                </div>
              </div>

            </div>

            <div className="space-y-1.5">
              <Label>
                <ReqLabel>Contexte (quoi, quand, où, avec qui, combien de temps) et récit général de l'expérience</ReqLabel>
                <span className="ml-1 text-xs text-muted-foreground">(5 à 10 lignes)</span>
              </Label>
              <Textarea
                rows={9}
                value={f.context}
                onChange={(e) => setF({ ...f, context: e.target.value })}
                placeholder={CONTEXT_PLACEHOLDERS[f.category] ?? CONTEXT_PLACEHOLDERS["Sport"]}
              />
              <OralAnswer
                label="Raconter le contexte et le récit à l'oral"
                onTranscript={(t) => setF((p) => ({ ...p, context: p.context ? `${p.context}\n${t}` : t }))}
              />
            </div>

          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Anecdotes</p>
              <Badge variant={anecdotesMinimumReached ? "default" : "secondary"} className="text-xs">
                {anecdotesSectionLabel}
              </Badge>
            </div>

            {anecdotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune anecdote pour l'instant. Ajoutez-en au moins 3.
              </p>
            ) : (
              <div className="space-y-4">
                {anecdotes.map((a, i) => (
                  <AnecdoteCard
                    key={i}
                    index={i}
                    fieldIdPrefix={`anecdote-${exp.id}-${i}`}
                    anecdote={a}
                    careerLabel={careerLabel}
                    category={f.category}
                    onChange={(k, v) => setAnec(i, k, v)}
                    onRemove={() => removeAnecdote(i)}
                  />
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" className="gap-1" onClick={addAnecdote}>
              <Plus className="size-4" />
              Ajouter une anecdote
            </Button>
          </section>


          {exp.ai_feedback ? (
            <Card className="border-accent/50 bg-secondary/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold">Retour du jury IA</p>
                {verdictBadge(parseVerdict(exp.ai_feedback))}
              </div>
              <AiFeedback text={exp.ai_feedback} />
              {isValidated ? null : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Vous pouvez améliorer maintenant, revenir plus tard (marquez l'expérience comme inachevée) ou poursuivre malgré ces
                  remarques.
                </p>
              )}
            </Card>
          ) : null}

          <div className="rounded-lg border-2 border-accent/40 bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => submit.mutate()} disabled={submit.isPending} className="gap-2">
                {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isValidated ? "Valider mon expérience" : "Soumettre mon expérience"}
              </Button>
              {isValidated ? null : (
                <Button variant="ghost" onClick={() => markUnfinished.mutate()} disabled={markUnfinished.isPending}>
                  Marquer comme inachevée
                </Button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}

const ANECDOTE_FIELD_LABELS: Record<"title" | "detail" | "learning" | "link", string> = {
  title: "Titre de l'anecdote",
  detail: "Détail de l'anecdote",
  learning: "Ce que ça m'a apporté / ce que ça dit de moi",
  link: "Lien avec l'école, l'entreprise ou mon projet pro",
};

function AnecdoteCard({
  index,
  fieldIdPrefix,
  anecdote,
  careerLabel,
  category,
  onChange,
  onRemove,
}: {
  index: number;
  fieldIdPrefix: string;
  anecdote: Anecdote;
  careerLabel: string;
  category: string;
  onChange: (k: keyof Anecdote, v: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [target, setTarget] = useState<"title" | "detail" | "learning" | "link">("detail");
  const gaps = anecdoteMissingFields(anecdote);
  const ph = ANECDOTE_PLACEHOLDERS[category] ?? DEFAULT_ANECDOTE_PLACEHOLDERS;

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className="flex min-w-0 cursor-pointer items-center gap-2"
          onClick={() => setOpen((o) => !o)}
        >
          <Badge variant="secondary">Anecdote {index + 1}</Badge>
          {anecdote.title?.trim() ? (
            <span className="truncate text-sm text-muted-foreground">{anecdote.title}</span>
          ) : null}
          {gaps.length > 0 ? (
            <Badge variant="outline" className="gap-1 text-destructive">
              <AlertTriangle className="size-3" />
              {gaps.length} champ{gaps.length > 1 ? "s" : ""} manquant{gaps.length > 1 ? "s" : ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Check className="size-3" />
              Complet
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {open ? "Réduire" : "Déplier"}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={onRemove}>
            <Trash2 className="size-4" />
            Retirer
          </Button>
        </div>
      </div>

      {open ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}-title`}>
              <ReqLabel>Titre de l'anecdote</ReqLabel>
            </Label>
            <Input
              id={`${fieldIdPrefix}-title`}
              placeholder={ph.title}
              value={anecdote.title ?? ""}
              onFocus={() => setTarget("title")}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}-detail`}>
              <ReqLabel>Détail de l'anecdote</ReqLabel>
            </Label>
            <Textarea
              id={`${fieldIdPrefix}-detail`}
              rows={3}
              placeholder={ph.detail}
              value={anecdote.detail}
              onFocus={() => setTarget("detail")}
              onChange={(e) => onChange("detail", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}-learning`}>
              <ReqLabel>Ce que ça m'a apporté / ce que ça dit de moi</ReqLabel>
            </Label>
            <Textarea
              id={`${fieldIdPrefix}-learning`}
              rows={2}
              placeholder={ph.learning}
              value={anecdote.learning}
              onFocus={() => setTarget("learning")}
              onChange={(e) => onChange("learning", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldIdPrefix}-link`}>
              <ReqLabel>Lien avec l'école, l'entreprise ou mon projet pro</ReqLabel>
            </Label>
            <Textarea
              id={`${fieldIdPrefix}-link`}
              rows={2}
              placeholder={
                careerLabel
                  ? `En quoi cette anecdote éclaire mon projet (${careerLabel}) et ce que je viens chercher dans l'école ciblée.`
                  : LINK_PLACEHOLDERS[category] ?? DEFAULT_LINK_PLACEHOLDER
              }
              value={anecdote.link}
              onFocus={() => setTarget("link")}
              onChange={(e) => onChange("link", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <OralAnswer
              label="Répondre à l'oral"
              onTranscript={(t) => {
                const current = (anecdote[target] ?? "") as string;
                onChange(target, current ? `${current}\n${t}` : t);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Sélectionner le champ auquel vous souhaitez répondre à l'oral - actuellement :{" "}
              <span className="font-medium text-foreground">{ANECDOTE_FIELD_LABELS[target]}</span>
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" className="gap-1" onClick={() => setOpen(false)}>
              <Check className="size-4" />
              Réduire
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
