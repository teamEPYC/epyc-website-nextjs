import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiList, StrapiBlog } from '@/lib/strapi/types'
import { BlogPost } from '@/components/sections/blog-post'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normalise } from '@/lib/blogs/normalise'
import { site } from '@/data/site'

type Params = Promise<{ slug: string }>

export const revalidate = 60

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://website-media.epyc.in'

function toAbsoluteMediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${MEDIA_BASE}${url}`
}

function rewriteMediaUrls(html: string): string {
  return html.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*(["']))(\/[^"']+)\2/gi,
    (_, prefix, quote, path) => `${prefix}${MEDIA_BASE}${path}${quote}`,
  )
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'filters[slug][$eq]': slug,
    'populate[coverImage][fields]': 'url,width,height,alternativeText',
    'pagination[limit]': '1',
  })
  const blog = data[0]
  if (!blog) return {}

  const ogImage = blog.coverImage
    ? {
        url: toAbsoluteMediaUrl(blog.coverImage.url),
        width: blog.coverImage.width,
        height: blog.coverImage.height,
        alt: blog.coverImageAlt ?? blog.coverImage.alternativeText ?? blog.title,
      }
    : { url: '/og/default.jpg', width: 2400, height: 1260, alt: blog.title }

  return {
    title: blog.metaTitle ?? blog.title,
    description: blog.metaDescription ?? site.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { siteName: 'EPYC', images: [ogImage] },
  }
}

export default async function BlogDetailPage({ params }: { params: Params }) {
  const { slug } = await params

  const [{ data }, { data: relatedData }] = await Promise.all([
    fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      'filters[slug][$eq]': slug,
      'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
      'populate[author][fields]': 'name,slug',
      'pagination[limit]': '1',
    }),
    fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      'filters[slug][$ne]': slug,
      'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
      'populate[author][fields]': 'name,slug',
      'sort': 'publishedDate:desc',
      'pagination[limit]': '3',
    }),
  ])

  const blog = data[0]
  if (!blog) notFound()

  const relatedBlogs = relatedData.map((b) => normalise(b))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription ?? site.description,
    datePublished: blog.publishedDate ?? blog.publishedAt,
    dateModified: blog.publishedAt,
    url: `${site.url}/blog/${slug}`,
    image: blog.coverImage
      ? toAbsoluteMediaUrl(blog.coverImage.url)
      : `${site.url}/og/default.jpg`,
    author: { '@type': 'Person', name: blog.author.name },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icons/epyc-wordmark-large.svg` },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPost
        blog={normalise(blog, 'banner')}
        body={<div dangerouslySetInnerHTML={{ __html: rewriteMediaUrls(blog.content) }} className="prose" />}
        relatedBlogs={relatedBlogs}
      />
      <CTAFooter />
    </>
  )
}
