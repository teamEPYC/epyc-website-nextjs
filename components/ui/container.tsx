import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const container = cva("mx-auto w-full px-4 sm:px-6 lg:px-15", {
  variants: {
    width: {
      content: "max-w-[var(--container-content)]",
      outer: "max-w-[var(--container-outer)]",
      // Same 1440 cap as `outer`, wider gutters (32/92 vs 24/60) — a 1256px
      // content column. `cn()` runs twMerge, so these beat the base padding.
      wide: "max-w-[var(--container-outer)] sm:px-8 lg:px-[92px]",
      prose: "max-w-prose",
    },
  },
  defaultVariants: { width: "content" },
});

type ContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof container> & { children: ReactNode };

export function Container({
  width,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div className={cn(container({ width }), className)} {...rest}>
      {children}
    </div>
  );
}
