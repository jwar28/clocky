"use client";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

interface BrandProps {
  collapsed?: boolean;
  className?: string;
}

export function Brand({ collapsed = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-display font-bold tracking-tight text-primary",
          collapsed ? "text-base" : "text-xl",
        )}
      >
        RANSA
      </span>
      {!collapsed && (
        <span className="font-display text-base font-semibold text-muted-foreground">/ {APP_NAME}</span>
      )}
    </div>
  );
}