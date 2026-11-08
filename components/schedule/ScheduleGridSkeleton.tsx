"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { LANE_BACKGROUND } from "./timeline/geometry";

/** Loading state shaped like the week timeline: name column + lanes with placeholder bars. */
export function ScheduleGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)} aria-busy aria-label="Cargando malla">
      <div className="flex h-[74px] border-b border-grid">
        <div className="w-[200px] shrink-0" />
        <div className="grid flex-1 grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-l border-grid px-2 pt-3">
              <Skeleton className="h-5 w-14" />
            </div>
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex border-b border-border">
          <div className="w-[200px] shrink-0 space-y-1.5 px-5 py-3.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="relative h-[66px] flex-1" style={{ background: LANE_BACKGROUND }}>
            {Array.from({ length: 6 }).map((_, d) => (
              <Skeleton
                key={d}
                className="absolute top-4 h-[34px]"
                style={{ left: `${((d + 1) / 7) * 100 + 3.5}%`, width: "5.5%" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
