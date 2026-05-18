/**
 * Adapter from Payload `gallery` docs into the shape the UI consumes
 * (`GalleryItem` in data/gallery.ts). Hand-authored types — same caveat as
 * lib/blogs/normalise.ts (`payload generate:types` is broken in this project).
 */
import type { PayloadMedia } from '../blogs/normalise.ts'
import type { GalleryItem } from '../../data/gallery.ts'

export type PayloadGallery = {
  id: string | number
  slug?: string | null
  title: string
  thumbnail?: PayloadMedia | string | number | null
  videoUrl?: string | null
  designers?: string | null
  description?: string | null
  previewLink?: string | null
  year?: string | null
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published' | 'changed'
}

function splitDesigners(raw: string | null | undefined): string[] | undefined {
  if (!raw) return undefined
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length > 0 ? list : undefined
}

export function normaliseGallery(item: PayloadGallery): GalleryItem {
  const slug = item.slug ?? String(item.id)
  const videoUrl = item.videoUrl?.trim()
  const thumbnail =
    typeof item.thumbnail === 'object' && item.thumbnail ? item.thumbnail : null

  if (videoUrl) {
    return {
      slug,
      kind: 'video',
      src: videoUrl,
      // Aspect ratio for video items is fixed at 4:5 across the catalogue;
      // matches the Framer source. Override later if we ever ship landscape clips.
      width: 1080,
      height: 1350,
      alt: thumbnail?.alt ?? item.title,
      title: item.title,
      description: item.description ?? undefined,
      designers: splitDesigners(item.designers),
      previewLink: item.previewLink ?? undefined,
    }
  }

  if (!thumbnail?.url) {
    throw new Error(
      `Gallery item ${slug}: has no videoUrl and thumbnail is not populated. Query with depth >= 1, or seed a thumbnail.`,
    )
  }

  return {
    slug,
    kind: 'image',
    src: thumbnail.url,
    alt: thumbnail.alt ?? item.title,
    width: thumbnail.width ?? 1080,
    height: thumbnail.height ?? 1080,
    title: item.title,
    description: item.description ?? undefined,
    designers: splitDesigners(item.designers),
    previewLink: item.previewLink ?? undefined,
  }
}
