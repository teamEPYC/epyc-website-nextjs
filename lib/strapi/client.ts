const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN

export async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`/api${path}`, BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`)
  return res.json()
}
