-- AI-training workshop requests, written by app/api/workshop/route.ts (Neon HTTP API).
-- Columns mirror the INSERT statement and lib/workshop/schema.ts (Zod) constraints.
-- Idempotent so it is safe to re-run against any environment's Neon database.
CREATE TABLE IF NOT EXISTS training_submissions (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  company    text        NOT NULL,
  role       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
