/**
 * Custom media-file handler that bypasses @payloadcms/storage-s3.
 *
 * Why this exists:
 *
 *   The s3Storage plugin's static handler uses @aws-sdk/client-s3, whose
 *   internal config-provider chain calls `fs.readFile` — which hits unenv's
 *   "not implemented" stub on workerd, so every download 500s. aws4fetch is a
 *   tiny SigV4 + fetch implementation that uses only Web APIs, so it works in
 *   the Worker runtime.
 *
 * Resizing:
 *
 *   This route streams the original object straight from R2. Responsive
 *   resizing happens at Cloudflare's edge — `lib/image-loader.ts` points
 *   `<Image>` at `/cdn-cgi/image/.../api/media/file/<filename>`, and the zone's
 *   image transformations resize this response before it reaches the browser.
 *
 * Route precedence:
 *
 *   This file's literal segments beat Payload's `(payload)/api/[...slug]`
 *   catch-all, so GETs to `/api/media/file/<filename>` land here; every other
 *   Payload route is unaffected.
 */
import { AwsClient } from 'aws4fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
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

  // Stream the original object. Filenames are content-addressed (random
  // base62), so the response is safe to cache forever.
  return new Response(res.body, {
    status: 200,
    headers: {
      'content-type':
        res.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
