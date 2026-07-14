"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import type { DayIndex, DayShift } from "@/lib/types";
import { formatWeekLabel } from "@/lib/utils/date";
import { StaffMultiSelect } from "./StaffMultiSelect";
import { DayPicker } from "./DayPicker";
import { AssignmentPreview } from "./AssignmentPreview";

interface ScheduleEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  /** Initial staff id (e.g., from a cell click). */
  initialStaffId?: string | null;
  /** Initial day index (e.g., the cell that was clicked). */
  initialDayIndex?: DayIndex | null;
  /** Optional: site filter for the staff selector. */
  siteFilter?: string;
}

const SHIFT_OPTIONS: Array<{
  id: DayShift["type"];
  label: string;
  description: string;
  pillClass: string;
}> = [
  { id: "rest", label: "Descanso", description: "Día libre.", pillClass: "bg-tertiary-fixed/50 text-tertiary border-tertiary-container/40" },
  { id: "available", label: "Disponible", description: "Disponible para asignar.", pillClass: "bg-tertiary-fixed/40 text-tertiary border-tertiary-container/50" },
  { id: "nightIn", label: "Amanece turno noche", description: "Termina turno noche de la noche anterior.", pillClass: "bg-tertiary-fixed/60 text-tertiary border-tertiary-container/60 italic" },
  { id: "time", label: "Hora", description: "Asignar rango de horas.", pillClass: "bg-secondary-container text-primary" },
];

const DEFAULT_TIME = { start: "08:00", end: "17:00" } as const;

function shiftFromType(type: DayShift["type"]): DayShift {
  if (type === "time") return { type: "time", ...DEFAULT_TIME };
  return { type };
}

function SectionHeader({ step, label }: { step: 1 | 2 | 3; label: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-table-header uppercase tracking-wide text-primary">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] leading-none text-primary-foreground">
        {step}
      </span>
      {label}
    </h3>
  );
}

export function ScheduleEditSheet({
  open,
  onOpenChange,
  weekStart,
  initialStaffId = null,
  initialDayIndex = null,
  siteFilter,
}: ScheduleEditSheetProps) {
  const staff = useStaffStore((s) => s.staff);
  const bulkUpsert = useScheduleStore((s) => s.bulkUpsert);
  const removeSchedule = useScheduleStore((s) => s.removeSchedule);
  const byWeek = useScheduleStore((s) => s.byWeek);

  // ---- Step 1: Staff ----
  const [staffIds, setStaffIds] = useState<string[]>([]);
  // ---- Step 2: Days ----
  const [selectedDays, setSelectedDays] = useState<DayIndex[]>([]);
  // ---- Step 3: Shift ----
  const [shift, setShift] = useState<DayShift>(shiftFromType("time"));
  const [saving, setSaving] = useState(false);

  // Initial state when sheet opens
  useEffect(() => {
    if (!open) return;
    // staff: use initialStaffId when provided, otherwise start empty (no auto-selection)
    const nextStaffIds: string[] =
      initialStaffId && staff.some((s) => s.id === initialStaffId)
        ? [initialStaffId]
        : [];
    setStaffIds(nextStaffIds);

    // days
    const days: DayIndex[] =
      initialDayIndex !== null && initialDayIndex !== undefined ? [initialDayIndex] : [];
    setSelectedDays(days);

    // shift: pre-fill from existing schedule of (staff, day) when both are provided
    if (nextStaffIds[0] && days[0] !== undefined) {
      const existing = byWeek[weekStart]
        ?.find((e) => e.staffId === nextStaffIds[0])
        ?.days[days[0]];
      setShift(existing ? { ...existing } : shiftFromType("time"));
    } else {
      setShift(shiftFromType("time"));
    }
    // We intentionally read byWeek as the source of truth, so don't include it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialStaffId, initialDayIndex, weekStart]);

  const selectedStaff = useMemo(
    () => staffIds.map((id) => staff.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [staffIds, staff],
  );

  const canSave = staffIds.length > 0 && selectedDays.length > 0;

  function applyShiftType(type: DayShift["type"]) {
    setShift(shiftFromType(type));
  }

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const written = await bulkUpsert(
        staffIds.map((sid) => ({
          staffId: sid,
          weekStart,
          selectedDays,
          newShift: shift,
        })),
      );
      const slots = staffIds.length * selectedDays.length;
      toast.success(
        `Horarios guardados: ${written} ${written === 1 ? "empleado" : "empleados"} · ${slots} ${slots === 1 ? "día" : "días"}`,
      );
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    const firstId = staffIds[0];
    if (!firstId) return;
    if (!window.confirm("¿Eliminar el horario completo de esta semana?")) return;
    setSaving(true);
    try {
      await removeSchedule(firstId, weekStart);
      toast.success("Horario eliminado");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-outline-variant">
          <SheetTitle>Asignar turnos</SheetTitle>
          <SheetDescription>
            {formatWeekLabel(weekStart)}
            {selectedStaff[0] && selectedStaff.length === 1 ? (
              <>
                {" · "}
                <span className="font-medium text-foreground">{selectedStaff[0].fullName}</span>
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Step 1 — ¿A QUIÉN? */}
          <section className="space-y-2.5">
            <SectionHeader step={1} label="¿A quién?" />
            <StaffMultiSelect
              selectedIds={staffIds}
              onChange={setStaffIds}
              siteFilter={siteFilter}
            />
          </section>

          {/* Step 2 — ¿QUÉ DÍAS? */}
          <section className="space-y-2.5">
            <SectionHeader step={2} label="¿Qué días?" />
            <DayPicker value={selectedDays} onChange={setSelectedDays} />
          </section>

          {/* Step 3 — ¿QUÉ TURNO? */}
          <section className="space-y-2">
            <SectionHeader step={3} label="¿Qué turno?" />
            <div className="flex flex-wrap gap-1.5">
              {SHIFT_OPTIONS.map((opt) => {
                const active = shift.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => applyShiftType(opt.id)}
                    aria-pressed={active}
                    title={opt.description}
                    className={cn(
                      "inline-flex flex-1 items-center justify-center rounded-pill border px-3 py-1 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm",
                      active
                        ? "border-primary bg-secondary-container text-primary ring-1 ring-primary"
                        : cn("border-outline-variant bg-card hover:bg-muted", opt.pillClass),
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs leading-snug text-muted-foreground">
              {SHIFT_OPTIONS.find((o) => o.id === shift.type)?.description}
            </p>

            {shift.type === "time" && (
              <div className="grid grid-cols-2 gap-3 rounded-md border border-outline-variant bg-card p-3">
                <div className="space-y-1">
                  <Label htmlFor="start">Inicio</Label>
                  <Input
                    id="start"
                    type="time"
                    value={shift.start ?? DEFAULT_TIME.start}
                    onChange={(e) => setShift({ type: "time", start: e.target.value, end: shift.end ?? DEFAULT_TIME.end })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end">Fin</Label>
                  <Input
                    id="end"
                    type="time"
                    value={shift.end ?? DEFAULT_TIME.end}
                    onChange={(e) => setShift({ type: "time", start: shift.start ?? DEFAULT_TIME.start, end: e.target.value })}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Preview */}
          <AssignmentPreview
            staffList={selectedStaff}
            selectedDays={selectedDays}
            shift={shift}
          />
        </div>

        <SheetFooter className="border-t border-outline-variant">
          {staffIds.length === 1 && byWeek[weekStart]?.some((e) => e.staffId === staffIds[0]) && (
            <Button type="button" variant="ghost" onClick={onClear} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar semana
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSave} disabled={!canSave || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </SheetFooter>

        {/* Screen-reader-only context */}
        <span className="sr-only">
          Semana {weekStart}.{" "}
          {WEEK_DAY_LABELS.filter((d) => selectedDays.includes(d.index))
            .map((d) => d.long)
            .join(", ")}
          . Turno: {shift.type}.
        </span>
      </SheetContent>
    </Sheet>
  );
}