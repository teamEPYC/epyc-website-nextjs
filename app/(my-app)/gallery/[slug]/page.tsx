import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GalleryDetail } from '@/components/sections/gallery-detail'
import { CTAFooter } from '@/components/sections/cta-footer'
import {
  galleryItems,
  getRelatedItems,
  titleFromSlug,
} from '@/data/gallery'

export function generateStaticParams() {
  return galleryItems.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = galleryItems.find((i) => i.slug === slug)
  if (!item) return { title: 'Gallery' }

  const title = item.title ?? titleFromSlug(item.slug)
  const description = item.description ?? 'A piece from the EPYC archive.'

  return {
    title,
    description,
    alternates: { canonical: `/gallery/${slug}` },
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
