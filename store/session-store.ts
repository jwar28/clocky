"use client";

import { create } from "zustand";
import { getInsForge } from "@/lib/insforge";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  async hydrate() {
    set({ loading: true, error: null });
    try {
      const insforge = getInsForge();
      const { data, error } = await insforge.auth.getCurrentUser();
      if (error) {
        set({ user: null, loading: false, initialized: true, error: error.message });
        return;
      }
      set({ user: data?.user ?? null, loading: false, initialized: true, error: null });
    } catch (e) {
      set({
        user: null,
        loading: false,
        initialized: true,
        error: e instanceof Error ? e.message : "Error desconocido",
      });
    }
  },

  async signIn(email, password) {
    set({ loading: true, error: null });
    try {
      const insforge = getInsForge();
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) {
        set({ loading: false, error: error.message });
        throw new Error(error.message);
      }
      set({ user: data?.user ?? null, loading: false, error: null, initialized: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      set({ loading: false, error: msg });
      throw e;
    }
  },

  async signOut() {
    set({ loading: true, error: null });
    try {
      const insforge = getInsForge();
      await insforge.auth.signOut();
      set({ user: null, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Error desconocido" });
    }
  },
}));