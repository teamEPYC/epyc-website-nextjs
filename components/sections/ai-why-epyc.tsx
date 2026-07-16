import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiStats } from '@/components/ui/ai-stats'

const stats = [
  { value: '12,000+', label: 'People trained' },
  { value: '3', label: 'Partner institutions' },
  { value: '1–2', label: 'Days per workshop' },
] as const

/**
 * Figma "Second section variation 6" (3787:47297) — beige "Why EPYC" section:
 * pill, then a 514px heading col + 122px gap + copy col with a stats row.
 */
export function AiWhyEpyc() {
  return (
    <Section tone="beige" className="relative isolate overflow-hidden py-14 sm:py-20 lg:py-[120px]">
      {/* Faint smoke wash — flattened export of Figma layer 3787:47298
          (already clipped to the 1440×653 section). Decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/ai-training/smoke-beige.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <AiContainer>
        <Reveal className="flex flex-col items-center gap-10 text-center lg:items-start lg:text-left">
          <Pill tone="ink-on-light">Why EPYC</Pill>

          {/* 514px heading col + 122px gap + flexible copy col (Figma 3787:47304) */}
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[514px_minmax(0,1fr)] lg:gap-[122px]">
            {/* mx-auto centres the 333px box itself while stacked — text-center
                alone only centres the text inside a box still pinned left. */}
            {/* Figma (3787:47307) wraps to 2 lines in a 333px box:
                  / Why teams
                  bring us in. /
                Forced at lg only — see the Medium/Regular
                substitution that moves the natural wrap. */}
            <SectionHeading size="h2" tone="ink" className="mx-auto max-w-[333px] lg:mx-0">
              Why teams{' '}
              <br className="hidden lg:inline" />
              bring us in.
            </SectionHeading>

            <div className="flex flex-col items-center gap-12 lg:items-start lg:gap-20 lg:pt-[10px]">
              {/* 20px TT Norms Pro Serif body (Figma 3787:47309) */}
              <p className="max-w-[590px] text-body-lg text-ink">
                12,000+ people trained across GrowthSchool, Masters&apos; Union and IIM cohorts.
                Every workshop is run by practitioners who ship AI products for clients, not
                trainers reading from a fixed curriculum. And because we teach nocode alongside AI,
                your team leaves able to build, not just prompt.
              </p>

              <AiStats items={stats} />
            </div>
          </div>
        </Reveal>
      </AiContainer>
    </Section>
  )
}
