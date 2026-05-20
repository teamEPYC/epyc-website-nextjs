/**
 * Resolves a seed image reference to bytes, for re-hosting into Payload Media.
 *
 * After the Framer migration the seed CSVs hold repo-relative paths
 * (`assets/<file>`, bundled under scripts/seed/assets/), so re-seeding never
 * depends on Framer's CDN. An http(s) URL is still accepted as a fallback for
 * any future CSV rows that reference a remote image directly.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const SEED_DIR = path.resolve(process.cwd(), 'scripts', 'seed')

const MIME_BY_EXT: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export type SeedImage = { data: Buffer; filename: string; mimetype: string }

export async function loadSeedImage(ref: string): Promise<SeedImage> {
  if (/^https?:\/\//i.test(ref)) {
    const res = await fetch(ref)
    if (!res.ok) throw new Error(`Fetch ${ref}: ${res.status}`)
    return {
      data: Buffer.from(await res.arrayBuffer()),
      filename: decodeURIComponent(path.basename(new URL(ref).pathname)),
      mimetype: res.headers.get('content-type') ?? 'image/webp',
    }
  }
  // Repo-relative path (e.g. `assets/<file>`), resolved under scripts/seed/.
  const abs = path.resolve(SEED_DIR, ref.split('?')[0]!)
  return {
    data: await fs.readFile(abs),
    filename: path.basename(abs),
    mimetype: MIME_BY_EXT[path.extname(abs).toLowerCase()] ?? 'application/octet-stream',
  }
}
