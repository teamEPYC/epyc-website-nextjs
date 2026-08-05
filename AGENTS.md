<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Runtime: Node 22 + pnpm 10 (matches CI). Dependencies are refreshed automatically on startup via the update script (`pnpm install --frozen-lockfile`); no manual install needed.

Standard commands (see `package.json` scripts and `CLAUDE.md`):
- Dev server: `pnpm dev` — `next dev --webpack` on `http://localhost:3000` (Turbopack is intentionally disabled). This is the main way to run/develop the site.
- Lint: `pnpm lint`. Typecheck (the de-facto test gate — there is no test runner): `pnpm exec tsc --noEmit` for the app, plus `pnpm exec tsc --noEmit -p workers/contact-webhook/tsconfig.json` for the contact-webhook worker (it has a separate tsconfig and is excluded from the root project).
- Build: `pnpm build` (plain Next build). Cloudflare Workers build/preview: `pnpm preview` (`opennextjs-cloudflare build && opennextjs-cloudflare preview`).

Non-obvious caveats for running locally:
- The site runs fully standalone with no external services and no `.env`. Strapi, Neon Postgres, and the Cloudflare Queue are all optional.
- Strapi is not configured in this environment, so dev/build logs show `Strapi: fetch failed ...` / `DYNAMIC_SERVER_USAGE` errors for `/projects`, `/blog`, `/gallery`. These are expected and non-fatal — those pages render with empty content lists. `pnpm build` still exits 0.
- The contact form (`POST /api/contact`) persists to Neon and requires `NEON_DATABASE_URL`. Without it, a fully valid submission returns HTTP 500 (`new URL(undefined)` throws). Client-side validation and the rest of the form work without any DB. To test end-to-end contact persistence, set `NEON_DATABASE_URL`; the Cloudflare Queue enqueue path only exists under `pnpm preview` / deployed Workers, not `next dev`.
