"use client";

import { useEffect, useMemo, useState } from "react";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { getWeekStart, nowMinutesInBogota, todayInBogota } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { worksAtSite } from "@/lib/utils/site";
import type { DayIndex } from "@/lib/types";
import { ScheduleGridSkeleton } from "./ScheduleGridSkeleton";
import { EmptyWeekBanner } from "./EmptyWeekBanner";
import { TimelineHeader } from "./timeline/TimelineHeader";
import { TimelineLane } from "./timeline/TimelineLane";
import { weekFrac } from "./timeline/geometry";

interface ScheduleGridProps {
  /** Optional. When omitted, the timeline is read-only (no click to edit). */
  onCellClick?: (staffId: string, dayIndex: number) => void;
  /** Optional. When omitted, lock badges are read-only. */
  onCellLockToggle?: (staffId: string, dayIndex: number) => void;
  /** Optional. When omitted, the empty-week banner renders without a CTA. */
  onAssignWeek?: () => void;
  className?: string;
}

export function normalizeName(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Live position of "now" within the visible week, or null when the week isn't the current one. */
function useNowFrac(weekStart: string): number | null {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(() => {
    void tick;
    const today = todayInBogota();
    if (getWeekStart(today) !== weekStart) return null;
    const dow = new Date(`${today}T12:00:00`).getDay();
    return weekFrac(dow, nowMinutesInBogota());
  }, [weekStart, tick]);
}

function formatNow() {
  const m = nowMinutesInBogota();
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * Week timeline ("gráfico de marcha"): one continuous 168-hour lane per person.
 * Shifts are bars on that lane, so night shifts cross midnight as one bar.
 */
export function ScheduleGrid({ onCellClick, onCellLockToggle, onAssignWeek, className }: ScheduleGridProps) {
  const weekStart = useUiStore((s) => s.weekStart);
  const siteFilter = useUiStore((s) => s.siteFilter);
  const staffQuery = useUiStore((s) => s.staffQuery);
  const setStaffQuery = useUiStore((s) => s.setStaffQuery);
  const setSiteFilter = useUiStore((s) => s.setSiteFilter);

  const { staff, loading: staffLoading, fetched: staffFetched, fetchStaff } = useStaffStore();
  const { byWeek, loading: schedLoading, fetchedWeeks, fetchWeek } = useScheduleStore();

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);

  useEffect(() => {
    if (!fetchedWeeks[weekStart]) void fetchWeek(weekStart);
  }, [weekStart, fetchedWeeks, fetchWeek]);

  const weekRowsForFilter = byWeek[weekStart];
  const rows = useMemo(() => {
    const q = normalizeName(staffQuery.trim());
    return staff.filter(
      (s) =>
        worksAtSite(s, weekRowsForFilter?.find((r) => r.staffId === s.id)?.days, siteFilter) &&
        (!q || normalizeName(s.fullName).includes(q)),
    );
  }, [staff, siteFilter, staffQuery, weekRowsForFilter]);

  const nowFrac = useNowFrac(weekStart);
  const weekRows = byWeek[weekStart] ?? [];

  if ((staffLoading && !staffFetched) || (schedLoading && !fetchedWeeks[weekStart])) {
    return <ScheduleGridSkeleton className={className} />;
  }

  if (staffFetched && staff.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <p className="text-lg font-bold">Sin personal registrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega tu primer empleado desde &ldquo;Nuevo empleado&rdquo; para empezar la malla.
          </p>
        </div>
      </div>
    );
  }

  const showEmptyBanner = fetchedWeeks[weekStart] && weekRows.length === 0;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {showEmptyBanner && (
        <div className="px-5 py-3">
          <EmptyWeekBanner onAssign={onAssignWeek} />
        </div>
      )}
      <div
        className="relative min-h-0 flex-1 overflow-auto"
        style={{ "--name-col": "200px" } as React.CSSProperties}
      >
        <div className="relative min-w-[1120px]">
          <TimelineHeader
            weekStart={weekStart}
            count={rows.length}
            now={nowFrac !== null && rows.length > 0 ? { frac: nowFrac, label: formatNow() } : null}
          />

          <div className="relative">
            {rows.length === 0 ? (
              <div className="px-5 py-10">
                <p className="text-sm font-bold text-foreground">
                  Nadie coincide con
                  {staffQuery.trim() ? <> &ldquo;{staffQuery.trim()}&rdquo;</> : null}
                  {siteFilter ? <> en la sede {siteFilter}</> : null}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStaffQuery("");
                    setSiteFilter("");
                  }}
                  className="mt-3 h-9 rounded-lg border border-input px-3 text-sm font-bold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Ver a todo el equipo
                </button>
              </div>
            ) : (
              rows.map((s) => {
                const entry = weekRows.find((r) => r.staffId === s.id);
                return (
                  <TimelineLane
                    key={s.id}
                    staff={s}
                    weekStart={weekStart}
                    days={entry?.days}
                    onDayClick={onCellClick ? (d: DayIndex) => onCellClick(s.id, d) : undefined}
                    onLockToggle={onCellLockToggle ? (d: DayIndex) => onCellLockToggle(s.id, d) : undefined}
                  />
                );
              })
            )}

            {nowFrac !== null && rows.length > 0 && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 z-[4] w-0.5 bg-primary"
                style={{ left: `calc(var(--name-col) + (100% - var(--name-col)) * ${nowFrac.toFixed(5)})` }}
              >
                <span className="absolute -left-[3px] -top-[4px] h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
