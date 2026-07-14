"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyWeekBannerProps {
  /**
   * Optional. When provided, shows the "Asignar turnos" CTA.
   * Omit to render the banner in read-only mode (e.g. for /equipo).
   */
  onAssign?: () => void;
}

/**
 * Inline banner shown above the grid when the current week has no schedules
 * assigned. In admin mode, surfaces a CTA to assign shifts. In public/reader
 * mode, just informs that the week is empty.
 */
export function EmptyWeekBanner({ onAssign }: EmptyWeekBannerProps) {
  const readOnly = !onAssign;
  return (
    <div
      className={cn(
        "mb-3 flex flex-col items-start justify-between gap-2 rounded-md border border-tertiary-container/40 bg-tertiary-fixed/30 px-4 py-3 sm:flex-row sm:items-center",
      )}
    >
      <div>
        <p className="text-body-sm font-medium text-ink">Esta semana no tiene turnos asignados.</p>
        <p className="text-xs text-muted-foreground">
          {readOnly
            ? "La grilla se muestra vacía (Descanso por default)."
            : "La grilla se muestra vacía (Descanso por default). Usa el botón para empezar."}
        </p>
      </div>
      {onAssign && (
        <Button onClick={onAssign} size="sm" className="text-white">
          <CalendarPlus className="mr-1.5 h-4 w-4" />
          Asignar turnos
        </Button>
      )}
    </div>
  );
}