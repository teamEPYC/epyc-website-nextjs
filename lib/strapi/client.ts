import { createHash } from 'node:crypto'

const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN
// Deploy-wide preview: when true, the ENTIRE deployment serves drafts.
// Used by the staging environment so editors can browse all unpublished
// content without clicking anything. Production leaves this unset.
const PREVIEW = process.env.STRAPI_PREVIEW === 'true'

// One-way fingerprint of the token so logs can confirm *which* token is in use
// (compare across environments) without ever exposing the secret value.
// Reproduce locally with:
//   node -e "console.log(require('crypto').createHash('sha256').update(process.env.STRAPI_API_TOKEN).digest('hex').slice(0,12))"
const TOKEN_FP = TOKEN ? createHash('sha256').update(TOKEN).digest('hex').slice(0, 12) : 'none'

// Log the resolved Strapi env once per server instance (cold start / build).
// STRAPI_URL is not a secret; the token is shown only as length + fingerprint.
console.log(
  `[strapi] env: url=${BASE ?? '<unset>'} tokenLen=${TOKEN?.length ?? 0} tokenFp=${TOKEN_FP} preview=${PREVIEW}`,
)

type FetchOptions = {
  // Per-request draft opt-in — set by request-scoped callers that have read
  // Next.js Draft Mode (the Strapi "Preview" button flow). See lib/strapi
  // and app/api/preview/route.ts.
  draft?: boolean
}

export async function fetchStrapi<T>(
  path: string,
  params?: Record<string, string>,
  opts?: FetchOptions,
): Promise<T> {
  // STRAPI_URL is not available at CI build time — return an empty list so
  // static pre-rendering succeeds. ISR revalidates on the first real request.
  if (!BASE) {
    console.warn(`[strapi] STRAPI_URL unset — returning empty for ${path}`)
    return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T
  }

  // Drafts when the whole deployment is in preview mode (STRAPI_PREVIEW, e.g.
  // staging) OR this individual request enabled Next.js Draft Mode.
  const useDrafts = PREVIEW || opts?.draft === true

  const url = new URL(`/api${path}`, BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  // Strapi v5 draft mode — only set if the caller hasn't already chosen a status.
  if (useDrafts && !url.searchParams.has('status')) url.searchParams.set('status', 'draft')
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    // Drafts must always be fresh; published content uses 60s ISR.
    ...(useDrafts ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
  })
  if (!res.ok) {
    // Log the full request (URL has no token — that's in the header) plus the
    // exact Strapi error body and the env fingerprint, so failures are
    // diagnosable from logs alone. Never logs the token value.
    const body = await res.text().catch(() => '<unreadable body>')
    console.error(
      `[strapi] ${res.status} ${res.statusText} ${url.toString()} ` +
        `[tokenLen=${TOKEN?.length ?? 0} tokenFp=${TOKEN_FP} preview=${PREVIEW} draft=${useDrafts}] ` +
        `body=${body.slice(0, 500)}`,
    )
    return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T
  }
  return res.json()
}
