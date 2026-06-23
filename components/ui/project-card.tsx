import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ProjectCardProps = {
  href: string
  title: ReactNode
  tags: string
  image: { src: string; alt: string; width: number; height: number } | null
  className?: string
  aspect?: 'wide' | 'tall'
  /** Preload this card's image (use for the first card in a list). */
  priority?: boolean
  /** Load this card's image eagerly — no lazy-loading. */
  eager?: boolean
}

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

export function ProjectCard({
  href,
  title,
  tags,
  image,
  className,
  aspect = 'wide',
  priority,
  eager,
}: ProjectCardProps) {
  const internal = isInternal(href)
  const Wrapper = internal ? Link : 'a'
  const wrapperProps = internal
    ? { href }
    : ({
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
      } as const)

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      className={cn(
        'group flex w-full flex-col gap-6 border-b border-ink/10 pb-8 no-underline transition-colors duration-200 hover:border-ink',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          image ? 'bg-cream' : 'bg-bone',
          aspect === 'wide' ? 'aspect-[16/9]' : 'aspect-[4/5]',
        )}
      >
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            loading={eager ? 'eager' : undefined}
            sizes="(min-width: 1200px) 780px, (min-width: 810px) 681px, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex min-h-[2.5rem] items-center justify-between px-4">
        <h4 className="text-h4-alt text-ink">{title}</h4>
        <p className="text-h5 uppercase text-ink/60">{tags}</p>
      </div>
    </Wrapper>
  )
}
