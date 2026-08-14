# AI Chatbot — Execution Plan (Phase One)

**Status:** for approval · **Date:** 14 August 2026 · **Route:** `/tools/ai-chatbot`
**Source spec:** *EPYC — AI Chatbot Demo* (decisions + reasoning)
**Companion docs:** [`ai-chatbot-architecture.md`](./ai-chatbot-architecture.md) (why the system is shaped this way) · [`ai-chatbot-tech.md`](./ai-chatbot-tech.md) (route contracts, schema, build reference)

---

## What we use

Everything runs in the existing website repo on Cloudflare. No new infrastructure.

| Piece | Role |
|---|---|
| Workers | the app and the API |
| D1 | sessions, page text, daily counters, captured emails |
| OpenRouter | `nemotron-3.5-lightning:free`, falling back to `nemotron-3-super:free` then `nemotron-3-ultra:free` — free at every tier |
| AI SDK | streaming chat, with the UI restyled to our design system |

**Verified 14 August 2026 against OpenRouter's live model list:** Lightning's free variant is $0 in / $0 out with a **1,000,000-token context window**. Roughly 20 pages of site text is about 80,000 tokens, so the whole site fits in one request with 12× headroom. This was the assumption the no-search-index decision rested on; it now checks out.

**The fallback is free too.** When the free tier is busy we step down to Nemotron 3 Super (free, same 1M window) and then Nemotron 3 Ultra (free, 512K — still six times what we need). All three are $0. A paid model stays configured but switched off, as break-glass only.

**Phase one therefore has no per-message cost at all.** One caveat to test: OpenRouter's free tiers may share a single account-wide quota rather than one per model, in which case stepping down between them buys nothing and the paid break-glass becomes real. Cheap to check, and listed below.

No search index, no embeddings, no second server, no job queue. At 20 pages the site text fits in one request, so retrieval would add moving parts without improving answers.

Three calls worth flagging:

1. **Lightning free over Nemotron 3 Ultra** — 1.2s vs 6s per answer, and free.
2. **Crawling inside the app** — live progress instead of a background queue.
3. **Quiet scoring** — the report is scored after message one so it appears instantly at the end.

---

## How it works

1. Check the URL and the daily limits, read `robots.txt` and the sitemap, fetch up to 20 pages, extract the text. Progress streams to the screen.
2. Site text goes into the model's context. Eight messages.
3. Show the report.
4. Two buttons: talk about a rebuild, or "want this on your site?" which captures an email.

---

## The report

Five scores, all from the spec, each backed by evidence from the visitor's own site. No number we cannot point at.

| Score | What it measures | Evidence shown |
|---|---|---|
| **Answerability** | How many of 10 standard buyer questions the site can answer | "4 of 10" plus the list it could not answer. **The headline number.** |
| **Coverage** | Whether pages exist for what they do, who they serve, pricing or process, proof, and contact | Names the missing page types |
| **Structure** | Whether headings are real and nested, or the page is one large block of markup | Heading depth per page |
| **Crawlability** | Sitemap present, robots not blocking, readable text without JavaScript | Pass or fail per check, naming the specific blocker |
| **Specificity** | Concrete facts against vague marketing copy | Quotes examples from their own pages |

Structure, Crawlability and Specificity are measured directly from what we crawled and cost nothing. Answerability and Coverage need judgement, so **one** model call answers both at once rather than eleven separate calls. If that call fails we still show the other three rather than an error.

**Which model scores it — now settled, for free.** Lightning is small and fast, which is right for the chat but thin for judgement across a whole site. Since the scoring call runs once per session rather than eight times, it runs on Nemotron 3 Super's free variant instead: a larger model, same 1M window, still $0. Compare the two across ten real sites before launch and keep whichever reads better.

Specificity is the borderline one. A phrase list gets most of the way, but if the quoted examples come out weak in testing it moves into the model call. Same call, one extra field, no extra cost. Decide after seeing real output.

---

## Phase one — order of work

| # | Step | Scope | Done when |
|---|---|---|---|
| 1 | Write the 10 buyer questions | needs approval, blocks step 5 | List agreed and committed to `data/` |
| 2 | Foundations | tables, URL safety, counter, 2 tests | Counter works on a fresh day and stops at its limit; validator rejects internal addresses |
| 3 | Reading websites | sitemap, fetching, extraction, progress | A real prospect site returns 15–20 pages of clean text |
| 4 | The chat | prompt, streaming, 8 message cap | The bot answers from the site and admits clearly when it cannot |
| 5 | The report | the five scores above | Two different sites produce visibly different, defensible scores |
| 6 | The page | largest step — five screens, mostly UI | Matches the approved wireframe, passes design review, works at 375px |
| 7 | Tracking and email capture | funnel events, drop-off, interest button | One session produces a clean event trail from paste to click |
| 8 | Launch | migrations, secrets, sitemap, privacy line | Staging runs a full session against a real site |

Steps 3 to 6 are the bulk of the work. Each step is reviewable on its own.

**The design is settled ahead of step 6.** A click-through wireframe of all five screens is built at `/tools/ai-chatbot` using the real design system, and the screen inventory, component list, and copy rules are written up in [`ai-chatbot-tech.md` → Design](./ai-chatbot-tech.md#design). Step 6 is then wiring, not deciding.

---

## Phase two — later, gated on the email count

| Item | Note |
|---|---|
| Embeddable widget | Keys tied to a domain, per-customer limits, terms |
| Nightly re-crawl | Content fingerprint, only re-reads changed pages, IDs stay stable so embed codes never break |
| Browser-based crawler | So JavaScript-heavy sites read correctly |
| Search-based retrieval | Object storage plus indexing, once many bots run all day and sending the whole site each time gets expensive |

Manual re-crawl ships in phase one as a button. Nothing in phase one needs undoing to reach any of this.

---

## Limits

20 pages per site · 500 KB per page · 20 second crawl · 8 messages per session · 3 sessions per visitor per day · 200 messages a day across everyone.

With every tier on a free model, these control rate limiting and abuse rather than cost — there is no per-message bill to protect. The caps exist to stop someone pointing a script at us and to stay inside OpenRouter's free-tier limits. 200/day is about 25 full demos; if the tool works, this is the first number we raise.

These limits are enforced in the app, not by convention: the crawler caps pages, bytes, depth, redirects and total time; the message route caps messages per session; and a single atomic database statement caps sessions per visitor per day and messages per day across everyone. A request that would exceed a cap is rejected before any model call is made.

---

## Decisions needed

1. **Approve demo now** — widget gated on the email button.
2. **Approve the 10 buyer questions** once drafted.
3. **Owner for the privacy line.** We read other people's sites, store that text, keep transcripts and collect emails. Launch blocker, not an engineering task.
4. **Confirm 200 messages a day** to start.

---

## Checks first

**Resolved (14 August 2026).**

- ~~Lightning's context window fits ~20 pages in one request.~~ Confirmed: 1,000,000 tokens against an ~80,000-token corpus.
- ~~Exact OpenRouter model IDs.~~ Confirmed: `nvidia/nemotron-3.5-lightning:free` and `nvidia/nemotron-3.5-lightning`.
- ~~Whether the AI SDK and the OpenRouter provider conflict with anything installed.~~ Confirmed compatible: `ai@7.0.65` + `@openrouter/ai-sdk-provider@3.0.0`, whose zod requirement is already satisfied by the version in this repo.

**Still open, and each is small.**

1. ~~**Whether the three free models share one quota.**~~ **Answered, and the answer is bad: yes.** OpenRouter meters free usage per *account* (`free-models-per-day`), so stepping from Lightning to Super to Ultra buys nothing — we hit it in testing and all three refused at once.

   Without credits the account gets about **50 free requests a day**, against a planned cap of 200 messages a day. **Adding $10 of credits raises it to 1,000 free requests a day** and still costs nothing per message. That $10 is a launch prerequisite. It is the cheapest item on this entire list and currently the one that stops the tool working.
2. **Live progress needs a 30-minute spike first.** The crawl streams progress to the screen through our Cloudflare deployment adapter. That should work, and the whole "read the site in the app" decision assumes it. Confirm it with a throwaway route before step 3 depends on it. If it turns out responses are buffered, the fallback is a plain progress bar — the architecture does not change, only the polish.
3. ~~**CI never runs on our pull requests.**~~ **Done** — it now triggers on `main` and `production`, runs the tests, and is on a current Node version.
