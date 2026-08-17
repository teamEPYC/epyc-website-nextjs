/**
 * Embed keys: minting, lookup, and the Origin check that secures them.
 *
 * The key is public — it sits in the HTML of the customer's site, so anyone
 * can read it. Security is binding plus a cap, not concealment:
 *
 *   1. A key minted for acme.com only answers requests whose Origin is
 *      acme.com or www.acme.com. CORS is set to that host, never `*`.
 *   2. The bound host carries a daily message counter. Origin can be forged by
 *      a non-browser client, so the cap is what bounds the worst case — a
 *      bounded amount of free inference, not an open tap.
 *   3. Keys can be revoked with one row update.
 */

import { bumpCounter } from '../counters'
import { hmacHex } from '../session'

export type EmbedRow = {
  key: string
  session_id: string
  bound_host: string
  status: 'active' | 'revoked'
  attribution: number
  crawled_at: string
}

/**
 * Messages per bound host per day. A runaway backstop, not a product limit.
 *
 * Keyed on the host rather than the key: one domain can crawl three times in a
 * day and claim three sessions, which would otherwise be 150 messages.
 */
export const EMBED_DAILY_MESSAGES = 50

/**
 * Messages from the customer's own machine per day.
 *
 * A separate bucket, so a laptop can never drain the live site's allowance.
 * Any localhost origin is accepted for any key — the key is public and sits in
 * their page source, and forging `Origin` from curl was always possible anyway,
 * so refusing localhost bought nothing and blocked every developer.
 */
export const EMBED_DEV_DAILY_MESSAGES = 20

/** Recrawls per bound host per day, from the signed manage link. */
export const EMBED_RECRAWLS_PER_DAY = 3

const KEY_PREFIX = 'ek_live_'

/** 128 bits of randomness, hex encoded. Not a secret, but must be unguessable. */
export function mintKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return KEY_PREFIX + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isEmbedKey(value: string): boolean {
  return /^ek_live_[0-9a-f]{32}$/.test(value)
}

/** The hostname of an Origin header, lowercased, without the port. */
function hostnameOf(origin: string | null): string | null {
  if (!origin) return null
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return url.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Is this request coming from the customer's own machine?
 *
 * One definition, used by both the origin check and the daily cap, so the two
 * can never disagree about what counts as local. Any port matches — `hostname`
 * drops it.
 */
export function isLocalOrigin(origin: string | null): boolean {
  const host = hostnameOf(origin)
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

/**
 * Does this Origin belong to the host the key was minted for?
 *
 * Exactly the crawled host, plus `www`, plus localhost. Three rules, and the
 * important one is what is missing: **no label stripping, ever.**
 *
 * Deriving an apex from a hostname needs the Public Suffix List. Without it,
 * `random.vercel.app` strips to `vercel.app` and a single key would answer for
 * every site Vercel hosts. The same holds for `*.myshopify.com`,
 * `*.github.io`, `*.framer.website`. So `bound_host` is stored as crawled and
 * compared as stored.
 *
 * A wildcard for subdomains was considered and rejected for the same reason:
 * crawling a bare public suffix would hand out a key covering everyone on it.
 *
 * ponytail: no per-key origin allowlist. A customer who needs the widget on
 * `staging.acme.com` gets a 403 naming the bound host and installs on
 * production instead; testing happens on localhost, which is allowed. Upgrade
 * path is an `extra_origins` column on tool_embeds, set explicitly from the
 * manage page — never inferred from the string.
 */
export function originAllowed(origin: string | null, boundHost: string): boolean {
  if (isLocalOrigin(origin)) return true

  const host = hostnameOf(origin)
  if (!host) return false

  const bound = boundHost.toLowerCase().replace(/^www\./, '')
  return host === bound || host === `www.${bound}`
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

/**
 * Consume one daily message. False means the cap is reached.
 *
 * Two buckets. Production traffic is capped per bound host; the customer's own
 * machine gets a smaller separate allowance, so testing can never take the live
 * site's messages away from its real visitors.
 */
export async function consumeEmbedMessage(
  db: D1Database,
  embed: EmbedRow,
  origin: string | null,
): Promise<boolean> {
  return isLocalOrigin(origin)
    ? bumpCounter(db, `embed-dev:${embed.key}`, EMBED_DEV_DAILY_MESSAGES)
    : bumpCounter(db, `embed:${embed.bound_host}`, EMBED_DAILY_MESSAGES)
}

/** Consume one of this host's daily recrawls. False means the cap is reached. */
export async function consumeRecrawl(db: D1Database, boundHost: string): Promise<boolean> {
  return bumpCounter(db, `recrawl:${boundHost}`, EMBED_RECRAWLS_PER_DAY)
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

/**
 * The token that proves someone holds the manage link for this embed.
 *
 * Derived, not stored: the same key always produces the same token, so there
 * is no table, no expiry to sweep, and no second thing to keep in sync. The
 * salt is a Worker secret, so a token cannot be produced from the public key
 * alone. Revoking the embed is what kills the link — the row is checked first.
 *
 * ponytail: no login, no account. One button behind an unguessable URL is the
 * whole feature. Upgrade path is the OTP flow that already exists, if the
 * manage page ever does something worth stealing.
 */
export async function manageToken(key: string, salt: string): Promise<string> {
  return (await hmacHex(`manage:${key}`, salt)).slice(0, 32)
}

export function manageUrl(key: string, token: string, origin: string): string {
  return `${origin}/tools/ai-chatbot/manage?key=${key}&t=${token}`
}
