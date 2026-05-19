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
  // @payloadcms/drizzle/dist/sqlite/requireDrizzleKit.js does a dynamic
  // require('drizzle-kit/api'). It's only called from pushDevSchema and
  // migration utilities (both unreachable at runtime: we set push:false
  // and run migrations via wrangler d1 migrations apply in CI). Marking
  // it external stops the OpenNext/esbuild bundler from trying to bring
  // it into the Worker bundle.
  serverExternalPackages: ['drizzle-kit'],
}

export default withPayload(nextConfig)
