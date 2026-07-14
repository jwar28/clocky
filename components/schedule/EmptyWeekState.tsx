"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { useStaffStore } from "@/store/staff-store";
import { cn } from "@/lib/utils/cn";

interface EmptyWeekStateProps {
  weekStart: string;
  onAssign: () => void;
}

export function EmptyWeekState({ onAssign }: EmptyWeekStateProps) {
  const staff = useStaffStore((s) => s.staff);
  const filtered = staff; // site filter applied at the page level

  return (
    <div className="rounded-lg border border-grid bg-card">
      <div className="flex items-center justify-between border-b border-grid bg-primary px-4 py-2">
        <span className="font-display text-table-header text-primary-foreground">Malla horaria</span>
      </div>
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <CalendarPlus className="h-10 w-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-display text-headline-md">No hay turnos asignados para esta semana</p>
          <p className="text-body-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "empleado visible" : "empleados visibles"} ·{" "}
            {WEEK_DAY_LABELS.length} días
          </p>
        </div>
        <Button onClick={onAssign}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Asignar turnos para esta semana
        </Button>
      </div>
    </div>
  );
}

// Avoid unused import warning
void cn;