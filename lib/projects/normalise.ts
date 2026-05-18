/**
 * Adapter from Payload `projects` docs into the shape the UI consumes.
 * Hand-authored types — `payload generate:types` is broken in this project
 * (see lib/blogs/normalise.ts for the same workaround note).
 */
import type { PayloadMedia, PayloadMediaSize, CoverSize } from '../blogs/normalise.ts'

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

export type ProjectType =
  | 'WEBFLOW'
  | 'WORDPRESS'
  | 'FRAMER'
  | 'BUBBLE_IO'
  | 'SHOPIFY'
  | 'DEVELOPMENT'
  | 'UI_UX'
  | 'INTERACTIONS'
  | 'BRANDING'
  | '3D'
  | 'SEO'
  | 'AUTOMATIONS'
  | 'VIRAL_LOOPS'

export type ProjectPlatform = 'website' | 'app'

export type PayloadProject = {
  id: string | number
  slug?: string | null
  title: string
  thumbnail: PayloadMedia | string | number
  type: ProjectType[]
  industry: ProjectIndustry
  platform: ProjectPlatform
  redirectLink: string
  featured?: boolean | null
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published' | 'changed'
}

export type NormalisedProject = {
  slug: string
  title: string
  redirectLink: string
  industry: ProjectIndustry
  platform: ProjectPlatform
  types: ProjectType[]
  typesDisplay: string
  featured: boolean
  createdAt: string
  image: {
    src: string
    alt: string
    width: number
    height: number
    focalX?: number
    focalY?: number
  }
}

/** Display label for each canonical type enum, matching the CSV's source casing. */
const TYPE_LABEL: Record<ProjectType, string> = {
  WEBFLOW: 'WEBFLOW',
  WORDPRESS: 'WORDPRESS',
  FRAMER: 'FRAMER',
  BUBBLE_IO: 'BUBBLE.IO',
  SHOPIFY: 'SHOPIFY',
  DEVELOPMENT: 'DEVELOPMENT',
  UI_UX: 'UI-UX',
  INTERACTIONS: 'INTERACTIONS',
  BRANDING: 'BRANDING',
  '3D': '3D',
  SEO: 'SEO',
  AUTOMATIONS: 'AUTOMATIONS',
  VIRAL_LOOPS: 'VIRAL LOOPS',
}

function pickSize(thumbnail: PayloadMedia, size: CoverSize): PayloadMediaSize {
  const variant = thumbnail.sizes?.[size]
  if (variant?.url) return variant
  return {
    url: thumbnail.url,
    width: thumbnail.width,
    height: thumbnail.height,
    filename: thumbnail.filename,
  }
}

export function normaliseProject(
  project: PayloadProject,
  size: CoverSize = 'card',
): NormalisedProject {
  const thumbnail = typeof project.thumbnail === 'object' ? project.thumbnail : null

  if (!thumbnail?.url) {
    throw new Error(
      `Project ${project.slug ?? project.id}: thumbnail is not populated. Query with depth >= 1.`,
    )
  }

  const picked = pickSize(thumbnail, size)
  const types = project.type ?? []

  return {
    slug: project.slug ?? String(project.id),
    title: project.title,
    redirectLink: project.redirectLink,
    industry: project.industry,
    platform: project.platform,
    types,
    typesDisplay: types.map((t) => TYPE_LABEL[t] ?? t).join(', '),
    featured: Boolean(project.featured),
    createdAt: project.createdAt,
    image: {
      src: picked.url!,
      alt: thumbnail.alt || project.title,
      width: picked.width ?? 1080,
      height: picked.height ?? 608,
      focalX: thumbnail.focalX ?? undefined,
      focalY: thumbnail.focalY ?? undefined,
    },
  }
}
