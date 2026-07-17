import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { Ribbon } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { Container } from '@/components/ui/container'
import { PaperBackground } from '@/components/ui/paper-background'

/**
 * Figma "Version 1.2 banner" (3787:47140), 1440×810 desktop:
 *  - 1px beige border frame inset 15px, 751px tall → 44px strip below it
 *  - nav content at 92px side gutters, row centre 69px from top
 *  - hero content at 92px gutters, top 136px: 620px copy col, 16px gap,
 *    628px square image (620+16+628 = 1264 — the image bleeds 8px past the
 *    1256px content column, per the design)
 *
 * Background is the shared <PaperBackground> the homepage hero uses, not the
 * Figma frame's own "Smoke" texture — reusing the site-wide treatment keeps the
 * two heroes consistent.
 */
export function AiHero() {
  return (
    <PaperBackground gradient="bottom" className="p-[15px] lg:pb-[44px]">
      {/* Bordered frame — 15px inset, 751px tall on desktop (Figma Rectangle 25515).
          Top + sides only, no bottom edge, and the sides fade out around the
          midpoint as they descend (per the Figma render). The border lives on
          its own overlay rather than on the content wrapper because the mask
          that produces the fade would otherwise fade the content with it. */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border-l border-r border-t border-beige [mask-image:linear-gradient(to_bottom,#000_0%,#000_40%,transparent_95%)]"
        />
        <SiteNav />
        <Container width="wide" className="pb-12 pt-8 lg:px-[77px] lg:pb-[2px] lg:pt-[27px]">
          <Reveal className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[620px_628px] lg:gap-4">
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:gap-10 lg:text-left">
              <div className="flex flex-col items-center gap-6 lg:items-start">
                <Badge tone="cream-on-dark" icon={<Ribbon />}>
                  12,000+ trained across GrowthSchool, Masters&apos; Union and IIM
                </Badge>

                {/* Figma's 42/52/64 (3787:47161) is exactly the `text-display`
                    scale. The line break is set by hand — "AI builders." is its
                    own line, not a wrap. */}
                <h1 className="text-display text-cream">
                  Turn your team into
                  <br />
                  AI builders.
                </h1>

                {/* TT Norms Pro Serif 16px / 1.6 → text-body */}
                <p className="text-body mx-auto max-w-[477px] text-cream lg:mx-0">
                  EPYC runs hands-on AI workshops for teams that want to ship real work, not sit
                  through a slide deck. Foundations, live building, and a working prototype by the end.
                </p>
              </div>

              {/* CTAs — same shared Button at its default `lg` size as the
                  homepage hero, so the two pages' CTAs read identically. */}
              <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button variant="filled" icon="arrow-right" href="#request-workshop">
                  Request a Workshop
                </Button>
                <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/projects">
                  See our work
                </Button>
              </div>

              {/* Caption — Figma 14px serif (3787:47170) → text-h5 (10/12/14). */}
              <p className="text-h5 text-cream">
                Taught with GrowthSchool · Masters&apos; Union · IIM
              </p>
            </div>

            {/* 628×628 square image, sharp corners (Figma 3787:47171) */}
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src="/images/ai-training/hero-workshop.png"
                alt="An EPYC facilitator leading a hands-on AI workshop with a team around a table"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 628px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </div>
    </PaperBackground>
  )
}
