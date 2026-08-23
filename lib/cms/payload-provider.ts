import type { Author, Blog, CMSProvider, GalleryItem, ListOptions, Media, MediaFormat, Project } from './types'

type PayloadList<T> = { docs: T[]; hasNextPage?: boolean; nextPage?: number | null }
type PayloadRelation<T> = T | string | number | null
type PayloadSize = { url?: string | null; width?: number | null; height?: number | null }
type PayloadMedia = Omit<Media, 'id' | 'url' | 'formats'> & {
  id: string | number
  url?: string | null
  alt?: string | null
  sizes?: Record<string, PayloadSize | undefined>
}
type PayloadAuthor = Omit<Author, 'id' | 'authorImage'> & { id: string | number; authorImage?: PayloadRelation<PayloadMedia> }
type PayloadBlog = Omit<Blog, 'id' | 'coverImage' | 'author' | 'publishedAt'> & {
  id: string | number
  coverImage?: PayloadRelation<PayloadMedia>
  author?: PayloadRelation<PayloadAuthor>
  _status?: 'draft' | 'published'
  publishedAt?: string | null
}
type PayloadProject = Omit<Project, 'id' | 'thumbnail'> & { id: string | number; thumbnail?: PayloadRelation<PayloadMedia> }
type PayloadGallery = Omit<GalleryItem, 'id' | 'image'> & { id: string | number; image?: PayloadRelation<PayloadMedia> }

function populated<T>(value: PayloadRelation<T> | undefined): value is T {
  return typeof value === 'object' && value !== null
}

function size(value?: PayloadSize): MediaFormat | undefined {
  if (!value?.url || !value.width || !value.height) return undefined
  return { url: value.url, width: value.width, height: value.height }
}

function mapMedia(value?: PayloadRelation<PayloadMedia>): Media | null {
  if (!populated(value) || !value.url) return null
  // Consumers (`lib/blogs/normalise.ts`, `lib/projects/normalise.ts`) ask for
  // `formats.large`, which is Strapi's name for the resized copy. Payload calls
  // its equivalent `sizes.card`, so alias it — without this every image falls
  // back to the full-size original.
  const formats: Record<string, MediaFormat | undefined> = {
    thumbnail: size(value.sizes?.thumbnail),
    card: size(value.sizes?.card),
    large: size(value.sizes?.card),
    banner: size(value.sizes?.banner),
  }
  return {
    ...value,
    id: String(value.id),
    url: value.url,
    alternativeText: value.alternativeText ?? value.alt ?? null,
    formats,
  }
}

function mapBlog(item: PayloadBlog): Blog {
  return {
    ...item,
    id: String(item.id),
    publishedAt: item.publishedAt ?? item.publishedDate ?? item.updatedAt,
    coverImage: mapMedia(item.coverImage),
    author: populated<PayloadAuthor>(item.author)
      ? { ...item.author, id: String(item.author.id), authorImage: mapMedia(item.author.authorImage) }
      : null,
  }
}

function mapGalleryItem(item: PayloadGallery): GalleryItem {
  return { ...item, id: String(item.id), designers: item.designers ?? [], image: mapMedia(item.image) }
}

export class PayloadProvider implements CMSProvider {
  private readonly base: string
  private readonly token?: string
  private readonly draft: boolean

  constructor(options: { baseUrl?: string; token?: string; draft?: boolean } = {}) {
    this.base = (options.baseUrl ?? process.env.PAYLOAD_URL ?? '').replace(/\/$/, '')
    this.draft = options.draft ?? false
    this.token = options.token ?? (this.draft ? process.env.PAYLOAD_PREVIEW_TOKEN : process.env.PAYLOAD_READ_TOKEN)
  }

  private async list<T>(collection: string, params: Record<string, string> = {}): Promise<T[]> {
    if (!this.base) throw new Error('Payload: PAYLOAD_URL is required when CMS_PROVIDER=payload')
    const url = new URL(`/api/${collection}`, this.base)
    Object.entries({ depth: '2', limit: '100', draft: String(this.draft), ...params }).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    )
    const response = await fetch(url, {
      headers: this.token ? { Authorization: `users API-Key ${this.token}` } : {},
      ...(this.draft ? { cache: 'no-store' as const } : { next: { revalidate: 60, tags: [`cms:${collection}`] } }),
    })
    if (!response.ok) throw new Error(`Payload ${response.status}: ${collection}`)
    const body = (await response.json()) as PayloadList<T>
    return body.docs
  }

  private async one<T>(collection: string, slug: string): Promise<T | null> {
    const docs = await this.list<T>(collection, { 'where[slug][equals]': slug, limit: '1' })
    return docs[0] ?? null
  }

  async listBlogs(options: ListOptions = {}): Promise<Blog[]> {
    const docs = await this.list<PayloadBlog>('blogs', {
      sort: '-publishedDate',
      limit: String(options.limit ?? 100),
      ...(options.excludeSlug ? { 'where[slug][not_equals]': options.excludeSlug } : {}),
    })
    return docs.map(mapBlog)
  }

  async getBlogBySlug(slug: string) {
    const item = await this.one<PayloadBlog>('blogs', slug)
    return item ? mapBlog(item) : null
  }

  async listProjects(options: ListOptions = {}): Promise<Project[]> {
    const docs = await this.list<PayloadProject>('projects', { sort: '-featured,-publishedAt', limit: String(options.limit ?? 200) })
    return docs.map((item) => ({ ...item, id: String(item.id), type: Array.isArray(item.type) ? item.type : [], thumbnail: mapMedia(item.thumbnail) }))
  }

  async listGalleryItems(options: ListOptions = {}): Promise<GalleryItem[]> {
    const docs = await this.list<PayloadGallery>('gallery', {
      // /gallery renders in Strapi's numeric id order, preserved on import as
      // legacyStrapiId. Payload's default createdAt order would be the import
      // order, which is arbitrary.
      sort: 'legacyStrapiId',
      limit: String(options.limit ?? 500),
      ...(options.excludeSlug ? { 'where[slug][not_equals]': options.excludeSlug } : {}),
    })
    return docs.map(mapGalleryItem)
  }

  async getGalleryItemBySlug(slug: string) {
    const item = await this.one<PayloadGallery>('gallery', slug)
    return item ? mapGalleryItem(item) : null
  }

  async listBlogSlugsForSitemap() {
    const blogs = await this.listBlogs({ limit: 1000 })
    return blogs.map(({ slug, publishedAt }) => ({ slug, publishedAt }))
  }
}
