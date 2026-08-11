import { cn } from '@/lib/cn'

export type Stat = { value: string; label: string }

/**
 * A row of stats — crimson `text-h2-light` value over a `text-body-lg` label,
 * three-up from `sm`. For light grounds; the case studies draw their metrics as
 * dark hairline-gridded tiles instead (see case-study/gokwik), which is a
 * different treatment, not a variant of this one.
 *
 * Figma draws the value at 40px Rationalist Light; `text-h2-light` is the
 * closest token (31/38/48, same Light weight).
 */
export function StatRow({
  items,
  className,
}: {
  items: readonly Stat[]
  className?: string
}) {
  return (
    <div className={cn('grid w-full grid-cols-1 gap-10 sm:grid-cols-3', className)}>
      {items.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left"
        >
          <p className="text-h2-light uppercase text-crimson">{s.value}</p>
          <p className="text-body-lg text-ink">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
