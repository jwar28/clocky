"use client";

import { Briefcase, Building2, CalendarCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ScheduleSummaryCardsProps {
  totalStaff: number;
  uniqueSites: number;
  uniqueRoles: number;
  /** Slots (staff × days) that have a non-rest shift assigned this week. */
  assignedSlots: number;
  /** Total slots available this week (= totalStaff × 7). */
  totalSlots: number;
  loading?: boolean;
  className?: string;
}

interface Kpi {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "neutral" | "amber";
}

function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-card p-4">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ScheduleSummaryCards({
  totalStaff,
  uniqueSites,
  uniqueRoles,
  assignedSlots,
  totalSlots,
  loading = false,
  className,
}: ScheduleSummaryCardsProps) {
  const coveragePct = totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0;

  const kpis: Kpi[] = [
    {
      icon: Users,
      label: "Personal activo",
      value: totalStaff.toLocaleString("es"),
      tone: "primary",
    },
    {
      icon: Building2,
      label: "Sedes",
      value: uniqueSites.toLocaleString("es"),
      tone: "neutral",
    },
    {
      icon: Briefcase,
      label: "Roles",
      value: uniqueRoles.toLocaleString("es"),
      tone: "neutral",
    },
    {
      icon: CalendarCheck,
      label: "Turnos esta semana",
      value: `${assignedSlots} / ${totalSlots}`,
      hint: `${coveragePct}%`,
      tone: coveragePct >= 80 ? "primary" : coveragePct >= 40 ? "neutral" : "amber",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        : kpis.map((kpi) => {
            const Icon = kpi.icon;
            const toneBg =
              kpi.tone === "primary"
                ? "bg-primary text-primary-foreground"
                : kpi.tone === "amber"
                  ? "bg-tertiary-fixed/40 text-tertiary"
                  : "bg-secondary-container text-primary";
            return (
              <div
                key={kpi.label}
                className="flex items-center gap-3 rounded-lg border border-outline-variant bg-card p-3.5"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    toneBg,
                  )}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-headline-md leading-none text-foreground">
                    {kpi.value}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="truncate text-xs text-muted-foreground">{kpi.label}</span>
                    {kpi.hint && (
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          kpi.tone === "primary"
                            ? "text-primary"
                            : kpi.tone === "amber"
                              ? "text-tertiary"
                              : "text-ink-muted",
                        )}
                      >
                        {kpi.hint}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
}