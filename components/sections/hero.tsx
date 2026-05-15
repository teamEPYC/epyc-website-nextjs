import { PaperBackground } from '@/components/ui/paper-background'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from '@/components/icons/star'
import { EpycMark } from '@/components/icons/epyc-mark'
import { EpycWordmark } from '@/components/icons/epyc-wordmark'
import { ClutchWordmark } from '@/components/icons/clutch-wordmark'
import { BubbleGlyph } from '@/components/icons/bubble-glyph'
import { WebflowGlyph } from '@/components/icons/webflow-glyph'
import { FramerGlyph } from '@/components/icons/framer-glyph'
import { site } from '@/data/site'

export function Hero() {
  return (
    <PaperBackground gradient="bottom" className="min-h-[67vh] p-4 lg:min-h-[90vh]">
      {/* Inner frame with the 1px beige border on top + left + right (no bottom),
          matching the Framer source's `framer-15o8czf` element. */}
      <div className="min-h-[calc(67vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(90vh-2rem)]">
        <Container
          width="content"
          className="relative flex min-h-[calc(67vh-2rem)] flex-col items-center justify-start gap-15 py-12 lg:min-h-[calc(90vh-2rem)] lg:gap-24 lg:py-12"
        >
          {/* Logo — wings emblem stacked above EPYC wordmark */}
          <div className="flex flex-col items-center gap-3 md:gap-2">
            <img
              src="https://framerusercontent.com/images/7Y2SFGh3s2rVmyLLheBByPDN0Zs.svg?width=86&height=20"
              alt="EPYC"
              loading="lazy"
              className="h-auto w-[70px] text-cream lg:w-[87px]"
            />
            <img
              src="https://framerusercontent.com/images/hgI5DqS5OhR7orP2x05J8rY5Lg.svg?width=187&height=45"
              alt="EPYC"
              loading="lazy"
              className="h-auto w-[70px] text-cream lg:w-[140px]"
            />
          </div>

          {/* Center content */}
          <div className="flex w-full max-w-[780px] flex-col items-center gap-5 lg:gap-6">
            {/* Clutch badge — its own row */}
            <Badge
              tone="cream-on-dark"
              href={site.social.clutchProfile}
              className="gap-2.5 py-2 px-2 text-body-sm"
              icon={<ClutchWordmark className="h-3 lg:h-5 w-auto text-cream" />}
            >
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-cream" />
                  ))}
                </span>
                <span className="text-body-sm">4.9/5.0</span>
              </span>
            </Badge>

            {/* Partner badges — second row, 3 in a line. Hidden on mobile per source. */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-2.5">
              <Badge
                tone="cream-on-dark"
                className="gap-2 py-4 text-body-sm"
                icon={<BubbleGlyph className="h-3.5 w-3.5 text-cream" />}
              >
                Bubble Bronze Agency
              </Badge>
              <Badge
                tone="cream-on-dark"
                className="gap-2 py-4 text-body-sm"
                icon={<WebflowGlyph className="h-3.5 w-auto text-cream" />}
              >
                Webflow Professional Partners
              </Badge>
              <Badge
                tone="cream-on-dark"
                className="gap-2 py-4 text-body-sm"
                icon={<FramerGlyph className="h-3.5 w-auto text-cream" />}
              >
                Framer Enterprise Partners
              </Badge>
            </div>

            <h1 className="text-h1 mt-10 lg:mt-0 text-center text-cream ">
              Great Companies Deserve Great Websites &amp; Digital Products
            </h1>

            <p className="text-body max-w-sm text-center text-beige">
              SaaS &amp; AI · E-Commerce &amp; Payments · Finance &amp; VC · Education · HealthTech
              · Web3 &amp; Blockchain
            </p>

            <div className=" flex w-full items-center justify-center gap-3">
              <Button variant="filled" className="w-full" icon="arrow-down" href="/projects">
                See Our Work
              </Button>
              <Button variant="filled" className="w-full" icon="arrow-right" href="/contact">
                Talk to Us
              </Button>
            </div>
          </div>

          <div aria-hidden="true" className="hidden lg:block" />
        </Container>
      </div>
    </PaperBackground>
  )
}
