/**
 * Two fetches: the player response for metadata and the caption track list,
 * then the track itself as `json3`.
 *
 * ponytail: plain `fetch`, no package. `youtube-transcript` and `youtubei.js`
 * both wrap these same two calls; the latter also carries a player-signature
 * deciphering layer for stream URLs that we have no use for and that is the
 * part which breaks most often. We need one client string and one JSON path.
 * Ceiling: this is an undocumented internal endpoint with no compatibility
 * promise. When it moves, it moves here and nowhere else — the route, the
 * renderers and the UI are all downstream of `TranscriptResult`.
 *
 * That boundary is also the swap point if the IP risk lands: a paid transcript
 * API goes behind `fetchTranscript` with the same signature. See
 * docs/youtube-transcript-architecture.md §4.
 *
 * There is no official alternative to weigh this against — the YouTube Data
 * API's `captions.download` requires OAuth as the video's owner, so it cannot
 * serve a public tool at all.
 */

const PLAYER_ENDPOINT = 'https://www.youtube.com/youtubei/v1/player'

/**
 * The public InnerTube web key. Not a credential of ours — it ships in
 * youtube.com's own page source and is the same for everyone.
 */
const INNERTUBE_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'

/**
 * **Load-bearing. Do not "tidy" this to WEB.**
 *
 * Measured against dQw4w9WgXcQ on 2026-09-09: `WEB`, `MWEB`, `ANDROID` and
 * `TVHTML5_SIMPLY_EMBEDDED_PLAYER` each returned a valid player response
 * containing ZERO caption tracks. `IOS` returned six.
 *
 * The failure is silent — nothing errors, the array is simply empty, and the
 * tool then reports "this video has no captions" for every video on YouTube.
 * `reason: 'no-captions'` is logged by the route for exactly this reason: a
 * sudden run of it means this constant has gone stale, not that visitors
 * suddenly started pasting caption-less videos.
 */
const CLIENT = { clientName: 'IOS', clientVersion: '20.10.4', deviceModel: 'iPhone16,2' } as const

/** Per upstream request. Two of them, so the worst case is twice this. */
const REQUEST_TIMEOUT_MS = 8_000

/**
 * Longest video we will transcribe, checked from `videoDetails.lengthSeconds`
 * *before* the caption fetch — so a ten-hour livestream costs one cheap call
 * rather than a multi-megabyte body we then throw away.
 */
export const MAX_DURATION_SECONDS = 4 * 60 * 60

/** Transcripts per visitor per day. Key: `ip:youtube:<hash>`. */
export const TRANSCRIPTS_PER_IP = 10

/**
 * Transcripts per day across everyone. Key: `global-youtube`.
 *
 * This protects our Worker's IP reputation, not a budget — nothing here costs
 * money. Someone looping the tool does not run up a bill, they get our egress
 * range blocked by YouTube, and then the tool is dead for every visitor. A
 * shared resource with no per-visitor limit that can defend it needs a
 * global one.
 */
export const GLOBAL_TRANSCRIPTS_PER_DAY = 500

export type TranscriptSegment = {
  /** Seconds from the start of the video. */
  start: number
  /** Seconds. Clamped to at least 0.1 so a cue is never zero-length. */
  duration: number
  text: string
}

export type TranscriptTrack = {
  languageCode: string
  label: string
  /** True for YouTube's machine-generated captions. */
  generated: boolean
}

export type TranscriptResult = {
  videoId: string
  title: string
  channel: string
  /** Seconds. 0 when YouTube did not report one. */
  duration: number
  /** Every track on the video, so the UI can offer a language switch. */
  tracks: TranscriptTrack[]
  /** The one actually fetched. */
  track: TranscriptTrack
  segments: TranscriptSegment[]
}

export type TranscriptFailure =
  /** Private, deleted, region-locked, or never existed. */
  | 'unavailable'
  /** YouTube demanded a sign-in. On a Worker this means our IP is blocked. */
  | 'blocked'
  /** The video exists and has no caption track at all. */
  | 'no-captions'
  /** It has tracks, but not the language that was asked for. */
  | 'no-track'
  /** Longer than we will process. */
  | 'too-long'
  /** Network, timeout, or a shape we did not recognise. */
  | 'fetch-failed'

export class TranscriptError extends Error {
  constructor(
    readonly reason: TranscriptFailure,
    message: string,
  ) {
    super(message)
    this.name = 'TranscriptError'
  }
}

type PlayerResponse = {
  playabilityStatus?: { status?: string; reason?: string }
  videoDetails?: { title?: string; author?: string; lengthSeconds?: string }
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: {
        baseUrl?: string
        languageCode?: string
        kind?: string
        name?: { simpleText?: string; runs?: { text?: string }[] }
      }[]
    }
  }
}

type Json3 = {
  events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[]
}

export async function fetchTranscript(
  videoId: string,
  opts: { lang?: string; fetchImpl?: typeof fetch } = {},
): Promise<TranscriptResult> {
  const doFetch = opts.fetchImpl ?? fetch

  const player = await getPlayer(videoId, doFetch)

  const status = player.playabilityStatus?.status ?? 'UNKNOWN'
  if (status !== 'OK') {
    // Separated because they mean completely different things to us. The
    // visitor sees roughly the same apology either way; we need to know which.
    if (status === 'LOGIN_REQUIRED' || status === 'AGE_VERIFICATION_REQUIRED') {
      throw new TranscriptError('blocked', player.playabilityStatus?.reason ?? status)
    }
    throw new TranscriptError('unavailable', player.playabilityStatus?.reason ?? status)
  }

  const duration = Number(player.videoDetails?.lengthSeconds ?? 0) || 0
  if (duration > MAX_DURATION_SECONDS) {
    throw new TranscriptError('too-long', `${duration}s exceeds the ${MAX_DURATION_SECONDS}s cap`)
  }

  const raw = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  const usable = raw.filter((t) => t.baseUrl && t.languageCode)
  if (usable.length === 0) {
    throw new TranscriptError('no-captions', 'no caption tracks on this video')
  }

  const tracks: TranscriptTrack[] = usable.map((t) => ({
    languageCode: t.languageCode!,
    label: t.name?.runs?.[0]?.text ?? t.name?.simpleText ?? t.languageCode!,
    generated: t.kind === 'asr',
  }))

  const index = pickTrack(tracks, opts.lang)
  if (index === -1) {
    throw new TranscriptError('no-track', `no ${opts.lang} track on this video`)
  }

  const segments = await getSegments(usable[index].baseUrl!, doFetch)
  if (segments.length === 0) {
    // A track that lists but yields nothing is, to the visitor, the same as no
    // captions — and telling them "we found captions but they were empty" is a
    // distinction that helps nobody.
    throw new TranscriptError('no-captions', 'caption track was empty')
  }

  return {
    videoId,
    title: player.videoDetails?.title ?? 'Untitled video',
    channel: player.videoDetails?.author ?? '',
    duration,
    tracks,
    track: tracks[index],
    segments,
  }
}

/**
 * Which track to read.
 *
 * An explicit language wins. Otherwise the goal is the language actually
 * spoken in the video, with a human-written track preferred over the machine
 * one where both exist.
 *
 * **"First written track" is not that**, which is what this originally did.
 * YouTube returns community and translated tracks ordered alphabetically by
 * language name, so a TED talk in English (`ar, bn, my, zh-CN, hr, en, …`)
 * handed back Arabic — verified against 5MgBikgcWnY.
 *
 * The auto-generated track is the signal. YouTube only ever produces one in
 * the language being spoken, so its code identifies the original audio even
 * when twenty translations sort ahead of it. `videoDetails.defaultAudioLanguage`
 * would be more direct but is absent on this client.
 */
function pickTrack(tracks: TranscriptTrack[], lang?: string): number {
  if (lang) return matching(tracks, lang)

  const generated = tracks.find((t) => t.generated)
  if (generated) {
    // A written track in the spoken language beats the machine transcript;
    // the machine transcript beats a translation of it.
    const written = tracks.findIndex(
      (t) => !t.generated && sameLanguage(t.languageCode, generated.languageCode),
    )
    return written !== -1 ? written : tracks.indexOf(generated)
  }

  // No machine track to learn the spoken language from. A video with only
  // written tracks has few of them, and the first is the best guess available.
  const written = tracks.findIndex((t) => !t.generated)
  return written !== -1 ? written : 0
}

function matching(tracks: TranscriptTrack[], lang: string): number {
  const exact = tracks.findIndex((t) => t.languageCode === lang)
  if (exact !== -1) return exact

  // `en` should match `en-GB` when that is all the video has.
  return tracks.findIndex((t) => sameLanguage(t.languageCode, lang))
}

/** `en` and `en-GB` are the same language for our purposes; `en` and `es` are not. */
function sameLanguage(a: string, b: string): boolean {
  return a.split('-')[0] === b.split('-')[0]
}

async function getPlayer(videoId: string, doFetch: typeof fetch): Promise<PlayerResponse> {
  const res = await request(
    `${PLAYER_ENDPOINT}?key=${INNERTUBE_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoId, context: { client: CLIENT } }),
    },
    doFetch,
  )

  try {
    return (await res.json()) as PlayerResponse
  } catch {
    throw new TranscriptError('fetch-failed', 'player response was not JSON')
  }
}

async function getSegments(baseUrl: string, doFetch: typeof fetch): Promise<TranscriptSegment[]> {
  // `fmt=json3` over the default XML: the XML form double-encodes entities
  // (`&amp;#39;` for an apostrophe), so parsing it means decoding twice and
  // getting it wrong once.
  const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}fmt=json3`
  const res = await request(url, {}, doFetch)

  let body: Json3
  try {
    body = (await res.json()) as Json3
  } catch {
    throw new TranscriptError('fetch-failed', 'caption track was not JSON')
  }

  const segments: TranscriptSegment[] = []
  for (const event of body.events ?? []) {
    // Auto-captions break a line across several `segs`; they are one cue.
    const text = (event.segs ?? [])
      .map((s) => s.utf8 ?? '')
      .join('')
      .replace(/\s+/g, ' ')
      .trim()

    if (!text) continue

    segments.push({
      start: (event.tStartMs ?? 0) / 1000,
      // Zero-duration cues exist in the data and are invalid in SRT and VTT,
      // where the end must be after the start.
      duration: Math.max((event.dDurationMs ?? 0) / 1000, 0.1),
      text,
    })
  }

  return segments
}

async function request(url: string, init: RequestInit, doFetch: typeof fetch): Promise<Response> {
  let res: Response
  try {
    res = await doFetch(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        // Matching the client we claim to be in the payload. A mismatch here is
        // the kind of thing that gets a request refused.
        'user-agent':
          'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3 like Mac OS X)',
        'accept-language': 'en-US,en',
        ...init.headers,
      },
    })
  } catch {
    throw new TranscriptError('fetch-failed', `request to ${new URL(url).host} failed`)
  }

  // 429 from YouTube is rate limiting against our egress address, which is the
  // same signal as LOGIN_REQUIRED and wants the same alert.
  if (res.status === 429 || res.status === 403) {
    throw new TranscriptError('blocked', `upstream returned ${res.status}`)
  }
  if (!res.ok) {
    throw new TranscriptError('fetch-failed', `upstream returned ${res.status}`)
  }

  return res
}
