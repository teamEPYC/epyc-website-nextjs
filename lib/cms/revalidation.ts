export type CMSCollection = 'blogs' | 'projects' | 'gallery'
export type CMSAction = 'draft' | 'publish' | 'unpublish' | 'delete'

export type RevalidationEvent = {
  eventId: string
  collection: CMSCollection
  action: CMSAction
  slug?: string
}

export function pathsForEvent(event: RevalidationEvent): string[] {
  const routes: Record<CMSCollection, { index: string; detail?: string }> = {
    blogs: { index: '/blog', detail: event.slug ? `/blog/${event.slug}` : undefined },
    projects: { index: '/projects' },
    gallery: { index: '/gallery', detail: event.slug ? `/gallery/${event.slug}` : undefined },
  }
  const selected = routes[event.collection]
  return [...new Set([selected.index, selected.detail, event.collection === 'blogs' ? '/sitemap.xml' : undefined].filter((path): path is string => Boolean(path)))]
}

/** The Payload provider tags its fetches `cms:<collection>`. Purging the path
 * alone leaves those cached responses in place, so the page can re-render from
 * stale data. */
export function tagsForEvent(event: RevalidationEvent): string[] {
  return [`cms:${event.collection}`]
}

export function parseRevalidationEvent(value: unknown): RevalidationEvent | null {
  if (!value || typeof value !== 'object') return null
  const event = value as Record<string, unknown>
  if (typeof event.eventId !== 'string' || !event.eventId) return null
  if (!['blogs', 'projects', 'gallery'].includes(String(event.collection))) return null
  if (!['draft', 'publish', 'unpublish', 'delete'].includes(String(event.action))) return null
  // Real slugs include dots and parentheses ("breathewellbeing.in",
  // "…-(green-variant)"), so the character class cannot be letters and hyphens
  // alone. What must stay impossible is escaping the collection's own route:
  // no slashes, no traversal, no whitespace, no encoded separators.
  if (event.slug !== undefined) {
    if (typeof event.slug !== 'string') return null
    if (!/^[a-z0-9][a-z0-9._()-]*$/i.test(event.slug)) return null
    if (event.slug.includes('..')) return null
  }
  return event as RevalidationEvent
}

export async function verifyWebhookSignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false
  const expected = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    new TextEncoder().encode(body),
  )
  const actual = signature.replace(/^sha256=/, '')
  if (!/^[a-f0-9]{64}$/i.test(actual)) return false
  const bytes = new Uint8Array(actual.match(/.{2}/g)!.map((byte) => Number.parseInt(byte, 16)))
  if (bytes.length !== expected.byteLength) return false
  let difference = 0
  const expectedBytes = new Uint8Array(expected)
  for (let index = 0; index < bytes.length; index += 1) difference |= bytes[index] ^ expectedBytes[index]
  return difference === 0
}
