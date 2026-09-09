# AI Chatbot — Database ER Diagram

Cloudflare D1 (SQLite), binding `DB`, shared with the contact form.
Source of truth: `db/migrations/0003_tool_sessions.sql`, `0004_tool_embeds.sql`, `0005_tool_verifications.sql`.

```mermaid
erDiagram
    TOOL_SESSIONS ||--o{ TOOL_PAGES : "crawled corpus"
    TOOL_SESSIONS ||--o| TOOL_EMBEDS : "claimed once (unique)"
    TOOL_SESSIONS ||--o{ TOOL_VERIFICATIONS : "claim codes"
    TOOL_SESSIONS ||--o{ TOOL_INTEREST : "email captures"

    TOOL_SESSIONS {
        TEXT    id PK "crypto.randomUUID(), client-visible"
        TEXT    tool "chatbot | grader | llms-txt"
        TEXT    target_url
        TEXT    host "normalised; drives 24h crawl reuse"
        TEXT    ip_hash "HMAC-SHA256(ip, TOOLS_IP_SALT)"
        TEXT    status "crawling | ready | empty | failed"
        INTEGER pages_crawled
        INTEGER messages_used
        TEXT    diagnosis_json "scored once, in background"
        TEXT    transcript_json
        TEXT    email "only on interest capture"
        TEXT    created_at
    }

    TOOL_PAGES {
        TEXT session_id PK,FK
        TEXT url PK
        TEXT title
        TEXT text
        TEXT meta_json "heading depths, word count, js-empty"
    }

    TOOL_EMBEDS {
        TEXT    key PK "ek_live_...; PUBLIC, lives in host HTML"
        TEXT    session_id FK,UK "one embed per session"
        TEXT    bound_host "apex host; www implicit"
        TEXT    email "who claimed it"
        TEXT    status "active | revoked"
        INTEGER attribution "Powered by EPYC, 1 on free"
        TEXT    crawled_at
        TEXT    created_at
        TEXT    last_message_at
    }

    TOOL_VERIFICATIONS {
        TEXT    id PK
        TEXT    session_id FK
        TEXT    email
        TEXT    code_hash "HMAC-SHA256(code, TOOLS_IP_SALT)"
        TEXT    expires_at "ISO, +10 min"
        INTEGER attempts "invalid past 5"
        TEXT    consumed_at "single use"
        TEXT    created_at
    }

    TOOL_INTEREST {
        TEXT id PK
        TEXT session_id FK "nullable"
        TEXT kind "embed | model:<name>"
        TEXT email
        TEXT created_at
    }

    TOOL_COUNTERS {
        TEXT    day PK "UTC YYYY-MM-DD"
        TEXT    key PK "global-messages | ip:<tool>:<hash> | embed:<key>"
        INTEGER n "atomic daily counter"
    }
```

## Notes

- **`tool_counters` has no FK** — keyed by string, not relation. `ip:<tool>:<hash>` points at
  `tool_sessions.ip_hash`, `embed:<key>` at `tool_embeds.key`, but neither is enforced.
  Deliberate: quota writes are a single atomic `INSERT … ON CONFLICT DO UPDATE`.
- **`tool_interest.session_id` is nullable** — an email can be captured with no session
  (model waitlist). Every other FK is `NOT NULL`.
- **Indexes**: `(host, created_at DESC)` on sessions for 24h crawl reuse;
  unique `(session_id)` on embeds; `(bound_host)` on embeds;
  `(session_id, email, created_at DESC)` on verifications.
- **Retention**: a session with a `tool_embeds` row must not be pruned — the live widget
  answers from its `tool_pages`.
- `tool` / `status` / embed `status` are CHECK constraints, not lookup tables.
