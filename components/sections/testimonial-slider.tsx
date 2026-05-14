'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { Pill } from '@/components/ui/pill'
import { OrnamentDivider } from '@/components/ui/ornament-divider'
import type { Testimonial } from '@/data/testimonials'

type Props = {
  testimonials: Testimonial[]
  className?: string
}

/**
 * Voices slider — animation policy:
 *
 * - Photo: subtle 200ms crossfade between slides (AnimatePresence on the
 *   <motion.div> wrapping next/image, sync mode so old and new are both
 *   briefly visible).
 * - Name / role / quote / "What X loved" label: instant swap.
 * - Ornament dividers: rendered as <motion.div layout>. They stay mounted
 *   across slide changes; when surrounding text changes height (because
 *   role/quote length differs), motion detects their new layout position
 *   and tweens them there instead of cutting.
 * - Pills: keyed by tag content. Shared tags between slides persist and
 *   transition position via `layout`; non-matching pills exit/enter via
 *   AnimatePresence in popLayout mode (siblings reflow without waiting
 *   for exit completion).
 *
 * useReducedMotion zeroes durations on every transition above.
 */
export function TestimonialSlider({ testimonials, className }: Props) {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const total = testimonials.length
  const current = testimonials[index]

  function go(delta: number) {
    setIndex((i) => (i + delta + total) % total)
  }

  // Centralized durations so reduced motion is one knob.
  const dImage = reduce ? 0 : 0.2
  const dLayout = reduce ? 0 : 0.4
  const dPill = reduce ? 0 : 0.3

  return (
    <div
      className={cn(
        // items-center on lg so the text column stays vertically centered against
        // the image card. Content growth/shrinkage extends symmetrically up and
        // down from the slider's center, not only downward.
        'flex w-full flex-col items-start gap-8 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-[30px] lg:gap-y-[50px]',
        className,
      )}
    >
      {/* LEFT — image card + arrows */}
      <div className="flex w-full flex-col items-center gap-6 lg:w-auto">
        {/* Photo with ornamental SVG frame. */}
        <div className="relative h-[470px] w-[360px]">
          <img
            src="https://framerusercontent.com/images/UDA17654NsGwNB4PAZVy4qrxgmc.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
          />
          <div className="absolute inset-x-[10px] bottom-[10px] top-[34px] overflow-hidden rounded-sm bg-cream/10">
            <AnimatePresence initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dImage, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={current.image.src}
                  alt={current.image.alt}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
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

      {/* RIGHT — text column. Text content swaps instantly; ornament dividers
          and pills animate their layout/transform between slides. */}
      <div className="relative flex w-full flex-1 flex-col gap-[30px]">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-h2 text-cream lg:!text-[56px] lg:!leading-[1.1]">
            {current.name}
          </h2>
          <p className="text-body text-cream">{current.role}</p>
        </div>

        {/* Top ornament — re-positions smoothly when role/quote heights change */}
        <motion.div layout transition={{ duration: dLayout, ease: 'easeInOut' }}>
          <OrnamentDivider className="text-sand/50" />
        </motion.div>

        <p className="text-body text-cream">{current.quote.join(' ')}</p>

        {/* Bottom ornament */}
        <motion.div layout transition={{ duration: dLayout, ease: 'easeInOut' }}>
          <OrnamentDivider className="rotate-180 text-sand/50" />
        </motion.div>

        {current.tags && current.tags.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-body text-cream">
              What {current.name.split(' ')[0]} loved about us
            </p>
            <div className="flex flex-wrap gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {current.tags.map((tag) => (
                  <motion.div
                    key={tag}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: dPill, ease: 'easeOut' }}
                  >
                    <Pill tone="cream-on-dark">{tag}</Pill>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Thin horizontal arrow ~42×15, matching the source's WKTkLtAbJiZyKGjLoki6qOZYOY.svg. */
function ThinArrow({ direction }: { direction: 'left' | 'right' }) {
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
      style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M1 7.5h39" />
      <path d="M33 1.5l6.5 6-6.5 6" />
    </svg>
  )
}
