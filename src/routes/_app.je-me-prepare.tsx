import { createFileRoute } from "@tanstack/react-router";
import { SectionHub } from "@/components/vivaldi/SectionHub";
import { MODULE_BANNERS } from "@/components/vivaldi/module-banners";
import { PREP_PARTS } from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app/je-me-prepare")({
  head: () => ({
    meta: [
      { title: "Je me prépare - The Prepboard" },
      { name: "description", content: "Les 5 modules pour structurer votre profil et votre dossier avant les oraux." },
      { property: "og:title", content: "Je me prépare - The Prepboard" },
      { property: "og:description", content: "Parcourez les modules de préparation aux oraux BCE et Ecricome." },
    ],
  }),
  component: JeMePrepare,
});

function JeMePrepare() {
  return (
    <SectionHub
      title="Je me prépare"
      subtitle="Les 5 modules pour structurer votre profil et votre dossier."
      banner={MODULE_BANNERS["Tableau"] ?? ""}
      parts={PREP_PARTS}
    />
  );
}
