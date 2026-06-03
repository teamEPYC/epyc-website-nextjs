# Strapi v5 — Project Content Types

This file documents the exact Strapi collections used in this project,
their API slugs, fields, and how to query them.

---

## Blogs — `/api/blogs`

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Internal DB id |
| `documentId` | string | Stable public id |
| `title` | string | |
| `slug` | string | URL slug, unique |
| `publishedDate` | string | Custom display date (not `publishedAt`) |
| `publishedAt` | string | System publish timestamp |
| `coverImage` | StrapiMedia | Populate required |
| `coverImageAlt` | string? | |
| `author` | StrapiAuthor | Populate required: `{ id, name, slug }` |
| `readTime` | string? | e.g. "5 min read" |
| `content` | string | **HTML string** — render with `dangerouslySetInnerHTML` |
| `metaTitle` | string? | SEO |
| `metaDescription` | string? | SEO |

**Typical fetch:**
```ts
fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
  'populate[coverImage]': 'true',
  'populate[author]': 'true',
  'sort': 'publishedDate:desc',
  'pagination[limit]': '100',
})
```

---

## Projects — `/api/projects`

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `title` | string | |
| `slug` | string | |
| `publishedAt` | string | |
| `thumbnail` | StrapiMedia | Populate required |
| `thumbnailAlt` | string? | |
| `type` | string | Comma-separated string e.g. `"Branding, Web"` |
| `industry` | StrapiIndustry | Populate required: `{ id, title, slug }` |
| `platform` | StrapiPlatform | Populate required: `{ id, title, slug }` |
| `redirectLink` | string | External project URL |
| `featured` | boolean | Featured on homepage |

**Typical fetch:**
```ts
fetchStrapi<StrapiList<StrapiProject>>('/projects', {
  'populate[thumbnail]': 'true',
  'populate[industry]': 'true',
  'populate[platform]': 'true',
  'sort': 'publishedAt:desc',
  'pagination[limit]': '100',
})
```

---

## Gallery Items — `/api/gallery-items`

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | |
| `documentId` | string | |
| `title` | string | |
| `slug` | string | |
| `image` | StrapiMedia? | Optional — may be video-only |
| `imageAlt` | string? | |
| `videoUrl` | string? | Embed URL |
| `content` | string? | HTML string |
| `designer` | string? | Comma-separated designer names |
| `externalUrl` | string? | |
| `year` | string? | e.g. `"2024"` |

**Typical fetch:**
```ts
fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
  'populate[image]': 'true',
  'sort': 'publishedAt:desc',
  'pagination[limit]': '200',
})
```

---

## Authors — `/api/authors`

Populated inline on blogs. Not fetched directly by the frontend.

| Field | Type |
|-------|------|
| `id` | number |
| `name` | string |
| `slug` | string |

---

## Submissions — `/api/submissions`

POST-only from the contact form. Never fetched by the frontend.

| Field | Type |
|-------|------|
| `name` | string |
| `email` | string |
| `company` | string? |
| `message` | string |
| `budget` | string? |
| `timeline` | string? |

---

## StrapiMedia shape

```ts
type StrapiMedia = {
  id: number
  url: string           // absolute R2 URL
  width: number
  height: number
  alternativeText?: string | null
  formats?: {
    thumbnail?: { url: string; width: number; height: number }
    small?:     { url: string; width: number; height: number }
    medium?:    { url: string; width: number; height: number }
    large?:     { url: string; width: number; height: number }
  }
}
```

Images are served from R2 (`pub-b1d053c780d14d2fb1a94a1e74ea5ecd.r2.dev`).
The custom Next.js image loader (`lib/image-loader.ts`) routes all image URLs
through Cloudflare `/cdn-cgi/image/` for resizing/optimisation.
