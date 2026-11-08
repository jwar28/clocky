"use client";

import { create } from "zustand";
import { getInsForge } from "@/lib/insforge";
import { useStaffStore } from "@/store/staff-store";
import { useScheduleStore } from "@/store/schedule-store";
import type { WeekDays } from "@/lib/types";

type ScheduleDaysRow = { id: string; days: WeekDays };

/** All schedule rows whose days rotate to the sede `name`. Small team → a full scan is fine. */
async function schedulesUsingSite(name: string): Promise<ScheduleDaysRow[]> {
  const { data, error } = await getInsForge().database.from("schedules").select("id, days");
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ScheduleDaysRow[]).filter((r) =>
    Object.values(r.days ?? {}).some((d) => d?.site === name),
  );
}

/** Number of days (across all weeks) assigned to sede `name` as a rotation. */
export async function countSiteRotationDays(name: string): Promise<number> {
  const rows = await schedulesUsingSite(name);
  return rows.reduce((n, r) => n + Object.values(r.days).filter((d) => d?.site === name).length, 0);
}

export interface TaxonomyItem {
  id: string;
  name: string;
  createdAt?: string;
}

interface TaxonomyState {
  items: TaxonomyItem[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetch: () => Promise<void>;
  create: (name: string) => Promise<TaxonomyItem>;
  update: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Counts how many staff members reference this name. Reads from staff-store. */
  usageByName: (name: string) => number;
}

type TaxonomyRow = {
  id: string;
  name: string;
  created_at?: string;
};

function mapRow(row: TaxonomyRow): TaxonomyItem {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

/** Generic factory: pass the table name and we get a full CRUD store. */
function createTaxonomyStore(table: "sites" | "roles") {
  return create<TaxonomyState>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    fetched: false,

    async fetch() {
      set({ loading: true, error: null });
      try {
        const insforge = getInsForge();
        const { data, error } = await insforge.database
          .from(table)
          .select("id, name, created_at")
          .order("name", { ascending: true });
        if (error) throw new Error(error.message);
        const list = (data ?? []).map((r) => mapRow(r as unknown as TaxonomyRow));
        set({ items: list, loading: false, fetched: true, error: null });
      } catch (e) {
        set({
          loading: false,
          error: e instanceof Error ? e.message : `Error al cargar ${table}`,
          fetched: true,
        });
      }
    },

    async create(name) {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("El nombre no puede estar vacío");
      try {
        const insforge = getInsForge();
        const { data, error } = await insforge.database
          .from(table)
          .insert({ name: trimmed })
          .select("id, name, created_at")
          .single();
        if (error) throw new Error(error.message);
        const created = mapRow(data as unknown as TaxonomyRow);
        set({
          items: [...get().items, created].sort((a, b) =>
            a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
          ),
        });
        return created;
      } catch (e) {
        const msg = e instanceof Error ? e.message : `Error al crear ${table === "sites" ? "sede" : "rol"}`;
        set({ error: msg });
        throw e;
      }
    },

    async update(id, name) {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("El nombre no puede estar vacío");
      const oldItem = get().items.find((x) => x.id === id);
      if (!oldItem) throw new Error("Elemento no encontrado");
      const oldName = oldItem.name;
      try {
        const insforge = getInsForge();
        // 1) Rename the taxonomy entry
        const { error: tError } = await insforge.database
          .from(table)
          .update({ name: trimmed })
          .eq("id", id);
        if (tError) throw new Error(tError.message);

        // 2) Cascade: update staff.default_site or staff.role
        const staffColumn = table === "sites" ? "default_site" : "role";
        const { error: sError } = await insforge.database
          .from("staff")
          .update({ [staffColumn]: trimmed, updated_at: new Date().toISOString() })
          .eq(staffColumn, oldName);
        // If staff update fails (e.g. no rows), don't crash — taxonomy rename succeeded.
        if (sError) {
          console.warn(`[taxonomy:${table}] cascade update warning:`, sError.message);
        }

        // 2b) Sedes also live on schedule days (rotations) — rename them there too.
        if (table === "sites") {
          const rows = await schedulesUsingSite(oldName);
          const renamed = rows.map((r) => {
            const days = { ...r.days } as WeekDays;
            for (const k of Object.keys(days) as unknown as Array<keyof WeekDays>) {
              if (days[k]?.site === oldName) days[k] = { ...days[k], site: trimmed };
            }
            return { id: r.id, days };
          });
          await Promise.all(
            renamed.map((r) =>
              insforge.database
                .from("schedules")
                .update({ days: r.days, updated_at: new Date().toISOString() })
                .eq("id", r.id)
                .then(({ error }) => {
                  if (error) throw new Error(error.message);
                }),
            ),
          );
          const byId = new Map(renamed.map((r) => [r.id, r.days]));
          useScheduleStore.setState((s) => ({
            byWeek: Object.fromEntries(
              Object.entries(s.byWeek).map(([wk, list]) => [
                wk,
                list.map((row) => (byId.has(row.id) ? { ...row, days: byId.get(row.id)! } : row)),
              ]),
            ),
          }));
        }

        // 3) Refresh local caches
        set({
          items: get()
            .items.map((x) => (x.id === id ? { ...x, name: trimmed } : x))
            .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" })),
        });
        // Staff store also needs to reflect the rename
        if (table === "sites") {
          useStaffStore.setState((s) => ({
            staff: s.staff.map((m) => (m.defaultSite === oldName ? { ...m, defaultSite: trimmed } : m)),
          }));
        } else {
          useStaffStore.setState((s) => ({
            staff: s.staff.map((m) => (m.role === oldName ? { ...m, role: trimmed } : m)),
          }));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : `Error al actualizar`;
        set({ error: msg });
        throw e;
      }
    },

    async remove(id) {
      const item = get().items.find((x) => x.id === id);
      if (!item) return;
      const usage = get().usageByName(item.name);
      if (usage > 0) {
        const kind = table === "sites" ? "sede" : "rol";
        throw new Error(
          `No se puede eliminar "${item.name}": está en uso por ${usage} empleado${usage === 1 ? "" : "s"}.`,
        );
      }
      if (table === "sites") {
        const rotationDays = await countSiteRotationDays(item.name);
        if (rotationDays > 0) {
          throw new Error(
            `No se puede eliminar "${item.name}": tiene ${rotationDays} día${rotationDays === 1 ? "" : "s"} de rotación asignado${rotationDays === 1 ? "" : "s"} en la malla.`,
          );
        }
      }
      try {
        const insforge = getInsForge();
        const { error } = await insforge.database.from(table).delete().eq("id", id);
        if (error) throw new Error(error.message);
        set({ items: get().items.filter((x) => x.id !== id) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : `Error al eliminar`;
        set({ error: msg });
        throw e;
      }
    },

    usageByName(name) {
      const staff = useStaffStore.getState().staff;
      if (!name) return 0;
      const field = table === "sites" ? "defaultSite" : "role";
      return staff.filter((s) => s[field] === name).length;
    },
  }));
}

export const useSitesStore = createTaxonomyStore("sites");
export const useRolesStore = createTaxonomyStore("roles");