'use client'

import { useMemo, useState } from 'react'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProjectCard } from '@/components/ui/project-card'
import { Select } from '@/components/ui/form'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { cn } from '@/lib/cn'
import type { NormalisedProject, ProjectIndustry } from '@/lib/projects/normalise'

type IndustryFilter = ProjectIndustry | 'all'

type FilterOption = { value: IndustryFilter; label: string }

// Order mirrors the Framer reference page.
const FILTERS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'ngo', label: 'NGO' },
  { value: 'community-initiative', label: 'Community' },
  { value: 'services', label: 'Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'other', label: 'Other' },
  { value: 'vc', label: 'Venture Capital' },
  { value: 'saas', label: 'SaaS' },
  { value: 'web3', label: 'Web3' },
  { value: 'edtech', label: 'Ed-Tech' },
  { value: 'finance', label: 'Finance' },
]

type ProjectsIndexProps = { projects: NormalisedProject[] }

export function ProjectsIndex({ projects }: ProjectsIndexProps) {
  const [active, setActive] = useState<IndustryFilter>('all')

  const filtered = useMemo(
    () => (active === 'all' ? projects : projects.filter((p) => p.industry === active)),
    [projects, active],
  )

  return (
    <Section tone="beige" className="px-4 py-4 lg:px-4 lg:py-4">
      <div className="relative mx-auto w-full overflow-hidden border-t border-r border-l border-ink lg:px-6  py-11">
        <Container
          width="outer"
          className="flex w-[90%] max-w-outter flex-col items-center gap-12 px-0 sm:px-0 lg:gap-10 lg:px-0"
        >
          <div className="flex flex-col items-center justify-center gap-12 lg:gap-24">
            <div className="flex w-full flex-col items-center gap-6 lg:gap-[30px]">
              <SectionHeading
                as="h1"
                size="display"
                tone="ink"
                className="text-center leading-[1.1em]!"
              >
                All Projects
              </SectionHeading>
              <p className="text-body-lg w-full text-center text-ink">
                We are proud to show the work we have done.
              </p>
            </div>
          </div>

          <DotLineDivider />

          {/* Desktop / tablet: pill row */}
          <div
            role="tablist"
            aria-label="Filter by industry"
            className="hidden w-full flex-wrap  items-center justify-start gap-2 sm:flex"
          >
            {FILTERS.map((f) => {
              const isActive = active === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(f.value)}
                  className={cn(
                    'rounded-[8px] px-3 py-0 cursor-pointer leading-[1.2em] text-body-sm font-normal text-base font-sans transition-colors duration-150',
                    isActive ? 'bg-[#222222] text-white' : 'bg-[#bbbbbb26] text-[#888888]',
                  )}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Mobile: native select */}
          <label className="block w-full sm:hidden">
            <span className="text-[10px] font-semibold font-sans uppercase tracking-wide text-ink/70 mb-1 block">
              Industry
            </span>
            <span className="relative block">
              <Select value={active} onChange={(e) => setActive(e.target.value as IndustryFilter)}>
                {FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-ink"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </label>

          {filtered.length === 0 ? (
            <p className="text-body py-12 text-ink/60">No projects in this category yet.</p>
          ) : (
            <div className="load-fade-up grid w-full grid-cols-1 gap-10 sm:grid-cols-2">
              {filtered.map((p, i) => (
                <ProjectCard
                  key={p.slug}
                  href={p.redirectLink}
                  title={p.title}
                  tags={p.typesDisplay}
                  image={p.image}
                  priority={i === 0}
                />
              ))}
            </div>
          )}
        </Container>
      </div>
    </Section>
  )
}
