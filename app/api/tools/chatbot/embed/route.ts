import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { claimSchema } from '@/lib/tools/chatbot/schema'
import {
  createEmbed,
  embedSnippet,
  findEmbedBySession,
  mintKey,
} from '@/lib/tools/chatbot/embed'
import { isVerified } from '@/lib/tools/chatbot/verification'
import { getSession } from '@/lib/tools/session'

/**
 * Claim an embed: mint a key for a verified address and return the snippet.
 *
 * The address must already have completed the code exchange — see
 * app/api/tools/chatbot/verify/route.ts. Delivery of that code is stubbed
 * until a provider exists, but the exchange itself is real, so this gate holds
 * either way.
 *
 * Claiming makes this session's corpus permanent: the live bot answers from
 * it, so any pruning job must skip sessions with an embed.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = claimSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid email address.' },
      { status: 400 },
    )
  }

  const { env } = getCloudflareContext()
  const db = env.DB

  const session = await getSession(db, parsed.data.sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 404 })
  }

  // A bot with nothing to answer from would embarrass whoever installs it.
  if (session.status !== 'ready') {
    return NextResponse.json(
      { ok: false, error: 'There is not enough on that site to build a bot from yet.' },
      { status: 409 },
    )
  }

  // The gate. A key is only minted for an address that proved it owns the
  // inbox — otherwise the email is worth no more than the click that preceded it.
  const verified = await isVerified(db, session.id, parsed.data.email)
  if (!verified) {
    return NextResponse.json(
      { ok: false, error: 'Verify your email address first.', needsVerification: true },
      { status: 403 },
    )
  }

  const origin = new URL(req.url).origin

  // Claiming twice returns the same key rather than minting a second one —
  // otherwise a refresh silently orphans the snippet they already pasted.
  const existing = await findEmbedBySession(db, session.id)
  if (existing) {
    return NextResponse.json({
      ok: true,
      key: existing.key,
      host: existing.bound_host,
      snippet: embedSnippet(existing.key, origin),
      alreadyClaimed: true,
    })
  }

  const key = mintKey()
  await createEmbed(db, {
    key,
    sessionId: session.id,
    boundHost: session.host.replace(/^www\./, ''),
    email: parsed.data.email,
    crawledAt: new Date().toISOString(),
  })

  // Mirror the email onto the session too, so the funnel reads in one place.
  await db
    .prepare('UPDATE tool_sessions SET email = ? WHERE id = ?')
    .bind(parsed.data.email, session.id)
    .run()

  return NextResponse.json({
    ok: true,
    key,
    host: session.host,
    snippet: embedSnippet(key, origin),
    alreadyClaimed: false,
  })
}
