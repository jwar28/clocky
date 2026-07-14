"use client";

import { WEEK_DAY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { DayIndex } from "@/lib/types";

interface DayPickerProps {
  value: DayIndex[];
  onChange: (next: DayIndex[]) => void;
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

export function DayPicker({ value, onChange, className }: DayPickerProps) {
  const selected = new Set(value);

  function applyPreset(preset: DayIndex[]) {
    onChange(preset);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {WEEK_DAY_LABELS.map((d) => {
          const active = selected.has(d.index);
          return (
            <button
              key={d.index}
              type="button"
              onClick={() => onChange(toggle(value, d.index))}
              aria-pressed={active}
              className={cn(
                "min-w-[56px] rounded-pill border px-3 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-outline-variant bg-card text-foreground hover:bg-muted",
              )}
            >
              {d.short}
            </button>
          );
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
        {value.length === 0
          ? "Ningún día seleccionado — no se puede guardar."
          : `${value.length} ${value.length === 1 ? "día seleccionado" : "días seleccionados"}.`}
      </p>
    </div>
  );
}