"use client";

import { WEEK_DAY_LABELS } from "@/lib/constants";
import { dayHeaderNumber, dayISO, isToday } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface TimelineHeaderProps {
  weekStart: string;
  count: number;
  /** Current time marker; its label sits on the hour ruler so it never hides under the sticky header. */
  now?: { frac: number; label: string } | null;
}

/** Sticky axis: person column label + 7 days, each with 0/6/12/18 ticks. */
export function TimelineHeader({ weekStart, count, now }: TimelineHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex border-b border-grid bg-background">
      <div className="sticky left-0 z-10 flex w-[var(--name-col)] shrink-0 items-end bg-background px-5 pb-[26px] text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {count} {count === 1 ? "persona" : "personas"}
      </div>
      <div className="relative grid flex-1 grid-cols-7" role="row">
        {WEEK_DAY_LABELS.map((d) => {
          const today = isToday(dayISO(weekStart, d.index));
          return (
            <div
              key={d.index}
              role="columnheader"
              className="border-l border-grid pt-2.5"
              aria-label={`${d.long} ${dayHeaderNumber(weekStart, d.index)}${today ? ", hoy" : ""}`}
            >
              <div className={cn("flex items-baseline gap-1.5 px-2", today ? "text-primary" : "text-foreground")}>
                <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", !today && "text-muted-foreground")}>
                  {d.short}
                  {today && <span className="ml-1.5">hoy</span>}
                </span>
                <span className="text-[22px] font-extrabold leading-none tracking-tight">
                  {dayHeaderNumber(weekStart, d.index)}
                </span>
              </div>
              <div aria-hidden className="mt-1.5 grid grid-cols-4 border-t border-border text-[10.5px] text-muted-foreground">
                {[0, 6, 12, 18].map((h, i) => (
                  <span key={h} className={cn("py-0.5 pl-1", i > 0 && "border-l border-border")}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {now && (
          <span
            aria-label={`Hora actual ${now.label}`}
            suppressHydrationWarning
            className="pointer-events-none absolute bottom-[3px] z-10 rounded bg-primary px-1.5 py-px text-[10.5px] font-extrabold leading-[14px] text-primary-foreground shadow-[0_0_0_2px_hsl(var(--background))]"
            style={{
              left: `${(now.frac * 100).toFixed(4)}%`,
              // Centered on the line; pinned inward near either edge of the week.
              transform: now.frac < 0.012 ? "translateX(-1px)" : now.frac > 0.988 ? "translateX(calc(-100% + 1px))" : "translateX(-50%)",
            }}
          >
            {now.label}
          </span>
        )}
      </div>
    </div>
  );
}
