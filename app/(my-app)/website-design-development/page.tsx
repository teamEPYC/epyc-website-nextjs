import type { Metadata } from 'next'
import type { SVGProps } from 'react'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { PaperBackground } from '@/components/ui/paper-background'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/ui/reveal'
import { Marquee } from '@/components/ui/marquee'
import { FourPointStar } from '@/components/icons/four-point-star'
import { FeaturedProjects } from '@/components/sections/featured-projects'
import { MoreProjects } from '@/components/sections/more-projects'
import { Voices } from '@/components/sections/voices'
import { Brands } from '@/components/sections/brands'
import { ProblemAccordion } from './problem-accordion'
import { HowWeWorkSteps } from './how-we-work-steps'
import { PageCTAFooter } from './page-cta-footer'
import { cn } from '@/lib/cn'

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

// ── Inline icon glyphs — one-off set for the "What We Do" service cards, not
// promoted to components/icons since they're only used on this page. ──
function StrategyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path
        d="M10 2v5M10 13v5M18 10h-5M7 10H2M14.6 5.4l-3.2 3.2M8.6 11.4l-3.2 3.2M14.6 14.6l-3.2-3.2M8.6 8.6 5.4 5.4"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2" />
    </svg>
  )
}

function DesignIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M13.8 3.3 16.7 6.2 6.4 16.5H3.5v-2.9L13.8 3.3Z" strokeLinejoin="round" />
      <path d="M11.7 5.4 14.6 8.3" strokeLinecap="round" />
    </svg>
  )
}

function DevelopmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="10" cy="10" r="3" />
      <path
        d="M10 2.5v2.3M10 15.2v2.3M17.5 10h-2.3M4.8 10H2.5M15.5 4.5l-1.6 1.6M6.1 13.9l-1.6 1.6M15.5 15.5l-1.6-1.6M6.1 6.1 4.5 4.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LaunchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M17.5 2.5 2.8 9.3l5.4 2 2 5.4 7.3-14.2Z" strokeLinejoin="round" />
      <path d="M17.5 2.5 8.2 11.3" strokeLinecap="round" />
    </svg>
  )
}

const PROBLEM_ROWS = [
  {
    n: '01',
    title: 'The in-house team is buried in product work.',
    image: {
      src: '/images/site/problem-01-discovery.png',
      alt: 'Design mockups and a laptop spread across a table',
    },
  },
  {
    n: '02',
    title: 'The agency takes weeks to move a button.',
    image: {
      src: '/images/site/problem-02-agency.png',
      alt: 'A dim, ornate agency workspace',
    },
  },
  {
    n: '03',
    title: 'Freelancers ship inconsistent quality, with no one accountable.',
    image: {
      src: '/images/site/problem-03-freelance.png',
      alt: 'A laptop on a desk against a dark green wall',
    },
  },
]

const PROBLEM_CALLOUTS = [
  'A slow, dated website costs you the deal, undermining fundraising, sales, and hiring before a prospect ever talks to you.',
  'A traditional build runs $50K–$150K and takes months. By the time it ships, the market has moved.',
]

const WHAT_WE_DO_ITEMS = [
  {
    Icon: StrategyIcon,
    title: 'Strategy',
    body: 'Positioning, site architecture, conversion mapping.',
  },
  {
    Icon: DesignIcon,
    title: 'Design',
    body: 'UI/UX, visual direction, design system, pixel-perfect mockups.',
  },
  {
    Icon: DevelopmentIcon,
    title: 'Development',
    body: 'Responsive build, animations & interactions, CMS, integrations.',
  },
  {
    Icon: LaunchIcon,
    title: 'Launch',
    body: 'Performance, SEO foundations, analytics, go-live QA.',
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
    body: 'Pixel-perfect screens, see real design early, iterate fast.',
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

const FOCUS_ITEMS = [
  {
    title: (
      <>
        <span className="text-crimson">Pixel-perfect</span>, every project
      </>
    ),
    body: 'What clients praise most, backed by a 4.9 / 5.0 rating.',
  },
  {
    title: (
      <>
        <span className="text-crimson">10X</span> faster
      </>
    ),
    body: 'Weeks, not months, without cutting quality.',
  },
  {
    title: (
      <>
        <span className="text-crimson">Premium</span> portfolio
      </>
    ),
    body: 'Polygon, Accel, Antler, upGrad trust us with their web presence.',
  },
  {
    title: (
      <>
        Design + build in <span className="text-crimson">one studio</span>
      </>
    ),
    body: 'No handoffs between a design shop and a dev shop.',
  },
]

const TRUST_LOGOS = [
  { id: 'stoa', src: '/images/site/trust-logos/stoa.png', alt: 'Stoa', width: 46, height: 16 },
  { id: 'cleartrip', src: '/images/site/trust-logos/cleartrip.png', alt: 'Cleartrip', width: 72, height: 16 },
  { id: 'amazon', src: '/images/site/trust-logos/amazon.png', alt: 'Amazon', width: 54, height: 17 },
  { id: 'jupiter', src: '/images/site/trust-logos/jupiter.png', alt: 'Jupiter', width: 54, height: 17 },
  { id: 'nova-benefits', src: '/images/site/trust-logos/nova-benefits.png', alt: 'Nova Benefits', width: 62, height: 17 },
  { id: 'accel', src: '/images/site/trust-logos/accel.png', alt: 'Accel', width: 42, height: 16 },
  { id: 'polygon', src: '/images/site/trust-logos/polygon.svg', alt: 'Polygon', width: 73, height: 16 },
]

export default function WebsiteDesignDevelopmentPage() {
  return (
    <>
      {/* ── HERO ── */}
      <PaperBackground gradient="bottom" className="min-h-[75vh] p-4 lg:min-h-[98vh]">
        <div className="min-h-[calc(75vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(98vh-2rem)]">
          <SiteNav className="text-cream" />
          <Container
            width="content"
            className="flex min-h-[calc(75vh-2rem)] flex-col items-center justify-start gap-10 py-12 lg:min-h-[calc(98vh-2rem)] lg:gap-10 lg:py-14"
          >
            <div className="flex w-full max-w-[780px] flex-col items-center gap-6">
              <Badge tone="cream-on-dark" className="w-fit">
                Website Design &amp; Development Studio
              </Badge>

              <h1 className="text-display mt-4 text-balance text-center text-cream lg:mt-0">
                Great companies deserve great websites.
              </h1>

              <p className="max-w-2xl text-center text-beige" style={{ fontSize: 20 }}>
                We design and build high-performance websites that make ambitious companies look as
                good as they are. Pixel-perfect, conversion-focused, and shipped 10X faster than a
                traditional agency.
              </p>

              <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row lg:w-auto">
                <Button variant="filled" icon="arrow-right" href="/contact" className="w-full sm:w-auto">
                  Talk to us
                </Button>
                <Button
                  variant="outline"
                  data-on-dark="true"
                  icon="arrow-right"
                  href="/projects"
                  className="w-full sm:w-auto"
                >
                  See the work
                </Button>
              </div>

            </div>

            <div className="relative flex w-full flex-col items-center px-2 py-2.5 sm:flex-row sm:items-stretch">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cream/40 to-transparent"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cream/40 to-transparent"
              />
              <div className="flex shrink-0 items-center py-2">
                <p className="whitespace-nowrap text-quote text-cream">Trusted by teams at</p>
              </div>
              <div className="hidden w-[100px] shrink-0 items-center justify-center sm:flex">
                <span aria-hidden="true" className="h-5 w-px bg-cream/40" />
              </div>
              <Marquee className="sm:flex-1" gap={0}>
                {TRUST_LOGOS.map((logo) => (
                  <div
                    key={logo.id}
                    className="flex h-[47px] w-[120px] shrink-0 items-center justify-center"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-4 w-auto object-contain"
                    />
                  </div>
                ))}
              </Marquee>
            </div>

            <div className="relative mx-auto w-full max-w-[1045px] overflow-hidden rounded-md border border-cream/20">
              <div className="flex items-center gap-2 bg-white px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ED6A5E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F4BF4F]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#61C554]" />
              </div>
              <div className="relative aspect-[1280/720] w-full">
                <Image
                  src="/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png"
                  alt="Website EPYC designed and built for Polygon"
                  fill
                  priority
                  sizes="(min-width: 1200px) 1045px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Container>
        </div>
      </PaperBackground>

      {/* ── THE PROBLEM ── */}
      <Section tone="beige">
        <Container width="outer">
          <Reveal className="flex flex-col gap-16 lg:gap-20">
            <div className="flex flex-col gap-6 lg:gap-10">
              <Badge tone="ink-on-light" className="w-fit">
                The problem
              </Badge>
              <div className="flex flex-col items-start gap-6 lg:max-w-[1256px] lg:flex-row lg:items-end lg:gap-[122px]">
                <h2 className="text-h1 max-w-[487px] text-[#252525] lg:w-[514px] lg:max-w-none lg:shrink-0">
                  <span className="block lg:max-w-[434px]">
                    / Your product is great. Your website doesn&apos;t say so. /
                  </span>
                </h2>
                <p className="text-body-lg text-[#252525]/70 lg:flex-1">
                  Most companies hit the same wall.
                </p>
              </div>
            </div>

            <ProblemAccordion rows={PROBLEM_ROWS} />

            <div className="flex flex-col gap-8">
              {PROBLEM_CALLOUTS.map((c) => (
                <div key={c} className="flex items-center gap-6">
                  <FourPointStar size={18} className="shrink-0 text-teal-deep" />
                  <p className="text-body-lg text-ink/80">{c}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── WHAT WE DO ── */}
      <Section
        tone="ink"
        style={{
          backgroundImage: `url(${'/images/site/4svPWouJqvqnznpkeku35FoPOY.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container width="outer">
          <Reveal className="flex flex-col gap-16 lg:gap-20">
            <div className="flex flex-col gap-6 lg:gap-10">
              <Badge tone="cream-on-dark" className="w-fit">
                What we do
              </Badge>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
                <h2 className="text-h1 max-w-[540px] text-cream">
                  One studio. Blank page to launch.
                </h2>
                <p className="text-body text-cream/70 lg:max-w-[380px]">
                  EPYC is a website design &amp; development studio. Strategy, design, build, and
                  ship: under one roof. One partner, not three vendors. We choose the right platform
                  per project, so you get a site that&apos;s fast, scalable, and built to convert.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHAT_WE_DO_ITEMS.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex h-[280px] flex-col justify-between rounded-md border border-cream/20 bg-beige p-7 lg:h-[370px]"
                >
                  <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-crimson text-cream">
                    <Icon width={20} height={20} />
                  </span>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-h3 text-ink">{title}</h3>
                    <p className="text-body text-ink/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="border-t border-cream/20 pt-8 text-body-lg text-cream/90">
              From marketing sites and product launches to complex interactive experiences.
              Domain-agnostic, any industry.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ── HOW WE WORK ── */}
      <Section tone="beige" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${'/images/site/how-we-work-smoke.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Container width="outer" className="relative">
          <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
            <div className="flex flex-col lg:max-w-[460px]">
              <Badge tone="ink-on-light" className="w-fit">
                How we work
              </Badge>
              <h2 className="text-h1 mt-6 text-ink lg:mt-10">
                / Four steps, no slow agency cycles. /
              </h2>
              <p className="mt-6 text-body text-ink/70 lg:mt-12">
                Real design early, no slow agency cycles—then a partner who stays.
              </p>
            </div>

            <HowWeWorkSteps steps={PROCESS_STEPS} className="lg:mt-[79px]" />
          </Reveal>
        </Container>
      </Section>

      {/* ── THE WORK ── */}
      <FeaturedProjects />

      {/* ── MORE PROJECTS ── */}
      <MoreProjects />

      {/* ── FOCUS, NOT A QUEUE ── */}
      <Section tone="beige">
        <Container width="outer">
          <Reveal className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
            <div className="flex flex-col lg:max-w-[420px]">
              <Badge tone="ink-on-light" className="w-fit">
                What we do
              </Badge>
              <h2 className="text-h1 mt-6 text-[#252525] lg:mt-10">
                / Focus, not
                <br />
                a queue. /
              </h2>
              <p className="mt-6 text-body text-[#252525]/70 lg:mt-12">
                Design and build in one studio—no handoffs between a design shop and a dev shop.
              </p>
            </div>

            <div className="flex flex-col lg:mt-[79px] lg:w-[620px] lg:shrink-0">
              {FOCUS_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10 lg:py-8',
                    i > 0 && 'border-t border-ink/15',
                  )}
                >
                  <p className="shrink-0 font-display text-[24px] font-light tracking-[-0.72px] text-[#252525] sm:w-[220px]">
                    {item.title}
                  </p>
                  <p className="text-body text-[#252525]/70 sm:max-w-[320px]">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── TESTIMONIALS ── */}
      <Voices />

      {/* ── BRANDS ── */}
      <Brands />

      {/* ── FOOTER ── */}
      <PageCTAFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  )
}
