"use client";

import { cn } from "@/lib/utils/cn";
import type { Staff, WeekDays, DayIndex } from "@/lib/types";
import { ScheduleCell } from "./ScheduleCell";

interface ScheduleGridRowProps {
  staff: Staff;
  weekStart: string;
  days: WeekDays | undefined;
  zebra: boolean;
  onCellClick?: (dayIndex: DayIndex) => void;
}

export function ScheduleGridRow({ staff, weekStart, days, zebra, onCellClick }: ScheduleGridRowProps) {
  return (
    <tr className={cn(zebra && "bg-secondary-container")}>
      {/* Sticky Personal */}
      <th
        scope="row"
        className="sticky left-0 z-[1] cell-pad border border-grid bg-inherit text-left align-middle text-body-sm font-semibold text-foreground min-w-[180px]"
      >
        {staff.fullName}
      </th>
      {/* Sticky Sede */}
      <td className="sticky left-[180px] z-[1] cell-pad border border-grid bg-inherit text-left text-body-sm text-muted-foreground min-w-[160px]">
        {staff.defaultSite || "—"}
      </td>
      {/* 7 day cells (Sun → Sat) */}
      {([0, 1, 2, 3, 4, 5, 6] as const).map((idx) => {
        const shift = days?.[idx] ?? { type: "rest" as const };
        return (
          <ScheduleCell
            key={idx}
            shift={shift}
            weekStart={weekStart}
            dayIndex={idx}
            onClick={onCellClick ? () => onCellClick(idx) : undefined}
          />
        );
      })}
    </tr>
  );
}