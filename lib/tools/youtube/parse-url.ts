/**
 * A visitor's pasted YouTube link → a video id.
 *
 * Pure, no network. Every form YouTube itself hands out has to be accepted,
 * because people paste whatever the share button gave them: `watch?v=`,
 * `youtu.be`, Shorts, live replays, embeds, and the same again with tracking
 * params, timestamps and playlist ids hanging off the end.
 *
 * The id is the only thing that leaves here. Nothing downstream ever sees the
 * visitor's URL again, so a playlist id or an affiliate tag cannot ride along
 * into the request we make to YouTube.
 *
 * Mirrors `lib/crawl/validate-url.ts` in shape: a discriminated result with a
 * reason string that is already written for a human, so callers render it
 * rather than mapping it.
 */

export type VideoCheck = { ok: true; videoId: string } | { ok: false; reason: string }

/** YouTube ids are exactly 11 URL-safe base64 characters. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

/** Hosts YouTube actually serves watch pages from. */
const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

/** Path prefixes that carry the id as the next segment. */
const PATH_FORMS = ['/shorts/', '/live/', '/embed/', '/v/']

export function parseVideoUrl(input: string): VideoCheck {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, reason: 'Paste a YouTube link.' }

  // Someone pasting a bare id is doing something reasonable; accept it before
  // trying to make a URL out of it.
  if (VIDEO_ID.test(trimmed)) return { ok: true, videoId: trimmed }

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return { ok: false, reason: "That doesn't look like a YouTube link." }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: "That doesn't look like a YouTube link." }
  }

  const host = url.hostname.toLowerCase()
  if (!HOSTS.has(host)) {
    return { ok: false, reason: 'That is not a YouTube link. Paste one from youtube.com.' }
  }

  // youtu.be/<id> — the id is the whole path.
  if (host.endsWith('youtu.be')) {
    return fromCandidate(url.pathname.slice(1).split('/')[0])
  }

  // watch?v=<id>, and music.youtube.com uses the same shape.
  const query = url.searchParams.get('v')
  if (query) return fromCandidate(query)

  for (const prefix of PATH_FORMS) {
    if (url.pathname.startsWith(prefix)) {
      return fromCandidate(url.pathname.slice(prefix.length).split('/')[0])
    }
  }

  // A channel, a playlist or the homepage. Naming what we got back is more
  // use than "invalid link" — people paste channel URLs constantly.
  return { ok: false, reason: 'That is a YouTube link, but not to a single video.' }
}

function fromCandidate(raw: string): VideoCheck {
  const candidate = raw.trim()
  if (!candidate) return { ok: false, reason: 'That link has no video in it.' }
  if (!VIDEO_ID.test(candidate)) {
    return { ok: false, reason: "That doesn't look like a YouTube video link." }
  }
  return { ok: true, videoId: candidate }
}
