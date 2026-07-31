import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { DashedDivider } from '@/components/ui/dashed-divider'
import { Reveal } from '@/components/ui/reveal'
import { PronounceButton } from '@/components/ui/pronounce-button'
import { site } from '@/data/site'
import { PageCTAFooterForm } from './page-cta-footer-form'

const FOOTER_COLUMNS: { label: string; href: string }[][] = [
  [
    { label: 'Case Studies', href: '/projects' },
    { label: 'EPYC Labs', href: '/' },
    { label: 'Projects', href: '/projects' },
  ],
  [
    { label: 'Instagram', href: site.social.instagram },
    { label: 'Linkedin', href: site.social.linkedin },
    { label: 'Twitter', href: site.social.x },
  ],
  [
    { label: 'About Us', href: '/' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  ],
]

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = 'text-body text-cream underline-offset-4 hover:underline'
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

/**
 * Page-specific CTA + footer — distinct from the sitewide <CTAFooter />
 * (different copy, a redesign-work callout, and different footer link set),
 * matching the Figma frame for this page exactly.
 */
export function PageCTAFooter() {
  return (
    <section className="relative w-full overflow-hidden bg-grey-primary py-16 lg:py-24">
      <Container width="outer" className="relative">
        <Reveal className="flex flex-col gap-16">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div className="flex max-w-[598px] flex-col gap-8">
              <Badge tone="cream-on-dark" className="w-fit">
                Start your Project
              </Badge>
              <div className="flex flex-col gap-6">
                <h2 className="text-h1 text-cream">
                  Ready for a website that matches your product?
                </h2>
                <p className="max-w-[555px] text-body text-cream/80">
                  We take on three new clients a month, and one of those spots could be yours.
                  Book a call — we&apos;ll review your goals and walk you through how we&apos;d
                  approach the build. No pitch deck, no obligation.
                </p>
              </div>
              <DashedDivider />
              <p className="text-body text-cream/70">
                75+ companies served · 4.9 / 5.0 · Trusted by Polygon, Accel, Antler
              </p>
            </div>

            <div className="w-full lg:max-w-[480px] lg:justify-self-end">
              <PageCTAFooterForm />
            </div>
          </div>

          <DashedDivider />

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-24">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-24">
              {FOOTER_COLUMNS.map((col, i) => (
                <ul key={i} className="flex flex-col gap-3">
                  {col.map((link) => (
                    <li key={link.href + link.label}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <PronounceButton />
                <p className="text-body text-cream">How to pronounce EPYC?</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-cream underline underline-offset-4"
                >
                  /Webflow Professional Partner
                </a>
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-cream underline underline-offset-4"
                >
                  /Bubble Agency
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <DashedDivider />
            <p className="text-center font-plex-serif text-h5 text-cream/60">
              © {site.legal.year} {site.legal.entity}
            </p>
            <DashedDivider className="rotate-180" />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
