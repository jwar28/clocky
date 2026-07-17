"use client";

import { useEffect } from "react";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { useSitesStore } from "@/store/taxonomy-store";
import { PublicScheduleView } from "./PublicScheduleView";
import type { Staff, WeeklySchedule } from "@/lib/types";

export interface PublicScheduleInitialData {
  weekStart: string;
  staff: Staff[];
  sites: { id: string; name: string }[];
  schedules: WeeklySchedule[];
}

/**
 * Client-side wrapper around PublicScheduleView.
 *
 * On mount, copies the data fetched server-side by the parent Server
 * Component into the Zustand stores, then renders PublicScheduleView.
 * This indirection is required because the stores are "use client"
 * modules and cannot be mutated from a Server Component.
 */
export function PublicScheduleHydrator({ data }: { data: PublicScheduleInitialData }) {
  useEffect(() => {
    useUiStore.setState({ weekStart: data.weekStart });
    useStaffStore.setState({
      staff: data.staff,
      fetched: true,
      loading: false,
      error: null,
    });
    useSitesStore.setState({
      items: data.sites,
      fetched: true,
      loading: false,
      error: null,
    });
    useScheduleStore.setState((s) => ({
      byWeek: { ...s.byWeek, [data.weekStart]: data.schedules },
      fetchedWeeks: { ...s.fetchedWeeks, [data.weekStart]: true },
      loading: false,
      error: null,
    }));
  }, [data]);

  return <PublicScheduleView />;
}