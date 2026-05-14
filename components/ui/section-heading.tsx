import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const sectionHeading = cva("", {
  variants: {
    tone: {
      ink: "text-ink",
      cream: "text-cream",
    },
    size: {
      h1: "text-h1",
      h2: "text-h2",
      "h2-light": "text-h2-light",
      h3: "text-h3",
    },
  },
  defaultVariants: { tone: "ink", size: "h2-light" },
});

type SectionHeadingProps = VariantProps<typeof sectionHeading> & {
  as?: "h1" | "h2" | "h3" | "h4";
  /** Slashes are added automatically; pass plain text. */
  children: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLHeadingElement>, "className" | "children">;

export function SectionHeading({
  as: Tag = "h2",
  tone,
  size,
  eyebrow,
  className,
  children,
  ...rest
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "text-h5 uppercase",
            tone === "cream" ? "text-cream/80" : "text-ink/60",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Tag className={sectionHeading({ tone, size })} {...rest}>
        / {children} /
      </Tag>
    </div>
  );
}
