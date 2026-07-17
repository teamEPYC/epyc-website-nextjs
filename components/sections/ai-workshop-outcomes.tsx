import { Reveal } from '@/components/ui/reveal'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { Disc } from '@/components/ui/disc'
import Image from 'next/image'

const outcomes = [
  { title: 'Foundations', body: 'How the tools actually work, not just what they’re called.' },
  { title: 'Hands-on building', body: 'Build a real AI-powered workflow, live, in the room.' },
  { title: 'Nocode and automation', body: 'Wire what you built into tools your team already uses.' },
  { title: 'Ship something real', body: 'Walk out with a working prototype. Not a certificate.' },
] as const

/**
 * Figma "Services" (3787:47193) — ink section with noise + smoke texture
 * layers, cream pill + heading, 4-up bordered grid.
 */
export function AiWorkshopOutcomes() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* Full-bleed background texture. `z-0` keeps it above the section's
          `bg-ink` fill but below the content — same treatment as <FAQs> and
          <CTAFooter>. */}
      <Image
        src="/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="z-0 object-cover"
      />

      <Container width="wide" className="relative z-10 py-[30px] lg:py-12">
        <Reveal className="flex flex-col gap-12 lg:gap-20">
          <div className="flex flex-col items-center gap-10 text-center lg:items-start lg:text-left">
            {/* Gold pill (Figma 3787:47199) */}
            <Pill tone="cream-on-dark">The Workshop</Pill>
            {/* Figma (3787:47202) wraps to 2 lines in an 831px box:
                  / One workshop. Four things your
                  team leaves knowing how to do. /
                Forced at lg only — see the Medium/Regular
                substitution that moves the natural wrap. */}
            <SectionHeading size="h2" tone="cream" className="max-w-[831px]">
              One workshop. Four things your{' '}
              <br className="hidden lg:inline" />
              team leaves knowing how to do.
            </SectionHeading>
          </div>

          {/* 4-up grid — every cell carries its own full 1px beige border,
              exactly as drawn in Figma (adjacent edges double up). */}
          {/* Cell gap/padding step down the DESIGN.md rhythm (30/50/80, 24/32/40)
              — matches <AiWorkshopFormats>; the Figma 80/40 is a desktop
              measurement. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((o, i) => (
              <div
                key={o.title}
                className="flex flex-col items-start gap-[30px] border border-beige p-6 sm:gap-[50px] sm:p-8 lg:gap-20 lg:p-10"
              >
                <Disc>{String(i + 1).padStart(2, '0')}</Disc>
                <div className="flex flex-col gap-6 lg:max-w-[228px]">
                  {/* 24px TT Rationalist, bottom-aligned in a 2-line box so
                      one-line titles ("Foundations") sit on the baseline of
                      the two-liners (Figma 3787:47208). */}
                  <h3 className="flex items-end text-h4-alt text-cream lg:min-h-[58px]">{o.title}</h3>
                  {/* 16px Norms serif, leading 1.4 */}
                  <p className="text-body text-cream">{o.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
