import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/data/site'
import { SiteNav } from '@/components/site-nav'
import { CTAFooter } from '@/components/sections/cta-footer'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'
import { CaseStudyShell, HideInTldr } from '@/components/ui/case-study-shell'

export const metadata: Metadata = {
  title: 'Accel Atoms Internal Review Application — Case Study',
  description:
    'How EPYC designed and built a custom application review platform for Accel Atoms — consolidating every stage of the VC review cycle with AI-powered search, summaries, and cohort-level controls.',
  alternates: { canonical: '/case-study/accel-atoms-internal-review-application' },
  openGraph: {
    siteName: 'EPYC',
  },
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PhaseItem = { num: string; title: string; duration: string; body: string }
type AIFeature = { title: string; body: string }
type InteractionItem = string

// ─── Data ─────────────────────────────────────────────────────────────────────

const tags = ['Venture Capital', 'UI/UX Design', 'Web App Development']

const phases: PhaseItem[] = [
  {
    num: 'Phase 01',
    title: 'Bridge',
    duration: '~2 weeks',
    body: 'Before designing anything new, we stabilised the review queue. A rapid interim solution shipped in two weeks to keep analysts moving while we scoped the real platform. The goal: unblock the team, then understand what they actually needed.',
  },
  {
    num: 'Phase 02',
    title: 'Discovery & Design',
    duration: '~1 month',
    body: 'Multiple rounds of interviews with the Accel investment team — surfacing what worked in the old flow, what was actively hurting them, and what the right product needed to do differently. We combined those learnings with hands-on review of how the team actually worked, then designed a new platform from scratch: clean application views, a structured analyst workflow, and analytics built into the product itself.',
  },
  {
    num: 'Phase 03',
    title: 'Build & Evolve',
    duration: 'Ongoing across cohorts',
    body: 'We shipped the platform and kept building. As each new Atoms cohort ran, new demands surfaced — AI search across the full application database, AI-generated company overviews, pitch deck summaries, website summaries, cohort-level data segregation, and user-level access management.',
  },
]

const aiFeatures: AIFeature[] = [
  {
    title: 'AI Search',
    body: 'Find any company, founder, or detail across the full application database instantly.',
  },
  {
    title: 'Company Overviews',
    body: 'AI-generated summaries surfaced inline on the listing page. Context at a glance, before opening a single application.',
  },
  {
    title: 'Pitch Deck Summaries',
    body: 'Key thesis, team, traction, and ask pulled automatically from uploaded decks.',
  },
  {
    title: 'Website Summaries',
    body: 'Per-applicant website summaries on demand. No tab-switching to research companies mid-review.',
  },
]

const interactions: InteractionItem[] = [
  'Cohort-level data segregation with clean switching between programs',
  'User-level access management',
  'Pitch deck summaries on demand',
  'Website summaries per applicant company',
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Accel Atoms Internal Review Application — Case Study',
      description:
        'How EPYC designed and built a custom application review platform for Accel Atoms — consolidating every stage of the VC review cycle with AI-powered search, summaries, and cohort-level controls.',
      url: `${site.url}/case-study/accel-atoms-internal-review-application`,
      author: { '@type': 'Organization', name: site.name, url: site.url },
      publisher: {
        '@type': 'Organization',
        name: site.name,
        url: site.url,
        logo: { '@type': 'ImageObject', url: `${site.url}/icons/epyc-wordmark-large.svg` },
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${site.url}/projects` },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Accel Atoms Internal Review Application',
          item: `${site.url}/case-study/accel-atoms-internal-review-application`,
        },
      ],
    },
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccelAtomsCaseStudy() {
  return (
    <CaseStudyShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-ink text-cream">
        <div className="border-b border-cream/10">
          <SiteNav className="text-cream" />
        </div>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <Section tone="ink">
          <Container>
            <Reveal>
              <div className="mb-10 flex items-center justify-between">
                <Link
                  href="/projects"
                  className="inline-block text-h5 uppercase tracking-wider text-cream/40 underline-offset-4 transition-colors hover:text-cream/70"
                >
                  ← Projects
                </Link>
              </div>

              <div className="mb-8 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Pill key={tag} tone="cream-on-dark">
                    {tag}
                  </Pill>
                ))}
              </div>

              <h1 className="text-display text-cream">
                Hundreds of applications.
                <br />
                One place to review them.
                <br />
                Zero confusion.
              </h1>

              <p className="mt-8 text-body-lg text-cream/60">
                We built a custom platform that consolidated every stage of the application review
                cycle. Then we kept building as the program grew.
              </p>

              {/* No live link — this is a private internal platform */}
              <p className="mt-6 text-body text-cream/30 uppercase tracking-wider">
                Internal platform — not publicly accessible
              </p>
            </Reveal>
          </Container>
        </Section>

        {/* ── OUTCOME ───────────────────────────────────────────────────────── */}
        <Section tone="ink" className="border-t border-cream/10">
          <Container>
            <Reveal>
              <HideInTldr>
                <blockquote className="border-l-2 border-cream/20 bg-cream/5 px-8 py-8 sm:px-12 sm:py-10">
                  <p className="text-h3 font-normal italic text-cream/75">
                    &ldquo;The Review app is a great tool for assessing applications — easy to use,
                    with a strong UI and helpful features that meaningfully reduce manual effort.&rdquo;
                  </p>
                  <cite className="mt-4 block text-h5 not-italic uppercase tracking-wider text-cream/50">
                    — Accel Atoms team
                  </cite>
                </blockquote>

                <div className="mt-10 space-y-4">
                  <p className="text-body-lg text-cream/60">
                    The platform consolidated the team&rsquo;s entire review workflow under one roof.
                    AI features, layered in across cohorts, made navigating and assessing applications
                    faster for every analyst on the team.
                  </p>
                </div>
              </HideInTldr>
            </Reveal>
          </Container>
        </Section>

        {/* ── CHALLENGE ─────────────────────────────────────────────────────── */}
        <HideInTldr>
          <Section tone="ink" className="border-t border-cream/10">
            <Container>
              <Reveal>
                <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
                  Challenge
                </SectionHeading>

                <div className="space-y-6">
                  <p className="text-h3 font-normal leading-relaxed text-cream/80">
                    Accel is one of the world&rsquo;s most active early-stage investors. Their Atoms
                    program runs multiple cohorts a year, each generating a high volume of applications
                    that a small analyst team has to move through quickly.
                  </p>
                  <p className="text-body-lg text-cream/55">
                    Slow tools cost real decisions. Fragmented analytics meant no one had a clear
                    picture of where the cohort stood. A confusing UI meant analysts spent time
                    navigating the tool instead of evaluating companies.
                  </p>
                  <p className="text-body-lg italic text-cream/50">
                    The investment review cycle had friction at every stage.
                  </p>
                </div>
              </Reveal>
            </Container>
          </Section>
        </HideInTldr>

        {/* ── OUR APPROACH ──────────────────────────────────────────────────── */}
        <HideInTldr>
          <Section tone="ink" className="border-t border-cream/10">
            <Container>
              <Reveal>
                <SectionHeading tone="cream" size="h3" as="h2" className="mb-10">
                  Our Approach
                </SectionHeading>
              </Reveal>

              <div className="grid gap-px bg-cream/10 sm:grid-cols-3">
                {phases.map((phase, i) => (
                  <Reveal key={phase.num} delay={i * 0.08}>
                    <div className="flex h-full flex-col gap-3 bg-ink p-7 sm:p-8">
                      <p className="text-h5 uppercase tracking-wider text-cream/50">{phase.num}</p>
                      <h3 className="text-h4-alt text-cream">{phase.title}</h3>
                      <p className="text-body text-cream/40 uppercase tracking-wide">{phase.duration}</p>
                      <p className="text-body-lg text-cream/50">{phase.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Container>
          </Section>
        </HideInTldr>

        {/* ── AI LAYER ──────────────────────────────────────────────────────── */}
        <Section tone="ink" className="border-t border-cream/10">
          <Container>
            <Reveal>
              <SectionHeading tone="cream" size="h3" as="h2" className="mb-10">
                AI Layer
              </SectionHeading>
            </Reveal>

            <div className="grid gap-px bg-cream/10 sm:grid-cols-2">
              {aiFeatures.map((feature, i) => (
                <Reveal key={feature.title} delay={i * 0.06}>
                  <div className="flex h-full flex-col gap-3 bg-ink p-7 sm:p-8">
                    <h3 className="text-h4-alt text-cream">{feature.title}</h3>
                    <p className="text-body-lg text-cream/50">{feature.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* ── KEY INTERACTIONS ──────────────────────────────────────────────── */}
        <HideInTldr>
          <Section tone="ink" className="border-t border-cream/10">
            <Container>
              <Reveal>
                <SectionHeading tone="cream" size="h3" as="h2" className="mb-8">
                  Key Interactions
                </SectionHeading>

                <ul className="space-y-4">
                  {interactions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-4 border-b border-cream/10 pb-4 last:border-0"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cream/30" />
                      <p className="text-body-lg text-cream/60">{item}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Container>
          </Section>
        </HideInTldr>

        {/* ── FOOTER CTA ────────────────────────────────────────────────────── */}
        <CTAFooter />
      </div>
    </CaseStudyShell>
  )
}
