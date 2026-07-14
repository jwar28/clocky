"use client";

import { ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatWeekLabel, getWeekStart, prevWeek, nextWeek, todayInBogota } from "@/lib/utils/date";

interface WeekNavigatorProps {
  weekStart: string;
  onChange: (newWeekStart: string) => void;
  className?: string;
}

export function WeekNavigator({ weekStart, onChange, className }: WeekNavigatorProps) {
  const currentWeek = getWeekStart(todayInBogota());
  const isOnCurrentWeek = weekStart === currentWeek;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        aria-label="Semana anterior"
        onClick={() => onChange(prevWeek(weekStart))}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-[200px] text-center font-display text-headline-md text-foreground">
        {formatWeekLabel(weekStart)}
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Semana siguiente"
        onClick={() => onChange(nextWeek(weekStart))}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!isOnCurrentWeek && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(currentWeek)}
          className="ml-2 border-primary/40 text-primary hover:bg-primary-container/30 hover:text-primary"
        >
          <Crosshair className="mr-1.5 h-3.5 w-3.5" />
          Ir a semana actual
        </Button>
      )}
    </div>
  );
}