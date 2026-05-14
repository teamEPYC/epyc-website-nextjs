'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { Pill } from '@/components/ui/pill'
import { OrnamentDivider } from '@/components/ui/ornament-divider'
import type { Testimonial } from '@/data/testimonials'

type Props = {
  testimonials: Testimonial[]
  className?: string
}

/**
 * Voices slider — target design (per user spec).
 *
 *   LEFT  — portrait photo card with ornamental SVG frame. Below: a pair of
 *           wide-pill arrow buttons (~90×55, rounded-[28px], sand border,
 *           thin horizontal arrow).
 *   RIGHT — name / role / ornament / quote / ornament / "What X loved" / pills.
 *
 * Slide-change animation policy: photo and text content swap INSTANTLY when the
 * slide changes. The only animated elements are the two ornament dividers
 * (a quick scale-x draw-in) and the tag pills (staggered fade-up). Both are
 * keyed on `current.id` so they re-run their entry animation on each change.
 */
export function TestimonialSlider({ testimonials, className }: Props) {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()
  const total = testimonials.length
  const current = testimonials[index]

  function go(delta: number) {
    setIndex((i) => (i + delta + total) % total)
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-start gap-8 lg:flex-row lg:flex-wrap lg:gap-x-[30px] lg:gap-y-[50px]',
        className,
      )}
    >
      {/* LEFT — image card + arrows */}
      <div className="flex w-full flex-col items-center gap-6 lg:w-auto">
        {/* Photo with ornamental SVG frame. The frame fills the outer container;
            the photo sits inside an inset area so the frame's decorative edges
            (top corners + side rails) render around the photograph. */}
        <div className="relative h-[470px] w-[360px]">
          {/* Decorative SVG frame — sized to the outer container */}
          <img
            src="https://framerusercontent.com/images/UDA17654NsGwNB4PAZVy4qrxgmc.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
          />
          {/* Photo — instant swap on slide change (key changes => React remounts
              the <Image>, which gives an immediate atomic change with no fade). */}
          <div className="absolute inset-x-[10px] bottom-[10px] top-[34px] overflow-hidden rounded-sm bg-cream/10">
            <Image
              key={current.id}
              src={current.image.src}
              alt={current.image.alt}
              fill
              sizes="280px"
              className="object-cover"
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

      {/* RIGHT — text column. Text content swaps instantly; only the ornament
          dividers and the tag pills animate. */}
      <div className="relative flex w-full flex-1 flex-col gap-[30px]">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-h2 text-cream lg:!text-[56px] lg:!leading-[1.1]">
            {current.name}
          </h2>
          <p className="text-body text-cream">{current.role}</p>
        </div>

        <AnimatedOrnament id={current.id} reduce={!!reduce} side="top" />

        <p className="text-body text-cream">{current.quote.join(' ')}</p>

        <AnimatedOrnament id={current.id} reduce={!!reduce} side="bottom" />

        {current.tags && current.tags.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-body text-cream">
              What {current.name.split(' ')[0]} loved about us
            </p>
            <div className="flex flex-wrap gap-2.5">
              {current.tags.map((tag, i) => (
                <motion.div
                  key={`${current.id}-${tag}`}
                  initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.28,
                    delay: reduce ? 0 : 0.12 + i * 0.06,
                    ease: 'easeOut',
                  }}
                >
                  <Pill tone="cream-on-dark">{tag}</Pill>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Ornament divider that re-draws (scale-x from 0 → 1) on every slide change.
 * Top variant draws from the left edge; bottom variant draws from the right
 * so the two ends "meet" the surrounding content directions.
 */
function AnimatedOrnament({
  id,
  reduce,
  side,
}: {
  id: string
  reduce: boolean
  side: 'top' | 'bottom'
}) {
  return (
    <motion.div
      key={`${side}-${id}`}
      initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: 'easeOut' }}
      style={{ transformOrigin: side === 'top' ? 'left' : 'right' }}
    >
      <OrnamentDivider
        className={cn('text-sand/50', side === 'bottom' && 'rotate-180')}
      />
    </motion.div>
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
