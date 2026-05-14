'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/cn'
import { Plus } from '@/components/icons/plus'
import { Minus } from '@/components/icons/minus'

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
        <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:w-[675px]">
          <span className="text-body-lg text-ink">{title}</span>
          <span className="text-body text-ink">{tags}</span>
        </span>
        <span className="flex items-center gap-2 text-body text-ink">
          MORE
          {open ? <Minus size={13} className="text-ink" /> : <Plus size={13} className="text-ink" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-8">
              {internal ? (
                <Link
                  href={href}
                  className="relative block h-[320px] w-full overflow-hidden lg:h-[740px]"
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
                  className="relative block h-[320px] w-full overflow-hidden lg:h-[740px]"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
