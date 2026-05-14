"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/pill";
import { OrnamentDivider } from "@/components/ui/ornament-divider";
import type { Testimonial } from "@/data/testimonials";

type Props = {
  testimonials: Testimonial[];
  className?: string;
};

/**
 * Voices slider — target design (per user spec).
 *
 *   LEFT  — portrait photo card (3:4-ish, 300×420 on desktop) with a faint
 *           offset ghost outline ~8px outside the card edge, same radius.
 *           Subtle diagonal shine overlay inside the photo. Below: a pair
 *           of wide-pill arrow buttons (~90×55, rounded-[28px], sand border,
 *           thin horizontal arrow).
 *   RIGHT — name (larger, ~56px desktop) / role / ornament / quote / ornament
 *           / tags. Single-paragraph quotes, text-body (Norms 16/16/12).
 */
export function TestimonialSlider({ testimonials, className }: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const total = testimonials.length;
  const current = testimonials[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + total) % total);
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-8 lg:flex-row lg:flex-wrap lg:gap-x-[30px] lg:gap-y-[50px]",
        className,
      )}
    >
      {/* LEFT — image card + arrows */}
      <div className="flex w-full flex-col items-center gap-6 lg:w-auto">
        {/* Photo card with ghost outline ~8px outside */}
        <div className="relative w-full max-w-[300px] lg:h-[420px] lg:w-[300px]">
          {/* Ghost outline — faint cream stroke sits 8px outside the card edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-[20px] border border-cream/20"
          />
          {/* Photo card */}
          <div className="relative aspect-[300/420] w-full overflow-hidden rounded-xl bg-cream/10 lg:h-[420px] lg:w-[300px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={current.id}
                initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={current.image.src}
                  alt={current.image.alt}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {/* Diagonal shine overlay — subtle highlight across the photo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,240,209,0.18) 49%, rgba(171,171,171,0) 100%)",
                transform: "translateX(20%) rotate(32deg)",
                opacity: 0.15,
              }}
            />
          </div>
        </div>

        {/* Arrow row — wide oval pills with a thin horizontal arrow.
            Renders only when there's more than one testimonial. */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="flex items-center justify-center rounded-[28px] border border-sand px-6 py-5 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ThinArrow direction="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="flex items-center justify-center rounded-[28px] border border-sand px-6 py-5 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ThinArrow direction="right" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT — text column */}
      <div className="relative w-full flex-1 lg:min-h-[460px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
            className="flex flex-col gap-[30px] lg:absolute lg:inset-0"
          >
            <div className="flex flex-col gap-2.5">
              <h2 className="text-h2 text-cream lg:!text-[56px] lg:!leading-[1.1]">
                {current.name}
              </h2>
              <p className="text-body text-cream">{current.role}</p>
            </div>

            <OrnamentDivider className="text-sand/50" />

            <p className="text-body text-cream">{current.quote.join(" ")}</p>

            <OrnamentDivider className="rotate-180 text-sand/50" />

            {current.tags && current.tags.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-body text-cream">
                  What {current.name.split(" ")[0]} loved about us
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {current.tags.map((tag) => (
                    <Pill key={tag} tone="cream-on-dark">
                      {tag}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Thin horizontal arrow ~42×15, matching the source's WKTkLtAbJiZyKGjLoki6qOZYOY.svg. */
function ThinArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width={42}
      height={15}
      viewBox="0 0 42 15"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M1 7.5h39" />
      <path d="M33 1.5l6.5 6-6.5 6" />
    </svg>
  );
}
