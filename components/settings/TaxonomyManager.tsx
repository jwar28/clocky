"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { Staff } from "@/lib/types";
import type { TaxonomyItem } from "@/store/taxonomy-store";

export type TaxonomyKind = "site" | "role";

interface TaxonomyManagerProps {
  id: string;
  title: string;
  description: string;
  kind: TaxonomyKind;
  items: TaxonomyItem[];
  loading: boolean;
  error: string | null;
  /** People using each value (habitual sede, or rol). */
  staff: Staff[];
  onCreate: (name: string) => Promise<TaxonomyItem>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRetry: () => Promise<void>;
  placeholder: string;
}

const COPY: Record<TaxonomyKind, { one: string; the: string; created: (n: string) => string; deleted: (n: string) => string; renameHint: string }> = {
  site: {
    one: "sede",
    the: "la sede",
    created: (n) => `Sede "${n}" agregada`,
    deleted: (n) => `Sede "${n}" eliminada`,
    renameHint: "Se actualiza en las fichas y en las rotaciones de la malla.",
  },
  role: {
    one: "rol",
    the: "el rol",
    created: (n) => `Rol "${n}" agregado`,
    deleted: (n) => `Rol "${n}" eliminado`,
    renameHint: "Se actualiza en las fichas del personal.",
  },
};

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

/** One editable list (sedes or roles) as a settings section. */
export function TaxonomyManager({
  id,
  title,
  description,
  kind,
  items,
  loading,
  error,
  staff,
  onCreate,
  onUpdate,
  onDelete,
  onRetry,
  placeholder,
}: TaxonomyManagerProps) {
  const c = COPY[kind];
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);
  const [openUsage, setOpenUsage] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TaxonomyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const peopleBy = useMemo(() => {
    const m = new Map<string, Staff[]>();
    for (const s of staff) {
      const key = kind === "site" ? s.defaultSite : s.role;
      if (key) m.set(key, [...(m.get(key) ?? []), s]);
    }
    return m;
  }, [staff, kind]);

  // Duplicates ignore case and accents ("fontibon" = "Fontibón"); returns the existing name.
  const existing = (name: string, exceptId?: string) =>
    name.trim() ? items.find((i) => i.id !== exceptId && normalize(i.name) === normalize(name))?.name : undefined;

  const newDuplicate = existing(newName);
  const editDuplicate = editingId !== null ? existing(editingName, editingId) : undefined;

  const visible = useMemo(() => {
    const q = normalize(query);
    return q ? items.filter((i) => normalize(i.name).includes(q)) : items;
  }, [items, query]);

  async function create() {
    const name = newName.trim();
    if (!name || newDuplicate) return;
    setCreating(true);
    try {
      await onCreate(name);
      setNewName("");
      toast.success(c.created(name));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo agregar. Intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: TaxonomyItem) {
    setEditingId(item.id);
    setEditingName(item.name);
    setOpenUsage(null);
  }

  async function commitEdit(item: TaxonomyItem) {
    const name = editingName.trim();
    if (!name || name === item.name) {
      setEditingId(null);
      return;
    }
    if (editDuplicate) return;
    setSaving(true);
    try {
      await onUpdate(item.id, name);
      toast.success(`"${item.name}" ahora se llama "${name}"`);
      setEditingId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo renombrar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete(toDelete.id);
      toast.success(c.deleted(toDelete.name));
      setToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  }

  const deletePeople = toDelete ? peopleBy.get(toDelete.name) ?? [] : [];

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 id={`${id}-title`} className="text-lg font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {items.length > 0 && <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{items.length}</span>}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {/* Add */}
        <form
          className="flex items-start gap-2 border-b border-border bg-muted/40 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-new`} className="sr-only">
              Nueva {c.one}
            </label>
            <input
              id={`${id}-new`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={placeholder}
              disabled={creating}
              aria-invalid={Boolean(newDuplicate)}
              aria-describedby={newDuplicate ? `${id}-dup` : undefined}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 aria-[invalid=true]:border-destructive"
            />
            {newDuplicate && (
              <p id={`${id}-dup`} className="mt-1 text-[13px] text-destructive">
                Ya existe {c.the} &ldquo;{newDuplicate}&rdquo;.
              </p>
            )}
          </div>
          <Button type="submit" className="h-10 shrink-0 font-bold" disabled={creating || !newName.trim() || Boolean(newDuplicate)}>
            {creating ? <Loader2 className="animate-spin" /> : <Plus />}
            Agregar
          </Button>
        </form>

        {items.length > 8 && (
          <label className="relative flex items-center border-b border-border">
            <span className="sr-only">Buscar en {title.toLowerCase()}</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar en ${title.toLowerCase()}`}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        )}

        {/* List */}
        {loading && items.length === 0 ? (
          <div className="space-y-px p-3" aria-busy aria-label={`Cargando ${title.toLowerCase()}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-bold">No se pudo cargar la lista</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void onRetry()}>
              Reintentar
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Todavía no hay {title.toLowerCase()}. Agrega la primera arriba.
          </p>
        ) : visible.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nada coincide con &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((item) => {
              const people = peopleBy.get(item.name) ?? [];
              const editing = editingId === item.id;
              const showPeople = openUsage === item.id && people.length > 0;
              return (
                <li key={item.id} className="group">
                  {editing ? (
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void commitEdit(item);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          disabled={saving}
                          aria-label={`Nuevo nombre para ${item.name}`}
                          aria-invalid={Boolean(editDuplicate)}
                          className="h-9 min-w-0 flex-1 rounded-lg border border-primary bg-background px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 aria-[invalid=true]:border-destructive"
                        />
                        <Button size="sm" className="h-9 font-bold" onClick={() => void commitEdit(item)} disabled={saving || Boolean(editDuplicate) || !editingName.trim()}>
                          {saving ? <Loader2 className="animate-spin" /> : <Check />}
                          Guardar
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Cancelar" onClick={() => setEditingId(null)} disabled={saving}>
                          <X />
                        </Button>
                      </div>
                      <p className={cn("mt-1.5 text-[13px]", editDuplicate ? "text-destructive" : "text-muted-foreground")}>
                        {editDuplicate
                          ? `Ya existe ${c.the} "${editDuplicate}".`
                          : people.length > 0
                            ? `${c.renameHint} Afecta a ${people.length} ${people.length === 1 ? "persona" : "personas"}.`
                            : c.renameHint}
                      </p>
                    </div>
                  ) : (
                    <div className="flex min-h-[52px] items-center gap-3 px-4 py-2 transition-colors hover:bg-secondary-container/50">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="min-w-0 flex-1 truncate rounded text-left text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        title="Clic para renombrar"
                      >
                        {item.name}
                      </button>
                      <button
                        type="button"
                        disabled={people.length === 0}
                        onClick={() => setOpenUsage(showPeople ? null : item.id)}
                        aria-expanded={people.length > 0 ? showPeople : undefined}
                        className={cn(
                          "shrink-0 rounded-md px-2 py-1 text-[13px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          people.length > 0 ? "text-foreground hover:bg-muted" : "cursor-default text-muted-foreground",
                          showPeople && "bg-muted",
                        )}
                      >
                        {people.length === 0 ? "Sin personas" : `${people.length} ${people.length === 1 ? "persona" : "personas"}`}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label={`Acciones para ${item.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => startEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Renombrar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setToDelete(item)}
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  {showPeople && !editing && (
                    <p className="px-4 pb-3 text-[13px] leading-relaxed text-muted-foreground">
                      {people.map((p) => p.fullName).join(", ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              {deletePeople.length > 0 ? `No se puede eliminar "${toDelete?.name}"` : `¿Eliminar "${toDelete?.name}"?`}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {deletePeople.length > 0
                ? `Está asignad${kind === "site" ? "a" : "o"} a ${deletePeople.length} ${deletePeople.length === 1 ? "persona" : "personas"}: ${deletePeople
                    .map((p) => p.fullName)
                    .join(", ")}. Cámbiales ${c.the} en Personal y vuelve a intentarlo.`
                : kind === "site"
                  ? "Desaparece de la lista de sedes. Si tiene días de rotación en la malla, no se podrá eliminar."
                  : "Desaparece de la lista de roles."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setToDelete(null)} disabled={deleting}>
              {deletePeople.length > 0 ? "Entendido" : "Cancelar"}
            </Button>
            {deletePeople.length === 0 && (
              <Button variant="destructive" onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting ? "Eliminando" : "Eliminar"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
