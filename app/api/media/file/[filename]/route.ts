/**
 * Custom media-file handler that bypasses @payloadcms/storage-s3.
 *
 * Why this exists:
 *
 *   The s3Storage plugin's static handler uses @aws-sdk/client-s3,
 *   whose internal config-provider chain calls `fs.readFile` to load
 *   `~/.aws/config` and `~/.aws/credentials` — even when credentials
 *   and region are provided explicitly. On workerd that hits unenv's
 *   "fs.readFile is not implemented yet!" stub, and every GET on
 *   `/api/media/file/<filename>` 500s. Verified via /api/debug-r2.
 *
 *   aws4fetch is a tiny (~10 KB) SigV4 + fetch implementation built
 *   for Cloudflare Workers. It uses only Web APIs (crypto.subtle,
 *   fetch) — no `fs`, no Node-specific code.
 *
 * Route precedence:
 *
 *   Payload's REST routes live under `(payload)/api/[...slug]/route.ts`
 *   (a catch-all). This file at `api/media/file/[filename]/route.ts`
 *   has more specific literal segments, so Next.js's App Router picks
 *   it first for GET requests to `/api/media/file/<filename>`. Every
 *   other Payload route (admin, REST queries, GraphQL) keeps going
 *   through Payload's catch-all unchanged.
 *
 * Scope:
 *
 *   This handles DOWNLOADS only. Admin UI uploads still go through
 *   @payloadcms/storage-s3 → @aws-sdk/client-s3 → the same `fs.readFile`
 *   wall. We don't fix that here because all media is currently
 *   seeded via CI (which runs in Node.js with real fs), so the admin
 *   upload path isn't hot. When it becomes hot, the same swap applies
 *   on the upload side (custom adapter or override the storage plugin).
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

  // Path-style URL: <endpoint>/<bucket>/<key>. Matches the existing
  // s3Storage `forcePathStyle: true` config.
  const url = `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(
    bucket,
  )}/${encodeURIComponent(filename)}`

  const res = await aws.fetch(url, { method: 'GET' })

  if (!res.ok) {
    // Don't leak full R2 response (may include account hints); just
    // mirror the status with a short message.
    return new Response(
      res.status === 404 ? 'Not found' : `R2 ${res.status}`,
      { status: res.status === 404 ? 404 : 502 },
    )
  }

  // Stream the R2 body back. Preserve content-type so next/image and
  // browsers render it correctly; cache aggressively since filenames
  // are content-addressed (random 22-char base62 — collisions are not
  // a thing).
  return new Response(res.body, {
    status: 200,
    headers: {
      'content-type':
        res.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
