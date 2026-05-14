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

const FRAME_SVG =
  "https://framerusercontent.com/images/UDA17654NsGwNB4PAZVy4qrxgmc.svg";

/**
 * Voices slider mapped to Framer source (framer-y5vrV).
 *
 *   LEFT  — image card 360×476 with an ornamental SVG frame (framer-1qezum8),
 *           inner photo 340×423 rounded-xl, subtle diagonal shine overlay.
 *           Below: a pair of wide-pill arrow buttons (framer-aKZE1, ~90×55,
 *           rounded-[28px], sand border, thin horizontal arrow).
 *   RIGHT — name / role / ornament / quote / ornament / tags. Single-paragraph
 *           quotes, text-body (Norms 16/16/12).
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
      <div className="flex w-full flex-col items-center gap-2.5 lg:w-auto">
        {/* Outer card: ornamental SVG frame behind, photo positioned with 26px top inset */}
        <div className="relative flex w-full max-w-[360px] flex-col items-center pt-[26px] lg:h-[476px] lg:w-[360px]">
          {/* Decorative frame SVG — fills the 360×476 container behind everything else */}
          <Image
            src={FRAME_SVG}
            alt=""
            fill
            sizes="360px"
            className="object-contain"
            aria-hidden
          />
          {/* Photo card — sits on top of the frame */}
          <div className="relative aspect-[340/423] w-full max-w-[340px] overflow-hidden rounded-xl bg-cream/10 lg:h-[423px] lg:w-[340px]">
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
                  sizes="340px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {/* Diagonal shine overlay — matches the subtle linear-gradient
                highlight running across the source photo (framer-1a4bmgs). */}
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
              <h2 className="text-h2 text-cream">{current.name}</h2>
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
