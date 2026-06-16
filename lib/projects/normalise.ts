import type { StrapiProject, StrapiMedia } from '../strapi/types'

export type ProjectIndustry =
  | 'vc'
  | 'saas'
  | 'finance'
  | 'healthcare'
  | 'edtech'
  | 'web3'
  | 'ecommerce'
  | 'services'
  | 'community-initiative'
  | 'ngo'
  | 'other'

export type ProjectPlatform = 'website' | 'app'

export type NormalisedProject = {
  slug: string
  title: string
  redirectLink: string
  industry: ProjectIndustry
  platform: ProjectPlatform
  types: string[]
  typesDisplay: string
  featured: boolean
  createdAt: string
  image: {
    src: string
    alt: string
    width: number
    height: number
  }
}

function pickImageUrl(media: StrapiMedia): { url: string; width: number; height: number } {
  const fmt = media.formats?.large
  if (fmt?.url) return fmt
  return { url: media.url, width: media.width, height: media.height }
}

export function normaliseProject(project: StrapiProject): NormalisedProject {
  const picked = pickImageUrl(project.thumbnail)
  const types = project.type.split(',').map((s) => s.trim()).filter(Boolean)

  return {
    slug: project.slug,
    title: project.title,
    redirectLink: /^https?:\/\//i.test(project.redirectLink) ? project.redirectLink : `https://${project.redirectLink}`,
    industry: project.industry.slug as ProjectIndustry,
    platform: project.platform.slug as ProjectPlatform,
    types,
    typesDisplay: project.type,
    featured: Boolean(project.featured),
    createdAt: project.publishedAt,
    image: {
      src: picked.url,
      alt: project.thumbnailAlt ?? project.thumbnail.alternativeText ?? project.title,
      width: picked.width ?? 1080,
      height: picked.height ?? 608,
    },
  }
}
