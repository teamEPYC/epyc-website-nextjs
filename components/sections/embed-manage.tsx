'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'

/**
 * The owner's one-button page for a live embed: read my site again.
 *
 * Deliberately not in the widget. The widget is shown to the customer's own
 * visitors, and a recrawl points twenty page requests at their server — that
 * cannot be a button a stranger can press. The signed link in `?key` + `?t` is
 * the only way here, and the route re-checks both.
 *
 * No status is fetched on load: the page holds nothing worth a second route
 * until the button is pressed, and the response carries everything worth
 * showing.
 */
export function EmbedManage({ embedKey, token }: { embedKey: string; token: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ host: string; pages: number } | null>(null)

  const linkLooksValid = embedKey.startsWith('ek_live_') && token.length > 0

  async function recrawl() {
    if (busy) return
    setBusy(true)
    setError(null)
    setDone(null)

    try {
      const res = await fetch('/api/tools/chatbot/recrawl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: embedKey, t: token }),
      })
      const body = (await res.json()) as {
        ok: boolean
        host?: string
        pages?: number
        error?: string
      }

      if (body.ok && body.host) {
        setDone({ host: body.host, pages: body.pages ?? 0 })
      } else {
        setError(body.error ?? 'Something went wrong. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section tone="ink">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col gap-6">
          <SectionHeading tone="cream" size="h2">
            Refresh your assistant
          </SectionHeading>

          {!linkLooksValid ? (
            <p className="text-body-lg text-cream/80">
              This link is incomplete. Use the full link from the page where you got your embed
              code.
            </p>
          ) : done ? (
            <>
              <p className="text-body-lg text-cream/80">
                Read {done.pages} {done.pages === 1 ? 'page' : 'pages'} of {done.host}. Your
                assistant now answers from what is on your site today. Nothing on your site needs
                changing — the code you pasted is unchanged.
              </p>
              <Button variant="outline" data-on-dark="true" onClick={() => setDone(null)}>
                Read it again
              </Button>
            </>
          ) : (
            <>
              <p className="text-body-lg text-cream/80">
                Your assistant answers from a snapshot of your site. Changed something? Read it
                again and the assistant picks it up. Takes about 20 seconds, and the code on your
                site stays exactly as it is.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="filled" icon="arrow-right" disabled={busy} onClick={recrawl}>
                  {busy ? 'Reading your site' : 'Read my site again'}
                </Button>
                <span className="text-body-sm text-cream/60">Three times a day.</span>
              </div>
            </>
          )}

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
