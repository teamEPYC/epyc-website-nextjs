import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { z } from 'zod'
import { bumpCounter, underLimit } from '@/lib/tools/counters'
import {
  GENERATIONS_PER_SESSION,
  GLOBAL_GENERATIONS_PER_DAY,
  generateLlmsTxt,
} from '@/lib/tools/llms-txt/generate'
import { renderLlmsTxt } from '@/lib/tools/llms-txt/render'
import { getSession, loadPages } from '@/lib/tools/session'

/**
 * Write the visitor's `llms.txt` from the corpus we already crawled.
 *
 * Plain JSON, not SSE. The crawl streams because twenty seconds of silence
 * loses a stranger; this is one model call behind a spinner, and streaming it
 * would buy a five-second wait they already expect at the cost of a second
 * client reader and partial-JSON rendering.
 *
 * The file is returned, never stored — see docs/llms-txt-architecture.md §2.3.
 *
 * It returns the file and the pages that could not be described, and nothing
 * else. The crawl still writes the measured site checks to
 * `tool_sessions.diagnosis_json`, but this tool no longer renders them, so
 * re-reading them here would be work for a screen that does not exist.
 */

const generateSchema = z.object({ sessionId: z.string().uuid() })

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = generateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const db = env.DB

  const session = await getSession(db, parsed.data.sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 404 })
  }

  if (session.status !== 'ready') {
    return NextResponse.json(
      { ok: false, error: 'There is not enough readable text on that site to describe.' },
      { status: 409 },
    )
  }

  // Before any cap is consumed: a 503 from our own misconfiguration must not
  // cost the visitor one of their three generations.
  const apiKey = env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set')
    return NextResponse.json({ ok: false, error: 'This tool is unavailable.' }, { status: 503 })
  }

  // Both caps are checked before either is consumed — the same shape as
  // issueCode in lib/tools/chatbot/verification.ts, and for the same reason: a
  // request rejected by one limit must not burn an allowance from the other.
  //
  // Check-then-consume is not atomic. Under a race the worst case is one extra
  // generation, which is the right way to be wrong for a limit whose job is
  // stopping bulk abuse rather than counting exactly.
  const sessionKey = `llms-gen:${session.id}`
  const globalKey = 'global-llms-txt'

  if (!(await underLimit(db, sessionKey, GENERATIONS_PER_SESSION))) {
    return NextResponse.json(
      { ok: false, error: 'You’ve rewritten this file a few times today. Try again tomorrow.' },
      { status: 429 },
    )
  }

  // The backstop on the shared OpenRouter account quota. Per-visitor limits
  // cannot protect it — see GLOBAL_GENERATIONS_PER_DAY.
  if (!(await underLimit(db, globalKey, GLOBAL_GENERATIONS_PER_DAY))) {
    return NextResponse.json(
      { ok: false, capped: true, error: 'The tool is busy today. Try again tomorrow.' },
      { status: 429 },
    )
  }

  await bumpCounter(db, sessionKey, GENERATIONS_PER_SESSION)
  await bumpCounter(db, globalKey, GLOBAL_GENERATIONS_PER_DAY)

  const pages = await loadPages(db, session.id)

  let generated
  try {
    generated = await generateLlmsTxt(apiKey, session.host, pages, {
      allowPaid: env.OPENROUTER_ALLOW_PAID === 'true',
    })
  } catch (err) {
    console.error('llms.txt generation failed', err)
    return NextResponse.json(
      { ok: false, error: 'We couldn’t write your file just now. Try again shortly.' },
      { status: 503 },
    )
  }

  // `read = described + skipped + excluded`, always. The screen shows all four,
  // so a page that fell out of the file for one reason must not be counted
  // under another — "20 read, 14 described, 3 skipped" invites the reader to
  // wonder about the other three.
  const considered = pages.length - generated.excluded

  return NextResponse.json({
    ok: true,
    host: session.host,
    file: renderLlmsTxt(generated.doc),
    stats: {
      read: pages.length,
      pages: considered,
      described: considered - generated.skipped.length,
      skipped: generated.skipped.length,
      excluded: generated.excluded,
    },
    skipped: generated.skipped,
  })
}
