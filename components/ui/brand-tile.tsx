import Image from 'next/image'
import { cn } from '@/lib/cn'

type BrandTileProps = {
  src: string
  alt: string
  className?: string
}

export function BrandTile({ src, alt, className }: BrandTileProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={290}
      height={290}
      className="object-cover w-full h-full object-center rounded-sm"
    />
  )
}
