import type { StrapiGalleryItem } from '../strapi/types'
import type { GalleryItem } from '../../data/gallery'

function splitDesigners(raw: string | null | undefined): string[] | undefined {
  if (!raw) return undefined
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean)
  return list.length > 0 ? list : undefined
}

export function normaliseGallery(item: StrapiGalleryItem): GalleryItem {
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
      designers: splitDesigners(item.designer),
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
    designers: splitDesigners(item.designer),
    previewLink: item.externalUrl ?? undefined,
  }
}
