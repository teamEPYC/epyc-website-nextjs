import type { GalleryItem as CMSGalleryItem } from '../cms'
import type { GalleryItem } from '../../data/gallery'

// Providers hand over an array; `data/gallery.ts` wants the field absent rather
// than empty when there are no designers.
function designers(list: string[] | undefined): string[] | undefined {
  return list && list.length > 0 ? list : undefined
}

export function normaliseGallery(item: CMSGalleryItem): GalleryItem {
  const slug = item.slug
  const videoUrl = item.videoUrl?.trim()
  const image = item.image ?? null

  if (videoUrl) {
    return {
      slug,
      kind: 'video',
      src: videoUrl,
      width: 1080,
      height: 1350,
      alt: item.imageAlt ?? image?.alternativeText ?? item.title,
      title: item.title,
      description: item.content ?? undefined,
      designers: designers(item.designers),
      previewLink: item.externalUrl ?? undefined,
    }
  }

  // No video and no image — e.g. an incomplete draft. Return an empty-src
  // image item so consumers render a neutral `bone` placeholder box in the
  // same shape instead of crashing the page.
  return {
    slug,
    kind: 'image',
    src: image?.url ?? '',
    alt: item.imageAlt ?? image?.alternativeText ?? item.title,
    width: image?.width ?? 1080,
    height: image?.height ?? 1350,
    title: item.title,
    description: item.content ?? undefined,
    designers: designers(item.designers),
    previewLink: item.externalUrl ?? undefined,
  }
}
