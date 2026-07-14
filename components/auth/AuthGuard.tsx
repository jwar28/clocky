"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";

/**
 * Client-side auth guard. Hydrates the session and redirects to /login if
 * there is no authenticated user. Shows a skeleton while initializing.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, initialized, hydrate } = useSessionStore();

  useEffect(() => {
    if (!initialized) hydrate();
  }, [initialized, hydrate]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login");
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-body-lg text-muted-foreground">Cargando sesión…</div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}