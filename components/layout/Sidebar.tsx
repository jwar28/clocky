"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { LayoutGrid, LogOut, Plus, Settings, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { APP_NAME, AREA_LABEL } from "@/lib/constants";
import { useSessionStore } from "@/store/session-store";
import { useStaffStore } from "@/store/staff-store";
import { useUiStore } from "@/store/ui-store";
import { useScheduleStore } from "@/store/schedule-store";
import { weekSites } from "@/lib/utils/site";
import { MiniCalendar } from "./MiniCalendar";

const NAV_ITEMS = [
  { href: "/schedule", label: "Malla horaria", icon: LayoutGrid },
  { href: "/staff", label: "Personal", icon: Users },
  { href: "/settings", label: "Configuración", icon: Settings },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary-fixed))]", className)}
    />
  );
}

/**
 * Desktop sidebar (≥1024px): brand, primary action, navigation, and — on the
 * schedule — the month picker, sede filter and legend, Google Calendar style.
 * Tablet (768–1023px) collapses to an icon rail.
 */
export function Sidebar() {
  const isActive = useIsActive();
  const router = useRouter();
  const onSchedule = isActive("/schedule");
  const signOut = useSessionStore((s) => s.signOut);
  const user = useSessionStore((s) => s.user);
  const requestAssign = useUiStore((s) => s.requestAssign);

  function onAssign() {
    requestAssign();
    if (!onSchedule) router.push("/schedule");
  }

  return (
    <>
      {/* Full sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-sidebar px-4 py-4 lg:flex">
        <div>
          <div className="flex items-center gap-2.5 text-[21px] font-extrabold tracking-tight">
            <BrandMark />
            {APP_NAME}
          </div>
          <div className="mt-0.5 pl-[22px] text-xs text-muted-foreground">{AREA_LABEL}</div>
        </div>

        <button
          type="button"
          onClick={onAssign}
          className="flex w-max items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Asignar turnos
        </button>

        <nav aria-label="Principal" className="-mx-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary-fixed font-bold text-shift-dayInk" : "font-medium text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {onSchedule && <ScheduleSidebarSections />}

        <div className="mt-auto space-y-1 border-t border-border pt-3">
          {user?.email && (
            <div className="truncate px-1 text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </div>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Tablet icon rail */}
      <aside className="sticky top-0 hidden h-screen w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-sidebar py-4 md:flex lg:hidden">
        <BrandMark className="mb-3 mt-1" />
        <RailButton label="Asignar turnos" onClick={onAssign} primary>
          <Plus className="h-5 w-5" />
        </RailButton>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <RailButton key={item.href} label={item.label} href={item.href} active={isActive(item.href)}>
              <Icon className="h-5 w-5" />
            </RailButton>
          );
        })}
        <div className="mt-auto">
          <RailButton label="Cerrar sesión" onClick={() => void signOut()}>
            <LogOut className="h-5 w-5" />
          </RailButton>
        </div>
      </aside>
    </>
  );
}

function RailButton({
  label,
  href,
  onClick,
  active,
  primary,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const cls = cn(
    "grid h-10 w-10 place-items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    primary
      ? "bg-primary text-primary-foreground hover:bg-primary-container"
      : active
        ? "bg-primary-fixed text-shift-dayInk"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={cls}>
            {children}
          </Link>
        ) : (
          <button type="button" aria-label={label} onClick={onClick} className={cls}>
            {children}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Month picker, sede filter (with headcounts) and the timeline legend. */
function ScheduleSidebarSections() {
  const weekStart = useUiStore((s) => s.weekStart);
  const setWeekStart = useUiStore((s) => s.setWeekStart);
  const siteFilter = useUiStore((s) => s.siteFilter);
  const setSiteFilter = useUiStore((s) => s.setSiteFilter);
  const staff = useStaffStore((s) => s.staff);
  const weekRows = useScheduleStore((s) => s.byWeek[weekStart]);

  // Counts follow this week's actual sede (rotations included), not the habitual one.
  const sites = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of staff) {
      const days = weekRows?.find((r) => r.staffId === s.id)?.days;
      for (const w of weekSites(s, days)) {
        if (w.site) counts.set(w.site, (counts.get(w.site) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [staff, weekRows]);

  return (
    <>
      <MiniCalendar weekStart={weekStart} onPickWeek={setWeekStart} />

      <section aria-labelledby="sb-sedes">
        <h2 id="sb-sedes" className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Sedes
        </h2>
        <div className="-mx-1 space-y-px" role="radiogroup" aria-labelledby="sb-sedes">
          {[["", staff.length] as const, ...sites].map(([name, count]) => {
            const active = siteFilter === name;
            return (
              <button
                key={name || "__all__"}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSiteFilter(name)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary-fixed font-bold text-shift-dayInk" : "text-foreground hover:bg-muted",
                )}
              >
                <span className="truncate">{name || "Todas"}</span>
                <span className="tabular-nums text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="sb-legend">
        <h2 id="sb-legend" className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Cómo leer
        </h2>
        <ul className="space-y-2 text-[13px]">
          <li className="flex items-center gap-2.5">
            <i className="h-2.5 w-7 shrink-0 rounded-sm bg-shift-day shadow-[inset_0_-3px_0_hsl(var(--shift-day-rule))]" />
            Turno diurno
          </li>
          <li className="flex items-center gap-2.5">
            <i className="h-2.5 w-7 shrink-0 rounded-sm bg-shift-night" />
            Nocturno, cruza la medianoche
          </li>
          <li className="flex items-center gap-2.5">
            <i className="h-2.5 w-7 shrink-0 rounded-sm border-2 border-dashed border-available" />
            Disponible
          </li>
          <li className="flex items-center gap-2.5">
            <i className="ml-3 h-3.5 w-0.5 shrink-0 bg-primary" />
            <span className="ml-3">Ahora</span>
          </li>
        </ul>
      </section>
    </>
  );
}

/**
 * Mobile top bar (<768px): brand + icon navigation.
 */
export function SidebarMobile() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Principal" className="sticky top-0 z-30 flex h-14 w-full items-center gap-1 border-b border-border bg-background px-3 md:hidden">
      <span className="flex items-center gap-2 px-1 text-lg font-extrabold tracking-tight">
        <BrandMark />
        {APP_NAME}
      </span>
      <div className="ml-auto flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-lg",
                active ? "bg-primary-fixed text-shift-dayInk" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
