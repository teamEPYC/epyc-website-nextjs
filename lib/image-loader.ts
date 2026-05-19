/**
 * Next.js custom image loader.
 *
 * Bypasses `/_next/image` for Payload-served media (`/api/media/file/*`)
 * because OpenNext's image handler routes relative URLs through
 * `env.ASSETS.fetch` (Cloudflare's static-asset binding), which can't see
 * Worker route handlers — it just 404s the lookup and returns
 * `"url" parameter is valid but upstream response is invalid`. Verified by
 * reading `.open-next/cloudflare/images.js` (the bundled image worker).
 *
 * For everything else (remote URLs like framerusercontent.com), we still
 * route through `/_next/image` so OpenNext's image handler can fetch +
 * optimize them — that branch uses regular fetch, which works.
 *
 * Trade-off: media served from R2 via Payload is no longer responsive-
 * resized by the image optimizer. Browsers still pick a format based on
 * the file we stored (we're shipping the original; thumb/card/banner
 * variants aren't generated because we dropped `sharp` from the bundle).
 * Acceptable until either (a) we route media through Cloudflare Images
 * or (b) we move Payload to absolute URLs (which would let the existing
 * optimizer work for media too).
 */
type LoaderArgs = {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  // Bypass /_next/image for:
  //   1. Payload-served media — OpenNext routes relative URLs through
  //      env.ASSETS, which can't see Worker routes (see above).
  //   2. SVG files — OpenNext's image optimizer only allows formats in
  //      `images.formats` (defaults to ["image/webp"]) and rejects SVGs
  //      with "url parameter is valid but image type is not allowed".
  //      We can't enable them via `dangerouslyAllowSVG` without taking
  //      on the SVG-script security trade-off, and SVGs don't need
  //      raster optimization anyway — vector scales for free.
  if (src.startsWith('/api/media/file/') || /\.svg($|\?)/i.test(src)) {
    return src
  }
  // Mirror Next.js's default loader so non-Payload, non-SVG images
  // still go through `/_next/image` and get optimized.
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
  })
  return `/_next/image?${params.toString()}`
}
