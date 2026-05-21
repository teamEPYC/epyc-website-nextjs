import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  href: string
  children: ReactNode
  className?: string
}

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

/**
 * Inline link for use inside testimonial quotes (and other cream-on-dark
 * copy). Stays cream like the surrounding text, underlined, and fades on
 * hover. Internal hrefs route through next/link; external hrefs open in a
 * new tab.
 */
export function QuoteLink({ href, children, className }: Props) {
  const classes = cn(
    'text-cream underline underline-offset-[3px] transition-opacity hover:opacity-75',
    className,
  )

  if (isInternal(href)) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {children}
    </a>
  )
}
