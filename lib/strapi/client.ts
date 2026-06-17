const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN
// Deploy-wide preview: when true, the ENTIRE deployment serves drafts.
// Used by the staging environment so editors can browse all unpublished
// content without clicking anything. Production leaves this unset.
const PREVIEW = process.env.STRAPI_PREVIEW === 'true'

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
    console.warn(`Strapi: STRAPI_URL unset — returning empty for ${path}`)
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
    // Diagnostic context (never logs the token value, only its length).
    console.error(
      `Strapi ${res.status}: ${path} [urlSet=${Boolean(BASE)} tokenLen=${TOKEN?.length ?? 0} preview=${PREVIEW} draft=${useDrafts}]`,
    )
    return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T
  }
  return res.json()
}
