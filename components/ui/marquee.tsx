import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type MarqueeProps = {
  children: ReactNode
  className?: string
  /** Gap between items, in px. Default 64. */
  gap?: number
}

/**
 * Infinite horizontal auto-scroll strip. Renders `children` twice back-to-back
 * and animates the track by exactly -50% so the loop seam is invisible.
 * Pauses on hover and honours `prefers-reduced-motion` (see `.marquee-track`
 * in globals.css).
 */
export function Marquee({ children, className, gap = 64 }: MarqueeProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div className="marquee-track flex w-max shrink-0 items-center hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center" style={{ gap, paddingInlineEnd: gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap, paddingInlineEnd: gap }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
