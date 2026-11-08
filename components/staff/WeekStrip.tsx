"use client";

import { WEEK_DAY_LABELS } from "@/lib/constants";
import { crossesMidnight } from "@/lib/utils/shift";
import { cn } from "@/lib/utils/cn";
import type { DayShift, WeekDays } from "@/lib/types";

function describe(s: DayShift | undefined): string {
  if (!s || s.type === "rest") return "Descanso";
  if (s.type === "available") return "Disponible";
  if (s.type === "nightIn") return "Amanece";
  return `${s.start ?? ""}–${s.end ?? ""}`;
}

/** Seven tiny cells in the timeline's shift language: one person's week at a glance. */
export function WeekStrip({ days, todayIndex }: { days: WeekDays | undefined; todayIndex: number | null }) {
  const shifts = days ? WEEK_DAY_LABELS.filter((d) => days[d.index]?.type === "time").length : 0;
  const label = days
    ? WEEK_DAY_LABELS.map((d) => `${d.short} ${describe(days[d.index])}`).join(", ")
    : "Sin turnos esta semana";

  return (
    <div className="flex items-center gap-2.5" role="img" aria-label={label} title={label}>
      <div className="flex gap-[3px]">
        {WEEK_DAY_LABELS.map((d) => {
          const s = days?.[d.index];
          return (
            <span key={d.index} className="flex flex-col items-center gap-1">
              <i
                className={cn(
                  "block h-4 w-[18px] rounded-[3px]",
                  !days && "bg-muted",
                  days && (!s || s.type === "rest") && "border border-dashed border-input",
                  s?.type === "time" &&
                    (crossesMidnight(s)
                      ? "bg-shift-night"
                      : "bg-shift-day shadow-[inset_0_-2px_0_hsl(var(--shift-day-rule))]"),
                  s?.type === "available" && "border-2 border-dashed border-available bg-available-bg",
                  s?.type === "nightIn" && "bg-shift-night/25",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "text-[9.5px] font-bold leading-none text-muted-foreground",
                  todayIndex === d.index && "text-primary",
                )}
              >
                {d.short[0]}
              </span>
            </span>
          );
        })}
      </div>
      <span className={cn("whitespace-nowrap text-xs", days ? "text-muted-foreground" : "font-semibold text-available-ink")}>
        {days ? `${shifts} ${shifts === 1 ? "turno" : "turnos"}` : "Sin asignar"}
      </span>
    </div>
  );
}
