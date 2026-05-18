/**
 * Re-seeds the database: runs the seed migration's `down()` (which wipes
 * blogs/authors/media) followed by `up()` (which re-inserts from the CSV).
 *
 * We bypass Payload's `migrate:fresh` runner because:
 *   1. The `payload migrate:fresh` CLI fails on Node 24 (`@next/env` interop
 *      bug, same one that breaks `payload generate:types`).
 *   2. `payload.db.migrateFresh()` drops all tables but runs the migration
 *      before the adapter's `push` re-creates the schema, so the seed's
 *      first INSERT hits a "relation does not exist" error.
 *
 * This script keeps the schema in place (Payload's auto-push handles it on
 * init) and just toggles the data via the same migration file, wrapped in a
 * transaction so a mid-import failure rolls back to the prior state.
 *
 * Run with:
 *   node --experimental-strip-types --no-warnings scripts/db-fresh.ts
 *
 * Destructive — wipes blogs/authors/media. Safe to re-run.
 */
import 'dotenv/config'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import config from '../payload.config.ts'
import {
  up as upBlogs,
  down as downBlogs,
} from '../migrations/20260515_112043_seed_blogs.ts'
import {
  up as upProjects,
  down as downProjects,
} from '../migrations/20260518_120000_seed_projects.ts'
import {
  up as upGallery,
  down as downGallery,
} from '../migrations/20260518_103241_seed_gallery.ts'

async function main() {
  const payload = await getPayload({ config })
  payload.logger.info('db-fresh: starting (wipe + re-seed)')

  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) {
    throw new Error('Could not begin a transaction.')
  }

  const req = { transactionID, payload } as unknown as PayloadRequest

  try {
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
    if (typeof transactionID === 'string' || typeof transactionID === 'number') {
      await payload.db.commitTransaction(transactionID)
    }
    payload.logger.info('db-fresh: done')
    process.exit(0)
  } catch (e) {
    if (typeof transactionID === 'string' || typeof transactionID === 'number') {
      await payload.db.rollbackTransaction(transactionID)
    }
    throw e
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
