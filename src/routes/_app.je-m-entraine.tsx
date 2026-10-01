import { createFileRoute } from "@tanstack/react-router";
import { SectionHub } from "@/components/vivaldi/SectionHub";
import { MODULE_BANNERS } from "@/components/vivaldi/module-banners";
import { TRAIN_PARTS } from "@/lib/vivaldi-data";

export const Route = createFileRoute("/_app/je-m-entraine")({
  head: () => ({
    meta: [
      { title: "Je m'entraîne - The Prepboard" },
      { name: "description", content: "Questions clés et simulations complètes pour le jour J." },
      { property: "og:title", content: "Je m'entraîne - The Prepboard" },
      { property: "og:description", content: "Entraînez-vous aux questions clés et aux simulations d'entretien." },
    ],
  }),
  component: JeMEntraine,
});

function JeMEntraine() {
  return (
    <SectionHub
      title="Je m'entraîne"
      subtitle="Questions clés et simulations complètes pour le jour J."
      banner={MODULE_BANNERS["Amphi"] ?? ""}
      parts={TRAIN_PARTS}
    />
  );
}
