"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { SiteFilter } from "@/components/layout/SiteFilter";
import { ExportMenu } from "@/components/layout/ExportMenu";
import { useUiStore } from "@/store/ui-store";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useSitesStore } from "@/store/taxonomy-store";

interface TopBarProps {
  onAddStaff: () => void;
  onAddWeek: () => void;
}

export function TopBar({ onAddStaff, onAddWeek }: TopBarProps) {
  const { weekStart, setWeekStart, siteFilter, setSiteFilter } = useUiStore();
  const refetchStaff = useStaffStore((s) => s.fetchStaff);
  const refetchWeek = useScheduleStore((s) => s.fetchWeek);
  const sitesFromStore = useSitesStore((s) => s.items);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const sitesFetch = useSitesStore((s) => s.fetch);

  // Lazy-fetch sites if missing
  if (!sitesFetched && typeof window !== "undefined") {
    void sitesFetch();
  }

  const sites = sitesFromStore.map((s) => s.name).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-outline-variant bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-4">
        <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
      </div>
      <div className="flex items-center gap-2">
        <SiteFilter value={siteFilter} sites={sites} onChange={setSiteFilter} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refrescar"
          onClick={() => {
            void refetchStaff();
            void refetchWeek(weekStart);
            void sitesFetch();
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <ExportMenu siteFilter={siteFilter} />
        <Button variant="outline" onClick={onAddWeek}>
          Asignar turnos
        </Button>
        <Button
          onClick={onAddStaff}
          className="bg-primary-container hover:bg-primary-container/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo empleado
        </Button>
      </div>
    </header>
  );
}