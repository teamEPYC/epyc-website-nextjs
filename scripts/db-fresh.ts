/**
 * Re-seeds the database from the CSVs in `scripts/seed/`. For each seed,
 * runs `down()` to wipe the target collection, then `up()` to re-import.
 *
 * Unlike the previous Postgres flow, we don't wrap the run in a Payload
 * transaction: D1's binding doesn't expose multi-statement transactions to
 * Drizzle, and Payload's SQLite adapter exposes `beginTransaction()` as a
 * no-op. The seeds rely on `down()` idempotency for safety — re-run the
 * script and any half-imported state gets cleaned and retried.
 *
 * Schema is owned by `migrations/schema/*.sql`, applied via:
 *   pnpm db:migrate:local
 *
 * Run with:
 *   pnpm db:seed:local
 *   (i.e. `node --experimental-strip-types --no-warnings scripts/db-fresh.ts`)
 *
 * Destructive — wipes blogs/authors/projects/gallery/media. Safe to re-run.
 */
import 'dotenv/config'
// Standalone scripts don't go through next.config.ts. OpenNext's
// `initOpenNextCloudflareForDev()` only runs inside the Next dev process
// (it checks for `globalThis.AsyncLocalStorage`), so we bootstrap the
// Cloudflare context manually via wrangler's getPlatformProxy and stash
// it on the global symbol OpenNext reads from. Then the lazy D1 Proxy in
// payload.config.ts can resolve to a real binding on first query.
import { getPlatformProxy } from 'wrangler'
const cloudflareContextSymbol = Symbol.for('__cloudflare-context__')
const proxy = await getPlatformProxy()
;(globalThis as Record<symbol, unknown>)[cloudflareContextSymbol] = {
  env: proxy.env,
  cf: proxy.cf,
  ctx: proxy.ctx,
}

import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import config from '../payload.config.ts'
import {
  up as upBlogs,
  down as downBlogs,
} from '../migrations/seed/20260515_112043_seed_blogs.ts'
import {
  up as upProjects,
  down as downProjects,
} from '../migrations/seed/20260518_120000_seed_projects.ts'
import {
  up as upGallery,
  down as downGallery,
} from '../migrations/seed/20260518_103241_seed_gallery.ts'

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('db-fresh: starting (wipe + re-seed)')

  const req = { payload } as unknown as PayloadRequest

  // Order matters on the down: Projects + Gallery must be wiped before Blogs
  // because Blogs' down() deletes the shared `media` collection (which
  // Project thumbnails and Gallery thumbnails reference). On the up, Blogs
  // goes first by convention; either order works there since the seeds write
  // to disjoint collections.
  await downGallery({ payload, req, db: payload.db } as Parameters<typeof downGallery>[0])
  await downProjects({ payload, req, db: payload.db } as Parameters<typeof downProjects>[0])
  await downBlogs({ payload, req, db: payload.db } as Parameters<typeof downBlogs>[0])
  await upBlogs({ payload, req, db: payload.db } as Parameters<typeof upBlogs>[0])
  await upProjects({ payload, req, db: payload.db } as Parameters<typeof upProjects>[0])
  await upGallery({ payload, req, db: payload.db } as Parameters<typeof upGallery>[0])

  payload.logger.info('db-fresh: done')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
