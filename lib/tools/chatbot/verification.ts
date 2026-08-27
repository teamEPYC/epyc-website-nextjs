/**
 * Email verification for claiming an embed.
 *
 * A six-digit code is only a million possibilities, so the controls around it
 * carry the security, not the code itself:
 *
 *   - stored as an HMAC, so a database read yields nothing usable
 *   - 10 minute expiry
 *   - 5 attempts, then the code is dead
 *   - single use
 *   - 3 codes per email per day, 3 per session
 *
 * The daily caps matter for a second reason: an endpoint that emails an
 * arbitrary address on request is a spam cannon. Without caps, someone can
 * mail-bomb a person through us, or burn our sending quota and get the domain
 * blocked.
 */

import { bumpCounter, underLimit } from '../counters'

export const CODE_TTL_MINUTES = 10
export const MAX_ATTEMPTS = 5
export const CODES_PER_EMAIL_PER_DAY = 3
export const CODES_PER_SESSION = 3

export type VerificationRow = {
  id: string
  session_id: string
  email: string
  code_hash: string
  expires_at: string
  attempts: number
  consumed_at: string | null
}

/** Six digits, uniformly distributed. `Math.random()` is not acceptable here. */
export function generateCode(): string {
  const buf = crypto.getRandomValues(new Uint32Array(1))
  return String(buf[0] % 1_000_000).padStart(6, '0')
}

/**
 * HMAC the code before storing it.
 *
 * A plain hash of six digits is a lookup table of a million entries — anyone
 * with database access could reverse every live code instantly. The pepper is
 * a Worker secret, so the stored value is only checkable by us.
 */
export async function hashCode(code: string, pepper: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(code))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Normalised so casing and stray spaces cannot dodge the per-email cap. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type IssueResult =
  | { ok: true; code: string; expiresAt: string }
  | { ok: false; reason: 'email-capped' | 'session-capped' }

/**
 * Issue a code, subject to both daily caps.
 *
 * Caps are consumed through `tool_counters` — one atomic statement each, the
 * same mechanism the crawl and message limits use — rather than by counting
 * rows, which would race.
 */
export async function issueCode(
  db: D1Database,
  input: { sessionId: string; email: string; pepper: string },
): Promise<IssueResult> {
  const email = normaliseEmail(input.email)
  const emailKey = `verify-email:${await hashCode(email, input.pepper)}`
  const sessionKey = `verify-session:${input.sessionId}`

  // Check both before consuming either. Bumping the email counter first meant
  // a request rejected by the session cap still burned one of that address's
  // three daily slots — the caller got an error and paid for it anyway.
  //
  // Check-then-consume is not atomic; under a race the worst case is one extra
  // code, which is the right way to be wrong for a limit whose purpose is
  // stopping bulk abuse rather than counting exactly.
  if (!(await underLimit(db, emailKey, CODES_PER_EMAIL_PER_DAY))) {
    return { ok: false, reason: 'email-capped' }
  }
  if (!(await underLimit(db, sessionKey, CODES_PER_SESSION))) {
    return { ok: false, reason: 'session-capped' }
  }

  await bumpCounter(db, emailKey, CODES_PER_EMAIL_PER_DAY)
  await bumpCounter(db, sessionKey, CODES_PER_SESSION)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString()

  await db
    .prepare(
      `INSERT INTO tool_verifications (id, session_id, email, code_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(crypto.randomUUID(), input.sessionId, email, await hashCode(code, input.pepper), expiresAt)
    .run()

  return { ok: true, code, expiresAt }
}

export type CheckResult =
  | { ok: true }
  | { ok: false; reason: 'no-code' | 'expired' | 'too-many-attempts' | 'wrong-code' }

/**
 * Check a submitted code and consume it on success.
 *
 * The attempt counter is incremented in one conditional statement, so parallel
 * guesses cannot slip past the limit — the same shape as the daily counters.
 */
export async function checkCode(
  db: D1Database,
  input: { sessionId: string; email: string; code: string; pepper: string },
): Promise<CheckResult> {
  const email = normaliseEmail(input.email)

  const row = await db
    .prepare(
      `SELECT id, session_id, email, code_hash, expires_at, attempts, consumed_at
       FROM tool_verifications
       WHERE session_id = ? AND email = ? AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(input.sessionId, email)
    .first<VerificationRow>()

  if (!row) return { ok: false, reason: 'no-code' }
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: 'expired' }

  // Spend an attempt first, atomically. A wrong guess must cost something even
  // if everything after this throws.
  const spend = await db
    .prepare(
      `UPDATE tool_verifications SET attempts = attempts + 1
       WHERE id = ? AND attempts < ? AND consumed_at IS NULL`,
    )
    .bind(row.id, MAX_ATTEMPTS)
    .run()

  if ((spend.meta.changes ?? 0) === 0) return { ok: false, reason: 'too-many-attempts' }

  const submitted = await hashCode(input.code.trim(), input.pepper)
  if (submitted !== row.code_hash) return { ok: false, reason: 'wrong-code' }

  // Single use: the same statement that marks it consumed is the one that
  // proves it had not been consumed already.
  const consume = await db
    .prepare('UPDATE tool_verifications SET consumed_at = CURRENT_TIMESTAMP WHERE id = ? AND consumed_at IS NULL')
    .bind(row.id)
    .run()

  if ((consume.meta.changes ?? 0) === 0) return { ok: false, reason: 'no-code' }

  return { ok: true }
}

/** Has this session verified this address? Gates the embed mint. */
export async function isVerified(
  db: D1Database,
  sessionId: string,
  email: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT id FROM tool_verifications
       WHERE session_id = ? AND email = ? AND consumed_at IS NOT NULL LIMIT 1`,
    )
    .bind(sessionId, normaliseEmail(email))
    .first<{ id: string }>()

  return Boolean(row)
}
