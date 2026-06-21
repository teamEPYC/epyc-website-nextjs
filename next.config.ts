import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/blogs',
        destination: '/blog',
        statusCode: 301,
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