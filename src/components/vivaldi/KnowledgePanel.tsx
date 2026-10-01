import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export function KnowledgePanel({ title, points }: { title: string; points: string[] }) {
  return (
    <Card className="sticky top-6 border-accent/40 bg-secondary/60 p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <BookOpen className="size-4 text-accent" />
        Consignes - {title}
      </div>
      <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
