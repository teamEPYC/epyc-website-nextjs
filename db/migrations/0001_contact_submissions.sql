-- Contact form submissions, written by app/api/contact/route.ts (D1 binding `DB`).
-- Columns mirror the INSERT statement and lib/contact/schema.ts (Zod) constraints.
-- SQLite, not Postgres — D1 is SQLite. Idempotent, so it is safe to re-run.
--
-- Apply with --remote, or you only touch the local simulated database:
--   pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
--     --file=db/migrations/0001_contact_submissions.sql
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  budget     INTEGER NOT NULL,
  details    TEXT    NOT NULL,
  source     TEXT    NOT NULL CHECK (source IN ('LINKEDIN', 'FACEBOOK', 'X', 'INSTAGRAM')),
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
