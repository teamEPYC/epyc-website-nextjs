/**
 * Resolves Strapi media references to absolute URLs.
 *
 * Strapi returns bare media paths (e.g. `/uploads/x.webp`). With Vercel's
 * native image optimization there is no custom loader to prepend the media
 * host, so callers must produce absolute URLs at the data layer. Already
 * absolute `http(s)` URLs and local `/images/*` assets pass through unchanged.
 */
export const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://media.epyc.in'

export function toMediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/images/')) return path
  return `${MEDIA_BASE}${path}`
}
