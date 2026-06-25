import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SiteNav } from '@/components/site-nav'
import { PaperBackground } from '@/components/ui/paper-background'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/ui/reveal'
import { FAQItem } from '@/components/ui/faq-item'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { Voices } from '@/components/sections/voices'
import { Brands } from '@/components/sections/brands'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Star } from '@/components/icons/star'
import { ClutchWordmark } from '@/components/icons/clutch-wordmark'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: { absolute: 'Website Design & Development Agency | EPYC' },
  description:
    'Website design and development agency for ambitious companies. Premium, conversion-focused sites built 10X faster. Trusted by Polygon, Accel, Antler, upGrad.',
  alternates: { canonical: '/website-design-development' },
  openGraph: {
    title: 'Website Design & Development Studio | EPYC',
    type: 'website',
    siteName: 'EPYC',
  },
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Website Design and Development',
      provider: { '@type': 'Organization', name: 'EPYC', url: 'https://epyc.in' },
      serviceType: 'Website Design and Development',
      description:
        'Full-service website design and development for ambitious companies. Strategy, design, build, and launch under one roof.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in/website-design-development',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://epyc.in' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Website Design & Development',
          item: 'https://epyc.in/website-design-development',
        },
      ],
    },
  ],
}

const BUILD_INCLUDES = [
  {
    title: 'Strategy',
    body: 'Positioning, site architecture, and conversion mapping — so every page earns its place.',
  },
  {
    title: 'Design',
    body: 'UI/UX, visual direction, design system, and pixel-perfect mockups that feel inevitable.',
  },
  {
    title: 'Development',
    body: 'Responsive build, animations and interactions, CMS, and third-party integrations.',
  },
  {
    title: 'Launch',
    body: 'Performance optimisation, SEO foundations, analytics wiring, and go-live QA.',
  },
]

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Discovery',
    body: 'We learn your business, audience, and goals — and map the site to outcomes, not page count.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Creative direction and pixel-perfect screens. You see real design early and iterate fast. No slow agency cycles.',
  },
  {
    n: '03',
    title: 'Build',
    body: 'We develop on the platform that fits — delivering the performance and polish clients trust us for.',
  },
  {
    n: '04',
    title: 'Launch & beyond',
    body: 'We optimise, QA, and ship. Then we stay a partner for fast-moving teams.',
  },
]

// Single integrated statements — avoids the label/definition AI pattern.
const WHY_ITEMS = [
  '75+ projects shipped at a 4.9 / 5.0 rating. Pixel-perfect is how we work, not a line item to upsell.',
  'Most builds land in 4–8 weeks. 10X faster than a traditional agency — without cutting craft.',
  'Polygon, Accel, Antler, and upGrad trust us with their web presence. The portfolio backs it.',
  'Three new clients a month, by design. When you’re in, you have our full attention.',
  'Design and build in one studio. No handoffs between shops, no gaps in accountability.',
]

const SERVICE_FAQS = [
  {
    question: 'How long does a website project take?',
    answer:
      'Most builds land in 4–8 weeks from kickoff to launch. Scope affects timeline — a focused marketing site with clear copy and brand assets moves fastest. We\'ll give you a realistic estimate after our discovery call.',
  },
  {
    question: 'What platforms do you build on?',
    answer:
      'We\'re not a single-platform studio. We\'ve built on Webflow, Framer, WordPress, Next.js, and more. Platform choice follows the project requirements — not the other way around.',
  },
  {
    question: 'How much does a typical website build cost?',
    answer:
      'Scope varies, so cost does too. Most projects fall between $15K and $60K. The best way to get a number is to book a call — we\'ll scope it honestly, without a pitch deck.',
  },
  {
    question: 'Do you work with companies outside India?',
    answer:
      'Yes. Our clients are global — we\'ve worked with teams in the US, UK, Singapore, and across Asia. Time zones haven\'t been a blocker.',
  },
  {
    question: 'What happens after we launch?',
    answer:
      'We don\'t disappear after go-live. Most clients keep us on for ongoing updates, campaign pages, and new product launches. We\'re built for ongoing relationships, not one-off projects.',
  },
]

const TRUST_LOGOS = 'Polygon · Accel · Antler · upGrad · GoKwik · Plum HQ'

export default function WebsiteDesignDevelopmentPage() {
  return (
    <>
      {/* ── HERO ── */}
      <PaperBackground gradient="bottom" className="min-h-[67vh] p-4 lg:min-h-[85vh]">
        <div className="min-h-[calc(67vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(85vh-2rem)]">
          <SiteNav className="text-cream" />
          <Container
            width="content"
            className="flex min-h-[calc(67vh-2rem)] flex-col items-center justify-start gap-12 py-12 lg:min-h-[calc(85vh-2rem)] lg:gap-20 lg:py-16"
          >
            <div className="flex w-full max-w-[780px] flex-col items-center gap-6">
              <Badge
                tone="cream-on-dark"
                href={site.social.clutchProfile}
                className="gap-1.5 px-3 py-2 lg:px-4 lg:py-4"
                icon={<ClutchWordmark className="h-3 w-auto text-cream lg:h-4" />}
              >
                <span className="flex items-center gap-1.5 lg:gap-2">
                  <span
                    className="font-semibold text-cream"
                    style={{ lineHeight: 1, fontSize: 16, marginBottom: -2 }}
                  >
                    4.9/5.0
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className="text-cream" />
                    ))}
                  </span>
                </span>
              </Badge>

              <h1 className="text-display mt-4 text-balance text-center text-cream lg:mt-0">
                Great Companies Deserve Great Websites
              </h1>

              <p className="max-w-2xl text-center text-beige" style={{ fontSize: 20 }}>
                We design and build high-performance websites that make ambitious companies look as
                good as they are. Pixel-perfect, conversion-focused, and delivered in 4–8 weeks —
                not the months a traditional agency takes.
              </p>

              <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row lg:w-auto">
                <Button variant="filled" icon="arrow-right" href="/contact" className="w-full sm:w-auto">
                  Talk to Us
                </Button>
                <Button
                  variant="outline"
                  data-on-dark="true"
                  icon="arrow-right"
                  href="/projects"
                  className="w-full sm:w-auto"
                >
                  See Our Work
                </Button>
              </div>

              <p className="text-center text-beige/60" style={{ fontSize: 14 }}>
                {TRUST_LOGOS}
              </p>
            </div>
          </Container>
        </div>
      </PaperBackground>

      {/* ── HERO PROJECT IMAGE — Polygon ── */}
      <div className="relative block h-[400px] w-full lg:sticky lg:top-0 lg:h-screen">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src="/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png"
            alt="Website EPYC designed and built for Polygon"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[14%]"
            style={{
              background: 'linear-gradient(180deg, var(--color-ink) 0%, rgba(24,50,41,0) 100%)',
            }}
          />
        </div>
      </div>

      {/* ── THE PROBLEM ── */}
      <Section tone="ink">
        <Container>
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading tone="cream" as="h2">
              The Problem
            </SectionHeading>
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-24">
              <div className="flex flex-col gap-5 lg:max-w-[480px]">
                <p className="text-body-lg text-cream">
                  Your product is great. Your website doesn&apos;t say so.
                </p>
                <p className="text-body text-cream/70">Most companies hit the same wall:</p>
                <ul className="flex flex-col gap-3">
                  {[
                    'The in-house team is buried in product work',
                    'The agency takes weeks to move a button',
                    'Freelancers ship inconsistent quality, with no one accountable',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-body text-cream/80">
                      <span
                        aria-hidden="true"
                        className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-crimson"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 lg:max-w-[480px]">
                <p className="text-body text-cream/80">
                  A slow, dated website costs you the deal. It undermines fundraising, sales, and
                  hiring before a prospect ever talks to you.
                </p>
                <p className="text-body text-cream/80">
                  A traditional build runs $50K–$150K and up, and takes months. By the time it
                  ships, the market has moved.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── WHAT WE DO ── */}
      <Section tone="beige">
        <Container>
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading as="h2">What We Do</SectionHeading>

            <div className="flex flex-col gap-5 lg:max-w-[680px]">
              <p className="text-body-lg text-ink">
                EPYC is a website design &amp; development studio. We take you from blank page to
                launch: strategy, design, build, and ship. Under one roof. One partner, not three
                vendors.
              </p>
              <p className="text-body text-ink/70">
                We&apos;re not defined by a single tool. We choose the right platform per project —
                whatever delivers the best outcome fastest, so you get a site that&apos;s fast,
                scalable, and built to convert.
              </p>
              <p className="text-body text-ink/70">
                From marketing sites and product launches to complex interactive experiences.
                Domain-agnostic, any industry.
              </p>
              <p className="text-body text-ink/70">
                Already have a site that&apos;s holding you back?{' '}
                <Link
                  href="/website-redesign"
                  className="underline underline-offset-4 transition-colors hover:text-ink"
                >
                  See our website redesign work.
                </Link>
              </p>
            </div>

            {/* Build includes 2×2 grid */}
            <div className="grid grid-cols-1 gap-px bg-sand sm:grid-cols-2">
              {BUILD_INCLUDES.map(({ title, body }) => (
                <div key={title} className="flex flex-col gap-3 bg-beige p-6 lg:p-10">
                  <h3 className="text-h3 text-ink">{title}</h3>
                  <p className="text-body text-ink/70">{body}</p>
                </div>
              ))}
            </div>

            {/* Case study callout */}
            <p className="text-body text-ink/60 border-t border-sand pt-6">
              See a full build end-to-end in the{' '}
              <Link
                href="/case-study/gokwik"
                className="text-ink underline underline-offset-4 transition-colors hover:text-ink/80"
              >
                GoKwik case study →
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── FEATURED PROJECTS ── */}
      <FeaturedProjects />

      {/* ── HOW WE WORK ── */}
      <Section tone="cream">
        <Container>
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading tone="ink" as="h2">
              How We Work
            </SectionHeading>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS_STEPS.map(({ n, title, body }) => (
                <div key={n} className="flex flex-col gap-4 border-t border-ink/15 pt-6">
                  <span className="text-h5 uppercase text-ink/40">{n}</span>
                  <h3 className="text-h3 text-ink">{title}</h3>
                  <p className="text-body text-ink/70">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── WHY EPYC ── */}
      <Section tone="ink">
        <Container>
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading tone="cream" as="h2">
              Why EPYC
            </SectionHeading>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_ITEMS.map((statement, i) => (
                <li key={i} className="flex flex-col gap-3 border-t border-cream/20 pt-6">
                  <p className="text-body text-cream/90">{statement}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Voices />

      {/* ── BRANDS ── */}
      <Brands />

      {/* ── FAQs ── */}
      <section className="relative w-full overflow-hidden bg-ink px-6 py-12">
        <Image
          src="/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
          alt=""
          fill
          sizes="100vw"
          className="z-0 object-cover"
        />
        <Container width="content" className="relative z-10">
          <Reveal className="flex flex-col gap-12">
            <div className="flex justify-center">
              <SectionHeading tone="cream">Questions?</SectionHeading>
            </div>
            <div className="flex flex-col">
              {SERVICE_FAQS.map((f) => (
                <FAQItem key={f.question} question={f.question}>
                  <p>{f.answer}</p>
                </FAQItem>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── FOOTER ── */}
      <CTAFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  )
}
