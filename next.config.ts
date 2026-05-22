import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  images: {
    // Custom loader bypasses `/_next/image` for Payload-served media
    // (`/api/media/file/*`). OpenNext's image handler routes relative
    // URLs through `env.ASSETS.fetch` (the static-asset binding),
    // which can't reach our Worker route — it 404s every lookup. See
    // lib/image-loader.ts for the routing rule.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // AVIF first (best compression), WebP fallback. Applies to the
    // `/_next/image` path (local images); the media route always emits WebP.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
  // @payloadcms/drizzle/dist/sqlite/requireDrizzleKit.js does
  // `require('drizzle-kit/api')` via createRequire. drizzle-kit is a
  // Node-only package (fs, path) and can't run in workerd. Alias the
  // import to a local stub so the bundler resolves it; the stub throws
  // at runtime if anything ever calls it. Code paths that touch it
  // (pushDevSchema, Payload migration utilities) are unreachable for us
  // (push:false, migrations run via wrangler d1 migrations apply).
  turbopack: {
    resolveAlias: {
      'drizzle-kit/api': './scripts/stubs/drizzle-kit-api.js',
    },
  },
}

const payloadConfig = withPayload(nextConfig)

// withPayload appends a headers rule on `/:path*` (every route) carrying
// Accept-CH / Vary / Critical-CH for Sec-CH-Prefers-Color-Scheme. The `Vary`
// makes Cloudflare refuse to edge-cache the response, so Payload media
// (`/api/media/file/*` — used as blog cover OG images) is re-fetched from the
// Worker on every social-scraper unfurl: slow and intermittent. The hint is
// only needed by the admin UI for server-side theme detection, so re-scope
// those three headers to `/admin/:path*` and leave every other route clean.
const _upstreamHeaders = payloadConfig.headers
const CLIENT_HINT_KEYS = new Set(['Accept-CH', 'Critical-CH', 'Vary'])

payloadConfig.headers = async () => {
  const upstream = (await _upstreamHeaders?.()) ?? []

  return upstream.flatMap((rule) => {
    const hintHeaders = rule.headers.filter((h) => CLIENT_HINT_KEYS.has(h.key))
    if (rule.source !== '/:path*' || hintHeaders.length === 0) return [rule]

    const otherHeaders = rule.headers.filter((h) => !CLIENT_HINT_KEYS.has(h.key))
    return [
      { ...rule, source: '/admin/:path*', headers: hintHeaders },
      ...(otherHeaders.length ? [{ ...rule, headers: otherHeaders }] : []),
    ]
  })
}

export default payloadConfig