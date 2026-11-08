"use client";

import { useEffect } from "react";
import { RefreshCw, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { SiteFilter } from "@/components/layout/SiteFilter";
import { ExportMenu } from "@/components/layout/ExportMenu";
import { useUiStore } from "@/store/ui-store";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useSitesStore } from "@/store/taxonomy-store";

interface TopBarProps {
  onAddStaff: () => void;
}

export function TopBar({ onAddStaff }: TopBarProps) {
  const { weekStart, setWeekStart, siteFilter, setSiteFilter, staffQuery, setStaffQuery } = useUiStore();
  const refetchStaff = useStaffStore((s) => s.fetchStaff);
  const refetchWeek = useScheduleStore((s) => s.fetchWeek);
  const sitesFromStore = useSitesStore((s) => s.items);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const sitesFetch = useSitesStore((s) => s.fetch);

  useEffect(() => {
    if (!sitesFetched) void sitesFetch();
  }, [sitesFetched, sitesFetch]);

  const sites = sitesFromStore.map((s) => s.name).sort((a, b) => a.localeCompare(b, "es"));

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-2 border-b border-border bg-background px-4 lg:gap-3 lg:px-5">
      <WeekNavigator weekStart={weekStart} onChange={setWeekStart} className="mr-auto shrink-0" />

      {/* Sede filter lives in the sidebar on desktop; tablet gets the select. */}
      <div className="lg:hidden">
        <SiteFilter value={siteFilter} sites={sites} onChange={setSiteFilter} />
      </div>

      <label className="relative flex h-9 w-40 min-w-0 items-center lg:w-56 xl:w-64">
        <span className="sr-only">Buscar persona</span>
        <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={staffQuery}
          onChange={(e) => setStaffQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setStaffQuery("")}
          placeholder="Buscar persona"
          className="h-full w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {staffQuery && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => setStaffQuery("")}
            className="absolute right-1.5 grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Actualizar datos"
            className="h-9 w-9 shrink-0"
            onClick={() => {
              void refetchStaff();
              void refetchWeek(weekStart);
              void sitesFetch();
            }}
          >
            <RefreshCw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Actualizar datos</TooltipContent>
      </Tooltip>
      <ExportMenu siteFilter={siteFilter} />
      <Button variant="outline" onClick={onAddStaff} className="h-9 shrink-0 px-3 font-bold xl:px-4" aria-label="Nuevo empleado">
        <UserPlus />
        <span className="hidden xl:inline">Nuevo empleado</span>
      </Button>
    </header>
  );
}
