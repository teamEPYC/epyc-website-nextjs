import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/badge'
import { Plus, Sparkle } from '@/components/icons'
import type { Verdict } from '@/lib/tools/site-checks'

/**
 * One scored dimension, as a card: name, verdict chip, headline, evidence.
 *
 * Shared by the free tools. Every one of them renders the same three
 * dimensions out of `lib/tools/site-checks.ts` — structure, crawlability,
 * specificity — so the component that draws them belongs beside the log rather
 * than inside whichever tool needed it first. Lifted out of
 * `chatbot-tool.tsx`, unchanged, when the llms.txt generator needed it.
 *
 * The chip is a `Badge` with a tone override rather than a hand-rolled span:
 * every component in this system takes `className` through `cn()` so the
 * caller's classes win, which is how a crimson or teal verdict reaches an
 * otherwise ink-on-light chip without inventing a fourth Badge tone.
 */

export type { Verdict }

/**
 * `ok` is only set where a check genuinely passes or fails — crawlability. The
 * other dimensions list evidence, not verdicts, so they get a quiet marker
 * instead of a tick that would imply a judgement per line.
 */
export type Line = { text: string; note?: string; ok?: boolean }

export const VERDICT = {
  pass: { label: 'Passes', chip: 'border-teal-deep/40 text-teal-deep' },
  weak: { label: 'Weak', chip: 'border-ink/25 text-ink/70' },
  fail: { label: 'Needs work', chip: 'border-crimson/40 text-crimson' },
} as const

export function ScoreRow({
  name,
  verdict,
  headline,
  lines,
}: {
  name: string
  verdict: Verdict
  headline: string
  lines: Line[]
}) {
  const v = VERDICT[verdict]

  return (
    <div className="flex min-w-0 flex-col gap-5 rounded-sm border border-ink/12 bg-beige p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-h4-alt text-ink">{name}</h4>
        <Badge tone="ink-on-light" className={cn('px-4 py-2', v.chip)}>
          {v.label}
        </Badge>
      </div>

      <p className="text-h3 text-ink">{headline}</p>

      {lines.length > 0 && (
        <ul className="flex flex-col gap-3 border-t border-ink/12 pt-5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-3">
              {line.ok === undefined ? (
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ink/40"
                />
              ) : line.ok ? (
                <Sparkle size={12} className="mt-1.5 shrink-0 text-ink/45" />
              ) : (
                <Plus size={14} className="mt-1.5 shrink-0 rotate-45 text-crimson" />
              )}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-body break-words text-ink/80">{line.text}</span>
                {line.note && <span className="text-body-sm text-ink/50">{line.note}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
