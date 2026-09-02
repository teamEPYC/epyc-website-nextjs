'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { SiteNav } from '@/components/site-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Disc } from '@/components/ui/disc'
import { Field, Input, Textarea } from '@/components/ui/form'
import { PaperBackground } from '@/components/ui/paper-background'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { StatRow, type Stat } from '@/components/ui/stat-row'
import { FourPointStar, Plus, Sparkle } from '@/components/icons'
import { buyerQuestions, suggestedQuestions } from '@/data/buyer-questions'
import { readSSE } from '@/lib/tools/sse-client'

/**
 * The AI chatbot tool: paste a URL, we read the site, you get the report.
 *
 * Wired to POST /api/tools/chatbot/crawl and /message (both stream Server-Sent
 * Events), GET /api/tools/chatbot/diagnosis, and the verify + embed routes.
 *
 * The report comes BEFORE the chat: a crawl that lands `ready` goes straight to
 * the short report, which is the hook, and the chat and the widget are two ways
 * on from there. Nothing about the API changed for that — the diagnosis route
 * already scores on demand for a visitor who never sends a message.
 *
 * The three measured scores are stored when the crawl finishes, so they are
 * always ready. Answerability and Coverage are scored in the background; until
 * they land the report renders without them and polls briefly.
 */

type Phase = 'idle' | 'crawling' | 'report' | 'full' | 'chat' | 'widget' | 'empty' | 'blocked'

const MAX_MESSAGES = 8

type Msg = { from: 'bot' | 'you'; text: string; miss?: boolean; pending?: boolean }
type CrawledPage = { url: string; title: string }

type Verdict = 'pass' | 'weak' | 'fail'

type Diagnosis = {
  answerability: { answered: number; total: number; unanswered: { id: string; question: string }[] } | null
  coverage: { present: string[]; missing: string[] } | null
  structure: { verdict: Verdict; headline: string; evidence: string[] }
  crawlability: {
    verdict: Verdict
    headline: string
    checks: { label: string; pass: boolean; detail: string }[]
  }
  specificity: { verdict: Verdict; headline: string; examples: { quote: string; url: string }[] }
  partial: boolean
}

export function ChatbotTool() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState('')
  const [pages, setPages] = useState<CrawledPage[]>([])
  const [total, setTotal] = useState(0)

  const [session, setSession] = useState<{ id: string; host: string; pages: number } | null>(null)
  const [signals, setSignals] = useState<Record<string, unknown> | null>(null)

  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [used, setUsed] = useState(0)

  const threadEnd = useRef<HTMLDivElement>(null)

  // Fetched once for the session and shared by the short report and the full
  // one, so moving between them costs nothing.
  const { diagnosis, failed: diagnosisFailed } = useDiagnosis(session?.id ?? null)

  async function startCrawl(force = false) {
    const target = url.trim()
    if (!target) {
      setError('Enter a website address.')
      return
    }

    setError(null)
    setPages([])
    setTotal(0)
    setStatus('')
    setMessages([])
    setUsed(0)
    setSession(null)
    setPhase('crawling')

    try {
      const res = await fetch('/api/tools/chatbot/crawl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: target, force }),
      })

      // Validation and cap failures come back as plain JSON, not a stream.
      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const body = (await res.json()) as { error?: string }
        setError(body.error ?? 'Something went wrong.')
        setPhase('idle')
        return
      }

      await readSSE(res, (event, data) => {
        if (event === 'status') setStatus(String(data.message ?? ''))
        if (event === 'page') {
          setPages((p) => [...p, { url: String(data.url), title: String(data.title ?? '') }])
          setTotal(Number(data.total ?? 0))
        }
        if (event === 'error') {
          setError(String(data.message ?? 'We could not read that site.'))
          setPhase('idle')
        }
        if (event === 'done') {
          const host = hostOf(target)
          const readable = Number(data.readablePages ?? data.pages ?? 0)
          setSession({ id: String(data.sessionId), host, pages: Number(data.pages ?? 0) })
          setSignals((data.signals as Record<string, unknown>) ?? null)

          const st = String(data.status)
          if (st === 'ready') {
            // The report is the hook. The chat is one of the ways on from it.
            setPhase('report')
            setMessages([
              {
                from: 'bot',
                text: `I've read ${readable} pages of ${host}. Ask me anything a customer might ask.`,
              },
            ])
          } else if (st === 'empty') {
            setPhase('empty')
          } else {
            setPhase('blocked')
          }
        }
      })
    } catch {
      setError('We could not reach that site. Try another address.')
      setPhase('idle')
    }
  }

  async function send(text: string) {
    if (!session || sending || !text.trim()) return

    setDraft('')
    setSending(true)
    setMessages((m) => [...m, { from: 'you', text }, { from: 'bot', text: '', pending: true }])
    scrollSoon()

    try {
      const res = await fetch('/api/tools/chatbot/message', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, message: text }),
      })

      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const body = (await res.json()) as { error?: string; capped?: boolean }
        setMessages((m) => replaceLast(m, { from: 'bot', text: body.error ?? 'Something went wrong.' }))
        if (body.capped) setUsed(MAX_MESSAGES)
        return
      }

      let answer = ''
      await readSSE(res, (event, data) => {
        if (event === 'delta') {
          answer += String(data.text ?? '')
          setMessages((m) => replaceLast(m, { from: 'bot', text: answer, miss: looksLikeMiss(answer) }))
          scrollSoon()
        }
        if (event === 'error') {
          answer += `\n\n${String(data.message ?? '')}`
          setMessages((m) => replaceLast(m, { from: 'bot', text: answer }))
        }
        if (event === 'done') setUsed(Number(data.messagesUsed ?? 0))
      })
    } catch {
      setMessages((m) =>
        replaceLast(m, { from: 'bot', text: 'I lost that answer. Try asking again.' }),
      )
    } finally {
      setSending(false)
      scrollSoon()
    }
  }

  function scrollSoon() {
    requestAnimationFrame(() => threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }))
  }

  // Every screen is a swap, not a navigation, so the browser keeps the old
  // scroll position — leaving a visitor at the foot of a page they have not
  // seen the top of. Each phase starts where it should.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [phase])

  // Light phases get the ink nav; the report, chat and error states are dark.
  // The idle hero carries its own nav inside the paper frame, like the homepage.
  const navTone = phase === 'full' || phase === 'widget' ? 'beige' : 'ink'

  return (
    <>
      {phase !== 'idle' && <ToolNav tone={navTone} />}

      {phase === 'idle' && (
        <IdleScreen
          url={url}
          error={error}
          onChange={setUrl}
          onSubmit={() => void startCrawl()}
        />
      )}

      {phase === 'crawling' && (
        <CrawlingScreen host={hostOf(url)} status={status} pages={pages} total={total} />
      )}

      {phase === 'report' && session && (
        <ReportScreen
          host={session.host}
          pages={session.pages}
          diagnosis={diagnosis}
          failed={diagnosisFailed}
          onFull={() => setPhase('full')}
          onChat={() => setPhase('chat')}
          onWidget={() => setPhase('widget')}
          onRecrawl={() => void startCrawl(true)}
        />
      )}

      {phase === 'full' && session && (
        <FullReportScreen
          host={session.host}
          pages={session.pages}
          diagnosis={diagnosis}
          onBack={() => setPhase('report')}
          onRecrawl={() => void startCrawl(true)}
        />
      )}

      {phase === 'chat' && session && (
        <ChatScreen
          host={session.host}
          pages={session.pages}
          messages={messages}
          draft={draft}
          sending={sending}
          left={Math.max(0, MAX_MESSAGES - used)}
          threadEnd={threadEnd}
          onDraft={setDraft}
          onSend={send}
          onBack={() => setPhase('report')}
          onWidget={() => setPhase('widget')}
        />
      )}

      {phase === 'widget' && session && (
        <WidgetScreen
          sessionId={session.id}
          host={session.host}
          onBack={() => setPhase('report')}
        />
      )}

      {phase === 'empty' && (
        <EmptyScreen
          host={session?.host ?? hostOf(url)}
          signals={signals}
          pages={session?.pages ?? 0}
          onRetry={() => void startCrawl(true)}
        />
      )}

      {phase === 'blocked' && (
        <BlockedScreen host={hostOf(url)} signals={signals} onBack={() => setPhase('idle')} />
      )}
    </>
  )
}

/* ------------------------------------------------------------------ helpers */

/**
 * The nav bar on every screen but the hero, which carries its own inside the
 * paper frame. Tone follows the screen underneath it so the mark and links
 * inherit the right colour.
 */
function ToolNav({ tone }: { tone: 'ink' | 'beige' }) {
  return (
    <Section tone={tone} className="pb-0">
      <Container>
        <SiteNav className="self-stretch -mx-4 -mt-8 sm:-mx-6 sm:-mt-10 lg:-mx-15" />
      </Container>
    </Section>
  )
}

/**
 * The report for a session, polled until the judged half lands.
 *
 * Lifted out of the report screen so the short report and the full one share
 * one fetch — moving between them must not re-request or re-poll.
 */
function useDiagnosis(sessionId: string | null) {
  // The session id is stored WITH the result rather than cleared in the effect:
  // a stale report is discarded by comparing ids on read, so nothing has to
  // setState synchronously on the way in.
  const [state, setState] = useState<{
    id: string
    diagnosis: Diagnosis | null
    failed: boolean
  } | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const id = sessionId

    let cancelled = false
    let attempts = 0

    async function load() {
      try {
        const res = await fetch(`/api/tools/chatbot/diagnosis?sessionId=${id}`)
        const body = (await res.json()) as { ok: boolean; diagnosis?: Diagnosis }
        if (cancelled) return

        const d = body.diagnosis
        // A diagnosis missing its measured half would take the page down when
        // rendered. Those three are written when the crawl finishes, so their
        // absence means something is wrong upstream.
        const complete = Boolean(d?.structure && d.crawlability && d.specificity)

        if (body.ok && d && complete) {
          setState({ id, diagnosis: d, failed: false })
          // Scoring takes ~20s against a full corpus, so poll for ~40s before
          // giving up and leaving the three measured scores on screen.
          if (d.partial && attempts < 20) {
            attempts++
            setTimeout(load, 2000)
          }
        } else {
          setState({ id, diagnosis: null, failed: true })
        }
      } catch {
        if (!cancelled) setState({ id, diagnosis: null, failed: true })
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const fresh = state && state.id === sessionId ? state : null
  return { diagnosis: fresh?.diagnosis ?? null, failed: fresh?.failed ?? false }
}

function hostOf(input: string): string {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).host
  } catch {
    return input
  }
}

function replaceLast(messages: Msg[], next: Msg): Msg[] {
  return [...messages.slice(0, -1), next]
}

/** Highlight an honest miss — the answer the whole report is built from. */
function looksLikeMiss(text: string): boolean {
  return /couldn'?t find|could not find|isn'?t mentioned|is not mentioned|no mention|doesn'?t say|does not say/i.test(
    text,
  )
}

function pathOnly(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

/* --------------------------------------------------------------- 1. Idle */

const HOW_IT_WORKS = [
  ['01', 'We read it', 'Up to 20 pages of your site, the way an AI assistant would — text only, no rendering.'],
  ['02', 'You get the report', 'What a buyer can and cannot learn from your pages, quoted back from them.'],
  ['03', 'You keep the bot', 'Talk to it, then put it on your own site if it earns its place.'],
] as const

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
      {/* Full viewport, not 90vh: this is the whole first impression, and a
          laptop was showing the beige section creeping up under the fold.
          `svh` so mobile browser chrome does not push the frame off-screen. */}
      <PaperBackground gradient="bottom" className="min-h-[100svh] p-3 text-cream sm:p-4">
        <div className="flex min-h-[calc(100svh-1.5rem)] flex-col border-l border-r border-t border-beige sm:min-h-[calc(100svh-2rem)]">
          <SiteNav />
          <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center sm:gap-8">
            <Pill tone="cream-on-dark">Free · No signup · About 30 seconds</Pill>

            <h1 className="text-display max-w-[900px] text-balance text-cream">
              Can an AI actually read your website?
            </h1>

            <p className="text-body-lg max-w-[620px] text-beige">
              Paste your address. We read up to 20 pages the way an AI assistant would, then show
              you what a buyer can — and cannot — learn from your site.
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
              {/* `Button` spreads its rest props after its own `type`, so this
                  overrides the default `type="button"` — no nested button. */}
              <Button type="submit" variant="filled" icon="arrow-right" className="h-16 shrink-0">
                Read my site
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

      <Section tone="beige">
        <Container>
          <Reveal>
            <div className="grid gap-12 py-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map(([n, title, blurb]) => (
                <div key={n} className="flex flex-col items-start gap-4">
                  <Disc>{n}</Disc>
                  <h3 className="text-h4-alt text-ink">{title}</h3>
                  <p className="text-body text-ink/70">{blurb}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 py-4 lg:flex-row lg:items-end lg:gap-15">
              <div className="flex max-w-[640px] flex-col gap-5">
                <SectionHeading tone="ink" size="h2" eyebrow="The point">
                  Why this matters
                </SectionHeading>
                <p className="text-body-lg text-ink/70">
                  Buyers now ask an assistant before they ask you. If your pages do not answer
                  plainly, the assistant guesses, hedges, or sends them elsewhere — and you never
                  hear about it.
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

/* ----------------------------------------------------------- 2. Crawling */

function CrawlingScreen({
  host,
  status,
  pages,
  total,
}: {
  host: string
  status: string
  pages: CrawledPage[]
  total: number
}) {
  const pct = total ? Math.round((pages.length / total) * 100) : 8

  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="flex flex-col gap-14 py-10">
          <div className="flex flex-wrap items-start justify-between gap-6 sm:gap-8">
            <SectionHeading tone="cream" size="h2" eyebrow={host}>
              Reading your site
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

          <p className="text-body-sm max-w-[560px] text-cream/45">
            Only pages your robots.txt allows, up to 20, capped at 20 seconds. We stop early rather
            than hammer your server.
          </p>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------- 3. Short report */

/** One of the two ways on from the report. */
function DoorCard({
  title,
  blurb,
  cta,
  onClick,
}: {
  title: string
  blurb: string
  cta: string
  onClick: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-sm border border-cream/20 bg-cream/5 p-6 sm:p-8">
      <FourPointStar size={20} className="text-crimson" />
      <h3 className="text-h4-alt text-cream">{title}</h3>
      <p className="text-body flex-1 text-cream/65">{blurb}</p>
      <Button variant="outline" data-on-dark="true" icon="arrow-right" onClick={onClick}>
        {cta}
      </Button>
    </div>
  )
}

/**
 * The report while the judged half is still being scored.
 *
 * The three measured scores land with the crawl; Answerability takes a model
 * call, so this stands in for the headline number. Shaped like the answer it
 * is waiting for — a number, a line, three misses — so nothing jumps when it
 * arrives. Staggered so it reads as work in progress rather than a stuck page.
 */
function ScoringSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex items-baseline gap-4">
        <span className="text-display animate-pulse text-cream/25 motion-reduce:animate-none">
          0
        </span>
        <span className="text-h2 text-cream/25">of 10</span>
      </div>

      <h1 className="text-h2 max-w-[470px] text-cream">Scoring your site</h1>

      <p className="text-body-lg max-w-[470px] text-cream/70">
        Checking your pages against the ten questions a buyer asks before they get in touch. This
        takes a few seconds.
      </p>

      <ul aria-hidden="true" className="flex max-w-[520px] flex-col">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-4 border-b border-cream/15 py-5">
            <span className="h-4 w-4 shrink-0 rotate-45 rounded-[2px] bg-cream/15" />
            <span
              className="h-3 animate-pulse rounded-pill bg-cream/15 motion-reduce:animate-none"
              style={{ width: `${86 - i * 16}%`, animationDelay: `${i * 180}ms` }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportScreen({
  host,
  pages,
  diagnosis,
  failed,
  onFull,
  onChat,
  onWidget,
  onRecrawl,
}: {
  host: string
  pages: number
  diagnosis: Diagnosis | null
  failed: boolean
  onFull: () => void
  onChat: () => void
  onWidget: () => void
  onRecrawl: () => void
}) {
  if (failed) {
    return (
      <Section tone="ink" className="min-h-[60vh]">
        <Container>
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-6 py-10 text-center">
            <h2 className="text-h2 text-cream">We couldn’t put your report together</h2>
            <p className="text-body-lg text-cream/80">
              Reading {host} worked, but scoring it did not. Running it again usually fixes this.
            </p>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
              <Button variant="filled" icon="arrow-right" onClick={onRecrawl}>
                Read my site again
              </Button>
              <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/contact">
                Talk to us
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  const a = diagnosis?.answerability
  const shown = a?.unanswered.slice(0, 3) ?? []

  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="grid items-start gap-10 py-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-15">
          <div className="flex min-w-0 flex-col gap-6">
            <span className="text-h5 uppercase text-cream/60">
              {host} · {pages} pages read
            </span>

            {a ? (
              <>
                <div className="flex items-baseline gap-4">
                  <span
                    className={cn('text-display', a.answered <= 4 ? 'text-crimson' : 'text-cream')}
                  >
                    {a.answered}
                  </span>
                  <span className="text-h2 text-cream/40">of {a.total}</span>
                </div>

                <h1 className="text-h2 max-w-[470px] text-cream">
                  buyer questions your website can answer
                </h1>

                <p className="text-body-lg max-w-[470px] text-cream/70">
                  The bot was limited by what your site says, not by the bot.{' '}
                  {a.unanswered.length === 0
                    ? 'It answered every one — that is rare.'
                    : a.unanswered.length <= 3
                      ? 'Here is what it could not find.'
                      : `Here are three of the ${a.unanswered.length} it could not find.`}
                </p>

                {shown.length > 0 && (
                  <ul className="flex max-w-[520px] flex-col">
                    {shown.map((q) => (
                      <li
                        key={q.id}
                        className="flex items-start gap-4 border-b border-cream/15 py-4"
                      >
                        <Plus size={16} className="mt-1 shrink-0 rotate-45 text-crimson" />
                        <span className="text-body text-cream/90">{q.question}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <ScoringSkeleton />
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="filled" icon="arrow-down" onClick={onFull}>
                Get the full report
              </Button>
              <Button variant="outline" data-on-dark="true" icon="arrow-right" href="/contact">
                Talk to us about it
              </Button>
            </div>
            <p className="text-body-sm text-cream/50">
              The full report quotes your own pages for every score.
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <DoorCard
              title="Talk to the bot we built"
              blurb="Ask it anything a customer would. Eight questions, answered only from your pages — you will see exactly where it runs out."
              cta="Ask it 8 questions"
              onClick={onChat}
            />
            <DoorCard
              title="Put this bot on your site"
              blurb="One line of script, bound to your domain. It answers from the pages we just read, and refreshes whenever you change them."
              cta="Get the code"
              onClick={onWidget}
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

/* -------------------------------------------------------- 4. Full report */

/**
 * A finding, with the evidence under it.
 *
 * `ok` is only set where a check genuinely passes or fails — crawlability. The
 * other three list evidence, not verdicts, so they get a quiet marker instead
 * of a tick that would imply a judgement per line.
 */
type Line = { text: string; note?: string; ok?: boolean }

function FullReportScreen({
  host,
  pages,
  diagnosis,
  onBack,
  onRecrawl,
}: {
  host: string
  pages: number
  diagnosis: Diagnosis | null
  onBack: () => void
  onRecrawl: () => void
}) {
  if (!diagnosis) {
    return (
      <Section tone="beige" className="min-h-[50vh]">
        <Container>
          <div className="flex flex-col gap-6 py-10">
            <SectionHeading tone="ink" size="h2" eyebrow={host}>
              Scoring your site
            </SectionHeading>
            <p className="text-body-lg max-w-[560px] text-ink/70">
              Checking your pages against the ten questions a buyer asks. This takes a few seconds.
            </p>
            <div className="flex max-w-[520px] flex-col gap-4" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-3 animate-pulse rounded-pill bg-ink/10 motion-reduce:animate-none"
                  style={{ width: `${86 - i * 16}%`, animationDelay: `${i * 180}ms` }}
                />
              ))}
            </div>
            <Button variant="outline" className="self-start" onClick={onBack}>
              Back to my report
            </Button>
          </div>
        </Container>
      </Section>
    )
  }

  const a = diagnosis.answerability
  const missed = new Set(a?.unanswered.map((q) => q.id) ?? [])

  // Three numbers a reader can carry away. Coverage is only present once the
  // judged half has landed, so it is dropped rather than shown as a zero.
  const stats: Stat[] = [
    ...(a ? [{ value: `${a.answered}/${a.total}`, label: 'Buyer questions your site answers' }] : []),
    ...(diagnosis.coverage
      ? [
          {
            value: `${diagnosis.coverage.present.length}/5`,
            label: 'Page types a buyer looks for',
          },
        ]
      : []),
    { value: String(pages), label: 'Pages we read' },
  ]

  return (
    <>
      <Section tone="beige">
        <Container>
          <div className="flex flex-col gap-12 py-4">
            <SectionHeading tone="ink" size="h2" eyebrow={`${host} · ${pages} pages read`}>
              The full report
            </SectionHeading>

            <StatRow items={stats} />
          </div>
        </Container>
      </Section>

      {/* The ten questions, all of them — the answered ones are the argument
          that the misses are real, so showing only the failures reads as a
          hatchet job rather than an audit. */}
      <Section tone="beige" className="pt-0">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-8 border-t border-ink/15 pt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h3 className="text-h3 text-ink">What a buyer can find out</h3>
                {a && (
                  <span className="text-body-sm text-ink/60">
                    {a.answered} answered · {a.unanswered.length} missing
                  </span>
                )}
              </div>

              {a && (
                <div aria-hidden="true" className="flex gap-1.5">
                  {buyerQuestions.map((q) => (
                    <span
                      key={q.id}
                      className={cn(
                        'h-1 flex-1 rounded-pill',
                        missed.has(q.id) ? 'bg-crimson' : 'bg-ink/25',
                      )}
                    />
                  ))}
                </div>
              )}

              <ul className="flex flex-col">
                {buyerQuestions.map((q) => {
                  const miss = missed.has(q.id)
                  return (
                    <li
                      key={q.id}
                      className="flex items-start gap-4 border-b border-ink/12 py-5 sm:gap-5"
                    >
                      {miss ? (
                        <Plus size={16} className="mt-1 shrink-0 rotate-45 text-crimson" />
                      ) : (
                        <Sparkle size={14} className="mt-1.5 shrink-0 text-ink/45" />
                      )}
                      <div className="flex flex-col gap-1.5">
                        <span className={cn('text-body', miss ? 'text-ink/55' : 'text-ink')}>
                          {q.question}
                        </span>
                        {miss && (
                          <span className="text-body-sm text-crimson">
                            Nothing on the site answers this. We looked for:{' '}
                            {q.looksLike.replace(/\.$/, '').toLowerCase()}.
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Measured, not judged — these four come straight off the crawl, so they
          sit apart from the ten questions on their own ground. */}
      <Section tone="cream">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-10 py-4">
              <div className="flex flex-col gap-3">
                <h3 className="text-h3 text-ink">How the pages themselves read</h3>
                <p className="text-body max-w-[620px] text-ink/70">
                  Measured directly from what we crawled. Every line below is something on your
                  site, not an opinion about it.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {diagnosis.coverage && (
                  <ScoreRow
                    name="Coverage"
                    verdict={diagnosis.coverage.missing.length === 0 ? 'pass' : 'weak'}
                    headline={`${diagnosis.coverage.present.length} of 5 page types`}
                    lines={
                      diagnosis.coverage.missing.length
                        ? diagnosis.coverage.missing.map((m) => ({ text: m, ok: false }))
                        : [{ text: 'Every page type a buyer looks for is present', ok: true }]
                    }
                  />
                )}
                <ScoreRow
                  name="Structure"
                  verdict={diagnosis.structure.verdict}
                  headline={diagnosis.structure.headline}
                  lines={diagnosis.structure.evidence.map((text) => ({ text }))}
                />
                <ScoreRow
                  name="Crawlability"
                  verdict={diagnosis.crawlability.verdict}
                  headline={diagnosis.crawlability.headline}
                  lines={diagnosis.crawlability.checks.map((c) => ({
                    text: c.label,
                    note: c.detail,
                    ok: c.pass,
                  }))}
                />
                <ScoreRow
                  name="Specificity"
                  verdict={diagnosis.specificity.verdict}
                  headline={diagnosis.specificity.headline}
                  lines={diagnosis.specificity.examples.map((e) => ({
                    text: `“${e.quote}”`,
                    note: pathOnly(e.url),
                  }))}
                />
              </div>

              <Button variant="outline" className="self-start" onClick={onBack}>
                Back to my report
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="ink">
        <Container>
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 py-6 text-center">
            <h2 className="text-h2 text-cream">This is a content problem, not a bot problem.</h2>
            <p className="text-body-lg max-w-[540px] text-cream/70">
              Every question above is one a buyer asks before they get in touch. We rebuild sites so
              the answers are on the page.
            </p>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
              <Button variant="filled" icon="arrow-right" href="/contact">
                Talk about a rebuild
              </Button>
              <Button variant="outline" data-on-dark="true" onClick={onRecrawl}>
                Read my site again
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

/** Verdict chip colours. `pass` stays ink — a good result should not shout. */
const VERDICT = {
  pass: { label: 'Passes', chip: 'border-teal-deep/40 text-teal-deep' },
  weak: { label: 'Weak', chip: 'border-ink/25 text-ink/70' },
  fail: { label: 'Needs work', chip: 'border-crimson/40 text-crimson' },
} as const

function ScoreRow({
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

/* --------------------------------------------------------------- 5. Chat */

/** How many of the eight are left, as a bar. Shown twice — beside the thread
 *  on desktop, above it on a phone — so it lives in one place. */
function QuestionMeter({ left, className }: { left: number; className?: string }) {
  return (
    <div className={cn('flex gap-1.5', className)} aria-hidden="true">
      {Array.from({ length: MAX_MESSAGES }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-[3px] flex-1 rounded-pill',
            i < MAX_MESSAGES - left ? 'bg-crimson' : 'bg-cream/20',
          )}
        />
      ))}
    </div>
  )
}

function ChatScreen({
  host,
  pages,
  messages,
  draft,
  sending,
  left,
  threadEnd,
  onDraft,
  onSend,
  onBack,
  onWidget,
}: {
  host: string
  pages: number
  messages: Msg[]
  draft: string
  sending: boolean
  left: number
  threadEnd: React.RefObject<HTMLDivElement | null>
  onDraft: (v: string) => void
  onSend: (text: string) => void
  onBack: () => void
  onWidget: () => void
}) {
  const capped = left === 0

  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container width="wide">
        <div className="grid items-start gap-8 py-2 sm:gap-10 sm:py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
          {/* Beside the thread on desktop, under it on a phone: on a small
              screen a heading, a paragraph, a meter and two buttons all sit
              between the visitor and the conversation they came for. */}
          <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
            <div className="hidden flex-col gap-6 lg:flex">
              <SectionHeading tone="cream" size="h2" eyebrow={host}>
                Your bot
              </SectionHeading>

              <p className="text-body text-cream/70">
                It knows nothing except the {pages} pages we just read. When it says it cannot find
                something, that is your site talking.
              </p>

              <div className="flex flex-col gap-2.5">
                <span className="text-body-sm text-cream/60">
                  {left} of {MAX_MESSAGES} questions left
                </span>
                <QuestionMeter left={left} />
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <Button
                variant="outline"
                data-on-dark="true"
                className="py-3 lg:py-4"
                onClick={onBack}
              >
                Back to my report
              </Button>
              <Button
                variant="filled"
                icon="arrow-right"
                className="py-3 lg:py-4"
                onClick={onWidget}
              >
                Get the widget for my site
              </Button>
            </div>

            <p className="hidden text-body-sm text-cream/45 lg:block">
              Your report is saved — going back does not lose this conversation.
            </p>
          </div>

          <div className="order-1 flex min-h-[88svh] min-w-0 flex-col gap-4 sm:gap-5 lg:order-2">
            {/* The desktop sidebar's context, compressed to two lines. */}
            <div className="flex flex-col gap-2.5 lg:hidden">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-h5 min-w-0 truncate uppercase text-cream/60">{host}</span>
                <span className="text-body-sm shrink-0 text-cream/60">
                  {left} of {MAX_MESSAGES} left
                </span>
              </div>
              <QuestionMeter left={left} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto rounded-sm border border-cream/15 bg-cream/5 p-4 sm:gap-4 sm:rounded-md sm:p-8">
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}
              <div ref={threadEnd} />
            </div>

            {!capped && (
              // Scrolls to the container's own edge on a phone, wraps from
              // `sm` — the same treatment as the featured-projects strip.
              // Scrollbars are hidden site-wide in app/(my-app)/globals.css.
              <div className="-mr-4 flex shrink-0 gap-2 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    disabled={sending}
                    onClick={() => onSend(q.question)}
                    className={cn(
                      'shrink-0 whitespace-nowrap rounded-pill border border-cream/25 bg-transparent',
                      'px-3.5 py-2 sm:px-4 sm:py-2.5',
                      'text-body-sm text-cream/85 transition-colors duration-200',
                      'hover:border-cream/50 hover:bg-cream/10 disabled:opacity-50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40',
                    )}
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            )}

            {capped ? (
              <p className="text-body text-cream/70">
                That’s all eight questions. Your report has the rest of the picture.
              </p>
            ) : (
              // A textarea, not an input: an input clips its placeholder to
              // one line, and two lines is what it takes to read. Enter sends,
              // shift-enter breaks the line.
              <form
                className="flex shrink-0 items-stretch gap-2 sm:gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSend(draft)
                }}
              >
                <Field label="Your question" className="min-w-0 flex-1">
                  <Textarea
                    rows={2}
                    placeholder="Ask what a customer would ask…"
                    value={draft}
                    disabled={sending}
                    onChange={(e) => onDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend(draft)
                      }
                    }}
                    className="h-auto min-h-0 resize-none px-4 py-2 text-body leading-normal"
                  />
                </Field>
                <Button
                  type="submit"
                  variant="filled"
                  icon="arrow-right"
                  disabled={sending}
                  className="h-auto shrink-0 px-4 py-0 sm:px-8"
                >
                  {sending ? 'Thinking…' : 'Ask'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  const isYou = msg.from === 'you'
  return (
    <div className={cn('flex flex-col gap-1.5', isYou ? 'items-end' : 'items-start')}>
      {msg.miss && <span className="text-h5 uppercase text-crimson">Not on your site</span>}
      <div
        className={cn(
          'max-w-[92%] rounded-sm px-4 py-3 text-body break-words whitespace-pre-wrap sm:max-w-[85%] sm:px-5 sm:py-4',
          isYou
            ? 'bg-cream text-ink'
            : cn('bg-cream/8 text-cream border', msg.miss ? 'border-crimson' : 'border-cream/15'),
        )}
      >
        {msg.pending && !msg.text ? (
          <span className="text-cream/50">Reading your site…</span>
        ) : (
          msg.text
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 6. Widget */

const WIDGET_STEPS = [
  ['01', 'Confirm your email', 'We send a six-digit code. It proves the site is yours before we mint a key.'],
  ['02', 'Paste one line', 'A single script tag, before your closing body tag. No build step, no package.'],
  ['03', 'It answers', 'Bound to your domain, from the pages we already read. Refresh it whenever you publish.'],
] as const

/**
 * Keep the bot: verify an email, mint a key, hand over the snippet.
 *
 * The verify step is real — a key is only minted for an address that completed
 * the code exchange. Delivery is stubbed until a provider exists, which is what
 * the notice under the form says.
 */
function WidgetScreen({
  sessionId,
  host,
  onBack,
}: {
  sessionId: string
  host: string
  onBack: () => void
}) {
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [snippet, setSnippet] = useState<string | null>(null)
  const [manageUrl, setManageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  /** Step one: ask for a code. */
  async function sendCode() {
    if (busy || !email.trim()) return
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/tools/chatbot/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'send', sessionId, email: email.trim() }),
      })
      const body = (await res.json()) as {
        ok: boolean
        error?: string
        stubbed?: boolean
        code?: string
      }

      if (body.ok) {
        setStep('code')
        // Only present on a build with no email provider and TOOLS_REVEAL_CODES
        // set — staging, so the flow can be finished without a mailbox. Kept in
        // the console rather than on the page: it is a testing affordance, not
        // something to show a visitor.
        if (body.code) console.info('[epyc] verification code:', body.code)
        setNotice(
          body.stubbed
            ? 'Email sending is not configured yet, so this code was written to the server log rather than sent.'
            : `We sent a 6-digit code to ${email.trim()}. It expires in 10 minutes.`,
        )
      } else {
        setError(body.error ?? 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  /** Step two: check the code, then mint the key. */
  async function verifyAndClaim() {
    if (busy || code.trim().length !== 6) return
    setBusy(true)
    setError(null)

    try {
      const checked = await fetch('/api/tools/chatbot/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'check', sessionId, email: email.trim(), code: code.trim() }),
      })
      const checkBody = (await checked.json()) as { ok: boolean; error?: string }
      if (!checkBody.ok) {
        setError(checkBody.error ?? 'That code is not right.')
        return
      }

      const res = await fetch('/api/tools/chatbot/embed', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, email: email.trim() }),
      })
      const body = (await res.json()) as {
        ok: boolean
        snippet?: string
        manageUrl?: string
        error?: string
      }
      if (body.ok && body.snippet) {
        setSnippet(body.snippet)
        setManageUrl(body.manageUrl ?? null)
        setStep('done')
        setNotice(null)
      } else {
        setError(body.error ?? 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed — select the code and copy it manually.')
    }
  }

  return (
    <Section tone="beige" className="min-h-[70vh]">
      <Container>
        <div className="grid items-start gap-10 py-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-15">
          <div className="flex min-w-0 flex-col gap-8">
            <SectionHeading tone="ink" size="h2" eyebrow={host}>
              Put this bot on your site
            </SectionHeading>

            <p className="text-body-lg max-w-[520px] text-ink/70">
              It answers only from your pages, never invents an answer, and says so plainly when
              your site does not cover something. Free, with our mark in the corner.
            </p>

            <div className="flex flex-col gap-6">
              {WIDGET_STEPS.map(([n, title, blurb]) => (
                <div key={n} className="flex items-start gap-5">
                  <Disc className="h-11 w-11">{n}</Disc>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-h4-alt text-ink">{title}</h3>
                    <p className="text-body max-w-[460px] text-ink/70">{blurb}</p>
                  </div>
                </div>
              ))}
            </div>

            {step === 'done' && snippet ? (
              <>
                <p className="text-body max-w-[520px] text-ink/70">
                  Paste this into your site’s HTML, just before the closing{' '}
                  <code className="text-code">&lt;/body&gt;</code> tag. The bot appears in the
                  corner of every page it’s on.
                </p>

                {/* Wraps rather than scrolls: the snippet is the thing they
                    came for, and a one-line box hid two thirds of it behind a
                    horizontal scrollbar. The box grows to fit instead. */}
                <pre className="max-w-[520px] whitespace-pre-wrap break-all rounded-sm bg-ink p-6 leading-relaxed">
                  <code className="text-code text-cream">{snippet}</code>
                </pre>

                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="filled" onClick={copy}>
                    {copied ? 'Copied' : 'Copy the code'}
                  </Button>
                  <span className="text-body-sm text-ink/60">
                    Works on {host} only. 50 messages a day.
                  </span>
                </div>

                {manageUrl && (
                  <div className="flex max-w-[520px] flex-col gap-2 border-t border-ink/15 pt-6">
                    <p className="text-body-sm text-ink/70">
                      Keep this link. It is how you refresh the bot when your site changes, and it
                      is the only copy — we cannot send it to you yet.
                    </p>
                    <a
                      href={manageUrl}
                      className="text-code break-all text-ink/60 underline underline-offset-4"
                    >
                      {manageUrl}
                    </a>
                  </div>
                )}
              </>
            ) : step === 'code' ? (
              <>
                <p className="text-body max-w-[520px] text-ink/70">
                  Enter the 6-digit code we sent to {email}.
                </p>

                <form
                  className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    void verifyAndClaim()
                  }}
                >
                  <Field label="Your 6-digit code" className="flex-1">
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      invalid={Boolean(error)}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="filled"
                    icon="arrow-right"
                    disabled={busy}
                    className="h-16 shrink-0"
                  >
                    {busy ? 'Checking' : 'Verify'}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setCode('')
                    setError(null)
                    setNotice(null)
                  }}
                  className="self-start text-body-sm text-ink/60 underline underline-offset-4"
                >
                  Use a different address
                </button>
              </>
            ) : (
              <form
                className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  void sendCode()
                }}
              >
                <Field label="Your email address" className="flex-1">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    invalid={Boolean(error)}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Button
                  type="submit"
                  variant="filled"
                  icon="arrow-right"
                  disabled={busy}
                  className="h-16 shrink-0"
                >
                  {busy ? 'Sending' : 'Send my code'}
                </Button>
              </form>
            )}

            {/* The snippet keeps its place in the layout before it exists, so
                the page shows what is being offered rather than an empty gap,
                and nothing shifts when the real key arrives. */}
            {step !== 'done' && (
              <div className="flex max-w-[520px] flex-col gap-3">
                <span className="text-h5 uppercase text-ink/60">Your snippet</span>
                <pre className="whitespace-pre-wrap break-all rounded-sm bg-ink p-6 leading-relaxed">
                  <code className="text-code text-cream/45">
                    &lt;script src=&quot;https://epyc.in/api/embed/chatbot.js&quot;
                    data-key=&quot;ek_live_…&quot; defer&gt;&lt;/script&gt;
                  </code>
                </pre>
                <p className="text-body-sm text-ink/60">
                  Your key lands here once you verify. 50 messages a day, and the manage link is
                  the only way to refresh the bot when your site changes.
                </p>
              </div>
            )}

            {notice && <p className="text-body-sm text-ink/60">{notice}</p>}

            {error && (
              <p role="alert" className="text-body-sm text-crimson">
                {error}
              </p>
            )}

            <Button variant="outline" className="self-start" onClick={onBack}>
              Back to my report
            </Button>
          </div>

          <WidgetPreview host={host} />
        </div>
      </Container>
    </Section>
  )
}

/**
 * What the bot looks like once it is on their site.
 *
 * A mock of the real widget, not the widget itself — that one renders in a
 * shadow root on the customer's page (app/api/embed/chatbot.js). Its literal
 * colours are white and off-white; these are the nearest palette tokens,
 * because this surface is ours and the palette has no white.
 */
function WidgetPreview({ host }: { host: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <span className="text-h5 uppercase text-ink/60">How it looks on your site</span>

      <div className="relative h-[420px] overflow-hidden rounded-sm border border-ink/15 bg-cream sm:h-[480px]">
        <div className="flex h-10 items-center gap-2 border-b border-ink/10 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="text-body-sm ml-2 truncate text-ink/45">{host}</span>
        </div>

        <div aria-hidden="true" className="flex flex-col gap-3 p-6">
          <span className="h-3.5 w-3/5 rounded-pill bg-ink/12" />
          <span className="h-2.5 w-[85%] rounded-pill bg-ink/8" />
          <span className="h-2.5 w-3/4 rounded-pill bg-ink/8" />
        </div>

        <div className="absolute bottom-5 right-5 flex flex-col items-end gap-3">
          <div className="w-[248px] overflow-hidden rounded-sm bg-cream-light shadow-[0_12px_40px_rgba(24,50,41,0.24)]">
            <div className="text-body-sm bg-ink px-4 py-3 text-cream">Ask us anything</div>
            <div className="flex flex-col gap-2.5 bg-beige p-4">
              <span className="text-body-sm max-w-[84%] self-start rounded-sm bg-bone px-3 py-2 text-ink">
                Hi — ask me anything about this site.
              </span>
              <span className="text-body-sm max-w-[84%] self-end rounded-sm bg-ink px-3 py-2 text-cream">
                Do you support COD?
              </span>
            </div>
            <div className="text-body-sm px-3 py-2 text-center text-ink/50">Powered by EPYC</div>
          </div>

          <span className="grid h-14 w-14 place-items-center rounded-full bg-crimson text-cream shadow-[0_6px_20px_rgba(24,50,41,0.28)]">
            <FourPointStar size={20} />
          </span>
        </div>
      </div>
    </div>
  )
}
/* -------------------------------------------------- 7. Nothing to work with */

type CrawlCheck = { label: string; detail: string; ok: boolean }

/**
 * The two ways a crawl ends with no bot: too little text to answer from, or
 * nothing we could reach at all.
 *
 * One screen, because they are one screen — same eyebrow, same display line,
 * same pair of ways out. Only the finding differs, and the finding IS the
 * pitch, so it stays literal at each call site rather than being assembled
 * from flags here.
 */
function DeadEndScreen({
  host,
  headline,
  body,
  checks,
  retryLabel,
  onRetry,
}: {
  host: string
  headline: string
  body: string
  checks?: CrawlCheck[]
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-7 py-10 text-center">
          <span className="text-h5 uppercase text-cream/60">{host}</span>

          <h1 className="text-display text-balance text-cream">{headline}</h1>

          <p className="text-body-lg max-w-[600px] text-cream/70">{body}</p>

          {checks && checks.length > 0 && (
            <ul className="flex w-full max-w-[640px] flex-col text-left">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-4 border-b border-cream/15 py-4">
                  {c.ok ? (
                    <Sparkle size={14} className="mt-1 shrink-0 text-cream/70" />
                  ) : (
                    <Plus size={16} className="mt-1 shrink-0 rotate-45 text-crimson" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-body text-cream">{c.label}</span>
                    <span className="text-body-sm text-cream/60">{c.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex w-full flex-col items-stretch gap-3 pt-3 sm:w-auto sm:flex-row">
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us about it
            </Button>
            <Button variant="outline" data-on-dark="true" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}

/** Pages loaded, but there was almost no text in them. */
function EmptyScreen({
  host,
  signals,
  pages,
  onRetry,
}: {
  host: string
  signals: Record<string, unknown> | null
  pages: number
  onRetry: () => void
}) {
  return (
    <DeadEndScreen
      host={host}
      headline={`We read ${pages} pages and found almost no text.`}
      body="There was nothing to build a bot from — and that is the finding. Your pages are assembled in the browser, so an assistant reading your site sees an empty shell. So does anything else that does not run JavaScript."
      checks={[
        {
          label: 'Sitemap',
          ok: Boolean(signals?.sitemapFound),
          detail: signals?.sitemapFound
            ? 'Found — we used it to pick which pages to read'
            : 'Not found, so we had to guess which pages matter by following links',
        },
        {
          label: 'robots.txt',
          ok: !signals?.robotsBlockedAll,
          detail: signals?.robotsBlockedAll
            ? 'Blocks automated readers from every page'
            : 'Present, and allows crawling',
        },
        {
          label: 'Readable without JavaScript',
          ok: false,
          detail: 'No readable text at all — the pages are built entirely by JavaScript',
        },
      ]}
      retryLabel="Try another address"
      onRetry={onRetry}
    />
  )
}

/** Nothing came back at all — blocked, down, or too slow. */
function BlockedScreen({
  host,
  signals,
  onBack,
}: {
  host: string
  signals: Record<string, unknown> | null
  onBack: () => void
}) {
  return (
    <DeadEndScreen
      host={host}
      headline="We couldn’t reach that site."
      body={
        signals?.robotsBlockedAll
          ? 'Your robots.txt blocks automated readers from every page. Search engines and AI assistants hit the same wall we just did.'
          : 'Nothing came back that we could read. The site may be down, very slow, or blocking automated readers.'
      }
      retryLabel="Try another address"
      onRetry={onBack}
    />
  )
}
