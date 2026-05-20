/**
 * Custom media-file handler that bypasses @payloadcms/storage-s3.
 *
 * Why this exists:
 *
 *   The s3Storage plugin's static handler uses @aws-sdk/client-s3, whose
 *   internal config-provider chain calls `fs.readFile` — which hits unenv's
 *   "not implemented" stub on workerd, so every download 500s. aws4fetch is
 *   a tiny SigV4 + fetch implementation that uses only Web APIs, so it
 *   works in the Worker runtime.
 *
 * Resizing:
 *
 *   `lib/image-loader.ts` appends a `?w=` (and `?q=`) param to every media
 *   `<Image>` URL. When `?w=` is present, the object is resized and
 *   re-encoded to WebP via the Cloudflare Images binding (`env.IMAGES`)
 *   before being streamed back — Payload media can't go through
 *   `/_next/image`. SVGs, GIFs, and `?w=`-less requests stream untouched.
 *
 * Route precedence:
 *
 *   This file's literal segments beat Payload's `(payload)/api/[...slug]`
 *   catch-all, so GETs to `/api/media/file/<filename>` land here; every
 *   other Payload route is unaffected.
 */
import { AwsClient } from 'aws4fetch'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Filenames are content-addressed (random base62) — safe to cache forever.
// Each `?w=` variant is a distinct URL, so variants cache independently.
const IMMUTABLE = 'public, max-age=31536000, immutable'

// Raster formats Cloudflare Images can resize. SVG (vector) and GIF
// (animated) are streamed as-is.
const RESIZABLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function GET(
  req: Request,
  ctx: { params: Promise<{ filename: string }> },
) {
  const { filename } = await ctx.params

  const bucket = process.env.R2_BUCKET
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    return new Response('R2 not configured', { status: 500 })
  }

  const aws = new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: 'auto',
    service: 's3',
  })

  // Path-style URL: <endpoint>/<bucket>/<key>. Matches the s3Storage
  // `forcePathStyle: true` config.
  const url = `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(
    bucket,
  )}/${encodeURIComponent(filename)}`

  const res = await aws.fetch(url, { method: 'GET' })

  if (!res.ok) {
    // Don't leak the full R2 response; mirror the status with a short message.
    return new Response(
      res.status === 404 ? 'Not found' : `R2 ${res.status}`,
      { status: res.status === 404 ? 404 : 502 },
    )
  }

  const contentType =
    res.headers.get('content-type') ?? 'application/octet-stream'
  const width = Number(new URL(req.url).searchParams.get('w'))

  // On-the-fly resize: `?w=` is set by lib/image-loader.ts. Resize raster
  // images through the Cloudflare Images binding; stream everything else
  // (SVG, GIF, or a `?w=`-less request) unchanged.
  if (width > 0 && RESIZABLE.has(contentType)) {
    const { env } = getCloudflareContext()
    if (env.IMAGES) {
      const quality = Number(new URL(req.url).searchParams.get('q')) || 75
      // Buffer once so the original is still available as a fallback if
      // the transform throws (the input stream would be consumed).
      const original = await res.arrayBuffer()
      try {
        const result = await env.IMAGES.input(new Response(original).body!)
          .transform({ width, fit: 'scale-down' })
          .output({ format: 'image/webp', quality })
        return new Response(result.image(), {
          status: 200,
          headers: { 'content-type': 'image/webp', 'cache-control': IMMUTABLE },
        })
      } catch {
        return new Response(original, {
          status: 200,
          headers: { 'content-type': contentType, 'cache-control': IMMUTABLE },
        })
      }
    }
  }

  // No resize requested (or not a resizable format) — stream the original.
  return new Response(res.body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': IMMUTABLE,
    },
  })
}
