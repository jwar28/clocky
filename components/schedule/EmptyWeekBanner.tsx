"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyWeekBannerProps {
  /** When provided, shows the "Asignar turnos" action. Omit for read-only views (/equipo). */
  onAssign?: () => void;
}

/** Shown above the timeline when nobody has shifts in the visible week. */
export function EmptyWeekBanner({ onAssign }: EmptyWeekBannerProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-dashed border-input bg-muted/60 px-4 py-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-bold text-foreground">Esta semana todavía no tiene turnos</p>
        <p className="text-[13px] text-muted-foreground">
          {onAssign
            ? "Asigna turnos a varias personas a la vez, o haz clic en el día de alguien en la malla."
            : "El equipo aún no ha publicado los turnos de esta semana."}
        </p>
      </div>
      {onAssign && (
        <Button onClick={onAssign} className="h-9 shrink-0 font-bold">
          <CalendarPlus />
          Asignar turnos
        </Button>
      )}
    </div>
  );
}
