// Route temporaire de capture (étape 7) : aperçu du débrief avec les données
// d'exemple de la maquette. Supprimée après les captures.
import { createFileRoute } from "@tanstack/react-router";
import { DebriefHeader, InterviewDebrief, InterviewTranscript } from "@/components/vivaldi/InterviewDebrief";
import { schoolLogo } from "@/lib/school-logos";

export const Route = createFileRoute("/apercu-debrief-tmp")({
  head: () => ({
    meta: [{ title: "Aperçu temporaire - Débrief | The Prepboard" }],
  }),
  component: ApercuDebrief,
});

const SAMPLE = `## Feedback général
- Le jury retient de vous un candidat structuré, méthodique et particulièrement mature dans la définition de son projet professionnel.
- Vos deux forces majeures sont la précision chirurgicale de vos anecdotes de terrain (l'expérimentation chronométrée aux Restos du Cœur, l'analyse vidéo au handball) et votre maîtrise technique du secteur de la logistique durable.
- Le point qui vous pénalise le plus est le format de votre présentation initiale, beaucoup trop brève pour le standard de l'ESSEC qui attend un développement de 3 à 5 minutes 30.
- Enfin, vous possédez une réelle capacité d'organisation collective et d'arbitrage que vous auriez pu valoriser davantage en illustrant concrètement vos engagements scolaires ou associatifs de prépa.
- **Déjà en place, à ne pas perdre :** une capacité remarquable à illustrer vos compétences par des faits précis, chiffrés et vérifiables sur le terrain.

## À retravailler en priorité
1. Calibrer la présentation initiale pour atteindre au minimum 3 minutes 30 : développez vos expériences et détaillez vos motivations pour l'ESSEC.
2. Compléter la deuxième mise en situation et la question de clôture pour valider l'intégralité du format ESSEC lors d'une simulation complète.
3. Intégrer la vie associative de l'ESSEC (associations étudiantes, projets solidaires) pour démontrer votre future intégration sur le campus de Cergy.
4. Approfondir les contacts réseaux : sollicitez des professionnels d'ONG ou d'entreprises de logistique pour nourrir vos exemples d'échanges récents.

## Feedback détaillé
### La présentation
FEEDBACK :
- Votre présentation est claire, équilibrée et pose d'excellentes perches vers vos expériences et vos ambitions.
- La structure thématique est lisible et guide immédiatement le jury sur vos points forts.
- Cependant, elle est beaucoup trop courte pour l'ESSEC, qui attend entre 3 minutes et 5 minutes 30.
- Vous auriez dû développer vos trois piliers avec des faits précis et expliciter votre choix d'école : « Je choisis l'ESSEC pour articuler mon engagement logistique avec la Chaire Supply Chain et expérimenter les flux asiatiques depuis le campus de Singapour. »
VERBATIMS :
- [au début de l'entretien] Vous : « Je m'appelle Robin, j'ai 20 ans et je suis en ECG deuxième année au lycée du Parc à Lyon. Trois choses me définissent. D'abord le collectif […] Ensuite l'engagement […] Enfin la curiosité […] Mon projet est de travailler dans la supply chain responsable, dans la distribution sportive. L'ESSEC m'attire pour la liberté de construire son parcours, la chaire Supply Chain et le campus de Singapour. »

### Le récit de ses expériences
FEEDBACK :
- Vos anecdotes de terrain sont précises, chiffrées et vérifiables, ce qui donne une vraie crédibilité à votre parcours.
VERBATIMS :
- [Restos du Cœur] Vous : « J'ai chronométré chaque étape de la chaîne de distribution pour identifier les temps morts, et nous avons réduit le délai de sortie des colis de 18 %. »
`;

function ApercuDebrief() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-8 md:px-14">
        <DebriefHeader
          school="ESSEC"
          logo={schoolLogo("ESSEC")}
          date="18 septembre 2026 - 17:04"
          difficultyLabel="Jury neutre"
          percentile={84}
          percentileLabel="Sur cet entretien, vous faites mieux que 84 % des candidats (± 5 percentiles)."
          onExport={() => {}}
        />
        <InterviewDebrief text={SAMPLE} positioningInBanner />
        <InterviewTranscript
          turns={[
            {
              question: "Bonjour Robin. Présentez-vous en quelques minutes, puis nous échangerons sur votre projet.",
              answer:
                "Je m'appelle Robin, j'ai 20 ans et je suis en ECG deuxième année au lycée du Parc à Lyon. Trois choses me définissent : le collectif, l'engagement et la curiosité.",
            },
          ]}
        />
      </div>
    </div>
  );
}
