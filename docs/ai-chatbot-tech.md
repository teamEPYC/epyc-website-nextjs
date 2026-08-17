# AI Chatbot — Technical Reference

**Companion docs:** [`ai-chatbot-plan.md`](./ai-chatbot-plan.md) (scope, order of work, approvals) · [`ai-chatbot-architecture.md`](./ai-chatbot-architecture.md) (system shape and the reasoning behind it)

Build reference for phase one: file layout, route contracts, schema, crawler rules, prompts, scoring, caps, dependencies, secrets and the deploy checklist. Read `DESIGN.md` before writing any UI, and `AGENTS.md` before touching routing conventions.

---

## File layout

```
app/(my-app)/tools/ai-chatbot/page.tsx     landing + tool UI (client island inside a server page)
app/api/tools/chatbot/crawl/route.ts       POST — inline crawl, SSE progress
app/api/tools/chatbot/message/route.ts     POST — chat turn, SSE tokens
app/api/tools/chatbot/diagnosis/route.ts   GET  — stored report JSON
app/api/tools/chatbot/interest/route.ts    POST — email capture (phase-two gate)

components/sections/chatbot-tool.tsx       the tool: URL box → progress → chat → report
components/ui/chat-*.tsx                   thread, bubble, composer — restyled to DESIGN.md tokens

lib/crawl/validate-url.ts                  URL safety (tested)
lib/crawl/sitemap.ts                       robots.txt Sitemap: → sitemap index → page URLs
lib/crawl/fetch-pages.ts                   polite concurrent fetch, byte + time caps
lib/crawl/extract.ts                       HTML → text + structure metadata
lib/tools/counters.ts                      atomic daily counters (tested)
lib/tools/diagnosis.ts                     three deterministic scores + one model call
lib/tools/prompt.ts                        system prompt + corpus assembly
data/buyer-questions.ts                    the 10 questions — editable, approval-gated

db/migrations/0003_tool_sessions.sql
```

`lib/crawl/` is written as a standalone module with no route coupling: the Website Grader and llms.txt Generator are its next two consumers.

---

## D1 schema

New migration `db/migrations/0003_tool_sessions.sql`, same `DB` binding as the contact form. SQLite, idempotent, applied manually per repo convention (see [Deploy checklist](#deploy-checklist)).

```sql
-- One row per demo session.
CREATE TABLE IF NOT EXISTS tool_sessions (
  id              TEXT PRIMARY KEY,          -- opaque, client-visible
  tool            TEXT NOT NULL,             -- 'chatbot' | 'grader' | 'llms-txt'
  target_url      TEXT NOT NULL,
  host            TEXT NOT NULL,             -- normalised, drives the 24h crawl reuse
  ip_hash         TEXT NOT NULL,             -- HMAC-SHA256(ip, TOOLS_IP_SALT), never a bare hash
  status          TEXT NOT NULL,             -- 'ready' | 'empty' | 'failed'
  pages_crawled   INTEGER NOT NULL DEFAULT 0,
  messages_used   INTEGER NOT NULL DEFAULT 0,
  diagnosis_json  TEXT,                      -- scored once, after message 1
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
  meta_json   TEXT,                          -- heading depths, word count, JS-empty flag
  PRIMARY KEY (session_id, url)
);

-- Atomic daily counters. key: 'global-messages' | 'ip:<hash>' | later 'embed:<key>'
CREATE TABLE IF NOT EXISTS tool_counters (
  day  TEXT    NOT NULL,
  key  TEXT    NOT NULL,
  n    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, key)
);

-- Email captures. kind: 'embed' | 'model:<name>'
CREATE TABLE IF NOT EXISTS tool_interest (
  id         TEXT PRIMARY KEY,
  session_id TEXT REFERENCES tool_sessions(id),
  kind       TEXT NOT NULL,
  email      TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tool_sessions_host_created
  ON tool_sessions (host, created_at DESC);   -- 24h crawl reuse lookup
```

`tool_embeds` is **not** in this migration. It ships with the widget in phase two.

### The counter statement

One statement, no read-then-increment, no Durable Object. This is the corrected form — the spec's `UPDATE ... WHERE n < ?` affects zero rows when today's row does not exist yet, which reads as "cap hit" on the first request after every midnight.

```sql
INSERT INTO tool_counters (day, key, n) VALUES (?, ?, 1)
ON CONFLICT(day, key) DO UPDATE SET n = n + 1 WHERE n < ?;
```

`meta.changes === 0` means **capped**, and nothing else. `day` is UTC `YYYY-MM-DD`, so the reset never moves with DST. Positional `?` rather than numbered `?1` — matches `app/api/contact/route.ts`.

**Built:** `lib/tools/counters.ts` — `bumpCounter()` consumes one unit and returns whether it was allowed; `underLimit()` peeks without consuming, for the crawl route's check-before-work; `CAPS` and `counterKeys` hold the numbers and key formats.

---

## Route contracts

All four routes live under `app/api/tools/chatbot/`. They follow `app/api/contact/route.ts`: parse JSON, zod `safeParse`, 400 on failure with `fieldErrors`, `getCloudflareContext()` for bindings.

### `POST /api/tools/chatbot/crawl` → `text/event-stream`

```jsonc
// request
{ "url": "https://example.com" }
```

```jsonc
// request — `force` bypasses the 24h reuse cache
{ "url": "https://example.com", "force": false }
```

Order of operations — cheapest rejection first:

1. Validate and normalise the URL (`lib/crawl/validate-url.ts`). Reject non-`http(s)` schemes, IP literals, `localhost`, userinfo in the authority, and hosts that resolve to a private range. `400`.
2. **Read** `ip:<hash>` against 3/day. Over cap → `429` with a "back tomorrow" body. Do **not** increment yet — see below.
3. **Reuse:** unless `force` is set, if a `tool_sessions` row for the same `host` is under 24h old and `status = 'ready'`, copy its `tool_pages` into a new session and stream a single `done` event. Instant, and it stops us re-crawling a prospect every time sales demos the same domain.
4. Otherwise crawl (see [Crawler rules](#crawler-rules)), streaming one event per page.
5. Write `tool_sessions` + `tool_pages`. If total extracted text is under the empty-corpus threshold, set `status = 'empty'` and score the report now (see [Report scoring](#report-scoring)).
6. **Increment `ip:<hash>` only once a session actually exists.** Checking and incrementing separately is not atomic, but the failure mode is one extra free crawl under a race, which is the right way to be wrong here — incrementing up front means a typo'd URL or a dead host burns one of the visitor's three daily sessions.

**`force: true` is what the manual re-crawl button sends.** Without it the button collides with the 24h reuse cache: a visitor who reads the report, fixes their content and re-runs would be handed the stale corpus and an unchanged score, which breaks the exact conversion moment the button exists to create. Re-crawls still consume a session against `ip:<hash>`.

The IP comes from the `CF-Connecting-IP` header, then HMAC-SHA256 with `TOOLS_IP_SALT`. Never store or log the raw address.

SSE events:

```
event: page      data: {"url":"/pricing","title":"Pricing","index":4,"total":20}
event: done      data: {"sessionId":"...","pages":17,"status":"ready"}
event: error     data: {"message":"..."}
```

`status: "empty"` means the client skips the chat entirely and goes straight to the report with Crawlability failed and the specific blocker named. A bot with nothing to say makes EPYC look broken; the report makes their site look broken, which is the point.

### `POST /api/tools/chatbot/message` → `text/event-stream`

```jsonc
{ "sessionId": "...", "message": "what does it cost?" }
```

1. Load session. `messages_used >= 8` → `409` with `{ capped: true }`; the client shows the report.
2. Bump `global-messages` against 200/day. Over → `429`, "back tomorrow" state.
3. Assemble corpus + history (see [Prompt](#prompt)), stream from OpenRouter via the AI SDK.
4. Increment `messages_used`, append to `transcript_json`.
5. **On message 1 only:** `waitUntil(scoreDiagnosis(sessionId))` — the report is computed while the visitor is still typing.

Rate-limit handling: on `429` from the free tier, retry once with jitter, then fall back to the paid model for that turn. A rate limit degrades quality, never the page.

### `GET /api/tools/chatbot/diagnosis?sessionId=…`

Returns `diagnosis_json`. If the background scoring has not landed yet, compute the three deterministic dimensions inline and return them with `"partial": true` — never an error, never a spinner at the moment we ask for the click.

**Session ids are the only credential on `/message` and `/diagnosis`.** Mint them from `crypto.randomUUID()` — unguessable, and the per-session message cap bounds what holding one gets you. Worth stating so nobody later assumes an auth layer that was never there.

### `POST /api/tools/chatbot/interest`

```jsonc
{ "sessionId": "...", "kind": "embed", "email": "someone@example.com" }
```

Writes `tool_interest`, mirrors the email onto `tool_sessions.email`. This row is the phase-two gate. Honeypot field, same pattern as the contact form.

---

## Crawler rules

| Rule | Value | Why |
|---|---|---|
| Page discovery | `robots.txt` `Sitemap:` directive **first**, then `/sitemap.xml` | The directive is the standard discovery path and we are fetching robots anyway |
| Sitemap index | follow **one** level down | `sitemap.xml` is a sitemap *index* on most WordPress/Yoast, Shopify and large sites; naive parsing returns zero pages |
| No sitemap | homepage + same-host internal links, depth 1 | |
| URL preference | shallow paths, and slugs matching `about\|service\|product\|pricing\|contact\|work\|case` | These are the pages the report scores |
| Pages | 20 hard | |
| Bytes per page | 500 KB, then abort that page | |
| Redirects | 3 | |
| Concurrency | 5–6 in flight per host | We are pointing traffic at someone else's server |
| User-Agent | names EPYC + a contact URL | Anonymous scrapers get blocked, permanently, for every future visitor |
| Wall clock | 20s hard stop, proceed with what landed | One slow host must not hang the demo |
| `robots.txt` | honour `Disallow` for the paths crawled | |
| Extraction | semantic containers; drop `nav`, `footer`, `script`, `style` | |
| Truncation | ~4k tokens per page | |

**Never reflect raw fetched HTML back to the browser.** Extracted text only.

`lib/crawl/extract.ts` returns the text *and* the structure metadata the report needs in the same pass — heading tags and depth, word count, and whether the page yielded text at all. Crawling twice for that would be silly.

---

## Prompt

Corpus goes in as one block — page title, URL, extracted text per page — then conversation history. The system prompt does four things:

1. Answer **only** from the supplied page text. Never use outside knowledge about the company.
2. When the text does not contain the answer, say so plainly and name what is missing. Do not guess, do not pad.
3. Stay in the persona of a support assistant for **that company**. Never mention EPYC. Never break character to critique the site — the critique belongs in the report.
4. Keep answers short. Two or three sentences unless asked for detail.

Point 2 is load-bearing. The honest "I could not find that on the site" answers are the raw material the report is built from, and they are the sales argument. A bot that bluffs destroys the whole mechanic.

Set `reasoning_effort` low or off — the bot answers from supplied text rather than solving anything.

**No prompt caching.** The full corpus resends on every message. On the free tier that costs nothing but latency; it is the reason the paid fallback needs a cheap model rather than a large one.

---

## Report scoring

`lib/tools/diagnosis.ts` returns one JSON object, stored on the session. Every number is backed by evidence pulled from the crawl — nothing invented, nothing we cannot point at.

### Deterministic — from crawl metadata, no model call

| Dimension | Computed from | Evidence emitted |
|---|---|---|
| **Structure** | heading tags and nesting per page, from `tool_pages.meta_json` | heading depth per page; flags "one large block of markup" |
| **Crawlability** | sitemap found?, robots blocking?, text present without JS execution? | pass/fail per check with the specific blocker named |
| **Specificity** | phrase list of vague marketing claims + "claims without numbers" heuristic over page text | quoted examples from their own pages |

### One model call — Answerability + Coverage

A single structured JSON response covering all 10 buyer questions **and** the five page types. Not eleven calls.

```jsonc
{
  "answerability": {
    "answered": 4, "total": 10,
    "unanswered": ["what does it cost", "how long does it take", "..."]
  },
  "coverage": { "missing": ["pricing or process", "proof"] }
}
```

Failure of this call renders the three deterministic dimensions with `"partial": true`. Not an error state.

### When scoring runs

| Path | Trigger | Model call |
|---|---|---|
| Normal | `waitUntil()` on message 1 | yes |
| Empty corpus (`status = 'empty'`) | end of crawl — there is no message 1 on this path | **no** — Answerability is 0/10 by construction, Coverage is derived from the page list |
| Manual re-crawl | same as the path the new session lands on | as above |

`waitUntil` comes off `getCloudflareContext().ctx` — the same accessor the contact route uses for bindings.

### Model choice for this call

Lightning is a 3B-active/30B MoE: fast, cheap, and well shaped for "answer from the text in front of you", which is the chat. This call is a different job — judgement across an 80k-token corpus, once per session, producing the number we put in front of a prospect. Build it on Lightning, then compare against a larger model over ten real sites before launch. At one call per session the paid tier costs cents; the headline number is not the place to save them.

**Specificity — decided on real output, 14 Aug 2026.** The plan said to judge this dimension once we had run it against a real site. We did, against epyc.in:

- **First run: 19 "vague claims", mostly false positives.** The phrase list was scoring blog posts as sales copy — including a post that was itself *mocking* empty language ("ends with a slide that says 'now go be innovative'"), plus article titles from the blog index.
- **Fix: editorial URLs are excluded** (`/blog`, `/news`, `/insights`, `/case-stud`, …). The dimension asks "does this company describe itself concretely", and a blog post is not the company describing itself. Result on the same site: **19 → 1**, and the verdict correctly flipped from *weak* to *pass*.
- **Still imperfect.** The one survivor is the same mocking sentence, on a sales page this time — a phrase list cannot tell a used claim from a criticised one. At one example on a passing verdict that is tolerable.

**Kept deterministic for now.** The upgrade path is unchanged and still cheap: move it into the scoring call as one extra field. Trigger for doing so is a site where the quotes read as unfair — this dimension is the one most likely to hand an owner an argument, and its whole value is being unarguable.

The 10 buyer questions live in `data/buyer-questions.ts` as a typed const array so they can be edited without touching logic. They gate step 5 and need sign-off. Three or four of them also render as clickable prompt chips in the composer — that kills the blank-input pause where drop-off happens, and it makes the final score a recap of failures the visitor already watched rather than a claim.

---

## Caps

| Cap | Value | Enforced in |
|---|---|---|
| Pages per crawl | 20 | crawler |
| Bytes per page | 500 KB, then abort | crawler |
| Extracted text per page | ~4k tokens, truncate | extractor |
| Crawl depth | 1 | crawler |
| Redirects | 3 | fetch options |
| Whole crawl | 20s wall clock | crawl route |
| Messages per session | 8, then report + CTA | message route |
| Sessions per IP per day | 3 | `tool_counters`, key `ip:<hash>` |
| Global messages per day | 200 to start | `tool_counters`, key `global-messages` |

On a free model these bound abuse and upstream rate limits, not spend. No dollar ceiling — spend is bounded structurally.

---

## Dependencies

| Package | Version verified 14 Aug 2026 | Note |
|---|---|---|
| `ai` | `7.0.65` | peer `zod: ^3.25.76 \|\| ^4.1.8` — satisfied by this repo's `zod@^4.4.3`, no major bump needed |
| `@openrouter/ai-sdk-provider` | `3.0.0` | peer `ai: ^7.0.0` — matches the above. Pin exact, upgrade the pair together |
| `vitest` (dev) | `4.1.10` | **installed.** The repo had no test infra before this |
| `@types/node` (dev) | bumped `^20` → `^22` | `node:sqlite` types. Typecheck stayed clean across the bump |

### Model chain (OpenRouter, verified 14 Aug 2026)

Free at every tier. Paid is off by default and exists only as a break-glass flag.

| Tier | Model ID | Context | Cost | Role |
|---|---|---|---|---|
| 1 — chat | `nvidia/nemotron-3.5-lightning:free` | 1,000,000 | $0 | Primary. ~1.2s per answer |
| 2 — on 429 | `nvidia/nemotron-3-super-120b-a12b:free` | 1,000,000 | $0 | Same window, larger model |
| 3 — on 429 | `nvidia/nemotron-3-ultra-550b-a55b:free` | 512,000 | $0 | Last resort. ~6s, still 6× the corpus size |
| Break-glass | `nvidia/nemotron-3.5-lightning` | 1,000,000 | ~$0.10/M in | Behind `OPENROUTER_ALLOW_PAID=true`. Off by default |
| Scoring call | `nvidia/nemotron-3-super-120b-a12b:free` | 1,000,000 | $0 | See below |

Implement as an ordered array in `lib/tools/models.ts` — try in order, advance on `429`/`503`, surface the "one moment" state while retrying, and only show a failure after the chain is exhausted. Log which tier served each message so we learn how often tier 1 actually holds.

**This also settles the scoring-model question at zero cost.** The earlier recommendation was to pay for the Answerability/Coverage call because it is judgement work producing the headline number. Super's free variant is a larger model than Lightning with the same 1M window, and the call runs once per session rather than eight times — so it gets the bigger model for free. No paid tier needed anywhere in phase one.

### ⚠️ Confirmed 14 Aug 2026: the free cascade does not work

Tested directly against OpenRouter. All three free tiers return the same error:

```
HTTP 429
"Rate limit exceeded: free-models-per-day.
 Add 10 credits to unlock 1000 free model requests per day"
```

**The quota is account-wide (`free-models-per-day`), not per-model.** Falling from Lightning to Super to Ultra buys nothing — all three draw on one exhausted bucket. The cascade is worth keeping only for a single model being down, not for rate limits.

The paid tier cannot rescue it either while the key has no credits:

```
HTTP 403  "Key limit exceeded (total limit)"
```

**What this means for launch.** Without credits the account gets roughly 50 free requests a day, against a planned global cap of 200 messages a day — so the tool would stop working before lunch. Adding **$10 of credits raises it to 1,000 free requests a day**, which comfortably covers the planned cap and still costs nothing per message.

That $10 is now a launch prerequisite, not an optimisation. Until it is added, treat every "free tier" statement elsewhere in these docs as conditional on it.

`@assistant-ui/react` + `@assistant-ui/react-ai-sdk` are **optional and version-coupled to AI SDK majors**. Their selling point is a shadcn theme, which this repo does not have — adopting them means restyling onto `DESIGN.md` tokens, which is real work and is why step 6 is the largest step. Hand-building the thread from `components/ui/` primitives (`Button`, `Textarea`, `Field`) is the lever if step 6 needs cutting: it is one thread, no history, no tool calls, no uploads.

Never bump `ai` and `@assistant-ui/react-ai-sdk` as a drive-by. Together, deliberately.

---

## Tests

Two files, 25 cases, all green. Money and security paths only — this is the one place not to be lazy.

1. **`lib/tools/counters.test.ts`** — allows the first call of a new day (the bug the spec's SQL had), allows exactly `limit` calls then refuses, stays refused, counts keys separately, resets across days, and `underLimit()` consumes nothing.
2. **`lib/crawl/validate-url.test.ts`** — accepts bare domains / subdomains / paths and strips fragments; rejects IPv4 and IPv6 literals, cloud metadata addresses, `localhost` and internal suffixes, single-label hosts, non-web schemes, credentials in the authority, and non-standard ports.

Run with `pnpm test`. Config is `vitest.config.mts` (`.mts` so Vite's native config loader stops warning).

**The counter test runs its real SQL against `node:sqlite` rather than `@cloudflare/vitest-pool-workers`.** D1 *is* SQLite, and what is at risk is the semantics of one conditional upsert — `changes` on a cold day versus at the cap — which is engine behaviour, not binding behaviour. One dev dependency instead of a test harness. Move to the workers pool only if we need D1-specific behaviour like `batch()` or session bookmarks.

Consequence: `node:sqlite` is Node 22+, so **CI's `node-version` moved from 20 to 22** and `@types/node` from `^20` to `^22`. Both are done, and the full typecheck stayed clean across the bump.

---

## Secrets and bindings

No new bindings. `DB` already exists in `wrangler.jsonc` for both environments.

| Secret | Set with |
|---|---|
| `OPENROUTER_API_KEY` | `wrangler secret put OPENROUTER_API_KEY --env <env>` |
| `TOOLS_IP_SALT` | `wrangler secret put TOOLS_IP_SALT --env <env>` |

Never in code, never in the client bundle. Regenerate `cloudflare-env.d.ts` with `pnpm cf-typegen` after adding them.

---

## Deploy checklist

Migrations are **not** auto-applied in this repo.

```bash
pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --remote \
  --file=db/migrations/0003_tool_sessions.sql
# then the production database, on the production deploy
```

- [ ] Migration applied to **both** D1 databases (staging and production names are in `wrangler.jsonc`)
- [ ] `OPENROUTER_API_KEY` and `TOOLS_IP_SALT` set per environment
- [ ] `/tools/ai-chatbot` added to `app/(my-app)/sitemap.ts`
- [ ] Privacy line published and linked from the tool page
- [ ] GA4 events firing: `tool_start`, `tool_crawl_complete`, `tool_message_sent`, `tool_cap_reached`, `tool_diagnosis_viewed` (with the answerability score), `tool_cta_click`, `tool_interest_captured`
- [ ] Clarity recording the drop-off between URL entry and first message — the number that decides whether the tool works

---

## Design

Reference implementation: `components/sections/chatbot-tool.tsx` — a click-through wireframe of every screen, built from real primitives. Read `DESIGN.md` and `.design-sync/conventions.md` before changing any of it.

### Screen inventory

One route, five states. Only one renders at a time.

| State | Trigger | Ground | Contains |
|---|---|---|---|
| `idle` | first load | `beige` | Eyebrow pill, `text-display` H1, URL field + CTA, reassurance line, three `Disc` steps |
| `crawling` | crawl POST opens | `ink` | `SectionHeading`, progress rail, live page log, "found your sitemap" line |
| `chat` | crawl `done`, `status: ready` | `beige` | Thread header + questions-left `Pill`, bubbles, prompt chips, composer |
| `report` | message cap, or the report link | `ink` → `beige` → `cream` | Answerability headline band, unanswered list, four score rows, two CTAs + re-crawl |
| `empty` | crawl `done`, `status: empty` | `ink` | Blocker named, what-we-found table, rebuild CTA. **No chat offered** |

The report deliberately spans three tones: the headline number gets its own `ink` band so it reads as the verdict, the detail sits on `beige`, and the CTA lands on `cream`. Do not flatten these into one section — the tone change is what separates "your score" from "what we do about it".

### Components to graduate

The wireframe composes three things from tokens because nothing in `components/ui/` was close. On approval they move out of the section file and into `components/ui/`:

| Wireframe-local | Becomes | Note |
|---|---|---|
| `Bubble` | `components/ui/chat-bubble.tsx` | Three variants: `you` (ink), `bot` (bone), `miss` (crimson-outlined). The `miss` variant is load-bearing — it is the visual the report later refers back to |
| composer row | `components/ui/chat-composer.tsx` | `Field` + `Input` + `Button`, `h-16` to match the field |
| `ScoreRow` | `components/ui/score-row.tsx` | Not a `StatRow` variant. `StatRow` is a 3-up value/label strip for light grounds; this is a full-width row with a verdict and an evidence list |

### Rules

- **Tokens only.** No hex, no arbitrary sizes. Type comes from the scale (`text-display`, `text-h2`, `text-body`) which carries family, size, tracking and leading together.
- **Outline buttons on `ink` need `data-on-dark="true"`** or they render ink-on-ink and vanish.
- **`Pill` tone must match the ground** — `cream-on-dark` on ink, `ink-on-light` on beige/cream.
- **Score colour is semantic, not decorative**: `text-crimson` for a failing dimension, `text-ink` for middling, `text-teal-deep` for a pass. Crimson is the CTA colour everywhere else on the site, so use it here only where the finding is genuinely bad.
- **Mobile**: the URL row, composer and CTA pairs all stack (`flex-col sm:flex-row`). The chat thread caps bubbles at `max-w-[85%]`. Test at 375px.
- **Motion**: `Reveal` on entering sections only. The crawl log and streamed tokens are already movement — do not add more. Everything honours `prefers-reduced-motion` via the existing primitives.
- **Accessibility**: the crawl log is `aria-live="polite"`; the questions-left count must be announced, not just coloured; every state change moves focus to the new region's heading.
- **Markdown**: only the rendered state reaches the markdown converter (see `CLAUDE.md` → Markdown for Agents). Before launch, either emit the report as structured data or give the route a builder in `lib/markdown/sources.ts`.

### Copy direction

Carried from the source spec, which is the authority on voice.

- **Voice per `epyc-baseline.md`**: confident, premium, slightly bold. Short sentences. **No em dashes.** Stage-agnostic — never startup-only language.
- **Do not name it as an AI product.** It is a diagnostic that happens to use a chatbot. Headlines sit on the buyer's problem, not the technology: *can a buyer, or an AI assistant, actually find out what this company does from its website?*
- **The bot never breaks character.** It never mentions EPYC and never critiques the site it was built from. All critique lives in the report.
- **The report is evidence, not opinion.** Every line quotes or counts something from their own pages. No adjectives we cannot point at.
- **Proof points come from the marketing repo's `assets/` only.** Accel Atoms AI Chatbot is the relevant credential. Check the `public` flag in `assets/clients.csv` before naming any client on the page.



- ~~**CI never runs on these PRs.**~~ **Fixed.** `.github/workflows/ci.yml` now triggers on `[main, production]`, runs on Node 22, and has a `pnpm test` step.
- **SSE through OpenNext is unproven here.** Nothing in this repo streams a response today. Spike a throwaway route that emits three events over three seconds and confirm the client sees them arrive separately in a deployed preview — not just `next dev`. 30 minutes, before step 3 depends on it. If buffered, degrade to a determinate progress bar; nothing else changes.
- **Subrequest ceiling is plan-dependent** — 1000 on paid Workers plans, 50 on Free. Queues and D1 are already in use, which implies a paid plan, but confirm before the 22-subrequest crawl relies on it.
- **New UI must be checked against existing primitives first.** Per `CLAUDE.md`: run `find components/ui components/sections -name "*.tsx" | sort` and scan `DESIGN.md` §10 and §12 before writing any chat component. `Button`, `Textarea`, `Field`, `Section`, `Container`, `Pill` and `Reveal` all already exist and cover most of this page.
- **A pruning job for unclaimed sessions** is not scheduled by anything today. `tool_pages` for sessions with no interest capture is demo exhaust and should be deleted on a schedule — a Cron Trigger, or a delete-on-write sweep in the crawl route until one exists.
