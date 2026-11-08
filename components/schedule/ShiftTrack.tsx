"use client";

import { crossesMidnight, formatDuration, shiftDurationMinutes, toMinutes } from "@/lib/utils/shift";
import { cn } from "@/lib/utils/cn";
import type { DayShift } from "@/lib/types";

/** Track spans 30 h: the whole day plus the first 6 h of the next one, so night shifts read as one bar. */
const SPAN_MIN = 30 * 60;
const TICKS = [0, 6, 12, 18, 24, 30];

/**
 * Live preview of a time shift on a ruler, in the timeline's own language:
 * green bar for day shifts, indigo for shifts that cross midnight.
 */
export function ShiftTrack({ shift }: { shift: DayShift }) {
  const start = toMinutes(shift.start);
  const dur = shiftDurationMinutes(shift);
  if (start === null || dur === null) return null;
  const night = crossesMidnight(shift);
  const left = start / SPAN_MIN;
  const width = Math.min(dur, SPAN_MIN - start) / SPAN_MIN;

  return (
    <div aria-hidden className="pt-1">
      <div className="relative h-9 rounded-md bg-muted">
        {/* next-day zone */}
        <div className="absolute inset-y-0 right-0 rounded-r-md bg-foreground/[0.04]" style={{ width: `${(6 / 30) * 100}%` }} />
        {TICKS.slice(1, -1).map((h) => (
          <span
            key={h}
            className={cn("absolute inset-y-0 w-px", h === 24 ? "bg-foreground/30" : "bg-grid")}
            style={{ left: `${(h / 30) * 100}%` }}
          />
        ))}
        <div
          className={cn(
            "absolute top-1.5 h-6 rounded transition-[left,width] duration-200 ease-out",
            night ? "bg-shift-night" : "bg-shift-day shadow-[inset_0_-3px_0_hsl(var(--shift-day-rule))]",
          )}
          style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
        />
      </div>
      <div className="relative mt-1 h-4 text-[10.5px] text-muted-foreground">
        {TICKS.map((h) => (
          <span
            key={h}
            className={cn("absolute -translate-x-1/2 tabular-nums", h === 0 && "translate-x-0", h === 30 && "-translate-x-full", h === 24 && "font-bold text-foreground")}
            style={{ left: `${(h / 30) * 100}%` }}
          >
            {h === 24 ? "00 día sig." : String(h % 24).padStart(2, "0")}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        <b className="font-bold text-foreground">{formatDuration(dur)}</b>
        {night ? (
          <>, nocturno: sale al día siguiente a las <b className="font-bold text-shift-night">{shift.end}</b></>
        ) : (
          ", diurno"
        )}
      </p>
    </div>
  );
}
