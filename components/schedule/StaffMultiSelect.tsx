"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { useStaffStore } from "@/store/staff-store";
import type { Staff } from "@/lib/types";

interface StaffMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Optional: limit to staff matching a specific site. */
  siteFilter?: string;
  /** Initial staff id to focus the "Add" popover at. */
  prefillId?: string;
  className?: string;
}

export function StaffMultiSelect({
  selectedIds,
  onChange,
  siteFilter,
  className,
}: StaffMultiSelectProps) {
  const staff = useStaffStore((s) => s.staff);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedStaff = useMemo(
    () =>
      selectedIds
        .map((id) => staff.find((s) => s.id === id))
        .filter((s): s is Staff => Boolean(s)),
    [selectedIds, staff],
  );

  const candidates = useMemo(() => {
    const selected = new Set(selectedIds);
    const base = staff.filter((s) => !selected.has(s.id));
    const pool = siteFilter ? base.filter((s) => s.defaultSite === siteFilter) : base;
    if (!query.trim()) return pool;
    const q = query.toLowerCase();
    return pool.filter(
      (s) => s.fullName.toLowerCase().includes(q) || s.defaultSite.toLowerCase().includes(q),
    );
  }, [staff, selectedIds, siteFilter, query]);

  function add(id: string) {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setQuery("");
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  // ────────────────────────────────────────────────────────────────────────
  // Empty state — invites the user to add the first person
  // ────────────────────────────────────────────────────────────────────────
  if (selectedStaff.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-outline-variant bg-muted/30 px-4 py-4">
          <p className="text-body-sm text-muted-foreground">
            Aún no hay personas. Agregá al menos una para empezar.
          </p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button type="button" size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Agregar persona
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-2" align="start">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o sede…"
                className="mb-2"
              />
              <ul className="max-h-[260px] overflow-y-auto">
                {candidates.length === 0 ? (
                  <li className="px-2 py-3 text-center text-body-sm text-muted-foreground">
                    Sin resultados.
                  </li>
                ) : (
                  candidates.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          add(s.id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-body-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                      >
                        <Avatar name={s.fullName} size="sm" className="!h-7 !w-7 text-[11px]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{s.fullName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {s.defaultSite || "—"}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Populated state — chips + "Agregar otra persona"
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {selectedStaff.map((s) => (
          <span
            key={s.id}
            className="inline-flex items-center gap-2 rounded-pill border border-outline-variant bg-secondary-container/40 py-1 pl-1 pr-2 text-body-sm"
          >
            <Avatar name={s.fullName} size="sm" className="!h-6 !w-6 text-[10px]" />
            <span className="font-medium">{s.fullName}</span>
            <button
              type="button"
              onClick={() => remove(s.id)}
              aria-label={`Quitar a ${s.fullName}`}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-pill text-body-sm"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Agregar otra persona
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-2" align="start">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o sede…"
              className="mb-2"
            />
            <ul className="max-h-[260px] overflow-y-auto">
              {candidates.length === 0 ? (
                <li className="px-2 py-3 text-center text-body-sm text-muted-foreground">
                  Sin resultados.
                </li>
              ) : (
                candidates.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        add(s.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-body-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <Avatar name={s.fullName} size="sm" className="!h-7 !w-7 text-[11px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{s.fullName}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {s.defaultSite || "—"}
                        </span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedStaff.length === 1
          ? "1 persona seleccionada."
          : `${selectedStaff.length} personas seleccionadas.`}
      </p>
    </div>
  );
}