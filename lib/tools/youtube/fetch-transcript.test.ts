import { describe, expect, it } from 'vitest'
import { TranscriptError, fetchTranscript } from './fetch-transcript'

/**
 * Thin, with an injected `fetch` — the same approach as
 * `lib/crawl/fetch-pages.test.ts`. What is worth pinning here is not the happy
 * path but the failure mapping: `blocked` and `no-captions` are the two the
 * route alerts on, and confusing them means an outage that reads as normal
 * traffic. See docs/youtube-transcript-architecture.md §7.
 */

const TRACK_URL = 'https://www.youtube.com/api/timedtext?v=abc'

function player(body: unknown): Response {
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
}

/** A player response with the given caption tracks and an OK status. */
function ok(tracks: unknown[], details: Record<string, unknown> = {}) {
  return {
    playabilityStatus: { status: 'OK' },
    videoDetails: { title: 'A talk', author: 'A channel', lengthSeconds: '213', ...details },
    captions: { playerCaptionsTracklistRenderer: { captionTracks: tracks } },
  }
}

const EN = { baseUrl: TRACK_URL, languageCode: 'en', name: { simpleText: 'English' } }
const EN_ASR = {
  baseUrl: `${TRACK_URL}&asr=1`,
  languageCode: 'en',
  kind: 'asr',
  name: { simpleText: 'English (auto-generated)' },
}

const JSON3 = {
  events: [
    { tStartMs: 1360, dDurationMs: 1680, segs: [{ utf8: 'Hello' }, { utf8: ' there' }] },
    { tStartMs: 4000, dDurationMs: 2000, segs: [{ utf8: 'Second\nline' }] },
    { tStartMs: 6000, dDurationMs: 1000, segs: [{ utf8: '  ' }] },
  ],
}

/** Answers the player call with `first`, then any caption call with `JSON3`. */
function stub(first: unknown, captions: unknown = JSON3): typeof fetch {
  let call = 0
  return (async () => {
    call += 1
    return player(call === 1 ? first : captions)
  }) as unknown as typeof fetch
}

describe('fetchTranscript', () => {
  it('returns metadata and joins multi-segment cues', async () => {
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([EN])) })

    expect(result.title).toBe('A talk')
    expect(result.channel).toBe('A channel')
    expect(result.duration).toBe(213)
    expect(result.segments[0]).toEqual({ start: 1.36, duration: 1.68, text: 'Hello there' })
  })

  it('flattens newlines inside a cue and drops whitespace-only ones', async () => {
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([EN])) })

    expect(result.segments).toHaveLength(2)
    expect(result.segments[1].text).toBe('Second line')
  })

  it('prefers a written track over the auto-generated one', async () => {
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([EN_ASR, EN])) })
    expect(result.track.generated).toBe(false)
  })

  it('picks the spoken language, not whatever sorts first', async () => {
    // The real ordering from 5MgBikgcWnY: an English TED talk whose community
    // translations sort ahead of the English track alphabetically. Taking the
    // first written track handed back Arabic.
    const translations = ['ar', 'bn', 'my', 'zh-CN', 'hr'].map((languageCode) => ({
      baseUrl: TRACK_URL,
      languageCode,
      name: { simpleText: languageCode },
    }))
    const result = await fetchTranscript('abc', {
      fetchImpl: stub(ok([...translations, EN, EN_ASR])),
    })

    expect(result.track.languageCode).toBe('en')
    expect(result.track.generated).toBe(false)
  })

  it('falls back to the machine track over a translation of it', async () => {
    const de = { baseUrl: TRACK_URL, languageCode: 'de', name: { simpleText: 'German' } }
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([de, EN_ASR])) })

    expect(result.track.languageCode).toBe('en')
    expect(result.track.generated).toBe(true)
  })

  it('falls back to auto-generated when that is all there is', async () => {
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([EN_ASR])) })
    expect(result.track.generated).toBe(true)
  })

  it('honours an explicit language, matching the base tag', async () => {
    const de = { baseUrl: TRACK_URL, languageCode: 'de-DE', name: { simpleText: 'German' } }
    const result = await fetchTranscript('abc', { lang: 'de', fetchImpl: stub(ok([EN, de])) })
    expect(result.track.languageCode).toBe('de-DE')
  })

  it('lists every track so the UI can offer a switch', async () => {
    const result = await fetchTranscript('abc', { fetchImpl: stub(ok([EN, EN_ASR])) })
    expect(result.tracks).toHaveLength(2)
  })
})

describe('fetchTranscript — failures', () => {
  async function reasonOf(fetchImpl: typeof fetch, lang?: string): Promise<string> {
    try {
      await fetchTranscript('abc', { fetchImpl, lang })
      return 'no-error'
    } catch (err) {
      return err instanceof TranscriptError ? err.reason : 'wrong-error'
    }
  }

  it('maps LOGIN_REQUIRED to `blocked` — on a Worker this is our IP, not the video', async () => {
    const body = { playabilityStatus: { status: 'LOGIN_REQUIRED', reason: 'Sign in to confirm' } }
    expect(await reasonOf(stub(body))).toBe('blocked')
  })

  it('maps a 429 to `blocked` too', async () => {
    const rateLimited = (async () => new Response('', { status: 429 })) as unknown as typeof fetch
    expect(await reasonOf(rateLimited)).toBe('blocked')
  })

  it('maps ERROR to `unavailable`', async () => {
    const body = { playabilityStatus: { status: 'ERROR', reason: 'This video is unavailable' } }
    expect(await reasonOf(stub(body))).toBe('unavailable')
  })

  it('reports `no-captions` when the track list is empty', async () => {
    expect(await reasonOf(stub(ok([])))).toBe('no-captions')
  })

  it('reports `no-captions` when the track lists but yields nothing', async () => {
    expect(await reasonOf(stub(ok([EN]), { events: [] }))).toBe('no-captions')
  })

  it('reports `no-track` when the asked-for language is absent', async () => {
    expect(await reasonOf(stub(ok([EN])), 'ja')).toBe('no-track')
  })

  it('refuses a video past the duration cap before fetching captions', async () => {
    const long = ok([EN], { lengthSeconds: String(5 * 60 * 60) })
    expect(await reasonOf(stub(long))).toBe('too-long')
  })

  it('maps a network failure to `fetch-failed`', async () => {
    const dead = (async () => {
      throw new Error('boom')
    }) as unknown as typeof fetch
    expect(await reasonOf(dead)).toBe('fetch-failed')
  })
})
