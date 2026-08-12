import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The 54px crimson circle used to mark steps, outcomes and formats. Defaults to
 * the numbered treatment (`text-body` cream — Figma uses white, and cream is the
 * palette's lightest surface); pass a glyph as `children` and recolour via
 * `className` for the icon variant.
 *
 * Unrelated to `<Badge>` (components/ui/badge.tsx), which is the outlined
 * text+icon pill used in the hero trust row.
 */
export function Disc({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full bg-crimson',
        'text-body leading-none text-cream',
        className,
      )}
    >
      {children}
    </span>
  )
}
