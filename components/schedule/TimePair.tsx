"use client";

import { cn } from "@/lib/utils/cn";
import { detectNightShift, formatTimeAMPM } from "@/lib/utils/shift";
import type { DayShift } from "@/lib/types";

interface TimePairProps {
  shift: DayShift;
  className?: string;
}

export function TimePair({ shift, className }: TimePairProps) {
  if (shift.type !== "time" || !shift.start || !shift.end) return null;
  const isNight = detectNightShift(shift);
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap font-sans font-medium tabular-nums text-[13px] text-ink",
        className,
      )}
    >
      <span className={cn(isNight ? "font-semibold text-tertiary" : "text-ink")}>
        {formatTimeAMPM(shift.start)}
      </span>
      <span className="text-muted-foreground">–</span>
      <span className={cn(isNight ? "font-semibold text-tertiary" : "text-ink")}>
        {formatTimeAMPM(shift.end)}
      </span>
    </div>
  );
}