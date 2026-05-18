import Link from 'next/link'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { EpycMark } from '@/components/icons/epyc-mark'
import { ContactForm } from './contact-form'
import { site } from '@/data/site'

const FEATURES = [
  'Identifying your biggest challenges, roadblocks, and goals.',
  'Figure out an actionable plan to help you achieve your goals.',
  'Discussing capabilities, scope of work, offerings and budget.',
]

const SOCIALS = [
  { label: '/X', href: site.social.x },
  { label: '/INSTAGRAM', href: site.social.instagram },
  { label: '/LINKEDIN', href: site.social.linkedin },
]

export function ContactHero() {
  return (
    <Section tone="beige" className="px-4 py-4 lg:px-4 lg:py-4" id="form">
      <div className="relative mx-auto w-full overflow-hidden border-t border-r border-l border-ink px-6 py-11">
        <Container
          width="outer"
          className="flex w-[90%] max-w-outter flex-col items-stretch gap-12 px-0 sm:px-0 lg:px-0"
        >
          <Link href="/" aria-label="EPYC home" className="inline-block self-center">
            <EpycMark className="h-auto w-[86px] text-ink" />
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column — pitch, features, socials */}
            <div className="flex flex-col gap-12">
              <h1 className="text-display text-ink">
                Start your <br className="hidden sm:inline" />
                EPYC Journey
              </h1>

              <div className="hidden flex-col gap-5 lg:flex">
                <p className="text-body-lg text-ink">Schedule a call, let&apos;s discuss:</p>
                <ul className="flex flex-col gap-4">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-1 shrink-0 text-crimson" />
                      <span className="text-body text-ink">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden flex-col gap-3 lg:flex">
                <p className="text-body-sm uppercase text-ink/80">/OUR SOCIALS</p>
                <ul className="flex flex-col gap-1.5">
                  {SOCIALS.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-ink/80 underline underline-offset-4 hover:text-ink"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column — form */}
            <div className="flex flex-col gap-6">
              <ContactForm />
              <p className="text-center font-plex-serif text-body italic text-ink">
                We only work with 3 new customers at a time.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </Section>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 8.5 L6.5 12 L13 5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
