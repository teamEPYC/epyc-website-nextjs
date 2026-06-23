import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Sparkle } from '@/components/icons/sparkle'

type BlogCardProps = {
  href: string
  title: ReactNode
  image: {
    src: string
    alt: string
    width: number
    height: number
    focalX?: number
    focalY?: number
  }
  date?: string
  readTime?: string
  publishedAt?: string
  className?: string
}

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

export function BlogCard({
  href,
  title,
  image,
  date,
  readTime,
  publishedAt,
  className,
}: BlogCardProps) {
  const internal = isInternal(href)
  const Wrapper = internal ? Link : 'a'
  const wrapperProps = internal
    ? { href }
    : ({ href, target: '_blank', rel: 'noopener noreferrer' } as const)

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className={cn(
        'group flex w-full flex-col gap-2.5 no-underline',
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-cream">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1200px) 540px, (min-width: 810px) 380px, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          style={
            image.focalX !== undefined && image.focalY !== undefined
              ? { objectPosition: `${image.focalX}% ${image.focalY}%` }
              : undefined
          }
        />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-h4-alt w-[90%] text-ink">{title}</h4>
        {(date || readTime) && (
          <div className="flex flex-row items-center gap-2.5 text-h5 uppercase text-ink">
            {date && (
              <time dateTime={publishedAt}>{date}</time>
            )}
            {date && readTime && <Sparkle size={14} className="shrink-0" />}
            {readTime && <span>{readTime}</span>}
          </div>
        )}
      </div>
    </Wrapper>
  )
}
