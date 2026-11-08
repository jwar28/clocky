"use client";

import { useMemo } from "react";
import { getWeekStart, nowMinutesInBogota, todayInBogota } from "@/lib/utils/date";
import { crossesMidnight, shiftDurationMinutes, toMinutes } from "@/lib/utils/shift";
import type { DayIndex, Staff, WeeklySchedule } from "@/lib/types";

interface WeekStatsBarProps {
  weekStart: string;
  staff: Staff[];
  rows: WeeklySchedule[];
  /** Previous week's rows, so a Saturday night shift still counts early on Sunday. */
  prevRows?: WeeklySchedule[];
}

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/** Quiet facts strip under the timeline: shifts, nights, hours, and who is on shift right now. */
export function WeekStatsBar({ weekStart, staff, rows, prevRows }: WeekStatsBarProps) {
  const stats = useMemo(() => {
    const ids = new Set(staff.map((s) => s.id));
    let shifts = 0;
    let nights = 0;
    let minutes = 0;
    for (const r of rows) {
      if (!ids.has(r.staffId)) continue;
      for (const d of DAYS) {
        const sh = r.days[d];
        if (sh?.type !== "time") continue;
        shifts++;
        if (crossesMidnight(sh)) nights++;
        minutes += shiftDurationMinutes(sh) ?? 0;
      }
    }

    // On shift now: today's shift covering now, or yesterday's night shift still running.
    let onNow: number | null = null;
    const today = todayInBogota();
    if (getWeekStart(today) === weekStart) {
      const dow = new Date(`${today}T12:00:00`).getDay() as DayIndex;
      const now = nowMinutesInBogota();
      onNow = 0;
      for (const id of ids) {
        const r = rows.find((x) => x.staffId === id);
        const t = r?.days[dow];
        const y =
          dow > 0 ? r?.days[(dow - 1) as DayIndex] : prevRows?.find((x) => x.staffId === id)?.days[6];
        const s = toMinutes(t?.start);
        const e = toMinutes(t?.end);
        const inToday =
          t?.type === "time" && s !== null && e !== null && (e > s ? now >= s && now < e : now >= s);
        const ye = toMinutes(y?.end);
        const fromYesterday = y?.type === "time" && crossesMidnight(y) && ye !== null && now < ye;
        if (inToday || fromYesterday) onNow++;
      }
    }
    return { shifts, nights, hours: Math.round(minutes / 60), onNow };
  }, [weekStart, staff, rows, prevRows]);

  return (
    <footer className="flex h-10 shrink-0 items-center gap-7 border-t border-border bg-background px-5 text-[13px] text-muted-foreground">
      <span>
        <b className="font-bold text-foreground">{stats.shifts}</b> turnos
      </span>
      <span>
        <b className="font-bold text-foreground">{stats.nights}</b> nocturnos
      </span>
      <span>
        <b className="font-bold text-foreground">{stats.hours.toLocaleString("es-CO")} h</b> programadas
      </span>
      {stats.onNow !== null && (
        <span className="ml-auto" suppressHydrationWarning>
          En turno ahora: <b className="font-bold text-foreground">{stats.onNow}</b>
        </span>
      )}
    </footer>
  );
}
