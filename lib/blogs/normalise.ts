import type { StrapiBlog, StrapiMedia } from '../strapi/types'

export type CoverSize = 'card' | 'banner'

export type NormalisedBlog = {
  slug: string
  title: string
  date?: string
  publishedAt: string
  readTime?: string
  author?: string
  excerpt?: string
  content?: string
  // `null` when the blog post has no cover image — consumers render a
  // neutral `bone` placeholder box in the same shape instead.
  image: {
    src: string
    alt: string
    width: number
    height: number
    focalX?: number
    focalY?: number
  } | null
  metaDescription?: string
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}

function pickImageUrl(media: StrapiMedia, size: CoverSize): { url: string; width: number; height: number } {
  const fmt = size === 'banner' ? media.formats?.large : media.formats?.large
  if (fmt?.url) return fmt
  return { url: media.url, width: media.width, height: media.height }
}

export function normalise(blog: StrapiBlog, size: CoverSize = 'card'): NormalisedBlog {
  // Strapi returns `null` for an unset media relation even though the type
  // says otherwise — guard so a cover-less post doesn't crash the render.
  const picked = blog.coverImage ? pickImageUrl(blog.coverImage, size) : null
  const dateSource = blog.publishedDate ?? blog.publishedAt

  return {
    slug: blog.slug,
    title: blog.title,
    date: dateSource ? new Date(dateSource).toLocaleDateString('en-US', DATE_FMT) : undefined,
    publishedAt: dateSource,
    readTime: blog.readTime ?? undefined,
    author: blog.author?.name,
    excerpt: blog.metaDescription ?? undefined,
    content: blog.content ?? undefined,
    image: picked
      ? {
          src: picked.url,
          alt: blog.coverImageAlt ?? blog.coverImage?.alternativeText ?? blog.title,
          width: picked.width,
          height: picked.height,
        }
      : null,
    metaDescription: blog.metaDescription ?? undefined,
  }
}
