"use client";

import { Lock, LockOpen, StickyNote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  /** When provided, clicking the lock badge toggles the lock state. */
  onLockToggle?: () => void;
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
 *
 * Lock state:
 *  - Locked cells show a filled green padlock badge that is always visible
 *    and clickable to unlock.
 *  - Unlocked cells show a subtle outline padlock that fades in on hover
 *    (desktop) — clicks to lock. Read-only views don't render the badge.
 */
export function ScheduleCell({ shift, weekStart, dayIndex, onClick, onLockToggle, className }: ScheduleCellProps) {
  const interactive = Boolean(onClick);
  const lockInteractive = Boolean(onLockToggle);
  const today = isToday(dayISO(weekStart, dayIndex));
  const note = shift.note?.trim() ?? "";
  const hasNote = note.length > 0;
  const locked = shift.locked === true;

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

  const lockBadge = (() => {
    if (locked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Desbloquear día"
              aria-pressed
              disabled={!lockInteractive}
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle?.();
              }}
              className={cn(
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-primary bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !lockInteractive && "cursor-default",
              )}
            >
              <Lock className="h-3 w-3" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end">
            {lockInteractive
              ? "Día bloqueado. Click para desbloquear."
              : "Día bloqueado — protegido contra cambios masivos."}
          </TooltipContent>
        </Tooltip>
      );
    }
    if (!lockInteractive) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Bloquear día"
            aria-pressed={false}
            onClick={(e) => {
              e.stopPropagation();
              onLockToggle?.();
            }}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 border-outline bg-card text-ink opacity-0 shadow-sm transition-all hover:border-primary hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <Lock className="h-3 w-3" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          Click para bloquear este día.
        </TooltipContent>
      </Tooltip>
    );
  })();

  return (
    <td
      className={cn(
        "group relative cell-pad border border-grid text-center align-middle",
        interactive && "cursor-pointer hover:bg-secondary-container/50 focus-visible:bg-secondary-container/70 focus-visible:outline-none",
        today && "bg-primary/5",
        // Locked cells get a subtle bg tint only — no ring or inset shadow
        // so the row stays visually flat (no "expansion" feeling).
        locked && "bg-tertiary-fixed/20",
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
      {lockBadge && <div className="absolute right-0 top-0 z-[1]">{lockBadge}</div>}
      {hasNote ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="-m-1 rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
