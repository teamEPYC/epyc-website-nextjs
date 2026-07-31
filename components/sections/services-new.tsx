import { Container } from '@/components/ui/container'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'

const serviceCards = [
  {
    title: 'Strategy',
    body: 'Positioning, site architecture, conversion mapping',
    icon: null,
  },
  {
    title: 'Design',
    body: 'UI/UX, visual direction, design system, pixel-perfect mockups',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-cream">
        <path
          d="M15.5 1.5L18.5 4.5L7 16L3 17L4 13L15.5 1.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M13 4L16 7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Development',
    body: 'Responsive build, animations & interactions, CMS, integrations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-cream">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M14.36 5.64l-1.42 1.42M5.64 14.36l-1.42 1.42"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Launch',
    body: 'Performance, SEO foundations, analytics, go-live QA',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-cream">
        <path
          d="M3 8.5L10 2L17 8.5V17H13V12H7V17H3V8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function ServicesNew() {
  return (
    <section className="relative w-full overflow-hidden bg-ink py-[60px] lg:py-[100px]">
      {/* Smoke texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage: "url('/images/site/4svPWouJqvqnznpkeku35FoPOY.webp')",
          backgroundSize: 'cover',
        }}
      />

      <Container width="content" className="relative z-10 flex flex-col gap-12 lg:gap-20">
        {/* Header */}
        <Reveal className="flex flex-col gap-6">
          <Pill tone="cream-on-dark">What we do</Pill>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <h2 className="text-h1 text-cream max-w-[540px]">
              One studio.
              <br />
              Blank page to launch.
            </h2>
            <p className="text-body text-cream/70 lg:max-w-[380px] lg:pt-3">
              EPYC is a website design &amp; development studio. Strategy, design, build, and ship:
              under one roof. One partner, not three vendors. We choose the right platform per
              project, so you get a site that&apos;s fast, scalable, and built to convert.
            </p>
          </div>
        </Reveal>

        {/* Service cards */}
        <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCards.map((card) => (
            <div
              key={card.title}
              className="relative flex h-[320px] flex-col justify-between overflow-hidden rounded-3xl border border-sand/20 bg-beige p-6 lg:h-[370px]"
            >
              {/* Inner border */}
              <div className="pointer-events-none absolute inset-1 rounded-[20px] border border-sand/40" />

              {/* Icon */}
              <div className="relative z-10">
                {card.icon ? (
                  <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[70px] bg-crimson">
                    {card.icon}
                  </div>
                ) : (
                  <div className="h-[54px] w-[54px] rounded-[70px] border-2 border-dashed border-sand/60" />
                )}
              </div>

              {/* Text */}
              <div className="relative z-10 flex flex-col gap-4">
                <h3 className="text-h3 text-ink">{card.title}</h3>
                <p className="text-body text-ink/70">{card.body}</p>
              </div>
            </div>
          ))}
        </Reveal>

        {/* Footer tagline */}
        <Reveal>
          <div className="border-t border-cream/15 pt-8">
            <p className="text-body-lg text-cream/60">
              From marketing sites and product launches to complex interactive experiences.
              Domain-agnostic, any industry.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
