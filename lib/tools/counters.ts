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

/**
 * Every daily cap is off on localhost.
 *
 * There is no `CF-Connecting-IP` in local development, so every request hashes
 * to the same visitor and three crawls exhausts the day for everyone testing.
 *
 * Keyed on `NODE_ENV === 'development'`, not on an env var: `next dev` is the
 * only thing that sets it, and a deployed Worker runs a production build. The
 * comparison is positive rather than `!== 'production'` so an undefined
 * NODE_ENV keeps the caps on — a limit must never fail open.
 */
const capsDisabled = () => process.env.NODE_ENV === 'development'

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
  if (capsDisabled()) return true

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
  if (capsDisabled()) return true

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
  /** Demo sessions per visitor per day, per tool. Key: `ip:<tool>:<hash>`. */
  sessionsPerIp: 3,
  /** Messages per day across everyone. Key: `global-messages`. */
  globalMessages: 200,
  /**
   * Messages per demo session, then the report. Enforced on the session row by
   * `reserveTurn`, so `capsDisabled` cannot reach it — the value itself lifts.
   */
  messagesPerSession: capsDisabled() ? 10_000 : 8,
} as const

export const counterKeys = {
  /**
   * One bucket per tool per visitor, never one shared across tools.
   *
   * The crawl route is shared, so the key has to carry the tool or the first
   * tool a visitor tries spends the allowance for all of them — someone who
   * runs the chatbot on their site would find the llms.txt generator already
   * exhausted, with an error message naming a limit they had not knowingly
   * used.
   *
   * Applied to every tool rather than special-casing the newest one: the day
   * this changed, in-flight `ip:<hash>` counters were simply abandoned. They
   * are daily abuse counters, so the cost of that reset was one day of
   * slightly loose limits, once.
   */
  ip: (tool: string, ipHash: string) => `ip:${tool}:${ipHash}`,
  globalMessages: () => 'global-messages',
} as const
