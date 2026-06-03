# Strapi v5 — Project Skill

This project uses **Strapi v5** as a headless CMS, consumed via REST API from Next.js 16 App Router pages.

## Client

`lib/strapi/client.ts` — single `fetchStrapi<T>(path, params?)` helper.
- Prepends `/api` to all paths
- Bearer token from `STRAPI_API_TOKEN` env var
- `next: { revalidate: 60 }` for ISR-style edge caching
- Types for all responses live in `lib/strapi/types.ts`

## Collections & API slugs

| Collection     | API path              | Key fields |
|----------------|-----------------------|------------|
| Blogs          | `/api/blogs`          | title, slug, publishedDate, author (relation), coverImage (media), content (HTML), readTime, metaTitle, metaDescription |
| Projects       | `/api/projects`       | title, slug, thumbnail (media), type (string), industry (relation), platform (relation), redirectLink, featured (bool) |
| Gallery Items  | `/api/gallery-items`  | title, slug, image (media, optional), videoUrl, content (HTML), designer, externalUrl, year |
| Authors        | `/api/authors`        | name, slug — populated inline on blogs, not fetched directly |
| Submissions    | `/api/submissions`    | POST target for contact form only |

## Normalise helpers

Always convert raw Strapi responses through the normalise helpers before passing to components:
- `lib/blogs/normalise.ts` → `NormalisedBlog`
- `lib/projects/normalise.ts` → `NormalisedProject`
- `lib/gallery/normalise.ts` → `GalleryItem`

## REST API patterns

See `reference/rest-api.md` for full query syntax. Common patterns used in this project:

```ts
// List with populate
fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
  'populate[coverImage]': 'true',
  'populate[author]': 'true',
  'filters[publishedAt][$notNull]': 'true',
  'sort': 'publishedDate:desc',
})

// Single by slug
fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
  'filters[slug][$eq]': slug,
  'populate[coverImage]': 'true',
  'populate[author]': 'true',
})

// Pagination
fetchStrapi<StrapiList<StrapiProject>>('/projects', {
  'pagination[start]': '0',
  'pagination[limit]': '100',
})
```

## v5 key differences from v4

- Response shape: `{ data: [...], meta: { pagination } }` — **no nested `attributes` object**. Fields are flat on the item.
- `documentId` (string) is the stable public ID; `id` (number) is the internal DB row. Use `documentId` for permalinks/references.
- Populate is required explicitly — relations and media are NOT included by default.
- `publishedAt` is the system timestamp; collections can add custom date fields (e.g. `publishedDate`).
- Draft & Publish: only `publishedAt != null` items are returned by default on public endpoints.

## Adding a new collection

1. Create the content type in Strapi admin
2. Add the TypeScript type to `lib/strapi/types.ts`
3. Add a normalise helper under `lib/<collection>/normalise.ts`
4. Fetch in the relevant `page.tsx` using `fetchStrapi`
