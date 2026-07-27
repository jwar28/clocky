"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { TimePair } from "./TimePair";
import { StatusChip } from "./StatusChip";
import { dayISO, isToday } from "@/lib/utils/date";
import type { DayShift, DayIndex } from "@/lib/types";
import { StickyNote } from "lucide-react";

interface ScheduleCellProps {
  shift: DayShift;
  weekStart: string;
  dayIndex: DayIndex;
  onClick?: () => void;
  className?: string;
}

/** Max width of the note pill — matches the time-pair visual width so rows
 *  stay the same height whether or not there is a note. */
const NOTE_PILL_MAX_WIDTH = "max-w-[160px]";

/**
 * Renders a single day cell. The day-pair subdivision was removed — each
 * day is one wider cell with the time range (or status chip) centered.
 *
 * - 'time'      → two mono timestamps inline
 * - 'rest'      → 'Descanso' pill
 * - 'available' → 'Disponible' pill (amber)
 * - 'nightIn'   → 'Amanece turno noche' pill (italic + moon icon)
 *
 * If the shift has a free-text `note`, a fixed-width pill renders under the
 * main content with single-line ellipsis. The full note appears in a
 * Tooltip on hover.
 */
export function ScheduleCell({ shift, weekStart, dayIndex, onClick, className }: ScheduleCellProps) {
  const interactive = Boolean(onClick);
  const today = isToday(dayISO(weekStart, dayIndex));
  const note = shift.note?.trim() ?? "";
  const hasNote = note.length > 0;

  const mainContent = shift.type === "time" ? <TimePair shift={shift} /> : <StatusChip type={shift.type} />;

  const notePill = hasNote ? (
    <div
      className={cn(
        "mx-auto flex w-fit items-center gap-1 rounded bg-secondary-container/60 px-1.5 py-0.5 text-[11px] leading-tight text-on-secondary-container",
        NOTE_PILL_MAX_WIDTH,
        interactive && "group-hover:bg-secondary-container",
      )}
    >
      <StickyNote className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
      <span className="min-w-0 truncate text-left">{note}</span>
    </div>
  ) : null;

  const cellInner = (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="flex items-center justify-center">{mainContent}</div>
      {notePill}
    </div>
  );

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
      {hasNote ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "-m-1 rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                interactive && "group",
              )}
            >
              {cellInner}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-[260px] whitespace-pre-wrap break-words text-left"
          >
            <div className="space-y-1">
              <div className="font-display text-[11px] uppercase tracking-wide opacity-80">
                Observación
              </div>
              <div className="text-body-sm leading-snug">{note}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        cellInner
      )}
    </td>
  );
}
