/**
 * Date utilities — week math for the Sunday → Saturday layout.
 * All weekStart values are ISO date strings 'YYYY-MM-DD' representing Sunday.
 */

import { format, parseISO, addDays, startOfDay, isValid, subWeeks, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import type { DayIndex } from "@/lib/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the Sunday on or before the given date as an ISO 'YYYY-MM-DD'.
 * (Week layout is Sunday → Saturday.)
 */
export function getWeekStart(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) throw new Error(`Invalid date: ${date}`);
  const dow = d.getDay(); // 0 = Sunday ... 6 = Saturday
  // To get the Sunday on/before d, subtract `dow` days.
  const diff = -dow;
  const sunday = startOfDay(addDays(d, diff));
  return format(sunday, "yyyy-MM-dd");
}

export function addWeeksISO(weekStartISO: string, n: number): string {
  const d = parseISO(weekStartISO);
  return format(addWeeks(d, n), "yyyy-MM-dd");
}

export function prevWeek(weekStartISO: string): string {
  return addWeeksISO(weekStartISO, -1);
}

export function nextWeek(weekStartISO: string): string {
  return addWeeksISO(weekStartISO, 1);
}

/**
 * Returns Date for a specific DayIndex within the given week.
 */
export function dayDate(weekStartISO: string, dayIndex: DayIndex): Date {
  return addDays(parseISO(weekStartISO), dayIndex);
}

/** ISO 'YYYY-MM-DD' string for a specific DayIndex within the given week. */
export function dayISO(weekStartISO: string, dayIndex: DayIndex): string {
  return format(dayDate(weekStartISO, dayIndex), "yyyy-MM-dd");
}

/**
 * "Semana N — Mes Año" (e.g., "Semana 2 — Julio 2026") for display in the TopBar.
 */
export function formatWeekLabel(weekStartISO: string): string {
  const sunday = parseISO(weekStartISO);
  const saturday = addDays(sunday, 6);
  const monthSunday = format(sunday, "MMMM", { locale: es });
  const monthSaturday = format(saturday, "MMMM", { locale: es });

  const capitalizedMonth = monthSunday.charAt(0).toUpperCase() + monthSunday.slice(1);

  if (monthSunday === monthSaturday) {
    return `Semana ${getWeekOfMonth(sunday)} — ${capitalizedMonth} ${format(sunday, "yyyy")}`;
  }
  const capMonthSat = monthSaturday.charAt(0).toUpperCase() + monthSaturday.slice(1);
  return `Semana ${getWeekOfMonth(sunday)} — ${capitalizedMonth}/${capMonthSat} ${format(sunday, "yyyy")}`;
}

/** Day-of-month shown in the day column header (the small number above the day name). */
export function dayHeaderNumber(weekStartISO: string, dayIndex: DayIndex): string {
  return format(dayDate(weekStartISO, dayIndex), "d");
}

/**
 * Returns today's date (YYYY-MM-DD) in Colombia (America/Bogota, UTC-5).
 *
 * We don't use `new Date().toISOString().slice(0, 10)` because that returns
 * the UTC date — which can be off by ±1 day depending on the user's local
 * timezone. `Intl.DateTimeFormat` with `timeZone: "America/Bogota"` gives
 * us the wall-clock date in Colombia regardless of where the browser runs.
 */
export function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Returns true if `dayIso` (YYYY-MM-DD) equals today in Colombia. */
export function isToday(dayIso: string): boolean {
  return dayIso === todayInBogota();
}

function getWeekOfMonth(date: Date): number {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = first.getDay();
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
/**
 * Compact range label for the top bar: "1 – 7 nov 2026",
 * "29 nov – 5 dic 2026", "27 dic 2026 – 2 ene 2027".
 */
export function formatRangeLabel(weekStartISO: string): string {
  const sunday = parseISO(weekStartISO);
  const saturday = addDays(sunday, 6);
  const m = (d: Date) => format(d, "MMM", { locale: es }).replace(".", "");
  if (sunday.getFullYear() !== saturday.getFullYear()) {
    return `${format(sunday, "d")} ${m(sunday)} ${format(sunday, "yyyy")} – ${format(saturday, "d")} ${m(saturday)} ${format(saturday, "yyyy")}`;
  }
  if (sunday.getMonth() !== saturday.getMonth()) {
    return `${format(sunday, "d")} ${m(sunday)} – ${format(saturday, "d")} ${m(saturday)} ${format(saturday, "yyyy")}`;
  }
  return `${format(sunday, "d")} – ${format(saturday, "d")} ${m(saturday)} ${format(saturday, "yyyy")}`;
}

/** Current wall-clock minutes since midnight in Colombia (0–1439). */
export function nowMinutesInBogota(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const min = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + min;
}
