"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";
import type { TaxonomyItem } from "@/store/taxonomy-store";

export type TaxonomyKind = "site" | "role";

interface SiteRoleComboboxProps {
  /** Currently selected name. */
  value: string;
  onChange: (next: string) => void;
  /** Items available in the dropdown. */
  items: TaxonomyItem[];
  /** Loading state. */
  loading?: boolean;
  /** Quick-add: called when user types a value that doesn't exist. */
  onCreate: (name: string) => Promise<TaxonomyItem>;
  /** Allow clearing the selection. */
  allowClear?: boolean;
  /** Kind label shown in placeholder + create label. */
  kind: TaxonomyKind;
  /** Placeholder shown in the trigger. */
  placeholder?: string;
  /** id attribute for the trigger button (for label associations). */
  id?: string;
  /** Disable the trigger. */
  disabled?: boolean;
  className?: string;
}

const KIND_LABELS: Record<TaxonomyKind, { none: string; create: string }> = {
  site: { none: "— Sin sede —", create: "Crear sede" },
  role: { none: "— Sin rol —", create: "Crear rol" },
};

export function SiteRoleCombobox({
  value,
  onChange,
  items,
  loading = false,
  onCreate,
  allowClear = true,
  kind,
  placeholder,
  id,
  disabled,
  className,
}: SiteRoleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const trimmed = query.trim();
  const exactMatch = items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
  const showCreate = trimmed.length > 0 && !exactMatch && !loading;

  // Ensure items are fetched on mount (lazy via parent — caller decides).
  useEffect(() => {
    if (!open) {
      // Reset query when closing the popover
      const t = setTimeout(() => setQuery(""), 100);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  async function handleCreate() {
    if (!trimmed) return;
    setCreating(true);
    try {
      const created = await onCreate(trimmed);
      onChange(created.name);
      setQuery("");
      setOpen(false);
      toast.success(`${KIND_LABELS[kind].create}: "${created.name}"`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `No se pudo crear`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
        >
          <span className="truncate">{value || placeholder || KIND_LABELS[kind].none}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={`Buscar o crear ${kind === "site" ? "sede" : "rol"}…`}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando…" : trimmed ? "Sin coincidencias." : "Empezá a escribir."}
            </CommandEmpty>

            <CommandGroup>
              {allowClear && (
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value ? "opacity-0" : "opacity-100")} />
                  <span className="text-muted-foreground">{KIND_LABELS[kind].none}</span>
                </CommandItem>
              )}
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === item.name.toLowerCase() ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            {showCreate && (
              <CommandGroup heading="Crear nuevo">
                <CommandItem
                  value={`__create__${trimmed}`}
                  onSelect={handleCreate}
                  disabled={creating}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>
                    {KIND_LABELS[kind].create} &ldquo;<strong>{trimmed}</strong>&rdquo;
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}