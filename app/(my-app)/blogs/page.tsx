import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { BlogIndex } from '@/components/sections/blog-index'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normalise, type PayloadBlog } from '@/lib/blogs/normalise'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Get into our minds and understand how we do the things we do.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/blogs.jpg', width: 2400, height: 1260, alt: 'EPYC — Blog' }],
  },
}

// Hooks revalidate on demand when a blog is edited; this fallback covers the
// rare case where direct DB writes bypass the admin.
export const revalidate = 60

// Skip build-time prerendering: the D1 binding only exists inside the
// Worker runtime, so querying Payload from the CI build environment
// would fail. The Worker renders per request; OpenNext's incremental
// cache + `revalidate = 60` still gives ISR-style caching at the edge.
export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    depth: 1,
    sort: ['-publishedAt', '-createdAt'],
    limit: 100,
  })
  const blogs = (docs as unknown as PayloadBlog[]).map((b) => normalise(b))

  return (
    <>
      <BlogIndex blogs={blogs} />
      <CTAFooter />
    </>
  )
}
