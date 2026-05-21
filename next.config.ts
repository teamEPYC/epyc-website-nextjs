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

// withPayload injects Accept-CH / Vary / Critical-CH for Sec-CH-Prefers-Color-Scheme
// on `/:path*` (every route). On a custom Cloudflare zone these headers land on
// static JPEG responses too, which confuses social-media scrapers: some implement
// the Critical-CH spec and discard the first image response waiting for a retry
// that never comes, causing OG preview images to fail. Payload only actually needs
// the hint on its own admin routes, so we split the rule: client-hint headers go
// to /payload/* only, everything else (marketing pages, static assets) is left clean.
const _upstreamHeaders = payloadConfig.headers
const CLIENT_HINT_KEYS = new Set(['Accept-CH', 'Critical-CH', 'Vary'])

payloadConfig.headers = async () => {
  const upstream = (await _upstreamHeaders?.()) ?? []
  const result: NonNullable<Awaited<ReturnType<NonNullable<typeof _upstreamHeaders>>>> = []

  for (const rule of upstream) {
    const hasClientHints = rule.headers.some((h) => CLIENT_HINT_KEYS.has(h.key))

    if (rule.source === '/:path*' && hasClientHints) {
      const hintHeaders = rule.headers.filter((h) => CLIENT_HINT_KEYS.has(h.key))
      const otherHeaders = rule.headers.filter((h) => !CLIENT_HINT_KEYS.has(h.key))

      // Payload admin keeps the color-scheme hint for server-side dark-mode detection.
      result.push({ ...rule, source: '/payload/:path*', headers: hintHeaders })
      // All other routes (pages, OG images, static assets) get the rest (X-Powered-By etc).
      if (otherHeaders.length) result.push({ ...rule, headers: otherHeaders })
    } else {
      result.push(rule)
    }
  }

  return result
}

export default payloadConfig
