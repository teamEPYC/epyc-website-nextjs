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
}

// Hooks revalidate on demand when a blog is edited; this fallback covers the
// rare case where direct DB writes bypass the admin.
export const revalidate = 60

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
