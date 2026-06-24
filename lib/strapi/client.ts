const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN
// When true, fetch Strapi Draft & Publish drafts (`?status=draft`) instead of
// published content. Drafts are never edge-cached so editors see live edits.
const PREVIEW = process.env.STRAPI_PREVIEW === 'true'

const EMPTY = { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } }

export async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  // STRAPI_URL is not available at CI build time — return an empty list so
  // static pre-rendering succeeds. ISR revalidates on the first real request.
  if (!BASE) return EMPTY as T

  let url: URL
  try {
    url = new URL(`/api${path}`, BASE)
  } catch {
    console.error(`Strapi: invalid STRAPI_URL "${BASE}"`)
    return EMPTY as T
  }

  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  // Strapi v5 draft mode — only set if the caller hasn't already chosen a status.
  if (PREVIEW && !url.searchParams.has('status')) url.searchParams.set('status', 'draft')

  let res: Response
  try {
    res = await fetch(url, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      // Drafts must always be fresh; published content uses 60s ISR.
      ...(PREVIEW ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
    })
  } catch (err) {
    console.error(`Strapi: fetch failed for ${path}`, err)
    return EMPTY as T
  }

  if (!res.ok) {
    console.error(`Strapi ${res.status}: ${path}`)
    return EMPTY as T
  }
  return res.json()
}
