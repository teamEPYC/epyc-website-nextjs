/**
 * Seed migration: loads scripts/seed/Projects.csv into the `projects`
 * collection (and `media`, for thumbnails).
 *
 * - `up()` parses the CSV, normalises type/industry/redirectLink/featured,
 *   re-hosts each Framer-hosted thumbnail into Payload's Media collection,
 *   then inserts a published project per row. All writes share the
 *   migration's transaction via `req`.
 * - `down()` wipes every doc in the `projects` collection. Thumbnails are
 *   left intact because the Blogs seed also writes to `media`; clearing both
 *   collections together is `scripts/db-fresh.ts`'s job.
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-d1-sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { loadSeedImage } from './load-seed-image.ts'

const CSV_PATH = path.resolve(process.cwd(), 'scripts', 'seed', 'Projects.csv')

type Row = {
  Slug: string
  Title: string
  Thumbnail: string
  'Thumbnail:alt': string
  Type: string
  'Project Industry': string
  'Project Platform': string
  'Redirect Link': string
  'Featured Project?': string
}

type ProjectType =
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

const TYPE_ALIASES: Record<string, ProjectType> = {
  WEBFLOW: 'WEBFLOW',
  WORDPRESS: 'WORDPRESS',
  FRAMER: 'FRAMER',
  'BUBBLE.IO': 'BUBBLE_IO',
  SHOPIFY: 'SHOPIFY',
  DEV: 'DEVELOPMENT',
  DEVELOPMENT: 'DEVELOPMENT',
  'CUSTOM CODE': 'DEVELOPMENT',
  'UI-UX': 'UI_UX',
  'UI/UX': 'UI_UX',
  'UX-UI': 'UI_UX',
  INTERACTIONS: 'INTERACTIONS',
  BRANDING: 'BRANDING',
  '3D': '3D',
  SEO: 'SEO',
  AUTOMATIONS: 'AUTOMATIONS',
  'VIRAL LOOPS': 'VIRAL_LOOPS',
}

type ProjectIndustry =
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

const VALID_INDUSTRIES = new Set<ProjectIndustry>([
  'vc',
  'saas',
  'finance',
  'healthcare',
  'edtech',
  'web3',
  'ecommerce',
  'services',
  'community-initiative',
  'ngo',
  'other',
])

function normaliseTypes(raw: string, slug: string, warn: (msg: string) => void): ProjectType[] {
  const out: ProjectType[] = []
  for (const segment of raw.split(',')) {
    const key = segment.trim().toUpperCase()
    if (!key) continue
    const mapped = TYPE_ALIASES[key]
    if (!mapped) {
      warn(`project ${slug}: unknown type "${segment.trim()}" — skipping`)
      continue
    }
    if (!out.includes(mapped)) out.push(mapped)
  }
  return out
}

function normaliseIndustry(raw: string, slug: string): ProjectIndustry {
  // CSV uses a non-ASCII hyphen (U+2011) in "e‑commerce"; collapse to ASCII.
  const cleaned = raw.replace(/[‐-―]/g, '-').trim().toLowerCase()
  const mapped: string = cleaned === 'e-commerce' ? 'ecommerce' : cleaned
  if (!VALID_INDUSTRIES.has(mapped as ProjectIndustry)) {
    throw new Error(`project ${slug}: unknown industry "${raw}"`)
  }
  return mapped as ProjectIndustry
}

function normaliseRedirect(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const text = await fs.readFile(CSV_PATH, 'utf8')
  const rows = parse(text, { columns: true, skip_empty_lines: true, bom: true }) as Row[]
  payload.logger.info(`Seed projects: parsed ${rows.length} rows from ${CSV_PATH}`)

  // Detect duplicate slugs up front and surface as a warning (we still seed both).
  const seen = new Map<string, number>()
  for (const r of rows) seen.set(r.Slug, (seen.get(r.Slug) ?? 0) + 1)
  for (const [slug, count] of seen) {
    if (count > 1) {
      payload.logger.warn(`Seed projects: duplicate slug "${slug}" appears ${count}x — keeping all`)
    }
  }

  // Re-host each unique thumbnail URL into Media.
  const urlToAlt = new Map<string, string>()
  for (const row of rows) {
    if (row.Thumbnail && !urlToAlt.has(row.Thumbnail)) {
      urlToAlt.set(row.Thumbnail, row['Thumbnail:alt'] || row.Title)
    }
  }
  payload.logger.info(`Seed projects: ${urlToAlt.size} thumbnails to re-host`)

  const urlToMediaId = new Map<string, string | number>()
  let i = 0
  for (const [url, alt] of urlToAlt) {
    i++
    const image = await loadSeedImage(url)
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: image.data,
        name: image.filename,
        mimetype: image.mimetype,
        size: image.data.length,
      },
      req,
    })
    urlToMediaId.set(url, doc.id)
    payload.logger.info(`Seed projects: [${i}/${urlToAlt.size}] uploaded ${image.filename}`)
  }

  const warnings: string[] = []
  for (const row of rows) {
    const thumbnailId = urlToMediaId.get(row.Thumbnail)
    if (!thumbnailId) throw new Error(`No thumbnail media for project ${row.Slug}`)

    const types = normaliseTypes(row.Type, row.Slug, (msg) => warnings.push(msg))
    if (types.length === 0) {
      // Payload `required` + hasMany rejects empty arrays; abort loudly.
      throw new Error(`project ${row.Slug}: no recognised types in "${row.Type}"`)
    }

    await payload.create({
      collection: 'projects',
      data: {
        title: row.Title,
        slug: row.Slug,
        thumbnail: thumbnailId,
        type: types,
        industry: normaliseIndustry(row['Project Industry'], row.Slug),
        platform: row['Project Platform']?.trim().toLowerCase() === 'app' ? 'app' : 'website',
        redirectLink: normaliseRedirect(row['Redirect Link']),
        featured: row['Featured Project?']?.trim().toLowerCase() === 'yes',
        _status: 'published',
      },
      context: { disableRevalidate: true },
      req,
    })
    payload.logger.info(`Seed projects: imported ${row.Slug}`)
  }

  for (const w of warnings) payload.logger.warn(`Seed projects: ${w}`)
  payload.logger.info(`Seed projects: done (${rows.length} projects, ${warnings.length} warnings)`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'projects',
    where: { id: { exists: true } },
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('Seed projects: down — wiped projects')
}
