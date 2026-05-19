/**
 * TEMPORARY debug endpoint. Bypasses Payload's media handler and hits
 * R2 directly via the S3 SDK using the same env vars the deployed
 * worker has — so we can see the actual S3 error instead of the
 * generic "Internal Server Error" Payload returns.
 *
 * Remove this file once staging image fetch is working.
 *
 *   GET /api/debug-r2/<filename>
 *
 * Returns JSON with:
 *   - a redacted preview of the R2 env vars (so we can verify config)
 *   - the actual S3 GetObject error name/Code/$metadata/cause, OR the
 *     file's ContentType/ContentLength on success.
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const preview = (v: string | undefined, head = 4, tail = 3) =>
  v ? `${v.slice(0, head)}...${v.slice(-tail)} (len=${v.length})` : '<unset>'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ filename: string }> },
) {
  const { filename } = await ctx.params

  const bucket = process.env.R2_BUCKET
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  const summary = {
    R2_BUCKET: preview(bucket, 6, 4),
    R2_ENDPOINT: endpoint
      ? `${endpoint.slice(0, 36)}…${endpoint.slice(-12)} (len=${endpoint.length})`
      : '<unset>',
    R2_ACCESS_KEY_ID: preview(accessKeyId, 8, 0),
    R2_SECRET_ACCESS_KEY: preview(secretAccessKey, 4, 0),
    filename,
  }

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      { ok: false, reason: 'env_missing', summary },
      { status: 500 },
    )
  }

  try {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    })
    const out = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: filename }),
    )
    return NextResponse.json({
      ok: true,
      summary,
      ContentType: out.ContentType,
      ContentLength: out.ContentLength,
      ETag: out.ETag,
    })
  } catch (err: unknown) {
    const e = err as {
      name?: string
      message?: string
      Code?: string
      $metadata?: { httpStatusCode?: number; requestId?: string }
      cause?: { message?: string } | string
      stack?: string
    }
    return NextResponse.json(
      {
        ok: false,
        summary,
        error: {
          name: e.name,
          message: e.message,
          Code: e.Code,
          httpStatusCode: e.$metadata?.httpStatusCode,
          requestId: e.$metadata?.requestId,
          cause:
            typeof e.cause === 'object' && e.cause !== null
              ? e.cause.message
              : e.cause,
          stack: e.stack?.split('\n').slice(0, 8).join('\n'),
        },
      },
      { status: 500 },
    )
  }
}
