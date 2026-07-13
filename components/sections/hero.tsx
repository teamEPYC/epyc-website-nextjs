import { PaperBackground } from '@/components/ui/paper-background'
import { SiteNav } from '@/components/site-nav'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from '@/components/icons/star'
import { ClutchWordmark } from '@/components/icons/clutch-wordmark'
import { site } from '@/data/site'

export function Hero() {
  return (
    <PaperBackground gradient="bottom" className="min-h-[67vh] p-4 lg:min-h-[90vh]">
      {/* Inner frame with the 1px beige border on top + left + right (no bottom),
          matching the Framer source's `framer-15o8czf` element. */}
      <div className="min-h-[calc(67vh-2rem)] border-l border-r border-t border-beige lg:min-h-[calc(90vh-2rem)]">
        <SiteNav />
        <Container
          width="content"
          className="relative flex min-h-[calc(67vh-2rem)] flex-col items-center justify-start gap-15 py-12 lg:min-h-[calc(90vh-2rem)] lg:gap-24 lg:py-12"
        >
          {/* Center content */}
          <div className="flex w-full max-w-[780px] flex-col items-center gap-5 lg:gap-6">
            {/* Clutch badge — its own row */}
            <Badge
              tone="cream-on-dark"
              href={site.social.clutchProfile}
              className="gap-1.5 py-2 px-3 lg:py-4 lg:px-4 text-body-sm"
              icon={<ClutchWordmark className="h-3 lg:h-4 w-auto text-cream" />}
            >
              <span className="flex items-center gap-1.5 lg:gap-2">
                <span className="text-body-sm font-semibold lg:hidden" style={{ lineHeight: 1, fontSize: 12, marginBottom: -2 }}>4.9/5.0</span>
                <span className="text-body-sm font-semibold hidden lg:inline" style={{ lineHeight: 1, fontSize: 16, marginBottom: -2 }}>4.9/5.0</span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className="text-cream lg:hidden" />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={`lg-${i}`} size={13} className="text-cream hidden lg:inline-block" />
                  ))}
                </span>
              </span>
            </Badge>


            <h1 className="text-display mt-4 lg:mt-0 text-center text-cream text-balance">
              Premium design &amp; development for companies that want to be taken seriously.
            </h1>

            <p className="text-body max-w-2xl text-center text-beige" style={{ fontSize: 20 }}>
              We&apos;re a premium design &amp; development studio. Polygon, Accel, Antler, and
              75+ others trust us to build products that match their ambition — without the
              overhead of an in-house team.
            </p>

            <div className=" flex w-full  lg:w-auto items-center justify-center gap-3">
              <Button variant="outline" data-on-dark="true" className="w-full" icon="arrow-right" href="/projects">
                See Our Work
              </Button>
              <Button variant="filled" className="w-full" icon="arrow-right" href="/contact">
                Start Your Project
              </Button>
            </div>

            <p className="text-beige" style={{ fontSize: 18, marginTop: 12 }}>
              Websites&nbsp;&nbsp;|&nbsp;&nbsp;AI Applications&nbsp;&nbsp;|&nbsp;&nbsp;MVPs
            </p>
          </div>

          <div aria-hidden="true" className="hidden lg:block" />
        </Container>
      </div>
    </PaperBackground>
  )
}
