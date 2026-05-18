import { cn } from '@/lib/cn'

type DotLineDividerProps = {
  variant?: 'single' | 'split'
  className?: string
}

export function DotLineDivider({ variant = 'single', className }: DotLineDividerProps) {
  return (
    <div className={cn('flex w-full items-center', className)}>
      <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-crimson" />
      {variant === 'split' ? (
        <>
          <span aria-hidden className="h-px flex-1 bg-crimson" />
          <span aria-hidden className="w-3" />
          <span aria-hidden className="h-px flex-1 bg-crimson" />
        </>
      ) : (
        <span aria-hidden className="h-px flex-1 bg-crimson" />
      )}
      <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-crimson" />
    </div>
  )
}
