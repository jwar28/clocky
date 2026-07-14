"use client";

import { WEEK_DAY_LABELS } from "@/lib/constants";
import { dayHeaderNumber, dayISO, isToday } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface ScheduleGridHeaderProps {
  weekStart: string;
}

export function ScheduleGridHeader({ weekStart }: ScheduleGridHeaderProps) {
  return (
    <thead className="sticky top-0 z-10">
      <tr className="bg-primary text-primary-foreground">
        <th
          scope="col"
          className="cell-pad border border-grid text-left font-display text-table-header min-w-[180px]"
        >
          Personal
        </th>
        <th
          scope="col"
          className="cell-pad border border-grid text-left font-display text-table-header min-w-[160px]"
        >
          Sede
        </th>
        {WEEK_DAY_LABELS.map((d) => {
          const isCurrentDay = isToday(dayISO(weekStart, d.index));
          return (
            <th
              key={d.index}
              scope="col"
              className={cn(
                "cell-pad border border-grid text-center font-display text-table-header min-w-[150px]",
                isCurrentDay && "border-b-4 border-b-primary-foreground/70",
              )}
            >
              <div className="flex flex-col items-center leading-tight">
                <span className="text-[10px] opacity-80">{dayHeaderNumber(weekStart, d.index)}</span>
                <span className="uppercase tracking-wide">{d.short}</span>
              </div>
              {isCurrentDay && (
                <span
                  aria-hidden
                  className="mt-1 inline-block text-[9px] font-semibold uppercase tracking-wider opacity-90"
                >
                  · hoy ·
                </span>
              )}
              <span className="sr-only">
                {d.long} {dayISO(weekStart, d.index)}
                {isCurrentDay ? " — día de hoy" : ""}
              </span>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}