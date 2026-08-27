-- Claimed embeds: one row per widget running on a third-party site.
--
-- Written by app/api/tools/chatbot/embed/route.ts, read on every embed
-- message. Separate from 0003 because the widget is a later decision — see
-- docs/ai-chatbot-plan.md.
--
-- The key is PUBLIC by design. It sits in the HTML of the host site, so it
-- cannot be a secret. Security comes from binding, not concealment: a key
-- minted for acme.com only answers requests whose Origin is acme.com, and the
-- per-key daily cap bounds the damage if someone forges the Origin header from
-- a non-browser client.
--
-- Apply with --remote, or you only touch the local simulated database:
--   pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
--     --file=db/migrations/0004_tool_embeds.sql

CREATE TABLE IF NOT EXISTS tool_embeds (
  key             TEXT PRIMARY KEY,          -- 'ek_live_…', public, lives in host HTML
  session_id      TEXT NOT NULL REFERENCES tool_sessions(id),
  bound_host      TEXT NOT NULL,             -- apex host; www is accepted implicitly
  email           TEXT,                      -- who claimed it
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  attribution     INTEGER NOT NULL DEFAULT 1,-- "Powered by EPYC", not removable on free
  crawled_at      TEXT NOT NULL,             -- shown in the widget, drives recrawl prompts
  created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at TEXT
);

-- One embed per session, and a fast lookup when someone re-claims the same host.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_embeds_session ON tool_embeds (session_id);
CREATE INDEX IF NOT EXISTS idx_tool_embeds_host ON tool_embeds (bound_host);

-- A claimed embed's corpus must survive: the live bot answers from it. Any
-- pruning job must skip pages whose session has a row here.
