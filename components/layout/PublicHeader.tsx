"use client";

import { Brand } from "./Brand";
import { AREA_LABEL } from "@/lib/constants";

/**
 * Minimal header for public pages (no sidebar, no admin actions).
 * Just the brand + area label. Mobile-friendly.
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-outline-variant bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
      <Brand />
      <span className="ml-2 hidden text-body-sm text-muted-foreground sm:inline">
        · {AREA_LABEL}
      </span>
    </header>
  );
}