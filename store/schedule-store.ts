"use client";

import { create } from "zustand";
import { getInsForge } from "@/lib/insforge";
import type { DayIndex, DayShift, WeekDays, WeeklySchedule, WeeklyScheduleInput } from "@/lib/types";
import { emptyWeek } from "@/lib/utils/shift";
import { mergeDays } from "@/lib/utils/schedule-merge";

interface ScheduleState {
  byWeek: Record<string, WeeklySchedule[]>;
  loading: boolean;
  error: string | null;
  fetchedWeeks: Record<string, boolean>;
  fetchWeek: (weekStart: string) => Promise<void>;
  upsertSchedule: (input: WeeklyScheduleInput) => Promise<void>;
  /**
   * Bulk-upsert: applies the same newShift to `selectedDays` for each staff
   * in `inputs`. Days not in `selectedDays` are preserved from existing
   * schedules (or default to rest). Runs all upserts in parallel.
   * Returns the number of schedules written.
   */
  bulkUpsert: (
    inputs: Array<{
      staffId: string;
      weekStart: string;
      selectedDays: DayIndex[];
      newShift: DayShift;
    }>,
  ) => Promise<number>;
  removeSchedule: (staffId: string, weekStart: string) => Promise<void>;
  reset: () => void;
}

type ScheduleRow = {
  id: string;
  staff_id: string;
  week_start: string;
  days: WeekDays;
  created_at?: string;
};

function mapRow(row: ScheduleRow): WeeklySchedule {
  return {
    id: row.id,
    staffId: row.staff_id,
    weekStart: row.week_start,
    days: row.days,
    createdAt: row.created_at,
  };
}

function defaultDays(): WeekDays {
  return emptyWeek();
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  byWeek: {},
  loading: false,
  error: null,
  fetchedWeeks: {},

  async fetchWeek(weekStart) {
    set({ loading: true, error: null });
    try {
      const insforge = getInsForge();
      const { data, error } = await insforge.database
        .from("schedules")
        .select("id, staff_id, week_start, days, created_at")
        .eq("week_start", weekStart);
      if (error) throw new Error(error.message);
      const list = (data ?? []).map((r) => mapRow(r as unknown as ScheduleRow));
      set((state) => ({
        byWeek: { ...state.byWeek, [weekStart]: list },
        loading: false,
        fetchedWeeks: { ...state.fetchedWeeks, [weekStart]: true },
        error: null,
      }));
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Error al cargar horarios",
        fetchedWeeks: { ...get().fetchedWeeks, [weekStart]: true },
      });
    }
  },

  async upsertSchedule(input) {
    try {
      const insforge = getInsForge();
      // Fill missing days with default rest so the JSON is complete.
      const fullDays: WeekDays = { ...defaultDays(), ...input.days };
      const { data, error } = await insforge.database
        .from("schedules")
        .upsert(
          {
            staff_id: input.staffId,
            week_start: input.weekStart,
            days: fullDays,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "staff_id,week_start" },
        )
        .select("id, staff_id, week_start, days, created_at")
        .single();
      if (error) throw new Error(error.message);
      const upserted = mapRow(data as unknown as ScheduleRow);
      set((state) => {
        const current = state.byWeek[input.weekStart] ?? [];
        const without = current.filter((s) => s.staffId !== input.staffId);
        return {
          byWeek: {
            ...state.byWeek,
            [input.weekStart]: [...without, upserted],
          },
        };
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar horario";
      set({ error: msg });
      throw e;
    }
  },

  async removeSchedule(staffId, weekStart) {
    try {
      const insforge = getInsForge();
      const { error } = await insforge.database
        .from("schedules")
        .delete()
        .eq("staff_id", staffId)
        .eq("week_start", weekStart);
      if (error) throw new Error(error.message);
      set((state) => ({
        byWeek: {
          ...state.byWeek,
          [weekStart]: (state.byWeek[weekStart] ?? []).filter((s) => s.staffId !== staffId),
        },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar horario";
      set({ error: msg });
      throw e;
    }
  },

  async bulkUpsert(inputs) {
    if (inputs.length === 0) return 0;
    set({ error: null });
    try {
      const insforge = getInsForge();
      // 1) Compute merged days per staff based on existing store data.
      const state = get();
      const plannedByStaffWeek = new Map<string, { staffId: string; weekStart: string; days: WeekDays }>();
      for (const inp of inputs) {
        const key = `${inp.staffId}|${inp.weekStart}`;
        const existing = state.byWeek[inp.weekStart]?.find((e) => e.staffId === inp.staffId)?.days;
        const merged = mergeDays(existing, inp.selectedDays, inp.newShift);
        plannedByStaffWeek.set(key, { staffId: inp.staffId, weekStart: inp.weekStart, days: merged });
      }

      // 2) Run all upserts in parallel.
      const tasks = Array.from(plannedByStaffWeek.values()).map((p) =>
        insforge.database
          .from("schedules")
          .upsert(
            {
              staff_id: p.staffId,
              week_start: p.weekStart,
              days: p.days,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "staff_id,week_start" },
          )
          .select("id, staff_id, week_start, days, created_at")
          .single()
          .then(({ data, error }) => {
            if (error) throw new Error(error.message);
            return mapRow(data as unknown as ScheduleRow);
          }),
      );
      const results = await Promise.all(tasks);

      // 3) Update the store cache per affected week.
      set((s) => {
        const next = { ...s.byWeek };
        for (const r of results) {
          const list = next[r.weekStart] ?? [];
          const without = list.filter((x) => x.staffId !== r.staffId);
          next[r.weekStart] = [...without, r];
        }
        return { byWeek: next };
      });
      return results.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar horarios";
      set({ error: msg });
      throw e;
    }
  },

  reset() {
    set({ byWeek: {}, loading: false, error: null, fetchedWeeks: {} });
  },
}));

/** Helper hook: returns the schedule entry for a given staff+week (or undefined). */
export function useStaffWeekSchedule(staffId: string | undefined, weekStart: string): WeeklySchedule | undefined {
  return useScheduleStore((s) => {
    if (!staffId) return undefined;
    const list = s.byWeek[weekStart] ?? [];
    return list.find((entry) => entry.staffId === staffId);
  });
}

/** Helper hook: returns the day shift for a staff+week+day, defaulting to rest. */
export function useDayShift(staffId: string | undefined, weekStart: string, day: DayIndex) {
  return useScheduleStore((s) => {
    if (!staffId) return { type: "rest" as const };
    const list = s.byWeek[weekStart] ?? [];
    const entry = list.find((entry) => entry.staffId === staffId);
    return entry?.days[day] ?? { type: "rest" as const };
  });
}