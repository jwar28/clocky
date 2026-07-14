"use client";

import { cn } from "@/lib/utils/cn";
import { TimePair } from "./TimePair";
import { StatusChip } from "./StatusChip";
import { dayISO, isToday } from "@/lib/utils/date";
import type { DayShift, DayIndex } from "@/lib/types";

interface ScheduleCellProps {
  shift: DayShift;
  weekStart: string;
  dayIndex: DayIndex;
  onClick?: () => void;
  className?: string;
}

/**
 * Renders a single day cell. The day-pair subdivision was removed — each
 * day is one wider cell with the time range (or status chip) centered.
 *
 * - 'time'      → two mono timestamps inline
 * - 'rest'      → 'Descanso' pill
 * - 'available' → 'Disponible' pill (amber)
 * - 'nightIn'   → 'Amanece turno noche' pill (italic + moon icon)
 */
export function ScheduleCell({ shift, weekStart, dayIndex, onClick, className }: ScheduleCellProps) {
  const interactive = Boolean(onClick);
  const today = isToday(dayISO(weekStart, dayIndex));
  return (
    <td
      className={cn(
        "cell-pad border border-grid text-center align-middle",
        interactive && "cursor-pointer hover:bg-secondary-container/50 focus-visible:bg-secondary-container/70 focus-visible:outline-none",
        today && "bg-primary/5",
        className,
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? "button" : undefined}
    >
      {today && <span className="sr-only">Hoy</span>}
      {shift.type === "time" ? (
        <TimePair shift={shift} />
      ) : (
        <StatusChip type={shift.type} />
      )}
    </td>
  );
}