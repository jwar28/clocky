"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths, format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { getWeekStart, todayInBogota } from "@/lib/utils/date";

interface MiniCalendarProps {
  weekStart: string;
  onPickWeek: (weekStart: string) => void;
}

const HEAD = ["D", "L", "M", "M", "J", "V", "S"];

/** Month grid (Sunday-first) that highlights the visible week; clicking any day jumps to its week. */
export function MiniCalendar({ weekStart, onPickWeek }: MiniCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(parseISO(weekStart)));
  useEffect(() => {
    // Follow the visible week when it moves to another month.
    setMonth(startOfMonth(addDays(parseISO(weekStart), 3)));
  }, [weekStart]);

  const today = todayInBogota();
  const weeks = useMemo(() => {
    const first = parseISO(getWeekStart(month));
    const all = Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)),
    );
    // Drop a trailing week that belongs entirely to the next month.
    return all.filter((week) => week.some((day) => day.getMonth() === month.getMonth()));
  }, [month]);

  const title = format(month, "MMMM yyyy", { locale: es });

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-bold capitalize">{title}</span>
        <div className="flex">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <table className="w-full border-collapse text-center text-xs" role="grid">
        <thead>
          <tr>
            {HEAD.map((h, i) => (
              <th key={i} scope="col" className="py-1 font-semibold text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => {
            const ws = format(week[0]!, "yyyy-MM-dd");
            const active = ws === weekStart;
            return (
              <tr key={ws}>
                {week.map((day, i) => {
                  const iso = format(day, "yyyy-MM-dd");
                  const outside = day.getMonth() !== month.getMonth();
                  const isToday = iso === today;
                  return (
                    <td key={iso} className={cn("p-0", active && "bg-primary-fixed", active && i === 0 && "rounded-l-md", active && i === 6 && "rounded-r-md")}>
                      <button
                        type="button"
                        onClick={() => onPickWeek(ws)}
                        aria-label={format(day, "EEEE d 'de' MMMM", { locale: es })}
                        aria-current={isToday ? "date" : undefined}
                        className={cn(
                          "mx-auto grid h-7 w-7 place-items-center rounded-md tabular-nums transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          outside ? "text-muted-foreground/70" : "text-foreground",
                          active && "font-bold",
                          isToday && "bg-primary font-extrabold text-primary-foreground hover:bg-primary",
                        )}
                      >
                        {format(day, "d")}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
