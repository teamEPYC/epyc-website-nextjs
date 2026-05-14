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
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-ink px-6 py-12"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(30,80,50,0.6) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 40%, rgba(20,70,40,0.4) 0%, transparent 55%),
          var(--color-ink)
        `,
      }}
    >
      <Container width="content" className="relative flex flex-1 flex-col items-center justify-center gap-12">
        <Reveal as="div" className="flex w-full flex-1 items-center">
          <div className="flex w-full flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-[50px]">
            {/* Vertical label — single rotated line, height-matched to the card. */}
            <div className="hidden lg:flex lg:h-[420px] lg:items-center lg:justify-center">
              <h2
                className="text-h2 whitespace-nowrap text-cream"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
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
