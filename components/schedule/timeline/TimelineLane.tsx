"use client";

import { ArrowLeftRight, Lock, Moon, StickyNote } from "lucide-react";
import { isRotatedDay, siteOfDay, weekSiteSummary, weekSites } from "@/lib/utils/site";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { dayHeaderNumber } from "@/lib/utils/date";
import {
  compactTime,
  crossesMidnight,
  formatDuration,
  shiftDurationMinutes,
  toMinutes,
} from "@/lib/utils/shift";
import { cn } from "@/lib/utils/cn";
import type { DayIndex, DayShift, Staff, WeekDays } from "@/lib/types";
import { LANE_BACKGROUND, MIN_PER_DAY, MIN_PER_WEEK, pct, weekFrac } from "./geometry";

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
/** Bars shorter than this keep their label outside the bar. */
const SHORT_BAR_MIN = 5 * 60;

interface TimelineLaneProps {
  staff: Staff;
  weekStart: string;
  days: WeekDays | undefined;
  onDayClick?: (day: DayIndex) => void;
  onLockToggle?: (day: DayIndex) => void;
}

/** Sede + rol under the name; a rotation this week is called out with the week's sede(s). */
function SiteLine({ staff, days }: { staff: Staff; days: WeekDays | undefined }) {
  const { label, rotated } = weekSiteSummary(staff, days);
  const count = weekSites(staff, days).length;
  if (rotated) {
    return (
      <span
        className="flex min-w-0 items-center gap-1 text-[12.5px] font-bold text-shift-dayInk"
        title={`Esta semana: ${label}. Sede habitual: ${staff.defaultSite || "sin sede"}.`}
      >
        <ArrowLeftRight className="h-3 w-3 shrink-0" aria-hidden />
        <span className="sr-only">Esta semana en </span>
        <span className="truncate">{count > 1 ? `${count} sedes esta semana` : label}</span>
      </span>
    );
  }
  return (
    <span className="truncate text-[12.5px] text-muted-foreground" title={[staff.defaultSite, staff.role].filter(Boolean).join(", ")}>
      {staff.defaultSite || "Sin sede"}
      {staff.role && (
        <>
          <Sep />
          {staff.role}
        </>
      )}
    </span>
  );
}

/** Drawn separator — the face's middle dot sits off-center. */
export function Sep() {
  return <span aria-hidden className="mx-1.5 inline-block h-[3px] w-[3px] rounded-full bg-current align-middle opacity-70" />;
}

function dayLabel(weekStart: string, day: DayIndex) {
  const d = WEEK_DAY_LABELS[day]!;
  return `${d.long} ${dayHeaderNumber(weekStart, day)}`;
}

export function TimelineLane({ staff, weekStart, days, onDayClick, onLockToggle }: TimelineLaneProps) {
  const interactive = Boolean(onDayClick);
  // Mid-week sede change: label every working day with its sede.
  const mixedSites = weekSites(staff, days).length > 1;
  const shiftOf = (d: DayIndex): DayShift => days?.[d] ?? { type: "rest" };

  return (
    <div className="group/row flex border-b border-border transition-colors hover:bg-secondary-container/60">
      <div className="sticky left-0 z-10 flex w-[var(--name-col)] shrink-0 flex-col justify-center bg-background px-5 py-2 transition-colors group-hover/row:bg-secondary-container">
        <span className="truncate text-[15px] font-bold leading-tight text-foreground" title={staff.fullName}>
          {staff.fullName}
        </span>
        <SiteLine staff={staff} days={days} />
      </div>

      <div className="relative h-[66px] flex-1" style={{ background: LANE_BACKGROUND }}>
        {/* Day hit areas — the whole day is clickable to edit, under the bars. */}
        {interactive &&
          DAYS.map((d) => (
            <button
              key={`hit-${d}`}
              type="button"
              onClick={() => onDayClick?.(d)}
              aria-label={`Editar ${staff.fullName}, ${dayLabel(weekStart, d)}`}
              className="absolute inset-y-0 rounded-sm outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              style={{ left: pct(d / 7), width: pct(1 / 7) }}
            />
          ))}

        {!days && (
          <p className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-muted-foreground">
            Sin turnos esta semana
          </p>
        )}

        {days && DAYS.map((d) => (
          <DayItems
            key={d}
            day={d}
            shift={shiftOf(d)}
            prev={d > 0 ? shiftOf((d - 1) as DayIndex) : undefined}
            staff={staff}
            days={days}
            mixedSites={mixedSites}
            weekStart={weekStart}
            onClick={onDayClick ? () => onDayClick(d) : undefined}
          />
        ))}

        {/* Lock badges, one per day corner. */}
        {DAYS.map((d) => {
          const locked = shiftOf(d).locked === true;
          if (!locked && !onLockToggle) return null;
          return (
            <Tooltip key={`lock-${d}`}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={!onLockToggle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockToggle?.(d);
                  }}
                  aria-pressed={locked}
                  aria-label={locked ? `Desbloquear ${dayLabel(weekStart, d)}` : `Bloquear ${dayLabel(weekStart, d)}`}
                  className={cn(
                    "absolute top-1 z-[3] grid h-5 w-5 -translate-x-[calc(100%+4px)] place-items-center rounded transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    locked
                      ? "bg-foreground text-background"
                      : "border border-input bg-background text-muted-foreground opacity-0 hover:text-foreground group-hover/row:opacity-100",
                    !onLockToggle && "cursor-default",
                  )}
                  style={{ left: pct((d + 1) / 7) }}
                >
                  <Lock className="h-3 w-3" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {locked
                  ? onLockToggle
                    ? "Día bloqueado. Clic para desbloquear."
                    : "Día bloqueado contra cambios masivos."
                  : "Bloquear este día contra cambios masivos."}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

interface DayItemsProps {
  day: DayIndex;
  shift: DayShift;
  prev: DayShift | undefined;
  staff: Staff;
  days: WeekDays | undefined;
  mixedSites: boolean;
  weekStart: string;
  onClick?: () => void;
}

function DayItems({ day, shift, prev, staff, days, mixedSites, weekStart, onClick }: DayItemsProps) {
  const note = shift.note?.trim() ?? "";
  const segLeft = day / 7;
  const segWidth = 1 / 7;

  // Where the day's "free" space starts (after a previous night shift spills in).
  const prevEnd =
    prev && prev.type === "time" && crossesMidnight(prev) ? (toMinutes(prev.end) ?? 0) : 0;

  let main: React.ReactNode = null;
  let noteAnchor = weekFrac(day, prevEnd);

  if (shift.type === "time") {
    const start = toMinutes(shift.start);
    const dur = shiftDurationMinutes(shift);
    if (start !== null && dur !== null) {
      const left = weekFrac(day, start);
      const rawWidth = dur / MIN_PER_WEEK;
      const width = Math.min(rawWidth, 1 - left);
      const clipped = width < rawWidth;
      const night = crossesMidnight(shift);
      const short = dur < SHORT_BAR_MIN;
      const label = `${compactTime(shift.start)}–${compactTime(shift.end)}${clipped ? " →" : ""}`;
      noteAnchor = left;
      const nextDay = WEEK_DAY_LABELS[(day + 1) % 7]!.long.toLowerCase();

      main = (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onClick}
              tabIndex={onClick ? 0 : -1}
              aria-label={`${staff.fullName}, ${dayLabel(weekStart, day)}: ${shift.start} a ${shift.end}${night ? ` (sale el ${nextDay})` : ""}`}
              className={cn(
                "absolute top-4 z-[2] flex h-[34px] items-center rounded-md text-[12.5px] font-bold tracking-tight outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                night
                  ? "bg-shift-night text-shift-nightInk"
                  : "bg-shift-day text-shift-dayInk shadow-[inset_0_-3px_0_hsl(var(--shift-day-rule))]",
                short ? "justify-start" : "justify-center",
                onClick ? "cursor-pointer hover:shadow-[0_4px_12px_hsl(var(--ink)/0.18)]" : "cursor-default",
                night && onClick && "hover:shadow-[0_4px_12px_hsl(var(--ink)/0.25)]",
              )}
              style={{ left: pct(left), width: pct(width) }}
            >
              {short ? (
                <span
                  className={cn(
                    "absolute whitespace-nowrap text-shift-dayInk",
                    left + width > 0.94 ? "right-[calc(100%+4px)]" : "left-[calc(100%+4px)]",
                    night && "text-shift-night",
                  )}
                >
                  {label}
                </span>
              ) : (
                <span className="whitespace-nowrap px-1">{label}</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px] text-left">
            <div className="space-y-0.5">
              <div className="font-bold">{staff.fullName}</div>
              <div className="text-xs opacity-80">{dayLabel(weekStart, day)}</div>
              <div className="pt-1 text-sm font-bold tabular-nums">
                {shift.start} → {shift.end}
                <Sep />
                <span className="font-medium opacity-80">{formatDuration(dur)}</span>
              </div>
              {night && <div className="text-xs">Turno nocturno: sale el {nextDay} a las {shift.end}</div>}
              <div className="text-xs">
                Sede: {siteOfDay(staff, days, day) || "sin sede"}
                {isRotatedDay(staff, days, day) && " (rotación)"}
              </div>
              {note && <div className="pt-1 text-xs leading-snug">Observación: {note}</div>}
              {shift.locked && <div className="text-xs">Bloqueado contra cambios masivos</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }
  } else if (shift.type === "available") {
    main = (
      <div
        aria-label={`${staff.fullName}, ${dayLabel(weekStart, day)}: Disponible`}
        className="pointer-events-none absolute top-[19px] z-[1] grid h-7 place-items-center rounded-md border-2 border-dashed border-available bg-available-bg text-xs font-bold text-available-ink"
        style={{ left: `calc(${pct(segLeft)} + 6px)`, width: `calc(${pct(segWidth)} - 12px)` }}
      >
        Disponible
      </div>
    );
  } else if (shift.type === "nightIn") {
    const leaveAt = prevEnd ? prev?.end : undefined;
    main = (
      <div
        className="pointer-events-none absolute top-[22px] z-[1] flex items-center gap-1 overflow-hidden whitespace-nowrap pl-1.5 text-xs font-bold text-shift-night"
        style={{ left: pct(weekFrac(day, prevEnd)), maxWidth: pct((MIN_PER_DAY - prevEnd) / MIN_PER_WEEK) }}
        title={leaveAt ? `Amanece del turno noche, sale ${leaveAt}` : "Amanece del turno noche"}
      >
        <Moon className="h-3 w-3 shrink-0" aria-hidden />
        <span className="truncate">Amanece{leaveAt ? `, sale ${leaveAt}` : ""}</span>
      </div>
    );
  } else {
    // rest
    main = (
      <div
        className="pointer-events-none absolute top-[24px] z-[1] text-center text-xs font-semibold text-muted-foreground"
        style={{ left: pct(weekFrac(day, prevEnd)), width: pct((MIN_PER_DAY - prevEnd) / MIN_PER_WEEK) }}
      >
        Descanso
      </div>
    );
  }

  // "Amanece" days belong to the previous night's shift, already labeled.
  const showSite = mixedSites && shift.type !== "rest" && shift.type !== "nightIn" && !note;
  return (
    <>
      {main}
      {showSite && (
        <span
          className={cn(
            "pointer-events-none absolute bottom-1 z-[2] max-w-[calc(100%_/_7_-_12px)] truncate text-[10.5px] font-bold leading-4",
            isRotatedDay(staff, days, day) ? "text-shift-dayInk" : "text-muted-foreground",
          )}
          style={{ left: `calc(${pct(day / 7)} + 6px)` }}
        >
          {siteOfDay(staff, days, day)}
        </span>
      )}
      {note && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="absolute bottom-1 z-[2] flex max-w-[calc(100%_/_7_-_8px)] items-center gap-1 truncate rounded bg-available-bg px-1.5 text-[10.5px] font-bold leading-4 text-available-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ left: pct(noteAnchor) }}
            >
              <StickyNote className="h-2.5 w-2.5 shrink-0" aria-hidden />
              <span className="truncate">{note}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] whitespace-pre-wrap text-left">
            <div className="text-[11px] font-bold uppercase tracking-wide opacity-80">Observación</div>
            <div className="text-sm leading-snug">{note}</div>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
