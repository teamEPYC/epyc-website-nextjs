import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  // Next's default, set explicitly: every canonical, sitemap entry, and internal
  // link uses the no-slash form, and `/path/` 308s to `/path`. Flipping this
  // would invalidate every canonical on the site, so it is pinned rather than
  // left implicit.
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/blogs',
        destination: '/blog',
        statusCode: 301,
      },
      // The GoKwik case study was rebuilt at /case-study/gokwik (b1bc7e4). The old
      // /projects/gokwik route stayed live and self-canonicalising, so Google saw
      // two copies of the same page. Redirect instead of 404 — the old URL has
      // been indexed and linked.
      {
        source: '/projects/gokwik',
        destination: '/case-study/gokwik',
        statusCode: 301,
      },
      // Leftover model-comparison build of the service page. It shipped live and
      // indexable on EPYC's primary commercial keyword.
      {
        source: '/website-design-development-sonnet',
        destination: '/website-design-development',
        statusCode: 301,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Every URL has two representations — HTML by default, markdown when
          // the request sends `Accept: text/markdown` (see `middleware.ts`) — so the
          // Accept header is part of the cache key. Note that Next replaces this
          // with its own `Vary: rsc, ...` on app-router page responses; the
          // markdown route sets `Vary: Accept` itself, and negotiated markdown is
          // additionally marked `private` so no shared cache can mix the two.
          { key: 'Vary', value: 'Accept' },
        ],
      },
    ]
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.epyc.in',
      },
    ],
  },
}

export default nextConfig