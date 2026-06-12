-- Contact form submissions, written by app/api/contact/route.ts (Neon HTTP API).
-- Columns mirror the INSERT statement and lib/contact/schema.ts (Zod) constraints.
-- Idempotent so it is safe to re-run against any environment's Neon database.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  budget     integer     NOT NULL,
  details    text        NOT NULL,
  source     text        NOT NULL CHECK (source IN ('LINKEDIN', 'FACEBOOK', 'X', 'INSTAGRAM')),
  created_at timestamptz NOT NULL DEFAULT now()
);
