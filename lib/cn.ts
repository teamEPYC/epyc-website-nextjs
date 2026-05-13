import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge needs to know that our custom text-* utilities (text-display,
 * text-h1, …, text-body-lg, …) are FONT-SIZE utilities, not COLOR utilities —
 * otherwise it dedups them against `text-cream`, `text-ink`, etc. and the
 * intended colour disappears.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h2-light",
            "h3",
            "h4",
            "h4-alt",
            "h5",
            "body-lg",
            "body",
            "body-sm",
            "quote",
            "code",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
