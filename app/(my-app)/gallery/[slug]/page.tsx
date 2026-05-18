import { notFound } from 'next/navigation'
import { galleryItems } from '@/data/gallery'

export function generateStaticParams() {
  return galleryItems.map((i) => ({ slug: i.slug }))
}

export default async function GalleryItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = galleryItems.find((i) => i.slug === slug)
  if (!item) notFound()

  return (
    <main className="flex min-h-screen items-center justify-center bg-beige p-8">
      <p className="text-body text-ink/60">
        Gallery item “{item.slug}” — detail page coming next round.
      </p>
    </main>
  )
}
