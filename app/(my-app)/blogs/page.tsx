import type { Metadata } from 'next'
import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiList, StrapiBlog } from '@/lib/strapi/types'
import { BlogIndex } from '@/components/sections/blog-index'
import { CTAFooter } from '@/components/sections/cta-footer'
import { normalise } from '@/lib/blogs/normalise'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Get into our minds and understand how we do the things we do.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/blogs.jpg', width: 2400, height: 1260, alt: 'EPYC — Blog' }],
  },
}

export const revalidate = 60

export default async function BlogsPage() {
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
    'populate[author][fields]': 'name,slug',
    'sort': 'publishedDate:desc',
    'pagination[limit]': '100',
  })
  const blogs = data.map((b) => normalise(b))

  return (
    <>
      <BlogIndex blogs={blogs} />
      <CTAFooter />
    </>
  )
}
