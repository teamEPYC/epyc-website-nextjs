import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Pill } from '@/components/ui/pill'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { PronounceButton } from '@/components/ui/pronounce-button'
import { footerColumns, pronunciationLines } from '@/data/nav'
import { site } from '@/data/site'

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = 'text-body text-cream/60 underline-offset-4 hover:text-cream transition-colors'
  if (isInternal(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  )
}

export function CTAFooterNew() {
  return (
    <section className="relative w-full overflow-hidden bg-grey-primary py-[60px] lg:py-[100px]">
      {/* Subtle smoke texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10 mix-blend-hard-light"
        style={{
          backgroundImage: "url('/images/site/4svPWouJqvqnznpkeku35FoPOY.webp')",
          backgroundSize: 'cover',
        }}
      />

      <Container width="content" className="relative z-10 flex flex-col gap-16">
        {/* CTA block */}
        <Reveal className="mx-auto flex w-full max-w-[706px] flex-col items-center gap-8 text-center">
          <Pill tone="cream-on-dark">Start your Project</Pill>

          <h2 className="text-h1 text-cream">
            Ready for a website that matches your product?
          </h2>

          <p className="text-body text-cream/60 max-w-[550px]">
            We take on three new clients a month, and one of those spots could be yours. Book a
            call — we&apos;ll review your goals and walk you through how we&apos;d approach the
            build. No pitch deck, no obligation.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us
            </Button>
            <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/projects">
              See the work
            </Button>
          </div>

          <p className="text-body text-cream/50 max-w-[326px]">
            Already have a site that&apos;s holding you back? See our website redesign work.
          </p>

          <p className="font-serif text-body text-cream/40">
            75+ companies served &middot; 4.9 / 5.0 &middot; Trusted by Polygon, Accel, Antler
          </p>
        </Reveal>

        {/* Divider */}
        <div className="h-px w-full bg-cream/10" />

        {/* Footer columns */}
        <Reveal className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-24">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
            {footerColumns.map((col, i) => (
              <ul key={i} className="flex flex-col gap-4">
                {col.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            ))}
          </div>

          {/* Pronounce + partner links */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <PronounceButton />
              <p className="text-body text-cream/60">How to pronounce EPYC?</p>
            </div>
            <ul className="flex flex-col gap-2 font-serif text-body text-cream/40 underline underline-offset-4">
              {pronunciationLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Divider + copyright */}
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-cream/10" />
          <p className="text-center font-plex-serif text-h5 text-cream/30">
            Copyright {site.legal.entity} {site.legal.year}
          </p>
        </div>
      </Container>
    </section>
  )
}
