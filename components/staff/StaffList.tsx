"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarPlus,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";
import type { Staff, WeekDays } from "@/lib/types";
import { WeekStrip } from "./WeekStrip";
import { weekSiteSummary } from "@/lib/utils/site";

type SortColumn = "name" | "site" | "role";
type SortDir = "asc" | "desc";

export interface StaffRowActions {
  onAssign: (s: Staff) => void;
  onEdit: (s: Staff) => void;
  onToggleActive: (s: Staff) => void;
  onDelete: (s: Staff) => void;
}

interface StaffListProps extends StaffRowActions {
  staff: Staff[];
  weekOf: (staffId: string) => WeekDays | undefined;
  todayIndex: number | null;
  weekLabel: string;
}

function compareStaff(a: Staff, b: Staff, column: SortColumn): number {
  const get = (s: Staff) => (column === "name" ? s.fullName : column === "site" ? s.defaultSite : s.role) || "";
  return get(a).localeCompare(get(b), "es", { sensitivity: "base" });
}

export function StaffActionsMenu({ staff, onEdit, onToggleActive, onDelete }: { staff: Staff } & Omit<StaffRowActions, "onAssign">) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={`Más acciones para ${staff.fullName}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => onEdit(staff)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar datos
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onToggleActive(staff)}>
          <Power className="mr-2 h-4 w-4" />
          {staff.active ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onDelete(staff)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** "Esta semana: Fontibón-Noche" when the person rotates away from the habitual sede. */
function RotationNote({ staff, days }: { staff: Staff; days: WeekDays | undefined }) {
  const { label, rotated } = weekSiteSummary(staff, days);
  if (!rotated) return null;
  return <span className="block text-xs font-semibold text-shift-dayInk">Esta semana: {label}</span>;
}

export function StaffList({ staff, weekOf, todayIndex, weekLabel, ...actions }: StaffListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const copy = [...staff];
    copy.sort((a, b) => (sortDir === "asc" ? 1 : -1) * compareStaff(a, b, sortColumn));
    return copy;
  }, [staff, sortColumn, sortDir]);

  function SortTh({ label, column, className }: { label: string; column: SortColumn; className?: string }) {
    const active = sortColumn === column;
    const Arrow = sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        className={cn("px-4 py-2.5 text-left", className)}
      >
        <button
          type="button"
          onClick={() => {
            if (active) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
            else {
              setSortColumn(column);
              setSortDir("asc");
            }
          }}
          className={cn(
            "-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
          <Arrow className={cn("h-3 w-3", !active && "opacity-0")} aria-hidden />
        </button>
      </th>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 z-10 border-b border-grid bg-background">
        <tr>
          <SortTh label="Nombre" column="name" className="pl-6" />
          <SortTh label="Sede habitual" column="site" />
          <SortTh label="Rol" column="role" />
          <th scope="col" className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Semana {weekLabel}
          </th>
          <th scope="col" className="w-px px-4 py-2.5 pr-6">
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((s) => (
          <tr
            key={s.id}
            className={cn(
              "group border-b border-border transition-colors hover:bg-secondary-container/60",
              !s.active && "text-muted-foreground",
            )}
          >
            <td className="py-3 pl-6 pr-4">
              <button
                type="button"
                onClick={() => actions.onEdit(s)}
                className="rounded text-left font-bold text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn(!s.active && "text-muted-foreground")}>{s.fullName}</span>
              </button>
              {!s.active && (
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  Inactivo
                </span>
              )}
            </td>
            <td className="px-4 py-3">
              {s.defaultSite || <span className="text-muted-foreground">Sin sede</span>}
              <RotationNote staff={s} days={weekOf(s.id)} />
            </td>
            <td className="px-4 py-3 text-muted-foreground">{s.role || "—"}</td>
            <td className="px-4 py-3">
              <button
                type="button"
                onClick={() => actions.onAssign(s)}
                className="-mx-2 rounded-md px-2 py-1 transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Ver o asignar turnos de ${s.fullName}`}
              >
                <WeekStrip days={weekOf(s.id)} todayIndex={todayIndex} />
              </button>
            </td>
            <td className="py-3 pl-4 pr-6">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.onAssign(s)}
                  disabled={!s.active}
                  className="h-9 font-bold"
                >
                  <CalendarPlus />
                  Asignar turnos
                </Button>
                <StaffActionsMenu
                  staff={s}
                  onEdit={actions.onEdit}
                  onToggleActive={actions.onToggleActive}
                  onDelete={actions.onDelete}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
