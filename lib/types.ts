/**
 * Domain types for the Clocky weekly schedule grid.
 * Mirrors the columns and shape of the `staff` and `schedules` tables in InsForge.
 */

export type ShiftType = "time" | "rest" | "available" | "nightIn";

export interface DayShift {
  type: ShiftType;
  start?: string; // 'HH:mm' when type === 'time'
  end?: string;   // 'HH:mm' when type === 'time'
}

/** Indexes (Sunday-first): 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb */
export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekDays = Record<DayIndex, DayShift>;

export interface Staff {
  id: string;
  fullName: string;
  defaultSite: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface WeeklySchedule {
  id: string;
  staffId: string;
  weekStart: string; // ISO date 'YYYY-MM-DD' (Sunday)
  days: WeekDays;
  createdAt?: string;
}

/** Form input for creating/updating a staff member. */
export interface StaffInput {
  fullName: string;
  defaultSite: string;
  role: string;
  active?: boolean;
}

/** Form input for upserting a weekly schedule (one row per staff per week). */
export interface WeeklyScheduleInput {
  staffId: string;
  weekStart: string;
  days: WeekDays;
}