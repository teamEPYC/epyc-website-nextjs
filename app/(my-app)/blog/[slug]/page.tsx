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

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://media.epyc.in'

function toAbsoluteMediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${MEDIA_BASE}${url}`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
}

function rewriteMediaUrls(html: string): string {
  // Rewrite bare src="/..." paths
  let result = html.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*(["']))(\/[^"']+)\2/gi,
    (_, prefix, quote, path) => `${prefix}${MEDIA_BASE}${path}${quote}`,
  )
  // Rewrite bare paths inside srcset="..." (each space-separated entry)
  result = result.replace(
    /(<img\b[^>]*?\bsrcset\s*=\s*(["']))([^"']+)\2/gi,
    (_, prefix, quote, srcset) => {
      const rewritten = srcset.replace(/(^|,\s*)(\/[^\s,]+)/g, (m: string, sep: string, p: string) => `${sep}${MEDIA_BASE}${p}`)
      return `${prefix}${rewritten}${quote}`
    },
  )
  return result
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'filters[slug][$eq]': slug,
    'fields[0]': 'title',
    'fields[1]': 'metaTitle',
    'fields[2]': 'metaDescription',
    'fields[3]': 'content',
    'fields[4]': 'coverImageAlt',
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
    description: blog.metaDescription ?? (blog.content ? stripHtml(blog.content) : undefined),
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

  const relatedBlogs = relatedData.filter((b) => b.slug).map((b) => normalise(b))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription ?? (blog.content ? stripHtml(blog.content) : site.description),
    datePublished: blog.publishedDate ?? blog.publishedAt,
    dateModified: blog.updatedAt,
    url: `${site.url}/blog/${slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${site.url}/blog/${slug}`,
    },
    image: blog.coverImage
      ? {
          '@type': 'ImageObject',
          url: toAbsoluteMediaUrl(blog.coverImage.url),
          width: blog.coverImage.width,
          height: blog.coverImage.height,
        }
      : {
          '@type': 'ImageObject',
          url: `${site.url}/og/default.jpg`,
          width: 1200,
          height: 630,
        },
    author: {
      '@type': 'Person',
      name: blog.author?.name ?? 'Team EPYC',
      ...(blog.author?.slug ? { url: `${site.url}/blog/author/${blog.author.slug}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}/icons/epyc-wordmark-large.svg`,
        width: 200,
        height: 50,
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site.url}/blog` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: `${site.url}/blog/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <BlogPost
        blog={normalise(blog, 'banner')}
        body={<div dangerouslySetInnerHTML={{ __html: rewriteMediaUrls(blog.content ?? '') }} className="prose" />}
        relatedBlogs={relatedBlogs}
      />
      <CTAFooter />
    </>
  )
}
