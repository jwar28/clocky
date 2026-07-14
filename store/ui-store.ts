"use client";

import { create } from "zustand";
import { getWeekStart, todayInBogota } from "@/lib/utils/date";

interface UiState {
  siteFilter: string; // '' = all
  setSiteFilter: (s: string) => void;
  weekStart: string;
  setWeekStart: (s: string) => void;
}

// Default weekStart is computed once at module load using Colombia's current date.
const DEFAULT_WEEK_START = getWeekStart(todayInBogota());

export const useUiStore = create<UiState>((set) => ({
  siteFilter: "",
  setSiteFilter: (s) => set({ siteFilter: s }),
  weekStart: DEFAULT_WEEK_START,
  setWeekStart: (s) => set({ weekStart: s }),
}));