"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ScheduleSummaryCards } from "@/components/schedule/ScheduleSummaryCards";
import { MobileScheduleCards } from "@/components/schedule/MobileScheduleCards";
import { StaffDialog } from "@/components/staff/StaffDialog";
import { ScheduleEditSheet } from "@/components/schedule/ScheduleEditSheet";
import { AREA_LABEL } from "@/lib/constants";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import type { DayIndex, Staff } from "@/lib/types";

export default function SchedulePage() {
  const weekStart = useUiStore((s) => s.weekStart);
  const siteFilter = useUiStore((s) => s.siteFilter);
  const staff = useStaffStore((s) => s.staff);
  const staffLoading = useStaffStore((s) => s.loading);
  const byWeek = useScheduleStore((s) => s.byWeek);
  const schedLoading = useScheduleStore((s) => s.loading);
  const fetchedWeeks = useScheduleStore((s) => s.fetchedWeeks);

  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [focusDay, setFocusDay] = useState<DayIndex | null>(null);

  function onAddStaff() {
    setEditingStaff(null);
    setStaffDialogOpen(true);
  }

  function onAddWeek() {
    setEditingStaffId(null);
    setFocusDay(null);
    setSheetOpen(true);
  }

  function onCellClick(staffId: string, dayIndex: number) {
    setEditingStaffId(staffId);
    setFocusDay(dayIndex as DayIndex);
    setSheetOpen(true);
  }

  const filteredStaff = siteFilter ? staff.filter((s) => s.defaultSite === siteFilter) : staff;

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const activeStaff = useMemo(() => staff.filter((s) => s.active), [staff]);
  const totalStaffCount = activeStaff.length;

  const uniqueSitesCount = useMemo(
    () => new Set(activeStaff.map((s) => s.defaultSite).filter(Boolean)).size,
    [activeStaff],
  );

  const uniqueRolesCount = useMemo(
    () => new Set(activeStaff.map((s) => s.role).filter(Boolean)).size,
    [activeStaff],
  );

  const weekFetched = !!fetchedWeeks[weekStart];
  const assignedSlots = useMemo(() => {
    const rows = byWeek[weekStart] ?? [];
    let count = 0;
    for (const row of rows) {
      for (const idx of [0, 1, 2, 3, 4, 5, 6] as const) {
        const shift = row.days[idx];
        if (shift && shift.type !== "rest") count++;
      }
    }
    return count;
  }, [byWeek, weekStart]);
  const totalSlots = totalStaffCount * 7;

  const summaryLoading =
    (staffLoading && staff.length === 0) || (schedLoading && !weekFetched);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar onAddStaff={onAddStaff} onAddWeek={onAddWeek} />

      {/* Scrollable content area (only this scrolls internally — body stays fixed) */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-4 flex items-baseline gap-3">
          <h1 className="font-display text-headline-xl text-foreground">Malla Horaria</h1>
          <span className="text-body-sm text-muted-foreground">· {AREA_LABEL}</span>
        </div>

        <div className="hidden md:block">
          <ScheduleGrid onCellClick={onCellClick} onAssignWeek={onAddWeek} />
        </div>
        <MobileScheduleCards
          staff={filteredStaff}
          weekStart={weekStart}
          byStaffDays={(sid) => (byWeek[weekStart] ?? []).find((e) => e.staffId === sid)?.days}
          onCellClick={onCellClick}
        />
      </div>

      {/* Bottom KPI summary (not sticky — already at end of flex column) */}
      <div className="shrink-0 border-t border-outline-variant bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ScheduleSummaryCards
          totalStaff={totalStaffCount}
          uniqueSites={uniqueSitesCount}
          uniqueRoles={uniqueRolesCount}
          assignedSlots={assignedSlots}
          totalSlots={totalSlots}
          loading={summaryLoading}
        />
      </div>

      <StaffDialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen} staff={editingStaff} />

      <ScheduleEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        weekStart={weekStart}
        initialStaffId={editingStaffId}
        initialDayIndex={focusDay}
      />
    </div>
  );
}