import Link from 'next/link'
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badge = cva(
  'inline-flex items-center gap-3 rounded-pill border border-cream-light px-6 py-4 text-body-sm transition-colors',
  {
    variants: {
      tone: {
        'cream-on-dark': 'border-cream text-cream',
        'ink-on-light': 'border-ink/15 text-ink',
      },
    },
    defaultVariants: { tone: 'cream-on-dark' },
  },
)

// Hover feedback only makes sense when the badge is an actual link — applied
// separately from the base tone so the non-interactive `<span>` render path
// (eyebrow labels like "The problem", "How we work") never gets a hover state.
const hoverByTone = {
  'cream-on-dark': 'hover:bg-cream/10',
  'ink-on-light': 'hover:bg-ink/5',
} as const

type CommonProps = VariantProps<typeof badge> & {
  icon?: ReactNode
  className?: string
  children: ReactNode
}

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    href: string
  }

type StaticProps = CommonProps &
  Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'> & {
    href?: undefined
  }

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

export function Badge(props: AnchorProps | StaticProps) {
  const { tone, icon, className, children, ...rest } = props
  const resolvedTone = tone ?? 'cream-on-dark'
  const classes = cn(badge({ tone }), className, '')
  const interactiveClasses = cn(badge({ tone }), hoverByTone[resolvedTone], className, '')
  const content = (
    <>
      {icon ? <span className="flex shrink-0 items-center">{icon}</span> : null}
      <span>{children}</span>
    </>
  )

  if ('href' in rest && rest.href !== undefined) {
    const { href, target, rel, ...anchorRest } = rest as AnchorProps
    if (isInternal(href)) {
      return (
        <Link href={href} className={interactiveClasses} target={target} rel={rel} {...anchorRest}>
          {content}
        </Link>
      )
    }
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        className={interactiveClasses}
        {...anchorRest}
      >
        {content}
      </a>
    )
  }

  const spanRest = rest as StaticProps
  return (
    <span className={classes} {...spanRest}>
      {content}
    </span>
  )
}
