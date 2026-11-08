/** Shared geometry for the week timeline (Marey-style continuous week). */

export const MIN_PER_DAY = 24 * 60;
export const MIN_PER_WEEK = 7 * MIN_PER_DAY;

/** Fraction (0–1) of the week for a day index + minutes into that day. */
export function weekFrac(dayIndex: number, minutes: number): number {
  return (dayIndex * MIN_PER_DAY + minutes) / MIN_PER_WEEK;
}

export function pct(frac: number): string {
  return `${(frac * 100).toFixed(4)}%`;
}

/** Lane background: day dividers (stronger) + 6-hour subticks (faint). */
export const LANE_BACKGROUND =
  "linear-gradient(90deg, hsl(var(--grid)) 1px, transparent 1px) 0 0 / calc(100% / 7) 100%," +
  "linear-gradient(90deg, hsl(var(--grid-soft)) 1px, transparent 1px) 0 0 / calc(100% / 28) 100%";
