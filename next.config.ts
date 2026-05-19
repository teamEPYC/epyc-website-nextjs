import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        pathname: '/images/**',
      },
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

export default withPayload(nextConfig)
