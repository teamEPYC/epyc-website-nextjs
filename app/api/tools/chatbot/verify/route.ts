import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { sendEmail, verificationEmail } from '@/lib/tools/email'
import { verifySendSchema, verifyCheckSchema } from '@/lib/tools/chatbot/schema'
import {
  CODE_TTL_MINUTES,
  checkCode,
  issueCode,
} from '@/lib/tools/chatbot/verification'
import { getSession, toolsSalt } from '@/lib/tools/session'

/**
 * Send a verification code, and check one.
 *
 * One route with an `action` rather than two, because the pair share every
 * lookup and guard. Sending is stubbed until an email provider exists — see
 * lib/tools/email.ts — but everything else is real.
 */
export async function POST(req: Request) {
  const json = (await req.json().catch(() => null)) as { action?: string } | null

  const { env } = getCloudflareContext()
  const db = env.DB

  // Codes are stored as an HMAC under this. A published fallback would mean
  // stored hashes are reversible by brute force over a million six-digit codes.
  const pepper = toolsSalt(env)
  if (!pepper) {
    console.error('TOOLS_IP_SALT is not set')
    return NextResponse.json({ ok: false, error: 'This is unavailable.' }, { status: 503 })
  }

  if (json?.action === 'check') {
    const parsed = verifyCheckSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Enter the 6-digit code.' }, { status: 400 })
    }

    const result = await checkCode(db, { ...parsed.data, pepper })
    if (result.ok) return NextResponse.json({ ok: true })

    // Deliberately vague on wrong-code: saying how many attempts remain helps
    // a guesser more than it helps a person who mistyped.
    const message = {
      'no-code': 'That code has expired. Ask for a new one.',
      expired: 'That code has expired. Ask for a new one.',
      'too-many-attempts': 'Too many attempts. Ask for a new code.',
      'wrong-code': 'That code is not right.',
    }[result.reason]

    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }

  const parsed = verifySendSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 })
  }

  const session = await getSession(db, parsed.data.sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 404 })
  }

  const issued = await issueCode(db, {
    sessionId: session.id,
    email: parsed.data.email,
    pepper,
  })

  if (!issued.ok) {
    const message =
      issued.reason === 'email-capped'
        ? 'That address has been sent too many codes today. Try again tomorrow.'
        : 'Too many codes requested. Try again tomorrow.'
    return NextResponse.json({ ok: false, error: message }, { status: 429 })
  }

  let stubbed = false
  try {
    const result = await sendEmail(
      env,
      verificationEmail(parsed.data.email, issued.code, session.host),
    )
    stubbed = result.stubbed
  } catch (err) {
    // The code is already stored, so a delivery failure is recoverable by
    // asking for another one — but say so rather than pretending it arrived.
    console.error('verification email failed', err)
    return NextResponse.json(
      { ok: false, error: 'We could not send that email. Try again shortly.' },
      { status: 502 },
    )
  }

  // Staging has no email provider, so the code only reaches a Worker log —
  // which means nobody outside the team can finish the flow. This hands it back
  // in the response instead, for a deployed environment that exists to be
  // tested. Two conditions, deliberately: an explicit opt-in flag, AND the send
  // having actually been stubbed. Configuring a provider closes this off even
  // if someone leaves the flag set.
  const reveal = stubbed && env.TOOLS_REVEAL_CODES === 'true'

  return NextResponse.json({
    ok: true,
    expiresInMinutes: CODE_TTL_MINUTES,
    // Tells the UI to say where the code actually went.
    stubbed,
    ...(reveal ? { code: issued.code } : {}),
  })
}
