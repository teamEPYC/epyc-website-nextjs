import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

// NOTE: `sharp` is intentionally NOT imported. It's a native module and
// can't run in the Cloudflare Workers runtime; including it broke the
// OpenNext bundler. Payload will skip server-side image variant
// generation as a result. If we ever need image transforms again, the
// Cloudflare-native path is Cloudflare Images, not sharp.

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Authors } from './collections/Authors.ts'
import { Blogs } from './collections/Blogs.ts'
import { Projects } from './collections/Projects.ts'
import { Gallery } from './collections/Gallery.ts'
import { Submissions } from './collections/Submissions.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function getD1Binding(): D1Database {
  // CLI/build-time: Payload's CLI bundles config to CJS (no top-level await)
  // and never queries the DB. Stub the binding so config evaluation succeeds.
  if (process.env.PAYLOAD_CLI === '1') {
    return new Proxy({} as D1Database, {
      get() {
        throw new Error('D1 binding not available in CLI mode')
      },
    })
  }
  // Runtime: defer resolution to first use. payload.config.ts is loaded at
  // module init, before `initOpenNextCloudflareForDev()` finishes setting up
  // the binding. The lazy Proxy lets the adapter hold a reference now and
  // resolve to the real D1Database only when a request actually issues a
  // query — by which point init is done.
  let cached: D1Database | undefined
  return new Proxy({} as D1Database, {
    get(_target, prop) {
      if (!cached) {
        cached = getCloudflareContext().env.DB as D1Database
      }
      const value = (cached as unknown as Record<PropertyKey, unknown>)[prop]
      return typeof value === 'function' ? (value as Function).bind(cached) : value
    },
  })
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Authors, Blogs, Projects, Gallery, Submissions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // D1 binding is exposed via @opennextjs/cloudflare's `getCloudflareContext`.
  // `initOpenNextCloudflareForDev()` in next.config.ts wires the same binding
  // into `next dev`, so the runtime path is identical locally and in prod.
  //
  // For Payload's CLI commands (generate:db-schema, generate:types,
  // generate:importmap) there's no Cloudflare runtime — those traverse the
  // schema but never query the DB. A Proxy stub keeps the type happy without
  // pulling the runtime context.
  db: sqliteD1Adapter({
    binding: getD1Binding(),
    migrationDir: path.resolve(dirname, 'migrations/schema'),
    // Disable Payload's pushDevSchema. Schema is owned by the SQL files in
    // migrations/schema and applied via `wrangler d1 migrations apply` (both
    // locally and in CI). Mirrors prod behaviour exactly and avoids the
    // dev-boot prompt where pushDevSchema sees wrangler's d1_migrations
    // tracking table as extraneous and asks to drop it.
    push: false,
  }),
  plugins: [
    // Only enable S3/R2 storage when the credentials are present. Local dev
    // (no R2_* env vars) falls back to Payload's default disk storage under
    // ./media — uploads still work, just locally.
    ...(process.env.R2_BUCKET && process.env.R2_ENDPOINT
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.R2_BUCKET,
            config: {
              endpoint: process.env.R2_ENDPOINT,
              region: 'auto',
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})
