"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { StaffDialog } from "@/components/staff/StaffDialog";
import { StaffActionsMenu, StaffList } from "@/components/staff/StaffList";
import { WeekStrip } from "@/components/staff/WeekStrip";
import { ScheduleEditSheet } from "@/components/schedule/ScheduleEditSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useUiStore } from "@/store/ui-store";
import { formatRangeLabel, getWeekStart, todayInBogota } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { Staff } from "@/lib/types";

type StatusFilter = "active" | "inactive" | "all";

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function StaffPage() {
  const staff = useStaffStore((s) => s.staff);
  const staffFetched = useStaffStore((s) => s.fetched);
  const staffError = useStaffStore((s) => s.error);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const updateStaff = useStaffStore((s) => s.updateStaff);
  const removeStaff = useStaffStore((s) => s.removeStaff);
  const weekStart = useUiStore((s) => s.weekStart);
  const byWeek = useScheduleStore((s) => s.byWeek);
  const fetchedWeeks = useScheduleStore((s) => s.fetchedWeeks);
  const fetchWeek = useScheduleStore((s) => s.fetchWeek);

  const [query, setQuery] = useState("");
  const [site, setSite] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStaffId, setSheetStaffId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Staff | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!staffFetched) void fetchStaff();
  }, [staffFetched, fetchStaff]);
  useEffect(() => {
    if (!fetchedWeeks[weekStart]) void fetchWeek(weekStart);
  }, [weekStart, fetchedWeeks, fetchWeek]);

  const today = todayInBogota();
  const todayIndex = getWeekStart(today) === weekStart ? new Date(`${today}T12:00:00`).getDay() : null;
  const weekLabel = formatRangeLabel(weekStart);
  const weekOf = (id: string) => byWeek[weekStart]?.find((r) => r.staffId === id)?.days;

  const counts = useMemo(
    () => ({
      active: staff.filter((s) => s.active).length,
      inactive: staff.filter((s) => !s.active).length,
      all: staff.length,
    }),
    [staff],
  );

  // Sede chips reflect the current status filter so counts always match the list.
  const statusPool = useMemo(
    () => staff.filter((s) => (status === "all" ? true : status === "active" ? s.active : !s.active)),
    [staff, status],
  );
  const sites = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of statusPool) if (s.defaultSite) m.set(s.defaultSite, (m.get(s.defaultSite) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [statusPool]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return statusPool.filter(
      (s) =>
        (!site || s.defaultSite === site) &&
        (!q || normalize(`${s.fullName} ${s.defaultSite} ${s.role}`).includes(q)),
    );
  }, [statusPool, site, query]);

  const hasFilters = Boolean(query || site);

  function onAdd() {
    setEditingStaff(null);
    setDialogOpen(true);
  }
  function onEdit(s: Staff) {
    setEditingStaff(s);
    setDialogOpen(true);
  }
  function onAssign(s: Staff) {
    setSheetStaffId(s.id);
    setSheetOpen(true);
  }
  async function onToggleActive(s: Staff) {
    try {
      await updateStaff(s.id, { active: !s.active });
      toast.success(s.active ? `${s.fullName} quedó inactivo` : `${s.fullName} está activo de nuevo`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo actualizar. Intenta de nuevo.");
    }
  }
  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    try {
      await removeStaff(toDelete.id);
      toast.success(`${toDelete.fullName} fue eliminado`);
      setToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  async function deactivateInstead() {
    if (!toDelete) return;
    const s = toDelete;
    setToDelete(null);
    await onToggleActive(s);
  }

  const actions = { onAssign, onEdit, onToggleActive, onDelete: setToDelete };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:h-screen md:min-h-0">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border px-4 md:px-6">
        <h1 className="text-[21px] font-bold tracking-tight text-foreground">Personal</h1>
        {staffFetched && (
          <span className="text-sm text-muted-foreground">
            {counts.active} {counts.active === 1 ? "activo" : "activos"}
          </span>
        )}
        <Button onClick={onAdd} className="ml-auto h-9 font-bold">
          <UserPlus />
          <span className="hidden sm:inline">Nuevo empleado</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </header>

      {/* Toolbar: search, sede, status */}
      <div className="shrink-0 space-y-3 border-b border-border px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex h-9 w-full items-center sm:w-72">
            <span className="sr-only">Buscar personal</span>
            <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Buscar por nombre, sede o rol"
              className="h-full w-full rounded-lg border border-input bg-background pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setQuery("")}
                className="absolute right-1.5 grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <div className="flex rounded-lg border border-input p-0.5 sm:ml-auto" role="radiogroup" aria-label="Estado">
            {(
              [
                ["active", "Activos"],
                ["inactive", "Inactivos"],
                ["all", "Todos"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={status === value}
                onClick={() => {
                  setStatus(value);
                  setSite("");
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  status === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                <span className={cn("ml-1.5 tabular-nums", status === value ? "opacity-70" : "opacity-60")}>
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {sites.length > 1 && (
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-0.5" role="radiogroup" aria-label="Sede">
            {[["", statusPool.length] as const, ...sites].map(([name, n]) => {
              const on = site === name;
              return (
                <button
                  key={name || "__all__"}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSite(name)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    on ? "bg-primary-fixed font-bold text-shift-dayInk" : "font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {name || "Todas las sedes"}
                  <span className="ml-1.5 tabular-nums opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {!staffFetched ? (
          <div className="space-y-px p-6" aria-busy aria-label="Cargando personal">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : staffError && staff.length === 0 ? (
          <div className="mx-auto max-w-sm py-16 text-center">
            <p className="font-bold">No se pudo cargar el personal</p>
            <p className="mt-1 text-sm text-muted-foreground">{staffError}</p>
            <Button variant="outline" className="mt-4" onClick={() => void fetchStaff()}>
              Reintentar
            </Button>
          </div>
        ) : staff.length === 0 ? (
          <div className="mx-auto max-w-sm py-16 text-center">
            <p className="text-lg font-bold">Todavía no hay personal</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registra a las personas del equipo para poder asignarles turnos en la malla.
            </p>
            <Button className="mt-5 font-bold" onClick={onAdd}>
              <UserPlus />
              Agregar la primera persona
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-sm py-16 text-center">
            <p className="font-bold">
              {hasFilters ? "Nadie coincide con estos filtros" : status === "inactive" ? "No hay personal inactivo" : "No hay personal activo"}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setSite("");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <StaffList staff={filtered} weekOf={weekOf} todayIndex={todayIndex} weekLabel={weekLabel} {...actions} />
            </div>

            <ul className="divide-y divide-border md:hidden">
              {filtered.map((s) => (
                <li key={s.id} className="px-4 py-3.5">
                  <div className="flex items-start gap-2">
                    <button type="button" onClick={() => onEdit(s)} className="min-w-0 flex-1 text-left">
                      <span className={cn("block truncate font-bold", !s.active && "text-muted-foreground")}>
                        {s.fullName}
                        {!s.active && (
                          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">Inactivo</span>
                        )}
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {[s.defaultSite, s.role].filter(Boolean).join(", ") || "Sin sede"}
                      </span>
                    </button>
                    <StaffActionsMenu staff={s} onEdit={onEdit} onToggleActive={onToggleActive} onDelete={setToDelete} />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <WeekStrip days={weekOf(s.id)} todayIndex={todayIndex} />
                    {s.active && (
                      <Button variant="outline" size="sm" className="h-9 shrink-0 font-bold" onClick={() => onAssign(s)}>
                        <CalendarPlus />
                        Turnos
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} staff={editingStaff} />
      <ScheduleEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        weekStart={weekStart}
        initialStaffId={sheetStaffId}
      />

      <Dialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">¿Eliminar a {toDelete?.fullName}?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Se borra de la lista de personal y no se puede deshacer.
              {toDelete?.active && " Si solo dejó de trabajar por un tiempo, desactívalo: conserva sus datos y sale de la lista de activos."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={busy}>
              Cancelar
            </Button>
            {toDelete?.active && (
              <Button variant="outline" onClick={() => void deactivateInstead()} disabled={busy}>
                Desactivar
              </Button>
            )}
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={busy}>
              {busy ? "Eliminando" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
