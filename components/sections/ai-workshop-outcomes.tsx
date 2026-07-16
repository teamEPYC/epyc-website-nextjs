import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiBadge } from '@/components/ui/ai-badge'
import { AiTexture } from '@/components/ui/ai-texture'

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
      <AiTexture band={1014} />

      {/* 120 top / 150 bottom — grid bottom sits at y=749 in the 899px frame */}
      <AiContainer className="py-14 sm:py-20 lg:pt-[120px] lg:pb-[150px]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((o, i) => (
              <div
                key={o.title}
                className="flex flex-col items-start gap-20 border border-beige p-10"
              >
                <AiBadge>{String(i + 1).padStart(2, '0')}</AiBadge>
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
      </AiContainer>
    </section>
  )
}
