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
    <PaperBackground gradient="bottom" className="min-h-[90vh] p-4">
      {/* Inner frame with the 1px beige border on top + left + right (no bottom),
          matching the Framer source's `framer-15o8czf` element. */}
      <div className="min-h-[calc(90vh-2rem)] border-l border-r border-t border-beige">
        <Container
          width="content"
          className="relative flex min-h-[calc(90vh-2rem)] flex-col items-center justify-start gap-10 py-10 lg:gap-24  lg:py-12"
        >
          {/* Logo — wings emblem stacked above EPYC wordmark */}
          <div className="flex flex-col  items-center gap-3">
            {/* <EpycMark className="h-7 w-auto text-cream lg:h-5" /> */}
            <img
              src="https://framerusercontent.com/images/7Y2SFGh3s2rVmyLLheBByPDN0Zs.svg?width=86&height=20"
              alt="EPYC"
              loading="lazy"
              className="w-7 h-auto text-cream lg:w-[87px]"
            />
            <img
              src="https://framerusercontent.com/images/hgI5DqS5OhR7orP2x05J8rY5Lg.svg?width=187&height=45"
              alt="EPYC"
              loading="lazy"
              className="w-9 h-auto text-cream lg:w-[87px]"
            />
            {/* <EpycWordmark className="h-9 w-auto text-cream lg:h-4" /> */}
          </div>

          {/* Center content */}
          <div className="flex w-full max-w-[780px] flex-col items-center gap-5 lg:gap-6">
            {/* Clutch badge — its own row */}
            <Badge
              tone="cream-on-dark"
              href={site.social.clutchProfile}
              className="gap-2.5 py-2 text-body-sm"
              icon={<ClutchWordmark className="h-5 w-auto text-cream" />}
            >
              <span className="flex flex-col items-center gap-1.5">
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

            <h1 className="text-h1 text-center text-cream ">
              Great Companies Deserve Great Websites &amp; Digital Products
            </h1>

            <p className="text-body max-w-sm text-center text-beige">
              SaaS &amp; AI · E-Commerce &amp; Payments · Finance &amp; VC · Education · HealthTech
              · Web3 &amp; Blockchain
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="filled" icon="arrow-down" href="/projects">
                See Our Work
              </Button>
              <Button variant="filled" icon="arrow-right" href="/contact">
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
