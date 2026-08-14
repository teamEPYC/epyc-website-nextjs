/**
 * Embed keys: minting, lookup, and the Origin check that secures them.
 *
 * The key is public — it sits in the HTML of the customer's site, so anyone
 * can read it. Security is binding plus a cap, not concealment:
 *
 *   1. A key minted for acme.com only answers requests whose Origin is
 *      acme.com or www.acme.com. CORS is set to that host, never `*`.
 *   2. Each key carries its own daily message counter. Origin can be forged by
 *      a non-browser client, so the cap is what bounds the worst case — a
 *      bounded amount of free inference, not an open tap.
 *   3. Keys can be revoked with one row update.
 */

import { bumpCounter } from '../counters'

export type EmbedRow = {
  key: string
  session_id: string
  bound_host: string
  status: 'active' | 'revoked'
  attribution: number
  crawled_at: string
}

/** Messages per embed per day. A runaway backstop, not a product limit. */
export const EMBED_DAILY_MESSAGES = 50

const KEY_PREFIX = 'ek_live_'

/** 128 bits of randomness, hex encoded. Not a secret, but must be unguessable. */
export function mintKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return KEY_PREFIX + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isEmbedKey(value: string): boolean {
  return /^ek_live_[0-9a-f]{32}$/.test(value)
}

/**
 * Does this Origin belong to the host the key was minted for?
 *
 * Apex and `www` only. Subdomains are deliberately not accepted: a key issued
 * for acme.com should not answer for anything.acme.com, because we never
 * crawled those and the bot would confidently answer from the wrong corpus.
 */
export function originAllowed(
  origin: string | null,
  boundHost: string,
  opts: { allowAny?: boolean } = {},
): boolean {
  if (!origin) return false

  // Local development only. A key is bound to the crawled site, so a widget
  // can never be previewed from localhost without this. Gated on an env var
  // that is unset in staging and production — see cloudflare-env.secrets.d.ts.
  if (opts.allowAny) return true

  let host: string
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    host = url.host.toLowerCase()
  } catch {
    return false
  }

  const apex = boundHost.toLowerCase().replace(/^www\./, '')
  return host === apex || host === `www.${apex}`
}

/** CORS headers for a bound embed. Never `*` — the allowlist is one host. */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  }
}

export async function createEmbed(
  db: D1Database,
  input: { key: string; sessionId: string; boundHost: string; email: string | null; crawledAt: string },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO tool_embeds (key, session_id, bound_host, email, crawled_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(input.key, input.sessionId, input.boundHost, input.email, input.crawledAt)
    .run()
}

/** An existing embed for this session, so re-claiming returns the same key. */
export async function findEmbedBySession(
  db: D1Database,
  sessionId: string,
): Promise<EmbedRow | null> {
  return db
    .prepare(
      `SELECT key, session_id, bound_host, status, attribution, crawled_at
       FROM tool_embeds WHERE session_id = ?`,
    )
    .bind(sessionId)
    .first<EmbedRow>()
}

export async function findEmbedByKey(db: D1Database, key: string): Promise<EmbedRow | null> {
  return db
    .prepare(
      `SELECT key, session_id, bound_host, status, attribution, crawled_at
       FROM tool_embeds WHERE key = ?`,
    )
    .bind(key)
    .first<EmbedRow>()
}

/** Consume one of this key's daily messages. False means the cap is reached. */
export async function consumeEmbedMessage(db: D1Database, key: string): Promise<boolean> {
  return bumpCounter(db, `embed:${key}`, EMBED_DAILY_MESSAGES)
}

export async function touchEmbed(db: D1Database, key: string): Promise<void> {
  await db
    .prepare('UPDATE tool_embeds SET last_message_at = CURRENT_TIMESTAMP WHERE key = ?')
    .bind(key)
    .run()
}

/** The snippet a customer pastes. Kept in one place so the docs cannot drift. */
export function embedSnippet(key: string, origin: string): string {
  return `<script src="${origin}/api/embed/chatbot.js" data-key="${key}" defer></script>`
}
