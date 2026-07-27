"use client";

import { Lock } from "lucide-react";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DayIndex } from "@/lib/types";

interface DayPickerProps {
  value: DayIndex[];
  onChange: (next: DayIndex[]) => void;
  /** Indices that are currently locked for the active staff+week. Locked
   *  days render as ghost (disabled) — they can't be selected for editing
   *  here; unlock them from the main calendar first. */
  lockedDays?: DayIndex[];
  className?: string;
}

const LUN_VIE: DayIndex[] = [1, 2, 3, 4, 5];
const SAB_DOM: DayIndex[] = [6, 0];
const TODOS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

function toggle(current: DayIndex[], idx: DayIndex): DayIndex[] {
  return current.includes(idx) ? current.filter((d) => d !== idx) : [...current, idx];
}

function sameSet(a: DayIndex[], b: DayIndex[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

export function DayPicker({ value, onChange, lockedDays, className }: DayPickerProps) {
  const selected = new Set(value);
  const locked = new Set(lockedDays ?? []);

  function applyPreset(preset: DayIndex[]) {
    if (locked.size === 0) {
      onChange(preset);
      return;
    }
    // Presets may include locked days — strip them so the bulk update
    // never touches a locked day.
    onChange(preset.filter((d) => !locked.has(d)));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {WEEK_DAY_LABELS.map((d) => {
          const active = selected.has(d.index);
          const isLocked = locked.has(d.index);
          const button = (
            <button
              type="button"
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  return;
                }
                onChange(toggle(value, d.index));
              }}
              aria-pressed={active}
              aria-disabled={isLocked}
              className={cn(
                "relative min-w-[56px] rounded-pill border px-3 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isLocked
                  ? "cursor-not-allowed border-outline-variant/40 bg-muted/40 text-muted-foreground/50 hover:bg-muted/40"
                  : active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-outline-variant bg-card text-foreground hover:bg-muted",
              )}
            >
              <span className="inline-flex items-center gap-1">
                {d.short}
                {isLocked && <Lock className="h-3 w-3 opacity-80" aria-hidden />}
              </span>
            </button>
          );
          if (isLocked) {
            return (
              <Tooltip key={d.index}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="top">
                  Día bloqueado. Desbloquéalo desde la malla principal para editarlo.
                </TooltipContent>
              </Tooltip>
            );
          }
          return <div key={d.index}>{button}</div>;
        })}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => applyPreset(LUN_VIE)}
          className={cn(
            "rounded border px-2 py-0.5 transition-colors",
            sameSet(value, LUN_VIE)
              ? "border-primary bg-secondary-container text-primary"
              : "border-outline-variant text-muted-foreground hover:bg-muted",
          )}
        >
          Lun–Vie
        </button>
        <button
          type="button"
          onClick={() => applyPreset(SAB_DOM)}
          className={cn(
            "rounded border px-2 py-0.5 transition-colors",
            sameSet(value, SAB_DOM)
              ? "border-primary bg-secondary-container text-primary"
              : "border-outline-variant text-muted-foreground hover:bg-muted",
          )}
        >
          Sáb–Dom
        </button>
        <button
          type="button"
          onClick={() => applyPreset(TODOS)}
          className={cn(
            "rounded border px-2 py-0.5 transition-colors",
            sameSet(value, TODOS)
              ? "border-primary bg-secondary-container text-primary"
              : "border-outline-variant text-muted-foreground hover:bg-muted",
          )}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => applyPreset([])}
          className={cn(
            "rounded border px-2 py-0.5 transition-colors",
            value.length === 0
              ? "border-primary bg-secondary-container text-primary"
              : "border-outline-variant text-muted-foreground hover:bg-muted",
          )}
        >
          Limpiar
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {lockedDays && lockedDays.length > 0
          ? `${lockedDays.length} ${lockedDays.length === 1 ? "día bloqueado" : "días bloqueados"} — no se pueden editar desde aquí; desbloquéalos en la malla.`
          : value.length === 0
          ? "Ningún día seleccionado — no se puede guardar."
          : `${value.length} ${value.length === 1 ? "día seleccionado" : "días seleccionados"}.`}
      </p>
    </div>
  );
}
