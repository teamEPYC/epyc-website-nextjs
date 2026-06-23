import type { Metadata } from 'next'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { PaperBackground } from '@/components/ui/paper-background'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/ui/project-card'
import { Testimonial } from '@/components/ui/testimonial'
import { Brands } from '@/components/sections/brands'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Reveal } from '@/components/ui/reveal'
import { testimonials } from '@/data/testimonials'
import { featuredProjects } from '@/data/projects'

export const metadata: Metadata = {
  title: { absolute: 'Website Design & Development Agency | EPYC' },
  description:
    'Website design and development agency for ambitious companies. Premium, conversion-focused sites built 10X faster. Trusted by Polygon, Accel, Antler, upGrad.',
  alternates: { canonical: '/website-design-development' },
  openGraph: {
    title: 'Website Design & Development Studio | EPYC',
    type: 'website',
    siteName: 'EPYC',
    images: [
      {
        url: '/og/default.jpg',
        width: 2400,
        height: 1260,
        alt: 'EPYC — Website Design & Development Studio',
      },
    ],
  },
}

const SHOWCASE_IDS = [
  'polygon',
  'gokwik',
  'upgrad-enterprise',
  'factors-design',
  'seedtoscale',
  'antler-theory-of-next',
]

const showcaseProjects = featuredProjects.filter((p) => SHOWCASE_IDS.includes(p.id))

const leonSternTestimonial = testimonials[0]

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Discovery',
    body: 'We learn your business, audience, and goals. We map the site to outcomes, not page count.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Creative direction and pixel-perfect screens. You see real design early and iterate fast. No slow agency cycles.',
  },
  {
    n: '03',
    title: 'Build',
    body: "We develop on the platform that fits, with the interactions and performance our clients are known for praising.",
  },
  {
    n: '04',
    title: 'Launch & beyond',
    body: 'We optimize, QA, and ship. Then we stay a partner for fast-moving teams.',
  },
]

const DIFFERENTIATORS = [
  {
    title: 'Pixel-perfect, every project.',
    body: "It's what clients praise most, backed by a 4.9 / 5.0 rating.",
  },
  {
    title: '10X faster.',
    body: 'Weeks, not months, without cutting quality.',
  },
  {
    title: 'Premium portfolio.',
    body: 'Polygon, Accel, Antler, and upGrad trust us with their web presence.',
  },
  {
    title: 'Only 3 new clients a month.',
    body: 'Scarcity by design. You get focus, not a queue.',
  },
  {
    title: 'Design + build in one studio.',
    body: 'No handoffs between a design shop and a dev shop.',
  },
]

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Website Design & Development',
  provider: {
    '@type': 'Organization',
    name: 'EPYC',
    url: 'https://epyc.in',
  },
  description:
    'Website design and development agency for ambitious companies. Premium, conversion-focused sites built 10X faster.',
  url: 'https://epyc.in/website-design-development',
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
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
}

export default function WebsiteDesignDevelopmentPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <PaperBackground gradient="bottom" className="min-h-[70vh] p-4 lg:min-h-[90vh] text-cream">
        <div className="min-h-[calc(70vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(90vh-2rem)]">
          <SiteNav />
          <Container
            width="content"
            className="relative flex min-h-[calc(70vh-2rem)] flex-col items-center justify-center gap-10 py-12 lg:min-h-[calc(90vh-2rem)] lg:gap-16"
          >
            <div className="flex w-full max-w-[780px] flex-col items-center gap-5 lg:gap-6">
              <h1 className="text-display text-center text-cream text-balance">
                Great Companies Deserve Great Websites
              </h1>
              <p
                className="text-body-lg max-w-2xl text-center text-beige"
                style={{ fontSize: 20 }}
              >
                We design and build high-performance websites that make ambitious companies look as
                good as they are. Pixel-perfect, conversion-focused, and shipped 10X faster than a
                traditional agency.
              </p>
              <div className="flex w-full items-center justify-center gap-3 lg:w-auto">
                <Button
                  variant="outline"
                  data-on-dark="true"
                  className="w-full"
                  icon="arrow-right"
                  href="/contact"
                >
                  Talk to Us
                </Button>
                <Button variant="filled" className="w-full" icon="arrow-down" href="/projects">
                  See the Work
                </Button>
              </div>
              <p className="text-body-sm mt-2 uppercase tracking-wide text-cream/50">
                Trusted by Polygon · Accel · Antler · upGrad · GoKwik · Plum HQ
              </p>
            </div>
          </Container>
        </div>
      </PaperBackground>

      {/* ── Hero flagship image — Polygon ─────────────────────────────── */}
      <section
        aria-hidden="true"
        className="relative block h-[400px] w-full lg:sticky lg:top-0 lg:h-screen"
      >
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
              background:
                'linear-gradient(180deg, var(--color-ink) 0%, rgba(24, 50, 41, 0) 100%)',
            }}
          />
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────────────── */}
      <Section tone="beige">
        <Container width="content">
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <div className="flex max-w-[680px] flex-col gap-6">
              <SectionHeading as="h2">The Problem</SectionHeading>
              <p className="text-body-lg text-ink/80">
                Your product is great. Your website doesn&apos;t say so.
              </p>
              <p className="text-body text-ink/80">Most companies hit the same wall:</p>
              <ul className="flex flex-col gap-4" role="list">
                {[
                  'The in-house team is buried in product work',
                  'The agency takes weeks to move a button',
                  'Freelancers ship inconsistent quality, with no one accountable',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson"
                    />
                    <span className="text-body text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-body text-ink/80">
                A slow, dated website costs you the deal — undermining fundraising, sales, and
                hiring before a prospect ever talks to you. A traditional build runs $50K–$150K and
                takes months. By the time it ships, the market has moved.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── What We Do ────────────────────────────────────────────────── */}
      <Section tone="cream">
        <Container width="content">
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <div className="flex flex-col gap-6">
              <SectionHeading as="h2">What We Do</SectionHeading>
              <p className="text-body-lg text-ink/80 max-w-[680px]">
                EPYC is a website design &amp; development studio. We take you from blank page to
                launch: strategy, design, build, and ship. Under one roof. One partner, not three
                vendors.
              </p>
              <p className="text-body text-ink/80 max-w-[680px]">
                We&apos;re not defined by a single tool. We choose the right platform per project
                — whatever delivers the best outcome fastest, so you get a site that&apos;s fast,
                scalable, and built to convert, not one bent to fit a builder&apos;s limits.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {[
                {
                  title: 'Strategy',
                  body: 'Positioning, site architecture, conversion mapping.',
                },
                {
                  title: 'Design',
                  body: 'UI/UX, visual direction, design system, pixel-perfect mockups.',
                },
                {
                  title: 'Development',
                  body: 'Responsive build, animations and interactions, CMS, integrations.',
                },
                {
                  title: 'Launch',
                  body: 'Performance optimization, SEO foundations, analytics, go-live QA.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="flex flex-col gap-3 border-t border-ink/10 pt-6"
                >
                  <h3 className="text-h4-alt text-ink">{pillar.title}</h3>
                  <p className="text-body text-ink/70">{pillar.body}</p>
                </div>
              ))}
            </div>

            <p className="text-body text-ink/70 max-w-[680px]">
              From marketing sites and product launches to complex interactive experiences.
              Domain-agnostic, any industry. Already have a site that&apos;s holding you back?{' '}
              <a
                href="/website-redesign"
                className="text-ink underline underline-offset-4 hover:text-ink/70 transition-colors"
              >
                See our website redesign work.
              </a>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── Project Showcase ──────────────────────────────────────────── */}
      <Section tone="beige">
        <Container width="content">
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading as="h2">Featured Projects</SectionHeading>

            {/* Mobile: horizontal scroll strip */}
            <div className="-mr-4 flex gap-5 overflow-x-auto pb-4 pr-4 lg:hidden">
              {showcaseProjects.map((p) => (
                <div key={p.id} className="w-[330px] shrink-0">
                  <ProjectCard
                    href={p.href}
                    title={p.name}
                    tags={p.tags}
                    image={{
                      ...p.image,
                      alt: `${p.name} website designed and built by EPYC`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Desktop: 2-column grid */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
              {showcaseProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  href={p.href}
                  title={p.name}
                  tags={p.tags}
                  image={{
                    ...p.image,
                    alt: `${p.name} website designed and built by EPYC`,
                  }}
                  priority={i === 0}
                />
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── How We Work ───────────────────────────────────────────────── */}
      <Section tone="ink">
        <Container width="content">
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading tone="cream" as="h2">
              How We Work
            </SectionHeading>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {PROCESS_STEPS.map((step) => (
                <div key={step.n} className="flex flex-col gap-4">
                  <span className="text-h2 text-cream/20">{step.n}</span>
                  <h3 className="text-h4-alt text-cream">{step.title}</h3>
                  <p className="text-body text-cream/70">{step.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── Why EPYC ──────────────────────────────────────────────────── */}
      <Section tone="beige">
        <Container width="content">
          <Reveal className="flex flex-col gap-10 lg:gap-16">
            <SectionHeading as="h2">Why EPYC</SectionHeading>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
              {DIFFERENTIATORS.map((d) => (
                <div key={d.title} className="flex flex-col gap-2 border-t border-ink/10 pt-6">
                  <h3 className="text-h4-alt text-ink">{d.title}</h3>
                  <p className="text-body text-ink/70">{d.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── Proof & Testimonial ───────────────────────────────────────── */}
      <div
        style={{
          backgroundImage: `url('/images/site/4svPWouJqvqnznpkeku35FoPOY.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="relative w-full bg-ink overflow-hidden px-6 py-16 lg:py-24"
      >
        <Container width="content" className="flex flex-col gap-12">
          <Reveal>
            <SectionHeading tone="cream" as="h2">
              Proof
            </SectionHeading>
          </Reveal>

          <Reveal>
            <Testimonial
              name={leonSternTestimonial.name}
              role={leonSternTestimonial.role}
              quote={leonSternTestimonial.quote}
              image={leonSternTestimonial.image}
              tags={leonSternTestimonial.tags}
            />
          </Reveal>

          <Reveal>
            <div className="flex flex-col items-center gap-2 border-t border-cream/10 pt-10 text-center">
              <p className="text-body-sm uppercase tracking-wide text-cream/50">By the numbers</p>
              <p className="text-body text-cream/70">
                75+ organizations served&nbsp;&nbsp;·&nbsp;&nbsp;4.9 / 5.0
                rating&nbsp;&nbsp;·&nbsp;&nbsp;3 new clients per month
              </p>
            </div>
          </Reveal>
        </Container>
      </div>

      {/* ── Brands ────────────────────────────────────────────────────── */}
      <Brands />

      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden bg-ink px-6 py-20 lg:py-28"
        style={{
          backgroundImage: `url('/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container width="content">
          <Reveal className="flex flex-col items-center gap-8 text-center">
            <SectionHeading tone="cream" as="h2">
              Ready for a website that matches your product?
            </SectionHeading>
            <p
              className="text-body-lg text-cream/80 max-w-[580px]"
              style={{ fontSize: 18 }}
            >
              We take on three new clients a month, and one of those spots could be yours. Book a
              call: we&apos;ll review your goals and walk you through how we&apos;d approach the
              build. No pitch deck, no obligation.
            </p>
            <div className="flex w-full items-center justify-center gap-3 lg:w-auto">
              <Button variant="filled" icon="arrow-right" href="/contact">
                Talk to Us
              </Button>
              <Button
                variant="outline"
                data-on-dark="true"
                icon="arrow-down"
                href="/projects"
              >
                See the Work
              </Button>
            </div>
            <p className="text-body-sm text-cream/50">
              75+ companies served&nbsp;&nbsp;·&nbsp;&nbsp;4.9 /
              5.0&nbsp;&nbsp;·&nbsp;&nbsp;Trusted by Polygon, Accel, Antler
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <CTAFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  )
}
