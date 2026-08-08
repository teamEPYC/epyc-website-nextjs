import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { DashedDivider } from '@/components/ui/dashed-divider'
import { Reveal } from '@/components/ui/reveal'
import { PronounceButton } from '@/components/ui/pronounce-button'
import { footerColumns, pronunciationLines } from '@/data/nav'
import { site } from '@/data/site'

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
 * About-page closing CTA + footer — same chrome as the sitewide `<CTAFooter />`
 * (dashed dividers, footer columns, pronounce row), but with the About page's
 * own headline/subheadline/CTA copy. `<CTAFooter />` doesn't expose those as
 * props, so this mirrors the precedent set by
 * `app/(my-app)/website-design-development/page-cta-footer.tsx`.
 */
export function AboutCTAFooter() {
  return (
    <section className="relative w-full overflow-hidden bg-grey-primary px-6 py-12">
      <Image
        src="/images/site/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        loading="eager"
        sizes="100vw"
        className="z-0 object-cover"
      />
      <Container width="outer" className="relative z-10">
        <Reveal className="flex w-full flex-col gap-12">
          <div className="mx-auto flex w-full max-w-[680px] flex-col items-center gap-6 py-10 text-center">
            <SectionHeading tone="cream" size="h1" as="h2">
              Your website should work as hard as you do
            </SectionHeading>
            <p className="max-w-lg text-body-lg text-cream/80">
              Tell us what you&apos;re building. We&apos;ll tell you what&apos;s possible.
            </p>
            <Button variant="filled" icon="arrow-right" href="/contact">
              Let&apos;s Talk
            </Button>
          </div>

          <DashedDivider />

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-24">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-24">
              {footerColumns.map((col, i) => (
                <ul key={i} className="flex flex-col gap-3">
                  {col.map((link) => (
                    <li key={link.href}>
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
              <ul className="flex flex-col gap-2 font-plex-serif text-body italic text-cream/70 underline underline-offset-4">
                {pronunciationLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
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
