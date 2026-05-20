/**
 * Next.js custom image loader.
 *
 * Three routing rules, in order:
 *
 *   1. SVG — returned untouched. Vectors scale losslessly and the
 *      optimizer rejects non-raster formats.
 *
 *   2. Payload media (`/api/media/file/*`, served from R2) — the requested
 *      width is handed to the media route as a `?w=` query param. That
 *      route resizes + re-encodes to WebP via the Cloudflare Images binding
 *      (`env.IMAGES`). Media can't go through `/_next/image`: OpenNext's
 *      image handler resolves relative URLs against `env.ASSETS` (static
 *      assets), which can't see Worker route handlers — it 404s the lookup.
 *
 *   3. Everything else (local `/images/*` raster) — routed through
 *      `/_next/image`, where OpenNext's image handler resizes + re-encodes
 *      via `env.IMAGES`.
 *
 * In `next dev` the OpenNext worker isn't in the request path, so the
 * original URL is returned unoptimized — optimization is exercised under
 * `pnpm preview` and in production.
 */
type LoaderArgs = {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  const w = String(width)
  const q = String(quality ?? 75)

  // 1. SVGs are never raster-optimized.
  if (/\.svg($|\?)/i.test(src)) {
    return src
  }

  // In local dev the OpenNext worker (which serves `/_next/image` and runs
  // the media-route resize) isn't in the request path — hand the browser
  // the original URL so it renders, just unoptimized.
  if (process.env.NODE_ENV === 'development') {
    return src
  }

  // 2. Payload media — resized by the media route via Cloudflare Images.
  if (src.startsWith('/api/media/file/')) {
    return `${src}?${new URLSearchParams({ w, q }).toString()}`
  }

  // 3. Local images — optimized by OpenNext's `/_next/image` handler.
  return `/_next/image?${new URLSearchParams({ url: src, w, q }).toString()}`
}
