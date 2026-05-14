"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Pixels to translate up from. Default 16. */
  y?: number;
  /** Animation duration in seconds. Default 0.45. */
  duration?: number;
  /** Delay in seconds. Default 0. */
  delay?: number;
  /** Trigger threshold (0–1). Default 0.1. */
  amount?: number;
  /** Render as which HTML tag. Default "div". */
  as?: "div" | "section" | "header" | "footer" | "article" | "li";
};

/**
 * Fade + rise on first appearance in the viewport. Honours
 * `prefers-reduced-motion` — when enabled, renders the final state with no
 * tween. Server-safe: only the motion wrapper is client; children can be
 * server components.
 */
export function Reveal({
  children,
  className,
  y = 16,
  duration = 0.45,
  delay = 0,
  amount = 0.1,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();

  const initial = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y };
  const animate = inView ? { opacity: 1, y: 0 } : initial;
  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: reduce ? 0 : duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
