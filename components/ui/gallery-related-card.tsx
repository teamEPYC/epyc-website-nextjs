import Link from 'next/link'
import Image from 'next/image'
import { titleFromSlug, type GalleryItem } from '@/data/gallery'

type GalleryRelatedCardProps = { item: GalleryItem }

export function GalleryRelatedCard({ item }: GalleryRelatedCardProps) {
  const title = item.title ?? titleFromSlug(item.slug)

  return (
    <Link
      href={`/gallery/${item.slug}`}
      className="group block"
      aria-label={title}
    >
      <figure className="relative aspect-video w-full overflow-hidden rounded-[12px] bg-bone shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]">
        {item.kind === 'video' ? (
          <video
            src={item.src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : item.src ? (
          <Image
            src={item.src}
            alt={item.alt ?? ''}
            fill
            sizes="(min-width: 1200px) 25vw, (min-width: 810px) 33vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </figure>
      <div className="mt-3 flex flex-col gap-1">
        <h4 className="text-body-lg text-ink">{title}</h4>
        {item.designers?.length ? (
          <p className="text-body text-ink/60">{item.designers.join(', ')}</p>
        ) : null}
      </div>
    </Link>
  )
}
