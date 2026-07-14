"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { TaxonomyItem } from "@/store/taxonomy-store";

export type TaxonomyKind = "site" | "role";

interface TaxonomyManagerProps {
  title: string;
  description?: string;
  kind: TaxonomyKind;
  items: TaxonomyItem[];
  loading: boolean;
  error: string | null;
  usageByName: (name: string) => number;
  onCreate: (name: string) => Promise<TaxonomyItem>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  /** Placeholder for the create input. */
  inputPlaceholder?: string;
}

const KIND_LABEL: Record<TaxonomyKind, { singular: string; plural: string; inUse: string }> = {
  site: { singular: "sede", plural: "sedes", inUse: "usada por" },
  role: { singular: "rol", plural: "roles", inUse: "usado por" },
};

export function TaxonomyManager({
  title,
  description,
  kind,
  items,
  loading,
  error,
  usageByName,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
  inputPlaceholder,
}: TaxonomyManagerProps) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const labels = KIND_LABEL[kind];

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await onCreate(name);
      setNewName("");
      toast.success(`${labels.singular[0]!.toUpperCase()}${labels.singular.slice(1)} creada`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item: TaxonomyItem) {
    setEditingId(item.id);
    setEditingName(item.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function commitEdit(item: TaxonomyItem) {
    const name = editingName.trim();
    if (!name || name === item.name) {
      cancelEdit();
      return;
    }
    setSavingId(item.id);
    try {
      await onUpdate(item.id, name);
      toast.success("Actualizado");
      cancelEdit();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: TaxonomyItem) {
    const usage = usageByName(item.name);
    if (usage > 0) {
      toast.error(
        `No se puede eliminar "${item.name}": ${labels.inUse} ${usage} empleado${usage === 1 ? "" : "s"}.`,
      );
      return;
    }
    if (!window.confirm(`¿Eliminar ${labels.singular} "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await onDelete(item.id);
      toast.success("Eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <span className="text-body-sm text-muted-foreground">
            {items.length} {labels.plural}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create new */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleCreate();
          }}
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={inputPlaceholder ?? `Nueva ${labels.singular}…`}
            disabled={creating}
          />
          <Button type="submit" disabled={creating || !newName.trim()}>
            Crear
          </Button>
        </form>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
            {error}
          </p>
        )}

        {/* List */}
        {loading && items.length === 0 ? (
          <ul className="space-y-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-outline-variant bg-muted/30 px-4 py-6 text-center text-body-sm text-muted-foreground">
            Aún no hay {labels.plural}. Agregá una arriba.
          </p>
        ) : (
          <ul className="divide-y divide-grid-soft rounded-md border border-outline-variant bg-card">
            {items.map((item) => {
              const usage = usageByName(item.name);
              const isEditing = editingId === item.id;
              return (
                <li key={item.id} className="flex items-center gap-2 px-3 py-2">
                  {isEditing ? (
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void commitEdit(item);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={savingId === item.id}
                      className="h-8 flex-1"
                    />
                  ) : (
                    <div className="flex flex-1 items-baseline gap-2">
                      <span className="text-body-sm font-medium text-foreground">{item.name}</span>
                      <span
                        className={cn(
                          "text-xs",
                          usage > 0 ? "text-muted-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        ({usage} {usage === 1 ? "empleado" : "empleados"})
                      </span>
                    </div>
                  )}

                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void commitEdit(item)}
                        disabled={savingId === item.id}
                        aria-label="Guardar"
                        title="Guardar"
                        className="text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        disabled={savingId === item.id}
                        aria-label="Cancelar"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                        aria-label={`Editar ${item.name}`}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        aria-label={`Eliminar ${item.name}`}
                        title="Eliminar"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => void onRefresh()} disabled={loading}>
            Refrescar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}