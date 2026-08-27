'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Disc } from '@/components/ui/disc'
import { Field, Input } from '@/components/ui/form'
import { Pill } from '@/components/ui/pill'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Plus, Sparkle } from '@/components/icons'
import { suggestedQuestions } from '@/data/buyer-questions'
import { readSSE } from '@/lib/tools/sse-client'

/**
 * The AI chatbot tool: paste a URL, we read the site, you chat with it.
 *
 * Wired to POST /api/tools/chatbot/crawl and /message (both stream Server-Sent
 * Events) and GET /api/tools/chatbot/diagnosis. Flow and screen contents:
 * docs/ai-chatbot-flow.md.
 *
 * The report's three measured scores are stored when the crawl finishes, so
 * they are always ready. Answerability and Coverage are scored in the
 * background on message one; if they have not landed yet the panel renders
 * without them and polls briefly rather than blocking on a spinner.
 */

type Phase = 'idle' | 'crawling' | 'chat' | 'report' | 'empty' | 'blocked'

const MAX_MESSAGES = 8

type Msg = { from: 'bot' | 'you'; text: string; miss?: boolean; pending?: boolean }
type CrawledPage = { url: string; title: string }

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
          setSession({ id: String(data.sessionId), host, pages: Number(data.pages ?? 0) })
          setSignals((data.signals as Record<string, unknown>) ?? null)

          const st = String(data.status)
          if (st === 'ready') {
            setPhase('chat')
            setMessages([
              {
                from: 'bot',
                text: `I've read ${data.readablePages ?? data.pages} pages of ${host}. Ask me anything a customer might ask.`,
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
        if (body.capped) setPhase('report')
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
        if (event === 'done') {
          setUsed(Number(data.messagesUsed ?? 0))
          if (data.capped) setPhase('report')
        }
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

  return (
    <>
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

      {phase === 'chat' && session && (
        <ChatScreen
          host={session.host}
          messages={messages}
          draft={draft}
          sending={sending}
          left={Math.max(0, MAX_MESSAGES - used)}
          threadEnd={threadEnd}
          onDraft={setDraft}
          onSend={send}
          onSkip={() => setPhase('report')}
        />
      )}

      {phase === 'report' && session && (
        <ReportScreen
          sessionId={session.id}
          host={session.host}
          onRecrawl={() => void startCrawl(true)}
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

/* --------------------------------------------------------------- 1. Idle */

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
    <Section tone="beige" className="pt-10 lg:pt-16">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-8 text-center">
          <Pill tone="ink-on-light">Free · No signup · About 30 seconds</Pill>

          <h1 className="text-display text-ink">
            Can an AI actually read
            <br />
            your website?
          </h1>

          <p className="text-body-lg max-w-[560px] text-ink/70">
            Paste your address. We read up to 20 pages, build a chatbot from what we find, and
            show you the 10 questions a buyer asks that your site cannot answer.
          </p>

          <form
            className="flex w-full max-w-[620px] flex-col gap-3 sm:flex-row"
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
            <p className="text-body-sm text-ink/60">
              We only read pages your robots.txt allows. Nothing is published anywhere.
            </p>
          )}
        </div>

        <div className="mx-auto mt-16 grid max-w-[900px] gap-8 sm:grid-cols-3 lg:mt-20">
          {[
            { n: '01', t: 'We read it', b: 'Up to 20 pages, the way an AI assistant would.' },
            { n: '02', t: 'You question it', b: 'Eight questions to a bot that only knows your site.' },
            { n: '03', t: 'You get the report', b: 'Five scores, every one backed by your own pages.' },
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-4 text-center">
              <Disc>{s.n}</Disc>
              <h3 className="text-h4 text-ink">{s.t}</h3>
              <p className="text-body text-ink/70">{s.b}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
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
        <div className="mx-auto flex max-w-[720px] flex-col gap-10 py-10">
          <SectionHeading tone="cream" size="h2" eyebrow={host}>
            Reading your site
          </SectionHeading>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-body text-cream">
                {total ? `${pages.length} of ${total} pages` : 'Getting started'}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-pill bg-cream/15">
              <div
                className="h-full rounded-pill bg-crimson transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <ul className="flex flex-col gap-2" aria-live="polite">
            {pages.map((p, i) => (
              <li
                key={`${p.url}-${i}`}
                className={cn(
                  'flex items-center gap-3 text-body',
                  i === pages.length - 1 ? 'text-cream' : 'text-cream/50',
                )}
              >
                <Sparkle
                  size={12}
                  className={cn('shrink-0', i === pages.length - 1 ? 'text-crimson' : 'text-cream/30')}
                />
                <span className="font-mono text-code">{p.url}</span>
              </li>
            ))}
          </ul>

          {status && <p className="text-body-sm text-cream/60">{status}</p>}
        </div>
      </Container>
    </Section>
  )
}

/* --------------------------------------------------------------- 3. Chat */

function ChatScreen({
  host,
  messages,
  draft,
  sending,
  left,
  threadEnd,
  onDraft,
  onSend,
  onSkip,
}: {
  host: string
  messages: Msg[]
  draft: string
  sending: boolean
  left: number
  threadEnd: React.RefObject<HTMLDivElement | null>
  onDraft: (v: string) => void
  onSend: (text: string) => void
  onSkip: () => void
}) {
  return (
    <Section tone="beige">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-h5 uppercase text-ink/60">Chatting with</span>
              <span className="text-h4 text-ink">{host}</span>
            </div>
            <Pill tone="ink-on-light">
              {left} of {MAX_MESSAGES} questions left
            </Pill>
          </div>

          <div className="flex flex-col gap-5">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            <div ref={threadEnd} />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <span className="text-h5 uppercase text-ink/60">Try asking</span>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  disabled={sending}
                  onClick={() => onSend(q.question)}
                  className={cn(
                    'rounded-pill border border-ink/15 bg-transparent px-4 py-2',
                    'text-body-sm text-ink/80 transition-colors duration-200',
                    'hover:border-ink/40 hover:bg-ink/5 disabled:opacity-50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/40',
                  )}
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              onSend(draft)
            }}
          >
            <Field label="Your question" className="flex-1">
              <Input
                placeholder="Ask something a customer would ask…"
                value={draft}
                disabled={sending}
                onChange={(e) => onDraft(e.target.value)}
              />
            </Field>
            <Button
              type="submit"
              variant="filled"
              icon="arrow-right"
              disabled={sending}
              className="h-16 shrink-0"
            >
              {sending ? 'Thinking…' : 'Send'}
            </Button>
          </form>

          <button
            type="button"
            onClick={onSkip}
            className="text-body-sm text-ink/60 underline underline-offset-4"
          >
            Skip to my report
          </button>
        </div>
      </Container>
    </Section>
  )
}

function Bubble({ msg }: { msg: Msg }) {
  const isYou = msg.from === 'you'
  return (
    <div className={cn('flex', isYou ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-md px-5 py-4 text-body whitespace-pre-wrap',
          isYou
            ? 'bg-ink text-cream'
            : msg.miss
              ? 'border border-crimson/30 bg-crimson/5 text-ink'
              : 'bg-bone text-ink',
        )}
      >
        {msg.miss && (
          <span className="mb-2 block text-h5 uppercase text-crimson">Not on the site</span>
        )}
        {msg.pending && !msg.text ? <span className="text-ink/50">Reading your site…</span> : msg.text}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- 4. Report */

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

function ReportScreen({
  sessionId,
  host,
  onRecrawl,
}: {
  sessionId: string
  host: string
  onRecrawl: () => void
}) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    // The judged half is scored in the background on message one. It is
    // usually done well before the visitor gets here; if not, poll briefly
    // rather than making them look at a spinner or a half-report.
    async function load() {
      try {
        const res = await fetch(`/api/tools/chatbot/diagnosis?sessionId=${sessionId}`)
        const body = (await res.json()) as { ok: boolean; diagnosis?: Diagnosis }
        if (cancelled) return

        const d = body.diagnosis
        // A diagnosis missing its measured half would take the whole page
        // down when rendered. The three measured scores are written when the
        // crawl finishes, so their absence means something is wrong upstream —
        // show the failure state rather than a half-report that crashes.
        const complete = Boolean(d?.structure && d.crawlability && d.specificity)

        if (body.ok && d && complete) {
          setDiagnosis(d)
          // Scoring takes ~20s against a full corpus, so poll for ~40s before
          // giving up and leaving the three measured scores on screen.
          if (d.partial && attempts < 20) {
            attempts++
            setTimeout(load, 2000)
          }
        } else {
          setFailed(true)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (failed) {
    return (
      <Section tone="ink">
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

  return (
    <>
      <Section tone="ink">
        <Container>
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 py-6 text-center">
            <span className="text-h5 uppercase text-cream/60">{host}</span>

            {a ? (
              <>
                <p className="text-display text-cream">
                  <span className={a.answered <= 4 ? 'text-crimson' : 'text-cream'}>
                    {a.answered}
                  </span>{' '}
                  of {a.total}
                </p>
                <h2 className="text-h2 text-cream">buyer questions your website can answer</h2>
                <p className="text-body-lg max-w-[520px] text-cream/70">
                  {a.unanswered.length === 0
                    ? 'Your site answers everything a buyer asks before getting in touch. That is rare.'
                    : 'The bot was limited by what your site says, not by the bot. Here is what it could not find.'}
                </p>

                {a.unanswered.length > 0 && (
                  <ul className="mt-2 flex w-full max-w-[560px] flex-col gap-2 text-left">
                    {a.unanswered.map((q) => (
                      <li
                        key={q.id}
                        className="flex items-start gap-3 border-b border-cream/15 pb-2"
                      >
                        <Plus size={16} className="mt-1 shrink-0 rotate-45 text-crimson" />
                        <span className="text-body text-cream/90">{q.question}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <p className="text-display text-cream/40">…</p>
                <h2 className="text-h2 text-cream">Scoring your site</h2>
                <p className="text-body-lg max-w-[520px] text-cream/70">
                  Checking your pages against the ten questions a buyer asks. The rest of your
                  report is below.
                </p>
              </>
            )}
          </div>
        </Container>
      </Section>

      {diagnosis && (
        <Section tone="beige">
          <Container>
            <div className="mx-auto flex max-w-[760px] flex-col gap-8">
              <SectionHeading tone="ink" size="h2">
                The rest of the report
              </SectionHeading>
              <div className="flex flex-col">
                {diagnosis.coverage && (
                  <ScoreRow
                    name="Coverage"
                    verdict={diagnosis.coverage.missing.length === 0 ? 'pass' : 'weak'}
                    headline={`${diagnosis.coverage.present.length} of 5 page types`}
                    lines={
                      diagnosis.coverage.missing.length
                        ? diagnosis.coverage.missing.map((m) => `Missing: ${m}`)
                        : ['Every page type a buyer looks for is present']
                    }
                  />
                )}
                <ScoreRow
                  name="Structure"
                  verdict={diagnosis.structure.verdict}
                  headline={diagnosis.structure.headline}
                  lines={diagnosis.structure.evidence}
                />
                <ScoreRow
                  name="Crawlability"
                  verdict={diagnosis.crawlability.verdict}
                  headline={diagnosis.crawlability.headline}
                  lines={diagnosis.crawlability.checks.map(
                    (c) => `${c.pass ? '✓' : '✗'} ${c.label} — ${c.detail}`,
                  )}
                />
                <ScoreRow
                  name="Specificity"
                  verdict={diagnosis.specificity.verdict}
                  headline={diagnosis.specificity.headline}
                  lines={diagnosis.specificity.examples.map(
                    (e) => `“${e.quote}” — ${pathOnly(e.url)}`,
                  )}
                />
              </div>
            </div>
          </Container>
        </Section>
      )}

      <Section tone="cream">
        <Container>
          <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
            <h2 className="text-h2 text-ink">
              {a && a.answered >= 8
                ? 'You’re most of the way there.'
                : 'This is a content problem, not a bot problem.'}
            </h2>
            <p className="text-body-lg max-w-[520px] text-ink/70">
              Every question above is one a buyer asks before they get in touch. We rebuild sites
              so the answers are on the page.
            </p>
            <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
              <Button variant="filled" icon="arrow-right" href="/contact">
                Talk about a rebuild
              </Button>
              <Button variant="outline" onClick={onRecrawl}>
                Fixed something? Read my site again
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <ClaimEmbed sessionId={sessionId} host={host} />
    </>
  )
}

/**
 * Keep the bot: capture an email, mint a key, hand over the snippet.
 *
 * The email is not verified yet — nothing can send mail from this app. When
 * that exists, a code step slots in before the snippet appears and nothing
 * else here changes.
 */
function ClaimEmbed({ sessionId, host }: { sessionId: string; host: string }) {
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
    <Section tone="ink">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col gap-6">
          <SectionHeading tone="cream" size="h2">
            Keep the bot
          </SectionHeading>

          {step === 'done' && snippet ? (
            <>
              <p className="text-body-lg text-cream/80">
                Paste this into your site’s HTML, just before the closing{' '}
                <code className="text-code text-cream">&lt;/body&gt;</code> tag. The bot appears in
                the corner of every page it’s on.
              </p>

              <pre className="overflow-x-auto rounded-md border border-cream/20 bg-cream/5 p-4">
                <code className="text-code text-cream">{snippet}</code>
              </pre>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="filled" onClick={copy}>
                  {copied ? 'Copied' : 'Copy the code'}
                </Button>
                <span className="text-body-sm text-cream/60">
                  Works on {host} only. Free, and it answers from the pages we just read.
                </span>
              </div>

              {manageUrl && (
                <div className="flex flex-col gap-2 border-t border-cream/20 pt-6">
                  <p className="text-body-sm text-cream/80">
                    Keep this link. It is how you refresh the bot when your site changes, and it is
                    the only copy — we cannot send it to you yet.
                  </p>
                  <a
                    href={manageUrl}
                    className="text-code break-all text-cream/60 underline underline-offset-4"
                  >
                    {manageUrl}
                  </a>
                </div>
              )}
            </>
          ) : step === 'code' ? (
            <>
              <p className="text-body-lg text-cream/80">
                Enter the 6-digit code we sent to {email}.
              </p>

              <form
                className="flex w-full max-w-[620px] flex-col gap-3 sm:flex-row"
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
                className="self-start text-body-sm text-cream/60 underline underline-offset-4"
              >
                Use a different address
              </button>
            </>
          ) : (
            <>
              <p className="text-body-lg text-cream/80">
                Put this same bot on {host}. It answers your visitors from your own pages, free.
                We’ll email you a code to confirm the address.
              </p>

              <form
                className="flex w-full max-w-[620px] flex-col gap-3 sm:flex-row"
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
                  {busy ? 'Sending' : 'Send me a code'}
                </Button>
              </form>
            </>
          )}

          {notice && <p className="text-body-sm text-cream/60">{notice}</p>}

          {error && (
            <p role="alert" className="text-body-sm text-crimson">
              {error}
            </p>
          )}
        </div>
      </Container>
    </Section>
  )
}

function ScoreRow({
  name,
  verdict,
  headline,
  lines,
}: {
  name: string
  verdict: Verdict
  headline: string
  lines: string[]
}) {
  const tone = { fail: 'text-crimson', weak: 'text-ink', pass: 'text-teal-deep' }[verdict]

  return (
    <div className="flex flex-col gap-3 border-t border-ink/15 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-h3 text-ink">{name}</h3>
        <span className={cn('text-h4 text-right', tone)}>{headline}</span>
      </div>
      {lines.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40" />
              <span className="text-body text-ink/70">{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function pathOnly(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

/* -------------------------------------------------------------- 5. Empty */

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
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col gap-8 py-10">
          <SectionHeading tone="cream" size="h2" eyebrow={host}>
            We could not read your site
          </SectionHeading>

          <p className="text-body-lg text-cream/80">
            We reached your pages, but they returned almost no readable text — usually because
            everything is drawn by JavaScript after the page loads. An AI assistant reading your
            site sees what we saw: an empty page.
          </p>

          <div className="flex flex-col gap-3 rounded-md border border-cream/20 p-6">
            <span className="text-h5 uppercase text-cream/60">What we found</span>
            {[
              ['Sitemap', signals?.sitemapFound ? 'Found' : 'Not found'],
              ['robots.txt', signals?.robotsBlockedAll ? 'Blocks crawling' : 'Allows crawling'],
              ['Pages we could open', String(pages)],
              ['Readable text without JavaScript', 'Almost none'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-4 border-b border-cream/10 pb-2 text-body"
              >
                <span className="text-cream/70">{k}</span>
                <span className="text-cream">{v}</span>
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk about a rebuild
            </Button>
            <Button variant="outline" data-on-dark="true" onClick={onRetry}>
              Read my site again
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------------ 6. Blocked */

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
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col gap-8 py-10">
          <SectionHeading tone="cream" size="h2" eyebrow={host}>
            We couldn’t reach that site
          </SectionHeading>

          <p className="text-body-lg text-cream/80">
            {signals?.robotsBlockedAll
              ? 'Your robots.txt blocks automated readers from every page. Search engines and AI assistants hit the same wall we just did.'
              : 'Nothing came back that we could read. The site may be down, very slow, or blocking automated readers.'}
          </p>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
            <Button variant="outline" data-on-dark="true" onClick={onBack}>
              Try another address
            </Button>
            <Button variant="filled" icon="arrow-right" href="/contact">
              Talk to us
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
