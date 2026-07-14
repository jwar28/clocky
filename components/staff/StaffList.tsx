"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown, ChevronUp, Pencil, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { Staff } from "@/lib/types";

type SortColumn = "name" | "site" | "role";
type SortDir = "asc" | "desc";

interface StaffListProps {
  staff: Staff[];
  onAssign: (s: Staff) => void;
  onEdit: (s: Staff) => void;
  onDelete: (s: Staff) => void;
}

interface SortHeaderProps {
  label: string;
  column: SortColumn;
  active: SortColumn;
  dir: SortDir;
  onClick: (col: SortColumn) => void;
}

function SortHeader({ label, column, active, dir, onClick }: SortHeaderProps) {
  const isActive = active === column;
  return (
    <button
      type="button"
      onClick={() => onClick(column)}
      className={cn(
        "inline-flex items-center gap-1 font-display text-table-header uppercase tracking-wide",
        "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
      )}
    >
      <span>{label}</span>
      {isActive ? (
        dir === "asc" ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
      {/* aria-sort lives on the parent <th>, not on the button (jsx-a11y). */}
      <span data-sort-active={isActive} data-sort-dir={dir} className="sr-only">
        {isActive ? `Ordenado ${dir === "asc" ? "ascendente" : "descendente"}` : "Sin ordenar"}
      </span>
    </button>
  );
}

function compareStaff(a: Staff, b: Staff, column: SortColumn): number {
  switch (column) {
    case "name":
      return a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" });
    case "site":
      return (a.defaultSite || "").localeCompare(b.defaultSite || "", "es", { sensitivity: "base" });
    case "role":
      return a.role.localeCompare(b.role, "es", { sensitivity: "base" });
  }
}

export function StaffList({ staff, onAssign, onEdit, onDelete }: StaffListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedStaff = useMemo(() => {
    const copy = [...staff];
    copy.sort((a, b) => {
      const cmp = compareStaff(a, b, sortColumn);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [staff, sortColumn, sortDir]);

  function handleSort(col: SortColumn) {
    if (col === sortColumn) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-grid bg-card">
      <table className="w-full border-collapse text-body-sm">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th
              scope="col"
              aria-sort={sortColumn === "name" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              className="cell-pad border border-grid text-left min-w-[260px]"
            >
              <SortHeader label="Personal" column="name" active={sortColumn} dir={sortDir} onClick={handleSort} />
            </th>
            <th
              scope="col"
              aria-sort={sortColumn === "site" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              className="cell-pad border border-grid text-left min-w-[180px]"
            >
              <SortHeader label="Sede" column="site" active={sortColumn} dir={sortDir} onClick={handleSort} />
            </th>
            <th
              scope="col"
              aria-sort={sortColumn === "role" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              className="cell-pad border border-grid text-left min-w-[160px]"
            >
              <SortHeader label="Rol" column="role" active={sortColumn} dir={sortDir} onClick={handleSort} />
            </th>
            <th scope="col" className="cell-pad border border-grid text-right min-w-[160px]">
              <span className="font-display text-table-header uppercase tracking-wide">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="row-zebra">
          {sortedStaff.length === 0 ? (
            <tr>
              <td colSpan={4} className="cell-pad border border-grid text-center text-body-sm text-muted-foreground">
                Sin personal para mostrar.
              </td>
            </tr>
          ) : (
            sortedStaff.map((s) => (
              <tr key={s.id} className="hover:bg-secondary-container/60 focus-within:bg-secondary-container/60">
                <td className="cell-pad border border-grid">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.fullName} size="sm" />
                    <span className="font-semibold text-foreground">{s.fullName}</span>
                  </div>
                </td>
                <td className="cell-pad border border-grid text-muted-foreground">{s.defaultSite || "—"}</td>
                <td className="cell-pad border border-grid text-muted-foreground">{s.role}</td>
                <td className="cell-pad border border-grid">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAssign(s)}
                      aria-label={`Asignar turnos a ${s.fullName}`}
                      title="Asignar turnos"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(s)}
                      aria-label={`Editar ${s.fullName}`}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(s)}
                      aria-label={`Eliminar ${s.fullName}`}
                      title="Eliminar"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}