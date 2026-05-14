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
    <section className="relative w-full overflow-hidden bg-ink py-12 lg:py-20">
      <Image
        src="https://framerusercontent.com/images/4svPWouJqvqnznpkeku35FoPOY.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-90"
      />

      <Container width="content" className="relative">
        <Reveal as="div" className="flex flex-col gap-12">
          <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-12">
            {/* Rotated vertical label (desktop only). vertical-rl + rotate(180deg)
                reads bottom-to-top, matching the Framer source. */}
            <div
              aria-hidden="false"
              className="hidden lg:flex lg:items-center lg:justify-center lg:self-stretch"
            >
              <h2
                className="text-h2 whitespace-nowrap text-cream"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                }}
              >
                / Voices of Delight /
              </h2>
            </div>

            <div className="flex-1">
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </div>

          {/* Clutch read-more CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <p className="text-body text-cream/80">
              Read more reviews by our clients on
            </p>
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
        </Reveal>
      </Container>
    </section>
  );
}
