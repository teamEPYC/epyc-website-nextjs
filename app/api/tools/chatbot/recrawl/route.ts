import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { crawlSite } from '@/lib/crawl/fetch-pages'
import { validateUrl } from '@/lib/crawl/validate-url'
import { recrawlSchema } from '@/lib/tools/chatbot/schema'
import {
  EMBED_RECRAWLS_PER_DAY,
  consumeRecrawl,
  findEmbedByKey,
  isEmbedKey,
  manageToken,
} from '@/lib/tools/chatbot/embed'
import { scoreDeterministic } from '@/lib/tools/chatbot/diagnosis'
import { clearPages, finishSession, getSession, savePages, saveDiagnosis } from '@/lib/tools/session'

/**
 * Re-read a live embed's site and replace its corpus.
 *
 * Reached only from the signed manage link — there is deliberately no button in
 * the widget, because the widget is shown to the customer's visitors and a
 * recrawl points 20 pages of traffic at their own server. The owner holds the
 * link; nobody else has a way in.
 *
 * The embed's `session_id` never changes, so the snippet already pasted into
 * their HTML keeps working. Only the pages underneath it are swapped.
 *
 * Plain JSON, not SSE: one person clicking one button can wait with a spinner.
 * The live progress stream on the demo crawl exists to make a stranger trust
 * the tool, which is not this audience.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = recrawlSchema.safeParse(json)
  if (!parsed.success || !isEmbedKey(parsed.data.key)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const db = env.DB
  const salt = env.TOOLS_IP_SALT ?? 'dev-salt-not-for-production'

  const embed = await findEmbedByKey(db, parsed.data.key)
  if (!embed || embed.status !== 'active') {
    return NextResponse.json({ ok: false, error: 'That link is no longer valid.' }, { status: 404 })
  }

  // ponytail: plain string compare. This is an HMAC over a network round trip,
  // not a local secret check — a timing oracle here is not a practical attack.
  if (parsed.data.t !== (await manageToken(embed.key, salt))) {
    return NextResponse.json({ ok: false, error: 'That link is no longer valid.' }, { status: 403 })
  }

  if (!(await consumeRecrawl(db, embed.bound_host))) {
    return NextResponse.json(
      {
        ok: false,
        error: `You've refreshed ${embed.bound_host} ${EMBED_RECRAWLS_PER_DAY} times today. It resets at midnight UTC.`,
      },
      { status: 429 },
    )
  }

  const session = await getSession(db, embed.session_id)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That link is no longer valid.' }, { status: 404 })
  }

  // Re-validated, not trusted from the row. The stored URL was safe when it was
  // crawled; this is the same gate the demo crawl runs, applied again.
  const checked = validateUrl(session.target_url)
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.reason }, { status: 400 })
  }

  try {
    const result = await crawlSite(checked.url)
    const readable = result.pages.filter((p) => !p.isEmpty)

    // A failed or empty recrawl must never wipe a working bot. Their site may
    // simply have been down for the twenty seconds we were reading it, and the
    // old corpus is better than none on a page their customers are using.
    if (readable.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'We could not read your site just now, so your bot is unchanged. Try again shortly.',
        },
        { status: 502 },
      )
    }

    await clearPages(db, embed.session_id)
    await savePages(db, embed.session_id, result.pages)
    await finishSession(db, embed.session_id, 'ready', result.pages.length)
    await saveDiagnosis(db, embed.session_id, scoreDeterministic(result.pages, result.signals))

    const crawledAt = new Date().toISOString()
    await db
      .prepare('UPDATE tool_embeds SET crawled_at = ? WHERE key = ?')
      .bind(crawledAt, embed.key)
      .run()

    return NextResponse.json({
      ok: true,
      host: embed.bound_host,
      pages: readable.length,
      crawledAt,
    })
  } catch (err) {
    console.error('recrawl failed', err)
    return NextResponse.json(
      { ok: false, error: 'We could not read your site just now, so your bot is unchanged.' },
      { status: 502 },
    )
  }
}
