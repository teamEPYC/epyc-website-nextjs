import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.epyc.in',
      },
      {
        protocol: 'https',
        hostname: 'website-media.epyc.in',
      },
    ],
  },
}

export default nextConfig
