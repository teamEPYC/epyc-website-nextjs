/**
 * Next.js custom image loader.
 *
 * Routes every non-SVG image through Cloudflare's zone-level image
 * transformations: `/cdn-cgi/image/<options>/<source>`. Cloudflare's edge
 * intercepts these URLs (the request never reaches the Worker), resizes to the
 * requested width, and re-encodes to AVIF/WebP — `format=auto` negotiates from
 * the browser's `Accept` header. This covers both local `/images/*` assets and
 * CMS media served from `/api/media/file/*`.
 *
 *   - SVG: returned as-is — vectors scale losslessly.
 *   - `next dev`: returned as-is — `/cdn-cgi/image/` only works behind a
 *     Cloudflare zone, not the local dev server.
 *
 * `/cdn-cgi/image/` requires a Cloudflare zone with Transformations enabled
 * (epyc.in / website-staging.epyc.in). On a plain `*.workers.dev` host the
 * Worker serves the original unoptimized — never an error.
 */
type LoaderArgs = {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (/\.svg($|\?)/i.test(src)) return src

  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://media.epyc.in'
  const options = `width=${width},quality=${quality ?? 75},format=auto`

  // `next dev` isn't behind a Cloudflare zone — cdn-cgi doesn't work.
  // Bare CMS media paths need the media base prepended so they're fetchable.
  //
  // The `?w=` is carried purely so Next can see the width in the returned URL.
  // Without it every <Image> logs "loader property that does not implement
  // width" on every dev page load. Nothing serves a different file for it —
  // static assets and the media host both ignore the unknown parameter — and
  // this branch never runs in production.
  if (process.env.NODE_ENV === 'development') {
    const devWidth = `${src.includes('?') ? '&' : '?'}w=${width}`
    if (!src.startsWith('/images/') && !src.startsWith('http')) {
      return `${mediaBase}${src}${devWidth}`
    }
    return `${src}${devWidth}`
  }

  // Public folder assets (/images/site/...) — cdn-cgi on the main zone.
  if (src.startsWith('/images/')) return `/cdn-cgi/image/${options}${src}`

  // Absolute URL fallback — shouldn't happen with bare CMS media paths but handle gracefully.
  if (src.startsWith('http')) return `/cdn-cgi/image/${options}/${src}`

  // Bare CMS media path (/hash.webp) — route through media.epyc.in cdn-cgi.
  // Source and cdn-cgi are on the same Cloudflare zone so "this zone only" is satisfied.
  return `${mediaBase}/cdn-cgi/image/${options}${src}`
}
