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

  const staff = useMemo(
    () =>
      siteFilter
        ? allStaff.filter((s) => s.defaultSite === siteFilter)
        : allStaff,
    [allStaff, siteFilter],
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
        <Button variant="outline" disabled={disabled} aria-label="Exportar a Excel">
          {busy ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-4 w-4" />
          )}
          <span className="hidden sm:inline">Exportar</span>
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