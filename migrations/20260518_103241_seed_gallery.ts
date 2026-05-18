/**
 * Seed migration: loads scripts/seed/Gallery.csv into the `gallery` collection
 * (and `media`, for thumbnails).
 *
 * - `up()` parses the CSV, re-hosts each Framer-hosted image into Payload's
 *   Media collection, then inserts a published gallery item per row. Video-only
 *   rows store the remote `Video Url` as `videoUrl` and leave `thumbnail`
 *   unset; rows with only an image get a thumbnail and no `videoUrl`; rows
 *   with both (e.g. number-8/9) store both — the normaliser prefers videoUrl
 *   so the image acts as a poster fallback.
 * - `down()` wipes every doc in the `gallery` collection. Media is left intact
 *   because Blogs/Projects seeds also write to it; `scripts/db-fresh.ts` owns
 *   the full media wipe.
 */
import type {
  MigrateUpArgs,
  MigrateDownArgs,
} from '@payloadcms/db-vercel-postgres'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

const CSV_PATH = path.resolve(process.cwd(), 'scripts', 'seed', 'Gallery.csv')

type Row = {
  Slug: string
  Title: string
  'Video Url': string
  Image: string
  'Image:alt': string
  Content: string
  Designer: string
  URL: string
  Year: string
}

/**
 * Strip the CSV's HTML wrapper down to a plain-text paragraph. The Content
 * column is always shaped `<p dir="auto">...</p>`, sometimes with only `<br>`
 * inside (which means "no description"). We collapse to plain text and drop
 * the row entirely when the result is empty after trimming.
 */
function extractDescription(html: string): string | undefined {
  if (!html) return undefined
  // Strip outer paragraph + dir attribute.
  let s = html.replace(/<p\b[^>]*>/i, '').replace(/<\/p>\s*$/i, '')
  // Replace <br> with a space, drop any remaining tags.
  s = s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s.length > 0 ? s : undefined
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const text = await fs.readFile(CSV_PATH, 'utf8')
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Row[]
  payload.logger.info(`Seed gallery: parsed ${rows.length} rows from ${CSV_PATH}`)

  // Detect duplicate slugs up front and warn (we still seed both).
  const seen = new Map<string, number>()
  for (const r of rows) seen.set(r.Slug, (seen.get(r.Slug) ?? 0) + 1)
  for (const [slug, count] of seen) {
    if (count > 1) {
      payload.logger.warn(
        `Seed gallery: duplicate slug "${slug}" appears ${count}x — keeping all`,
      )
    }
  }

  // Re-host each unique image URL into Media.
  const urlToAlt = new Map<string, string>()
  for (const row of rows) {
    if (row.Image && !urlToAlt.has(row.Image)) {
      urlToAlt.set(row.Image, row['Image:alt'] || row.Title)
    }
  }
  payload.logger.info(`Seed gallery: ${urlToAlt.size} images to re-host`)

  const urlToMediaId = new Map<string, string | number>()
  let i = 0
  for (const [url, alt] of urlToAlt) {
    i++
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Fetch ${url}: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const filename = decodeURIComponent(path.basename(new URL(url).pathname))
    const mimetype = res.headers.get('content-type') ?? 'image/webp'
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buf, name: filename, mimetype, size: buf.length },
      req,
    })
    urlToMediaId.set(url, doc.id)
    payload.logger.info(
      `Seed gallery: [${i}/${urlToAlt.size}] uploaded ${filename}`,
    )
  }

  for (const row of rows) {
    const thumbnailId = row.Image ? urlToMediaId.get(row.Image) : undefined
    const videoUrl = row['Video Url']?.trim() || undefined

    if (!thumbnailId && !videoUrl) {
      throw new Error(
        `Seed gallery: row "${row.Slug}" has neither Image nor Video Url`,
      )
    }

    await payload.create({
      collection: 'gallery',
      data: {
        title: row.Title,
        slug: row.Slug,
        ...(thumbnailId ? { thumbnail: thumbnailId } : {}),
        ...(videoUrl ? { videoUrl } : {}),
        designers: row.Designer?.trim() || undefined,
        description: extractDescription(row.Content),
        previewLink: row.URL?.trim() || undefined,
        year: row.Year?.trim() || undefined,
        _status: 'published',
      },
      context: { disableRevalidate: true },
      req,
    })
    payload.logger.info(`Seed gallery: imported ${row.Slug}`)
  }

  payload.logger.info(`Seed gallery: done (${rows.length} items)`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({
    collection: 'gallery',
    where: { id: { exists: true } },
    req,
    context: { disableRevalidate: true },
  })
  payload.logger.info('Seed gallery: down — wiped gallery')
}
