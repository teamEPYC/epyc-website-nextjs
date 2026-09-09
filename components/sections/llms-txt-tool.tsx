'use client'

import { useEffect, useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { CrawlLog, hostOf } from '@/components/tools/crawl-log'
import { ToolNav } from '@/components/tools/tool-nav'
import { ToolSteps, type ToolStep } from '@/components/tools/tool-steps'
import { ToolWindow, TOOL_WINDOW_BODY, downloadText, useCopy } from '@/components/tools/tool-window'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Field, Input } from '@/components/ui/form'
import { PaperBackground } from '@/components/ui/paper-background'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { FourPointStar, Sparkle } from '@/components/icons'
import { useCrawl } from '@/lib/tools/use-crawl'

/**
 * The llms.txt generator: paste a URL, we read the site, you get the file.
 *
 * Wired to POST /api/tools/crawl (SSE, shared with the chatbot tool) and
 * POST /api/tools/llms-txt/generate (plain JSON).
 *
 * The file is the giveaway; the pages we could not describe are the pitch. So
 * the result screen leads with the file — they came for that — and puts the
 * skipped pages directly under it, where they read as a consequence of their
 * own copy rather than as a scolding.
 *
 * Nothing is stored: the generated file lives here in state for the session,
 * and Download is a client-side Blob. See docs/llms-txt-architecture.md §2.3.
 *
 * Plan: docs/llms-txt-plan.md · Architecture: docs/llms-txt-architecture.md
 */

type Phase = 'idle' | 'crawling' | 'generating' | 'result' | 'empty' | 'blocked'

type Result = {
  host: string
  file: string
  /** `read` = `described` + `skipped` + `excluded`. Every screen below shows all four. */
  stats: { read: number; pages: number; described: number; skipped: number; excluded: number }
  skipped: { url: string; title: string }[]
}

const NO_STATS = { read: 0, pages: 0, described: 0, skipped: 0, excluded: 0 }

export function LlmsTxtTool() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { status, pages, total, start: crawl } = useCrawl('llms-txt')

  const [result, setResult] = useState<Result | null>(null)

  async function start(force = false) {
    setError(null)
    setResult(null)
    setPhase('crawling')

    await crawl(url, {
      force,
      onError: (message) => {
        setError(message)
        setPhase('idle')
      },
      onDone: (data) => {
        const state = String(data.status)
        if (state === 'ready') void generate(String(data.sessionId))
        else if (state === 'empty') setPhase('empty')
        else setPhase('blocked')
      },
    })
  }

  async function generate(sessionId: string) {
    setPhase('generating')

    try {
      const res = await fetch('/api/tools/llms-txt/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const body = (await res.json()) as Partial<Result> & { ok?: boolean; error?: string }

      if (!res.ok || !body.ok || !body.file) {
        setError(body.error ?? 'We couldn’t write your file just now.')
        setPhase('idle')
        return
      }

      setResult({
        host: body.host ?? hostOf(url),
        file: body.file,
        stats: body.stats ?? NO_STATS,
        skipped: body.skipped ?? [],
      })
      setPhase('result')
    } catch {
      setError('We couldn’t write your file just now. Try again shortly.')
      setPhase('idle')
    }
  }

  // Every screen is a swap, not a navigation, so the browser keeps the old
  // scroll position. Each phase starts where it should.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      {/* The result screen renders its own nav inside its `<PaperBackground>`,
          so the texture runs behind it unbroken — an ink nav stacked above one
          shows a band of flat green and a visible seam. */}
      {phase !== 'idle' && phase !== 'result' && <ToolNav tone="ink" />}

      {phase === 'idle' && (
        <IdleScreen url={url} error={error} onChange={setUrl} onSubmit={() => void start()} />
      )}

      {phase === 'crawling' && (
        <CrawlLog host={hostOf(url)} status={status} pages={pages} total={total} />
      )}

      {phase === 'generating' && <GeneratingScreen host={hostOf(url)} pages={pages.length} />}

      {phase === 'result' && result && (
        <ResultScreen result={result} onAgain={() => void start(true)} />
      )}

      {phase === 'empty' && (
        <DeadEnd
          host={hostOf(url)}
          heading="There is nothing here to describe"
          body="We reached your site but found almost no readable text. The pages are built by JavaScript after they load, so an assistant reading your HTML — which is what every one of them does — sees an empty document. No llms.txt can fix that; the pages have to render their words on the server."
          onRetry={() => void start(true)}
        />
      )}

      {phase === 'blocked' && (
        <DeadEnd
          host={hostOf(url)}
          heading="We were not allowed in"
          body="Your robots.txt blocks automated readers from every page, or the site did not respond. We stopped rather than work around it. An llms.txt would not be read either, for the same reason."
          onRetry={() => void start(true)}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ helpers */

function pathOnly(url: string): string {
  try {
    return new URL(url).pathname || '/'
  } catch {
    return url
  }
}

/* --------------------------------------------------------------- 1. Idle */

const HOW_IT_WORKS: ToolStep[] = [
  ['01', 'We read it', 'Up to 20 pages of your site, the way an AI assistant would — text only, no rendering.'],
  ['02', 'We write the file', 'An overview of what you do, your pages in the order that matters, and one honest sentence each — quoted from your own copy.'],
  ['03', 'You see the gaps', 'Every page we could not describe, because your own text never says what it is for.'],
]

function IdleScreen({
  url,
  error,
  onChange,
  onSubmit,
}: {
  url: string
  error: string | null
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  return (
    <>
      <PaperBackground gradient="bottom" className="min-h-[100svh] p-3 text-cream sm:p-4">
        <div className="flex min-h-[calc(100svh-1.5rem)] flex-col border-l border-r border-t border-beige sm:min-h-[calc(100svh-2rem)]">
          <SiteNav />
          <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center sm:gap-8">
            <Pill tone="cream-on-dark">Free · No signup · About 30 seconds</Pill>

            <h1 className="text-display max-w-[900px] text-balance text-cream">
              Generate your llms.txt
            </h1>

            <p className="text-body-lg max-w-[640px] text-beige">
              Paste your address. We read up to 20 pages, write you a ready-to-publish{' '}
              <span className="text-code">llms.txt</span>, and show you every page whose own words
              never said what it was for.
            </p>

            <form
              className="flex w-full max-w-[680px] flex-col gap-3 sm:flex-row"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <Field label="Your website address" className="flex-1">
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="yourcompany.com"
                  value={url}
                  invalid={Boolean(error)}
                  onChange={(e) => onChange(e.target.value)}
                  autoComplete="url"
                />
              </Field>
              <Button type="submit" variant="filled" icon="arrow-right" className="h-16 shrink-0">
                Write my file
              </Button>
            </form>

            {error ? (
              <p role="alert" className="text-body-sm text-crimson">
                {error}
              </p>
            ) : (
              <p className="text-body-sm text-cream/60">
                We only read pages your robots.txt allows. Nothing is published anywhere.
              </p>
            )}
          </Container>
        </div>
      </PaperBackground>

      <ToolSteps steps={HOW_IT_WORKS} />

      <Section tone="cream">
        <Container>
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 py-4 lg:flex-row lg:items-end lg:gap-15">
              <div className="flex max-w-[680px] flex-col gap-5">
                <SectionHeading tone="ink" size="h2" eyebrow="What this is">
                  A map of your site, for machines
                </SectionHeading>
                <p className="text-body-lg text-ink/70">
                  <span className="text-code">llms.txt</span> is a proposed convention: one markdown
                  file at your web root listing the pages that matter and what each one says. Your
                  sitemap lists every URL and explains none of them. This explains them.
                </p>
                <p className="text-body text-ink/60">
                  It is a convention, not a standard — no model provider has confirmed reading it
                  yet, and we will not pretend otherwise. The reason to run this is the second half:
                  writing the file is what exposes the pages your site never describes.
                </p>
              </div>
              <FourPointStar size={40} className="hidden shrink-0 text-crimson lg:block" />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}

/* --------------------------------------------------------- 2. Generating */

function GeneratingScreen({ host, pages }: { host: string; pages: number }) {
  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="flex flex-col gap-8 py-16">
          <SectionHeading tone="cream" size="h2" eyebrow={host}>
            Writing your file
          </SectionHeading>

          <p className="text-body-lg max-w-[620px] text-cream/70">
            Reading {pages} {pages === 1 ? 'page' : 'pages'} and writing one honest sentence about
            each. Where your copy does not say what a page is for, we leave it blank rather than
            invent something.
          </p>

          <span className="flex items-center gap-2.5 text-body text-cream">
            <Sparkle size={12} className="shrink-0 text-crimson" />
            This takes a few seconds
          </span>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------------- 3. Result */

function ResultScreen({ result, onAgain }: { result: Result; onAgain: () => void }) {
  const { file, stats, skipped, host } = result
  const { copied, copy } = useCopy(file)

  return (
    <>
      {/* The file is handed back in the same window frame the transcript
          generator uses — both tools end in "here is the thing, take it away",
          and the window is what makes that read as a file you own rather than a
          panel of a marketing page. */}
      <PaperBackground className="text-cream">
        <ToolNav tone="transparent" />
        <Section tone="transparent">
          <Container>
            <div className="flex flex-col gap-8 py-6">
              <SectionHeading tone="cream" size="h2" eyebrow={host}>
                Your llms.txt
              </SectionHeading>

              <div className="flex flex-wrap items-end justify-between gap-6">
                <p className="text-body-lg max-w-[680px] text-cream/70">
                  Save this as <span className="text-code">llms.txt</span> at the root of your site,
                  so it answers at <span className="text-code">{host}/llms.txt</span>.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" data-on-dark="true" size="md" onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="filled" size="md" onClick={() => downloadText(file, 'llms.txt', 'text/markdown;charset=utf-8')}>
                    Download
                  </Button>
                </div>
              </div>

              {/* No toolbar: this tool has nothing to switch. One file, one
                  format — a bare strip would read as a control that failed. */}
              <ToolWindow
                filename="llms.txt"
                status={[
                  `${stats.read} ${stats.read === 1 ? 'page' : 'pages'} read`,
                  `${stats.described} described`,
                  stats.skipped > 0 ? `${stats.skipped} skipped` : null,
                  stats.excluded > 0 ? `${stats.excluded} not listed` : null,
                ]}
              >
                {/* The file, verbatim. Horizontal scroll rather than wrapping:
                    a wrapped markdown bullet reads as a broken one. */}
                <div className={TOOL_WINDOW_BODY}>
                  <pre className="text-code text-ink">{file}</pre>
                </div>
              </ToolWindow>
            </div>
          </Container>
        </Section>
      </PaperBackground>

      {/* The finding. Directly under the file, because it is a property of the
          file — these are the lines that are missing from it. */}
      {skipped.length > 0 && (
        <Section tone="ink">
          <Container>
            <div className="flex flex-col gap-10 py-6">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading tone="cream" size="h2" eyebrow="The gap">
                  We could not describe {stats.skipped} of your {stats.pages} pages
                </SectionHeading>
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-crimson">
                    {String(stats.described).padStart(2, '0')}
                  </span>
                  <span className="text-h2 text-cream/35">/ {stats.pages}</span>
                </div>
              </div>

              <p className="text-body-lg max-w-[680px] text-cream/70">
                A page earns a line in this file when its own words say what it is for. These ones
                did not, so we left them out rather than guess. That is the same thing an assistant
                does when a buyer asks it about you.
                {stats.excluded > 0 && (
                  <>
                    {' '}
                    {/* Named here so the counts on the file add up in the open. */}
                    Another {stats.excluded} {stats.excluded === 1 ? 'address' : 'addresses'} —
                    tag pages, paginated archives and duplicates — were left out on purpose; they
                    are not pages a reader needs.
                  </>
                )}
              </p>

              <ul className="flex flex-col">
                {skipped.map((page) => (
                  <li
                    key={page.url}
                    className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-cream/12 py-4"
                  >
                    <Sparkle size={12} className="shrink-0 text-crimson" />
                    <span className="text-code break-all text-cream sm:min-w-[220px]">
                      {pathOnly(page.url)}
                    </span>
                    <span className="text-body min-w-0 flex-1 truncate text-cream/55">
                      {page.title || 'No title'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="beige">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 py-4">
            <p className="text-body max-w-[520px] text-ink/60">
              Changed something on your site? We can read it again — the file is rewritten from
              scratch.
            </p>
            <Button variant="outline" size="md" onClick={onAgain}>
              Read my site again
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------ 4. Dead ends */

function DeadEnd({
  host,
  heading,
  body,
  onRetry,
}: {
  host: string
  heading: string
  body: string
  onRetry: () => void
}) {
  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="flex max-w-[720px] flex-col gap-8 py-16">
          <SectionHeading tone="cream" size="h2" eyebrow={host}>
            {heading}
          </SectionHeading>

          <p className="text-body-lg text-cream/70">{body}</p>

          <div className="flex flex-wrap gap-3">
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us about it
            </Button>
            <Button variant="outline" data-on-dark="true" onClick={onRetry}>
              Try again
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
