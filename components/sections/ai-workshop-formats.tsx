import Link from 'next/link'
import { CalendarCheck, ChevronRight, Polaroid, Users } from '@/components/icons'
import { Reveal } from '@/components/ui/reveal'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { Disc } from '@/components/ui/disc'
import Image from 'next/image'

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

          {/* 3-up grid — full 1px beige border per cell, as drawn in Figma.
              Cell gap/padding step down the DESIGN.md rhythm (30/50/80, 24/32/40)
              — the Figma 80/40 is a desktop measurement and left the boxes
              spending most of a small viewport on their own chrome. */}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {formats.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-start gap-[30px] border border-beige p-6 sm:gap-[50px] sm:p-8 lg:gap-20 lg:p-10"
              >
                {/* Icon variant — glyph instead of the default numeral */}
                <Disc className="text-cream">{f.icon}</Disc>
                <div className="flex w-full flex-col items-start gap-6 lg:gap-10">
                  <div className="flex flex-col gap-6">
                    {/* 24px TT Rationalist */}
                    <h3 className="text-h4-alt text-cream">{f.title}</h3>
                    {/* 16px Norms serif, leading 1.4 */}
                    <p className={`text-body text-cream ${f.bodyWidth}`}>{f.body}</p>
                  </div>
                  {/* 14px serif + 31.7px chevron, 4px gap (Figma 3787:47263) */}
                  <Link
                    href="#request-workshop"
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
      </Container>
    </section>
  )
}
