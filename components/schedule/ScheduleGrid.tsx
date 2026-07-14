"use client";

import { useEffect, useMemo } from "react";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { ScheduleGridHeader } from "./ScheduleGridHeader";
import { ScheduleGridRow } from "./ScheduleGridRow";
import { ScheduleGridSkeleton } from "./ScheduleGridSkeleton";
import { EmptyWeekBanner } from "./EmptyWeekBanner";
import { Skeleton } from "@/components/ui/skeleton";

interface ScheduleGridProps {
  /** Optional. When omitted, cells are rendered read-only (no hover, no click). */
  onCellClick?: (staffId: string, dayIndex: number) => void;
  /** Optional. When omitted, the empty-week banner renders in read-only mode (no CTA). */
  onAssignWeek?: () => void;
}

export function ScheduleGrid({ onCellClick, onAssignWeek }: ScheduleGridProps) {
  const weekStart = useUiStore((s) => s.weekStart);
  const siteFilter = useUiStore((s) => s.siteFilter);

  const { staff, loading: staffLoading, fetched: staffFetched, fetchStaff } = useStaffStore();
  const { byWeek, loading: schedLoading, fetchedWeeks, fetchWeek } = useScheduleStore();

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);

  useEffect(() => {
    if (!fetchedWeeks[weekStart]) void fetchWeek(weekStart);
  }, [weekStart, fetchedWeeks, fetchWeek]);

  const filteredStaff = useMemo(
    () => (siteFilter ? staff.filter((s) => s.defaultSite === siteFilter) : staff),
    [staff, siteFilter],
  );

  const weekRows = byWeek[weekStart] ?? [];

  const isStaffLoading = staffLoading && !staffFetched;
  const isWeekLoading = schedLoading && !fetchedWeeks[weekStart];

  if (isStaffLoading || isWeekLoading) {
    return <ScheduleGridSkeleton />;
  }

  if (staffFetched && staff.length === 0) {
    return (
      <div className="rounded-lg border border-grid bg-card p-8 text-center">
        <p className="font-display text-headline-md">Sin personal registrado</p>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Agrega tu primer empleado con el botón &ldquo;Nuevo empleado&rdquo;.
        </p>
      </div>
    );
  }

  // If a site filter is active and yields zero results, show a small empty state
  // inside the table instead of an entirely blank grid.
  if (siteFilter && filteredStaff.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-grid bg-card">
        <table className="w-full min-w-[1100px] border-collapse text-body-sm">
          <ScheduleGridHeader weekStart={weekStart} />
          <tbody>
            <tr>
              <td
                colSpan={9}
                className="cell-pad border border-grid bg-card text-center text-body-sm text-muted-foreground"
              >
                Ningún empleado coincide con el filtro &ldquo;{siteFilter}&rdquo;.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Filler rows only when no filter and total staff < 9.
  const showFillers = !siteFilter && staff.length < 9;
  const fillerCount = showFillers ? Math.max(0, 9 - filteredStaff.length) : 0;

  // Banner above the grid when the week has no schedules (still renders the grid below).
  const showEmptyBanner = fetchedWeeks[weekStart] && weekRows.length === 0;

  return (
    <div>
      {showEmptyBanner && <EmptyWeekBanner onAssign={onAssignWeek} />}
      <div className="overflow-x-auto rounded-lg border border-grid bg-card">
        <table className="w-full min-w-[1100px] border-collapse text-body-sm">
          <ScheduleGridHeader weekStart={weekStart} />
          <tbody className="row-zebra">
            {filteredStaff.map((s, idx) => {
              const entry = weekRows.find((r) => r.staffId === s.id);
              return (
                <ScheduleGridRow
                  key={s.id}
                  staff={s}
                  weekStart={weekStart}
                  days={entry?.days}
                  zebra={idx % 2 === 1}
                  onCellClick={
                    onCellClick
                      ? (dayIndex) => onCellClick(s.id, dayIndex)
                      : undefined
                  }
                />
              );
            })}
            {Array.from({ length: fillerCount }).map((_, i) => (
              <tr key={`filler-${i}`} className={cnFiller(i + filteredStaff.length)}>
                <th className="cell-pad border border-grid text-left">
                  <Skeleton className="h-3 w-32" />
                </th>
                <td className="cell-pad border border-grid text-left">
                  <Skeleton className="h-3 w-24" />
                </td>
                {Array.from({ length: 7 }).map((__, day) => (
                  <td key={day} className="cell-pad border border-grid text-center">
                    <Skeleton className="mx-auto h-3 w-20" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cnFiller(idx: number): string {
  return idx % 2 === 1 ? "bg-secondary-container" : "";
}