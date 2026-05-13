import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const pill = cva(
  "inline-flex items-center rounded-pill whitespace-nowrap border text-body-sm px-6 py-4",
  {
    variants: {
      tone: {
        "cream-on-dark": "border-cream/25 text-cream",
        "ink-on-light": "border-ink/15 text-ink",
      },
    },
    defaultVariants: { tone: "ink-on-light" },
  },
);

type PillProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof pill> & {
    children: ReactNode;
  };

export function Pill({ tone, className, children, ...rest }: PillProps) {
  return (
    <span className={cn(pill({ tone }), className)} {...rest}>
      {children}
    </span>
  );
}
