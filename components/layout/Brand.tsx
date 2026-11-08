"use client";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

interface BrandProps {
  collapsed?: boolean;
  className?: string;
}

export function Brand({ collapsed = false, className }: BrandProps) {
  return (
    <span
      className={cn(
        "font-extrabold tracking-tight",
        collapsed ? "text-base" : "text-xl",
        className,
      )}
    >
      {APP_NAME}
    </span>
  );
}