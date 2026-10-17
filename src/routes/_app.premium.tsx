import { createFileRoute } from "@tanstack/react-router";
import { Check, Gem } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";
import { PageHero } from "@/components/vivaldi/PageHero";
import { useProfile } from "@/lib/vivaldi-queries";

export const Route = createFileRoute("/_app/premium")({
  head: () => ({
    meta: [
      { title: "Formule complète 99 € | The Prepboard" },
      { name: "description", content: "Débloquez les 45 questions clés et les simulations d'entretien complet avec correction IA." },
      { property: "og:title", content: "Formule complète 99 € | The Prepboard" },
      { property: "og:description", content: "Les modules 6 et 7 de la préparation The Prepboard aux oraux CPGE." },
    ],
  }),
  component: PremiumPage,
});

function PremiumPage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  // La formule ne se change plus depuis l'app : la base refuse toute modification par le candidat.
  const isPremium = profile?.plan === "premium";

  return (
    <div>
      <PageHero eyebrow="Formule complète" title="Aller jusqu'à l'entretien complet - 99 €">
        Les modules 1 à 5 restent gratuits. La formule complète ouvre l'entraînement aux 45 questions clés et les
        simulations d'entretien en conditions réelles.
      </PageHero>

      <Card className="space-y-5 rounded-[24px] border-0 p-7 shadow-none md:p-9">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-[26px] font-semibold tracking-[-0.02em]">Ce qui est inclus</h2>
          {isPremium ? (
            <Badge className="bg-premium text-premium-foreground"><Gem className="size-3" /> Active</Badge>
          ) : (
            <Badge variant="secondary">Non active</Badge>
          )}
        </div>
        <ul className="space-y-3 text-[17px] leading-[1.55] text-[var(--graphite)]">
          {[
            "Module 7 : les 45 questions clés, question par question, avec correction IA",
            "Module 8 : entretiens complets simulés, à l'oral, avec débrief du jury",
            "Relances personnalisées appuyées sur vos expériences et vos fiches écoles",
            "Accès illimité jusqu'aux oraux",
          ].map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-[var(--bleu)]" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {isPremium ? null : (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button disabled>Le paiement en ligne arrive bientôt</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
