import Link from 'next/link'
import Image from 'next/image'
import type { GalleryItem } from '@/data/gallery'

type GalleryCardProps = { item: GalleryItem }

export function GalleryCard({ item }: GalleryCardProps) {
  return (
    <Link
      href={`/gallery/${item.slug}`}
      className="group mb-2.5 block break-inside-avoid"
      aria-label={item.alt ?? item.slug}
    >
      <figure
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
        className="relative w-full overflow-hidden rounded-[12px] bg-bone shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
      >
        {item.kind === 'video' ? (
          <video
            src={item.src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={item.src}
            alt={item.alt ?? ''}
            fill
            sizes="(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </figure>
    </Link>
  )
}
