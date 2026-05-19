/**
 * Seed migration: loads scripts/seed/Blog.csv into the `blogs` collection
 * (plus its dependencies `authors` and `media`).
 *
 * - `up()` mirrors the original `scripts/import-blogs.ts` logic, but threaded
 *   through `req` so all writes share the migration's transaction.
 * - `down()` wipes every doc in those three collections, restoring a clean state.
 *
 * Re-run on a fresh DB via `node --experimental-strip-types --no-warnings
 * scripts/db-fresh.ts` (or, once the Payload CLI is fixed, `payload migrate:fresh`).
 */
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-d1-sqlite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { JSDOM } from 'jsdom'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const CSV_PATH = path.resolve(process.cwd(), 'scripts', 'seed', 'Blog.csv')

type Row = {
  Slug: string
  Title: string
  Date: string
  Image: string
  'Image:alt': string
  Author: string
  'Read Time': string
  Content: string
  'Meta Title': string
  'Meta Description': string
}

function humaniseSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) =>
      w.length <= 3 ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1),
    )
    .join(' ')
}

type LexNode = {
  type: string
  children?: LexNode[]
  pending?: { src?: string }
  relationTo?: string
  value?: string | number
  fields?: unknown
}

function resolveUploads(node: LexNode, urlToMediaId: Map<string, string | number>): void {
  if (node.type === 'upload' && node.pending?.src) {
    const id = urlToMediaId.get(node.pending.src)
    if (id) {
      node.relationTo = 'media'
      node.value = id
      node.fields = null
      delete node.pending
    }
  }
  if (node.children) for (const c of node.children) resolveUploads(c, urlToMediaId)
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const text = await fs.readFile(CSV_PATH, 'utf8')
  const rows = parse(text, { columns: true, skip_empty_lines: true, bom: true }) as Row[]
  payload.logger.info(`Seed: parsed ${rows.length} rows from ${CSV_PATH}`)

  // 1) Authors
  const authorIds = new Map<string, string | number>()
  for (const slug of new Set(rows.map((r) => r.Author))) {
    const created = await payload.create({
      collection: 'authors',
      data: { name: humaniseSlug(slug), slug },
      req,
    })
    authorIds.set(slug, created.id)
    payload.logger.info(`Seed: author ${slug} -> ${created.id}`)
  }

  // 2) Collect every distinct image URL (covers + inline)
  const urlToAlt = new Map<string, string>()
  for (const row of rows) {
    if (row.Image) urlToAlt.set(row.Image, row.Title)
    const dom = new JSDOM(`<body>${row.Content}</body>`)
    for (const img of dom.window.document.querySelectorAll('img')) {
      const src = img.getAttribute('src')
      if (src && !urlToAlt.has(src)) urlToAlt.set(src, row.Title)
    }
  }
  payload.logger.info(`Seed: ${urlToAlt.size} images to re-host`)

  // 3) Re-host each
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
    payload.logger.info(`Seed: [${i}/${urlToAlt.size}] uploaded ${filename}`)
  }

  // 4) Blogs — HTML→Lexical, resolve pending uploads, insert
  const editorConfig = await editorConfigFactory.default({ config: payload.config })
  for (const row of rows) {
    const content = convertHTMLToLexical({ editorConfig, html: row.Content, JSDOM })
    resolveUploads(content.root as unknown as LexNode, urlToMediaId)

    const coverId = urlToMediaId.get(row.Image)
    if (!coverId) throw new Error(`No cover media for blog ${row.Slug}`)

    await payload.create({
      collection: 'blogs',
      data: {
        title: row.Title,
        slug: row.Slug,
        publishedAt: row.Date || undefined,
        author: authorIds.get(row.Author)!,
        readTime: row['Read Time'] || undefined,
        cover: coverId,
        content: content as unknown as Parameters<typeof payload.create>[0]['data']['content'],
        _status: 'published',
      },
      context: { disableRevalidate: true },
      req,
    })
    payload.logger.info(`Seed: imported blog ${row.Slug}`)
  }

  payload.logger.info('Seed: done')
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // Wipe every doc in the three collections this migration owns. The seed is
  // the only writer for these in our project right now, so this is safe.
  await payload.delete({
    collection: 'blogs',
    where: { id: { exists: true } },
    req,
    context: { disableRevalidate: true },
  })
  await payload.delete({ collection: 'authors', where: { id: { exists: true } }, req })
  await payload.delete({ collection: 'media', where: { id: { exists: true } }, req })
  payload.logger.info('Seed: down — wiped blogs, authors, media')
}
