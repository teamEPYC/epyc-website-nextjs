import Link from 'next/link'
import Image from 'next/image'
import { SiteNav } from '@/components/site-nav'
import { SectionHeading } from '@/components/ui/section-heading'
import { DotLineDivider } from '@/components/ui/dot-line-divider'
import { GalleryRelatedCard } from '@/components/ui/gallery-related-card'
import { titleFromSlug, type GalleryItem } from '@/data/gallery'

type GalleryDetailProps = {
  item: GalleryItem
  related: GalleryItem[]
}

export function GalleryDetail({ item, related }: GalleryDetailProps) {
  const title = item.title ?? titleFromSlug(item.slug)
  const description = item.description ?? 'A piece from the EPYC archive.'

  return (
    <section className="w-full bg-beige p-4">
      <div className="flex flex-col items-center gap-12 border-t border-r border-l border-ink px-4 py-8 sm:px-6 sm:py-10 lg:gap-16">
        <SiteNav className="self-stretch -mx-4 -mt-8 sm:-mx-6 sm:-mt-10" />
        <div className="flex flex-col gap-10 w-full items-center">
          <div className="flex w-full items-center justify-start max-w-[90%] mx-auto">
            <Link href="/gallery" className="text-body-lg text-ink underline underline-offset-2">
              BACK
            </Link>
          </div>
        </div>

        <div className="grid  w-[90%] max-w-outer mx-auto gap-8 lg:grid-cols-2 lg:gap-[30px]">
          <figure
            className="relative w-full overflow-hidden rounded-[12px] bg-bone shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            style={item.kind === 'image' ? { aspectRatio: item.width / item.height } : undefined}
          >
            {item.kind === 'video' ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-square w-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt ?? title}
                fill
                sizes="(min-width: 1200px) 45vw, (min-width: 810px) 50vw, 90vw"
                className="object-cover"
                priority
              />
            )}
          </figure>

          <div className="flex flex-col gap-8">
            <h1 className="text-display text-ink leading-[1.1em]">{title}</h1>

            {item.designers?.length ? (
              <div className="flex flex-col gap-1">
                <p className="text-body text-ink/60">Designer :</p>
                <p className="text-body text-ink">{item.designers.join(', ')}</p>
              </div>
            ) : null}

            {item.previewLink ? (
              <a
                href={item.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body text-ink underline underline-offset-4 w-fit"
              >
                Preview Link
              </a>
            ) : null}

            <p className="text-body-lg text-ink">{description}</p>
          </div>
        </div>
        <DotLineDivider className="max-w-[90%] mx-auto" />

        <div className="flex w-full max-w-[90%] flex-col gap-10">
          <SectionHeading as="h3" size="h3" tone="ink">
            More Works
          </SectionHeading>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {related.map((r) => (
              <GalleryRelatedCard key={r.slug} item={r} />
            ))}
          </div>
        </div>

        <DotLineDivider className="max-w-[90%] mx-auto" />
      </div>
    </section>
  )
}
