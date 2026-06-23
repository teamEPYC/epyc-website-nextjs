import { cn } from '@/lib/cn'
import { Sparkle } from '@/components/icons/sparkle'

type StampProps = {
  className?: string
  children?: React.ReactNode
}

export function Stamp({ className, children = 'OUR SERVICES' }: StampProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-crimson/50 p-3 px-4 bg-[#12271e] text-cream',
        className,
      )}
    >
      <div className="flex items-center gap-2.5 rounded-full bg-crimson p-4 px-6">
        <Sparkle size={21} className="text-cream" />
        <span className="text-body whitespace-nowrap uppercase tracking-wide">{children}</span>
        <Sparkle size={21} className="text-cream" />
      </div>
    </div>
  )
}
