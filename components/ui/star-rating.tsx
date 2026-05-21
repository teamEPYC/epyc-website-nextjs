import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Star } from '@/components/icons/star'

type StarRatingProps = {
  score?: number
  outOf?: number
  showScore?: boolean
  logo?: ReactNode
  className?: string
  starClassName?: string
}

export function StarRating({
  score = 4.9,
  outOf = 5,
  showScore = true,
  logo,
  className,
  starClassName,
}: StarRatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {logo ? <span className="flex items-center">{logo}</span> : null}
      <span className="flex items-center gap-0.5">
        {Array.from({ length: outOf }).map((_, i) => (
          <Star key={i} size={14} className={cn('text-current', starClassName)} />
        ))}
      </span>
      {showScore ? (
        <span>
          {score.toFixed(1)}/{outOf.toFixed(1)}
        </span>
      ) : null}
    </span>
  )
}
