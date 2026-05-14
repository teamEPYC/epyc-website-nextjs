"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/ui/project-card";
import { featuredProjects } from "@/data/projects";

/**
 * Scroll-linked horizontal rail (desktop only). Outer 400vh container,
 * inner 100vh sticky pin, a row of ProjectCards that translateX as the
 * user scrolls vertically. Falls back to a static horizontal strip when
 * `prefers-reduced-motion: reduce` is set.
 */
export function FeaturedProjects() {
  const outerRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // The rail width is N cards (780px) + (N-1) gaps (20px) + 60px left gutter.
  // We translate from 0 to -(railWidth - viewportWidth + 60px gutter).
  const N = featuredProjects.length;
  const cardW = 780;
  const gap = 20;
  const leftGutter = 60;
  const railWidth = N * cardW + (N - 1) * gap + leftGutter;
  // 1200px viewport baseline — at render time we just push almost the full rail off-screen.
  const x = useTransform(scrollYProgress, [0, 1], [0, -(railWidth - 1200)]);

  if (reduce) {
    return (
      <section className="hidden bg-beige lg:block">
        <div className="flex flex-col gap-12 px-15 py-12">
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
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative hidden h-[400vh] bg-beige lg:block"
      aria-label="Featured Projects"
    >
      <div className="sticky top-0 flex h-screen flex-col gap-12 overflow-hidden pt-12">
        <div className="px-15">
          <SectionHeading>Featured Projects</SectionHeading>
        </div>
        <motion.div
          ref={railRef}
          style={{ x }}
          className="flex shrink-0 gap-5 pl-15"
        >
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
  );
}
