import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
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

const CHECK_ICON = '/images/site/HLCaAHqdvVRPiL21dJddT8CpdJM.svg'
const BUTTERFLY = '/images/site/ytaCR7YksH4wtdWD4UKUk1bf0Y.png'

export function ContactHero() {
  return (
    <section className="w-full bg-beige p-4 text-ink">
      <div
        id="form"
        className="flex flex-col items-center gap-16 border-t border-r border-l border-ink px-4 lg:px-6 py-10 lg:gap-24"
      >
        <SiteNav className="self-stretch -mx-4 -mt-10 lg:-mx-6" />
        <h1 className="tablet:hidden text-center text-display text-ink">
          Start your <br />
          EPYC Journey
        </h1>

        <div className="flex w-full  lg:w-[90%]  max-w-outer flex-col-reverse items-start justify-between lg:gap-12 tablet:flex-row">
          {/* Left column */}

          <div className="hidden tablet:flex w-full  flex-col gap-12 lg:h-[649px] lg:w-[40%] justify-between">
            {/* Heading */}
            <div className="relative flex flex-col gap-[30px]">
              <h1 className="hidden tablet:block text-display text-ink">
                Start your <br />
                EPYC Journey
              </h1>
              <Image
                src={BUTTERFLY}
                alt=""
                aria-hidden="true"
                width={115}
                height={115}
                className="pointer-events-none absolute top-[42%] left-[296px] hidden h-auto w-[115px] -translate-y-1/2 lg:block"
              />
            </div>

            {/* Features */}
            <div className="flex flex-col gap-6">
              <p className="text-body-lg text-ink">Schedule a call, let&apos;s discuss:</p>
              <ul className="flex flex-col gap-7">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Image
                      src={CHECK_ICON}
                      alt=""
                      aria-hidden="true"
                      width={25}
                      height={25}
                      className="mt-1 shrink-0"
                    />
                    <span className="text-base leading-relaxed text-ink">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div className="flex flex-col gap-6">
              <p className="text-body-sm uppercase tracking-wide text-ink/80">/OUR SOCIALS</p>
              <ul className="flex flex-row gap-5">
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm uppercase text-ink underline underline-offset-4 hover:text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column — form + caption */}
          <div className="flex w-full justify-start  flex-col items-center gap-15 lg:w-auto">
            <ContactForm />
            <p className="text-body-lg text-ink text-center">
              We only work with 3 new customers at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
