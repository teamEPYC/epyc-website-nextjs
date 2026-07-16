import { cn } from '@/lib/cn'

export type AiStat = { value: string; label: string }

/**
 * The AI-training stats row — a crimson `text-h2-light` value over a
 * `text-body-lg` label, three-up from `sm`. Shared by WhyEpyc and TrainedTeams,
 * which draw the same row from different data.
 *
 * Figma draws the value at 40px Rationalist Light; `text-h2-light` is the
 * closest token (31/38/48, same Light weight).
 */
export function AiStats({
  items,
  className,
}: {
  items: readonly AiStat[]
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
