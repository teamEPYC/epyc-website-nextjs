-- Email verification codes for claiming an embed.
--
-- A pending code, never the code itself: `code_hash` is an HMAC, so a database
-- read cannot hand anyone a working code. Six digits is only a million
-- possibilities, which is why the attempt limit below is load-bearing rather
-- than decorative.
--
-- Daily caps (per email, per session) are enforced through tool_counters
-- rather than by counting rows here — that counter is a single atomic
-- statement and already exists. See lib/tools/chatbot/verification.ts.
--
-- Apply with --remote, or you only touch the local simulated database:
--   pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
--     --file=db/migrations/0005_tool_verifications.sql

CREATE TABLE IF NOT EXISTS tool_verifications (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES tool_sessions(id),
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,              -- HMAC-SHA256(code, TOOLS_IP_SALT)
  expires_at  TEXT NOT NULL,              -- ISO. 10 minutes from issue
  attempts    INTEGER NOT NULL DEFAULT 0, -- invalidated past 5
  consumed_at TEXT,                       -- set once; a code is single use
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Checking a code looks up the newest live one for this session and email.
CREATE INDEX IF NOT EXISTS idx_tool_verifications_lookup
  ON tool_verifications (session_id, email, created_at DESC);
