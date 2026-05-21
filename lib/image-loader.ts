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
  // SVGs are vector — never raster-optimized.
  if (/\.svg($|\?)/i.test(src)) {
    return src
  }
  // `/cdn-cgi/image/` is a Cloudflare-zone feature; `next dev` isn't behind
  // one, so hand back the original URL there.
  if (process.env.NODE_ENV === 'development') {
    return src
  }
  // Cloudflare zone image transformations — edge-side resize + re-encode.
  // `src` is always a `/`-prefixed path (local `/images/*` or
  // `/api/media/file/*`), so it concatenates straight onto the options.
  const options = `width=${width},quality=${quality ?? 75},format=auto`
  return `/cdn-cgi/image/${options}${src}`
}
