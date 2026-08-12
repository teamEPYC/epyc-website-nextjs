'use client'

import { useRef, useState } from 'react'
import { useScroll, useMotionValueEvent } from 'motion/react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

export type ProblemRow = {
  n: string
  title: string
  image: { src: string; alt: string }
}

// Row height when collapsed / active — desktop (lg) only. Sized so the
// collapsed state always shows the full title with breathing room, and the
// active state fits the image flush against the bottom edge (no trailing
// padding, per design). Because exactly one row is expanded at a time,
// total block height stays constant, which keeps the three scroll phases
// evenly spaced in practice.
const COLLAPSED_LG = 'lg:h-[180px]'
const EXPANDED_LG = 'lg:h-[520px]'

/**
 * Scroll-driven accordion: the block's traversal through the viewport centre
 * (from its top hitting centre to its bottom hitting centre) is split into
 * `rows.length` equal phases — each exactly 100/rows.length% of that
 * traversal — and whichever phase scroll progress falls into is the one
 * expanded row. Progress-based (not intersection-based), so the phase
 * boundaries land at exact thirds regardless of row height.
 *
 * Below `lg` (tablet and mobile) the accordion is disabled entirely — every
 * row renders at its natural content height (`h-auto`), all active, with no
 * scroll-driven collapsing.
 */
export function ProblemAccordion({ rows }: { rows: ProblemRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const phase = Math.floor(progress * rows.length)
    setActiveIndex(Math.min(rows.length - 1, Math.max(0, phase)))
  })

  return (
    <div ref={containerRef} className="flex flex-col lg:max-w-[1256px]">
      {rows.map((row, i) => {
        const isActive = i === activeIndex
        return (
          <div
            key={row.n}
            className={cn(
              'h-auto overflow-hidden border-t border-ink/15 transition-[height] duration-500 ease-out motion-reduce:transition-none',
              isActive ? EXPANDED_LG : COLLAPSED_LG,
            )}
          >
            <div className="flex flex-col gap-6 pt-8 lg:flex-row lg:items-start lg:gap-4 lg:pt-10">
              <span className="shrink-0 text-h3 text-crimson lg:w-[90px]">{row.n}</span>
              <p className="text-body-lg text-[#252525] lg:w-[514px] lg:shrink-0">{row.title}</p>
              <div className="relative h-[260px] w-full shrink-0 lg:h-[420px] lg:flex-1">
                <Image
                  src={row.image.src}
                  alt={row.image.alt}
                  fill
                  sizes="(min-width: 1200px) 620px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )
      })}
      <div className="border-t border-ink/15" />
    </div>
  )
}
