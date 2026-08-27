export type ContentState = 'published' | 'draft'

export type MediaFormat = { url: string; width: number; height: number }

export type Media = {
  id: string
  url: string
  width: number
  height: number
  alternativeText?: string | null
  formats?: Record<string, MediaFormat | undefined>
}

export type Author = {
  id: string
  name: string
  slug: string
  authorImage?: Media | null
}

export type Blog = {
  id: string
  title: string
  slug: string
  publishedDate: string | null
  publishedAt: string
  updatedAt: string
  coverImage?: Media | null
  coverImageAlt?: string | null
  author?: Author | null
  readTime?: string | null
  content?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
}

export type Project = {
  id: string
  title: string
  slug: string
  publishedAt: string
  thumbnail?: Media | null
  thumbnailAlt?: string | null
  type: string[]
  industry?: { title: string; slug: string } | null
  platform?: { title: string; slug: string } | null
  redirectLink?: string | null
  caseStudyPath?: string | null
  featured: boolean
}

export type GalleryItem = {
  id: string
  title: string
  slug: string
  image?: Media | null
  imageAlt?: string | null
  videoUrl?: string | null
  content?: string | null
  designers?: string[]
  externalUrl?: string | null
  year?: string | null
}

export type ListOptions = { limit?: number; excludeSlug?: string }

export interface CMSProvider {
  listBlogs(options?: ListOptions): Promise<Blog[]>
  getBlogBySlug(slug: string): Promise<Blog | null>
  listProjects(options?: ListOptions): Promise<Project[]>
  listGalleryItems(options?: ListOptions): Promise<GalleryItem[]>
  getGalleryItemBySlug(slug: string): Promise<GalleryItem | null>
  listBlogSlugsForSitemap(): Promise<Array<Pick<Blog, 'slug' | 'updatedAt'>>>
}
