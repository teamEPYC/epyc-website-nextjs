'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProjectCard } from '@/components/ui/project-card'
import { featuredProjects } from '@/data/projects'

/**
 * Featured Projects has three render paths:
 *
 *  - Mobile (< lg): a native overflow-x-auto horizontal strip. One card
 *    fully visible at a typical phone width, the next peeking from the
 *    right. Touch / trackpad swipe scrolls through the list. No
 *    scroll-pinned animation on mobile.
 *
 *  - Desktop, reduced motion: a static horizontal-scroll strip at
 *    desktop scale (780px cards). User can scroll horizontally if they
 *    want to see all cards.
 *
 *  - Desktop, default: a 400vh scroll-pinned rail — vertical scroll
 *    progress drives a horizontal translateX of the card row.
 */
export function FeaturedProjects() {
  const outerRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  // The rail width is N cards (780px) + (N-1) gaps (20px) + 60px left gutter.
  // We translate from 0 to -(railWidth - viewportWidth + 60px gutter).
  const N = featuredProjects.length
  const cardW = 780
  const gap = 20
  const leftGutter = 60
  const railWidth = N * cardW + (N - 1) * gap + leftGutter
  // 1200px viewport baseline — at render time we push almost the full rail off-screen.
  const x = useTransform(scrollYProgress, [0, 1], [0, -(railWidth - 1200)])

  return (
    <>
      <MobileStrip />

      {reduce ? (
        <section className="hidden bg-beige lg:block" aria-label="Featured Projects">
          <div className="flex flex-col gap-20 px-15 py-12">
            <SectionHeading>Featured Projects</SectionHeading>
            <div className="flex gap-5 overflow-x-auto pb-4">
              {featuredProjects.map((p) => (
                <div key={p.id} className="w-[780px] shrink-0">
                  <ProjectCard
                    href={p.href}
                    title={p.name}
                    tags={p.tags}
                    image={p.image}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section
          ref={outerRef}
          className="relative hidden h-[400vh] bg-beige lg:block"
          aria-label="Featured Projects"
        >
          <div className="sticky top-0 flex h-screen flex-col gap-20 overflow-hidden pt-12">
            <div className="px-15">
              <SectionHeading>Featured Projects</SectionHeading>
            </div>
            <motion.div ref={railRef} style={{ x }} className="flex shrink-0 gap-5 pl-15">
              {featuredProjects.map((p) => (
                <div key={p.id} className="w-[780px] shrink-0">
                  <ProjectCard
                    href={p.href}
                    title={p.name}
                    tags={p.tags}
                    image={p.image}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </>
  )
}

/**
 * Mobile-only horizontal scroll strip. Hidden at lg+ where the
 * scroll-pinned desktop variant takes over.
 */
function MobileStrip() {
  return (
    <section className="bg-beige lg:hidden" aria-label="Featured Projects">
      <div className="flex flex-col gap-8 px-4 py-12">
        <SectionHeading>Featured Projects</SectionHeading>
        {/* -mr-4 + pr-4 lets the last card scroll flush against the
            section's right padding edge instead of getting clipped early. */}
        <div className="-mr-4 flex gap-5 overflow-x-auto pb-4 pr-4">
          {featuredProjects.map((p) => (
            <div key={p.id} className="w-[330px] shrink-0">
              <ProjectCard
                href={p.href}
                title={p.name}
                tags={p.tags}
                image={p.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
