import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { z } from 'zod'
import { bumpCounter, counterKeys, underLimit } from '@/lib/tools/counters'
import { parseVideoUrl } from '@/lib/tools/youtube/parse-url'
import {
  GLOBAL_TRANSCRIPTS_PER_DAY,
  MAX_DURATION_SECONDS,
  TRANSCRIPTS_PER_IP,
  TranscriptError,
  fetchTranscript,
  type TranscriptFailure,
} from '@/lib/tools/youtube/fetch-transcript'
import { hashIp, toolsSalt } from '@/lib/tools/session'

/**
 * A video's transcript, fetched from YouTube and handed straight back.
 *
 * Plain JSON, not SSE: this is about 1.5 seconds behind a spinner, where the
 * crawl is twenty and needs a live log to hold a stranger's attention.
 *
 * **Nothing is stored.** No session row, no `tool_transcripts` table, no
 * migration — the transcript does not outlive the response, so there is no
 * second request to hand it to. The only D1 write is the daily counter, in a
 * table that already exists. See docs/youtube-transcript-architecture.md §3.2.
 *
 * Plan: docs/youtube-transcript-plan.md
 */

const transcriptSchema = z.object({
  url: z.string().min(1).max(2048),
  /** A `languageCode` from a previous response's `tracks`. */
  lang: z.string().max(16).optional(),
})

/** How long a fetched transcript stays in the edge cache. */
const CACHE_SECONDS = 24 * 60 * 60

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = transcriptSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Paste a YouTube link.' }, { status: 400 })
  }

  // Cheapest rejection first: a bad link never reaches the network, and only
  // the video id survives — no playlist id or tracking param rides along.
  const checked = parseVideoUrl(parsed.data.url)
  if (!checked.ok) {
    return NextResponse.json({ ok: false, error: checked.reason }, { status: 400 })
  }

  const { env, ctx } = getCloudflareContext()
  const db = env.DB

  // Ahead of the caps: a cache hit costs no upstream call, so it should not
  // cost the visitor one of their ten either.
  const cacheKey = transcriptCacheKey(checked.videoId, parsed.data.lang)
  const cached = await readCache(cacheKey)
  if (cached) return cached

  // No salt, no tool. `ip_hash` is the only thing between our counters and a
  // plain record of who visited, and there is deliberately no fallback.
  const salt = toolsSalt(env)
  if (!salt) {
    console.error('TOOLS_IP_SALT is not set')
    return NextResponse.json({ ok: false, error: 'This tool is unavailable.' }, { status: 503 })
  }

  const ip = req.headers.get('cf-connecting-ip') ?? '0.0.0.0'
  const ipKey = counterKeys.ip('youtube', await hashIp(ip, salt))

  // Checked, not consumed. A video with no captions is not the visitor's fault
  // and must not spend one of their ten; both counters are bumped only after a
  // transcript actually comes back.
  if (!(await underLimit(db, ipKey, TRANSCRIPTS_PER_IP))) {
    return NextResponse.json(
      {
        ok: false,
        capped: true,
        error: `You've pulled your ${TRANSCRIPTS_PER_IP} transcripts for today. They reset at midnight UTC.`,
      },
      { status: 429 },
    )
  }

  // The backstop on our own IP reputation rather than on a budget — see
  // GLOBAL_TRANSCRIPTS_PER_DAY. Per-visitor limits cannot protect a shared
  // resource from a rotating pool of visitors.
  if (!(await underLimit(db, 'global-youtube', GLOBAL_TRANSCRIPTS_PER_DAY))) {
    return NextResponse.json(
      { ok: false, capped: true, error: 'The tool is busy today. Try again tomorrow.' },
      { status: 429 },
    )
  }

  let result
  try {
    result = await fetchTranscript(checked.videoId, { lang: parsed.data.lang })
  } catch (err) {
    const reason: TranscriptFailure =
      err instanceof TranscriptError ? err.reason : 'fetch-failed'

    // `blocked` and `no-captions` are the two that look like ordinary traffic
    // and are not. A run of `blocked` means YouTube is refusing our egress
    // address; a run of `no-captions` means the InnerTube client string in
    // fetch-transcript.ts has gone stale and every video now looks
    // caption-less. Both are outages. Logged distinctly so they are visible in
    // observability rather than inferred from a drop in usage.
    // docs/youtube-transcript-architecture.md §7.
    console.error(`youtube transcript ${reason}`, {
      videoId: checked.videoId,
      detail: err instanceof Error ? err.message : String(err),
    })

    const { status, message } = FAILURES[reason]
    return NextResponse.json({ ok: false, reason, error: message }, { status })
  }

  await bumpCounter(db, ipKey, TRANSCRIPTS_PER_IP)
  await bumpCounter(db, 'global-youtube', GLOBAL_TRANSCRIPTS_PER_DAY)

  const body = {
    ok: true as const,
    videoId: result.videoId,
    title: result.title,
    channel: result.channel,
    duration: result.duration,
    tracks: result.tracks,
    track: result.track,
    segments: result.segments,
  }

  ctx.waitUntil(writeCache(cacheKey, body))

  return NextResponse.json(body)
}

/** What the visitor is told, and with what status, per failure. */
const FAILURES: Record<TranscriptFailure, { status: number; message: string }> = {
  unavailable: {
    status: 404,
    message: 'We could not open that video. It may be private, deleted, or region-locked.',
  },
  // Deliberately not "we are blocked" — a visitor cannot act on our egress
  // address, and the honest version of that sentence is an internal one.
  blocked: {
    status: 503,
    message: 'YouTube would not let us read that video right now. Try again in a few minutes.',
  },
  'no-captions': {
    status: 404,
    message:
      'That video has no captions, so there is nothing to transcribe. YouTube generates them automatically for most videos, but not all.',
  },
  'no-track': {
    status: 404,
    message: 'That video does not have captions in the language you asked for.',
  },
  'too-long': {
    status: 413,
    message: `That video is longer than ${MAX_DURATION_SECONDS / 3600} hours, which is more than we can process.`,
  },
  'fetch-failed': {
    status: 503,
    message: 'We could not reach YouTube just now. Try again shortly.',
  },
}

/**
 * A synthetic GET key for the Cache API.
 *
 * The real request is a POST, which the Cache API will not store, so the
 * cacheable identity of a transcript — the video and the language, nothing
 * else — is expressed as a URL. The host is never resolved; it exists to make
 * a valid `Request`.
 */
function transcriptCacheKey(videoId: string, lang: string | undefined): Request {
  return new Request(`https://youtube-transcript.epyc.internal/${videoId}/${lang ?? 'auto'}`)
}

/**
 * `caches.default`, when there is one.
 *
 * ponytail: the Cache API rather than a D1 table. A table here would be a
 * cache with a schema, a pruning job and a migration behind it. Ceiling: this
 * is per-colo, so a popular video is fetched once per Cloudflare location
 * rather than once globally — which is the right trade for a cache whose job
 * is blunting repeat traffic. Upgrade path is KV if the measured block rate
 * says per-colo is not enough.
 *
 * `next dev` runs on Node, where `caches.default` does not exist. The tool
 * simply runs uncached there, which is correct for local development anyway.
 */
function edgeCache(): Cache | null {
  // `caches.default` is a Cloudflare extension: the DOM's `CacheStorage` has no
  // such member, so this is read off the global rather than typed through it.
  const store = (globalThis as unknown as { caches?: { default?: Cache } }).caches
  return store?.default ?? null
}

async function readCache(key: Request): Promise<Response | null> {
  const cache = edgeCache()
  if (!cache) return null

  try {
    const hit = await cache.match(key)
    if (!hit) return null

    // Rebuilt rather than returned as-is: the cached response carries the
    // cache's own headers, and we want ours plus an honest hit marker.
    const body = await hit.json()
    return NextResponse.json(body, { headers: { 'x-transcript-cache': 'hit' } })
  } catch {
    // A malformed cache entry must never take the route down — fall through
    // and fetch it fresh.
    return null
  }
}

async function writeCache(key: Request, body: unknown): Promise<void> {
  const cache = edgeCache()
  if (!cache) return

  try {
    await cache.put(
      key,
      new Response(JSON.stringify(body), {
        headers: {
          'content-type': 'application/json',
          'cache-control': `public, max-age=${CACHE_SECONDS}`,
        },
      }),
    )
  } catch (err) {
    console.error('transcript cache write failed', err)
  }
}
