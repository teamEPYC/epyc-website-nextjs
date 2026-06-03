import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiList, StrapiGalleryItem } from '@/lib/strapi/types'
import { normaliseGallery } from '@/lib/gallery/normalise'
import { GalleryDetail } from '@/components/sections/gallery-detail'
import { CTAFooter } from '@/components/sections/cta-footer'

export const revalidate = 60
export const dynamic = 'force-dynamic'

const GALLERY_TITLE = 'Gallery'
const GALLERY_DESCRIPTION = 'Stills, motion clips, and prototypes from the EPYC studio.'

const POPULATE_PARAMS = {
  'populate[image][fields]': 'url,width,height,alternativeText',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
    'filters[slug][$eq]': slug,
    ...POPULATE_PARAMS,
    'pagination[limit]': '1',
  })
  const raw = data[0]
  if (!raw) return { title: GALLERY_TITLE }

  const item = normaliseGallery(raw)
  const title = item.title ?? GALLERY_TITLE
  const description = item.description ?? GALLERY_DESCRIPTION

  const ogImage =
    item.kind === 'image'
      ? { url: item.src, width: item.width, height: item.height, alt: item.alt ?? title }
      : { url: '/og/default.jpg', width: 2400, height: 1260, alt: title }

  return {
    title,
    description,
    alternates: { canonical: `/gallery/${slug}` },
    openGraph: { siteName: 'EPYC', images: [ogImage] },
  }
}

export default async function GalleryItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [{ data }, { data: allData }] = await Promise.all([
    fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      'filters[slug][$eq]': slug,
      ...POPULATE_PARAMS,
      'pagination[limit]': '1',
    }),
    fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      'filters[slug][$ne]': slug,
      ...POPULATE_PARAMS,
      'pagination[limit]': '3',
    }),
  ])

  const raw = data[0]
  if (!raw) notFound()

  const item = normaliseGallery(raw)
  const related = allData.map((r) => normaliseGallery(r))

  return (
    <>
      <GalleryDetail item={item} related={related} />
      <CTAFooter />
    </>
  )
}
