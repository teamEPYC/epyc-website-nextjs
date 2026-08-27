import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCMS } from '@/lib/cms'
import { normaliseGallery } from '@/lib/gallery/normalise'
import { GalleryDetail } from '@/components/sections/gallery-detail'
import { CTAFooter } from '@/components/sections/cta-footer'

export const revalidate = 60

const GALLERY_TITLE = 'Gallery'
const GALLERY_DESCRIPTION = 'Stills, motion clips, and prototypes from the EPYC studio.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const raw = await getCMS().getGalleryItemBySlug(slug)
  if (!raw) return { title: GALLERY_TITLE }

  const item = normaliseGallery(raw)
  const title = item.title ?? GALLERY_TITLE
  const description = item.description ?? GALLERY_DESCRIPTION

  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://media.epyc.in'
  const ogImage =
    item.kind === 'image'
      ? {
          url: item.src.startsWith('http') ? item.src : `${mediaBase}${item.src}`,
          width: item.width,
          height: item.height,
          alt: item.alt ?? title,
        }
      : { url: '/og/default.jpg', width: 2400, height: 1260, alt: title }

  return {
    title,
    description,
    robots: { index: false, follow: true },
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

  const [raw, allData] = await Promise.all([
    getCMS().getGalleryItemBySlug(slug),
    getCMS().listGalleryItems({ excludeSlug: slug, limit: 3 }),
  ])
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
