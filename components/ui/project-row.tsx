'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { ChevronRight } from '@/components/icons/chevron-right'

type ProjectRowProps = {
  href: string
  title: string
  tags: string
  image: { src: string; alt: string; width: number; height: number }
  defaultOpen?: boolean
  className?: string
}

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

export function ProjectRow({
  href,
  title,
  tags,
  image,
  defaultOpen = false,
  className,
}: ProjectRowProps) {
  const [open, setOpen] = useState(defaultOpen)
  const internal = isInternal(href)

  return (
    <div className={cn('border-b border-ink/10 py-8', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 text-left"
      >
        <span className="flex flex-col gap-2 w-[50%] sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <span className="text-base font-medium text-ink">{title}</span>
          <span className="text-h5 uppercase text-right text-ink/60">{tags}</span>
        </span>
        <span className="flex items-center gap-2 text-h5 uppercase text-ink/70">
          More
          <ChevronRight
            size={13}
            className={cn('transition-transform', open ? 'rotate-90' : 'rotate-0')}
          />
        </span>
      </button>
      {open ? (
        <div className="mt-6">
          {internal ? (
            <Link
              href={href}
              className="relative block aspect-[16/9] w-full overflow-hidden rounded-sm"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1200px) 1150px, 100vw"
                className="object-cover"
              />
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[16/9] w-full overflow-hidden rounded-sm"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1200px) 1150px, 100vw"
                className="object-cover"
              />
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}
