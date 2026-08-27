-- Free-tool sessions: the AI chatbot demo at /tools/ai-chatbot, and later the
-- Website Grader and llms.txt Generator (hence `tool` rather than a per-tool
-- table). Written by app/api/tools/chatbot/*, D1 binding `DB`.
--
-- SQLite, not Postgres — D1 is SQLite. Idempotent, so it is safe to re-run.
-- Shares the `DB` binding, and therefore the database, with contact_submissions.
--
-- `tool_embeds` is deliberately absent: the embeddable widget is phase two and
-- ships with its own migration. See docs/ai-chatbot-plan.md.
--
-- Apply with --remote, or you only touch the local simulated database:
--   pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
--     --file=db/migrations/0003_tool_sessions.sql

-- One row per demo session.
CREATE TABLE IF NOT EXISTS tool_sessions (
  id              TEXT PRIMARY KEY,          -- crypto.randomUUID(), client-visible
  tool            TEXT NOT NULL CHECK (tool IN ('chatbot', 'grader', 'llms-txt')),
  target_url      TEXT NOT NULL,
  host            TEXT NOT NULL,             -- normalised hostname; drives 24h crawl reuse
  ip_hash         TEXT NOT NULL,             -- HMAC-SHA256(ip, TOOLS_IP_SALT). Never a bare hash.
  status          TEXT NOT NULL CHECK (status IN ('crawling', 'ready', 'empty', 'failed')),
  pages_crawled   INTEGER NOT NULL DEFAULT 0,
  messages_used   INTEGER NOT NULL DEFAULT 0,
  diagnosis_json  TEXT,                      -- scored once, in the background
  transcript_json TEXT,                      -- what visitors actually ask
  email           TEXT,                      -- set only on interest capture
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Extracted corpus, one row per page.
CREATE TABLE IF NOT EXISTS tool_pages (
  session_id  TEXT NOT NULL REFERENCES tool_sessions(id),
  url         TEXT NOT NULL,
  title       TEXT,
  text        TEXT NOT NULL,
  meta_json   TEXT,                          -- heading depths, word count, js-empty flag
  PRIMARY KEY (session_id, url)
);

-- Atomic daily counters. key: 'global-messages' | 'ip:<hash>' | later 'embed:<key>'
CREATE TABLE IF NOT EXISTS tool_counters (
  day  TEXT    NOT NULL,                     -- UTC YYYY-MM-DD
  key  TEXT    NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, key)
);

-- Email captures. kind: 'embed' (phase-two gate) | 'model:<name>'
CREATE TABLE IF NOT EXISTS tool_interest (
  id         TEXT PRIMARY KEY,
  session_id TEXT REFERENCES tool_sessions(id),
  kind       TEXT NOT NULL,
  email      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crawl reuse looks up the most recent ready session for a host.
CREATE INDEX IF NOT EXISTS idx_tool_sessions_host_created
  ON tool_sessions (host, created_at DESC);
