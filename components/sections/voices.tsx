import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { SectionHeading } from '@/components/ui/section-heading'
import { ClutchWordmark } from '@/components/icons/clutch-wordmark'
import { Reveal } from '@/components/ui/reveal'
import { TestimonialSlider } from '@/components/sections/testimonial-slider'
import { testimonials } from '@/data/testimonials'
import { site } from '@/data/site'
import { PaperBackground } from '../ui/paper-background'

export function Voices() {
  return (
    // <PaperBackground className="bg-green-300 w-full flex h-screen items-center justify-center overflow-hidden  px-6 py-12">

    <div
      style={{
        backgroundImage: `url(${'https://framerusercontent.com/images/4svPWouJqvqnznpkeku35FoPOY.webp'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="bg-ink w-full relative flex min-h-screen items-center justify-center overflow-hidden pb-36  px-6 py-12"
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

        {/* Clutch read-more CTA — fixed 505x84 row, label on left + Clutch badge on right */}
      </Container>
      <div className="absolute mx-auto bottom-8 inset-x-0 flex h-auto w-full max-w-[505px] flex-col items-center justify-center gap-3 sm:h-[84px] sm:flex-row sm:gap-2.5">
        <p className="text-h5 text-cream">Read more reviews by our clients on</p>
        <Badge
          tone="cream-on-dark"
          href={site.social.clutchProfile}
          icon={<ClutchWordmark className="h-4 w-auto text-cream" />}
        >
          <StarRating score={4.9} className="text-cream" starClassName="text-cream" />
        </Badge>
      </div>
    </div>

    // </PaperBackground>
  )
}
