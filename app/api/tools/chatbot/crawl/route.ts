import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { crawlSite, type CrawlProgress } from '@/lib/crawl/fetch-pages'
import { validateUrl } from '@/lib/crawl/validate-url'
import { crawlSchema } from '@/lib/tools/chatbot/schema'
import { bumpCounter, capsFor, counterKeys, underLimit } from '@/lib/tools/counters'
import { scoreDeterministic } from '@/lib/tools/chatbot/diagnosis'
import {
  copyPages,
  createSession,
  finishSession,
  findRecentCrawl,
  getSession,
  hashIp,
  loadPagesForScoring,
  savePages,
  saveDiagnosis,
} from '@/lib/tools/session'

/**
 * Read a visitor's website and build the corpus their chatbot answers from.
 *
 * Runs the crawl inline and streams progress as Server-Sent Events, rather
 * than handing it to a queue and polling for status — see
 * docs/ai-chatbot-architecture.md §2.2. The whole crawl is capped at 20
 * seconds, so this is a short-lived request, not a long-poll.
 *
 * Every event is one line of `event:` + `data:`. The client renders `page`
 * events as the live log and waits for `done`.
 */

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = crawlSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a website address.' }, { status: 400 })
  }

  // Cheapest rejection first: a bad address never reaches the network.
  const checked = validateUrl(parsed.data.url)
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.reason }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const db = env.DB

  const ip = req.headers.get('cf-connecting-ip') ?? '0.0.0.0'
  const ipHash = await hashIp(ip, env.TOOLS_IP_SALT ?? 'dev-salt-not-for-production')
  const ipKey = counterKeys.ip(ipHash)

  // Checked, not consumed: a crawl that fails should not cost the visitor one
  // of their three. The counter is bumped once a session actually exists.
  const caps = capsFor(env)
  if (!(await underLimit(db, ipKey, caps.sessionsPerIp))) {
    return NextResponse.json(
      {
        ok: false,
        error: `You've used your ${caps.sessionsPerIp} checks for today. They reset at midnight UTC.`,
        capped: true,
      },
      { status: 429 },
    )
  }

  const sessionId = crypto.randomUUID()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        await createSession(db, {
          id: sessionId,
          tool: 'chatbot',
          targetUrl: checked.url,
          host: checked.host,
          ipHash,
          status: 'crawling',
        })

        // A recent read of the same host is copied instead of re-fetched.
        if (!parsed.data.force) {
          const recent = await findRecentCrawl(db, checked.host)
          if (recent) {
            const copied = await copyPages(db, recent.id, sessionId)
            await finishSession(db, sessionId, 'ready', copied)
            await bumpCounter(db, ipKey, caps.sessionsPerIp)

            // Copy the report too, not just the pages. Same host, same corpus,
            // so the scores are identical — and it saves a model call.
            // Without this the session has no diagnosis at all, and the later
            // background merge produces an object with answerability but no
            // structure or crawlability, which the report then dereferences.
            const source = await getSession(db, recent.id)
            if (source?.diagnosis_json) {
              await saveDiagnosis(db, sessionId, JSON.parse(source.diagnosis_json))
            } else {
              const pages = await loadPagesForScoring(db, sessionId)
              await saveDiagnosis(db, sessionId, scoreDeterministic(pages, {}, false))
            }
            send('status', { message: 'We read this site recently — using that.' })
            send('done', { sessionId, pages: copied, status: 'ready', reused: true })
            // No close() here — `return` runs the finally block below, which
            // closes exactly once. Closing here too threw
            // "Invalid state: Controller is already closed" and failed the
            // whole response, on the one path that was supposed to be fastest.
            return
          }
        }

        const result = await crawlSite(checked.url, {
          onProgress: (p: CrawlProgress) => {
            if (p.type === 'status') send('status', { message: p.message })
            else send('page', { url: pathOf(p.url), title: p.title, done: p.done, total: p.total })
          },
        })

        const readable = result.pages.filter((p) => !p.isEmpty)
        const status = result.signals.robotsBlockedAll || result.signals.unreachable
          ? 'failed'
          : readable.length === 0
            ? 'empty'
            : 'ready'

        await savePages(db, sessionId, result.pages)
        await finishSession(db, sessionId, status, result.pages.length)
        await bumpCounter(db, ipKey, caps.sessionsPerIp)

        // Three of the five dimensions are free — they come straight from what
        // we just extracted. Scoring them now means a visitor who never sends a
        // message still has most of a report, and the empty-site path (which
        // has no message one to trigger on) is covered.
        await saveDiagnosis(db, sessionId, scoreDeterministic(result.pages, result.signals))

        send('done', {
          sessionId,
          pages: result.pages.length,
          readablePages: readable.length,
          status,
          signals: result.signals,
        })
      } catch (err) {
        console.error('crawl failed', err)
        await finishSession(db, sessionId, 'failed', 0).catch(() => {})
        send('error', { message: "We couldn't read that site. Try another address." })
      } finally {
        // Closing an already-closed controller throws and fails the response,
        // so this is the single close for every path through the handler.
        try {
          controller.close()
        } catch {
          // Already closed — nothing to do.
        }
      }
    },
  })

  // Keep the connection un-buffered end to end. `x-accel-buffering` is ignored
  // by Cloudflare but matters behind any proxy in front of a local dev server.
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  })
}

/** The log shows paths, not full URLs — shorter, and it reads as *their* site. */
function pathOf(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}
