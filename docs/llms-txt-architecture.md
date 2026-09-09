# llms.txt Generator — Architecture

**Companion doc:** [`llms-txt-plan.md`](./llms-txt-plan.md) (scope, order of work, decisions)
**Predecessor:** [`ai-chatbot-architecture.md`](./ai-chatbot-architecture.md) — this tool is the second consumer of the crawl engine that document specified.

This document explains **why the system is shaped the way it is**, what was
rejected, and what the second tool proved about the first one's design.

---

## 1. The whole system

```
Browser  /tools/llms-txt-generator
   │
   │ 1. POST /api/tools/crawl  { url, tool: 'llms-txt' }      (SSE — live progress)
   ▼
Next.js Worker ──── robots → sitemap → ≤20 pages ────────────► prospect site
   ├──► D1  tool_sessions / tool_pages / tool_counters
   └──► D1  tool_sessions.diagnosis_json   (written for the chatbot; unread here, §2.4)
   │
   │ 2. POST /api/tools/llms-txt/generate  { sessionId }      (plain JSON)
   ▼
Next.js Worker ──► corpus from D1 ──► OpenRouter (one structured call)
   │              ──► render to markdown
   ▼
File + "we could not describe N of M pages" + rebuild CTA
```

Two round trips. One model call. No new table, no new column, no migration.

---

## 2. The four calls that carry this design

### 2.1 The crawl route is generalised, not duplicated

`POST /api/tools/chatbot/crawl` already did exactly what this tool needs. It was
moved to `POST /api/tools/crawl` and takes `tool` in the body.

The alternative was a second 190-line route that differed in one string literal.
That is the shape bugs live in: the redirect re-validation, the deadline
accounting, the single-`close()` discipline on the SSE controller and the
"copy the diagnosis on cache reuse" fix would all have needed maintaining twice,
and the second copy would have drifted the first time one of them was patched.

Nothing in that route was chatbot-specific. It stores `scoreDeterministic(...)`
on the session for whoever asked, so there is no branch on `tool` anywhere inside
it — the parameter reaches `createSession` and stops. This tool no longer renders
those scores (§2.4), but the crawl still writes them, because the chatbot reads
the same column and the write is free.

**Crawl reuse crosses tools deliberately.** `findRecentCrawl` keys on host and
status, never on `tool`, so running the chatbot and then this tool on the same
domain reads the site once. The corpus is the same text either way; pretending
otherwise would mean crawling someone's server twice to produce two views of one
read.

### 2.2 Descriptions are generated once, structured, and never trusted blind

One `completeJson` call on `SCORING_CHAIN` (Nemotron 3 Super free, falling back
to Lightning free). It returns a flat list, not a nested document:

```json
{ "name": "…", "summary": "…", "overview": "…",
  "pages": [{ "url": "…", "section": "Services", "description": "…", "evidence": "…" }] }
```

Flat because grouping is deterministic and a model that has to close nested
structures correctly under a token limit fails in ways that cost a retry.
Grouping into sections happens in our code, where it cannot be malformed.

`overview` is the part that makes this a document rather than a link dump: two
or three factual sentences that render between the blockquote and the first
heading, where the convention reserves free-form context. An assistant reads it
before it opens a single link, and a file without it tells the assistant only
which pages exist — which is what the sitemap already said.

Five guards on the output, in `buildDoc`, and each exists because of a specific
failure this kind of call has:

1. **URLs are matched against the corpus.** A page the model invented is
   dropped. The file goes on someone's real website; a 404 in it is worse than a
   missing line.
2. **Titles come from `tool_pages`, never from the model.** There is no reason
   to let it rewrite a fact we already hold.
3. **A description with no `evidence` quote is dropped.** This is the same
   discipline as `diagnosis.ts` — the model must point at the words it based the
   sentence on. Without it, a model handed a thin page writes a confident
   sentence out of the URL slug, and a tool whose entire pitch is "your pages do
   not say what they are" would be inventing the copy that proves the opposite.
4. **The quote has to actually be in the page.** Guard 3 originally checked only
   that the field was non-empty, which makes `evidence` a formality a model
   satisfies by writing a sentence it likes the sound of — the same guess the
   empty description was meant to prevent. The check is verbatim containment
   after normalising case, punctuation and whitespace, falling back to 80% of the
   quote's words being present, because models routinely join two halves of a
   real sentence or drop a word from the middle. Below that bar it is a
   paraphrase, and a paraphrase is a guess.
5. **Every figure has to appear in the source text.** Each description, the
   summary and every overview sentence are checked for digits the site never
   wrote; whatever fails is dropped, sentence by sentence for the overview so one
   bad number does not cost the whole thing. `10,000` matches `10000` — commas
   are stripped from both sides. It is a substring test, so a figure that appears
   elsewhere on the page passes: this is a floor under invention, not a proof of
   relevance, and a hallucinated "300+ clients" in a file a customer publishes is
   the failure with the longest tail.

Two smaller rejections ride along: a description that only restates the page
title, and one under five words. Both are bullets that say nothing the link text
did not.

Guards 3 to 5 are what make the headline number real. **The pages we drop are
the finding.** Everything else in this tool is a giveaway wrapped around it.

### 2.2.1 Order is ours, and archive furniture never reaches the file

Two deterministic passes bracket the model call, and neither asks it anything.

`selectPages` runs first. It drops paginated archives, tag and category indexes,
author pages, on-site search and feeds — navigation furniture that holds no
content of its own and churns, so `/blog/page/7` is stale the week after it is
written — and collapses `/about` against `/about/`, which the crawl fetched as
two pages. What survives is sorted by `urlScore`, the same ranking that chose
what to crawl, so the corpus the model reads also leads with the pages that
matter.

`urlScore` was lifted out of `rankUrls` in `lib/crawl/sitemap.ts` for this —
exported, one function, both callers. Which page is worth reading first and
which is worth listing first are the same question.

The renderer then orders sections — About, Services, Products, Pricing, Work,
Contact, anything unrecognised, `Optional` last — rather than printing them in
whatever order the model emitted. A reader under a context limit reads top-down
and may stop early, so the sections that answer "who is this and what do they
sell" go above the ones that answer "what else is on the site".

**Excluded is not skipped.** An archive URL is not evidence that the site fails
to describe itself, so counting it in the finding would inflate the one number
this tool exists to report. The route returns both, and read = described +
skipped + excluded holds on screen.

### 2.3 The generated file is never stored

It lives in React state for the session, and download is a client-side `Blob`.

Storing it would mean a migration (`ALTER TABLE tool_sessions ADD COLUMN
output_json`), a deploy-day checklist item, a decision about retention, and a
row that goes stale the moment the customer edits a page. Regenerating costs one
free model call.

The cost is honest and small: a refresh loses the file and the visitor presses
the button again. The upgrade path, if anyone ever asks to have it emailed, is
that one column — and the render function is pure, so nothing else moves.

### 2.4 The scored panel was built, then cut

`tool_sessions.diagnosis_json` holds structure, crawlability and specificity,
written when the crawl finishes. The generate route read that row and returned
it, and the result screen rendered the three as `ScoreRow` cards. The reuse
worked exactly as `ai-chatbot-architecture.md` predicted: `site-checks.ts`
produced this tool's whole scored panel without an edit.

**It was removed anyway, for an editorial reason rather than a technical one.**
Against real sites the three cards read *Well structured*, *Passes*, *1 vague
claim* — all true, all agreeable, and sitting directly beneath the one line that
says we could not describe six of their pages. Three reassuring verdicts under a
single uncomfortable one do not add up to a stronger report; they give the
reader somewhere comfortable to land and let them leave without the finding. The
page now says one thing.

Nothing was deleted from the pipeline. The crawl still writes the checks,
`lib/tools/site-checks.ts` is untouched, `components/tools/score-row.tsx` still
exists, and the chatbot's full report still renders all three — where they
belong, because there they explain *why the bot answered badly* rather than
decorating a file. Restoring them here is one field on the response and one
`<ScoreRow>` grid.

The route therefore returns the file, the stats and the skipped pages, and
re-reads nothing: computing a critique for a screen that does not exist is work
with no consumer.

What this tool has never done is call `/api/tools/chatbot/diagnosis`. That route
kicks off chatbot-specific scoring — Answerability against the ten buyer
questions — in the background. Calling it from here would spend a model call on
a report nobody is going to read.

---

## 3. Rejected alternatives, with grounds

| Rejected | Why |
|---|---|
| **A second crawl route under `/api/tools/llms-txt/crawl`** | 190 lines duplicated to change one string. Four subtle correctness fixes already live in that file (redirect budget, deadline accounting, single controller close, diagnosis copy on cache hit); a fork means maintaining them twice and drifting on the first patch. |
| **Storing the generated file in D1** | A migration, a retention question and a staleness problem, to avoid one free model call on refresh. See §2.3. |
| **Descriptions without a model — meta descriptions or first-paragraph truncation** | `extract.ts` does not capture meta descriptions, and truncated body text produces "Home - Acme Acme is a leading provider of…" which is precisely the vague copy this tool is meant to expose. The model call earns its place here; it is the only step that does. |
| **A second scoring pass for the critique** | Never needed: the checks were already computed and stored at crawl time, so re-scoring would have been a model call to re-derive facts sitting in a column. Moot now that the panel is cut (§2.4). |
| **Nested section structure from the model** | Grouping is deterministic. Asking a model to emit nested JSON under a token ceiling buys nothing and adds a class of parse failure we would then have to retry. |
| **Sharing the chatbot's idle screen** | The two tools ask different questions, give away different things, and need different three-step explainers. Sharing it would mean four copy props and a component that reads as a template. Only the crawl log is genuinely identical, and only the crawl log was lifted. |
| **SSE on the generate route** | The crawl streams because twenty seconds of silence loses a stranger. Generation is one call; a spinner covers it. Streaming it would mean the SSE controller discipline, a second client reader, and partial-JSON rendering, to save a visitor from a five-second wait they already expect. |
| **`llms-full.txt` in phase one** | About 20 lines and free, but it is the half of the convention with the least evidence anyone reads it. Deferred with a named upgrade path rather than built on spec. |

---

## 4. Route contracts

### `POST /api/tools/crawl` → `text/event-stream`

Unchanged from the chatbot tool except for one optional field.

```jsonc
// request
{ "url": "acme.com", "force": false, "tool": "llms-txt" }  // tool defaults to "chatbot"
```

Events: `status`, `page`, `done`, `error`. Validation and cap failures come back
as plain JSON with a 4xx, not as a stream — the client checks `content-type`
before reading.

### `POST /api/tools/llms-txt/generate` → `application/json`

```jsonc
// request
{ "sessionId": "<uuid>" }

// response
{
  "ok": true,
  "host": "acme.com",
  "file": "# Acme\n\n> …",              // the rendered llms.txt, ready to paste
  // read = described + skipped + excluded; `pages` is what was considered
  "stats": { "read": 20, "pages": 17, "described": 12, "skipped": 5, "excluded": 3 },
  "skipped": [{ "url": "/platform", "title": "Platform" }]
}
```

Guards, in this order: session exists → status is `ready` → `OPENROUTER_API_KEY`
present → both caps checked → both caps consumed.

The order is load-bearing twice over. The key check comes **before** any cap, so
a 503 from our own misconfiguration cannot cost the visitor one of their three
generations. And both caps are checked before either is consumed — the shape
`issueCode` uses in `lib/tools/chatbot/verification.ts`, for the same reason: a
request rejected by one limit must not burn an allowance from the other.

| Cap | Key | Limit |
|---|---|---|
| Per session | `llms-gen:<sessionId>` | 3 per UTC day |
| Across everyone | `global-llms-txt` | 100 per UTC day |

The global one is the backstop on the shared OpenRouter account quota — see
`llms-txt-plan.md` → Limits for why a per-visitor cap cannot do that job. Both
rejections are a 429; a missing key is a 503, matching every other tool route.

---

## 5. What the second tool proved about the first

The chatbot architecture claimed `lib/crawl/` was written as a shared module
with no route coupling, and that `site-checks.ts` was tool-agnostic on purpose.
Both claims are now tested rather than asserted:

- `lib/crawl/` was imported by a second consumer **without a single change.**
- `site-checks.ts` produced this tool's whole scored panel with no edit — which
  was then cut for editorial reasons, not technical ones. The reuse worked; the
  screen did not. See `llms-txt-plan.md` → The report.
- `tool_sessions.tool` already permitted `'llms-txt'`, so the second tool shipped
  with **no migration** — the one part of the deploy that is manual in this repo.

The claim that did not survive contact is smaller and worth naming: the crawl
route was written as `app/api/tools/chatbot/crawl` when nothing inside it was
chatbot-specific. Generalising it later cost a `git mv` and six lines, which is
cheap — but the honest lesson is that the *route* should have been named for
what it does, the way the module underneath it already was.

The third consumer, the Website Grader, is now almost entirely
`site-checks.ts` plus a page.
