import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/data/site'
import { SiteNav } from '@/components/site-nav'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { CaseStudyShell, CaseStudyViewToggle, HideInTldr, ShowInTldr } from '@/components/ui/case-study-shell'

export const metadata: Metadata = {
  title: 'GoKwik — Case Study',
  description:
    "How EPYC redesigned gokwik.co for India's leading D2C growth platform — 50+ pages, Lottie-first motion, a scalable design system. Traffic and conversions up 50-60% post-launch.",
  alternates: { canonical: '/case-study/gokwik' },
  openGraph: {
    siteName: 'EPYC',
    images: [
      {
        url: '/images/case-studies/gokwik/new-homepage.webp',
        width: 1440,
        height: 900,
        alt: 'GoKwik — new homepage by EPYC',
      },
    ],
  },
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StatItem = { number: string; label: string }
type PhaseItem = { num: string; title: string; body: string }
type InteractionItem = { title: string; caption: string }

// ─── Data ─────────────────────────────────────────────────────────────────────

const tags = [
  'D2C / E-commerce SaaS',
  'Strategy',
  'UX Design',
  'Visual Design',
  'Motion Design',
]

const stats: StatItem[] = [
  { number: '50–60%', label: 'Actual lift in traffic & conversions' },
  { number: '30–40%', label: 'Pre-launch expectation' },
  { number: '50+', label: 'Pages across desktop & mobile' },
]

const phases: PhaseItem[] = [
  {
    num: 'Phase 01',
    title: 'Discovery & Direction',
    body: 'Two structured kick-off sessions. Questionnaire covering business context, brand, audience, and page-level requirements. Two moodboard directions: minimal & clean vs. dynamic & colourful. First wireframes in three weeks.',
  },
  {
    num: 'Phase 02',
    title: 'Design System & Core Pages',
    body: 'One product page template applied across all nine products. Lottie-first for product illustrations. Merchant-outcomes-first IA replacing company-centric feature bullets. Homepage locked first — everything else followed.',
  },
  {
    num: 'Phase 03',
    title: 'Scale & Rollout',
    body: 'Industry pages, SEO pages, webinars, newsletters, battlecards, careers, affiliate — all scaled off the same design system. Three Figma files maintained in parallel: external, internal, dev-ready.',
  },
]

const interactions: InteractionItem[] = [
  {
    title: 'Hero Lottie',
    caption: 'Homepage hero — video + custom animation, the visual anchor for the site.',
  },
  {
    title: 'Integration Loop',
    caption: 'Partner logos looping in orbit, GoKwik logo anchored at centre.',
  },
  {
    title: 'Platform Expand',
    caption: 'Platform section: icons appear progressively after click.',
  },
  {
    title: 'Product Orbits',
    caption: 'Logo orbits and pin interactions — each product distinct within a shared system.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'GoKwik — Case Study',
      description:
        "How EPYC redesigned gokwik.co for India's leading D2C growth platform — 50+ pages, Lottie-first motion, a scalable design system. Traffic and conversions up 50-60% post-launch.",
      url: `${site.url}/case-study/gokwik`,
      datePublished: '2026-06-15',
      author: { '@type': 'Organization', name: site.name, url: site.url },
      publisher: {
        '@type': 'Organization',
        name: site.name,
        url: site.url,
        logo: { '@type': 'ImageObject', url: `${site.url}/icons/epyc-wordmark-large.svg` },
      },
      image: {
        '@type': 'ImageObject',
        url: `${site.url}/images/case-studies/gokwik/new-homepage.webp`,
        width: 1440,
        height: 900,
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${site.url}/projects` },
        { '@type': 'ListItem', position: 3, name: 'GoKwik', item: `${site.url}/case-study/gokwik` },
      ],
    },
  ],
}

export default function GoKwikCaseStudy() {
  return (
    // The entire case study lives on an ink surface — warm dark green, not black.
    <CaseStudyShell>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="min-h-screen bg-ink text-cream">
      {/* Nav: force cream text since SiteNav defaults to ink on non-home routes */}
      <div className="border-b border-cream/10">
        <SiteNav className="text-cream" />
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <Section tone="ink">
        <Container>
          <Reveal>
            {/* Back link + view toggle */}
            <div className="mb-10 flex items-center justify-between">
              <Link
                href="/projects"
                className="inline-block text-h5 uppercase tracking-wider text-cream/40 underline-offset-4 transition-colors hover:text-cream/70"
              >
                ← Projects
              </Link>
              <CaseStudyViewToggle />
            </div>

            {/* Service + industry tags */}
            <div className="mb-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Pill key={tag} tone="cream-on-dark">
                  {tag}
                </Pill>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-display text-cream">
              15,000 brands. 50M+ shoppers.
              <br />
              A website that told none of it.
            </h1>

            {/* Subhead */}
            <p className="mt-8 text-body-lg text-cream/60">
              GoKwik had built India&apos;s leading D2C growth platform. Their website was still
              describing the company they used to be.
            </p>

            {/* Live link */}
            <div className="mt-8">
              <Button variant="outline" href="https://gokwik.co" data-on-dark="true">
                See it live
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── OUTCOME STATS ───────────────────────────────────────────────────── */}
      <Section tone="ink" className="border-t border-cream/10">
        <Container>
          <Reveal>
            {/* Full story: original large stats + quote */}
            <HideInTldr>
              <div className="grid grid-cols-2 gap-px bg-cream/10 lg:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.number} className="bg-ink p-6 sm:p-8">
                    <p className="text-h2 text-cream">{s.number}</p>
                    <p className="mt-2 text-body-lg uppercase text-cream/60">{s.label}</p>
                  </div>
                ))}
              </div>
              <blockquote className="mt-12 border-l-2 border-cream/20 bg-cream/5 px-8 py-8 sm:px-12 sm:py-10">
                <p className="text-h3 font-normal italic text-cream/75">
                  &ldquo;Good stuff, guys. We trust you completely.&rdquo;
                </p>
                <cite className="mt-4 block text-h5 not-italic uppercase tracking-wider text-cream/50">
                  — GoKwik team, during project
                </cite>
              </blockquote>
            </HideInTldr>

            {/* TL;DR: compact single-row stats, no quote */}
            <ShowInTldr>
              <div className="grid grid-cols-3 gap-px bg-cream/10">
                {stats.map((s) => (
                  <div key={s.number} className="bg-ink p-4 sm:p-6">
                    <p className="text-h3 text-cream">{s.number}</p>
                    <p className="mt-1 text-body uppercase text-cream/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </ShowInTldr>
          </Reveal>
        </Container>
      </Section>

      {/* ── BEFORE ──────────────────────────────────────────────────────────── */}
      <Section tone="ink" className="border-t border-cream/10">
        <Container>
          <Reveal>
            <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
              Before
            </SectionHeading>

            <figure className="relative w-full">
              <div className="scrollable-preview h-[600px]">
                <Image
                  src="/images/case-studies/gokwik/old-homepage-aug2025-clean.png"
                  alt="The old GoKwik homepage, Aug 2025 — before the redesign"
                  width={1440}
                  height={900}
                  sizes="(min-width: 1200px) 1150px, (min-width: 810px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="w-full"
                />
              </div>
            </figure>
            <p className="mt-3 text-body text-cream/50">
              The old site, Aug 2025 — last archived version before the redesign.
            </p>

            <HideInTldr>
              <div className="mt-8 space-y-4">
                <p className="text-body-lg text-cream/60">
                  The hero was promoting &ldquo;GoKwik Hall Of Glory&rdquo; — an award programme.
                  Below it: &ldquo;We&apos;ve Got Your Business Covered,&rdquo; a tab of client
                  logos, and a YouTube embed. Then &ldquo;The GoKwik Advantage&rdquo; — four generic
                  bullets. Dark navy, orange accents, a 3D globe.
                </p>
                <p className="text-body-lg text-cream/60">
                  The products weren&apos;t on the homepage at all. Nine solutions, none of them
                  findable.
                </p>
              </div>
            </HideInTldr>
          </Reveal>
        </Container>
      </Section>

      {/* ── CHALLENGE ───────────────────────────────────────────────────────── */}
      <HideInTldr>
        <Section tone="ink" className="border-t border-cream/10">
          <Container>
            <Reveal>
              <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
                Challenge
              </SectionHeading>

              <div className="space-y-6">
                <p className="text-h3 font-normal leading-relaxed text-cream/80">
                  GoKwik had scaled far beyond their original website. Nine products — KwikCheckout,
                  KwikPass, KwikAds, KwikEngage, GoKwik Cart, KwikShip, Return Prime, Kwik AI
                  Popups, KwikGEO — but the site presented them as disconnected pages with no clear
                  narrative.
                </p>
                <p className="text-body-lg text-cream/55">
                  Merchants couldn&apos;t find what was relevant to them. No demo flow, no PLG
                  motion, no sense of the platform&apos;s depth. Visually, it didn&apos;t reflect the
                  credibility of a company with 50M+ completed checkouts, 15,000+ brands, and 9x the
                  GMV of its nearest competitor.
                </p>
                <p className="text-body-lg text-cream/55">
                  The homepage gave prime real estate to an award programme. The product suite — nine
                  solutions across the full D2C journey — was nowhere to be seen.
                </p>
                <p className="text-body-lg italic text-cream/50">
                  The site wasn&apos;t just outdated. It was actively working against them.
                </p>
              </div>
            </Reveal>
          </Container>
        </Section>
      </HideInTldr>

      {/* ── OUR APPROACH ────────────────────────────────────────────────────── */}
      <HideInTldr>
        <Section tone="ink" className="border-t border-cream/10">
          <Container>
            <Reveal>
              <SectionHeading tone="cream" size="h3" as="h2" className="mb-10">
                Our Approach
              </SectionHeading>
            </Reveal>

            {/* Phase grid — gap rendered as hairline via bg-cream/10 */}
            <div className="grid gap-px bg-cream/10 sm:grid-cols-3">
              {phases.map((phase, i) => (
                <Reveal key={phase.num} delay={i * 0.08}>
                  <div className="flex h-full flex-col gap-3 bg-ink p-7 sm:p-8">
                    <p className="text-h5 uppercase tracking-wider text-cream/50">{phase.num}</p>
                    <h3 className="text-h4-alt text-cream">{phase.title}</h3>
                    <p className="text-body-lg text-cream/50">{phase.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      </HideInTldr>

      {/* ── THE WORK — HOMEPAGE ─────────────────────────────────────────────── */}
      <Section tone="ink" className="border-t border-cream/10">
        <Container>
          <Reveal>
            <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
              The Work
            </SectionHeading>

            <figure className="relative w-full overflow-hidden">
              <Image
                src="/images/case-studies/gokwik/new-homepage.webp"
                alt="The new GoKwik homepage — merchant-first, Lottie-driven, outcome-led"
                width={1286}
                height={8192}
                sizes="(min-width: 1200px) 1150px, (min-width: 810px) calc(100vw - 48px), calc(100vw - 32px)"
                className="w-full"
              />
            </figure>
            <p className="mt-3 text-body text-cream/50">
              The new homepage — merchant-first, Lottie-driven, outcome-led.
            </p>

            <HideInTldr>
              <p className="mt-8 text-body-lg text-cream/60">
                A ground-up redesign of gokwik.co. The homepage leads with &ldquo;Built for D2C.
                Powered by AI.&rdquo; — the full product suite surfaced, each product given a Lottie
                animation and a dedicated page. Custom photography creates a consistent human feel
                across the brand.
              </p>
            </HideInTldr>
          </Reveal>
        </Container>
      </Section>

      {/* ── THE WORK — SECTION VIDEOS ───────────────────────────────────────── */}
      <Section tone="ink" className="border-t border-cream/10">
        <Container>
          <div className="flex flex-col gap-10">
            {[
              { src: 'homepage-scroll_loop.mp4', caption: 'Homepage — full scroll, end to end.' },
              { src: 'homepage-tabs-1-Edited.mp4', caption: 'Product tab interactions on the homepage.' },
              { src: 'features.mp4', caption: 'Features section — progressive reveal.' },
              { src: 'pricing.mp4', caption: 'Pricing page layout and hierarchy.' },
              { src: 'testimonial-blue-section.mp4', caption: 'Testimonial section — social proof at scale.' },
              { src: 'Kwik-ads-bouqet_loop.mp4', caption: 'KwikAds — looping brand visual.' },
            ].map(({ src, caption }) => (
              <Reveal key={src}>
                <figure>
                  <video
                    src={`/images/case-studies/gokwik/${src}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full"
                  />
                  <figcaption className="mt-3 text-body text-cream/50">{caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── KEY INTERACTIONS ────────────────────────────────────────────────── */}
      {false && <Section tone="ink" className="border-t border-cream/10">
        <Container>
          <Reveal>
            <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
              Key Interactions
            </SectionHeading>

            <p className="mb-8 text-body-lg text-cream/50">
              Motion was built in, not added on. Each product has a distinct Lottie animation; the
              homepage hero combines video and animation for the visual anchor.
            </p>

            {/* 4-column interaction grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {interactions.map((item, i) => (
                <Reveal key={item.title} delay={i * 0.07}>
                  <div className="flex flex-col gap-3 bg-cream/5 p-5">
                    {/* Placeholder animation frame */}
                    <div className="flex aspect-video w-full items-center justify-center border border-cream/10 bg-cream/[0.03]">
                      <span className="text-h5 uppercase tracking-wider text-cream/20">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-body text-cream/50">{item.caption}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>}

      {/* ── FOOTER CTA ──────────────────────────────────────────────────────── */}
      <CTAFooter />
    </div>
    </CaseStudyShell>
  )
}
