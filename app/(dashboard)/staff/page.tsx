"use client";

import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StaffDialog } from "@/components/staff/StaffDialog";
import { StaffList } from "@/components/staff/StaffList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useStaffStore } from "@/store/staff-store";
import { useUiStore } from "@/store/ui-store";
import type { Staff } from "@/lib/types";
import { ScheduleEditSheet } from "@/components/schedule/ScheduleEditSheet";

export default function StaffPage() {
  const staff = useStaffStore((s) => s.staff);
  const removeStaff = useStaffStore((s) => s.removeStaff);
  const weekStart = useUiStore((s) => s.weekStart);

  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const filtered = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.defaultSite.toLowerCase().includes(query.toLowerCase()),
  );

  function onAdd() {
    setEditingStaff(null);
    setDialogOpen(true);
  }
  function onEdit(s: Staff) {
    setEditingStaff(s);
    setDialogOpen(true);
  }
  function onDelete(s: Staff) {
    if (!window.confirm(`¿Eliminar a ${s.fullName}?`)) return;
    void removeStaff(s.id);
  }
  function onAssign(s: Staff) {
    setEditingStaffId(s.id);
    setSheetOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar onAddStaff={onAdd} onAddWeek={() => onAssign(staff[0]!)} />

      <div className="flex-1 px-6 py-5">
        <div className="mb-4 flex items-baseline gap-3">
          <h1 className="font-display text-headline-xl text-foreground">Personal</h1>
          <span className="text-body-sm text-muted-foreground">· {filtered.length} {filtered.length === 1 ? "empleado" : "empleados"}</span>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre o sede…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <span className="text-body-sm text-muted-foreground">
            {filtered.length} de {staff.length}
          </span>
        </div>

        {/* Desktop: tabla */}
        <div className="hidden md:block">
          <StaffList staff={filtered} onAssign={onAssign} onEdit={onEdit} onDelete={onDelete} />
        </div>

        {/* Mobile: cards */}
        <div className="grid gap-3 md:hidden">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-grid bg-card p-6 text-center text-body-sm text-muted-foreground">
              Sin personal para mostrar.
            </div>
          ) : (
            filtered.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-grid bg-card p-4">
                <Avatar name={s.fullName} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-table-header">{s.fullName}</div>
                  <div className="truncate text-body-sm text-muted-foreground">{s.defaultSite || "—"}</div>
                  <div className="truncate text-body-sm text-muted-foreground">{s.role}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onAssign(s)} aria-label="Asignar turnos">
                    <UserPlus aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(s)} aria-label="Editar">
                    <Pencil aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(s)} aria-label="Eliminar" className="text-destructive">
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} staff={editingStaff} />
      <ScheduleEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        weekStart={weekStart}
        initialStaffId={editingStaffId}
      />
    </div>
  );
}