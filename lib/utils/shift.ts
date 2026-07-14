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