# llms.txt Generator — Execution Plan

**Status:** building · **Date:** 9 September 2026 · **Route:** `/tools/llms-txt-generator`
**Companion doc:** [`llms-txt-architecture.md`](./llms-txt-architecture.md) (system shape, rejected alternatives, route contracts)
**Predecessor:** the AI chatbot tool — [`ai-chatbot-plan.md`](./ai-chatbot-plan.md) · [`ai-chatbot-architecture.md`](./ai-chatbot-architecture.md)

---

## What the thing is

A visitor pastes their website address. We read up to 20 pages, write them a
valid `llms.txt`, and show them the file plus the pages we could **not**
describe.

The file is the giveaway. The pages we could not describe are the pitch.

Same mechanic as the chatbot tool, different wrapper: there, the proof is
watching a bot fail to answer a buyer's question; here, it is watching a model
fail to write one honest sentence about a page. Both findings say *your pages do
not state plainly what they are*, and both route to the same conversation — the
rebuild.

---

## What llms.txt actually is

A convention proposed by Jeremy Howard (Answer.AI) in September 2024. One
markdown file at the site root, structured for a model with a small context
window:

```markdown
# Company Name

> One-line summary of what this company is.

## Services
- [Website Design & Development](https://…): Strategy to launch on Webflow, Framer, or custom code.

## Optional
- [Blog](https://…): Long-form articles.
```

H1 is the name. The blockquote is the summary. H2s are sections. Every link
carries a description after a colon. `## Optional` is a reserved heading meaning
*drop this section if context is tight*.

It answers a different question from the files next to it:

| File | Answers |
|---|---|
| `robots.txt` | may you crawl this |
| `sitemap.xml` | every URL that exists — flat, no meaning |
| `llms.txt` | which pages matter, what each one says, in reading order |

**Adoption, honestly.** It is not a standard — no W3C, no IETF, and no major
model provider has confirmed reading it at crawl or inference time. Google's
search team has publicly compared it to the keywords meta tag. Anthropic,
Stripe, Perplexity, Cloudflare and every Mintlify-hosted docs site publish one
anyway.

So the file is a cheap bet with an unproven payoff, and **we do not sell it as
more than that.** The tool's value is not the download; it is that writing an
llms.txt forces a site to say plainly what it does, and most sites cannot. That
failure is the product.

**Note the overlap with what this repo already ships.** `middleware.ts` already
serves a markdown representation of every page under `Accept: text/markdown`
(see CLAUDE.md → Markdown for Agents). That is per-page and arguably stronger
than an index file. llms.txt is the index-level complement, not a replacement,
and the tool should never imply otherwise.

---

## How it works

1. Check the URL and the daily limits, read `robots.txt` and the sitemap, fetch
   up to 20 pages, extract the text. Progress streams to the screen. **Identical
   to the chatbot tool — the same route, the same module.**
2. One model call reads the corpus and returns a name, a summary, and one
   description per page, each tagged with a section.
3. We render that to a valid `llms.txt` and show it, alongside the pages that
   came back without a usable description.
4. Two buttons: copy the file, or talk about a rebuild.

---

## The report

There is no second scoring pass, and no scored panel. The report is one finding:

| Finding | Where it comes from | Cost |
|---|---|---|
| **Pages we could not describe** | the generation call itself — a page with no evidence gets no description | free, it is the same call |

**The scored checks were built and then cut.** Structure, Crawlability and
Specificity all rendered here, read for free from the row the crawl already
writes. They came out against real sites as three cards reading *Well
structured*, *Passes*, *1 vague claim* — true, agreeable, and directly under the
one line that says we could not describe six of their pages. They softened the
only finding that matters and gave a reader somewhere comfortable to land.

So the generate route no longer returns them and the result screen no longer has
that section. Nothing was deleted from the pipeline: the crawl still writes them
to `tool_sessions.diagnosis_json`, `lib/tools/site-checks.ts` is untouched, and
the chatbot's full report still renders all three. Putting them back is one
field on the response and one `<ScoreRow>` grid — see the git history for this
file.

This settles open decision #2 below, in the direction of cutting more than it
proposed.

**The headline number is "we could not describe N of your M pages."** It is
earned rather than asserted: the model is required to quote the words it based
each description on, and a description with no quote behind it is dropped.

---

## Order of work

| # | Step | Scope | Done when |
|---|---|---|---|
| 1 | Generalise the crawl route | ~6 line diff plus a `git mv` | Both tools POST the same route; the chatbot is unchanged |
| 2 | Generation | one model call, corpus → structured doc | A real site returns a name, a summary, and honest descriptions |
| 3 | Rendering | structured doc → spec-valid markdown | `render.test.ts` passes; `## Optional` sorts last |
| 4 | The route | `POST /api/tools/llms-txt/generate` | Returns the file, the stats, and the pages it could not describe |
| 5 | Shared crawl log | lift `CrawlingScreen` out of the chatbot tool | Chatbot renders identically; both tools import it |
| 6 | The page | three screens, bespoke idle copy | Matches `DESIGN.md`, works at 375px |
| 7 | Launch | noindex off, sitemap entry, markdown spot-check | Staging runs a full session against a real site |

Steps 2 and 6 are the bulk. Everything else is wiring.

**The URL screen is deliberately not shared.** The chatbot's idle screen asks
"can an AI read your website?" and explains a bot you keep. This one asks a
different question and gives a different thing away, so it gets its own copy and
its own three-step explainer. Only the crawl log is genuinely identical, and
only the crawl log is lifted.

---

## What this reuses

Nothing new at the platform level, and **no migration**.

| Existing | Reused for |
|---|---|
| `lib/crawl/` | the whole read — written route-free for this consumer |
| `app/api/tools/crawl` | the crawl route itself, now tool-agnostic |
| `lib/tools/session.ts` | sessions, corpus storage, 24h crawl reuse |
| `lib/tools/counters.ts` | per-IP daily cap, generation cap |
| `lib/tools/models.ts` | `completeJson` on the free Nemotron chain |
| `lib/tools/sse-client.ts` | reading the crawl stream |
| `tool_sessions.tool` | already `CHECK (tool IN ('chatbot','grader','llms-txt'))` |

`db/migrations/0003_tool_sessions.sql` anticipated this tool a month ago. The
`llms-txt` value is already legal in the CHECK constraint, so there is nothing
to apply on deploy day.

**Crawl reuse is a free win.** `findRecentCrawl` keys on host, not tool, so a
visitor who ran the chatbot on their site an hour ago gets an instant llms.txt,
and vice versa.

---

## Limits

20 pages per site · 500 KB per page · 20 second crawl · 3 sessions per visitor
per day · 3 generations per session · **100 generations a day across everyone**.

Same crawl caps as the chatbot, same atomic counter mechanism, same free model
tiers. The per-session cap exists because a client can re-POST the same session
id in a loop.

**The global cap is the one that is not merely tidiness.** Per-visitor limits
cannot protect a shared account quota, and OpenRouter meters free usage per
*account* rather than per model (`ai-chatbot-plan.md` → Checks first, #1) — so
this tool and the chatbot spend the same allowance. A generation is also a
heavier call than a chat turn: the whole corpus in, 3000 tokens out. Without a
global backstop, a script rotating IPs through the generator exhausts the quota
and takes the chatbot down with it.

It gets its own key (`global-llms-txt`) rather than sharing the chatbot's
`global-messages`: the quota is shared but the diagnosis should not be, and
neither tool should be able to starve the other outright. 100 here plus the
chatbot's 200 stays inside the ~1000 requests/day the funded account allows.

**Each tool has its own per-visitor bucket.** The counter key is
`ip:<tool>:<hash>`, so one visitor gets 3 crawls a day *per tool*, not 3 across
all of them.

The crawl route is shared, which made a single `ip:<hash>` key the tempting
default — and wrong. Under it the first tool a visitor tried spent the allowance
for every other one, so someone who ran the chatbot on their site would find
this generator already exhausted, refused by a limit they had not knowingly
used. A shared crawler is not a reason to share a customer-facing allowance.

Corpus reuse still crosses tools, and should: `findRecentCrawl` keys on host, so
running both tools on one domain reads that site once. That is politeness to the
prospect's server, which is a property of the crawler — unlike the visitor's
allowance, which is a property of the tool.

---

## Deliberately out of scope

- **`llms-full.txt`** — the sibling convention that inlines every page's full
  text. About 20 lines and free (it is `tool_pages.text` concatenated), but it is
  the half with the least evidence anyone reads it. Deferred, not rejected.
- **Publishing our own `/llms.txt` on epyc.in.** Dogfooding, and it makes the
  tool's pitch non-hypocritical. Separate job, roughly 30 minutes, built from
  `data/` plus the CMS.
- **Storing the generated file.** It lives in client state for the session. See
  the architecture doc for why.

---

## Decisions still open

1. **Sitemap and `noindex`.** The page ships `robots: { index: false }` like the
   chatbot tool did, and comes out of the index when the tool is real.
2. ~~**Whether Specificity belongs on this report at all.**~~ **Answered by
   looking at real output: no — and neither do the other two.** The whole scored
   panel is gone. See The report above.
3. **The privacy line covers this already** — we read other people's sites and
   store the text, which is the same processing the chatbot tool does under the
   same session table. No new category of data. Worth confirming with whoever
   owns that line rather than assuming.
