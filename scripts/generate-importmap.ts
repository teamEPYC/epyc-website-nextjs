/**
 * Regenerate app/(payload)/admin/importMap.js by calling Payload's
 * programmatic API. Skips the `payload generate:importmap` CLI, which is
 * broken in this project: the CLI bundles payload.config.ts to CJS and
 * `require()`s it, but `@lexical/headless`, `@lexical/html`, and
 * `@lexical/table` ship `.node.mjs` entries containing top-level await —
 * Node's CJS loader refuses to require an ESM graph with TLA
 * (ERR_REQUIRE_ASYNC_MODULE). Loading the config as native ESM via tsx
 * sidesteps the issue.
 *
 * Run with:
 *   pnpm generate:importmap
 */
// No env-var loading needed: generateImportMap walks the static config
// tree to discover admin components, never opens a DB connection or reads
// secrets. The lazy D1 Proxy in payload.config.ts is constructed but
// never dereferenced.
import { generateImportMap } from 'payload'
import configPromise from '../payload.config.ts'

const config = await configPromise
await generateImportMap(config, { log: true })
