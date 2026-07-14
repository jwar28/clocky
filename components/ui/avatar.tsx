import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

const SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-data-mono",
  md: "h-10 w-10 text-table-header",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-secondary-container font-display font-semibold uppercase text-primary",
        SIZE_MAP[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}