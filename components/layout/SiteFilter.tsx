"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SiteFilterProps {
  value: string; // '' = all
  sites: string[];
  onChange: (next: string) => void;
}

export function SiteFilter({ value, sites, onChange }: SiteFilterProps) {
  return (
    <Select value={value || "__all__"} onValueChange={(v) => onChange(v === "__all__" ? "" : v)}>
      <SelectTrigger className="h-9 w-[170px] shrink-0" aria-label="Filtrar por sede">
        <SelectValue placeholder="Todas las sedes" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Todas las sedes</SelectItem>
        {sites.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}