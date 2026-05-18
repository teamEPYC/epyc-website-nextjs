/**
 * Local types and adapter from Payload `blogs` / `authors` / `media` docs into
 * the shape our existing UI components consume. We hand-author these types
 * because `payload generate:types` currently fails in this project due to a
 * pre-existing Payload CLI / top-level-await interaction; the Local API still
 * returns the same shapes.
 */

export type PayloadMediaSize = {
  url?: string | null
  width?: number | null
  height?: number | null
  filename?: string | null
}

export type PayloadMedia = {
  id: string | number
  url?: string | null
  filename?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  sizes?: {
    thumbnail?: PayloadMediaSize | null
    card?: PayloadMediaSize | null
    banner?: PayloadMediaSize | null
  } | null
  focalX?: number | null
  focalY?: number | null
}

export type CoverSize = 'card' | 'banner'

export type PayloadAuthor = {
  id: string | number
  name: string
  slug?: string | null
  bio?: string | null
}

export type PayloadBlog = {
  id: string | number
  slug?: string | null
  title: string
  publishedAt?: string | null
  readTime?: string | null
  excerpt?: string | null
  author: PayloadAuthor | string | number
  cover: PayloadMedia | string | number
  content?: unknown // Lexical JSON
  meta?: { title?: string | null; description?: string | null } | null
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published' | 'changed'
}

export type NormalisedBlog = {
  slug: string
  title: string
  date?: string
  publishedAt: string
  readTime?: string
  author?: string
  excerpt?: string
  image: {
    src: string
    alt: string
    width: number
    height: number
    focalX?: number
    focalY?: number
  }
  metaDescription?: string
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}

/**
 * Pick the most appropriate Media derivative for the requested size, falling
 * back to the original file. Existing media that pre-dates the imageSizes
 * config simply falls through to the original (no broken images).
 */
function pickSize(cover: PayloadMedia, size: CoverSize): PayloadMediaSize {
  const variant = cover.sizes?.[size]
  if (variant?.url) return variant
  return {
    url: cover.url,
    width: cover.width,
    height: cover.height,
    filename: cover.filename,
  }
}

export function normalise(blog: PayloadBlog, size: CoverSize = 'card'): NormalisedBlog {
  const cover = typeof blog.cover === 'object' ? blog.cover : null
  const author = typeof blog.author === 'object' ? blog.author : null

  if (!cover?.url) {
    throw new Error(
      `Blog ${blog.slug ?? blog.id}: cover is not populated. Query with depth >= 1.`,
    )
  }

  const picked = pickSize(cover, size)

  return {
    slug: blog.slug ?? String(blog.id),
    title: blog.title,
    date: blog.publishedAt
      ? new Date(blog.publishedAt).toLocaleDateString('en-US', DATE_FMT)
      : undefined,
    publishedAt: blog.publishedAt ?? blog.createdAt,
    readTime: blog.readTime ?? undefined,
    author: author?.name,
    excerpt: blog.excerpt ?? blog.meta?.description ?? undefined,
    image: {
      src: picked.url!,
      alt: cover.alt || blog.title,
      width: picked.width ?? 1333,
      height: picked.height ?? 833,
      focalX: cover.focalX ?? undefined,
      focalY: cover.focalY ?? undefined,
    },
    metaDescription: blog.meta?.description ?? blog.excerpt ?? undefined,
  }
}
