import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from '@/components/icons/star'
import { SectionHeading } from '@/components/ui/section-heading'
import { ClutchWordmark } from '@/components/icons/clutch-wordmark'
import { Reveal } from '@/components/ui/reveal'
import { TestimonialSlider } from '@/components/sections/testimonial-slider'
import { testimonials } from '@/data/testimonials'
import { site } from '@/data/site'
import { PaperBackground } from '../ui/paper-background'

/** `showProjectCta` drops the "Start Your Project" button — the AI-training
 *  page carries its own CTAs and doesn't want a second, conflicting one. The
 *  Clutch reviews row stays either way; it's social proof, not a CTA. */
export function Voices({ showProjectCta = true }: { showProjectCta?: boolean } = {}) {
  return (
    // <PaperBackground className="bg-green-300 w-full flex h-screen items-center justify-center overflow-hidden  px-6 py-12">

    <div
      style={{
        backgroundImage: `url(${'/images/site/4svPWouJqvqnznpkeku35FoPOY.webp'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="bg-ink w-full relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
    >
      <Container
        width="content"
        className="relative flex flex-1 w-full flex-col items-center justify-center gap-12"
      >
        {/* Mobile-only heading — hidden on lg where the rotated vertical
            label inside the row takes over. */}
        <div className="flex w-full justify-center lg:hidden">
          <SectionHeading tone="cream">Voices of Delight</SectionHeading>
        </div>

        <Reveal as="div" className="flex w-full flex-1 items-center">
          <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-[50px]">
            {/* Vertical label — single rotated line, height-matched to the card. */}
            <div className="hidden lg:flex lg:h-[420px] lg:items-center lg:justify-center">
              <h2
                className="text-h2 whitespace-nowrap text-cream"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                / Voices of Delight /
              </h2>
            </div>

            <div className="flex-1">
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </div>
        </Reveal>

        {showProjectCta && (
          <Button variant="filled" icon="arrow-right" href="/contact">
            Start Your Project
          </Button>
        )}

        {/* Clutch read-more CTA */}
        <div className="flex h-auto w-full max-w-[505px] flex-col items-center justify-center gap-3 sm:h-[84px] sm:flex-row sm:gap-2.5">
          <p className="text-cream" style={{ fontSize: 16 }}>Read more reviews by our clients on</p>
          <Badge
            tone="cream-on-dark"
            href={site.social.clutchProfile}
            className="gap-1.5 py-2 px-3 lg:py-4 lg:px-4"
            icon={<ClutchWordmark className="h-3 lg:h-4 w-auto text-cream" />}
          >
            <span className="flex items-center gap-1.5 lg:gap-2">
              <span className="font-semibold text-cream" style={{ lineHeight: 1, fontSize: 16, marginBottom: -2 }}>4.9/5.0</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="text-cream" />
                ))}
              </span>
            </span>
          </Badge>
        </div>
      </Container>
    </div>

    // </PaperBackground>
  )
}
