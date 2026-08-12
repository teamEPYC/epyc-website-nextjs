import type { Metadata } from 'next'
import type { SVGProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
import { FAQs } from '@/components/sections/faqs'
import { ProblemAccordion } from '@/components/sections/problem-accordion'
import { HowWeWorkSteps } from '@/components/sections/how-we-work-steps'
import { PageCTAFooter } from '@/components/sections/page-cta-footer'
import type { FAQ } from '@/data/faqs'
import { cn } from '@/lib/cn'

export const metadata: Metadata = {
  title: { absolute: 'Website Redesign Services | EPYC' },
  description:
    'Website redesign agency for ambitious companies. Rebuild or migrate to a faster, conversion-focused site, 10X faster. Trusted by Polygon, Accel, Antler.',
  alternates: { canonical: '/website-redesign' },
  openGraph: {
    title: 'Website Redesign Services | EPYC',
    type: 'website',
    siteName: 'EPYC',
  },
}

const FAQ_ITEMS: FAQ[] = [
  {
    question: 'How long does a website redesign take?',
    answer:
      "Most redesigns ship in weeks, not the months a traditional agency quotes. The exact timeline depends on page count, content readiness, and integrations. We give you a firm scope after the audit.",
  },
  {
    question: 'Will I lose my Google rankings when the new site launches?',
    answer:
      'Not when it’s handled properly. We preserve and redirect URLs, carry over metadata and schema, and QA the crawl before and after launch so your search equity moves with you.',
  },
  {
    question: 'Can you move us off WordPress?',
    answer:
      'Yes. We migrate to Webflow, Framer, or custom code, whichever fits how your team wants to work after launch. The platform follows the outcome, not the other way around.',
  },
  {
    question: 'Do we have to rebuild everything?',
    answer:
      "No. If the smarter move is to iterate on what you have, we'll tell you in the first call rather than sell you a redesign you don't need.",
  },
  {
    question: 'What does a redesign cost?',
    answer:
      'Projects typically run $10K to $25K depending on scope. The audit tells us exactly where yours lands before you commit.',
  },
]

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Website Redesign',
      provider: { '@type': 'Organization', name: 'EPYC', url: 'https://epyc.in' },
      serviceType: 'Website Redesign',
      description:
        'Website redesign and rebuild services for ambitious companies that need a faster, conversion-focused website without losing search equity.',
      areaServed: 'Worldwide',
      url: 'https://epyc.in/website-redesign',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://epyc.in' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Website Redesign',
          item: 'https://epyc.in/website-redesign',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ],
}

// ── Inline icon glyphs — one-off set for the "What We Do" service cards, not
// promoted to components/icons since they're only used on this page. Style
// matches the /website-design-development set: 20x20 viewbox, 1.5 stroke,
// currentColor. Audit and Migration are new to this page. ──
function AuditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="8.3" cy="8.3" r="5.3" />
      <path d="M17 17l-4.1-4.1" strokeLinecap="round" />
      <path d="M5.8 8.3l1.6 1.6 3.4-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

function RebuildIcon(props: SVGProps<SVGSVGElement>) {
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

function MigrationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="1.8" y="3.5" width="6.2" height="6.2" rx="1.2" />
      <rect x="12" y="10.3" width="6.2" height="6.2" rx="1.2" />
      <path d="M8 6.6h4.6a2 2 0 0 1 2 2v1.2" strokeLinecap="round" />
      <path d="M12.2 7.4l2.4 2.4-2.4 2.4" strokeLinecap="round" strokeLinejoin="round" />
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

// TODO(assets): the 4 stills below are placeholders — they do not exist yet
// and must be sourced/shot before this page ships. Each should depict the
// redesign-specific pain point in its row title, not the website-design-
// development in-house/agency/freelancer set (those stills are wrong here).
// Needed files, all under /public/images/site/:
//   redesign-problem-01-slow-mobile.png    — the current site loading slowly
//                                             and breaking on a mobile screen
//   redesign-problem-02-dev-ticket.png     — a small edit stuck in a dev
//                                             ticket queue / backlog
//   redesign-problem-03-platform-lockin.png — a dated CMS/platform dashboard
//                                             that feels risky to leave
//   redesign-problem-04-lost-deal.png      — a prospect's screen or inbox
//                                             going quiet after visiting the
//                                             site, implying a lost deal
const PROBLEM_ROWS = [
  {
    n: '01',
    title: "It loads slowly, breaks on mobile, and nobody wants to touch the code.",
    image: {
      src: '/images/site/redesign-problem-01-slow-mobile.png',
      alt: 'A website loading slowly and breaking on a mobile screen',
    },
  },
  {
    n: '02',
    title: "Every small edit means a ticket to a developer who's busy with the product.",
    image: {
      src: '/images/site/redesign-problem-02-dev-ticket.png',
      alt: 'A small website edit stuck in a developer ticket queue',
    },
  },
  {
    n: '03',
    title: "It was built on a platform you've outgrown, and migrating feels risky.",
    image: {
      src: '/images/site/redesign-problem-03-platform-lockin.png',
      alt: 'A dated CMS dashboard for a platform the team has outgrown',
    },
  },
  {
    n: '04',
    title: 'It quietly costs you deals, before a prospect ever talks to you.',
    image: {
      src: '/images/site/redesign-problem-04-lost-deal.png',
      alt: 'A prospect going quiet after visiting a dated website',
    },
  },
]

const PROBLEM_CALLOUTS = [
  "Most teams wait too long because a redesign sounds like another months-long, $50K-plus project. It doesn't have to be.",
]

const WHAT_WE_DO_ITEMS = [
  {
    Icon: AuditIcon,
    title: 'Audit',
    body: "What's working, what's costing you, and what to keep.",
  },
  {
    Icon: StrategyIcon,
    title: 'Strategy',
    body: 'Positioning, site architecture, and conversion mapping for the new site.',
  },
  {
    Icon: DesignIcon,
    title: 'Design',
    body: 'Fresh creative direction, a reusable design system, and pixel-perfect screens.',
  },
  {
    Icon: RebuildIcon,
    title: 'Rebuild',
    body: 'Responsive build, interactions, CMS, and integrations on the right platform.',
  },
  {
    Icon: MigrationIcon,
    title: 'Migration',
    body: 'Content, URLs, and SEO equity moved over without the traffic drop.',
  },
  {
    Icon: LaunchIcon,
    title: 'Launch',
    body: 'Performance tuning, analytics, redirects, and go-live QA.',
  },
]

const MIGRATION_CHECKLIST = [
  'Map every existing URL.',
  'Preserve or 301-redirect old URLs.',
  'Carry over metadata and structured data.',
  'QA the crawl before and after go-live.',
]

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Audit and discovery',
    body: 'We review the current site, your goals, and your data, then map the redesign to outcomes, not page count.',
  },
  {
    n: '02',
    title: 'Design',
    body: 'Creative direction and pixel-perfect screens. You see real design early and iterate fast.',
  },
  {
    n: '03',
    title: 'Rebuild and migrate',
    body: 'We build on the platform that fits and migrate your content and SEO carefully alongside it.',
  },
  {
    n: '04',
    title: 'Launch and beyond',
    body: 'We optimize, redirect, QA, and ship. Then we stay a partner for a fast-moving team.',
  },
]

const FOCUS_ITEMS = [
  {
    title: (
      <>
        <span className="text-crimson">Pixel-perfect</span>, every project
      </>
    ),
    body: "It's what clients praise most, backed by a 4.9 / 5.0 rating.",
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
        <span className="text-crimson">Platform-fluent</span>
      </>
    ),
    body: 'Webflow, Framer, WordPress, Bubble, and custom code. We pick the right one and run the migration.',
  },
  {
    title: (
      <>
        <span className="text-crimson">Premium</span> portfolio
      </>
    ),
    body: 'Polygon, Accel, Antler, and upGrad trust us with their web presence.',
  },
  {
    title: (
      <>
        Only <span className="text-crimson">3 new clients</span> a month
      </>
    ),
    body: 'Scarcity by design. You get focus, not a queue.',
  },
]

// Hero trust strip. Uses the tight-cropped wordmarks in
// `/images/site/trust-logos/`, NOT the square tiles in `/images/brands/` —
// the latter are 272x290 with a filled background, sized for the `Brands`
// grid (object-cover at 290x290). Scaled to `h-4` here they render as a
// near-invisible speck. Same set and same dimensions as the
// website-design-development hero so the two service pages match.
const TRUST_LOGOS = [
  { id: 'stoa', src: '/images/site/trust-logos/stoa.png', alt: 'Stoa', width: 46, height: 16 },
  { id: 'cleartrip', src: '/images/site/trust-logos/cleartrip.png', alt: 'Cleartrip', width: 72, height: 16 },
  { id: 'amazon', src: '/images/site/trust-logos/amazon.png', alt: 'Amazon', width: 54, height: 17 },
  { id: 'jupiter', src: '/images/site/trust-logos/jupiter.png', alt: 'Jupiter', width: 54, height: 17 },
  { id: 'nova-benefits', src: '/images/site/trust-logos/nova-benefits.png', alt: 'Nova Benefits', width: 62, height: 17 },
  { id: 'accel', src: '/images/site/trust-logos/accel.png', alt: 'Accel', width: 42, height: 16 },
  { id: 'polygon', src: '/images/site/trust-logos/polygon.svg', alt: 'Polygon', width: 73, height: 16 },
]

export default function WebsiteRedesignPage() {
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
                Website Redesign Services
              </Badge>

              <h1 className="text-display mt-4 text-balance text-center text-cream lg:mt-0">
                Website redesign that matches how far you&apos;ve come.
              </h1>

              <p className="max-w-2xl text-center text-beige" style={{ fontSize: 20 }}>
                Your product moved on. Your website didn&apos;t. We redesign and rebuild it into a
                fast, conversion-focused site that finally looks like the company you&apos;ve
                become. Shipped 10X faster than a traditional agency.
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
                  src="/images/projects/vGpo90ka2h6cKMdKF4OMwjSVM.png"
                  alt="Website EPYC redesigned and rebuilt for GoKwik"
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
                    / Your product moved on. Your website didn&apos;t. /
                  </span>
                </h2>
                <p className="text-body-lg text-[#252525]/70 lg:flex-1">The signs are familiar.</p>
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
                <h2 className="text-h1 max-w-[540px] text-cream">A redesign is not a re-skin.</h2>
                <p className="text-body text-cream/70 lg:max-w-[380px]">
                  We take a tired, dated, or hard-to-maintain site and rebuild it into something
                  premium, fast, and easy to run. We rework the structure, the message, and the
                  build so the new site converts better and ages well. We choose the platform that
                  fits the project, from Webflow, Framer, and WordPress to custom code. The
                  platform follows the outcome.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHAT_WE_DO_ITEMS.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="flex h-[220px] flex-col justify-between rounded-md border border-cream/20 bg-beige p-7 lg:h-[260px]"
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
          </Reveal>
        </Container>
      </Section>

      {/* ── REBUILD OR ITERATE ── */}
      <Section tone="beige">
        <Container width="outer">
          <Reveal className="flex flex-col gap-16 lg:gap-20">
            <div className="flex flex-col gap-6 lg:gap-10">
              <Badge tone="ink-on-light" className="w-fit">
                Rebuild or iterate?
              </Badge>
              <div className="flex flex-col items-start gap-6 lg:max-w-[1256px] lg:flex-row lg:items-end lg:gap-[122px]">
                <h2 className="text-h1 max-w-[487px] text-[#252525] lg:w-[514px] lg:max-w-none lg:shrink-0">
                  <span className="block lg:max-w-[434px]">/ The right project, not the bigger one. /</span>
                </h2>
                <p className="text-body-lg text-[#252525]/70 lg:flex-1">
                  Not every site needs a full redesign. Part of our first conversation is telling
                  you the truth about which you need.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-md border border-ink/15 bg-cream p-8 lg:p-10">
                <h3 className="text-h3 text-ink">Iterate</h3>
                <p className="text-body text-ink/70">
                  When the foundation is sound and the problem is a few pages, a stale message, or
                  a slow section.
                </p>
              </div>
              <div className="flex flex-col gap-4 rounded-md border border-ink/15 bg-cream p-8 lg:p-10">
                <h3 className="text-h3 text-ink">Redesign</h3>
                <p className="text-body text-ink/70">
                  When the platform fights you, the brand has moved on, or fixing one thing keeps
                  breaking another.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-ink/15 pt-8">
              <p className="text-body-lg text-ink/80">
                We take three new clients a month, so we&apos;d rather start the right project
                than the bigger one.
              </p>
              <p className="text-body text-ink/70">
                Starting from scratch instead? See{' '}
                <Link
                  href="/website-design-development"
                  className="text-ink underline underline-offset-4 hover:text-crimson"
                >
                  website design &amp; development
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── MIGRATION WITHOUT THE TRAFFIC DROP ── */}
      <Section tone="ink">
        <Container width="outer">
          <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
            <div className="flex flex-col lg:max-w-[460px]">
              <Badge tone="cream-on-dark" className="w-fit">
                Migration without the traffic drop
              </Badge>
              <h2 className="text-h1 mt-6 text-cream lg:mt-10">
                Move platforms without losing what you&apos;ve earned.
              </h2>
              <p className="mt-6 text-body text-cream/70 lg:mt-12">
                The biggest fear in any redesign is losing search rankings and links on launch
                day. It&apos;s a fair fear, and it&apos;s avoidable.
              </p>
            </div>

            <div className="flex flex-col gap-8 lg:mt-[79px] lg:w-[460px] lg:shrink-0">
              <div className="flex flex-col gap-6">
                {MIGRATION_CHECKLIST.map((item) => (
                  <div key={item} className="flex items-center gap-6">
                    <FourPointStar size={18} className="shrink-0 text-crimson" />
                    <p className="text-body-lg text-cream/90">{item}</p>
                  </div>
                ))}
              </div>
              <p className="border-t border-cream/20 pt-8 text-body text-cream/70">
                Moving off WordPress or onto Framer doesn&apos;t have to cost you the equity you
                spent years building.
              </p>
            </div>
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
          <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
            <div className="flex flex-col lg:max-w-[460px]">
              <Badge tone="ink-on-light" className="w-fit">
                How we work
              </Badge>
              <h2 className="text-h1 mt-6 text-ink lg:mt-10">/ Four steps, no slow agency cycles. /</h2>
              <p className="mt-6 text-body text-ink/70 lg:mt-12">
                Real design early, careful migration, and a launch process built around
                preserving momentum.
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
                Why EPYC
              </Badge>
              <h2 className="text-h1 mt-6 text-[#252525] lg:mt-10">
                / Focus, not
                <br />a queue. /
              </h2>
              <p className="mt-6 text-body text-[#252525]/70 lg:mt-12">
                A redesign is high-stakes work. You need a partner who can rethink the message,
                rebuild the site, and protect launch quality under one roof.
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

      {/* ── FAQ ── */}
      <FAQs items={FAQ_ITEMS} />

      {/* ── FOOTER ── */}
      <PageCTAFooter
        badge="Start your redesign"
        heading="Ready for a site that keeps up with your product?"
        body="We take on three new clients a month, and one of those spots could be yours. Book a call: we'll review your current site and walk you through how we'd redesign it. No pitch deck, no obligation."
        trustLine="75+ companies served · 4.9 / 5.0 · Trusted by Polygon, Accel, Antler"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </>
  )
}
