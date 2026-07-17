'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/cn'

export type ProcessStep = {
  n: string
  title: string
  body: string
}

/**
 * Scroll-driven timeline: a continuous progress line fills segment-by-segment
 * as the list scrolls through the viewport centre, and each step's circle
 * crossfades from a faded "not yet reached" state to full crimson the moment
 * the fill passes it.
 */
export function HowWeWorkSteps({ steps, className }: { steps: ProcessStep[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  })

  return (
    <div ref={containerRef} className={cn('flex flex-col lg:w-[420px]', className)}>
      {steps.map((step, i) => (
        <Step
          key={step.n}
          step={step}
          index={i}
          total={steps.length}
          scrollYProgress={scrollYProgress}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  )
}

function Step({
  step,
  index,
  total,
  scrollYProgress,
  isLast,
}: {
  step: ProcessStep
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  isLast: boolean
}) {
  const threshold = index / (total - 1)
  const nextThreshold = (index + 1) / (total - 1)

  // Circle crossfades from faded to full crimson right as the fill reaches it.
  const circleOpacity = useTransform(scrollYProgress, [Math.max(threshold - 0.08, 0), threshold], [0, 1])
  // This segment's own fill — 0 until the line reaches it, 1 once it's fully drawn to the next circle.
  const segmentFill = useTransform(scrollYProgress, [threshold, nextThreshold], [0, 1])

  return (
    <div className="relative flex gap-6 pb-10 last:pb-0">
      {!isLast ? (
        <>
          <span
            aria-hidden="true"
            className="absolute left-[19px] top-[40px] h-[calc(100%-24px)] w-px bg-crimson/20"
          />
          <motion.span
            aria-hidden="true"
            className="absolute left-[19px] top-[40px] h-[calc(100%-24px)] w-px origin-top bg-crimson"
            style={{ scaleY: segmentFill }}
          />
        </>
      ) : null}
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <span className="absolute inset-0 rounded-full bg-crimson/25" />
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-crimson"
          style={{ opacity: circleOpacity }}
        />
        <span className="relative text-body-sm font-semibold text-cream">{step.n}</span>
      </span>
      <div className="flex flex-col gap-2 pt-1">
        <h3 className="text-h3 text-ink">{step.title}</h3>
        <p className="text-body text-ink/70">{step.body}</p>
      </div>
    </div>
  )
}
