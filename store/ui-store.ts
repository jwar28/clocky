"use client";

import { create } from "zustand";
import { getWeekStart, todayInBogota } from "@/lib/utils/date";

interface UiState {
  siteFilter: string; // '' = all
  setSiteFilter: (s: string) => void;
  weekStart: string;
  setWeekStart: (s: string) => void;
  /** Free-text person search; filters timeline rows by name. */
  staffQuery: string;
  setStaffQuery: (q: string) => void;
  /** Set when something outside the schedule page (e.g. the sidebar CTA) asks to open the assign sheet. */
  pendingAssign: boolean;
  requestAssign: () => void;
  clearAssign: () => void;
}

// Default weekStart is computed once at module load using Colombia's current date.
const DEFAULT_WEEK_START = getWeekStart(todayInBogota());

export const useUiStore = create<UiState>((set) => ({
  siteFilter: "",
  setSiteFilter: (s) => set({ siteFilter: s }),
  weekStart: DEFAULT_WEEK_START,
  setWeekStart: (s) => set({ weekStart: s }),
  staffQuery: "",
  setStaffQuery: (q) => set({ staffQuery: q }),
  pendingAssign: false,
  requestAssign: () => set({ pendingAssign: true }),
  clearAssign: () => set({ pendingAssign: false }),
}));
