# Migrate Payload from Neon Postgres to Cloudflare D1

**Date:** 2026-05-18
**Status:** Design — awaiting implementation plan
**Owner:** Aayushman

## 1. Goal

Move the database for the EPYC website from Neon Postgres to Cloudflare D1 so
the whole stack (Workers + R2 + DB) lives inside the Cloudflare ecosystem.
Motivation: single-vendor operations, faster edge reads, and removal of a
cross-cloud network hop on every request.

## 2. Non-goals

- Migrating production data. The three existing Neon databases (dev, staging,
  prod) are wiped at cutover; content is reseeded from the CSVs under
  `scripts/seed/`. The seed CSVs are the source of truth today.
- Fixing the pre-existing `sharp`-at-the-edge concern. `payload.config.ts:29`
  imports `sharp`, which does not run in the Workers runtime. This issue is
  independent of the adapter change and stays as-is for this migration. It
  will be triaged separately.
- Changing R2/media storage. The `s3Storage` plugin and R2 bucket setup
  remain untouched.
- Switching the Lexical editor, collections, hooks, or access control.

## 3. Scope summary

| Layer                         | Change                                          |
|-------------------------------|-------------------------------------------------|
| Payload adapter               | `@payloadcms/db-vercel-postgres` → `@payloadcms/db-sqlite` (D1 client) |
| Schema management             | `db.push` (auto) → Drizzle SQL migrations applied via `wrangler d1 migrations apply` |
| Local dev DB                  | Neon URL → local D1 (binding, via OpenNext dev integration) |
| Bindings                      | New `DB` D1 binding in all three envs           |
| `.env` / `.dev.vars`          | Drop `DATABASE_URI`                              |
| Seed migrations               | Same TS files; swap adapter type import; drop explicit transaction |
| `scripts/db-fresh.ts`         | Simplified — no `beginTransaction` wrapper      |
| `wrangler.jsonc`              | Add D1 bindings per env + `migrations_dir`      |
| GitHub Actions                | Add `generate:importmap` + strict-drift check + `d1 migrations apply` step before deploy |
| R2 / storage                  | Unchanged                                       |
| Collections / hooks / editor  | Unchanged                                       |

## 4. Architecture

### 4.1 Adapter wiring

```ts
// payload.config.ts
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const { env } = await getCloudflareContext({ async: true })

export default buildConfig({
  // ...unchanged: admin, collections, editor, sharp, plugins...
  db: sqliteAdapter({
    client: env.DB,                                  // D1Database binding
    migrationDir: path.resolve(dirname, 'migrations/schema'),
    // SQLite transactions are disabled by default in Payload's adapter,
    // which matches D1's binding-level constraint. No explicit override.
  }),
})
```

### 4.2 Bindings exposed to `next dev`

```ts
// next.config.ts
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
```

This makes `getCloudflareContext()` return the configured D1 binding under
plain `next dev`, so the same code path runs locally and in deployed workers.
The local D1 is a wrangler-managed SQLite file under `.wrangler/`.

### 4.3 Three D1 databases, one binding name

| Env        | D1 database name        | Worker name              |
|------------|-------------------------|--------------------------|
| local dev  | `epyc-website-dev`      | (none — `next dev`)      |
| staging    | `epyc-website-staging`  | `epyc-website-staging`   |
| production | `epyc-website-prod`     | `epyc-website`           |

Binding name `DB` is identical across all envs, so application code never
branches by environment.

### 4.4 wrangler.jsonc shape

```jsonc
{
  "name": "epyc-website",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { /* unchanged */ },
  "observability": { "enabled": true },

  "d1_databases": [
    { "binding": "DB",
      "database_name": "epyc-website-dev",
      "database_id": "<dev-id>",
      "migrations_dir": "migrations/schema" }
  ],

  "env": {
    "staging": {
      "name": "epyc-website-staging",
      "vars": { "NEXT_PUBLIC_SITE_URL": "https://staging.epyc.in" },
      "d1_databases": [
        { "binding": "DB",
          "database_name": "epyc-website-staging",
          "database_id": "<staging-id>",
          "migrations_dir": "migrations/schema" }
      ]
    },
    "production": {
      "name": "epyc-website",
      "vars": { "NEXT_PUBLIC_SITE_URL": "https://epyc.in" },
      "d1_databases": [
        { "binding": "DB",
          "database_name": "epyc-website-prod",
          "database_id": "<prod-id>",
          "migrations_dir": "migrations/schema" }
      ]
    }
  }
}
```

## 5. Schema management

D1's binding has no introspection API, so Payload's `db.push` is not usable.
Schema is managed as explicit Drizzle-generated SQL migrations applied via
the wrangler CLI.

### 5.1 Directory layout

```
migrations/
├── schema/                        # generated SQL, applied by wrangler
│   └── 0001_initial.sql           # initial Drizzle output
└── seed/                          # data seeds (TS, Payload Local API)
    ├── 20260515_seed_blogs.ts
    ├── 20260518_seed_gallery.ts
    └── 20260518_seed_projects.ts
```

`wrangler.jsonc` points `migrations_dir` at `migrations/schema`. Wrangler
tracks applied migrations in a `d1_migrations` table inside the D1 instance,
so applying is idempotent.

### 5.2 Generating the initial schema

The workflow uses Drizzle Kit directly (not Payload's `migrate:create`)
because Payload's migration runner uses multi-statement transactions that
D1's binding doesn't support. Drizzle Kit emits raw SQL, which `wrangler d1
migrations apply` runs statement-by-statement.

1. `pnpm exec payload generate:db-schema` — Payload dumps the Drizzle schema
   for the configured SQLite adapter to `payload-generated-schema.ts`
2. `pnpm exec drizzle-kit generate --dialect=sqlite --schema=./payload-generated-schema.ts --out=./migrations/schema`
3. Inspect the generated SQL, commit `migrations/schema/0001_*.sql`
4. `wrangler d1 migrations apply DB --local` — applies to local dev D1

Add `drizzle-kit` to `devDependencies` (Payload already ships `drizzle-orm`
transitively).

### 5.3 New package.json scripts

```jsonc
"db:generate":           "drizzle-kit generate --dialect=sqlite --out=./migrations/schema",
"db:migrate:local":      "wrangler d1 migrations apply DB --local",
"db:migrate:staging":    "wrangler d1 migrations apply DB --remote --env staging",
"db:migrate:production": "wrangler d1 migrations apply DB --remote --env production",
"db:seed:local":         "tsx scripts/db-fresh.ts"
```

## 6. Seed migrations

The three TS files under `migrations/seed/` (renamed from `migrations/`)
remain. Edits required per file:

```diff
- import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'
+ import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-sqlite'
```

The bodies use `req.payload.create({...})` (Local API), so they are dialect-
agnostic. No SQL-level edits needed.

### 6.1 `scripts/db-fresh.ts` simplification

Today the script calls `payload.db.beginTransaction()` and threads
`req.transactionID` through every write. Payload's SQLite adapter exposes
transactions as no-ops on D1 (binding-level multi-statement transactions are
not supported). The script becomes:

```ts
const payload = await getPayload({ config })
const req = { payload } as unknown as PayloadRequest
// Order matters: Projects + Gallery wipe before Blogs (FK to authors/media)
for (const m of [downProjects, downGallery, downBlogs]) await m({ req })
for (const m of [upBlogs, upProjects, upGallery])      await m({ req })
```

Idempotency contract is unchanged: `down() + up()` cleanly resets state. If a
mid-run failure occurs, re-running cleans and retries.

## 7. Local dev workflow

```bash
# one-time
wrangler d1 create epyc-website-dev
# paste id into wrangler.jsonc
pnpm db:migrate:local            # apply schema to local D1
pnpm db:seed:local               # populate from CSVs

# day-to-day
pnpm dev                          # next dev, talks to local D1 via binding
```

`getCloudflareContext()` is initialised by `initOpenNextCloudflareForDev()`,
so the same `env.DB` works in `next dev`, `pnpm preview`, and deployed
workers.

## 8. CI/CD

### 8.1 Trigger model (unchanged)

- Push to `develop` → `.github/workflows/deploy-staging.yml`
- Push to `master`  → `.github/workflows/deploy-production.yml`
- Manual `workflow_dispatch` available on both

### 8.2 New step order (both workflows)

1. checkout + pnpm + node setup
2. `pnpm install --frozen-lockfile`
3. `pnpm exec tsc --noEmit`
4. **`pnpm exec payload generate:importmap`** (new)
5. **`git diff --exit-code app/(payload)/admin/importMap.js`** (new — strict drift check; fails build if the committed file is stale, forcing the developer to regenerate locally)
6. **`wrangler d1 migrations apply DB --remote --env <env>`** (new — runs before deploy so a failed migration blocks shipping)
7. `pnpm exec opennextjs-cloudflare build`
8. `wrangler deploy --env <env>` (existing wrangler-action)

### 8.3 Secrets

- **Remove:** `STAGING_DATABASE_URI`, `PRODUCTION_DATABASE_URI` (after cutover)
- **Keep:** `PAYLOAD_SECRET`, `R2_*`
- **Already present:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

The wrangler-action `secrets:` list drops `DATABASE_URI`.

### 8.4 Data seeds in CI

Seeds (`scripts/db-fresh.ts`, `migrations/seed/*.ts`) **do not run in CI**.
Once content is editable in the admin, the CSVs are reference snapshots, not
the source of truth. Seeds are run manually:

```bash
pnpm db:seed:local                                      # local D1
wrangler d1 execute DB --remote --env staging \
  --command "<one-shot SQL>"                            # rarely
```

For staging/prod seeding during cutover, the seeds run once via a
dispatch-only `workflow_dispatch` job (see §9) rather than on every push.

## 9. Cutover plan

Per env, in order (staging first, prod after staging soaks for ~24h):

1. `wrangler d1 create epyc-website-<env>` → paste `database_id` into `wrangler.jsonc`
2. `pnpm db:generate` once on the branch → commit `migrations/schema/0001_initial.sql`
3. `wrangler d1 migrations apply DB --remote --env <env>` (manual, one-time before first deploy)
4. Push branch → CI deploys (schema migration step runs again, no-op on already-applied)
5. Run the one-shot seed job (`workflow_dispatch`) to populate the env
6. Smoke-test: visit public site + `/admin`, log in, edit/save a doc, confirm it round-trips
7. Repeat for production

Once both envs are green and stable for ~1 week:

8. Delete the three Neon databases
9. Remove `STAGING_DATABASE_URI` and `PRODUCTION_DATABASE_URI` from GitHub repo secrets

## 10. Rollback

Until step 8 above, rollback is two commands:

```bash
wrangler rollback --env staging       # or production
git revert <merge-commit>
```

The previous worker bundle still points at the Neon DATABASE_URI, which is
still live. Schema migrations on D1 are forward-only but irrelevant if the
worker isn't reading from D1.

## 11. Known caveats

1. **Sharp at the edge** — `payload.config.ts:29` imports `sharp`; doesn't run
   in Workers. Pre-existing, not addressed by this migration. Triage separately.
2. **No multi-statement transactions on D1** — accepted. Seeds rely on
   `down()` idempotency instead.
3. **No `db.push`** — schema changes are migration-first now. Workflow shift
   for developers: edit collection → `pnpm db:generate` → commit SQL + apply.
4. **D1 size cap: 10 GB/db** — well above current data volume; flag if it
   approaches.
5. **Local D1 lives in `.wrangler/`** — added to `.gitignore` already.
6. **Exact `sqliteAdapter` D1 client signature** — confirm at implementation
   time against the installed `@payloadcms/db-sqlite` version. The adapter
   accepts a D1Database; the exact option name (`client` vs `binding`) is
   version-dependent and trivial to adjust.

## 12. Open items requiring user action

| Item                                                                 | Who   | When                |
|----------------------------------------------------------------------|-------|---------------------|
| `wrangler d1 create` × 3 → paste ids into `wrangler.jsonc`           | User  | Before implementation begins |
| Remove `STAGING_DATABASE_URI`, `PRODUCTION_DATABASE_URI` from GitHub | User  | After cutover §9.9  |
| Delete Neon databases                                                | User  | After cutover §9.8  |
