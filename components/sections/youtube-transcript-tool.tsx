'use client'

import { useEffect, useMemo, useState } from 'react'
import { SiteNav } from '@/components/site-nav'
import { ToolNav } from '@/components/tools/tool-nav'
import { ToolSteps, type ToolStep } from '@/components/tools/tool-steps'
import { ToolWindow, TOOL_WINDOW_BODY, downloadText, useCopy } from '@/components/tools/tool-window'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Field, Input, Select } from '@/components/ui/form'
import { PaperBackground } from '@/components/ui/paper-background'
import { Pill } from '@/components/ui/pill'
import { Reveal } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { FourPointStar, Sparkle } from '@/components/icons'
import {
  MIME_TYPE,
  clock,
  filename,
  render,
  type TranscriptFormat,
} from '@/lib/tools/youtube/render'
import type { TranscriptSegment, TranscriptTrack } from '@/lib/tools/youtube/fetch-transcript'

/**
 * The YouTube transcript generator: paste a link, get the transcript.
 *
 * Wired to POST /api/tools/youtube/transcript — plain JSON, no stream. One
 * round trip, roughly a second and a half, so there is a spinner rather than a
 * live log.
 *
 * **Every format is rendered here, in the browser, from one payload.** The
 * route returns `segments[]` and nothing else; switching between plain text,
 * timestamps, SRT and VTT costs no request, which is why the toggles feel
 * instant and why re-reading a video is never necessary to change format.
 *
 * Failures return the visitor to the form with the message inline, rather than
 * to a dead-end screen like the crawl tools use. Those spend twenty seconds
 * before they can fail, so going back to the start loses real work; this costs
 * a second, and the fix is almost always "paste a different link".
 *
 * Nothing is stored — the transcript lives in state for the session and
 * Download is a client-side Blob. See docs/youtube-transcript-architecture.md.
 *
 * Plan: docs/youtube-transcript-plan.md
 */

type Phase = 'idle' | 'loading' | 'result'

type Result = {
  videoId: string
  title: string
  channel: string
  duration: number
  tracks: TranscriptTrack[]
  track: TranscriptTrack
  segments: TranscriptSegment[]
}

const FORMATS: { id: TranscriptFormat; label: string; note: string }[] = [
  { id: 'text', label: 'Plain text', note: 'Prose, no timestamps. The one to paste into an AI.' },
  { id: 'timestamped', label: 'Timestamps', note: 'One line per caption, prefixed with its start time.' },
  { id: 'srt', label: 'SRT', note: 'Subtitle file for video editors and most players.' },
  { id: 'vtt', label: 'VTT', note: 'Web captions, for a <track> element on your own site.' },
]

export function YoutubeTranscriptTool() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [format, setFormat] = useState<TranscriptFormat>('text')

  async function load(lang?: string) {
    const target = url.trim()
    if (!target) {
      setError('Paste a YouTube link.')
      return
    }

    setError(null)
    setPhase('loading')

    try {
      const res = await fetch('/api/tools/youtube/transcript', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: target, lang }),
      })

      const body = (await res.json()) as Partial<Result> & { ok?: boolean; error?: string }

      if (!res.ok || !body.ok || !body.segments) {
        setError(body.error ?? 'Something went wrong. Try another link.')
        setPhase('idle')
        return
      }

      setResult(body as Result)
      setPhase('result')
    } catch {
      setError('We could not reach YouTube just now. Try again shortly.')
      setPhase('idle')
    }
  }

  // Each phase is a swap rather than a navigation, so the browser keeps the
  // old scroll position and a result would open half way down.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      {/* The result screen renders its own nav inside its `<PaperBackground>`,
          so the texture runs behind it unbroken — an ink nav stacked above one
          shows a band of flat green and a visible seam. */}
      {phase === 'loading' && <ToolNav tone="ink" />}

      {phase === 'idle' && (
        <IdleScreen url={url} error={error} onChange={setUrl} onSubmit={() => void load()} />
      )}

      {phase === 'loading' && <LoadingScreen />}

      {phase === 'result' && result && (
        <ResultScreen
          result={result}
          format={format}
          onFormat={setFormat}
          onLanguage={(lang) => void load(lang)}
          onReset={() => {
            setResult(null)
            setUrl('')
            setPhase('idle')
          }}
        />
      )}
    </>
  )
}

/* --------------------------------------------------------------- 1. Idle */

const HOW_IT_WORKS: ToolStep[] = [
  ['01', 'Paste the link', 'Any YouTube URL — a watch page, a youtu.be short link, a Short, or a live replay.'],
  ['02', 'We read the captions', 'The real caption track, straight from YouTube. Creator-written where it exists, auto-generated where it does not.'],
  ['03', 'Take it away', 'Plain text, timestamps, SRT or VTT. Copy it or download it. No signup, no watermark.'],
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
            <Pill tone="cream-on-dark">Free · No signup · About two seconds</Pill>

            <h1 className="text-display max-w-[900px] text-balance text-cream">
              YouTube transcript generator
            </h1>

            <p className="text-body-lg max-w-[640px] text-beige">
              Paste any YouTube link and get the full transcript — as plain text, with timestamps,
              or as a subtitle file. Nothing to install and nothing to sign up for.
            </p>

            <form
              className="flex w-full max-w-[680px] flex-col gap-3 sm:flex-row"
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <Field label="YouTube video link" className="flex-1">
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="youtube.com/watch?v=..."
                  value={url}
                  invalid={Boolean(error)}
                  onChange={(e) => onChange(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Button type="submit" variant="filled" icon="arrow-right" className="h-16 shrink-0">
                Get transcript
              </Button>
            </form>

            {error ? (
              <p role="alert" className="text-body-sm max-w-[560px] text-crimson">
                {error}
              </p>
            ) : (
              <p className="text-body-sm text-cream/60">
                Works on any public video that has captions. We store nothing.
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
                <SectionHeading tone="ink" size="h2" eyebrow="Four formats">
                  The same transcript, however you need it
                </SectionHeading>
                <p className="text-body-lg text-ink/70">
                  Most tools give you a wall of text. You also get timestamps for citing a moment,
                  and real <span className="text-code">.srt</span> /{' '}
                  <span className="text-code">.vtt</span> subtitle files that load straight into a
                  video editor or a <span className="text-code">&lt;track&gt;</span> element.
                </p>
                <ul className="flex flex-col gap-3">
                  {FORMATS.map((f) => (
                    <li key={f.id} className="flex items-start gap-3">
                      <Sparkle size={12} className="mt-1.5 shrink-0 text-crimson" />
                      <span className="text-body text-ink/70">
                        <span className="text-ink">{f.label}</span> — {f.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <FourPointStar size={40} className="hidden shrink-0 text-crimson lg:block" />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}

/* ------------------------------------------------------------ 2. Loading */

function LoadingScreen() {
  return (
    <Section tone="ink" className="min-h-[70vh]">
      <Container>
        <div className="flex flex-col gap-8 py-16">
          <SectionHeading tone="cream" size="h2" eyebrow="YouTube">
            Reading the captions
          </SectionHeading>

          <p className="text-body-lg max-w-[620px] text-cream/70">
            Finding the video, picking the best caption track, and pulling the whole thing down.
          </p>

          <span className="flex items-center gap-2.5 text-body text-cream">
            <Sparkle size={12} className="shrink-0 text-crimson" />
            This takes a second or two
          </span>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------------- 3. Result */

function ResultScreen({
  result,
  format,
  onFormat,
  onLanguage,
  onReset,
}: {
  result: Result
  format: TranscriptFormat
  onFormat: (f: TranscriptFormat) => void
  onLanguage: (lang: string) => void
  onReset: () => void
}) {
  // Re-rendered only when the segments or the format actually change — a long
  // podcast is tens of thousands of cues, and rebuilding that string on every
  // keystroke elsewhere in the tree would be felt.
  const output = useMemo(() => render(result.segments, format), [result.segments, format])

  const { copied, copy } = useCopy(output)

  const words = useMemo(
    () => result.segments.reduce((n, s) => n + s.text.split(/\s+/).length, 0),
    [result.segments],
  )

  return (
    <>
      {/* The transcript is a window lying on the site's paper texture, not a
          panel of the page. The chrome carries the metadata — filename, format,
          language, counts — so the page around it stays quiet. */}
      <PaperBackground className="text-cream">
        <ToolNav tone="transparent" />
        <Section tone="transparent">
          <Container>
            <div className="flex flex-col gap-8 py-6">
              <SectionHeading tone="cream" size="h2" eyebrow={result.channel || 'YouTube'}>
                Your transcript
              </SectionHeading>

              {/* The video's own title is content, not a section label, so it
                  sits below the heading rather than inside it — wrapped in the
                  heading's `/ slashes /` it read as a label and set a 60-character
                  title at 48px. */}
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h3 className="text-h3 max-w-[700px] text-balance text-cream/75">{result.title}</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" data-on-dark="true" size="md" onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="filled" size="md" onClick={() => downloadText(output, filename(result.title, format), MIME_TYPE[format])}>
                    Download
                  </Button>
                </div>
              </div>

              <ToolWindow
                filename={filename(result.title, format)}
                status={[
                  result.duration ? clock(result.duration) : null,
                  `${words.toLocaleString()} words`,
                  `${result.segments.length.toLocaleString()} lines`,
                ]}
                toolbar={
                  <>
                    {/* Format switching is free — all four render from the
                        segments already in state, so none costs a request. */}
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Transcript format">
                      {FORMATS.map((f) => (
                        <Button
                          key={f.id}
                          size="md"
                          variant={f.id === format ? 'filled' : 'outline'}
                          aria-pressed={f.id === format}
                          className="px-5 py-2.5"
                          onClick={() => onFormat(f.id)}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>

                    {result.tracks.length > 1 ? (
                      <Field label="Caption language" className="w-full sm:w-auto sm:min-w-[220px]">
                        <Select
                          value={result.track.languageCode}
                          className="h-11"
                          onChange={(e) => onLanguage(e.target.value)}
                        >
                          {result.tracks.map((t) => (
                            <option key={`${t.languageCode}-${t.generated}`} value={t.languageCode}>
                              {t.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    ) : (
                      <span className="text-body-sm shrink-0 text-ink/50">
                        <span className="text-code">
                          {result.track.label}
                          {result.track.generated ? ' · auto-generated' : ''}
                        </span>
                      </span>
                    )}
                  </>
                }
              >
                <TranscriptBody format={format} output={output} segments={result.segments} />
              </ToolWindow>
            </div>
          </Container>
        </Section>
      </PaperBackground>

      <Section tone="beige">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 py-4 lg:flex-row lg:items-end">
            <div className="flex max-w-[680px] flex-col gap-5">
              <SectionHeading tone="ink" size="h2" eyebrow="While you are here">
                A transcript is a page waiting to happen
              </SectionHeading>
              <p className="text-body-lg text-ink/70">
                This text is the most searchable thing about that video, and right now it only
                exists inside a player. Turned into a real page it gets indexed, quoted and read by
                the assistants your buyers now ask first. That is the kind of thing we build.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button variant="filled" icon="arrow-right" href="/contact">
                Talk to us
              </Button>
              <Button variant="outline" onClick={onReset}>
                Another video
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

/* --------------------------------------------------------- 4. Window body */

/**
 * The transcript itself, drawn three ways.
 *
 * Copy and Download always hand over `output`, the rendered string — this only
 * changes what is on screen.
 *
 * Timestamps get a real two-column layout off `segments` rather than the
 * rendered string, because the crimson time gutter is the whole point of this
 * treatment and `[00:00:09] line` inside a `<pre>` cannot produce one. SRT and
 * VTT stay verbatim in mono: they are file formats, and showing them as files
 * is what tells you what you are about to download.
 */
function TranscriptBody({
  format,
  output,
  segments,
}: {
  format: TranscriptFormat
  output: string
  segments: TranscriptSegment[]
}) {
  const shell = TOOL_WINDOW_BODY

  if (format === 'timestamped') {
    return (
      <div className={shell}>
        <div className="flex flex-col gap-4">
          {segments.map((segment, i) => (
            <div key={`${segment.start}-${i}`} className="flex items-baseline gap-7">
              <span className="text-body-sm w-[72px] shrink-0">
                <span className="text-code text-crimson">{clock(segment.start)}</span>
              </span>
              <span className="text-body text-ink">{segment.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (format === 'text') {
    // `whitespace-pre-wrap` keeps the renderer's paragraph breaks without
    // turning prose into a horizontally scrolling block.
    return (
      <div className={shell}>
        <p className="text-body max-w-[760px] whitespace-pre-wrap text-ink">{output}</p>
      </div>
    )
  }

  return (
    <div className={shell}>
      {/* Cue-per-line, so it must not wrap — a wrapped SRT timestamp reads as a
          broken file. Scrolls sideways inside the window instead. */}
      <pre className="text-body-sm overflow-x-auto text-ink">
        <span className="text-code">{output}</span>
      </pre>
    </div>
  )
}
