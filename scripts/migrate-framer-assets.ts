/**
 * One-time migration — de-Framer the EPYC site.
 *
 * epyc.in currently runs on Framer; once that site is taken down,
 * `framerusercontent.com` (Framer's CDN) stops serving. Every image the
 * new site references from that CDN must be re-hosted locally first.
 *
 *   tier1 — static codebase references (data/*.ts, components/*, the
 *           styleguide). Images are downloaded into public/images/<category>/
 *           and the source files are rewritten to the local /images/... paths.
 *
 *   tier2 — seed CSVs (scripts/seed/*.csv). Images are downloaded into
 *           scripts/seed/assets/ and the CSV cells rewritten to `assets/<file>`
 *           relative paths (the seed migrations read these local files).
 *
 * Run:
 *   node --experimental-strip-types --no-warnings scripts/migrate-framer-assets.ts tier1
 *   node --experimental-strip-types --no-warnings scripts/migrate-framer-assets.ts tier2
 *
 * Idempotent: existing downloads are skipped; once a file has no Framer URLs
 * left, rewriting it is a no-op. Downloads for a tier all run BEFORE any file
 * is rewritten — so a failed fetch aborts the run without leaving a source
 * file pointing at an asset that was never saved.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

// Matches a Framer CDN URL, capturing the path after the host
// (`images/<file>` or `assets/<file>`). The filename charset covers
// Framer's base62 hashes plus the extension.
const FRAMER_URL = /https:\/\/framerusercontent\.com\/((?:images|assets)\/[A-Za-z0-9._-]+)/g
// data/{projects,brands,testimonials}.ts use `const FRAMER = "...images"` and
// then `${FRAMER}/<file>` — capture those filenames too.
const FRAMER_TMPL = /\$\{FRAMER\}\/([A-Za-z0-9._-]+)/g

type Download = { url: string; dest: string }

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function fetchTo({ url, dest }: Download): Promise<'downloaded' | 'skipped'> {
  if (await exists(dest)) return 'skipped'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 100) throw new Error(`fetch ${url} -> suspiciously small (${buf.length}b)`)
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, buf)
  return 'downloaded'
}

/** Run `fn` over `items` with a bounded number of concurrent workers. */
async function pool<T>(items: T[], size: number, fn: (t: T) => Promise<void>): Promise<void> {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]!)
    }),
  )
}

async function downloadAll(label: string, downloads: Download[]): Promise<void> {
  console.log(`${label}: ${downloads.length} unique images to fetch`)
  let ok = 0
  let skipped = 0
  await pool(downloads, 10, async (d) => {
    const r = await fetchTo(d)
    r === 'downloaded' ? ok++ : skipped++
    process.stdout.write('.')
  })
  console.log(`\n${label}: ${ok} downloaded, ${skipped} already present`)
}

// ── Tier 1: codebase ───────────────────────────────────────────────────────
const TIER1: { file: string; category: string }[] = [
  { file: 'data/brands.ts', category: 'brands' },
  { file: 'data/projects.ts', category: 'projects' },
  { file: 'data/testimonials.ts', category: 'testimonials' },
  { file: 'data/gallery.ts', category: 'gallery' },
  { file: 'components/ui/paper-background.tsx', category: 'site' },
  { file: 'components/ui/button.tsx', category: 'site' },
  { file: 'components/sections/cta-footer.tsx', category: 'site' },
  { file: 'components/sections/voices.tsx', category: 'site' },
  { file: 'components/sections/sticky-image.tsx', category: 'site' },
  { file: 'components/sections/hero.tsx', category: 'site' },
  { file: 'components/sections/faqs.tsx', category: 'site' },
  { file: 'components/sections/contact-form.tsx', category: 'site' },
  { file: 'components/sections/contact-hero.tsx', category: 'site' },
  { file: 'components/sections/testimonial-slider.tsx', category: 'site' },
  { file: 'app/(my-app)/styleguide/page.tsx', category: 'site' },
]

async function tier1(): Promise<void> {
  // Scan every source file, collect the downloads (deduped by destination).
  const downloads = new Map<string, Download>()
  for (const { file, category } of TIER1) {
    const content = await fs.readFile(path.join(ROOT, file), 'utf8')
    for (const m of content.matchAll(FRAMER_URL)) {
      const name = path.basename(m[1]!)
      const dest = path.join(ROOT, 'public/images', category, name)
      downloads.set(dest, { url: `https://framerusercontent.com/${m[1]}`, dest })
    }
    for (const m of content.matchAll(FRAMER_TMPL)) {
      const dest = path.join(ROOT, 'public/images', category, m[1]!)
      downloads.set(dest, { url: `https://framerusercontent.com/images/${m[1]}`, dest })
    }
  }
  await downloadAll('tier1', [...downloads.values()])

  // All assets are on disk — now rewrite the sources.
  for (const { file, category } of TIER1) {
    const abs = path.join(ROOT, file)
    const before = await fs.readFile(abs, 'utf8')
    let after = before
      .replaceAll('https://framerusercontent.com/images', `/images/${category}`)
      .replaceAll('https://framerusercontent.com/assets', `/images/${category}`)
    // Drop `?width=&height=` query hints — local files don't need them.
    after = after.replace(
      new RegExp(`(/images/${category}/[A-Za-z0-9._-]+)\\?[A-Za-z0-9=&]*`, 'g'),
      '$1',
    )
    if (after !== before) {
      await fs.writeFile(abs, after)
      console.log(`  rewrote ${file}`)
    }
  }
}

// ── Tier 2: seed CSVs ──────────────────────────────────────────────────────
const CSVS = ['Blog.csv', 'Gallery.csv', 'Projects.csv']

async function tier2(): Promise<void> {
  const downloads = new Map<string, Download>()
  for (const csv of CSVS) {
    const content = await fs.readFile(path.join(ROOT, 'scripts/seed', csv), 'utf8')
    for (const m of content.matchAll(FRAMER_URL)) {
      const name = path.basename(m[1]!)
      const dest = path.join(ROOT, 'scripts/seed/assets', name)
      downloads.set(dest, { url: `https://framerusercontent.com/${m[1]}`, dest })
    }
  }
  await downloadAll('tier2', [...downloads.values()])

  for (const csv of CSVS) {
    const abs = path.join(ROOT, 'scripts/seed', csv)
    const before = await fs.readFile(abs, 'utf8')
    const after = before.replace(FRAMER_URL, (_m, p: string) => `assets/${path.basename(p)}`)
    if (after !== before) {
      await fs.writeFile(abs, after)
      console.log(`  rewrote scripts/seed/${csv}`)
    }
  }
}

const tier = process.argv[2]
if (tier === 'tier1') await tier1()
else if (tier === 'tier2') await tier2()
else {
  console.error('usage: migrate-framer-assets.ts <tier1|tier2>')
  process.exit(1)
}
console.log('migrate-framer-assets: done')
