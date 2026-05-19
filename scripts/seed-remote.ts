/**
 * Snapshot the current local D1 (populated via `pnpm db:seed:local`) to
 * a remote D1 (staging or production).
 *
 * Flow:
 *   1. Export local D1 to SQL — content tables only, no schema, no
 *      d1_migrations / payload internals / users / submissions.
 *   2. Prepend DELETEs so the apply is idempotent on a non-empty remote.
 *   3. Apply the SQL via `wrangler d1 execute --remote --env <env> --file`.
 *
 * Local is the source of truth. If you want freshly-CSV-seeded data on
 * remote, run `pnpm db:seed:local` first to refresh local, then re-run
 * this. (Note: `pnpm db:seed:local` on a non-empty DB currently fails on
 * Payload's deleteUserPreferences hitting D1's per-statement variable
 * cap once media count >~100 — wipe `.wrangler/state/v3/d1` before
 * re-seeding, or chunk the down() deletes as a follow-up.)
 *
 * Why this shape: D1's remote binding can't be addressed from a Node
 * script (no public `getPlatformProxy({ remote: true })` for D1 in
 * wrangler 4.91), so we route through wrangler's own remote-execute
 * pathway. Wrangler chunks the SQL for the D1 API automatically.
 *
 * Run with:
 *   pnpm db:seed:staging
 *   pnpm db:seed:production
 *
 * Destructive on the target env: wipes the listed content tables before
 * re-inserting. Safe to re-run.
 *
 * Requires CF creds locally — either `wrangler login` or
 * `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` env vars.
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const env = process.argv[2]
if (env !== 'staging' && env !== 'production') {
  console.error('Usage: pnpm db:seed:staging  |  pnpm db:seed:production')
  process.exit(1)
}

// Content tables only. Excluded by intent:
//   - users, users_sessions        (auth state is per-env; create admins via signup)
//   - submissions                  (per-env contact form data)
//   - payload_*                    (Payload's internal tracking; managed by Payload runtime)
//   - d1_migrations                (wrangler's migration tracking; per-env)
// Order matters for DELETE under FK constraints — reversed before emitting.
const CONTENT_TABLES = [
  'media',
  'authors',
  'blogs',
  '_blogs_v',
  'projects',
  'projects_type',
  '_projects_v',
  '_projects_v_version_type',
  'gallery',
  '_gallery_v',
]

function run(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false })
  if (r.status !== 0) {
    console.error(`\n✗ ${cmd} ${args.join(' ')} exited ${r.status}`)
    process.exit(r.status ?? 1)
  }
}

// 1. Export local content tables to SQL (data only).
const tmp = mkdtempSync(join(tmpdir(), 'epyc-seed-'))
const exportPath = join(tmp, 'seed.sql')
const tableArgs = CONTENT_TABLES.flatMap((t) => ['--table', t])

console.log(`▶ Exporting local D1 content tables → ${exportPath}`)
run('pnpm', [
  'exec',
  'wrangler',
  'd1',
  'export',
  'DB',
  '--local',
  '--no-schema',
  '-y',
  '--output',
  exportPath,
  ...tableArgs,
])

// 2. Prepend DELETEs so the apply is idempotent (re-runnable).
//    `PRAGMA foreign_keys=OFF` (vs `defer_foreign_keys=TRUE`) so FK
//    enforcement is off for the whole connection — wrangler's d1
//    `execute --file` may chunk across statements, and `defer_*` only
//    works within a single transaction. This also lets us delete content
//    tables without first wiping unrelated tables (payload_preferences_rels,
//    payload_locked_documents_rels) that may reference them after
//    admin/preview activity on the deployed worker.
//
//    Reverse table order so child rows (versions, hasMany rows) get
//    cleared before parents.
const deletePrelude =
  [
    'PRAGMA foreign_keys=OFF;',
    ...[...CONTENT_TABLES].reverse().map((t) => `DELETE FROM \`${t}\`;`),
  ].join('\n') + '\n'

const exported = readFileSync(exportPath, 'utf8')
writeFileSync(exportPath, deletePrelude + exported)

// 3. Apply to remote.
console.log(`▶ Applying to remote D1 (env: ${env})`)
run('pnpm', [
  'exec',
  'wrangler',
  'd1',
  'execute',
  'DB',
  '--remote',
  '--env',
  env,
  '--file',
  exportPath,
])

rmSync(tmp, { recursive: true, force: true })
console.log(`\n✓ Seeded ${env} from local D1 (source: scripts/seed/*.csv)`)
