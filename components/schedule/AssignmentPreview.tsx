"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { DayIndex, DayShift, Staff } from "@/lib/types";
import { formatDayRange, isNightShift, shiftLabel } from "@/lib/utils/schedule-merge";

interface AssignmentPreviewProps {
  staffList: Staff[];
  selectedDays: DayIndex[];
  shift: DayShift;
  className?: string;
}

export function AssignmentPreview({
  staffList,
  selectedDays,
  shift,
  className,
}: AssignmentPreviewProps) {
  const totalSlots = staffList.length * selectedDays.length;
  const night = isNightShift(shift);

  return (
    <div
      className={cn(
        "rounded-md border border-outline-variant bg-muted/40 p-3 text-body-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="font-display text-table-header text-foreground">Vista previa</span>
        <span className="text-xs text-muted-foreground">
          {staffList.length} {staffList.length === 1 ? "persona" : "personas"} ×{" "}
          {selectedDays.length} {selectedDays.length === 1 ? "día" : "días"} ={" "}
          {totalSlots} {totalSlots === 1 ? "asignación" : "asignaciones"}
        </span>
      </div>
      {totalSlots === 0 ? (
        <p className="text-muted-foreground">Selecciona al menos una persona y un día.</p>
      ) : (
        <ul className="space-y-1">
          {staffList.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded border border-grid-soft bg-card px-2 py-1.5"
            >
              <Avatar name={s.fullName} size="sm" className="!h-6 !w-6 text-[10px]" />
              <span className="min-w-[140px] truncate font-medium text-foreground">
                {s.fullName}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">{formatDayRange(selectedDays)}</span>
              <span className="text-muted-foreground">·</span>
              <span
                className={cn(
                  "truncate font-medium tabular-nums",
                  night ? "text-tertiary" : "text-ink",
                )}
              >
                {shiftLabel(shift)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}