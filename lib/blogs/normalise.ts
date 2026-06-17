import type { StrapiBlog, StrapiMedia } from '../strapi/types'
import { toMediaUrl } from '../media'

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

function pickImageUrl(media: StrapiMedia, size: CoverSize): { url: string; width: number; height: number } {
  const fmt = size === 'banner' ? media.formats?.large : media.formats?.large
  if (fmt?.url) return fmt
  return { url: media.url, width: media.width, height: media.height }
}

export function normalise(blog: StrapiBlog, size: CoverSize = 'card'): NormalisedBlog {
  const picked = pickImageUrl(blog.coverImage, size)
  const dateSource = blog.publishedDate ?? blog.publishedAt

  return {
    slug: blog.slug,
    title: blog.title,
    date: dateSource ? new Date(dateSource).toLocaleDateString('en-US', DATE_FMT) : undefined,
    publishedAt: dateSource,
    readTime: blog.readTime ?? undefined,
    author: blog.author?.name,
    excerpt: blog.metaDescription ?? undefined,
    content: blog.content,
    image: {
      src: toMediaUrl(picked.url),
      alt: blog.coverImageAlt ?? blog.coverImage.alternativeText ?? blog.title,
      width: picked.width,
      height: picked.height,
    },
    metaDescription: blog.metaDescription ?? undefined,
  }
}
