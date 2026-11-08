/**
 * Effective sede resolution. A person has a habitual sede (staff.defaultSite)
 * and any day can override it (DayShift.site) — rotations are weekly or mid-week.
 */
import type { DayIndex, Staff, WeekDays } from "@/lib/types";
import { formatDayRange } from "@/lib/utils/schedule-merge";

const DAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

/** Sede where the person works on a given day. */
export function siteOfDay(staff: Staff, days: WeekDays | undefined, day: DayIndex): string {
  return days?.[day]?.site?.trim() || staff.defaultSite || "";
}

/** True when the day's sede differs from the habitual one. */
export function isRotatedDay(staff: Staff, days: WeekDays | undefined, day: DayIndex): boolean {
  const s = days?.[day]?.site?.trim();
  return Boolean(s) && s !== staff.defaultSite;
}

/** Working days (anything but rest) — sede only matters when the person is there. */
function workingDays(days: WeekDays | undefined): DayIndex[] {
  if (!days) return [];
  return DAYS.filter((d) => days[d] && days[d]!.type !== "rest");
}

/** Distinct sedes the person works at this week, with the days at each. */
export function weekSites(staff: Staff, days: WeekDays | undefined): Array<{ site: string; days: DayIndex[] }> {
  const work = workingDays(days);
  if (work.length === 0) return staff.defaultSite ? [{ site: staff.defaultSite, days: [] }] : [];
  const map = new Map<string, DayIndex[]>();
  for (const d of work) {
    const s = siteOfDay(staff, days, d);
    map.set(s, [...(map.get(s) ?? []), d]);
  }
  return [...map.entries()].map(([site, ds]) => ({ site, days: ds }));
}

/** Does the person work at `site` at some point this week? (Filters and counts.) */
export function worksAtSite(staff: Staff, days: WeekDays | undefined, site: string): boolean {
  if (!site) return true;
  return weekSites(staff, days).some((w) => w.site === site);
}

/**
 * One-line sede description for the week:
 *  - "Fontibón"                                  (habitual, no rotation)
 *  - "Fontibón-Noche"   rotated: true            (whole week elsewhere)
 *  - "Fontibón lun–mié, Fontibón-Noche jue–sáb" rotated: true (mid-week change)
 */
export function weekSiteSummary(staff: Staff, days: WeekDays | undefined): { label: string; rotated: boolean } {
  const ws = weekSites(staff, days);
  if (ws.length === 0) return { label: "", rotated: false };
  const rotated = ws.some((w) => w.site !== staff.defaultSite);
  if (ws.length === 1) return { label: ws[0]!.site, rotated };
  return {
    label: ws.map((w) => `${w.site} ${formatDayRange(w.days).toLowerCase()}`).join(", "),
    rotated,
  };
}
