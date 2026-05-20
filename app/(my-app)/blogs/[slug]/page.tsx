import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { BlogPost } from '@/components/sections/blog-post'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normalise, type PayloadBlog } from '@/lib/blogs/normalise'

type Params = Promise<{ slug: string }>

export const revalidate = 60

// Skip build-time prerendering: the D1 binding only exists inside the
// Worker runtime. Routes are rendered on-demand by the Worker; OpenNext's
// incremental cache + `revalidate = 60` gives ISR-style caching at the edge.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    where: { slug: { equals: slug } },
    // depth 1 populates the `cover` relationship — needed for the OG image.
    depth: 1,
    limit: 1,
  })
  const blog = docs[0] as unknown as PayloadBlog | undefined
  if (!blog) return {}

  // The blog's cover doubles as its Open Graph image. `cover.url` is a
  // relative `/api/media/file/...` path; metadataBase resolves it to absolute.
  const cover = typeof blog.cover === 'object' ? blog.cover : null
  const ogImage =
    cover && cover.url
      ? {
          url: cover.url,
          width: cover.width ?? undefined,
          height: cover.height ?? undefined,
          alt: cover.alt ?? blog.title,
        }
      : { url: '/og/default.webp', width: 2400, height: 1260, alt: blog.title }

  return {
    title: blog.meta?.title ?? blog.title,
    description: blog.meta?.description ?? blog.excerpt ?? undefined,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: { siteName: 'EPYC', images: [ogImage] },
  }
}

export default async function BlogDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  const blog = docs[0] as unknown as PayloadBlog | undefined
  if (!blog) notFound()

  const { docs: relatedDocs } = await payload.find({
    collection: 'blogs',
    where: { slug: { not_equals: slug } },
    sort: ['-publishedAt', '-createdAt'],
    depth: 1,
    limit: 3,
  })
  const relatedBlogs = (relatedDocs as unknown as PayloadBlog[]).map((b) => normalise(b))

  return (
    <>
      <BlogPost
        blog={normalise(blog, 'banner')}
        body={<RichText data={blog.content as Parameters<typeof RichText>[0]['data']} />}
        relatedBlogs={relatedBlogs}
      />
      <CTAFooter />
    </>
  )
}
