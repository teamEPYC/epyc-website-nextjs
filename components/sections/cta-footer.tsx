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

export function CTAFooter() {
  return (
    <section className="relative w-full overflow-hidden bg-grey-primary px-6 py-12">
      <Container width="outer" className="relative">
        <Reveal className="flex  w-full flex-col  gap-12">
          {/* Top CTA strip */}
          <div className="flex flex-row flex-none content-center justify-center items-center gap-[50px] w-[1150px] mx-auto w-full h-min p-0 relative overflow-hidden">
            <div className="relative hidden h-[306px] w-[216px] overflow-hidden border-r border-cream/40 lg:block">
              <Image
                src="/images/site/rV5jBk0jBJfsfnlEdgFHud9abY.webp"
                alt=""
                fill
                loading="eager"
                sizes="216px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <p className="text-body uppercase text-cream/80">/Start Your Project/</p>
              <SectionHeading tone="cream" size="h2" as="h2">
                Its Time, We Create
              </SectionHeading>
              <Button variant="filled" icon="arrow-right" href="/contact">
                Let&apos;s Talk
              </Button>
            </div>

            <div className="relative hidden h-[306px] w-[216px] overflow-hidden border-l border-cream/40 lg:block">
              <Image
                src="/images/site/c7C4RZlnVXgsMtYKORFY3DNffs.webp"
                alt=""
                fill
                loading="eager"
                sizes="216px"
                className="object-cover"
              />
            </div>
          </div>

          <DashedDivider />

          {/* Footer columns */}
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

            {/* Pronounce row */}
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
