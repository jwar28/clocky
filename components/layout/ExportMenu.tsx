"use client";

import { useMemo, useState } from "react";
import { Calendar, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportMonthToExcel, exportWeekToExcel } from "@/lib/utils/excel-export";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { worksAtSite } from "@/lib/utils/site";
import type { WeekDays } from "@/lib/types";

interface ExportMenuProps {
  /** Currently active site filter — limits rows and labels the file. */
  siteFilter?: string;
}

export function ExportMenu({ siteFilter }: ExportMenuProps) {
  const weekStart = useUiStore((s) => s.weekStart);
  const allStaff = useStaffStore((s) => s.staff);
  const fetchWeek = useScheduleStore((s) => s.fetchWeek);
  const byWeek = useScheduleStore((s) => s.byWeek);

  const [busy, setBusy] = useState<null | "week" | "month">(null);

  // Filter by where people actually work this week (rotations included).
  const staff = useMemo(
    () =>
      allStaff.filter((s) =>
        worksAtSite(s, byWeek[weekStart]?.find((r) => r.staffId === s.id)?.days, siteFilter ?? ""),
      ),
    [allStaff, siteFilter, byWeek, weekStart],
  );

  const byStaffDays = useMemo(() => {
    const list = byWeek[weekStart] ?? [];
    const map = new Map<string, WeekDays>();
    for (const e of list) map.set(e.staffId, e.days);
    return (sid: string) => map.get(sid);
  }, [byWeek, weekStart]);

  async function handleExportWeek() {
    setBusy("week");
    try {
      await exportWeekToExcel({
        weekStart,
        staff,
        byStaffDays,
        filterLabel: siteFilter || undefined,
      });
      toast.success("Semana exportada a Excel");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo exportar la semana");
    } finally {
      setBusy(null);
    }
  }

  async function handleExportMonth() {
    setBusy("month");
    try {
      await exportMonthToExcel({
        weekStart,
        staff,
        byStaffDays,
        daysForWeek: (ws, sid) =>
          useScheduleStore.getState().byWeek[ws]?.find((r) => r.staffId === sid)?.days,
        fetchWeek,
        filterLabel: siteFilter || undefined,
      });
      toast.success("Mes exportado a Excel");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo exportar el mes");
    } finally {
      setBusy(null);
    }
  }

  const disabled = staff.length === 0 || busy !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} aria-label="Exportar a Excel" className="h-9 shrink-0 px-3 xl:px-4">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden xl:inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuLabel>Descargar Excel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleExportWeek();
          }}
          disabled={busy !== null}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Esta semana</span>
          <span className="ml-auto text-xs text-muted-foreground">.xlsx</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void handleExportMonth();
          }}
          disabled={busy !== null}
        >
          <Calendar className="h-4 w-4" />
          <span>Este mes</span>
          <span className="ml-auto text-xs text-muted-foreground">.xlsx</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}