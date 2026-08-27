# Payload cutover — handoff

Continuation brief for the Strapi → Payload migration. The design rationale is
in `docs/payload-cms-migration-plan.md`; this file is the current state, the
remaining work, and the traps that have already cost time.

Written 2026-08-27, immediately after content parity came back clean.

---

## 1. Where things stand

**Content migration is complete and verified.** `pnpm cms:parity` compares what
the website would render from each CMS, on normalised output rather than raw API
responses, and reports:

```
blogs     29 / 29    order matches
projects  90 / 90    order matches
gallery   83 / 83    order matches
0 unexplained differences
```

The 390 reported differences are all declared as intended: media URLs now point
at originals instead of Strapi derivatives (Cloudflare resizes on request —
verified against the live zone), 8 duplicate service-tag spellings folded, and
2 corrected `e-commerce` slugs.

**Nothing is switched over.** `CMS_PROVIDER=strapi` in every environment.
`epyc.in` and `staging.epyc.in` run the `main`/`production` branches, which
predate the provider abstraction entirely.

### Deployed pieces

| Thing | State |
|---|---|
| Payload CMS | `https://epyc-payload-cms.epyc.workers.dev` — live, CI-deployed |
| CMS repo | `teamEPYC/epyc-payload-cms`, branch `main` |
| Website repo | `teamEPYC/epyc-website-nextjs`, branch `feat/payload-cms-migration` (unmerged) |
| D1 | `epyc-payload-production` (`99aacd1b-3952-4436-a88e-261f72c4874b`), 5 migrations applied |
| R2 | `epyc-website-production` — **shared with the live site's media** |
| Cloudflare account | EPYC Production, `cbf6ee8739c8b48c351774cd83f1f413` (pinned in `wrangler.jsonc`) |
| Media host | `media.epyc.in` |
| Admin | `/admin` — one administrator account exists |

`cms.epyc.in` is **still Strapi** and must stay that way until cutover.

### Content in Payload

170 media, 4 authors, 29 published blogs (+2 draft-only), 90 projects, 83
gallery items. Every document carries `legacyStrapiDocumentId` (upsert key) and,
where ordering depends on it, `legacyStrapiId`.

---

## 2. Remaining work, in order

### Step 1 — Merge the website branch to `main` (agent)

Deploys the provider abstraction to **staging only** (`main` → staging;
`production` branch → production). Both environments keep
`CMS_PROVIDER=strapi`, so this is expected to be visually a no-op — which is
exactly what makes it worth doing separately: it proves the refactor is safe
before any CMS switch.

```bash
gh pr create --repo teamEPYC/epyc-website-nextjs \
  --base main --head feat/payload-cms-migration \
  --title "CMS provider abstraction and Payload provider"
```

**Acceptance:** staging renders identically to before. Spot-check `/blog`,
`/projects`, `/gallery`, one blog post, one gallery item.

**Expected side effect:** staging becomes the content-preview deployment
(`CMS_MODE=draft`, `DEPLOYMENT_ROLE=preview`), so it serves Strapi drafts,
`noindex, nofollow`, `Cache-Control: private, no-store`, and an empty sitemap.
Step 2 must not lag behind this.

### Step 2 — Protect staging (human, Cloudflare dashboard)

Put Cloudflare Access in front of `staging.epyc.in`. It now serves unpublished
drafts. This cannot be done from code.

**Acceptance:** an unauthenticated request to `staging.epyc.in` is challenged.

### Step 3 — Preview credentials (human)

1. Payload admin → Users → create a user with role **`preview`**. That role can
   read drafts and cannot write anything — enforced in `lib/access.ts`, not by
   convention.
2. Enable its API key, copy it.
3. Website repo → Settings → Secrets and variables → Actions:
   - `STAGING_PAYLOAD_PREVIEW_TOKEN` — the key from above
   - `CMS_REVALIDATION_SECRET` — must equal the value already set on the CMS
     Worker (`wrangler secret list` shows it exists; the value is in the
     password manager)

`PRODUCTION_PAYLOAD_READ_TOKEN` is optional: published content is readable
anonymously.

### Step 4 — Switch staging to Payload (agent)

In the website repo's `wrangler.jsonc`, `env.staging.vars.CMS_PROVIDER`:
`strapi` → `payload`. Also update `CMS_PROVIDER` in the staging workflow's
OpenNext build env — it is needed at build time as well as at runtime, because
`robots.ts` and the root layout's metadata are evaluated during the build.

**Acceptance, all on staging:**
- `/blog`, `/projects`, `/gallery` render, with counts 29 / 90 / 83
- a blog post, a gallery item, and `/gallery/epyc-merchandise-tshirt-concept-design-(green-variant)` (parenthesised slug) all return 200
- `/projects` industry filters work — every industry, not just "other"
- `curl -H "Accept: text/markdown" .../blog` returns markdown
- editing a draft in Payload changes staging within a minute; production is unaffected
- `robots.txt` disallows everything, `sitemap.xml` is empty

### Step 5 — Production cutover (agent + human)

Do this while the parity result is fresh; it decays as editors keep working in
Strapi.

1. Announce an editorial freeze.
2. Re-run the export/import/parity cycle to capture anything edited since
   2026-08-27 (see §4). Parity must be clean again.
3. Merge `main` → `production`, with `env.production.vars.CMS_PROVIDER=payload`
   and the same change in the production workflow's build env.
4. Verify on `epyc.in`: the acceptance list from step 4, plus no draft content
   anywhere, and sitemap entries matching the previous count.
5. Make Strapi read-only for editors. **Do not delete anything.**

### Step 6 — Observation window

Keep Strapi read-only and the provider switch available for two weeks. Watch
CMS fetch failures, 404s on CMS-backed routes, webhook failures, and media
errors. Only then remove Strapi code, secrets and deployment config.

---

## 3. Traps — read before touching anything

**Migrations do not deploy themselves, and the naive sequence loses a race.**
`/api/db/migrate` runs the migrations bundled into the Worker, so a migration
can only be applied *after* its code is live. And `wrangler secret put` deploys
a new Worker version, so a request sent on the next line reaches the *previous*
version and answers "Migrations are not enabled". This cost three separate
debugging sessions, each surfacing as opaque 500s on every write. Always:

```bash
pnpm cms:migrate        # sets a one-time secret, waits for propagation, applies, removes it
```

**`/api/health` reports schema drift.** It compares bundled migrations against
`payload_migrations` and returns 503 `schema-behind` when they disagree. The
importer refuses to start in that state, and CI fails the deploy — a red CI run
straight after a migration-bearing deploy is the guard working, not a new
problem. Fix it by running `pnpm cms:migrate`.

**The R2 bucket is shared with the live site.** Payload writes into
`epyc-website-production`, the bucket `media.epyc.in` already serves. This is
deliberate: imported images keep their existing URLs and nothing was copied.
The consequence is that **deleting an upload in the Payload admin deletes a live
site image.**

**`generateSlug` defaults to true** and will regenerate a slug from the title,
discarding the real one. The importer sends `generateSlug: false`. Without it,
`breathewellbeing.in` becomes `breathewellbeingin` and three gallery slugs lose
their parentheses — and gallery slugs are live URLs.

**An omitted key in a PATCH means "leave unchanged", not "clear".** Optional
fields go through `orNull()` in the importer. The earlier `?? undefined` version
published a draft's `caseStudyPath` onto the live document, because a null in
Strapi could not clear a value Payload already had.

**Bump `MAPPER_VERSION` when changing importer field mapping.** Checkpoint keys
include it, so documents are re-imported rather than skipped holding values from
the previous mapping. Media keys deliberately exclude it — uploads do not
change, and re-uploading 170 images is slow.

**pnpm must be 11.x.** The lockfile records the Payload patch with a hash pnpm
10 rejects; `packageManager` in `package.json` pins it. `pnpm-workspace.yaml`
must also keep `allowBuilds` entries as real booleans — the scaffold's
placeholder strings fail CI installs.

**The Payload CLI needs its wrapper scripts.** `payload.config.ts` exports a
promise from an async IIFE and imports Lexical lazily, and there is a patch for
Payload's `@next/env` import. Use `pnpm db:generate` / `pnpm generate:types`,
never `npx payload` directly.

**CI never sets Worker secrets.** `PAYLOAD_SECRET`, `CMS_REVALIDATION_SECRET`
and friends are set once by hand and must not be added to GitHub Actions.

**Do not point `cms.epyc.in` at Payload before cutover.** It is the live Strapi
and the production site reads from it.

---

## 4. Commands

```bash
# CMS repo
pnpm cms:migrate                                  # apply pending migrations, safely
PAYLOAD_API_KEY=... pnpm cms:import-payload       # idempotent; --dry-run to plan only
STRAPI_URL=... STRAPI_API_TOKEN=... pnpm cms:export-strapi
pnpm db:generate <name>                           # new migration after a schema change

# Website repo
STRAPI_URL=... STRAPI_API_TOKEN=... PAYLOAD_URL=... pnpm cms:parity

# State checks
curl -s https://epyc-payload-cms.epyc.workers.dev/api/health
pnpm exec wrangler d1 execute epyc-payload-production --remote \
  --command "SELECT (SELECT COUNT(*) FROM blogs) blogs, (SELECT COUNT(*) FROM projects) projects, (SELECT COUNT(*) FROM gallery) gallery"
```

The import needs an API key belonging to an `administrator` or `editor`; the
`preview` role cannot write. Disable that key again once the import is done.

---

## 5. Rollback

The switch is a variable, not a revert:

1. Set `CMS_PROVIDER=strapi` in the affected environment's `wrangler.jsonc`
   **and** in that workflow's build env, then deploy.
2. Purge or revalidate the CMS-backed routes.
3. Re-enable Strapi editing if it was made read-only.
4. Leave Payload and its data intact for diagnosis.

Payload's D1 can be restored via Time Travel (`wrangler d1 time-travel info` /
`restore`) if a schema or data failure requires it. Strapi's database and media
must not be deleted or modified destructively during the observation window.

---

## 6. After cutover

- **Lexical rich text.** `content` is a `code` field holding CKEditor HTML so the
  migration could be verified byte for byte. The conversion plan, including the
  four pieces of markup needing review, is in the CMS repo's
  `docs/OPERATIONS.md`. Convert `content` to Lexical and generate HTML in a save
  hook, so the website and the parity checker keep reading HTML.
- **Failure visibility.** A CMS outage currently renders an empty page as a
  successful response. `PayloadProvider` already throws; the Strapi client's
  empty-list fallback should be tightened or removed once Strapi is gone.
- **Author drafts.** The Authors collection keeps no version history, so the
  unpublished draft edits on `keshav-sharma` were not migrated. Enable versions
  there if that matters.
