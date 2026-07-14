"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export function ScheduleGridSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-grid bg-card">
      <table className="w-full border-collapse text-body-sm">
        <thead className="bg-primary">
          <tr>
            <th className="cell-pad border border-grid text-left">
              <Skeleton className="h-3 w-16 bg-primary-foreground/30" />
            </th>
            <th className="cell-pad border border-grid text-left">
              <Skeleton className="h-3 w-12 bg-primary-foreground/30" />
            </th>
            {WEEK_DAY_LABELS.map((d) => (
              <th key={d.index} className="cell-pad border border-grid text-center">
                <Skeleton className="mx-auto h-3 w-10 bg-primary-foreground/30" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }).map((_, row) => (
            <tr key={row} className={cn(row % 2 === 1 && "bg-secondary-container")}>
              <th className="cell-pad border border-grid text-left">
                <Skeleton className="h-3 w-32" />
              </th>
              <td className="cell-pad border border-grid text-left">
                <Skeleton className="h-3 w-24" />
              </td>
              {WEEK_DAY_LABELS.map((d) => (
                <td key={d.index} className="cell-pad border border-grid text-center">
                  <Skeleton className="mx-auto h-3 w-24" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}