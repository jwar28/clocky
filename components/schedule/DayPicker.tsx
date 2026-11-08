"use client";

import { Lock } from "lucide-react";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { dayHeaderNumber, dayISO, isToday } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DayIndex } from "@/lib/types";

interface DayPickerProps {
  value: DayIndex[];
  onChange: (next: DayIndex[]) => void;
  /** Week shown, for date numbers and "today". */
  weekStart: string;
  /** Days locked for the active person — shown, but not selectable. */
  lockedDays?: DayIndex[];
  className?: string;
}

const PRESETS: Array<{ label: string; days: DayIndex[] }> = [
  { label: "Lun–Vie", days: [1, 2, 3, 4, 5] },
  { label: "Fin de semana", days: [6, 0] },
  { label: "Todos", days: [0, 1, 2, 3, 4, 5, 6] },
];

function sameSet(a: DayIndex[], b: DayIndex[]) {
  return a.length === b.length && b.every((x) => a.includes(x));
}

/** Seven connected day cells, the same column rhythm as the timeline header. */
export function DayPicker({ value, onChange, weekStart, lockedDays, className }: DayPickerProps) {
  const locked = new Set(lockedDays ?? []);
  const pick = (days: DayIndex[]) => onChange(days.filter((d) => !locked.has(d)));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-input" role="group" aria-label="Días">
        {WEEK_DAY_LABELS.map((d, i) => {
          const active = value.includes(d.index);
          const isLocked = locked.has(d.index);
          const today = isToday(dayISO(weekStart, d.index));
          const cell = (
            <button
              type="button"
              aria-pressed={active}
              aria-disabled={isLocked}
              aria-label={`${d.long} ${dayHeaderNumber(weekStart, d.index)}${isLocked ? ", bloqueado" : ""}`}
              onClick={() => {
                if (isLocked) return;
                onChange(active ? value.filter((x) => x !== d.index) : [...value, d.index]);
              }}
              className={cn(
                "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                i > 0 && "border-l border-input",
                isLocked
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : active
                    ? "bg-shift-day text-shift-dayInk shadow-[inset_0_-3px_0_hsl(var(--shift-day-rule))]"
                    : "bg-background hover:bg-muted",
              )}
            >
              <span className={cn("text-[11px] font-bold uppercase tracking-[0.06em]", !active && !isLocked && "text-muted-foreground", today && !active && "text-primary")}>
                {d.short}
              </span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums">
                {isLocked ? <Lock className="h-4 w-4" aria-hidden /> : dayHeaderNumber(weekStart, d.index)}
              </span>
            </button>
          );
          return isLocked ? (
            <Tooltip key={d.index}>
              <TooltipTrigger asChild>{cell}</TooltipTrigger>
              <TooltipContent side="top">Día bloqueado. Desbloquéalo en la malla para editarlo.</TooltipContent>
            </Tooltip>
          ) : (
            <div key={d.index}>{cell}</div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px]">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => pick(p.days)}
            aria-pressed={sameSet(value, p.days.filter((d) => !locked.has(d)))}
            className="rounded-md px-2 py-1 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-primary-fixed aria-pressed:text-shift-dayInk"
          >
            {p.label}
          </button>
        ))}
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="ml-auto rounded-md px-2 py-1 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Quitar selección
          </button>
        )}
      </div>
    </div>
  );
}
