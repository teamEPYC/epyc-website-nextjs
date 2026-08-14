# AI Chatbot — Architecture

**Companion docs:** [`ai-chatbot-plan.md`](./ai-chatbot-plan.md) (scope, order of work, approvals) · [`ai-chatbot-tech.md`](./ai-chatbot-tech.md) (route contracts, SQL, prompts, build reference)

This document explains **why the system is shaped the way it is** — what runs where, what was rejected and on what grounds, and how phase one connects to the phase-two target without rework.

---

## 1. What the thing is

A lead-gen diagnostic that happens to use a chatbot. A visitor pastes their website address; we read up to 20 pages of it, build a chatbot from that text, let them ask 8 questions, then show a scored report on why the bot struggled — framed as **their content problem**, evidenced from their own pages.

The conversion is the **website rebuild project**, not a chatbot build. Every surface routes to the rebuild conversation. The bot is best-effort: no sandbagging, no scolding panel alongside the chat. The critique lives in the report, after the conversation, never in the bot's voice.

---

## 2. Phase-one system shape

Everything runs inside the existing Next.js app on Cloudflare Workers. One new dependency family (AI SDK + OpenRouter provider), one new migration, no new services.

```
Browser  /tools/ai-chatbot
   │
   │ 1. POST /api/tools/chatbot/crawl        (SSE — live progress)
   ▼
Next.js Worker ──── fetch robots.txt ─────────► prospect site
   │            ──── fetch sitemap(s) ────────►
   │            ──── fetch ≤20 pages ─────────►
   │            extract text, truncate
   ├──► D1  tool_sessions / tool_pages / tool_counters
   │
   │ 2. POST /api/tools/chatbot/message      (SSE — streamed tokens)
   ▼
Next.js Worker ──► corpus from D1 + history ──► OpenRouter (Lightning free)
   │                                             └─ paid fallback on 429
   │ after message 1: waitUntil(score) ────────► OpenRouter (one JSON call)
   ├──► D1  tool_sessions.diagnosis_json
   │
   │ 3. GET /api/tools/chatbot/diagnosis     (reads the stored JSON)
   │ 4. POST /api/tools/chatbot/interest     (email capture — phase-two gate)
   ▼
Report panel + two CTAs
```

**Three architectural calls carry this design.**

### 2.1 The corpus goes in the context window. No retrieval layer.

At 20 pages × ~4k tokens the whole site is roughly an 80k-token block, which fits one request. A vector store buys nothing at that size: it adds embeddings, an index, a query-time embed call, and a chunking strategy, in exchange for savings measured in cents on a single session.

**Confirmed, not assumed** (OpenRouter live model list, 14 Aug 2026): `nvidia/nemotron-3.5-lightning:free` carries a **1,000,000-token context window** at $0 in / $0 out. This was the load-bearing assumption of the whole design and it holds with 12× headroom.

The fallback chain is free at every tier — Lightning `:free` → Super `:free` (1M window) → Ultra `:free` (512K), with a paid model configured but disabled behind a flag. Phase one therefore carries **no per-message cost**, which is why the caps in §4 are described as abuse control rather than budget control. The open risk is not price but quota shape: if OpenRouter meters free usage per *account* rather than per model, the cascade is decorative and the paid flag becomes tier 4. Test with concurrent sessions before launch.

It also *costs* quality. Chunked retrieval hands the model fragments; "what do you do" and "what does it cost" answer better from whole pages. Retrieval here would be a cost optimisation sold as a quality one.

Retrieval becomes correct at tenant volume — see §5.

### 2.2 The crawl runs inline in the route handler, streamed as SSE. No queue, no second worker.

The source spec routed the crawl through `CRAWL_QUEUE` → `workers/tool-crawler` → poll for status. That is the same asynchronous shape the spec itself rejected Cloudflare AI Search for ("indexing runs as an async sync job; the demo needs an answer in seconds").

Doing it inline deletes: one worker, one queue declared six times across two configs, a `queued|crawling|ready|failed` state machine, and a polling endpoint that never made it into the route list. It also buys honest progress copy — "reading /pricing" instead of a spinner.

It costs nothing in headroom: ~22 subrequests, almost all I/O wait; the CPU work is HTML→text over ≤500KB × 20 pages, comfortably inside the Workers budget. A hard 20-second wall-clock deadline bounds the worst case — 12 pages of content beats one page that never loads.

Two dependencies worth naming rather than assuming. The **subrequest ceiling is 1000 on paid Workers plans and 50 on Free** — this repo already uses Queues and D1, which are paid-plan features, so 1000 applies; confirm before relying on it. And **SSE must survive the OpenNext Cloudflare adapter**. Streaming responses are supported, but this is the one assumption that would change the UX if wrong, so it gets a 30-minute throwaway-route spike before step 3 depends on it. If responses turn out to be buffered, the fallback is a determinate progress bar — the architecture is unchanged, only the "reading /pricing" polish is lost.

**Security falls out of this for free.** `global_fetch_strictly_public` is set on the main worker's `wrangler.jsonc` and blocks fetches to private and internal addresses. Doing the crawl in a separate worker would have meant setting that flag there too — the sibling precedent (`workers/contact-webhook/wrangler.jsonc`) ships `nodejs_compat` only. Doing it inline means the primary SSRF mitigation is already where the fetching happens.

### 2.3 The report is scored quietly after message one.

Three of the five dimensions — Structure, Crawlability, Specificity — are deterministic from crawl metadata and cost nothing. Two — Answerability, Coverage — need judgement, and they run as **one** structured JSON call, not eleven.

That call fires in the background via `waitUntil` on the first message and stores its result on the session. By the time the visitor hits the cap at message 8, the panel renders instantly instead of stalling ten seconds at the exact moment we ask for the click. Gating on first message rather than on crawl completion means visitors who bounce cost nothing.

If the model call fails, the three deterministic scores still render. A partial report converts; an error state does not.

**The empty-corpus path needs its own trigger.** A site that yields almost no readable text skips the chat entirely and goes straight to the report — which means message one never happens, and a report scored on message one would never be scored at all. For that path, scoring runs at the end of the crawl instead. Answerability is 0 of 10 by construction (there is no text to answer from) so no model call is needed, and the report leads with the crawlability blocker, which is the finding that matters anyway.

**One judgement call left open on the model.** Lightning is a small MoE — 3B active of 30B — which is the right shape for "answer from the text in front of you". The scoring call is a different job: judgement across the whole corpus, producing the headline number shown to a prospect, once per session rather than eight times. That is the one call where paying is cheap and being wrong is expensive. Build on Lightning, compare against a larger model across ten real sites before launch, and spend the cents if the gap is visible.

---

## 3. Rejected alternatives, with grounds

| Rejected | Why |
|---|---|
| **Cloudflare AI Search (AutoRAG) with its own crawler** | Website data source is documented as "a domain you own" — arbitrary prospect URLs fall outside intended use. Indexing is async. Workers Free caps at 500 pages/day and 100 instances/account; a public demo would want one instance per visitor URL. `blocked_by_robots_txt` and `subdomains_not_allowed` would fire constantly against third-party sites. *(AI Search is the right tool for a chatbot on epyc.in itself — own domain, one instance, sitemap already published. Separate project.)* |
| **AutoRAG fed from R2 instead of its own crawler** | Kills two of the four objections above, but not the async one. Under R2 it is still a job, not a function call: upload markdown, then wait for AutoRAG to notice, chunk, embed, index. The demo's promise is "paste a URL, talk to your bot". |
| **Crawl4AI (Python + Playwright + Chromium)** | Strongest crawler of the options, and the right tool for a crawling product. Cost is architectural: cannot run on Workers, so a second runtime, a second deploy pipeline, a second thing to monitor, and an always-on container (512MB–1GB idling) to serve bursty demo traffic. Critically, `global_fetch_strictly_public` does not reach into a container, and a headless browser is a materially larger SSRF surface than `fetch` — it loads subresources, iframes and redirects. **Phase one takes arbitrary URLs from anonymous visitors, which is the worst possible threat model for that.** In phase two the crawl target is a domain someone claimed. The security argument for plain `fetch` is strongest exactly where we are now. |
| **Durable Object for rate limiting** | One atomic D1 statement gives the same guarantee (reject before any paid call, no race across concurrent Workers). We need three counter scopes — `global-messages`, `ip:<hash>`, later `embed:<key>` — and a DO-per-chatbot covers only the third; D1 would be needed anyway. One mechanism, not two. Revisit at ~100× the planned volume. |
| **The Vercel Next.js chatbot template** | A full multi-user product: assumes Vercel OIDC and Blob, ships Auth.js and Neon Postgres for logged-in history when this tool is anonymous and D1 is already bound, routes models through AI Gateway when the model choice is OpenRouter-specific, and carries artifacts, document editing and file upload that are all unused. It has no crawl layer, which is the actual hard part. The one reusable piece is the AI SDK, installed on its own. |
| **`@assistant-ui/react` as specced ("composes into the existing shadcn/ui")** | This repo has no shadcn/ui. It has its own system: cva + Tailwind v4 `@theme` tokens documented in `DESIGN.md`, with `cn()` extended so custom `text-h2`-style utilities do not collide. Dropping assistant-ui in unmodified imports a second design vocabulary plus Radix plus shadcn CSS variables that do not exist here. **The restyle onto EPYC tokens is real work and is budgeted as such — it is why step 6 is the largest step.** If that step needs cutting, hand-building the thread is the lever: one thread, no history, no tool calls, no uploads. |
| **JS-rendered sites: render them properly** | Detect and score the failure instead. A site an AI cannot read *is the finding* — the most on-message thing the tool can say. Cloudflare Browser Rendering is tier two if drop-off data shows SPAs are a large share of submissions; it stays on Workers and is pay-per-use. Crawl4AI only if bot-blocking, rather than JS rendering, turns out to be the real blocker. |

---

## 4. Data model, and why four tables

Full DDL in [`ai-chatbot-tech.md`](./ai-chatbot-tech.md#d1-schema).

| Table | Holds | Note |
|---|---|---|
| `tool_sessions` | one row per demo session, incl. `diagnosis_json`, `transcript_json`, `email` | `diagnosis_json` on the session is what makes "score once, render instantly" possible |
| `tool_pages` | extracted corpus, one row per page | pruned on a schedule; unclaimed sessions are demo exhaust |
| `tool_counters` | atomic daily counters | three scopes today: `global-messages`, `ip:<hash>`, and per-session message count |
| `tool_interest` | email captures | merges the spec's `tool_model_interest` with the phase-two embed waitlist: `kind` = `'embed'` \| `'model:<name>'` |

The spec's fifth table, `tool_embeds`, ships **with** the widget, not before it.

Two corrections to the spec's own SQL, both load-bearing:

- **The counter statement is broken as written.** `UPDATE ... WHERE n < ?` affects zero rows when no row exists for today, and the spec reads zero rows as "cap hit". Every counter would report exhausted on the first request after midnight. The `INSERT ... ON CONFLICT DO UPDATE ... WHERE n < ?` form keeps the single-statement atomicity and is correct on a cold day.
- **`ip_hash` needs a secret salt.** IPv4 is 2³² — a bare hash is a lookup table, not anonymisation. HMAC with a wrangler secret. This matters because the privacy line goes to a lawyer.

---

## 5. The phase-two target, and why it is deferred

The proposed phase-two architecture — self-hosted Crawl4AI → R2 → Cloudflare AI Search (AutoRAG) → Vectorize, generation on OpenRouter, nightly hash-diff re-crawl — is a good target. It is a **multi-tenant chatbot product's** architecture, and every component in it solves a phase-two problem:

| Component | Problem it solves | Exists in phase one? |
|---|---|---|
| Vectorize / retrieval | per-message token cost at tenant volume | No — one session, 8 messages |
| AutoRAG | managed indexing of a growing corpus | No — and its async delay actively breaks the demo |
| R2 | durable corpus for a persistent widget | No — D1 holds it, pruned |
| Crawl4AI | SPA sites a paying customer needs working | No — that failure is the diagnostic's best finding |
| Nightly hash-diff re-crawl | staleness on someone's live site | No — the session lasts minutes |
| Durable Object | per-chatbot limits | No — there are no chatbots yet |

Workers, D1 and OpenRouter are in both. That intersection **is** phase one's stack.

### How the two connect

The crawl runs once and feeds two consumers with different needs. Phase two attaches a limb; it does not replace one.

```
crawl output (clean text)
   ├──► D1  ──► corpus in context ──► demo chat (instant)
   │          └──► diagnosis scoring
   └──► R2  ──► AutoRAG ──► Vectorize ──► embed chat (retrieval)
        ▲
        └── only on embed claim
```

Three things fall out of that split for free: unclaimed sessions never touch AutoRAG (most visitors bounce, so we never pay to embed, store or index them, and the 100-instance ceiling stops being a scaling wall); the indexing delay lands between *claiming* an embed and the widget's first real visitor, where nobody is waiting; and the diagnosis stays on raw text beside the retrieval layer rather than behind it — four of the five dimensions cannot be computed from chunks at all.

### Promoted into the phase-two target as written

- **Content-hash diff on the nightly re-crawl, preserving IDs so embed codes never break.** Better than the spec's "manual recrawl is enough for launch", and cheap.
- **50 messages/day per embed** over the spec's 20, which the spec itself flagged as too low for a site with real traffic.

### Carried as known risks for phase two

- **Neuron budget is not fully escaped.** Generation moves to OpenRouter, but AutoRAG embeds the *query* on every `search()` using Workers AI. Neurons then scale with message volume, on the same shared account budget, failing all-tenants-at-once.
- **One AI Search instance, not one per chatbot** — a folder per tenant in one bucket, filtered at query time. That converts a hard 100-tenant ceiling into a filtering problem, and makes **tenant isolation the top security risk in the system**: a filter bug serves customer A's content from customer B's bot, on B's live site. That needs a test, not a code review.
- **Crawl4AI must be scale-to-zero and staggered.** Crawls are bursty — onboarding plus a nightly cron. An always-on Chromium container idling to serve that pattern is the spec's main cost objection and is avoidable. All tenants at once is a thundering herd on our own crawler and an impolite one on their sites.
- **Egress must be restricted at the network level** around any container — firewall or VPC rule blocking private ranges — plus private-IP blocking, DNS-rebind protection and redirect limits inside it. `global_fetch_strictly_public` does not apply there.
- **Third-party liability.** A bot on a client's live site answers their real customers. The system prompt's refusal to invent facts stops being a sales mechanic and becomes a liability question. Terms and a privacy line are launch blockers for the widget.

The gate is the email count on the "want this on your site?" button: about a day of work, and it produces the same go/no-go signal that weeks of widget build would — the technique the spec already trusts for the paid-model question, applied one level up.

---

## 6. What this reuses from the existing repo

Nothing new at the platform level.

| Existing | Reused for |
|---|---|
| D1 binding `DB` + `db/migrations/` | corpus storage, counters, captured emails |
| `app/api/contact/route.ts` | zod validation and route shape (validate → parse → write D1 → respond) |
| `global_fetch_strictly_public` in `wrangler.jsonc` | SSRF protection on the inline crawler |
| `components/ui/` + `DESIGN.md` tokens | the entire chat and report UI |
| OpenNext deploy pipeline, staging/production envs | deployment, unchanged |
| Manual `wrangler d1 execute --remote` convention | the new migration is a deploy-day checklist item, not automatic |

The crawl engine written here is shared with the planned **Website Grader** and **llms.txt Generator**. Build it once with those two consumers in mind — a small, boring `lib/crawl/` module with a clean function boundary, not a route-local closure.
