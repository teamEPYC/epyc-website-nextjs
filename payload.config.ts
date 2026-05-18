import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Authors } from './collections/Authors.ts'
import { Blogs } from './collections/Blogs.ts'
import { Projects } from './collections/Projects.ts'
import { Gallery } from './collections/Gallery.ts'
import { Submissions } from './collections/Submissions.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Authors, Blogs, Projects, Gallery, Submissions],
  editor: lexicalEditor(),
  sharp,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
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
