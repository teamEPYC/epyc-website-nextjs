import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/data/site'
import { SiteNav } from '@/components/site-nav'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { DashedDivider } from '@/components/ui/dashed-divider'
import { Pill } from '@/components/ui/pill'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { Quote } from '@/components/icons/quote'
import { cn } from '@/lib/cn'
import {
  CaseStudyShell,
  CaseStudyViewToggle,
  HideInTldr,
} from '@/components/ui/case-study-shell'

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

const MEDIA = '/images/case-studies/gokwik'

// ─── Types ────────────────────────────────────────────────────────────────────

type MetaItem = { label: string; value: ReactNode }
type StatItem = { number: string; label: string }
type NumberedItem = { num: string; title: string; body: string }
type ClipItem = { src: string; caption: string }

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroMeta: MetaItem[] = [
  { label: 'Category', value: 'UX, Visual, Motion' },
  { label: 'Industry', value: 'D2C / E-commerce SaaS' },
  { label: 'Scope', value: '50+ Pages' },
  {
    label: 'Outcome',
    value: (
      <>
        50–60% lift in traffic
        <br />
        and conversion
      </>
    ),
  },
]

const lovedTags = ['Design System', 'Motion Design', 'Speed of Delivery', 'Project Management']

const stats: StatItem[] = [
  { number: '50–60%', label: 'Actual lift in traffic & conversions' },
  { number: '30–40%', label: 'Pre-launch expectation' },
  { number: '50+', label: 'Pages across desktop & mobile' },
]

const challenges: NumberedItem[] = [
  {
    num: '01',
    title: 'A homepage selling an award programme',
    body: 'The hero promoted “GoKwik Hall Of Glory”. Below it: “We’ve Got Your Business Covered,” a tab of client logos, and a YouTube embed. The product suite was nowhere to be seen.',
  },
  {
    num: '02',
    title: 'Nine products, no narrative',
    body: "Merchants couldn't find what was relevant to them. No demo flow, no PLG motion, no sense of the platform's depth across the D2C journey.",
  },
  {
    num: '03',
    title: 'Credibility that didn’t show',
    body: '50M+ completed checkouts, 15,000+ brands, 9x the GMV of its nearest competitor — and a dark navy site with orange accents and a 3D globe saying none of it.',
  },
]

const phases: NumberedItem[] = [
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

const clips: ClipItem[] = [
  { src: 'features.mp4', caption: 'Features section — progressive reveal.' },
  { src: 'pricing.mp4', caption: 'Pricing page layout and hierarchy.' },
  {
    src: 'testimonial-blue-section.mp4',
    caption: 'Testimonial section — social proof at scale.',
  },
  { src: 'Kwik-ads-bouqet_loop.mp4', caption: 'KwikAds — looping brand visual.' },
]

// ─── Local building blocks ────────────────────────────────────────────────────

/**
 * Section opener with a dashed rule running out either side of the title.
 * Local to this page — the shared `<SectionHeading>` is the `/ Title /` marker
 * pattern, which is a different shape.
 */
function RuledHeading({ children, tone }: { children: ReactNode; tone: 'ink' | 'cream' }) {
  return (
    <div className="flex items-center gap-5 pb-10 lg:gap-8 lg:pb-16">
      <DashedDivider className={cn('hidden flex-1 sm:block', tone === 'ink' ? 'text-ink' : 'text-cream')} />
      <h2
        className={cn(
          'text-h2 whitespace-nowrap',
          tone === 'ink' ? 'text-ink' : 'text-cream',
        )}
      >
        {children}
      </h2>
      <DashedDivider className={cn('flex-1', tone === 'ink' ? 'text-ink' : 'text-cream')} />
    </div>
  )
}

/** Mock browser chrome — traffic-light dots + centred URL — around a screenshot. */
function BrowserFrame({
  url,
  tone,
  children,
}: {
  url: string
  tone: 'on-dark' | 'on-light'
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-cream',
        tone === 'on-dark' ? 'border-sand/35' : 'border-ink/15',
      )}
    >
      <div className="flex items-center gap-4 border-b border-ink/10 px-5 py-3.5">
        <div className="flex gap-[7px]">
          <span className="block size-2.5 rounded-full bg-crimson" />
          <span className="block size-2.5 rounded-full bg-sand" />
          <span className="block size-2.5 rounded-full bg-teal-deep" />
        </div>
        <span className="flex-1 text-center text-h5 text-ink/55">{url}</span>
        <span className="w-11" />
      </div>
      {children}
    </div>
  )
}

/** Caption that trails off into a hairline rule — sits under the browser frames. */
function TrailingCaption({ children, tone }: { children: ReactNode; tone: 'ink' | 'cream' }) {
  return (
    <div className="mt-4 flex items-center gap-5">
      <span
        className={cn(
          'text-body uppercase tracking-wider',
          tone === 'ink' ? 'text-ink/55' : 'text-cream/50',
        )}
      >
        {children}
      </span>
      <div className={cn('h-px flex-1', tone === 'ink' ? 'bg-ink/20' : 'bg-cream/25')} />
    </div>
  )
}

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
    <CaseStudyShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Opens on beige — the ink surfaces carry the quote, the challenge, the close. */}
      <div className="min-h-screen bg-beige text-ink">
        <SiteNav />

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <Section tone="beige">
          <Container>
            <Reveal>
              <div className="mb-10 flex items-center justify-between">
                <Link
                  href="/projects"
                  className="inline-block text-h5 uppercase tracking-wider text-ink/45 transition-colors hover:text-ink/75"
                >
                  ← Projects
                </Link>
                <CaseStudyViewToggle tone="ink" />
              </div>

              <div className="grid items-start gap-10 pb-16 lg:grid-cols-2 lg:gap-20">
                <div className="flex flex-col items-start gap-7">
                  {/* GoKwik's own wordmark, served from gokwik.co — plain <img> so
                      the remote host doesn't need whitelisting in next.config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://www.gokwik.co/gokwik/svg/logo.svg"
                    alt="GoKwik"
                    className="block h-[34px] w-auto"
                  />
                  <h1 className="text-h1 text-ink">
                    15,000 brands. 50M+ shoppers. A website that told none of it.
                  </h1>
                </div>

                <div className="flex flex-col gap-5 lg:pt-2">
                  <p className="text-body-lg text-ink/80">
                    GoKwik had built India&apos;s leading D2C growth platform. Their website was
                    still describing the company they used to be.
                  </p>
                  <HideInTldr>
                    <p className="text-body-lg text-ink/80">
                      Nine products across the full D2C journey — KwikCheckout, KwikPass, KwikAds,
                      KwikEngage, GoKwik Cart, KwikShip, Return Prime, Kwik AI Popups, KwikGEO —
                      presented as disconnected pages with no clear narrative.
                    </p>
                  </HideInTldr>
                  <div className="pt-2">
                    <Button variant="filled" size="md" icon="arrow-right" href="https://gokwik.co">
                      See it live
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Project meta strip */}
            <Reveal>
              <div className="flex flex-col items-center gap-8 pb-12">
                <DashedDivider className="text-ink" />
                <div className="grid w-full grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:items-start sm:justify-between">
                  {heroMeta.map((item) => (
                    <div key={item.label} className="flex flex-col gap-2">
                      <span className="text-h5 text-crimson">{item.label}</span>
                      <span className="text-h4 font-normal text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Hero shot — the fold of the new homepage, clipped to a fixed frame */}
            <Reveal>
              <div className="h-[420px] w-full overflow-hidden rounded-md bg-ink sm:h-[560px] lg:h-[735px]">
                <Image
                  src={`${MEDIA}/new-homepage.webp`}
                  alt="The new GoKwik homepage — merchant-first, Lottie-driven, outcome-led"
                  width={1286}
                  height={8192}
                  priority
                  sizes="(min-width: 1200px) 1150px, (min-width: 810px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="block w-full"
                />
              </div>
            </Reveal>
          </Container>
        </Section>

        {/* ── VOICE OF THE CLIENT + OUTCOME ─────────────────────────────────── */}
        <Section tone="ink">
          <Container>
            <Reveal>
              <div className="mx-auto flex max-w-[900px] flex-col items-start gap-8">
                <Quote size={44} className="text-crimson" />
                <p className="text-h2 text-cream">Good stuff, guys. We trust you completely.</p>
                <DashedDivider className="text-cream" />
                <div className="flex w-full flex-wrap items-start justify-between gap-8">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-h4 text-cream">The GoKwik team</span>
                    <span className="text-body-lg text-cream/60">Growth &amp; Brand, GoKwik</span>
                  </div>
                  <div className="flex flex-col items-start gap-3.5">
                    <span className="text-h5 uppercase tracking-wider text-cream/50">
                      What they loved about us
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {lovedTags.map((tag) => (
                        <Pill key={tag} tone="cream-on-dark">
                          {tag}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <HideInTldr>
              <Reveal>
                <div className="mt-16 grid gap-px bg-cream/15 sm:grid-cols-3 lg:mt-20">
                  {stats.map((s) => (
                    <div key={s.number} className="bg-ink p-8">
                      <p className="text-h1 text-cream">{s.number}</p>
                      <p className="mt-2 text-body uppercase tracking-wide text-cream/60">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </HideInTldr>
          </Container>
        </Section>

        {/* ── PROJECT CHALLENGES + BEFORE ───────────────────────────────────── */}
        <Section tone="ink">
          <Container>
            <HideInTldr>
              <Reveal>
                <RuledHeading tone="cream">Project Challenges</RuledHeading>
              </Reveal>

              <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
                {challenges.map((item, i) => (
                  <Reveal key={item.num} delay={i * 0.08}>
                    <div className="flex h-full flex-col gap-4">
                      <span className="text-h5 uppercase tracking-wider text-cream/50">
                        {item.num}
                      </span>
                      <div className="h-px w-20 bg-cream" />
                      <div className="flex flex-col gap-2">
                        {/* 24px / weight 400 → text-h4-alt (Rationalist Reg, 24px
                            desktop). text-h4 is the same size but Norms Serif Bold. */}
                        <span className="text-h4-alt text-cream">{item.title}</span>
                        <span className="text-body-lg text-cream/75">{item.body}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </HideInTldr>

            <Reveal>
              <SectionHeading tone="cream" size="h3" as="h3" className="mb-6 mt-16 lg:mt-[72px]">
                Before EPYC
              </SectionHeading>
              <BrowserFrame url="gokwik.co" tone="on-dark">
                <div className="scrollable-preview scrollable-preview-ink h-[420px] overflow-x-hidden sm:h-[520px] lg:h-[620px]">
                  <Image
                    src={`${MEDIA}/old-homepage-aug2025-clean.png`}
                    alt="The old GoKwik homepage, Aug 2025 — before the redesign"
                    width={1440}
                    height={9000}
                    sizes="(min-width: 1200px) 1150px, (min-width: 810px) calc(100vw - 48px), calc(100vw - 32px)"
                    className="block w-full"
                  />
                </div>
              </BrowserFrame>
              <TrailingCaption tone="cream">
                The old site, Aug 2025 — before the redesign
              </TrailingCaption>
            </Reveal>
          </Container>
        </Section>

        {/* ── PROJECT STRATEGY + AFTER ──────────────────────────────────────── */}
        <Section tone="beige">
          <Container>
            <HideInTldr>
              <Reveal>
                <RuledHeading tone="ink">Project Strategy</RuledHeading>
              </Reveal>

              <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
                {phases.map((phase, i) => (
                  <Reveal key={phase.num} delay={i * 0.08}>
                    <div className="flex h-full flex-col gap-4">
                      <span className="text-h5 uppercase tracking-wider text-crimson">
                        {phase.num}
                      </span>
                      <div className="h-px w-20 bg-ink" />
                      <div className="flex flex-col gap-2">
                        <span className="text-h4-alt text-ink">{phase.title}</span>
                        <span className="text-body-lg text-ink/80">{phase.body}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </HideInTldr>

            <Reveal>
              <figure className="mt-16">
                <div className="overflow-hidden rounded-md bg-ink p-4 lg:p-6">
                  <video
                    src={`${MEDIA}/homepage-tabs-1-Edited.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="block w-full rounded-sm"
                  />
                </div>
                <figcaption className="mt-3 text-body text-ink/60">
                  Product tab interactions on the homepage.
                </figcaption>
              </figure>
            </Reveal>

            <Reveal>
              <SectionHeading tone="ink" size="h3" as="h3" className="mb-6 mt-16 lg:mt-[72px]">
                After EPYC
              </SectionHeading>
              <BrowserFrame url="gokwik.co" tone="on-light">
                <Image
                  src={`${MEDIA}/new-homepage.webp`}
                  alt="The new GoKwik homepage — full page, end to end"
                  width={1286}
                  height={8192}
                  sizes="(min-width: 1200px) 1150px, (min-width: 810px) calc(100vw - 48px), calc(100vw - 32px)"
                  className="block w-full"
                />
              </BrowserFrame>
              <TrailingCaption tone="ink">
                The new homepage — full page, end to end
              </TrailingCaption>
            </Reveal>
          </Container>
        </Section>

        {/* ── THE WORK — MOTION + STILLS ────────────────────────────────────── */}
        <Section tone="beige">
          <Container>
            <div className="flex flex-col gap-10">
              {clips.map(({ src, caption }) => (
                <Reveal key={src}>
                  <figure>
                    <div className="overflow-hidden rounded-sm bg-bone">
                      <video
                        src={`${MEDIA}/${src}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="block w-full"
                      />
                    </div>
                    <figcaption className="mt-2.5 text-body text-ink/60">{caption}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── CONCLUSION ────────────────────────────────────────────────────── */}
        <Section tone="ink">
          <Container>
            <Reveal>
              <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
                <h2 className="text-h2 text-cream">Conclusion</h2>
                <div className="flex flex-col gap-5">
                  <p className="text-body-lg text-cream/85">
                    Fifty-plus pages across desktop and mobile, built off one design system and a
                    Lottie-first motion language. The homepage now opens on the platform, not an
                    award programme.
                  </p>
                  <p className="text-body-lg text-cream/85">
                    Pre-launch, GoKwik expected a 30–40% lift in traffic and conversions.
                    Post-launch, the actual lift landed at 50–60%.
                  </p>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        <CTAFooter />
      </div>
    </CaseStudyShell>
  )
}
