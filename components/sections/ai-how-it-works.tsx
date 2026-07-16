import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiBadge } from '@/components/ui/ai-badge'

const steps = [
  {
    title: 'Scope',
    body: 'Tell us your team, your goals, your timeline.',
    bodyWidth: 'max-w-[211px]',
  },
  {
    title: 'Customize the agenda',
    body: 'We build the workshop around your team’s actual work, not a generic curriculum.',
    bodyWidth: 'max-w-[272px]',
  },
  {
    title: 'Run the workshop',
    body: 'One to two days, hands-on, onsite or remote.',
    bodyWidth: 'max-w-[263px]',
  },
  {
    title: 'Follow-up',
    body: 'We check in after to help the work stick.',
    bodyWidth: 'max-w-[302px]',
  },
] as const

/**
 * Figma "How it works" (3787:47650) — beige, smoke wash: pill + 620px heading
 * on the left (the heading block sits at x=72, 20px outside the 92px grid,
 * per design), 408px numbered-steps timeline on the right with a crimson
 * connector line through the badges.
 */
export function AiHowItWorks() {
  return (
    <Section tone="beige" className="relative isolate overflow-hidden py-14 sm:py-20 lg:pt-[120px] lg:pb-[128px]">
      {/* Faint smoke wash — flattened export of Figma layer 3787:47651. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/ai-training/smoke-beige-hiw.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <AiContainer>
        <Reveal className="flex flex-col gap-12 lg:flex-row lg:gap-0">
          {/* Pill + heading (Figma 3787:47679 — x=72, hence the -20px pull).
              Centred while stacked, left-aligned once the two columns split. */}
          <div className="flex w-full max-w-[620px] flex-col items-center gap-10 text-center lg:items-start lg:-ml-5 lg:text-left">
            <Pill tone="ink-on-light">How it works</Pill>
            {/* Figma (3787:47683) wraps to 3 lines in a 620px box:
                  / A workshop shaped
                  around your team, not a
                  fixed curriculum. /
                Forced at lg only — see the Medium/Regular
                substitution that moves the natural wrap. */}
            <SectionHeading size="h2" tone="ink">
              A workshop shaped{' '}
              <br className="hidden lg:inline" />
              around your team, not a{' '}
              <br className="hidden lg:inline" />
              fixed curriculum.
            </SectionHeading>
          </div>

          {/* Steps timeline (Figma 3787:47652 — 408px col, 79px below the
              heading top, 80px row gap, crimson line through badge centres) */}
          <div className="relative flex w-full max-w-[408px] flex-col gap-20 lg:ml-auto lg:mt-[79px]">
            <div
              aria-hidden="true"
              className="absolute left-[27px] top-[73px] hidden h-[477px] w-px bg-crimson lg:block"
            />
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-center gap-6 lg:gap-[52px]">
                {/* `relative` lifts the badge above the crimson connector line */}
                <AiBadge className="relative">{String(i + 1).padStart(2, '0')}</AiBadge>
                {/* min-w-0 so the copy can shrink below its 302px design width
                    instead of pushing the row past a narrow viewport. */}
                <div className="flex w-full min-w-0 flex-col gap-5 lg:w-[302px]">
                  {/* 24px TT Rationalist title */}
                  <h3 className="text-h4-alt text-ink">{s.title}</h3>
                  {/* 16px Norms serif body */}
                  <p className={`text-body text-ink ${s.bodyWidth}`}>
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </AiContainer>
    </Section>
  )
}
