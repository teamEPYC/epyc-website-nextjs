import Image from 'next/image'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { AiTexture } from '@/components/ui/ai-texture'
import { OrnamentDivider } from '@/components/ui/ornament-divider'

const mentors = [
  {
    name: 'Keshav',
    role: 'Co-founder',
    image: { src: '/images/ai-training/mentor-keshav.png', alt: 'Keshav' },
    quote: '“Guides the hands-on build and helps unblock questions in real time.”',
  },
  {
    name: 'Mayank',
    role: 'Co-founder',
    image: { src: '/images/ai-training/mentor-mayank.png', alt: 'Mayank' },
    quote: '“Keeps the workshop tied to the right problem and the right outcome.”',
  },
] as const

/**
 * Figma "Meet our mentors" (3787:48384) — charcoal section (#2b2b2b, from
 * Figma; darker than any palette token), cream text. Heading col + mentor list
 * split by a knot divider.
 *
 * The columns are `fr` in Figma's 721:553 ratio rather than fixed px: 721+553
 * is 1274, which is wider than the 1256 content column at 1440 and far wider
 * than the ~1016 available at 1200 — fixed widths pushed the mentor column off
 * to the right edge on anything narrower than a large desktop.
 */
export function AiMentors() {
  return (
    <section className="relative isolate overflow-hidden bg-grey-primary">
      <AiTexture />

      {/* 120 top / 90 bottom — mentor col ends at y=566 in the 656px frame */}
      <AiContainer className="py-14 sm:py-20 lg:pt-[120px] lg:pb-[90px]">
        <Reveal className="grid grid-cols-1 gap-12 lg:grid-cols-[721fr_553fr] lg:gap-0">
          {/* Figma (3787:48397) sets two lines:
                / Meet our
                mentors. /
              Explicit break, matching TrainedTeams — Figma draws this at TT
              Rationalist Medium (500) and we load only Regular (400), so the
              line runs narrower and "mentors." would otherwise stay on line 1.
              Desktop-only so the full-width mobile heading reflows naturally. */}
          <SectionHeading size="h2" tone="cream" className="max-w-[487px] self-center text-center lg:self-start lg:text-left">
            Meet our <br className="hidden lg:inline" />
            mentors.
          </SectionHeading>

          {/* Mentor list (Figma 3787:48398) */}
          <div className="flex flex-col gap-10 text-cream">
            {mentors.map((m, i) => (
              <div key={m.name} className="contents">
                {/* Divider between mentors — knot on the right, so the shared
                    left-knot ornament is mirrored (Figma 3787:48406) */}
                {i > 0 && <OrnamentDivider className="-scale-x-100 text-cream" />}
                <div className="flex flex-col gap-8 lg:gap-[41px]">
                  <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                    {/* 80px avatar, 1px cream ring */}
                    <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-cream">
                      <Image src={m.image.src} alt={m.image.alt} fill sizes="80px" className="object-cover" />
                    </span>
                    <span className="flex flex-col gap-2">
                      {/* Figma 20px Rationalist Light → text-h4-alt, the
                          Rationalist card-title token (14/16/24, lh 1.2) */}
                      <span className="text-h4-alt">{m.name}</span>
                      <span className="text-body">{m.role}</span>
                    </span>
                  </div>
                  {/* 20px serif quote */}
                  <p className="max-w-[497px] text-center text-body-lg sm:text-left">
                    {m.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </AiContainer>
    </section>
  )
}
