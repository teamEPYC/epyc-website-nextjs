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
 * Two-column slider — fixed-size image + arrow controls on the left
 * (wrapped in a faint rounded "frame"); flexible text content on the right.
 * Both columns are sized stably so flipping between testimonials never
 * causes layout shift. Crossfade is achieved with absolutely-positioned
 * motion children and AnimatePresence.
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
        "grid w-full items-start gap-8 lg:grid-cols-[360px_1fr] lg:gap-12",
        className,
      )}
    >
      {/* LEFT COLUMN — image card + arrow controls inside a soft frame.
          Fixed width on desktop so the card never resizes. */}
      <div className="flex w-full max-w-[360px] flex-col gap-4 rounded-[28px] border border-sand/40 p-3">
        {/* Image area — fixed aspect-square; children are absolutely
            positioned so swapping testimonials never reflows the parent. */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream/10">
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

        {/* Arrow controls — pill-shaped, rectangular, sit below the image */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="flex h-12 w-20 items-center justify-center rounded-pill border border-cream/50 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ArrowRight size={22} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="flex h-12 w-20 items-center justify-center rounded-pill border border-cream/50 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
            >
              <ArrowRight size={22} />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN — text content. min-h sized to the tallest known
          testimonial so swapping doesn't change the section height. */}
      <div className="relative min-h-[420px] lg:min-h-[480px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={current.id}
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-h2 text-cream">{current.name}</h3>
              <p className="text-body text-cream/70">{current.role}</p>
            </div>

            <OrnamentDivider className="text-sand/50" />

            <div className="flex flex-col gap-4 text-body text-cream/90">
              {current.quote.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <OrnamentDivider className="text-sand/50" />

            {current.tags && current.tags.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-body text-cream/80">
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
