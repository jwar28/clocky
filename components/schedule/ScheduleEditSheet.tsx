"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, ArrowRight, Loader2, Moon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { WEEK_DAY_LABELS } from "@/lib/constants";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import { useSitesStore } from "@/store/taxonomy-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DayIndex, DayShift } from "@/lib/types";
import { dayHeaderNumber, formatRangeLabel } from "@/lib/utils/date";
import { formatDayRange } from "@/lib/utils/schedule-merge";
import { StaffMultiSelect } from "./StaffMultiSelect";
import { DayPicker } from "./DayPicker";
import { ShiftTrack } from "./ShiftTrack";

interface ScheduleEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  /** Initial staff id (e.g., from a cell click). */
  initialStaffId?: string | null;
  /** Initial day index (e.g., the day that was clicked). */
  initialDayIndex?: DayIndex | null;
  /** Optional: site filter for the staff selector. */
  siteFilter?: string;
}

type ShiftType = DayShift["type"];

const DEFAULT_TIME = { start: "08:00", end: "17:00" } as const;
const FALLBACK_PRESETS = ["06:00-15:00", "07:00-16:00", "08:00-17:00", "22:00-05:00"];
const NOTE_MAX = 500;

function shiftFromType(type: ShiftType): DayShift {
  return type === "time" ? { type: "time", ...DEFAULT_TIME } : { type };
}

/** Shift-type options, each drawn with its swatch from the timeline's legend. */
const TYPE_OPTIONS: Array<{ id: ShiftType; label: string; hint: string; swatch: React.ReactNode }> = [
  {
    id: "time",
    label: "Horario",
    hint: "Hora de inicio y fin",
    swatch: <i className="h-2.5 w-6 rounded-sm bg-shift-day shadow-[inset_0_-3px_0_hsl(var(--shift-day-rule))]" />,
  },
  {
    id: "rest",
    label: "Descanso",
    hint: "Día libre",
    swatch: <i className="h-2.5 w-6 rounded-sm border border-dashed border-muted-foreground/50" />,
  },
  {
    id: "available",
    label: "Disponible",
    hint: "Se puede llamar",
    swatch: <i className="h-2.5 w-6 rounded-sm border-2 border-dashed border-available bg-available-bg" />,
  },
  {
    id: "nightIn",
    label: "Amanece",
    hint: "Sale del turno noche",
    swatch: <Moon className="h-3.5 w-3.5 text-shift-night" aria-hidden />,
  },
];

function Section({
  label,
  aside,
  children,
  htmlFor,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-bold text-foreground">
            {label}
          </label>
        ) : (
          <h3 className="text-sm font-bold text-foreground">{label}</h3>
        )}
        {aside && <div className="text-[13px] text-muted-foreground">{aside}</div>}
      </div>
      {children}
    </section>
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

  const [staffIds, setStaffIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayIndex[]>([]);
  const [shift, setShift] = useState<DayShift>(shiftFromType("time"));
  const [note, setNote] = useState("");
  /** Sede override for the chosen days; "" = each person's habitual sede. */
  const [site, setSite] = useState("");
  const sites = useSitesStore((s) => s.items);
  const sitesFetched = useSitesStore((s) => s.fetched);
  const fetchSites = useSitesStore((s) => s.fetch);
  useEffect(() => {
    if (open && !sitesFetched) void fetchSites();
  }, [open, sitesFetched, fetchSites]);
  const [saving, setSaving] = useState(false);
  /** Opened from one person's day on the timeline → edit mode. */
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!open) return;
    const nextStaffIds =
      initialStaffId && staff.some((s) => s.id === initialStaffId) ? [initialStaffId] : [];
    const days: DayIndex[] = initialDayIndex !== null && initialDayIndex !== undefined ? [initialDayIndex] : [];
    setStaffIds(nextStaffIds);
    setSelectedDays(days);
    setEditMode(nextStaffIds.length === 1 && days.length === 1);

    const existing =
      nextStaffIds[0] && days[0] !== undefined
        ? byWeek[weekStart]?.find((e) => e.staffId === nextStaffIds[0])?.days[days[0]]
        : undefined;
    if (existing) {
      const { note: n, locked: _l, site: st, ...rest } = existing;
      setShift(rest.type === "time" ? { ...DEFAULT_TIME, ...rest } : rest);
      setNote(n ?? "");
      setSite(st ?? "");
    } else {
      setShift(shiftFromType("time"));
      setNote("");
      setSite("");
    }
    // byWeek is read as a snapshot when the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialStaffId, initialDayIndex, weekStart]);

  const selectedStaff = useMemo(
    () => staffIds.map((id) => staff.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [staffIds, staff],
  );

  // Locked days of the single selected person — shown and skipped.
  const lockedDays = useMemo<DayIndex[]>(() => {
    if (staffIds.length !== 1) return [];
    const days = byWeek[weekStart]?.find((e) => e.staffId === staffIds[0])?.days;
    if (!days) return [];
    return ([0, 1, 2, 3, 4, 5, 6] as const).filter((i) => days[i]?.locked === true);
  }, [byWeek, staffIds, weekStart]);

  const effectiveDays = useMemo(
    () => selectedDays.filter((d) => !lockedDays.includes(d)),
    [selectedDays, lockedDays],
  );

  // Most frequent ranges this week, so common shifts are one tap away.
  const presets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of byWeek[weekStart] ?? []) {
      for (const d of Object.values(row.days)) {
        if (d?.type === "time" && d.start && d.end) {
          const k = `${d.start}-${d.end}`;
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return (top.length >= 3 ? top : [...top, ...FALLBACK_PRESETS.filter((p) => !top.includes(p))])
      .slice(0, 5)
      .sort();
  }, [byWeek, weekStart]);

  const timeInvalid = shift.type === "time" && (!shift.start || !shift.end || shift.start === shift.end);
  const slots = staffIds.length * effectiveDays.length;
  const canSave = staffIds.length > 0 && effectiveDays.length > 0 && !timeInvalid && note.length <= NOTE_MAX;
  const hasWeek = staffIds.length === 1 && byWeek[weekStart]?.some((e) => e.staffId === staffIds[0]);

  const person = selectedStaff.length === 1 ? selectedStaff[0] : undefined;
  const singleDay = selectedDays.length === 1 ? WEEK_DAY_LABELS[selectedDays[0]!] : undefined;

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const trimmed = note.trim();
      const typed: DayShift = shift.type === "time" ? { type: "time", start: shift.start, end: shift.end } : { type: shift.type };
      // Sede override only matters on working days; rest days carry none.
      const base: DayShift = site && shift.type !== "rest" ? { ...typed, site } : typed;
      const newShift: DayShift = trimmed ? { ...base, note: trimmed } : base;
      const written = await bulkUpsert(
        staffIds.map((sid) => ({
          staffId: sid,
          weekStart,
          // mergeDays preserves `locked`, so locked days are skipped for multi-person saves too.
          selectedDays: staffIds.length === 1 ? effectiveDays : selectedDays,
          newShift,
        })),
      );
      const skipped = selectedDays.length - effectiveDays.length;
      toast.success(
        editMode
          ? "Turno guardado"
          : `${slots} ${slots === 1 ? "turno asignado" : "turnos asignados"} a ${written} ${written === 1 ? "persona" : "personas"}${skipped > 0 ? `; ${skipped} ${skipped === 1 ? "día bloqueado omitido" : "días bloqueados omitidos"}` : ""}`,
      );
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function onClearWeek() {
    const id = staffIds[0];
    if (!id || !person) return;
    if (!window.confirm(`¿Borrar toda la semana de ${person.fullName}? Sus 7 días quedarán vacíos.`)) return;
    setSaving(true);
    try {
      await removeSchedule(id, weekStart);
      toast.success(`Semana de ${person.fullName} borrada`);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo borrar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const title = editMode ? "Editar turno" : "Asignar turnos";
  const subtitle =
    editMode && person && singleDay
      ? `${person.fullName}, ${singleDay.long.toLowerCase()} ${dayHeaderNumber(weekStart, singleDay.index)}`
      : `Semana del ${formatRangeLabel(weekStart)}`;

  const summary = (() => {
    if (staffIds.length === 0) return "Elige al menos una persona.";
    if (selectedDays.length === 0) return "Elige al menos un día.";
    if (effectiveDays.length === 0) return "Todos los días elegidos están bloqueados.";
    if (timeInvalid) return "La hora de inicio y fin no pueden ser iguales.";
    if (editMode) return null;
    return (
      <>
        <b className="font-bold text-foreground">{slots}</b> {slots === 1 ? "turno" : "turnos"}:{" "}
        {staffIds.length} {staffIds.length === 1 ? "persona" : "personas"}, {formatDayRange(effectiveDays)}
        {site && shift.type !== "rest" ? <>, en {site}</> : null}
      </>
    );
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <header className="border-b border-border px-6 pb-4 pr-14 pt-5">
          <SheetTitle className="text-xl font-extrabold tracking-tight">{title}</SheetTitle>
          <SheetDescription className="mt-0.5 text-sm text-muted-foreground">{subtitle}</SheetDescription>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          {!editMode && (
            <Section
              label="Personas"
              aside={staffIds.length > 0 ? `${staffIds.length} ${staffIds.length === 1 ? "seleccionada" : "seleccionadas"}` : undefined}
            >
              <StaffMultiSelect selectedIds={staffIds} onChange={setStaffIds} siteFilter={siteFilter} />
            </Section>
          )}

          <Section
            label="Días"
            aside={lockedDays.length > 0 ? `${lockedDays.length} ${lockedDays.length === 1 ? "bloqueado" : "bloqueados"}` : undefined}
          >
            <DayPicker value={selectedDays} onChange={setSelectedDays} weekStart={weekStart} lockedDays={lockedDays} />
          </Section>

          <Section label="Turno">
            <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Tipo de turno">
              {TYPE_OPTIONS.map((opt) => {
                const active = shift.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={opt.hint}
                    onClick={() =>
                      setShift((prev) => (opt.id === "time" ? (prev.type === "time" ? prev : shiftFromType("time")) : { type: opt.id }))
                    }
                    className={cn(
                      "flex h-[60px] flex-col items-center justify-center gap-2 rounded-lg border text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-foreground bg-background text-foreground shadow-[0_0_0_1px_hsl(var(--foreground))]"
                        : "border-input bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <span className="flex h-3.5 items-center">{opt.swatch}</span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {shift.type === "time" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-end gap-3">
                  <label className="flex-1 space-y-1">
                    <span className="text-[13px] font-semibold text-muted-foreground">Inicio</span>
                    <input
                      type="time"
                      value={shift.start ?? ""}
                      onChange={(e) => setShift({ ...shift, start: e.target.value })}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-lg font-bold tabular-nums focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    />
                  </label>
                  <ArrowRight className="mb-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <label className="flex-1 space-y-1">
                    <span className="text-[13px] font-semibold text-muted-foreground">Fin</span>
                    <input
                      type="time"
                      value={shift.end ?? ""}
                      onChange={(e) => setShift({ ...shift, end: e.target.value })}
                      aria-invalid={timeInvalid}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-lg font-bold tabular-nums focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 aria-[invalid=true]:border-destructive"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5" aria-label="Horarios frecuentes">
                  {presets.map((p) => {
                    const [s, e] = p.split("-");
                    const active = shift.start === s && shift.end === e;
                    return (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setShift({ type: "time", start: s, end: e })}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[13px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-shift-dayRule bg-shift-day text-shift-dayInk"
                            : "border-input text-foreground hover:bg-muted",
                        )}
                      >
                        {s}–{e}
                      </button>
                    );
                  })}
                </div>

                {!timeInvalid && <ShiftTrack shift={shift} />}
              </div>
            )}
          </Section>

          {shift.type !== "rest" && (
            <Section label="Sede" aside={site ? "Solo estos días" : undefined}>
              <Select value={site || "__habitual__"} onValueChange={(v) => setSite(v === "__habitual__" ? "" : v)}>
                <SelectTrigger className="h-10" aria-label="Sede para los días elegidos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__habitual__">
                    {person?.defaultSite ? `Sede habitual (${person.defaultSite})` : "Sede habitual de cada persona"}
                  </SelectItem>
                  {sites
                    .map((x) => x.name)
                    .sort((a, b) => a.localeCompare(b, "es"))
                    .filter((n) => n !== person?.defaultSite)
                    .map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="flex items-start gap-1.5 text-[13px] leading-snug text-muted-foreground">
                <ArrowLeftRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {site
                  ? `Estos días cuentan en ${site}. La sede habitual de la ficha no cambia.`
                  : "Para rotaciones, elige otra sede: aplica solo a los días elegidos y no cambia la ficha."}
              </p>
            </Section>
          )}

          <Section
            label="Observación"
            htmlFor="shift-note"
            aside={note.length > NOTE_MAX - 100 ? `${note.length}/${NOTE_MAX}` : "Opcional"}
          >
            <textarea
              id="shift-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={NOTE_MAX}
              placeholder="Ej. Cambio de horario por cita médica"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </Section>
        </div>

        <footer className="border-t border-border bg-background px-6 py-4">
          {summary && (
            <p className={cn("mb-3 text-[13px]", canSave ? "text-muted-foreground" : "text-available-ink")} aria-live="polite">
              {summary}
            </p>
          )}
          <div className="flex items-center gap-2">
            {hasWeek && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClearWeek}
                disabled={saving}
                aria-label="Borrar semana"
                className="-ml-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 />
                <span className="hidden sm:inline">Borrar semana</span>
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="ml-auto">
              Cancelar
            </Button>
            <Button type="button" onClick={onSave} disabled={!canSave || saving} className="min-w-[132px] font-bold">
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Guardando" : editMode ? "Guardar turno" : slots > 0 ? `Asignar ${slots} ${slots === 1 ? "turno" : "turnos"}` : "Asignar"}
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
