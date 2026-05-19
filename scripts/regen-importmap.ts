/**
 * Regenerates app/(payload)/admin/importMap.js by calling Payload's
 * `generateImportMap` directly. We bypass the `payload generate:importmap`
 * CLI because it currently fails on Node 24 due to a `@next/env` interop
 * bug in `payload/dist/bin/loadEnv.js`.
 *
 * Run with:
 *   node --experimental-strip-types --no-warnings scripts/regen-importmap.ts
 *
 * Re-run after adding new collections / rich-text features / custom admin
 * components.
 */
import { getPayload } from 'payload'
import { generateImportMap } from 'payload'
import config from '../payload.config.ts'

async function main() {
  const payload = await getPayload({ config })
  await generateImportMap(payload.config, { force: true })
  payload.logger.info('Import map regenerated.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
