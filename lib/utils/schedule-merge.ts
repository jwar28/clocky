import { WEEK_DAY_LABELS } from "@/lib/constants";
import type { DayIndex, DayShift, WeekDays } from "@/lib/types";
import { detectNightShift, emptyShift, formatTimeAMPM } from "@/lib/utils/shift";

const ALL_DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * Builds the next WeekDays object for a staff+week by:
 *  - applying `newShift` to every `selectedDays`
 *  - preserving the existing shift on days NOT in selectedDays
 *  - defaulting to rest on unselected days when no existing schedule
 */
export function mergeDays(
  existing: WeekDays | undefined,
  selectedDays: DayIndex[],
  newShift: DayShift,
): WeekDays {
  const selected = new Set<DayIndex>(selectedDays);
  const next = {} as WeekDays;
  for (const idx of ALL_DAYS) {
    if (selected.has(idx)) {
      next[idx] = { ...newShift };
    } else if (existing?.[idx]) {
      next[idx] = { ...existing[idx] };
    } else {
      next[idx] = emptyShift();
    }
  }
  return next;
}

/** Pretty label for a single shift — used in the assignment preview. */
export function shiftLabel(shift: DayShift): string {
  switch (shift.type) {
    case "rest":
      return "Descanso";
    case "available":
      return "Disponible";
    case "nightIn":
      return "Amanece turno noche";
    case "time":
      if (!shift.start || !shift.end) return "Hora (sin rango)";
      return `${formatTimeAMPM(shift.start)} – ${formatTimeAMPM(shift.end)}`;
  }
}

/** Short label for a DayIndex — uses the short weekday name. */
export function dayLabel(idx: DayIndex): string {
  return WEEK_DAY_LABELS.find((d) => d.index === idx)?.short ?? "";
}

/** Compresses consecutive day indexes into a range expression: "Lun–Vie" or "Lun, Mié, Vie". */
export function formatDayRange(days: DayIndex[]): string {
  if (days.length === 0) return "";
  const sorted = [...days].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b));
  // Detect a single contiguous run.
  const idx = sorted.map((d) => ALL_DAYS.indexOf(d));
  let runStart = idx[0]!;
  let runEnd = idx[0]!;
  const runs: Array<[number, number]> = [];
  for (let i = 1; i < idx.length; i++) {
    if (idx[i] === runEnd + 1) {
      runEnd = idx[i]!;
    } else {
      runs.push([runStart, runEnd]);
      runStart = idx[i]!;
      runEnd = idx[i]!;
    }
  }
  runs.push([runStart, runEnd]);
  return runs
    .map(([s, e]) =>
      s === e
        ? dayLabel(ALL_DAYS[s]!)
        : `${dayLabel(ALL_DAYS[s]!)}–${dayLabel(ALL_DAYS[e]!)}`,
    )
    .join(", ");
}

/** Returns true if the shift is a night shift — used to colour preview chips. */
export function isNightShift(shift: DayShift): boolean {
  return detectNightShift(shift);
}