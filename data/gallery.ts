export type GalleryKind = 'image' | 'video'

export type GalleryItem = {
  slug: string
  kind: GalleryKind
  src: string
  alt?: string
  /** Natural aspect-ratio hint — `width / height` reserves vertical space
   *  before the asset loads so the masonry doesn't re-layout. */
  width: number
  height: number
  title?: string
  description?: string
  designers?: string[]
  previewLink?: string
}

export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
