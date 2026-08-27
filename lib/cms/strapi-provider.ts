import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiBlog, StrapiGalleryItem, StrapiList, StrapiMedia, StrapiProject } from '@/lib/strapi/types'
import type { Blog, CMSProvider, GalleryItem, ListOptions, Media, Project } from './types'

const BLOG_POPULATE = {
  'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
  'populate[author][fields]': 'name,slug',
}
const GALLERY_POPULATE = { 'populate[image][fields]': 'url,width,height,alternativeText' }

function media(value?: StrapiMedia | null): Media | null {
  if (!value) return null
  return { ...value, id: String(value.id) }
}

function blog(value: StrapiBlog): Blog {
  return {
    ...value,
    id: value.documentId || String(value.id),
    coverImage: media(value.coverImage),
    author: value.author ? { ...value.author, id: String(value.author.id) } : null,
  }
}

function project(value: StrapiProject): Project {
  return {
    ...value,
    id: value.documentId || String(value.id),
    thumbnail: media(value.thumbnail),
    type: (value.type ?? '').split(',').map((item) => item.trim()).filter(Boolean),
  }
}

function gallery(value: StrapiGalleryItem): GalleryItem {
  return {
    ...value,
    id: value.documentId || String(value.id),
    image: media(value.image),
    designers: (value.designer ?? '').split(',').map((item) => item.trim()).filter(Boolean),
  }
}

export class StrapiProvider implements CMSProvider {
  async listBlogs(options: ListOptions = {}): Promise<Blog[]> {
    const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      ...BLOG_POPULATE,
      ...(options.excludeSlug ? { 'filters[slug][$ne]': options.excludeSlug } : {}),
      sort: 'publishedDate:desc',
      'pagination[limit]': String(options.limit ?? 100),
    })
    return data.filter((item) => item.slug).map(blog)
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      'filters[slug][$eq]': slug,
      ...BLOG_POPULATE,
      'pagination[limit]': '1',
    })
    return data[0] ? blog(data[0]) : null
  }

  async listProjects(options: ListOptions = {}): Promise<Project[]> {
    const { data } = await fetchStrapi<StrapiList<StrapiProject>>('/projects', {
      'populate[thumbnail][fields]': 'url,width,height,alternativeText,formats',
      'populate[industry][fields]': 'title,slug',
      'populate[platform][fields]': 'title,slug',
      sort: 'featured:desc,publishedAt:desc',
      'pagination[limit]': String(options.limit ?? 200),
    })
    return data.filter((item) => item.slug).map(project)
  }

  async listGalleryItems(options: ListOptions = {}): Promise<GalleryItem[]> {
    const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      ...GALLERY_POPULATE,
      ...(options.excludeSlug ? { 'filters[slug][$ne]': options.excludeSlug } : {}),
      'pagination[limit]': String(options.limit ?? 500),
    })
    return data.filter((item) => item.slug).map(gallery)
  }

  async getGalleryItemBySlug(slug: string): Promise<GalleryItem | null> {
    const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      'filters[slug][$eq]': slug,
      ...GALLERY_POPULATE,
      'pagination[limit]': '1',
    })
    return data[0] ? gallery(data[0]) : null
  }

  async listBlogSlugsForSitemap() {
    const blogs = await this.listBlogs({ limit: 1000 })
    return blogs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
  }
}
