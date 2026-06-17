# Strapi Draft Mode + Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Strapi editors click "Preview" on an unpublished entry and view that draft on the live (production) Vercel site via a secure per-request cookie, while keeping the existing deploy-wide `STRAPI_PREVIEW` flag for the staging environment.

**Architecture:** Add a `/api/preview` Route Handler that validates a shared secret and calls Next.js `draftMode().enable()` (sets the `__prerender_bypass` cookie), plus a `/api/preview/disable` handler. The shared `fetchStrapi` helper gains a per-request `draft` opt-in; request-scoped pages read `draftMode().isEnabled` and pass it down. Drafts are fetched fresh (`cache: no-store`); published content keeps 60s ISR. The deploy-wide `STRAPI_PREVIEW` env flag is OR'd in so staging continues to show all drafts.

**Tech Stack:** Next.js 16 (App Router, modified build — see Global Constraints), Strapi v5 (separate repo/server), TypeScript, pnpm, deployed on Vercel.

## Global Constraints

- **Modified Next.js 16** — APIs may differ from training data. Before touching routing/data-fetching APIs, read `node_modules/next/dist/docs/01-app/02-guides/draft-mode.md` and `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/draft-mode.md`. (Already verified for this plan.)
- `draftMode()` is **async**: always `await draftMode()`.
- `draftMode().enable()` / `.disable()` may only be called inside a Route Handler — never during page render.
- Reading `draftMode().isEnabled` keeps statically/ISR-rendered pages static for normal visitors; only a request carrying the `__prerender_bypass` cookie renders at request time. Safe to call in page bodies and `generateMetadata`.
- **Do NOT** call `draftMode()` in `sitemap.ts` — the sitemap must always list published content only.
- **Keep** `STRAPI_PREVIEW` working exactly as today (whole-deployment drafts for staging). New per-request draft mode is additive.
- **No new dependencies.** Use only `next/headers` and `next/navigation` (already available).
- Project has **no test runner**; the verification cycle per task is `pnpm exec tsc --noEmit`, `pnpm build`, and manual `curl`/browser cookie checks.
- Redirect targets must be **internal paths only** (start with a single `/`) to avoid open-redirect vulnerabilities.
- Secrets are read from `process.env` and never logged.

---

### Task 1: Add per-request draft opt-in to `fetchStrapi`

**Files:**
- Modify: `lib/strapi/client.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `fetchStrapi<T>(path: string, params?: Record<string, string>, opts?: { draft?: boolean }): Promise<T>` — when `opts.draft === true` **or** `STRAPI_PREVIEW === 'true'`, the request adds `status=draft` and uses `cache: 'no-store'`; otherwise `next: { revalidate: 60 }`. The third argument is optional and backward-compatible (existing 2-arg calls keep published behavior).

- [ ] **Step 1: Replace the file body with the draft-aware version**

Replace the entire contents of `lib/strapi/client.ts` with:

```ts
const BASE = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_API_TOKEN
// Deploy-wide preview: when true, the ENTIRE deployment serves drafts.
// Used by the staging environment so editors can browse all unpublished
// content without clicking anything. Production leaves this unset.
const PREVIEW = process.env.STRAPI_PREVIEW === 'true'

type FetchOptions = {
  // Per-request draft opt-in — set by request-scoped callers that have read
  // Next.js Draft Mode (the Strapi "Preview" button flow). See lib/strapi
  // and app/api/preview/route.ts.
  draft?: boolean
}

export async function fetchStrapi<T>(
  path: string,
  params?: Record<string, string>,
  opts?: FetchOptions,
): Promise<T> {
  // STRAPI_URL is not available at CI build time — return an empty list so
  // static pre-rendering succeeds. ISR revalidates on the first real request.
  if (!BASE) return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T

  // Drafts when the whole deployment is in preview mode (STRAPI_PREVIEW, e.g.
  // staging) OR this individual request enabled Next.js Draft Mode.
  const useDrafts = PREVIEW || opts?.draft === true

  const url = new URL(`/api${path}`, BASE)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  // Strapi v5 draft mode — only set if the caller hasn't already chosen a status.
  if (useDrafts && !url.searchParams.has('status')) url.searchParams.set('status', 'draft')
  const res = await fetch(url, {
    headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    // Drafts must always be fresh; published content uses 60s ISR.
    ...(useDrafts ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
  })
  if (!res.ok) {
    console.error(`Strapi ${res.status}: ${path}`)
    return { data: [], meta: { pagination: { start: 0, limit: 0, total: 0 } } } as T
  }
  return res.json()
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: exits 0 (no output). Existing 2-argument `fetchStrapi` calls still compile because `opts` is optional.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: build succeeds; routes still listed (e.g. `ƒ /blog/[slug]`, `ƒ /gallery/[slug]`). Behavior is unchanged from today because no caller passes `draft` yet.

- [ ] **Step 4: Commit**

```bash
git add lib/strapi/client.ts
git commit -m "feat(strapi): add per-request draft opt-in to fetchStrapi"
```

---

### Task 2: Add Preview enable + disable Route Handlers

**Files:**
- Create: `app/api/preview/route.ts`
- Create: `app/api/preview/disable/route.ts`

**Interfaces:**
- Consumes: `process.env.PREVIEW_SECRET`.
- Produces:
  - `GET /api/preview?secret=<token>&url=<internal-path>[&status=draft]` — validates `secret`, validates `url` is an internal path, calls `draftMode().enable()`, redirects to `url`. Returns `401` on bad secret or non-internal `url`.
  - `GET /api/preview/disable` — calls `draftMode().disable()`, redirects to `/`.

> Param names (`secret`, `url`, `status`) match the URL produced by the Strapi 5 preview `handler` configured in Task 5.

- [ ] **Step 1: Create the enable handler**

Create `app/api/preview/route.ts`:

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// GET /api/preview?secret=<token>&url=<internal-path>&status=draft
// Called by Strapi's Preview button. Validates the shared secret, turns on
// Next.js Draft Mode (sets the __prerender_bypass cookie), then redirects to
// the requested page — which will now render Strapi draft content.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const url = searchParams.get('url')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Only allow internal redirects (single leading slash) — block open redirects
  // like `//evil.com` or `https://evil.com`.
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return new Response('Invalid url', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(url)
}
```

- [ ] **Step 2: Create the disable handler**

Create `app/api/preview/disable/route.ts`:

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// GET /api/preview/disable — exit Draft Mode and return to the published site.
export async function GET() {
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: exits 0.

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: build succeeds and the route list now includes `ƒ /api/preview` and `ƒ /api/preview/disable`.

- [ ] **Step 5: Manual cookie check**

Run a local production server with a test secret and confirm the cookie is set:

```bash
PREVIEW_SECRET=testsecret pnpm start &
# wait for boot, then:
curl -sS -i "http://localhost:3000/api/preview?secret=testsecret&url=/blog/test" | grep -iE "HTTP/|location|set-cookie"
```

Expected: an HTTP `307`/`308` redirect with `location: /blog/test` and a `set-cookie: __prerender_bypass=...` header.
Then confirm rejection: `curl -sS -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/preview?secret=wrong&url=/blog/test"` → `401`.
And open-redirect rejection: `curl -sS -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/preview?secret=testsecret&url=//evil.com"` → `401`.
Stop the server: `pkill -f "next start"`.

- [ ] **Step 6: Commit**

```bash
git add app/api/preview/route.ts app/api/preview/disable/route.ts
git commit -m "feat(preview): add Draft Mode enable/disable route handlers"
```

---

### Task 3: Wire all Strapi-driven pages to Draft Mode

**Files:**
- Modify: `app/(my-app)/blog/page.tsx`
- Modify: `app/(my-app)/blog/[slug]/page.tsx`
- Modify: `app/(my-app)/gallery/page.tsx`
- Modify: `app/(my-app)/gallery/[slug]/page.tsx`
- Modify: `app/(my-app)/projects/page.tsx`
- **Do NOT modify** `app/(my-app)/sitemap.ts` (must stay published-only).

**Interfaces:**
- Consumes: `fetchStrapi(path, params, { draft })` from Task 1; `draftMode` from `next/headers`.
- Produces: each Strapi-driven page/metadata function reads `const { isEnabled } = await draftMode()` once at the top of its scope and passes `{ draft: isEnabled }` as the third arg to every `fetchStrapi` call in that scope.

> Mechanical pattern for every edit: (1) add `import { draftMode } from 'next/headers'`; (2) add `const { isEnabled } = await draftMode()` as the first line of each async page component / `generateMetadata`; (3) append `, { draft: isEnabled }` to each `fetchStrapi(...)` call's argument list.

- [ ] **Step 1: Blog index — `app/(my-app)/blog/page.tsx`**

Add the import after the existing `fetchStrapi` import (line 2):

```ts
import { draftMode } from 'next/headers'
```

Change the page component (currently lines 20-26) to:

```tsx
export default async function BlogsPage() {
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
    'populate[author][fields]': 'name,slug',
    'sort': 'publishedDate:desc',
    'pagination[limit]': '100',
  }, { draft: isEnabled })
  const blogs = data.map((b) => normalise(b))
```

- [ ] **Step 2: Blog detail — `app/(my-app)/blog/[slug]/page.tsx`**

Add the import next to the existing `next` imports near the top:

```ts
import { draftMode } from 'next/headers'
```

In `generateMetadata`, add `const { isEnabled } = await draftMode()` immediately after `const { slug } = await params` and pass `{ draft: isEnabled }` to its `fetchStrapi` call (the one with `'pagination[limit]': '1'` ending at line 38):

```ts
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'filters[slug][$eq]': slug,
    'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
    'populate[author][fields]': 'name,slug',
    'pagination[limit]': '1',
  }, { draft: isEnabled })
```

In `BlogDetailPage`, add the draft read after `const { slug } = await params` (line 60) and pass `{ draft: isEnabled }` to **both** `fetchStrapi` calls in the `Promise.all` (lines 62-76):

```tsx
  const { slug } = await params
  const { isEnabled } = await draftMode()

  const [{ data }, { data: relatedData }] = await Promise.all([
    fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      'filters[slug][$eq]': slug,
      'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
      'populate[author][fields]': 'name,slug',
      'pagination[limit]': '1',
    }, { draft: isEnabled }),
    fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
      'filters[slug][$ne]': slug,
      'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
      'populate[author][fields]': 'name,slug',
      'sort': 'publishedDate:desc',
      'pagination[limit]': '3',
    }, { draft: isEnabled }),
  ])
```

- [ ] **Step 3: Gallery index — `app/(my-app)/gallery/page.tsx`**

Add `import { draftMode } from 'next/headers'` after the `fetchStrapi` import (line 2). Change the page component (lines 21-25) to:

```tsx
export default async function GalleryPage() {
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
    'populate[image][fields]': 'url,width,height,alternativeText',
    'pagination[limit]': '500',
  }, { draft: isEnabled })
```

- [ ] **Step 4: Gallery detail — `app/(my-app)/gallery/[slug]/page.tsx`**

Add `import { draftMode } from 'next/headers'` near the top imports. In `generateMetadata`, add `const { isEnabled } = await draftMode()` after `const { slug } = await params` and append `, { draft: isEnabled }` to its `fetchStrapi` call (the one ending `'pagination[limit]': '1'` around line 28). In `GalleryItemPage`, add the draft read after `const { slug } = await params` (line 60) and pass `{ draft: isEnabled }` to **both** `fetchStrapi` calls in the `Promise.all` (lines 62-73):

```tsx
  const { slug } = await params
  const { isEnabled } = await draftMode()

  const [{ data }, { data: allData }] = await Promise.all([
    fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      'filters[slug][$eq]': slug,
      ...POPULATE_PARAMS,
      'pagination[limit]': '1',
    }, { draft: isEnabled }),
    fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
      'filters[slug][$ne]': slug,
      ...POPULATE_PARAMS,
      'pagination[limit]': '3',
    }, { draft: isEnabled }),
  ])
```

- [ ] **Step 5: Projects index — `app/(my-app)/projects/page.tsx`**

Add `import { draftMode } from 'next/headers'` after the `fetchStrapi` import (line 2). Change the page component (lines 20-27) to:

```tsx
export default async function ProjectsPage() {
  const { isEnabled } = await draftMode()
  const { data } = await fetchStrapi<StrapiList<StrapiProject>>('/projects', {
    'populate[thumbnail][fields]': 'url,width,height,alternativeText,formats',
    'populate[industry][fields]': 'title,slug',
    'populate[platform][fields]': 'title,slug',
    'sort': 'featured:desc,publishedAt:desc',
    'pagination[limit]': '200',
  }, { draft: isEnabled })
```

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: exits 0.

- [ ] **Step 7: Build**

Run: `pnpm build`
Expected: build succeeds. `sitemap.ts` was untouched, so the sitemap stays published-only.

- [ ] **Step 8: Manual end-to-end draft check**

Pick an unpublished blog slug in Strapi (or temporarily unpublish one). With real Strapi env vars set locally:

```bash
PREVIEW_SECRET=testsecret pnpm start &
# Without draft mode the unpublished post 404s:
curl -sS -o /dev/null -w "no-draft: %{http_code}\n" http://localhost:3000/blog/<draft-slug>
# Enable draft mode, capturing the cookie, then request the page with it:
curl -sS -c /tmp/dm.txt -o /dev/null "http://localhost:3000/api/preview?secret=testsecret&url=/blog/<draft-slug>"
curl -sS -b /tmp/dm.txt -o /dev/null -w "with-draft: %{http_code}\n" http://localhost:3000/blog/<draft-slug>
pkill -f "next start"
```

Expected: `no-draft: 404` (or notFound), `with-draft: 200`. A normal visitor (no cookie) never sees drafts.

- [ ] **Step 9: Commit**

```bash
git add "app/(my-app)/blog/page.tsx" "app/(my-app)/blog/[slug]/page.tsx" "app/(my-app)/gallery/page.tsx" "app/(my-app)/gallery/[slug]/page.tsx" "app/(my-app)/projects/page.tsx"
git commit -m "feat(preview): render Strapi drafts in Draft Mode across blog/gallery/projects"
```

---

### Task 4: Add `PREVIEW_SECRET` to env docs and deployment notes

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing.
- Produces: documentation of `PREVIEW_SECRET` (read by `app/api/preview/route.ts`) and the staging-vs-preview split.

- [ ] **Step 1: Add `PREVIEW_SECRET` to `.env.example`**

Append after the `STRAPI_PREVIEW` block:

```bash

# Shared secret for the Strapi Preview button → Next.js Draft Mode handshake.
# Must match the value configured in Strapi's config/admin preview handler.
# Used by app/api/preview. Generate a long random string.
PREVIEW_SECRET=
```

- [ ] **Step 2: Document the workflow in `CLAUDE.md`**

Under the `## CMS — Strapi` section, after the `STRAPI_URL`/`STRAPI_API_TOKEN` bullet, add:

```markdown
- **Preview / Draft Mode**: two layers. (1) `STRAPI_PREVIEW=true` makes an *entire deployment* serve drafts — set it on the **staging** Vercel environment so editors can browse unpublished blogs there. (2) Per-entry preview: Strapi's Preview button opens `/api/preview?secret=$PREVIEW_SECRET&url=<path>`, which enables Next.js Draft Mode (a `__prerender_bypass` cookie) so a single editor sees that draft on production. `/api/preview/disable` exits. `fetchStrapi(path, params, { draft })` is how pages opt in; `sitemap.ts` deliberately never does.
```

- [ ] **Step 3: Typecheck + build (sanity, no code changed)**

Run: `pnpm exec tsc --noEmit && pnpm build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add .env.example CLAUDE.md
git commit -m "docs(preview): document PREVIEW_SECRET and staging-vs-preview split"
```

---

### Task 5: Configure Strapi (external — separate Strapi repo/server)

> **This task is NOT in the `epyc-website` repo.** Strapi is a separate server. It is documented here so the feature works end-to-end; perform it in the Strapi project and through the Strapi/Vercel dashboards. No commit happens in this repo.

**Interfaces:**
- Consumes: the website's `PREVIEW_SECRET` and the `/api/preview` route from Tasks 2–4.
- Produces: a working Preview button in the Strapi Content Manager.

- [ ] **Step 1: Set the shared secret on both sides**
  - In the website's Vercel project (Production env), set `PREVIEW_SECRET` to a long random string.
  - In the Strapi server's environment, set the same value (e.g. `PREVIEW_SECRET`) and the website origin (e.g. `CLIENT_URL=https://<production-domain>`).

- [ ] **Step 2: Enable the Preview feature in Strapi `config/admin.ts`**

In the Strapi project, configure the preview handler to point at the website's `/api/preview` route, building an internal `url` path per content type (this snippet maps `api::blog.blog` → `/blog/:slug`; extend for gallery/projects as needed):

```ts
// config/admin.ts (Strapi v5)
export default ({ env }) => ({
  // ...existing admin config (auth, apiToken, etc.)
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [env('CLIENT_URL')],
      async handler(uid, { documentId, locale, status }) {
        const clientUrl = env('CLIENT_URL')
        const secret = env('PREVIEW_SECRET')

        // Map content-type UID → internal site path.
        const doc = await strapi.documents(uid).findOne({ documentId })
        const pathByUid = {
          'api::blog.blog': doc?.slug ? `/blog/${doc.slug}` : null,
          'api::gallery-item.gallery-item': doc?.slug ? `/gallery/${doc.slug}` : null,
          'api::project.project': doc?.slug ? `/projects/${doc.slug}` : null,
        }
        const path = pathByUid[uid]
        if (!path) return null

        return `${clientUrl}/api/preview?secret=${secret}&url=${encodeURIComponent(path)}&status=${status}`
      },
    },
  },
})
```

- [ ] **Step 2 (note): `status` param**

The website's `/api/preview` route ignores `status` (it always enables Draft Mode, which is correct for previewing the draft version). Strapi still appends it; no action needed on the website side.

- [ ] **Step 3: Verify in Strapi**

Open an unpublished blog entry in the Strapi Content Manager → click **Preview**. Expected: the website opens at `/blog/<slug>` showing the draft content. Publishing + reloading shows the published version; visiting the same URL in a fresh browser (no cookie) does not show the draft.

---

## Self-Review

**Spec coverage:**
- Keep `STRAPI_PREVIEW` for staging → Task 1 (`PREVIEW || opts.draft`) + Task 4 docs. ✓
- Per-entry preview via Draft Mode → Tasks 2 + 3. ✓
- Enable/disable handshake → Task 2. ✓
- All Strapi-driven pages honor preview; sitemap excluded → Task 3. ✓
- Secret/env wiring + Strapi handler → Tasks 4 + 5. ✓
- ISR preserved for normal visitors → guaranteed by Draft Mode cookie semantics (Global Constraints), verified in Task 3 Step 8. ✓

**Placeholder scan:** `<draft-slug>` / `<production-domain>` in Tasks 3/5 are runtime values the operator supplies, not code placeholders. The Strapi `config/admin.ts` is external and intentionally illustrative. No code-step placeholders. ✓

**Type consistency:** `fetchStrapi`'s third param `opts?: { draft?: boolean }` (Task 1) matches every `{ draft: isEnabled }` call site (Task 3) and `process.env.PREVIEW_SECRET` is used consistently in Task 2 and documented in Task 4. ✓
