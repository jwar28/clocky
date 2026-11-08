"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { getWeekStart, prevWeek, todayInBogota } from "@/lib/utils/date";
import { worksAtSite } from "@/lib/utils/site";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { ScheduleGrid, normalizeName } from "@/components/schedule/ScheduleGrid";
import { WeekStatsBar } from "@/components/schedule/WeekStatsBar";
import { MobileScheduleCards } from "@/components/schedule/MobileScheduleCards";
import { StaffDialog } from "@/components/staff/StaffDialog";
import { ScheduleEditSheet } from "@/components/schedule/ScheduleEditSheet";
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
  const toggleDayLock = useScheduleStore((s) => s.toggleDayLock);
  const pendingAssign = useUiStore((s) => s.pendingAssign);
  const clearAssign = useUiStore((s) => s.clearAssign);
  const staffQuery = useUiStore((s) => s.staffQuery);
  const setStaffQuery = useUiStore((s) => s.setStaffQuery);
  const setWeekStart = useUiStore((s) => s.setWeekStart);

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

  // Load the previous week too, so "en turno ahora" sees Saturday night shifts on Sunday.
  const fetchWeek = useScheduleStore((s) => s.fetchWeek);
  useEffect(() => {
    const prev = prevWeek(weekStart);
    if (weekStart === getWeekStart(todayInBogota()) && !fetchedWeeks[prev]) void fetchWeek(prev);
  }, [weekStart, fetchedWeeks, fetchWeek]);

  // Sidebar "Asignar turnos" (possibly from another route) opens the sheet here.
  useEffect(() => {
    if (!pendingAssign) return;
    clearAssign();
    setEditingStaffId(null);
    setFocusDay(null);
    setSheetOpen(true);
  }, [pendingAssign, clearAssign]);

  function onCellClick(staffId: string, dayIndex: number) {
    setEditingStaffId(staffId);
    setFocusDay(dayIndex as DayIndex);
    setSheetOpen(true);
  }

  async function onCellLockToggle(staffId: string, dayIndex: number) {
    const staffMember = staff.find((s) => s.id === staffId);
    const day = dayIndex as DayIndex;
    try {
      const nextLocked = await toggleDayLock(staffId, weekStart, day);
      const name = staffMember ? ` para ${staffMember.fullName}` : "";
      toast.success(nextLocked ? `Día bloqueado${name}` : `Día desbloqueado${name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar bloqueo");
    }
  }

  const filteredStaff = useMemo(() => {
    const q = normalizeName(staffQuery.trim());
    return staff.filter(
      (s) =>
        worksAtSite(s, byWeek[weekStart]?.find((r) => r.staffId === s.id)?.days, siteFilter) &&
        (!q || normalizeName(s.fullName).includes(q)),
    );
  }, [staff, siteFilter, staffQuery, byWeek, weekStart]);

  const weekFetched = !!fetchedWeeks[weekStart];
  const statsReady = !(staffLoading && staff.length === 0) && !(schedLoading && !weekFetched);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden md:h-screen">
      <h1 className="sr-only">Malla horaria</h1>
      <div className="hidden md:contents">
        <TopBar onAddStaff={onAddStaff} />
        <ScheduleGrid
          className="flex-1"
          onCellClick={onCellClick}
          onCellLockToggle={onCellLockToggle}
          onAssignWeek={onAddWeek}
        />
        {statsReady && (
          <WeekStatsBar
            weekStart={weekStart}
            staff={filteredStaff}
            rows={byWeek[weekStart] ?? []}
            prevRows={byWeek[prevWeek(weekStart)]}
          />
        )}
      </div>

      <div className="shrink-0 space-y-2.5 border-b border-border px-4 py-3 md:hidden">
        <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
        <div className="flex gap-2">
          <label className="relative flex h-10 min-w-0 flex-1 items-center">
            <span className="sr-only">Buscar persona</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={staffQuery}
              onChange={(e) => setStaffQuery(e.target.value)}
              placeholder="Buscar persona"
              className="h-full w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </label>
          <Button onClick={onAddWeek} className="h-10 shrink-0 font-bold">
            <Plus />
            Asignar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:hidden">
        {filteredStaff.length === 0 && staff.length > 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nadie coincide con la búsqueda.</p>
        )}
        <MobileScheduleCards
          staff={filteredStaff}
          weekStart={weekStart}
          byStaffDays={(sid) => (byWeek[weekStart] ?? []).find((e) => e.staffId === sid)?.days}
          onCellClick={onCellClick}
          onCellLockToggle={onCellLockToggle}
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
