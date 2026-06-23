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
  caseStudyPath?: string | null
  industry: ProjectIndustry
  platform: ProjectPlatform
  types: string[]
  typesDisplay: string
  featured: boolean
  createdAt: string
  // `null` when the project has no thumbnail (e.g. an incomplete draft) —
  // consumers render a neutral `bone` placeholder box in the same shape.
  image: {
    src: string
    alt: string
    width: number
    height: number
  } | null
}

function pickImageUrl(media: StrapiMedia): { url: string; width: number; height: number } {
  const fmt = media.formats?.large
  if (fmt?.url) return fmt
  return { url: media.url, width: media.width, height: media.height }
}

export function normaliseProject(project: StrapiProject): NormalisedProject {
  // Strapi returns null for unset media/relations in draft mode even though
  // the types say required — guard every dereference so an incomplete draft
  // renders with placeholders/fallbacks instead of crashing the page.
  const picked = project.thumbnail ? pickImageUrl(project.thumbnail) : null
  const types = (project.type ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const link = project.redirectLink ?? ''

  return {
    slug: project.slug,
    title: project.title ?? 'Untitled',
    redirectLink: link ? (/^https?:\/\//i.test(link) ? link : `https://${link}`) : '#',
    caseStudyPath: project.caseStudyPath ?? null,
    industry: (project.industry?.slug ?? 'other') as ProjectIndustry,
    platform: (project.platform?.slug ?? 'website') as ProjectPlatform,
    types,
    typesDisplay: project.type ?? '',
    featured: Boolean(project.featured),
    createdAt: project.publishedAt,
    image: picked
      ? {
          src: picked.url,
          alt: project.thumbnailAlt ?? project.thumbnail?.alternativeText ?? project.title ?? 'Untitled',
          width: picked.width ?? 1080,
          height: picked.height ?? 608,
        }
      : null,
  }
}
