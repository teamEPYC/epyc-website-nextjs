import Link from 'next/link'
import { EpycMark } from '@/components/icons/epyc-mark'
import { SectionHeading } from '@/components/ui/section-heading'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { GalleryCard } from '@/components/ui/gallery-card'
import { galleryItems } from '@/data/gallery'

export function GalleryIndex() {
  return (
    <section className="w-full bg-beige p-4">
      <div className="flex flex-col items-center gap-16 border-t border-r border-l border-ink px-4 py-8 sm:px-6 sm:py-10 lg:gap-24">
        <Link href="/" aria-label="EPYC home" className="flex w-[72px] items-center justify-center">
          <EpycMark className="h-auto w-full text-ink" />
        </Link>
        <div className="flex flex-col gap-10 items-center">
          <div className="flex w-full max-w-outer flex-col items-center gap-6">
            <SectionHeading
              as="h1"
              size="display"
              tone="ink"
              className="text-center leading-[1.1em]!"
            >
              Gallery
            </SectionHeading>
            <p className="text-body-lg text-center text-ink">
              Get into our minds and understand how we do the things we do
            </p>
          </div>
          <div className="w-full tablet:max-w-[90%]  tablet:mx-auto flex flex-col gap-10">
            {/* Masonry — CSS multi-column auto-balances varying-height items.
            Each card has break-inside-avoid + mb-2.5 to produce 10px gutters. */}
            <DotLineDivider />
            <div className="gap-2.5 columns-2 lg:columns-3">
              {galleryItems.map((item) => (
                <GalleryCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
