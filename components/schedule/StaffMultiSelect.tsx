"use client";

import { useMemo, useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import { useStaffStore } from "@/store/staff-store";
import type { Staff } from "@/lib/types";

interface StaffMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Optional: limit the list to one site. */
  siteFilter?: string;
  className?: string;
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Selected people as removable chips, plus a searchable checklist that stays open while picking. */
export function StaffMultiSelect({ selectedIds, onChange, siteFilter, className }: StaffMultiSelectProps) {
  const staff = useStaffStore((s) => s.staff);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => selectedIds.map((id) => staff.find((s) => s.id === id)).filter((s): s is Staff => Boolean(s)),
    [selectedIds, staff],
  );

  const list = useMemo(() => {
    const pool = siteFilter ? staff.filter((s) => s.defaultSite === siteFilter) : staff;
    const q = normalize(query.trim());
    return q ? pool.filter((s) => normalize(`${s.fullName} ${s.defaultSite}`).includes(q)) : pool;
  }, [staff, siteFilter, query]);

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  return (
    <div className={cn("space-y-2", className)}>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Personas seleccionadas">
          {selected.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-1 rounded-md border border-input bg-background py-1 pl-2.5 pr-1 text-sm"
            >
              <span className="font-bold">{s.fullName}</span>
              {s.defaultSite && <span className="ml-1 text-muted-foreground">{s.defaultSite}</span>}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-label={`Quitar a ${s.fullName}`}
                className="ml-0.5 grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-input px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-solid data-[state=open]:border-primary data-[state=open]:text-foreground"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            {selected.length === 0 ? "Elegir personas" : "Agregar o quitar personas"}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o sede"
              aria-label="Buscar persona"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-[280px] overflow-y-auto p-1" role="listbox" aria-multiselectable>
            {list.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nadie coincide con la búsqueda.</li>
            ) : (
              list.map((s) => {
                const on = selectedIds.includes(s.id);
                return (
                  <li key={s.id} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded border",
                          on ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {on && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{s.fullName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{s.defaultSite || "—"}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>
              {selected.length} {selected.length === 1 ? "seleccionada" : "seleccionadas"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 font-bold text-foreground hover:bg-muted"
            >
              Listo
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
