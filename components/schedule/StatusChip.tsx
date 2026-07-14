"use client";

import { Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ShiftType } from "@/lib/types";

const VARIANTS: Record<ShiftType, { label: string; className: string; icon?: React.ReactNode } | null> = {
  time: null,
  rest: {
    label: "Descanso",
    className: "bg-tertiary-fixed/50 text-tertiary border border-tertiary-container/40",
  },
  available: {
    label: "Disponible",
    className: "bg-tertiary-fixed/40 text-tertiary border border-tertiary-container/50",
  },
  nightIn: {
    label: "Amanece turno noche",
    className: "bg-tertiary-fixed/60 text-tertiary border border-tertiary-container/60 italic",
    icon: <Moon className="mr-1 inline-block h-3 w-3 align-[-1px]" aria-hidden />,
  },
};

interface StatusChipProps {
  type: ShiftType;
  className?: string;
}

export function StatusChip({ type, className }: StatusChipProps) {
  const v = VARIANTS[type];
  if (!v) return null;
  return (
    <span
      title={v.label}
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-data-mono font-medium whitespace-nowrap",
        v.className,
        className,
      )}
    >
      {v.icon}
      {v.label}
    </span>
  );
}