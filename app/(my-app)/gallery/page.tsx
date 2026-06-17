import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiList, StrapiGalleryItem } from '@/lib/strapi/types'
import { normaliseGallery } from '@/lib/gallery/normalise'
import { GalleryIndex } from '@/components/sections/gallery-index'
import { FAQs } from '@/components/sections/faqs'
import { CTAFooter } from '@/components/sections/cta-footer'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Stills, motion clips, and prototypes from the EPYC studio.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    siteName: 'EPYC',
    images: [{ url: '/og/gallery.webp', width: 2400, height: 1260 }],
  },
}

export const revalidate = 60

export default async function GalleryPage() {
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
    'populate[image][fields]': 'url,width,height,alternativeText',
    'pagination[limit]': '500',
  }, { draft: isEnabled })
  const items = data.map((item) => normaliseGallery(item))

  return (
    <>
      <GalleryIndex items={items} />
      <FAQs />
      <CTAFooter />
    </>
  )
}
