import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { ClutchWordmark } from "@/components/icons/clutch-wordmark";
import { Reveal } from "@/components/ui/reveal";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { testimonials } from "@/data/testimonials";
import { site } from "@/data/site";

export function Voices() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink px-6 py-12">
      <Image
        src="https://framerusercontent.com/images/4svPWouJqvqnznpkeku35FoPOY.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-90"
      />

      <Container width="content" className="relative flex flex-1 flex-col items-center justify-center gap-12">
        <Reveal as="div" className="flex w-full flex-1 items-center">
          <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:gap-[50px]">
            {/* Vertical label column — two stacked H2 lines, 114px wide on desktop.
                NOT a CSS-rotated heading; the source renders them as two normal
                H2 elements stacked vertically in a narrow flex column. */}
            <div className="hidden lg:flex lg:h-[456px] lg:w-[114px] lg:flex-col lg:justify-between lg:px-[3px]">
              <h2 className="text-h2 text-cream">/ Voices of</h2>
              <h2 className="text-h2 text-right text-cream">Delight /</h2>
            </div>

            <div className="flex-1">
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </div>
        </Reveal>

        {/* Clutch read-more CTA — fixed 505x84 row, label on left + Clutch badge on right */}
        <div className="flex h-auto w-full max-w-[505px] flex-col items-center justify-center gap-3 sm:h-[84px] sm:flex-row sm:gap-2.5">
          <p className="text-h5 text-cream">Read more reviews by our clients on</p>
          <Badge
            tone="cream-on-dark"
            href={site.social.clutchProfile}
            icon={<ClutchWordmark className="h-4 w-auto text-cream" />}
          >
            <StarRating
              score={4.9}
              className="text-cream"
              starClassName="text-cream"
            />
          </Badge>
        </div>
      </Container>
    </section>
  );
}
