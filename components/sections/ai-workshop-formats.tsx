import Link from 'next/link'
import { CalendarCheck, ChevronRight, Polaroid, Users } from '@/components/icons'
import { Reveal } from '@/components/ui/reveal'
import { AiContainer } from '@/components/ui/ai-container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { AiBadge } from '@/components/ui/ai-badge'
import { AiTexture } from '@/components/ui/ai-texture'

const formats = [
  {
    icon: <Polaroid />,
    title: 'Exec Briefing',
    body: 'A short session for leadership. Understand what’s possible, decide where to invest. No hands-on build required.',
    bodyWidth: 'max-w-[306px]',
  },
  {
    icon: <Users />,
    title: 'Team Workshop',
    body: 'One to two days, hands-on. Your team leaves with a working AI workflow, not a set of notes.',
    bodyWidth: 'max-w-[279px]',
  },
  {
    icon: <CalendarCheck />,
    title: 'Multi-Week Program',
    body: 'Ongoing coaching as your team rolls AI into real projects after the workshop ends.',
    bodyWidth: 'max-w-[259px]',
  },
] as const

/**
 * Figma "Services" #2 (3787:47241) — ink section, cream pill + heading,
 * 3-up bordered format cards each with an icon badge and a
 * "Request this format" link.
 */
export function AiWorkshopFormats() {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <AiTexture band={1014} />

      {/* 120 top / 85 bottom — grid bottom sits at y=813.7 in the 899px frame */}
      <AiContainer className="py-14 sm:py-20 lg:pt-[120px] lg:pb-[85px]">
        <Reveal className="flex flex-col gap-12 lg:gap-20">
          <div className="flex flex-col items-center gap-10 text-center lg:items-start lg:text-left">
            <Pill tone="cream-on-dark">Who it&apos;s for</Pill>
            {/* Figma (3787:47250) breaks after "fits" inside an 831px box. We
                render Rationalist Regular where the design uses Medium, so the
                line is narrower and would wrap elsewhere on its own — the break
                is forced at lg only. Below lg the text wraps naturally. */}
            <SectionHeading size="h2" tone="cream" className="max-w-[831px]">
              Pick the format that fits{' '}
              <br className="hidden lg:inline" />
              your team.
            </SectionHeading>
          </div>

          {/* 3-up grid — full 1px beige border per cell, as drawn in Figma. */}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {formats.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-20 border border-beige p-10">
                {/* Icon variant — glyph instead of the default numeral */}
                <AiBadge className="text-cream">{f.icon}</AiBadge>
                <div className="flex w-full flex-col items-start gap-10">
                  <div className="flex flex-col gap-6">
                    {/* 24px TT Rationalist */}
                    <h3 className="text-h4-alt text-cream">{f.title}</h3>
                    {/* 16px Norms serif, leading 1.4 */}
                    <p className={`text-body text-cream ${f.bodyWidth}`}>{f.body}</p>
                  </div>
                  {/* 14px serif + 31.7px chevron, 4px gap (Figma 3787:47263) */}
                  <Link
                    href="/contact"
                    className="group flex items-center gap-1 text-cream transition-opacity hover:opacity-80"
                  >
                    <span className="text-h5">Request this format</span>
                    <ChevronRight className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </AiContainer>
    </section>
  )
}
