import { cn } from '@/lib/cn'
import { Sparkle } from '@/components/icons/sparkle'

type ServicesStampProps = {
  className?: string
  children?: React.ReactNode
}

/**
 * The centred crimson "OUR SERVICES" stamp from the Framer source —
 * 32px×42px padding, 43px radius, 16px ink border, with flanking sparkles.
 * Designed to be absolute-positioned over the centre of the 2×2 services grid.
 */
export function ServicesStamp({ className, children = 'OUR SERVICES' }: ServicesStampProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-crimson p-4 px-6 bg-ink text-cream',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 rounded-full bg-crimson p-4">
        <Sparkle size={21} className="text-cream" />
        <span className="text-body whitespace-nowrap uppercase tracking-wide">{children}</span>
        <Sparkle size={21} className="text-cream" />
      </div>
    </div>
  )
}
