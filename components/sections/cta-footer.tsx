import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { DashedDivider } from "@/components/ui/dashed-divider";
import { Reveal } from "@/components/ui/reveal";
import { Play } from "@/components/icons/play";
import { footerColumns, pronunciationLines } from "@/data/nav";
import { site } from "@/data/site";

function isInternal(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "text-body text-cream underline-offset-4 hover:underline";
  if (isInternal(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}

export function CTAFooter() {
  return (
    <section className="relative w-full overflow-hidden bg-ink px-6 py-12">
      <Image
        src="https://framerusercontent.com/images/kyS26IYlxhpf1ogFNR9ihcWa8Q.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />
      <Container width="outer" className="relative">
        <Reveal className="flex flex-col items-stretch gap-12">
          {/* Top CTA strip */}
          <div className="grid gap-8 lg:grid-cols-[216px_1fr_216px] lg:items-stretch lg:gap-12">
            <div className="relative hidden h-[306px] w-[216px] overflow-hidden border-r border-cream/40 lg:block">
              <Image
                src="https://framerusercontent.com/images/rV5jBk0jBJfsfnlEdgFHud9abY.webp"
                alt=""
                fill
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
                src="https://framerusercontent.com/images/c7C4RZlnVXgsMtYKORFY3DNffs.webp"
                alt=""
                fill
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
                <IconButton tone="ink" aria-label="How to pronounce EPYC" className="bg-ink/80 ring-1 ring-cream/30">
                  <Play size={18} />
                </IconButton>
                <p className="text-body text-cream">How to pronounce EPYC?</p>
              </div>
              <ul className="flex flex-col gap-2 font-plex-serif text-body italic text-cream/70 underline underline-offset-4">
                {pronunciationLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <DashedDivider />

          <p className="text-center font-plex-serif text-h5 text-cream/60">
            © {site.legal.year}  {site.legal.entity}
          </p>

          <DashedDivider className="rotate-180" />
        </Reveal>
      </Container>
    </section>
  );
}
