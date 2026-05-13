import { cn } from "@/lib/cn";

type OrnamentDividerProps = {
  className?: string;
};

/**
 * The decorative horizontal line with a central 4-sparkle motif — used around
 * testimonial quotes. Stroked via currentColor so colour is controlled by text-*.
 */
export function OrnamentDivider({ className }: OrnamentDividerProps) {
  return (
    <svg
      viewBox="0 0 540 14"
      className={cn("h-3.5 w-full text-sand", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        d="M105.167 7.4c14.335 0 0-14.2 0 0Zm0 0c0 13.1 14.335 0 0 0Zm0 0c-14.665 0 0-14.4 0 0Zm0 0c0 13.1-14.665 0 0 0Zm0 0h434.335m-434.335 0H.002"
      />
    </svg>
  );
}
