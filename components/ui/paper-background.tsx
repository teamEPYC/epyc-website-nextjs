import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PaperBackgroundProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  gradient?: "top" | "bottom" | "both" | "none";
  textureUrl?: string;
};

/**
 * Wraps a section with the recurring warm paper texture and optional dark-green
 * fade-out gradients at top/bottom. Texture URL points at a remote Framer asset
 * by default — Step 3 may swap this to a self-hosted image.
 */
export function PaperBackground({
  children,
  gradient = "none",
  textureUrl = "https://framerusercontent.com/images/4svPWouJqvqnznpkeku35FoPOY.webp",
  className,
  style,
  ...rest
}: PaperBackgroundProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
      {...rest}
    >
      {gradient === "top" || gradient === "both" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[14%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(24, 50, 41, 0) 0%, var(--color-ink) 59%)",
          }}
        />
      ) : null}
      {gradient === "bottom" || gradient === "both" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[7%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(24, 50, 41, 0) 0%, var(--color-ink) 100%)",
          }}
        />
      ) : null}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
