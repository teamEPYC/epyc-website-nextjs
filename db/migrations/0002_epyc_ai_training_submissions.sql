-- AI-training workshop requests, written by app/api/workshop/route.ts (D1 binding `DB`).
-- Columns mirror the INSERT statement and lib/workshop/schema.ts (Zod) constraints.
-- SQLite, not Postgres — D1 is SQLite. Idempotent, so it is safe to re-run.
--
-- Shares the `DB` binding, and therefore the database, with contact_submissions.
-- That database is named for the contact form only because it was the first
-- tenant.
--
-- `format` is NOT NULL: this table has never existed in D1, so there are no
-- pre-existing rows to grandfather in, and Zod makes the field required going
-- in. The CHECK list mirrors FORMAT_OPTIONS / the Zod enum in
-- lib/workshop/schema.ts — keep the three in step or the database will reject a
-- value the form accepts.
--
-- Apply with --remote, or you only touch the local simulated database:
--   pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
--     --file=db/migrations/0002_epyc_ai_training_submissions.sql
CREATE TABLE IF NOT EXISTS epyc_ai_training_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  company    TEXT    NOT NULL,
  role       TEXT    NOT NULL,
  format     TEXT    NOT NULL CHECK (format IN ('EXEC_BRIEFING', 'TEAM_WORKSHOP', 'MULTI_WEEK_PROGRAM')),
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
