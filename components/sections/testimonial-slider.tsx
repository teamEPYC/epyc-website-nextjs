"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/pill";
import { OrnamentDivider } from "@/components/ui/ornament-divider";
import { ArrowRight } from "@/components/icons/arrow-right";
import type { Testimonial } from "@/data/testimonials";

type Props = {
  testimonials: Testimonial[];
  className?: string;
};

/**
 * Voices slider, mapped to the Framer source (framer-y5vrV).
 *
 *   LEFT  — image column. A 360x476 outer frame with 26px top padding,
 *           containing a 340x423 rounded-xl portrait image. Below the
 *           image: a two-button arrow row (rounded-lg sand border).
 *   RIGHT — flex-1 text column with name / role / ornament / quote /
 *           ornament / tags. Single-paragraph quote.
 *
 * The image and text crossfade independently when the index changes;
 * both columns are sized stably so cycling never causes layout shift.
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
        <div className="relative flex w-full max-w-[360px] flex-col items-center pt-[26px] lg:h-[476px] lg:w-[360px]">
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
                  sizes="(min-width: 1200px) 340px, (min-width: 810px) 320px, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow row — only renders when there's more than one testimonial.
            Source: each button is rounded-lg with a sand border, ~42x15 arrow svg. */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="flex items-center justify-center rounded-lg border border-sand px-6 py-5 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ArrowRight size={16} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="flex items-center justify-center rounded-lg border border-sand px-6 py-5 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ArrowRight size={16} />
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
