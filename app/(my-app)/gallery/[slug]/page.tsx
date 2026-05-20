import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GalleryDetail } from '@/components/sections/gallery-detail'
import { CTAFooter } from '@/components/sections/cta-footer'
import { galleryItems, getRelatedItems } from '@/data/gallery'

export function generateStaticParams() {
  return galleryItems.map((i) => ({ slug: i.slug }))
}

// Fallbacks for gallery items with no title/description of their own.
// Keep in sync with the metadata in gallery/page.tsx.
const GALLERY_TITLE = 'Gallery'
const GALLERY_DESCRIPTION = 'Stills, motion clips, and prototypes from the EPYC studio.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = galleryItems.find((i) => i.slug === slug)
  if (!item) return { title: GALLERY_TITLE }

  const title = item.title ?? GALLERY_TITLE
  const description = item.description ?? GALLERY_DESCRIPTION

  // Image items use their own artwork as the OG image. Video items have no
  // still frame (`src` is an .mp4), so fall back to the site default.
  const ogImage =
    item.kind === 'image'
      ? { url: item.src, width: item.width, height: item.height, alt: item.alt ?? title }
      : { url: '/og/default.webp', width: 2400, height: 1260, alt: title }

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
  const item = galleryItems.find((i) => i.slug === slug)
  if (!item) notFound()

  const related = getRelatedItems(slug)

  return (
    <>
      <GalleryDetail item={item} related={related} />
      <CTAFooter />
    </>
  )
}
