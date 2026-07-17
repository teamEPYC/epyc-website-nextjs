-- Adds the workshop-format field written by app/api/workshop/route.ts.
-- The CHECK list mirrors FORMAT_OPTIONS / the Zod enum in lib/workshop/schema.ts;
-- keep the three in step or the database will reject a value the form accepts.
--
-- Nullable on purpose: rows submitted before this column existed genuinely have
-- no format, and NULL says that honestly. A NOT NULL add would fail against
-- them, and a DEFAULT would invent an answer they never gave. Zod makes the
-- field required going in, so every new row carries one.
-- (NULL always passes a CHECK, so the constraint and the nullability coexist.)
--
-- Idempotent so it is safe to re-run against any environment's Neon database.
ALTER TABLE training_submissions
  ADD COLUMN IF NOT EXISTS format text
  CHECK (format IN ('EXEC_BRIEFING', 'TEAM_WORKSHOP', 'MULTI_WEEK_PROGRAM'));
