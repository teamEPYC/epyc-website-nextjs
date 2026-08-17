/**
 * Session records for the free tools: create, store the crawled corpus, and
 * reuse a recent crawl of the same host.
 *
 * Schema: db/migrations/0003_tool_sessions.sql
 */

import type { CrawledPage } from '@/lib/crawl/fetch-pages'

/** How long a crawl of a host stays reusable by a later visitor. */
export const REUSE_WINDOW_MS = 24 * 60 * 60 * 1000

export type SessionStatus = 'crawling' | 'ready' | 'empty' | 'failed'

/**
 * The HMAC salt, or null when it is not configured.
 *
 * There was a `?? 'dev-salt-not-for-production'` fallback at all four call
 * sites. That is a published constant, and embed keys are public by design, so
 * anyone could compute `manageToken(key, fallback)` and recrawl a customer's
 * site — and every stored `ip_hash` would be a plain hash of an address space
 * small enough to enumerate. A missing salt now fails closed instead: the
 * caller returns 503 rather than quietly running on a known secret.
 *
 * Local development sets it in `.dev.vars` — see docs/ai-chatbot-local-testing.md.
 */
export function toolsSalt(env: { TOOLS_IP_SALT?: string }): string | null {
  return env.TOOLS_IP_SALT || null
}

/**
 * HMAC-SHA256 of `value` under `salt`, hex encoded.
 *
 * The one keyed-hash primitive for the tools. Also used for verification codes
 * and embed manage tokens, so there is a single place to change if the hash
 * ever moves.
 */
export async function hmacHex(value: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(salt),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * HMAC the visitor's IP before it touches storage.
 *
 * A bare hash is not anonymisation — IPv4 is 2^32 addresses, which is a
 * rainbow table someone can build in an afternoon. The salt is a Worker secret
 * (`TOOLS_IP_SALT`), so the stored value is only linkable back by us.
 */
export async function hashIp(ip: string, salt: string): Promise<string> {
  return hmacHex(ip, salt)
}

/**
 * Which tool a session belongs to. The table is shared across the free tools,
 * so this is how rows are told apart — matches the CHECK constraint in
 * db/migrations/0003_tool_sessions.sql.
 */
export type ToolName = 'chatbot' | 'grader' | 'llms-txt'

export async function createSession(
  db: D1Database,
  input: {
    id: string
    tool: ToolName
    targetUrl: string
    host: string
    ipHash: string
    status: SessionStatus
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO tool_sessions (id, tool, target_url, host, ip_hash, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(input.id, input.tool, input.targetUrl, input.host, input.ipHash, input.status)
    .run()
}

export async function finishSession(
  db: D1Database,
  id: string,
  status: SessionStatus,
  pagesCrawled: number,
): Promise<void> {
  await db
    .prepare('UPDATE tool_sessions SET status = ?, pages_crawled = ? WHERE id = ?')
    .bind(status, pagesCrawled, id)
    .run()
}

export async function savePages(
  db: D1Database,
  sessionId: string,
  pages: CrawledPage[],
): Promise<void> {
  if (!pages.length) return

  // One batch, one round trip. D1 charges per statement either way, but the
  // latency of 20 sequential awaits is what we are avoiding.
  await db.batch(
    pages.map((p) =>
      db
        .prepare(
          `INSERT OR REPLACE INTO tool_pages (session_id, url, title, text, meta_json)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          sessionId,
          p.url,
          p.title,
          p.text,
          JSON.stringify({ headings: p.headings, wordCount: p.wordCount, isEmpty: p.isEmpty }),
        ),
    ),
  )
}

/**
 * Drop a session's corpus, ahead of a recrawl writing the new one.
 *
 * Delete then insert, not `INSERT OR REPLACE`: a page the owner has since
 * removed from their site would otherwise stay in the corpus forever and the
 * live bot would keep answering from it.
 */
export async function clearPages(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM tool_pages WHERE session_id = ?').bind(sessionId).run()
}

/**
 * The most recent usable crawl of this host, if there is one.
 *
 * Cuts repeat cost, is politer to the prospect's server, and makes a live
 * sales demo of the same domain instant. `force` on the route bypasses this —
 * the "I fixed something, read it again" button must never get a cached answer.
 */
export async function findRecentCrawl(
  db: D1Database,
  host: string,
  now: number = Date.now(),
): Promise<{ id: string; pagesCrawled: number } | null> {
  const cutoff = new Date(now - REUSE_WINDOW_MS).toISOString().replace('T', ' ').slice(0, 19)

  const row = await db
    .prepare(
      `SELECT id, pages_crawled FROM tool_sessions
       WHERE host = ? AND status = 'ready' AND created_at >= ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(host, cutoff)
    .first<{ id: string; pages_crawled: number }>()

  return row ? { id: row.id, pagesCrawled: row.pages_crawled } : null
}

/** Copy a previous session's corpus onto a new session. */
export async function copyPages(db: D1Database, fromId: string, toId: string): Promise<number> {
  const res = await db
    .prepare(
      `INSERT OR REPLACE INTO tool_pages (session_id, url, title, text, meta_json)
       SELECT ?, url, title, text, meta_json FROM tool_pages WHERE session_id = ?`,
    )
    .bind(toId, fromId)
    .run()

  return res.meta.changes ?? 0
}

export type SessionRow = {
  id: string
  host: string
  /** The address as submitted, re-validated before any recrawl reuses it. */
  target_url: string
  status: SessionStatus
  messages_used: number
  transcript_json: string | null
  diagnosis_json: string | null
}

export async function getSession(db: D1Database, id: string): Promise<SessionRow | null> {
  return db
    .prepare(
      `SELECT id, host, target_url, status, messages_used, transcript_json, diagnosis_json
       FROM tool_sessions WHERE id = ?`,
    )
    .bind(id)
    .first<SessionRow>()
}

export type Turn = { role: 'user' | 'assistant'; content: string }

export function readTranscript(row: SessionRow): Turn[] {
  if (!row.transcript_json) return []
  try {
    return JSON.parse(row.transcript_json) as Turn[]
  } catch {
    return []
  }
}

/**
 * Claim one of the session's messages, before any model call is made.
 *
 * Returns false when the cap is already reached. This has to be the same
 * conditional-update shape as the daily counters: reading `messages_used` and
 * incrementing it later is not atomic, so N requests fired at once for one
 * session all read the same value, all call the model, and all record a turn —
 * eight becomes however many the client sends in parallel.
 *
 * Reserving up front means a turn can be consumed by a request that then fails.
 * `releaseTurn` hands it back for the one case we can detect.
 */
export async function reserveTurn(
  db: D1Database,
  id: string,
  limit: number,
): Promise<boolean> {
  const res = await db
    .prepare(
      `UPDATE tool_sessions SET messages_used = messages_used + 1
       WHERE id = ? AND messages_used < ?`,
    )
    .bind(id, limit)
    .run()

  return (res.meta.changes ?? 0) > 0
}

/** Give back a reserved turn when the model never answered. */
export async function releaseTurn(db: D1Database, id: string): Promise<void> {
  await db
    .prepare('UPDATE tool_sessions SET messages_used = messages_used - 1 WHERE id = ? AND messages_used > 0')
    .bind(id)
    .run()
}

/**
 * Store the conversation so far.
 *
 * The count is no longer incremented here — `reserveTurn` owns it, because the
 * cap has to be enforced before the model call rather than after it. Storing
 * the transcript tells us which questions visitors actually ask, which is the
 * feedback loop for refining the ten.
 */
export async function saveTranscript(
  db: D1Database,
  id: string,
  transcript: Turn[],
): Promise<void> {
  await db
    .prepare('UPDATE tool_sessions SET transcript_json = ? WHERE id = ?')
    .bind(JSON.stringify(transcript), id)
    .run()
}

export type StoredPage = { url: string; title: string; text: string }

/** The corpus, for the chat prompt and the report. */
export async function loadPages(db: D1Database, sessionId: string): Promise<StoredPage[]> {
  const { results } = await db
    .prepare('SELECT url, title, text FROM tool_pages WHERE session_id = ?')
    .bind(sessionId)
    .all<StoredPage>()

  return results ?? []
}

export type ScoringPage = StoredPage & {
  headings?: { level: number; text: string }[]
  wordCount?: number
  isEmpty?: boolean
}

/**
 * The corpus plus the structural facts captured during extraction.
 *
 * Structure and Specificity are scored from these, so they cost nothing beyond
 * the read — the crawl already worked them out.
 */
export async function loadPagesForScoring(
  db: D1Database,
  sessionId: string,
): Promise<ScoringPage[]> {
  const { results } = await db
    .prepare('SELECT url, title, text, meta_json FROM tool_pages WHERE session_id = ?')
    .bind(sessionId)
    .all<StoredPage & { meta_json: string | null }>()

  return (results ?? []).map((row) => {
    let meta: Partial<ScoringPage> = {}
    try {
      if (row.meta_json) meta = JSON.parse(row.meta_json) as Partial<ScoringPage>
    } catch {
      // Unparseable metadata just means those dimensions score conservatively.
    }
    return { url: row.url, title: row.title, text: row.text, ...meta }
  })
}

export async function saveDiagnosis(
  db: D1Database,
  sessionId: string,
  diagnosis: unknown,
): Promise<void> {
  await db
    .prepare('UPDATE tool_sessions SET diagnosis_json = ? WHERE id = ?')
    .bind(JSON.stringify(diagnosis), sessionId)
    .run()
}
