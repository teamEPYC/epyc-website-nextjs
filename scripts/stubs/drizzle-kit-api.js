/**
 * Stub for `drizzle-kit/api` in the Cloudflare Worker bundle.
 *
 * The real drizzle-kit/api drags in Node-only deps (fs, path, etc.) and
 * can't run in workerd. @payloadcms/drizzle's requireDrizzleKit pulls it
 * via createRequire at module evaluation time, which makes the bundler
 * try to include it. We alias to this file (see next.config.ts
 * turbopack.resolveAlias) so the bundle resolves, and we throw at
 * runtime if anything actually calls these functions.
 *
 * In practice these are only invoked from `pushDevSchema` and Payload's
 * migration utilities. We have `push: false` on the adapter and run
 * migrations via `wrangler d1 migrations apply` in CI, so the runtime
 * code path never reaches here.
 */
const unavailable = (name) => () => {
  throw new Error(
    `drizzle-kit/api.${name}() is not available in the Worker runtime — ` +
      'this code path should be unreachable (push:false, migrations run ' +
      'via wrangler d1 migrations apply).',
  )
}

export const generateSQLiteDrizzleJson = unavailable('generateSQLiteDrizzleJson')
export const generateSQLiteMigration = unavailable('generateSQLiteMigration')
export const pushSQLiteSchema = unavailable('pushSQLiteSchema')
