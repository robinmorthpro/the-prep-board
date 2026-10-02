import { createFileRoute } from "@tanstack/react-router";
import { PartHeader } from "@/components/vivaldi/PartHeader";
import { PartNav } from "@/components/vivaldi/PartNav";
import { StartPanel } from "@/components/vivaldi/StartPanel";
import { TheoryDialog } from "@/components/vivaldi/TheoryDialog";
import { AiFeedback } from "@/components/vivaldi/AiFeedback";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export const Route = createFileRoute("/apercu-tmp")({ component: P });
const FB = `## Verdict\nÀ perfectionner\n- Point fort fictif.\n- Second point fictif.\n## Grille Contexte\n- Clarté - Validé - Justification fictive.\n- Précision - Manquant - Autre justification. Exemple : texte fictif.\n## Questions possibles\n1. Question fictive ?\n2. Autre question ?`;
function P() {
  return (
    <div className="min-h-screen bg-[var(--paper)] p-5 md:px-14 md:py-10"><div className="mx-auto max-w-[1110px]">
      <PartNav prev="/" next="/" className="mb-6" />
      <PartHeader step="Module 1" title="Mon projet professionnel" />
      <StartPanel objectif={[<>L'objectif de ce module est de formaliser, à l'écrit, votre réflexion personnelle.</>]} aSavoir={[<>Premier point.</>, <>Second point.</>]} theory={<TheoryDialog prominent title="t" intro="i" />} recommendation="Avant de commencer, nous vous recommandons de consulter la rubrique « Consignes théoriques »." />
      <Card className="module-form flex flex-col gap-7 rounded-[24px] border-0 p-6 md:p-10">
        <h2 className="m-0 text-[28px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[36px]">Mon projet professionnel</h2>
        <div className="grid gap-6 sm:grid-cols-2"><div className="flex flex-col gap-[10px]"><Label>Le métier<span className="text-[var(--bleu-texte)]"> *</span></Label><Input /></div><div className="flex flex-col gap-[10px]"><Label>Secteur</Label><Input /></div></div>
        <div className="flex flex-col gap-[10px]"><Label>Description</Label><Textarea rows={4} /></div>
        <AiFeedback text={FB} />
      </Card>
    </div></div>
  );
}
