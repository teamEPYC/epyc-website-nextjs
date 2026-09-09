'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The application-window frame the free tools hand their output back in.
 *
 * Shared by the tools that produce a *file* — the transcript generator and the
 * llms.txt generator both end in "here is the thing, take it away", and the
 * window is what makes that read as a file you own rather than a panel of a
 * marketing page. Lifted out of `youtube-transcript-tool.tsx`, unchanged, when
 * the llms.txt generator needed the same frame — the same route `CrawlLog` and
 * `ScoreRow` took before it.
 *
 * Designed to sit inside a `<PaperBackground>`: the shadow and the ink title
 * bar are what lift it off the texture, and on a flat `bg-beige` section they
 * have nothing to lift off.
 *
 * The chrome carries the metadata so the page around it stays quiet — the
 * filename you would save, whatever switches the tool has, and the counts.
 * That is the whole point of the treatment; a caller that passes none of them
 * has a plain box and should use one.
 */
export function ToolWindow({
  filename,
  toolbar,
  status,
  children,
  className,
}: {
  /** Centred in the title bar. The name the Download button actually writes. */
  filename: string
  /** Controls belonging to the output — format switches, language pickers. */
  toolbar?: ReactNode
  /** Short facts for the status bar. Falsy entries are dropped. */
  status?: (string | null | false)[]
  /** The output itself. Owns its own padding and scrolling. */
  children: ReactNode
  className?: string
}) {
  const facts = (status ?? []).filter(Boolean) as string[]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-sm border border-ink/35 shadow-[0_32px_70px_-24px_rgba(24,50,41,0.65)]',
        className,
      )}
    >
      {/* Title bar. The three dots are EPYC's own colours rather than macOS
          red/amber/green — the window reads as a window without importing a
          palette this site has nowhere else. */}
      <div className="text-body-sm flex items-center gap-5 bg-ink px-5 py-4">
        <div aria-hidden="true" className="flex shrink-0 gap-2">
          <span className="h-3 w-3 rounded-pill bg-crimson" />
          <span className="h-3 w-3 rounded-pill bg-sand" />
          <span className="h-3 w-3 rounded-pill bg-teal-deep" />
        </div>
        <span className="text-code min-w-0 grow truncate text-center text-cream/55">{filename}</span>
        {/* Balances the dots so the filename is optically centred. */}
        <span aria-hidden="true" className="w-[60px] shrink-0" />
      </div>

      {/* Omitted rather than rendered empty: a bare toolbar strip reads as a
          control that failed to load. */}
      {toolbar ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/12 bg-bone px-5 py-3">
          {toolbar}
        </div>
      ) : null}

      {children}

      {facts.length > 0 ? (
        <div className="text-body-sm flex flex-wrap items-center gap-x-7 gap-y-1 border-t border-ink/12 bg-bone px-5 py-3">
          {facts.map((fact) => (
            <span key={fact} className="text-code text-ink/55">
              {fact}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * Padding and scroll behaviour for whatever goes in the window body.
 *
 * Exported as a class string rather than a wrapper component because each tool
 * lays its own output out differently inside it — ruled rows, prose, a verbatim
 * file — and a wrapper would only be somewhere to pass the difference through.
 */
export const TOOL_WINDOW_BODY = 'max-h-[620px] overflow-auto bg-cream-light p-6 sm:p-10'

/**
 * Copy-to-clipboard with the two-second "Copied" state every tool shows.
 *
 * Shared because all three had the same twelve lines. `onFail` is optional:
 * where the text is on screen and selectable a denied clipboard needs no
 * message, and where it is a snippet to paste elsewhere it does.
 */
export function useCopy(text: string, onFail?: (message: string) => void) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onFail?.('Copy failed — select the text and copy it manually.')
    }
  }

  return { copied, copy }
}

/**
 * Save a string the browser already holds as a file.
 *
 * Nothing round-trips to the server for a download: the transcript and the
 * llms.txt are both in state by the time the button exists, so this is a Blob
 * and a synthetic click. Revoked immediately — the click is synchronous.
 */
export function downloadText(text: string, filename: string, mime: string) {
  const href = URL.createObjectURL(new Blob([text], { type: mime }))
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}
