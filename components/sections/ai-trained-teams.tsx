import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiStats } from '@/components/ui/ai-stats'

const stats = [
  { value: '50+', label: 'AI Workshops' },
  { value: '1000+', label: 'Professionals Trained' },
  { value: '25+', label: 'Companies Represented' },
] as const

const photos = [
  { src: '/images/ai-training/team-photo-1.png', alt: 'A facilitator presenting a moodboard wall to a workshop team' },
  { src: '/images/ai-training/team-photo-2.png', alt: 'A team working through a whiteboard exercise around a table' },
] as const

/* Bare logo SVGs exported from the Figma strip (3787:48105). Sizes are each
   SVG's own viewBox — Figma exports them at `width/height="100%"`, so they
   fill whatever box they're given and MUST be sized explicitly. Per-logo
   sizes (not a uniform height) keep the relative weights true to the design. */
const logos = [
  { src: '/images/ai-training/logos/letsventure.svg', alt: 'Letsventure', width: 92.235, height: 16.3973 },
  { src: '/images/ai-training/logos/healthkart.svg', alt: 'Healthkart', width: 80.1233, height: 19.0992 },
  { src: '/images/ai-training/logos/snaptrude.svg', alt: 'Snaptrude', width: 87.3846, height: 17.9034 },
  { src: '/images/ai-training/logos/xoxoday.svg', alt: 'Xoxoday', width: 75.9308, height: 19.7544 },
  { src: '/images/ai-training/logos/stoa.svg', alt: 'Stoa', width: 63.179, height: 21.2375 },
  { src: '/images/ai-training/logos/amazon.svg', alt: 'Amazon', width: 69.4527, height: 20.9625 },
  { src: '/images/ai-training/logos/jupiter.svg', alt: 'Jupiter', width: 75.9308, height: 23.1094 },
] as const

/**
 * Figma "Second section variation 7" (3787:48078) — beige: pill + heading +
 * stats (same layout as WhyEpyc), a clipped 3-photo strip (604×412 tiles on
 * teal, 16px gaps — the third tile bleeds past the container, per design),
 * and a "companies like" logo strip.
 */
export function AiTrainedTeams() {
  return (
    <Section tone="beige" className="relative isolate overflow-hidden py-14 sm:py-20 lg:py-[120px]">
      {/* Faint smoke wash — flattened export of Figma layer 3787:48079. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/ai-training/smoke-beige-tall.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <AiContainer>
        <Reveal className="flex flex-col gap-12 lg:gap-20">
          {/* Header block — mirrors WhyEpyc (Figma 3787:48082). Centred while
              stacked, left-aligned once the two columns split at lg. */}
          <div className="flex flex-col items-center gap-10 text-center lg:items-start lg:text-left">
            <Pill tone="ink-on-light">
              500+ Professionals Trained
            </Pill>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[514px_minmax(0,1fr)] lg:gap-[122px]">
              {/* Figma (3787:48088) sets these three lines:
                    / Training teams
                    from startups to
                    global companies. /
                  Both breaks are explicit rather than left to natural wrap —
                  Figma draws this at TT Rationalist Medium (500) and we only
                  load Regular (400), so our line runs narrower and "global"
                  would otherwise creep up onto line 2.
                  Desktop-only: below lg the heading is full-width, where
                  forcing breaks would strand short lines. */}
              <SectionHeading size="h2" tone="ink">
                Training teams <br className="hidden lg:inline" />
                from startups to <br className="hidden lg:inline" />
                global companies.
              </SectionHeading>

              <div className="flex flex-col items-center gap-12 lg:items-start lg:gap-20 lg:pt-[10px]">
                <p className="max-w-[561px] text-body-lg text-ink">
                  Professionals from startups and leading companies have joined our workshops.
                  Every session is hands-on, collaborative, and focused on real work. Teams leave
                  with practical AI skills they can apply from day one.
                </p>

                <AiStats items={stats} />
              </div>
            </div>
          </div>

          {/* Photo strip — 604×412 tiles, 16px gaps (1224px across the 1256px
              container at lg). Below lg the tiles keep their 604:412 ratio and
              scale with the column: two-up from sm, single-column on mobile. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {photos.map((p) => (
              <div
                key={p.src}
                className="relative aspect-[604/412] w-full overflow-hidden bg-teal-deep"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 810px) 100vw, 604px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Companies strip (Figma 3787:48101) — individual logo SVGs so they
              stay sharp at any width. */}
          <div className="flex flex-col gap-10">
            <p className="text-center text-body-lg text-ink lg:text-left">
              Professionals from companies like
            </p>
            {/* A grid, not flex-wrap: all seven sit in one row at lg as Figma
                draws them (3787:48106), and wrap into even rows below that.
                Fixed 140px slots overflowed the ~1016px available at 1200 and
                stranded a single logo on its own row.
                The logos export at #252525; Figma greys the whole row down with
                opacity 50% (frame 3787:48105) rather than lightening the fills. */}
            <div className="grid grid-cols-2 items-center gap-x-8 gap-y-6 opacity-50 sm:grid-cols-4 lg:grid-cols-7">
              {logos.map((l) => (
                <div key={l.src} className="flex h-[47px] w-full items-center justify-center">
                  <Image
                    src={l.src}
                    alt={l.alt}
                    width={l.width}
                    height={l.height}
                    style={{ width: l.width, height: l.height }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </AiContainer>
    </Section>
  )
}
