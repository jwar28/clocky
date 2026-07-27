"use client";

import { useState } from "react";
import { ChevronDown, Lock, LockOpen, StickyNote } from "lucide-react";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { dayDate, formatWeekLabel } from "@/lib/utils/date";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TimePair } from "./TimePair";
import { StatusChip } from "./StatusChip";
import type { Staff, WeekDays, DayIndex } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface MobileScheduleCardsProps {
  staff: Staff[];
  byStaffDays: (staffId: string) => WeekDays | undefined;
  weekStart: string;
  /** Optional. When omitted, cards render in read-only mode (no click handlers). */
  onCellClick?: (staffId: string, dayIndex: DayIndex) => void;
  /** Optional. When omitted, the lock badge is read-only (no toggle). */
  onCellLockToggle?: (staffId: string, dayIndex: DayIndex) => void;
}

export function MobileScheduleCards({
  staff,
  byStaffDays,
  weekStart,
  onCellClick,
  onCellLockToggle,
}: MobileScheduleCardsProps) {
  const [openId, setOpenId] = useState<string | null>(staff[0]?.id ?? null);
  return (
    <div className="space-y-2 md:hidden">
      {staff.map((s) => {
        const open = openId === s.id;
        const days = byStaffDays(s.id);
        return (
          <div key={s.id} className="rounded-lg border border-grid bg-card">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : s.id)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              aria-expanded={open}
            >
              <div className="min-w-0">
                <div className="truncate font-display text-table-header text-foreground">{s.fullName}</div>
                <div className="truncate text-body-sm text-muted-foreground">{s.defaultSite || "—"}</div>
              </div>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
              />
            </button>
            {open && (
              <div className="border-t border-grid">
                <div className="px-4 py-2 text-body-sm text-muted-foreground">{formatWeekLabel(weekStart)}</div>
                <ul className="divide-y divide-grid-soft">
                  {WEEK_DAY_LABELS.map((d) => {
                    const shift = days?.[d.index] ?? { type: "rest" as const };
                    const dateLabel = format(dayDate(weekStart, d.index), "EEE d", { locale: es });
                    const interactive = Boolean(onCellClick);
                    const lockInteractive = Boolean(onCellLockToggle);
                    const note = shift.note?.trim() ?? "";
                    const locked = shift.locked === true;
                    return (
                      <li
                        key={d.index}
                        className={cn(
                          "flex items-start justify-between gap-3 px-4 py-2.5",
                          interactive && "cursor-pointer hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                          locked &&
                            "bg-tertiary-fixed/25 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]",
                        )}
                        onClick={interactive ? () => onCellClick?.(s.id, d.index) : undefined}
                        role={interactive ? "button" : undefined}
                        tabIndex={interactive ? 0 : -1}
                        onKeyDown={(e) => {
                          if (interactive && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onCellClick?.(s.id, d.index);
                          }
                        }}
                      >
                        <div className="min-w-[90px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-table-header text-foreground">{d.long}</span>
                            {locked && (
                              <span className="inline-flex h-5 items-center gap-1 rounded-md bg-primary px-2 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
                                <Lock className="h-3 w-3" aria-hidden />
                                Bloq
                              </span>
                            )}
                          </div>
                          <div className="text-body-sm text-muted-foreground capitalize">{dateLabel}</div>
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div className="flex justify-end gap-1">
                            <div className="flex items-center">
                              {shift.type === "time" ? (
                                <TimePair shift={shift} className="justify-end" />
                              ) : (
                                <StatusChip type={shift.type} />
                              )}
                            </div>
                            {lockInteractive && (
                              <button
                                type="button"
                                aria-label={locked ? "Desbloquear día" : "Bloquear día"}
                                aria-pressed={locked}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCellLockToggle?.(s.id, d.index);
                                }}
                                className={cn(
                                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all",
                                  locked
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-outline-variant/70 bg-card text-muted-foreground hover:border-primary/60 hover:text-primary active:scale-95",
                                )}
                              >
                                {locked ? (
                                  <Lock className="h-3.5 w-3.5" aria-hidden />
                                ) : (
                                  <LockOpen className="h-3.5 w-3.5" aria-hidden />
                                )}
                              </button>
                            )}
                          </div>
                          {note && <NotePreview text={note} />}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NotePreview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-1.5 flex flex-col items-end gap-1">
      {expanded ? (
        <div className="flex max-w-full min-w-0 items-start gap-1 self-end rounded bg-secondary-container/60 px-1.5 py-1 text-[11px] leading-snug text-on-secondary-container">
          <StickyNote className="mt-[2px] h-3 w-3 shrink-0 opacity-80" aria-hidden />
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-left">{text}</span>
        </div>
      ) : (
        <div className="flex w-fit max-w-full items-center gap-1 rounded bg-secondary-container/60 px-1.5 py-1 text-[11px] leading-snug text-on-secondary-container">
          <StickyNote className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
          <span className="min-w-0 truncate text-left">{text}</span>
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
      >
        {expanded ? "Ver menos" : "Ver más"}
      </button>
    </div>
  );
}
