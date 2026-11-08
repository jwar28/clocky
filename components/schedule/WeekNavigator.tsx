"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatRangeLabel, getWeekStart, nextWeek, prevWeek, todayInBogota } from "@/lib/utils/date";

interface WeekNavigatorProps {
  weekStart: string;
  onChange: (newWeekStart: string) => void;
  className?: string;
}

/** Calendar-style week navigation: [Hoy] ‹ › "1 – 7 nov 2026". */
export function WeekNavigator({ weekStart, onChange, className }: WeekNavigatorProps) {
  const currentWeek = getWeekStart(todayInBogota());
  const isOnCurrentWeek = weekStart === currentWeek;

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <Button
        variant="outline"
        size="sm"
        className="mr-2 h-9 px-4 font-bold"
        onClick={() => onChange(currentWeek)}
        aria-label="Ir a la semana actual"
        aria-current={isOnCurrentWeek ? "date" : undefined}
      >
        Hoy
      </Button>
      <Button variant="ghost" size="icon" aria-label="Semana anterior" onClick={() => onChange(prevWeek(weekStart))}>
        <ChevronLeft />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Semana siguiente" onClick={() => onChange(nextWeek(weekStart))}>
        <ChevronRight />
      </Button>
      <h1 className="ml-1.5 whitespace-nowrap text-lg lg:ml-2 lg:text-[21px] font-bold tracking-tight text-foreground" aria-live="polite">
        {formatRangeLabel(weekStart)}
      </h1>
    </div>
  );
}
