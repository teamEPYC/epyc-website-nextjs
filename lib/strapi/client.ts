const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN

export async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  // STRAPI_URL is not available at CI build time — return an empty list so
  // static pre-rendering succeeds. ISR revalidates on the first real request.
  if (!BASE) return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T

  const url = new URL(`/api${path}`, BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    console.error(`Strapi ${res.status}: ${path}`)
    return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T
  }
  return res.json()
}
