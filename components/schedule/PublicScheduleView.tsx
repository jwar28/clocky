"use client";

import { useEffect, useMemo } from "react";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { useSitesStore } from "@/store/taxonomy-store";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { MobileScheduleCards } from "@/components/schedule/MobileScheduleCards";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { SiteFilter } from "@/components/layout/SiteFilter";
import { worksAtSite } from "@/lib/utils/site";

/**
 * Read-only schedule view shared by `/equipo` (public) and any other place
 * where the team needs to consult shifts without admin controls.
 *
 * - No sidebar, no admin actions, no KPI summary
 * - Cells are not clickable (no `onCellClick` passed to ScheduleGrid)
 * - WeekNavigator + SiteFilter for navigation
 */
export function PublicScheduleView() {
  const weekStart = useUiStore((s) => s.weekStart);
  const setWeekStart = useUiStore((s) => s.setWeekStart);
  const siteFilter = useUiStore((s) => s.siteFilter);
  const setSiteFilter = useUiStore((s) => s.setSiteFilter);

  const staff = useStaffStore((s) => s.staff);
  const staffFetched = useStaffStore((s) => s.fetched);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);

  const byWeek = useScheduleStore((s) => s.byWeek);
  const fetchedWeeks = useScheduleStore((s) => s.fetchedWeeks);
  const fetchWeek = useScheduleStore((s) => s.fetchWeek);

  const sitesFromStore = useSitesStore((s) => s.items);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const sitesFetch = useSitesStore((s) => s.fetch);

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);

  useEffect(() => {
    if (!fetchedWeeks[weekStart]) void fetchWeek(weekStart);
  }, [weekStart, fetchedWeeks, fetchWeek]);

  useEffect(() => {
    if (!sitesFetched) void sitesFetch();
  }, [sitesFetched, sitesFetch]);

  const filteredStaff = useMemo(
    () => staff.filter((s) => worksAtSite(s, byWeek[weekStart]?.find((r) => r.staffId === s.id)?.days, siteFilter)),
    [staff, siteFilter, byWeek, weekStart],
  );

  const sites = useMemo(
    () => sitesFromStore.map((s) => s.name).sort((a, b) => a.localeCompare(b, "es")),
    [sitesFromStore],
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-2.5 sm:px-5">
        <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        <SiteFilter value={siteFilter} sites={sites} onChange={setSiteFilter} />
      </div>

      {/* Read-only: no onCellClick / onAssignWeek */}
      <ScheduleGrid className="hidden flex-1 md:flex" />

      <div className="flex-1 overflow-y-auto px-4 py-4 md:hidden">
        <MobileScheduleCards
          staff={filteredStaff}
          weekStart={weekStart}
          byStaffDays={(sid) => (byWeek[weekStart] ?? []).find((e) => e.staffId === sid)?.days}
          onCellClick={undefined}
        />
      </div>
    </div>
  );
}
