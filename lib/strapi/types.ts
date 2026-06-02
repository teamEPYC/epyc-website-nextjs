export type StrapiMediaFormats = {
  large?: { url: string; width: number; height: number }
  medium?: { url: string; width: number; height: number }
  small?: { url: string; width: number; height: number }
  thumbnail?: { url: string; width: number; height: number }
}

export type StrapiMedia = {
  id: number
  url: string
  width: number
  height: number
  alternativeText?: string | null
  formats?: StrapiMediaFormats
}

export type StrapiAuthor = { id: number; name: string; slug: string }

export type StrapiBlog = {
  id: number
  documentId: string
  title: string
  slug: string
  publishedDate: string | null
  publishedAt: string
  coverImage: StrapiMedia
  coverImageAlt?: string | null
  author: StrapiAuthor
  readTime?: string | null
  content: string
  metaTitle?: string | null
  metaDescription?: string | null
}

export type StrapiIndustry = { id: number; title: string; slug: string }
export type StrapiPlatform = { id: number; title: string; slug: string }

export type StrapiProject = {
  id: number
  documentId: string
  title: string
  slug: string
  publishedAt: string
  thumbnail: StrapiMedia
  thumbnailAlt?: string | null
  type: string
  industry: StrapiIndustry
  platform: StrapiPlatform
  redirectLink: string
  featured: boolean
}

export type StrapiGalleryItem = {
  id: number
  documentId: string
  title: string
  slug: string
  image?: StrapiMedia | null
  imageAlt?: string | null
  videoUrl?: string | null
  content?: string | null
  designer?: string | null
  externalUrl?: string | null
  year?: string | null
}

export type StrapiList<T> = {
  data: T[]
  meta: { pagination: { start: number; limit: number; total: number } }
}

export type StrapiSingle<T> = { data: T }
