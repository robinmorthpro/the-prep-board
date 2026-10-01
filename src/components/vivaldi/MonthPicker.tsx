// ============= Full file contents =============
import { type ReactNode } from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => NOW + 2 - i);

/** Sélecteur calendrier mois + année (valeur stockée au format "YYYY-MM").
 *  Avec `withDay`, un jour précis peut être choisi (valeur "YYYY-MM-DD"). */
export function MonthPicker({
  value,
  onChange,
  label,
  hint,
  disabled,
  minDate,
  withDay,
}: {
  value: string;
  onChange: (v: string) => void;
  label: ReactNode;
  hint?: string;
  disabled?: boolean;
  /** Valeur minimale "YYYY-MM" incluse (les mois antérieurs sont bloqués). */
  minDate?: string | undefined;
  /** Permet de choisir un jour précis en plus du mois (optionnel). */
  withDay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [yVal, mVal, dVal] = value ? value.split("-") : ["", "", ""];
  const [minY = 0, minM = 0] = minDate ? minDate.split("-").map(Number) : [0, 0];
  const [viewYear, setViewYear] = useState<number>(yVal ? Number(yVal) : NOW);
  const [dayMonth, setDayMonth] = useState<number | null>(null);

  const pick = (m: number) => {
    if (withDay) {
      setDayMonth(m);
      return;
    }
    onChange(`${viewYear}-${String(m).padStart(2, "0")}`);
    setOpen(false);
  };

  const pickDay = (d: number | null) => {
    const base = `${viewYear}-${String(dayMonth!).padStart(2, "0")}`;
    onChange(d ? `${base}-${String(d).padStart(2, "0")}` : base);
    setDayMonth(null);
    setOpen(false);
  };

  const daysInMonth = dayMonth ? new Date(viewYear, dayMonth, 0).getDate() : 0;

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o) {
            setViewYear(yVal ? Number(yVal) : NOW);
            setDayMonth(null);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatMonth(value) : <span>{withDay ? "Choisir une date" : "Choisir un mois"}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="pointer-events-auto w-[280px] p-3" align="start">
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                if (dayMonth) setDayMonth(null);
                else setViewYear((y) => Math.max(YEARS.at(-1)!, y - 1));
              }}
              disabled={!dayMonth && viewYear <= YEARS.at(-1)!}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium capitalize">
              {dayMonth ? `${MONTHS[dayMonth - 1]} ${viewYear}` : viewYear}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewYear((y) => Math.min(YEARS[0]!, y + 1))}
              disabled={!!dayMonth || viewYear >= YEARS[0]!}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {dayMonth ? (
            <>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const selected =
                    Number(yVal) === viewYear && Number(mVal) === dayMonth && Number(dVal) === d;
                  return (
                    <Button
                      key={d}
                      type="button"
                      variant={selected ? "default" : "ghost"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => pickDay(d)}
                    >
                      {d}
                    </Button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => pickDay(null)}
              >
                Mois entier (pas de jour précis)
              </Button>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, i) => {
                const monthNum = i + 1;
                const tooEarly = !!minDate && (viewYear < minY || (viewYear === minY && monthNum < minM));
                const selected = Number(yVal) === viewYear && Number(mVal) === monthNum;
                return (
                  <Button
                    key={m}
                    type="button"
                    variant={selected ? "default" : "ghost"}
                    size="sm"
                    className="capitalize"
                    disabled={tooEarly}
                    onClick={() => pick(monthNum)}
                  >
                    {m.slice(0, 4)}.
                  </Button>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function formatMonth(value: string) {
  if (!value) return "en cours";
  const [y, m, d] = value.split("-");
  const idx = Number(m) - 1;
  const month = MONTHS[idx] ?? "";
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y ?? ""}`.trim();
}
