"use client";

import { Brand } from "./Brand";
import { AREA_LABEL } from "@/lib/constants";

/**
 * Minimal header for public pages (no sidebar, no admin actions).
 * Just the brand + area label. Mobile-friendly.
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background px-4 sm:px-5">
      <span aria-hidden className="mr-2.5 inline-block h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--primary-fixed))]" />
      <Brand className="text-foreground" />
      <span className="ml-3 hidden border-l border-border pl-3 text-sm text-muted-foreground sm:inline">
        {AREA_LABEL}
      </span>
    </header>
  );
}