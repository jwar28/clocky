"use client";

import { create } from "zustand";
import { getInsForge } from "@/lib/insforge";
import type { Staff, StaffInput } from "@/lib/types";

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchStaff: () => Promise<void>;
  createStaff: (input: StaffInput) => Promise<Staff>;
  updateStaff: (id: string, patch: Partial<StaffInput>) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  reset: () => void;
}

type StaffRow = {
  id: string;
  full_name: string;
  default_site: string | null;
  role: string;
  active: boolean;
  created_at?: string;
};

function mapRow(row: StaffRow): Staff {
  return {
    id: row.id,
    fullName: row.full_name,
    defaultSite: row.default_site ?? "",
    role: row.role,
    active: row.active,
    createdAt: row.created_at,
  };
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  loading: false,
  error: null,
  fetched: false,

  async fetchStaff() {
    set({ loading: true, error: null });
    try {
      const insforge = getInsForge();
      const { data, error } = await insforge.database
        .from("staff")
        .select("id, full_name, default_site, role, active, created_at")
        .order("full_name", { ascending: true });
      if (error) throw new Error(error.message);
      const list = (data ?? []).map((r) => mapRow(r as unknown as StaffRow));
      set({ staff: list, loading: false, fetched: true, error: null });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Error al cargar personal", fetched: true });
    }
  },

  async createStaff(input) {
    try {
      const insforge = getInsForge();
      const { data, error } = await insforge.database
        .from("staff")
        .insert({
          full_name: input.fullName,
          default_site: input.defaultSite || null,
          role: input.role,
          active: input.active ?? true,
        })
        .select("id, full_name, default_site, role, active, created_at")
        .single();
      if (error) throw new Error(error.message);
      const created = mapRow(data as unknown as StaffRow);
      set({ staff: [...get().staff, created].sort((a, b) => a.fullName.localeCompare(b.fullName)) });
      return created;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear empleado";
      set({ error: msg });
      throw e;
    }
  },

  async updateStaff(id, patch) {
    try {
      const insforge = getInsForge();
      const update: Record<string, unknown> = {};
      if (patch.fullName !== undefined) update.full_name = patch.fullName;
      if (patch.defaultSite !== undefined) update.default_site = patch.defaultSite || null;
      if (patch.role !== undefined) update.role = patch.role;
      if (patch.active !== undefined) update.active = patch.active;
      update.updated_at = new Date().toISOString();
      const { error } = await insforge.database.from("staff").update(update).eq("id", id);
      if (error) throw new Error(error.message);
      set({
        staff: get()
          .staff.map((s) =>
            s.id === id
              ? {
                  ...s,
                  fullName: patch.fullName ?? s.fullName,
                  defaultSite: patch.defaultSite ?? s.defaultSite,
                  role: patch.role ?? s.role,
                  active: patch.active ?? s.active,
                }
              : s,
          )
          .sort((a, b) => a.fullName.localeCompare(b.fullName)),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar empleado";
      set({ error: msg });
      throw e;
    }
  },

  async removeStaff(id) {
    try {
      const insforge = getInsForge();
      const { error } = await insforge.database.from("staff").delete().eq("id", id);
      if (error) throw new Error(error.message);
      set({ staff: get().staff.filter((s) => s.id !== id) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar empleado";
      set({ error: msg });
      throw e;
    }
  },

  reset() {
    set({ staff: [], loading: false, error: null, fetched: false });
  },
}));