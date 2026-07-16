import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'

/**
 * Figma "Second section variation 2" (3787:47228) — beige, 514px copy col
 * (pill + heading top, body pinned to the bottom), 16px gap, 726px square
 * image. No overlay on the image — the gradient layer in Figma sits under it.
 *
 * Columns are `fr` in Figma's 514:726 ratio, which lands pixel-exact at 1440
 * (514 + 16 gap + 726 = 1256) and scales below it. A fixed 726px image left
 * the copy column just 274px at a 1200px viewport — narrower than the
 * heading's own 333px box.
 */
export function AiPractitionerBridge() {
  return (
    <Section tone="beige" className="py-14 sm:py-20 lg:py-[120px]">
      <AiContainer>
        <Reveal className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-[514fr_726fr] lg:gap-4">
          {/* Pill + heading up top, body pinned to the bottom */}
          <div className="flex flex-col gap-8 text-center lg:justify-between lg:gap-0 lg:text-left">
            <div className="flex flex-col items-center gap-10 lg:items-start">
              <Pill tone="ink-on-light">
                Practitioner Bridge
              </Pill>
              {/* Figma (3787:47234) breaks after "don't" and "AI." inside a
                  333px box. We render Rationalist Regular where the design uses
                  Medium, so the lines are narrower and would wrap elsewhere on
                  their own — the breaks are forced at lg only. Below lg the
                  text wraps naturally. */}
              <SectionHeading size="h2" tone="ink" className="max-w-[333px]">
                We don&apos;t{' '}
                <br className="hidden lg:inline" />
                just teach AI.{' '}
                <br className="hidden lg:inline" />
                We build it.
              </SectionHeading>
            </div>
            {/* 20px TT Norms Pro Serif body (Figma 3787:47240) */}
            <p className="mx-auto max-w-[458px] text-body-lg text-ink lg:mx-0">
              EPYC builds AI-powered products for clients, including the Accel Atoms AI Chatbot and
              Rapid Canvas. This workshop runs on the same practices we use to ship AI work under
              paying-client deadlines. Your team learns from people who build this for a living, not
              people who read about it the week before.
            </p>
          </div>

          {/* 726×726 square image, sharp corners (Figma 3787:47236) */}
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src="/images/ai-training/we-build-it.png"
              alt="A practitioner building an AI-powered interface on a laptop"
              fill
              sizes="(max-width: 1200px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </AiContainer>
    </Section>
  )
}
