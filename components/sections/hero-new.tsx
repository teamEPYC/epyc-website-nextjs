import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { Container } from '@/components/ui/container'
import { Pill } from '@/components/ui/pill'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { brands } from '@/data/brands'

const HERO_BRAND_IDS = ['b01', 'b04', 'b03', 'b02', 'b10', 'b06', 'b07']

export function HeroNew() {
  const heroBrands = brands.filter((b) => HERO_BRAND_IDS.includes(b.id))

  return (
    <div className="relative w-full overflow-hidden bg-ink">
      {/* Smoke texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          backgroundImage: "url('/images/site/4svPWouJqvqnznpkeku35FoPOY.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Inner frame border — matches Figma's 1px inset border */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-4 right-4 top-4 border border-l border-r border-t border-cream/20"
        style={{ height: 'min(calc(100vh - 2rem), 750px)' }}
      />

      <SiteNav />

      <Container width="content" className="relative z-10 flex flex-col items-center">
        {/* Center content */}
        <Reveal className="flex w-full flex-col items-center gap-5 pb-12 pt-14 text-center lg:gap-6 lg:pt-20">
          <Pill tone="cream-on-dark" className="text-body-sm">
            Website Design &amp; Development Studio
          </Pill>

          <h1 className="text-display text-cream max-w-[640px]">
            Great companies
            <br className="hidden lg:block" />
            &nbsp;deserve great websites.
          </h1>

          <p className="text-body max-w-[560px] text-cream/70">
            We design and build high-performance websites that make ambitious companies look as good
            as they are. Pixel-perfect, conversion-focused, and shipped 10X faster than a
            traditional agency.
          </p>

          <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us
            </Button>
            <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/projects">
              See the work
            </Button>
          </div>
        </Reveal>

        {/* Browser mockup */}
        <div className="relative w-full max-w-[1044px] overflow-hidden rounded-xl border border-black/10 shadow-[0_100px_40px_rgba(0,0,0,0.16),0_22px_9px_rgba(0,0,0,0.24),0_7px_3px_rgba(0,0,0,0.03)]">
          {/* Chrome bar */}
          <div className="flex h-14 shrink-0 items-center justify-between bg-white px-6">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex items-center gap-3 font-sans text-lg text-ink/30">
                <span>‹</span>
                <span>›</span>
              </div>
            </div>

            <div className="mx-6 flex h-7 flex-1 max-w-[480px] items-center justify-center gap-1.5 rounded-lg bg-[#f1f1f1] px-3">
              <svg
                width="12"
                height="14"
                viewBox="0 0 12 14"
                fill="none"
                className="shrink-0 text-ink/40"
              >
                <path
                  d="M6 0C4.07 0 2.5 1.57 2.5 3.5V5H1v8h10V5H9.5V3.5C9.5 1.57 7.93 0 6 0zm0 1.5C7.1 1.5 8 2.4 8 3.5V5H4V3.5C4 2.4 4.9 1.5 6 1.5z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-sans text-xs text-ink/60">https://jupiter.money/</span>
            </div>

            <div className="flex items-center gap-4 text-ink/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2L10 7H15L11 10L12.5 15L8 12L3.5 15L5 10L1 7H6L8 2Z" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2z" opacity=".25" />
                <path d="M5 6h6v1H5zm0 3h4v1H5z" />
              </svg>
            </div>
          </div>

          {/* Website screenshot */}
          <div className="relative h-[340px] overflow-hidden bg-[#f0efe9] lg:h-[556px]">
            <Image
              src="/images/projects/7Ql5MP7u1jXJ69ZQUw5e7o1tMU.png"
              alt="Polygon – client website preview"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1044px) 100vw, 1044px"
              priority
            />
          </div>
        </div>

        {/* Brands strip */}
        <div className="flex w-full flex-wrap items-center justify-center gap-x-0 gap-y-4 pb-8 pt-6">
          <span className="shrink-0 text-body text-cream/50 whitespace-nowrap px-6">
            Trusted by teams at
          </span>
          <div className="mx-2 h-5 w-px shrink-0 bg-cream/25" />
          {heroBrands.map((b) => (
            <div
              key={b.id}
              className="relative mx-5 h-4 w-[80px] shrink-0 opacity-40 brightness-0 invert lg:mx-6 lg:w-[90px]"
            >
              <Image src={b.src} alt={b.alt} fill className="object-contain" sizes="90px" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
