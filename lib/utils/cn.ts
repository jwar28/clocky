import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the project's custom font sizes; otherwise it reads
 * `text-body-sm` as a color and drops it when merged with e.g. `text-destructive`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["headline-xl", "headline-md", "body-lg", "body-sm", "table-header", "data-mono"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
