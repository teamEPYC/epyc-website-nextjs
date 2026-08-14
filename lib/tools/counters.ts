/**
 * Daily caps for the free tools.
 *
 * Every cap is one D1 statement. Read-then-increment races across concurrent
 * Workers; a single conditional statement does not, because D1 serialises
 * writes. This is why there is no Durable Object here — see
 * docs/ai-chatbot-architecture.md §3.
 *
 * The source spec used `UPDATE ... WHERE n < ?`, which affects zero rows when
 * today's row does not exist yet. Zero rows means "capped", so every counter
 * reported exhausted on the first request after midnight, every day. The
 * INSERT ... ON CONFLICT form below is correct on a cold day and keeps the
 * single-statement atomicity.
 */

/** UTC day key, `YYYY-MM-DD`. UTC so the reset time never moves with DST. */
export function utcDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/**
 * Consume one unit of `key`'s daily allowance.
 *
 * Returns `true` if it was consumed, `false` if the cap is already reached.
 * Allows exactly `limit` calls per UTC day.
 */
export async function bumpCounter(
  db: D1Database,
  key: string,
  limit: number,
  day: string = utcDay(),
): Promise<boolean> {
  const res = await db
    .prepare(
      `INSERT INTO tool_counters (day, key, n) VALUES (?, ?, 1)
       ON CONFLICT(day, key) DO UPDATE SET n = n + 1 WHERE n < ?`,
    )
    .bind(day, key, limit)
    .run()

  return (res.meta.changes ?? 0) > 0
}

/**
 * Is `key` still under its cap, without consuming anything?
 *
 * For the crawl route, which checks before doing 20 seconds of work and only
 * consumes once a session actually exists — so a typo'd URL does not burn one
 * of the visitor's three daily sessions. Check-then-consume is not atomic; the
 * failure mode is one extra crawl under a race, which is the right way to be
 * wrong here.
 */
export async function underLimit(
  db: D1Database,
  key: string,
  limit: number,
  day: string = utcDay(),
): Promise<boolean> {
  const row = await db
    .prepare('SELECT n FROM tool_counters WHERE day = ? AND key = ?')
    .bind(day, key)
    .first<{ n: number }>()

  return (row?.n ?? 0) < limit
}

/**
 * The caps themselves. Phase one runs entirely on free models, so these bound
 * abuse and upstream rate limits rather than spend — see docs/ai-chatbot-plan.md.
 */
export const CAPS = {
  /** Demo sessions per visitor per day. Key: `ip:<hash>`. */
  sessionsPerIp: 3,
  /** Messages per day across everyone. Key: `global-messages`. */
  globalMessages: 200,
  /** Messages per demo session, then the report. Enforced on the session row. */
  messagesPerSession: 8,
} as const

/**
 * Caps, with an environment override.
 *
 * Local development shares one counter across every request — there is no
 * `CF-Connecting-IP` on localhost, so everything hashes to the same visitor and
 * three crawls exhausts the day. Set `TOOLS_SESSIONS_PER_IP` in `.dev.vars` to
 * test freely.
 *
 * Unset in staging and production, so the real limits apply there. A junk value
 * falls back to the default rather than disabling the cap — a typo in an env
 * var must never quietly turn a limit off.
 */
export type Caps = { -readonly [K in keyof typeof CAPS]: number }

export function capsFor(env: { TOOLS_SESSIONS_PER_IP?: string }): Caps {
  const override = Number(env.TOOLS_SESSIONS_PER_IP)
  return {
    ...CAPS,
    sessionsPerIp: Number.isInteger(override) && override > 0 ? override : CAPS.sessionsPerIp,
  }
}

export const counterKeys = {
  ip: (ipHash: string) => `ip:${ipHash}`,
  globalMessages: () => 'global-messages',
} as const
