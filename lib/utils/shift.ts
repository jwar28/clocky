/**
 * Shift helpers — formatting and night-shift detection.
 */

import type { DayShift } from "@/lib/types";

const NIGHT_START_THRESHOLD = "20:00"; // shifts starting at or after this are "noche"
const NIGHT_END_THRESHOLD = "06:00";   // shifts ending at or before this are "noche"

/**
 * Returns true if the given shift's time range looks like a night shift
 * (start in the evening OR end in the early morning).
 */
export function detectNightShift(shift: DayShift): boolean {
  if (shift.type !== "time") return false;
  if (!shift.start || !shift.end) return false;
  return shift.start >= NIGHT_START_THRESHOLD || shift.end <= NIGHT_END_THRESHOLD;
}

/** "06:00" -> "6:00 a.m." */
export function formatTimeAMPM(hhmm: string | undefined): string {
  if (!hhmm) return "";
  const [hhStr, mm] = hhmm.split(":");
  const hh = Number.parseInt(hhStr ?? "0", 10);
  if (Number.isNaN(hh)) return hhmm;
  const period = hh < 12 ? "a.m." : "p.m.";
  const hh12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hh12}:${mm} ${period}`;
}

/** Empty shift for fresh weeks. */
export function emptyShift(): DayShift {
  return { type: "rest" };
}

/** Build all 7 days as rest — used as the default for new weekly schedules. */
export function emptyWeek(): Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayShift> {
  return {
    0: { type: "rest" },
    1: { type: "rest" },
    2: { type: "rest" },
    3: { type: "rest" },
    4: { type: "rest" },
    5: { type: "rest" },
    6: { type: "rest" },
  };
}
/** "HH:mm" -> minutes since midnight. Returns null on malformed input. */
export function toMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  if (h === undefined || Number.isNaN(h)) return null;
  return h * 60 + (m !== undefined && !Number.isNaN(m) ? m : 0);
}

/** Duration in minutes; a shift whose end ≤ start crosses midnight. */
export function shiftDurationMinutes(shift: DayShift): number | null {
  const s = toMinutes(shift.start);
  const e = toMinutes(shift.end);
  if (s === null || e === null) return null;
  const d = e - s;
  return d > 0 ? d : d + 24 * 60;
}

/** True when the shift ends on the following calendar day. */
export function crossesMidnight(shift: DayShift): boolean {
  const s = toMinutes(shift.start);
  const e = toMinutes(shift.end);
  return s !== null && e !== null && e <= s;
}

/** Compact bar label: "06–15", "06:30–15". */
export function compactTime(hhmm: string | undefined): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":");
  return m && m !== "00" ? `${h}:${m}` : (h ?? "");
}

/** "9 h" / "7 h 30 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
