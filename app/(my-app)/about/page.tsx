import type { Metadata } from 'next'
import { SiteNav } from '@/components/site-nav'
import { PaperBackground } from '@/components/ui/paper-background'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import { Testimonial } from '@/components/ui/testimonial'
import { Reveal } from '@/components/ui/reveal'
import { testimonials } from '@/data/testimonials'
import { AboutCTAFooter } from './about-cta-footer'

export const metadata: Metadata = {
  title: { absolute: 'About EPYC | Website Design & Development Agency for Ambitious Companies' },
  description:
    'EPYC is a premium website design and development studio. We build websites for ambitious companies, from startups to enterprise, that want to look as good as they actually are.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About EPYC | Website Design & Development Agency for Ambitious Companies',
    description:
      'EPYC is a premium website design and development studio. We build websites for ambitious companies, from startups to enterprise, that want to look as good as they actually are.',
    type: 'website',
    siteName: 'EPYC',
    images: [{ url: '/og/default.jpg', width: 1200, height: 630, alt: 'EPYC — Design & Development Studio' }],
  },
}

const NUMBERS = [
  { value: '75+', label: 'organizations have trusted us with their websites' },
  { value: '4.9/5.0', label: 'average client rating' },
  { value: '3', label: 'new clients per month, by design' },
]

// Testimonial data already carries this exact quote (`data/testimonials.ts`,
// id `leon-stern`) with slightly different wording than the About-page brief.
// The brief's copy is authoritative for this page, so the quote/name/role
// below are taken from the brief verbatim; only the portrait image is reused
// from the existing testimonial record.
const leonSternImage = testimonials.find((t) => t.id === 'leon-stern')!.image

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── */}
      <PaperBackground gradient="bottom" className="min-h-[70vh] p-4 lg:min-h-[90vh]">
        <div className="min-h-[calc(70vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(90vh-2rem)]">
          <SiteNav className="text-cream" />
          <Container
            width="content"
            className="flex min-h-[calc(70vh-2rem)] flex-col items-center justify-center gap-8 py-12 text-center lg:min-h-[calc(90vh-2rem)]"
          >
            <Badge tone="cream-on-dark" className="w-fit">
              About EPYC
            </Badge>
            <h1 className="text-display max-w-3xl text-balance text-cream">
              We build websites for companies that refuse to look average.
            </h1>
            <p className="max-w-2xl text-body-lg text-beige">
              EPYC is a premium website studio. We partner with ambitious companies, from startups
              to enterprise teams, to build websites that earn trust, open doors, and convert.
            </p>
            <Button variant="filled" icon="arrow-right" href="/contact">
              Let&apos;s Talk
            </Button>
          </Container>
        </div>
      </PaperBackground>

      {/* ── WHY WE EXIST ── */}
      <Section tone="beige">
        <Container width="content">
          <Reveal className="flex flex-col gap-8 lg:gap-10">
            <SectionHeading eyebrow="About EPYC">Why EPYC exists</SectionHeading>
            <div className="flex max-w-3xl flex-col gap-6 text-body-lg text-ink/80">
              <p>Most companies have a website problem they haven&apos;t fully admitted yet.</p>
              <p>
                The product is solid. The team is sharp. The deck impresses investors. But the
                website? It looks like it was built in 2017 by someone who&apos;s since moved on.
              </p>
              <p>
                That gap costs you: in fundraising conversations, in sales calls, in recruiting. A
                weak website tells the wrong story before you get the chance to tell the right one.
              </p>
              <p className="text-ink">
                We started EPYC because that gap shouldn&apos;t exist. Great companies deserve
                websites that match their ambition.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── HOW WE WORK ── */}
      <Section
        tone="ink"
        style={{
          backgroundImage: `url(${'/images/site/4svPWouJqvqnznpkeku35FoPOY.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container width="content">
          <Reveal className="flex flex-col gap-8 lg:gap-10">
            <SectionHeading tone="cream" eyebrow="How we work">
              We build the website. You choose nothing but the outcome.
            </SectionHeading>
            <div className="flex max-w-3xl flex-col gap-6 text-body-lg text-cream/80">
              <p>
                We work across Webflow, Framer, WordPress, Bubble.io, and custom code. We pick the
                right tool for your project, not the other way around.
              </p>
              <p>
                That means you&apos;re not locked into a platform, a template, or an agency with
                one trick. You get the right website for where your company is going.
              </p>
              <p className="text-cream">
                From strategy and brand direction through design, build, and launch, we run the
                whole project. One partner. No hand-offs.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── NUMBERS / SOCIAL PROOF STRIP ── */}
      <Section tone="beige">
        <Container width="outer">
          <Reveal className="grid grid-cols-1 gap-10 border-t border-ink/15 pt-12 sm:grid-cols-3 sm:gap-6">
            {NUMBERS.map((n) => (
              <div
                key={n.label}
                className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
              >
                <span className="font-display text-[42px] font-light leading-none tracking-[-0.04em] text-crimson lg:text-[56px]">
                  {n.value}
                </span>
                <p className="max-w-[260px] text-body text-ink/70">{n.label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* ── WHO WE WORK WITH ── */}
      <Section tone="beige">
        <Container width="content">
          <Reveal className="flex flex-col gap-8 lg:gap-10">
            <SectionHeading eyebrow="Who we work with">
              We work with the companies building what&apos;s next.
            </SectionHeading>
            <p className="font-display text-[26px] font-light leading-tight tracking-[-0.04em] text-ink lg:text-[34px]">
              Polygon. Accel. Antler. upGrad. 3One4 Capital. GoKwik.
            </p>
            <div className="flex max-w-3xl flex-col gap-6 text-body-lg text-ink/80">
              <p>
                VC-backed startups raising their next round. VC firms that need a presence as sharp
                as their portfolio. Enterprise teams moving faster than their internal dev cycles
                allow.
              </p>
              <p className="text-ink">
                If your website needs to impress investors, customers, or recruits, we should talk.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── TESTIMONIAL ── */}
      <div
        style={{
          backgroundImage: `url(${'/images/site/4svPWouJqvqnznpkeku35FoPOY.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="w-full bg-ink px-6 py-16 lg:py-24"
      >
        <Container width="content">
          <Reveal>
            <Testimonial
              name="Leon Stern"
              role="Director of Digital, Polygon"
              image={leonSternImage}
              quote={
                <>
                  &ldquo;Honestly, I never worked with a better partner before. There is always
                  someone available to help, you always deliver on time with great quality. For
                  the last 12 months we have been working on very complex products and the
                  experience working with EPYC has been excellent.&rdquo;
                </>
              }
            />
          </Reveal>
        </Container>
      </div>

      {/* ── EXCLUSIVITY NOTE ── */}
      <section className="flex w-full items-center justify-center bg-teal-deep py-20">
        <Container width="content">
          <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <p className="text-body uppercase text-cream">/Exclusivity/</p>
            <h2 className="text-h2-light text-cream">We only take 3 new clients each month.</h2>
            <div className="flex flex-col gap-4 text-body-lg text-cream/90">
              <p>Not because we can&apos;t handle more. Because quality requires attention.</p>
              <p>
                Every project gets our full focus, from the first call to the last pixel.
                We&apos;d rather do fewer things exceptionally than many things adequately.
              </p>
              <p className="text-cream">
                If you&apos;re ready to move, we&apos;d start by understanding what you&apos;re
                building.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── CLOSING CTA + FOOTER ── */}
      <AboutCTAFooter />
    </>
  )
}
