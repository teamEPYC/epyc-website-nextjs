// Compares what the website would render from Strapi against what it would
// render from Payload, through the same provider interface the pages use.
//
// The comparison runs on normalised output — the shape the components actually
// receive — rather than on raw API responses, so a difference here is a
// difference a visitor could see.
//
// Some differences are intended by the migration. Those are declared below and
// reported as "explained"; anything else is a defect and fails the run.
//
// Usage:
//   STRAPI_URL=https://cms.epyc.in STRAPI_API_TOKEN=... \
//   PAYLOAD_URL=https://epyc-payload-cms.epyc.workers.dev \
//   pnpm cms:parity

import { writeFile, mkdir } from 'node:fs/promises'
import { PayloadProvider } from '../lib/cms/payload-provider'
import { StrapiProvider } from '../lib/cms/strapi-provider'
import type { CMSProvider } from '../lib/cms/types'
import { normalise } from '../lib/blogs/normalise'
import { normaliseProject } from '../lib/projects/normalise'
import { normaliseGallery } from '../lib/gallery/normalise'

const REPORT = 'artifacts/parity-report.json'

type Diff = { entity: string; key: string; field: string; strapi: unknown; payload: unknown; explained?: string }

/** Media URLs changed shape twice over: Strapi served a resized derivative at a
 * bare path (`/large_x.webp`), Payload records the original at an absolute URL
 * (`https://media.epyc.in/x.webp`). Cloudflare resizes either form on request —
 * verified against the live zone — so only the underlying file must match. */
function canonicalMedia(value: unknown): string {
  return String(value ?? '')
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/(^|\/)(large|medium|small|thumbnail)_/, '$1')
}

/** Differences the migration intends. Each returns a reason when it recognises
 * the pair, so an intended change is never mistaken for a defect — and a defect
 * is never waved through as intended. */
const EXPECTED: Array<(diff: Omit<Diff, 'explained'>) => string | undefined> = [
  // Strapi served a pre-resized derivative (`/large_x.webp`); Payload records
  // the original (`/x.webp`) because resizing happens at Cloudflare's edge.
  ({ field, strapi, payload }) => {
    if (!/image|src|url|thumbnail|cover/i.test(field)) return undefined
    if (!strapi || !payload) return undefined
    return canonicalMedia(strapi) === canonicalMedia(payload)
      ? 'Original at an absolute URL replaces Strapi derivative; Cloudflare resizes on request'
      : undefined
  },
  // Image dimensions follow from the same change.
  ({ field, strapi, payload }) =>
    /width|height/i.test(field) && typeof strapi === 'number' && typeof payload === 'number' && payload >= strapi
      ? 'Original image is larger than the derivative Strapi served'
      : undefined,
  // Duplicate service spellings folded on import.
  ({ field, strapi, payload }) => {
    if (!/types|typesDisplay/i.test(field)) return undefined
    const fold = (value: unknown) =>
      String(value ?? '')
        .replace(/UI\/UX|UX-UI/g, 'UI-UX')
        .replace(/\bDEV\b/g, 'DEVELOPMENT')
    return fold(strapi) === fold(payload) ? 'Duplicate type spellings normalised on import' : undefined
  },
  // The U+2011 slug that never matched the website's filter.
  ({ field, strapi, payload }) =>
    field === 'industry' && String(strapi).replace(/[‐-―]/g, '') === String(payload)
      ? 'Non-breaking hyphen removed so the E-Commerce filter matches'
      : undefined,
]

function explain(diff: Omit<Diff, 'explained'>): string | undefined {
  for (const rule of EXPECTED) {
    const reason = rule(diff)
    if (reason) return reason
  }
  return undefined
}

/** Fields that cannot match by construction: database identities and the
 * timestamps a fresh import necessarily rewrites. */
const IGNORED = new Set(['id', 'createdAt', 'updatedAt'])

function compare(entity: string, key: string, strapi: Record<string, unknown>, payload: Record<string, unknown>, diffs: Diff[]) {
  const fields = new Set([...Object.keys(strapi), ...Object.keys(payload)])
  for (const field of fields) {
    if (IGNORED.has(field)) continue
    const a = strapi[field]
    const b = payload[field]
    if (JSON.stringify(a) === JSON.stringify(b)) continue

    // Recurse one level so a nested image reports `image.src`, not `image`.
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      compare(entity, key, a as Record<string, unknown>, b as Record<string, unknown>, diffs)
      continue
    }
    const diff = { entity, key, field, strapi: a, payload: b }
    diffs.push({ ...diff, explained: explain(diff) })
  }
}

async function collections(provider: CMSProvider) {
  const [blogs, projects, gallery] = await Promise.all([
    provider.listBlogs({ limit: 1000 }),
    provider.listProjects({ limit: 500 }),
    provider.listGalleryItems({ limit: 1000 }),
  ])
  return {
    blogs: blogs.map((blog) => normalise(blog)),
    projects: projects.map(normaliseProject),
    gallery: gallery.map(normaliseGallery),
  }
}

async function main() {
  const strapi = new StrapiProvider()
  const payload = new PayloadProvider({ draft: false })

  console.log('Reading Strapi…')
  const fromStrapi = await collections(strapi)
  console.log('Reading Payload…')
  const fromPayload = await collections(payload)

  // fetchStrapi answers with an empty list when STRAPI_URL is unset, which would
  // otherwise render as "every document is missing from Strapi" — a scary report
  // about nothing.
  const strapiTotal = fromStrapi.blogs.length + fromStrapi.projects.length + fromStrapi.gallery.length
  if (strapiTotal === 0) {
    console.error('Strapi returned no documents at all. Set STRAPI_URL and STRAPI_API_TOKEN — without them this comparison is meaningless.')
    process.exit(2)
  }

  const diffs: Diff[] = []
  const summary: Array<Record<string, unknown>> = []

  for (const entity of ['blogs', 'projects', 'gallery'] as const) {
    const left = fromStrapi[entity] as Array<Record<string, unknown>>
    const right = fromPayload[entity] as Array<Record<string, unknown>>
    const leftSlugs = left.map((item) => String(item.slug))
    const rightSlugs = right.map((item) => String(item.slug))

    const missing = leftSlugs.filter((slug) => !rightSlugs.includes(slug))
    const extra = rightSlugs.filter((slug) => !leftSlugs.includes(slug))
    // Order is part of the rendered output: /projects and /gallery have no
    // client-side sort, so the sequence the provider returns is what visitors see.
    const orderMatches = JSON.stringify(leftSlugs) === JSON.stringify(rightSlugs)

    summary.push({
      entity,
      strapi: left.length,
      payload: right.length,
      missingInPayload: missing.length,
      onlyInPayload: extra.length,
      orderMatches,
    })

    for (const slug of missing) diffs.push({ entity, key: slug, field: '(document)', strapi: 'present', payload: 'ABSENT' })
    for (const slug of extra) diffs.push({ entity, key: slug, field: '(document)', strapi: 'ABSENT', payload: 'present' })
    if (!orderMatches) {
      diffs.push({
        entity,
        key: '(ordering)',
        field: 'sequence',
        strapi: leftSlugs.slice(0, 8),
        payload: rightSlugs.slice(0, 8),
      })
    }

    const bySlug = new Map(right.map((item) => [String(item.slug), item]))
    for (const item of left) {
      const counterpart = bySlug.get(String(item.slug))
      if (counterpart) compare(entity, String(item.slug), item, counterpart, diffs)
    }
  }

  const unexplained = diffs.filter((diff) => !diff.explained)
  const explained = diffs.filter((diff) => diff.explained)

  console.log('\nCounts and ordering')
  console.table(summary)

  if (explained.length > 0) {
    const reasons = explained.reduce<Record<string, number>>((counts, diff) => {
      counts[diff.explained!] = (counts[diff.explained!] ?? 0) + 1
      return counts
    }, {})
    console.log('\nIntended differences')
    console.table(reasons)
  }

  await mkdir('artifacts', { recursive: true })
  await writeFile(REPORT, JSON.stringify({ summary, unexplained, explained }, null, 2))

  if (unexplained.length > 0) {
    console.error(`\n${unexplained.length} unexplained difference(s) — full detail in ${REPORT}`)
    for (const diff of unexplained.slice(0, 30)) {
      console.error(`  ${diff.entity}/${diff.key} ${diff.field}: strapi=${JSON.stringify(diff.strapi)?.slice(0, 90)} payload=${JSON.stringify(diff.payload)?.slice(0, 90)}`)
    }
    process.exitCode = 1
  } else {
    console.log(`\nNo unexplained differences. Report written to ${REPORT}`)
  }
}

void main()
