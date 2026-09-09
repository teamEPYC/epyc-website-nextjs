import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Sparkle } from '@/components/icons'

/**
 * The live crawl log, shared by every free tool.
 *
 * All of them POST the same `/api/tools/crawl` route and read the same SSE
 * events, so the screen that renders those events is genuinely identical — it
 * was lifted out of `chatbot-tool.tsx` when the llms.txt generator needed it.
 *
 * The URL screen either side of it is deliberately NOT shared: each tool asks
 * a different question and gives away a different thing, so sharing it would
 * mean four copy props and a component that reads as a template. See
 * docs/llms-txt-plan.md → Order of work.
 */

export type CrawledPage = { url: string; title: string }

/**
 * The host to label a tool screen with, from whatever the visitor typed.
 *
 * Beside `CrawledPage` because every crawling tool needs it and each had its
 * own: one parsed a URL, one split the string, and they disagreed on a typed
 * address with a port or a path. Parsing wins — the string split kept `:8080`
 * in one and dropped it in the other.
 */
export function hostOf(input: string): string {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).host
  } catch {
    return input.trim().replace(/^https?:\/\//i, '').split('/')[0] || 'your site'
  }
}

export function CrawlLog({
  host,
  status,
  pages,
  total,
  heading = 'Reading your site',
  footnote = 'Only pages your robots.txt allows, up to 20, capped at 20 seconds. We stop early rather than hammer your server.',
}: {
  host: string
  status: string
  pages: CrawledPage[]
  total: number
  heading?: string
  footnote?: string
}) {
  const pct = total ? Math.round((pages.length / total) * 100) : 8

  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="flex flex-col gap-14 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6 sm:gap-8">
            <SectionHeading tone="cream" size="h2" eyebrow={host}>
              {heading}
            </SectionHeading>
            <div className="flex items-baseline gap-2">
              <span className="text-display text-crimson">
                {String(pages.length).padStart(2, '0')}
              </span>
              <span className="text-h2 text-cream/35">/ {total || 20}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-0.5 w-full overflow-hidden rounded-pill bg-cream/15">
              <div
                className="h-full rounded-pill bg-crimson transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 text-body text-cream">
                <Sparkle size={12} className="shrink-0 text-crimson" />
                {status || 'Getting started'}
              </span>
              <span className="text-body-sm text-cream/60">
                {total ? `${pages.length} of ${total} pages` : 'Looking for your sitemap'}
              </span>
            </div>
          </div>

          <ul className="flex flex-col" aria-live="polite">
            {pages.map((p, i) => {
              const latest = i === pages.length - 1
              return (
                <li
                  key={`${p.url}-${i}`}
                  className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-cream/10 py-4"
                >
                  <Sparkle
                    size={12}
                    className={cn('shrink-0', latest ? 'text-crimson' : 'text-cream/35')}
                  />
                  <span
                    className={cn(
                      'text-code break-all sm:min-w-[200px]',
                      latest ? 'text-cream' : 'text-cream/55',
                    )}
                  >
                    {p.url}
                  </span>
                  <span className="text-body min-w-0 flex-1 truncate text-cream/60">{p.title}</span>
                </li>
              )
            })}
          </ul>

          <p className="text-body-sm max-w-[560px] text-cream/45">{footnote}</p>
        </div>
      </Container>
    </Section>
  )
}
