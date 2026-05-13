import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const section = cva("relative w-full py-[30px] lg:py-12", {
  variants: {
    tone: {
      beige: "bg-beige text-ink",
      ink: "bg-ink text-cream",
      cream: "bg-cream text-ink",
      transparent: "bg-transparent",
    },
  },
  defaultVariants: { tone: "beige" },
});

type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof section> & { children: ReactNode };

export function Section({ tone, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn(section({ tone }), className)} {...rest}>
      {children}
    </section>
  );
}
