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
    () => (siteFilter ? staff.filter((s) => s.defaultSite === siteFilter) : staff),
    [staff, siteFilter],
  );

  const sites = useMemo(
    () => sitesFromStore.map((s) => s.name).sort((a, b) => a.localeCompare(b, "es")),
    [sitesFromStore],
  );

  return (
    <div>
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
        <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        <SiteFilter value={siteFilter} sites={sites} onChange={setSiteFilter} />
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="hidden md:block">
          {/* Read-only: omit onCellClick and onAssignWeek */}
          <ScheduleGrid />
        </div>
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