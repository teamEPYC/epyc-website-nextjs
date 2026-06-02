# Plan: Migrate from Payload CMS to Strapi v5

## Context

The project currently uses Payload CMS 3 (with Cloudflare D1 + R2) as the content backend. The owner has a fully operational Strapi v5 server with all content migrated. Goal: rip out all Payload code and wire the Next.js frontend to Strapi v5 REST API. Media is hosted on the same R2 bucket via Strapi's S3 provider — image URLs are absolute `pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev` URLs. Blog `content` is HTML (WYSIWYG editor).

**Strapi server:** `http://bc8m09bvlwo8vndobcx7a5kj.159.223.172.58.sslip.io`  
**Auth:** Bearer token via `STRAPI_API_TOKEN` env var  
**R2 image hostname:** `pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev`

**Collections & verified API slugs:**
- `/api/blogs` — Blog
- `/api/projects` — Project
- `/api/gallery-items` — Gallery Item
- `/api/authors` — Author (populated inline, not fetched separately)

---

## Phase 1 — Delete Payload

### Directories to delete entirely
- `app/(payload)/` — admin UI, REST/GraphQL API routes, importMap
- `collections/` — all 7 collection definitions
- `lib/payload/` — revalidation hooks
- `migrations/` — schema SQL + seed TS files (data lives in Strapi now)

### Files to delete
- `payload.config.ts`
- `payload-generated-schema.ts` (if present)
- `payload-types.ts` (if present)
- `scripts/db-fresh.ts`
- `scripts/generate-importmap.ts`
- `scripts/regen-importmap.ts`
- `.github/workflows/seed-staging.yml`
- `.github/workflows/seed-production.yml`

### `app/api/media/file/[filename]/route.ts`
Delete this. Strapi returns absolute R2 URLs — we no longer need an in-app media proxy.

### `instrumentation.ts`
Delete. The polyfills (MessagePort, SharedArrayBuffer, etc.) were only needed because Payload's undici pulled them in at module-eval time.

---

## Phase 2 — Update Config Files

### `next.config.ts`
- Remove `import { withPayload }` and `withPayload(nextConfig)` wrapper → `export default nextConfig`
- Remove Turbopack alias for `drizzle-kit/api` stub (no longer needed)
- Update `images.remotePatterns` to allow the R2 hostname that Strapi returns (e.g. `*.r2.cloudflarestorage.com` — confirm exact host from Strapi media URLs)

### `wrangler.jsonc`
- Remove all `d1_databases` blocks (all 3 envs) — D1 not used anymore
- Keep: queues (contact form), R2 secrets, workers config, assets

### `package.json`
Remove packages:
- `payload`, `@payloadcms/db-d1-sqlite`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`
- `drizzle-kit` (dev dep, only used for schema generation)
- `graphql` (was only for Payload's GraphQL endpoint)

Remove scripts: `payload`, `generate:types`, `generate:importmap`, `db:generate`, `db:migrate:*`, `db:seed:*`

Add: nothing new at the package level — Strapi is fetched over HTTP.

### `.env.example`
Remove: `PAYLOAD_SECRET`
Add:
```
STRAPI_URL=https://your-strapi-server.com
STRAPI_API_TOKEN=          # read-only API token (leave blank if public read)
```

### `.github/workflows/deploy-staging.yml` + `deploy-production.yml`
Remove steps:
- "Regenerate Payload importMap" step
- "Fail if importMap drifted" step
- `pnpm db:migrate:*` step
- `PAYLOAD_SECRET` from secrets upload list

---

## Phase 3 — Strapi Client

**New file: `lib/strapi/client.ts`**

Base `fetchStrapi` function:
```ts
const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN

async function fetchStrapi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`/api${path}`, BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Strapi ${res.status}: ${path}`)
  return res.json()
}
```

**New file: `lib/strapi/types.ts`**

Strapi v5 response types — verified against live API:
```ts
export type StrapiMediaFormats = {
  large?: { url: string; width: number; height: number }
  medium?: { url: string; width: number; height: number }
  small?: { url: string; width: number; height: number }
  thumbnail?: { url: string; width: number; height: number }
}
export type StrapiMedia = {
  id: number; url: string; width: number; height: number
  alternativeText?: string | null; formats?: StrapiMediaFormats
}
export type StrapiAuthor = { id: number; name: string; slug: string }
export type StrapiBlog = {
  id: number; documentId: string
  title: string; slug: string
  publishedDate: string | null   // editorial date (e.g. "2024-12-04T00:00:00.000Z")
  publishedAt: string            // Strapi system publish timestamp
  coverImage: StrapiMedia
  coverImageAlt?: string | null
  author: StrapiAuthor
  readTime?: string | null
  content: string                // HTML string
  metaTitle?: string | null
  metaDescription?: string | null
}
export type StrapiIndustry = { id: number; title: string; slug: string }
export type StrapiPlatform = { id: number; title: string; slug: string }
export type StrapiProject = {
  id: number; documentId: string
  title: string; slug: string; publishedAt: string
  thumbnail: StrapiMedia
  thumbnailAlt?: string | null
  type: string                   // comma-separated string e.g. "WEBFLOW, UI-UX, INTERACTIONS"
  industry: StrapiIndustry
  platform: StrapiPlatform
  redirectLink: string
  featured: boolean
}
export type StrapiGalleryItem = {
  id: number; documentId: string
  title: string; slug: string
  image?: StrapiMedia | null     // field name is "image", not "thumbnail"
  imageAlt?: string | null
  videoUrl?: string | null
  content?: string | null        // HTML description (field name is "content")
  designer?: string | null       // comma-separated string (field name is "designer")
  externalUrl?: string | null    // field name is "externalUrl", not "previewLink"
  year?: string | null
}
// Response envelopes
export type StrapiList<T> = { data: T[]; meta: { pagination: { start: number; limit: number; total: number } } }
export type StrapiSingle<T> = { data: T }
```

---

## Phase 4 — Rewrite Normalise Helpers

### `lib/blogs/normalise.ts`
Replace Payload types with `StrapiBlog`. Key changes:
- `image.src` = pick `coverImage.formats.large.url` → fallback `coverImage.url`
- `image.width/height` from the chosen format
- `image.alt` = `coverImageAlt ?? coverImage.alternativeText ?? ''`
- `author` = `blog.author.name`
- `date` formatted from `blog.publishedDate ?? blog.publishedAt`
- `content` passes through as-is (HTML string — was Lexical JSON before)
- No `excerpt` field in Strapi; derive from `metaDescription` or leave undefined

### `lib/projects/normalise.ts`
Replace Payload types with `StrapiProject`. Key changes:
- `image.src` = pick `thumbnail.formats.large.url` → fallback `thumbnail.url`
- `types` = `project.type.split(',').map(s => s.trim())` (already a display string)
- `typesDisplay` = `project.type` directly (already formatted)
- `industry` = `project.industry.slug` (matches existing `ProjectIndustry` enum values like `'finance'`, `'saas'`)
- `platform` = `project.platform.slug` (matches `'website'` / `'app'`)

### `lib/gallery/normalise.ts`
Replace Payload types with `StrapiGalleryItem`. Key field name changes:
- `thumbnail` → `image` (field renamed in Strapi)
- `designers` → `designer` (split on comma same as before)
- `description` → `content`
- `previewLink` → `externalUrl`
- Discriminated union (image vs video) logic unchanged

---

## Phase 5 — Rewrite Pages

### `app/(my-app)/blogs/page.tsx`
Replace `getPayload().find(...)` with:
```ts
const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
  'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
  'populate[author][fields]': 'name,slug',
  'sort': 'publishedDate:desc',
  'pagination[limit]': '100',
})
```

### `app/(my-app)/blogs/[slug]/page.tsx`
- Replace `payload.find` with: `filters[slug][$eq]=${slug}`
- Replace `<RichText data={blog.content} />` (Lexical JSON renderer from `@payloadcms/richtext-lexical/react`) with:
  ```tsx
  <div dangerouslySetInnerHTML={{ __html: blog.content }} className="prose ..." />
  ```
  The `prose` container class is already in `blog-post.tsx` — just swap the child element.

### `app/(my-app)/projects/page.tsx`
Replace `payload.find` with Strapi fetch:
```ts
fetchStrapi('/projects', {
  'populate[thumbnail][fields]': 'url,width,height,alternativeText,formats',
  'populate[industry][fields]': 'title,slug',
  'populate[platform][fields]': 'title,slug',
  'sort': 'featured:desc,publishedAt:desc',
  'pagination[limit]': '200',
})
```

### `app/(my-app)/gallery/page.tsx` + `gallery/[slug]/page.tsx`
Currently uses **static `data/gallery.ts`** — swap to Strapi fetch from `/api/gallery-items`.
`generateStaticParams` becomes async, fetching all slugs from Strapi with `pagination[limit]=500`.

### `app/api/contact/route.ts`
Replace `payload.create({ collection: 'submissions', data })` with a POST to Strapi submissions:
```ts
await fetch(`${process.env.STRAPI_URL}/api/submissions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
  body: JSON.stringify({ data }),
})
```
Cloudflare Queue send stays unchanged — just remove the Payload call.

---

## Phase 6 — Image Loader & next.config.ts

`lib/image-loader.ts` currently routes `/api/media/file/...` paths through the custom proxy. Strapi returns absolute `https://pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev/...` URLs directly. The existing loader uses Cloudflare zone image resizing (`/cdn-cgi/image/`) which applies to any URL — it will work as-is for absolute R2 URLs.

In `next.config.ts`, update `images.remotePatterns` to add:
```ts
{ protocol: 'https', hostname: 'pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev' }
```

---

## Phase 7 — Delete Static Gallery Data

Once gallery pages fetch from Strapi, `data/gallery.ts` can be deleted (or kept as emergency fallback). Update any remaining imports.

---

## Verification

1. `pnpm tsc --noEmit` — zero type errors after Payload types removed
2. `pnpm build` — clean build, no Payload imports in bundle
3. `pnpm dev` — visit `/blogs`, `/blogs/[slug]`, `/projects`, `/gallery`, `/gallery/[slug]` — data loads from Strapi
4. Submit contact form — verify queue fires + Strapi submission created (if applicable)
5. Check OG tags on blog/gallery detail pages — cover image URL resolves correctly
6. `pnpm deploy:staging` — CI passes without importMap/D1 steps

---

## Open Items (resolved ✅ or action needed)

| Item | Status |
|------|--------|
| API token | ✅ Required — `STRAPI_API_TOKEN` env var |
| Strapi URL | ✅ `http://bc8m09bvlwo8vndobcx7a5kj.159.223.172.58.sslip.io` |
| Submissions collection | ✅ Exists in Strapi — POST to `/api/submissions` |
| Project field names | ✅ Verified: `type` (string), `industry.title/slug`, `platform.title/slug` |
| Gallery API slug | ✅ `/api/gallery-items` |
| R2 hostname | ✅ `pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev` |
| Blog `excerpt` | ⚠️ No `excerpt` field in Strapi — derive from `metaDescription` in normalise helper |
