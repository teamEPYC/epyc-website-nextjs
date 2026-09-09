# YouTube Transcript Generator — Execution Plan

**Companion doc:** [`youtube-transcript-architecture.md`](./youtube-transcript-architecture.md) (why the system is shaped this way, rejected alternatives, risks)
**Predecessors:** [`ai-chatbot-plan.md`](./ai-chatbot-plan.md) · [`llms-txt-plan.md`](./llms-txt-plan.md) — the two tools this one sits beside, whose caps and page shell it reuses.

---

## What the thing is

Paste a YouTube URL, get the transcript. Plain text, timestamped, SRT or VTT.
Copy it or download it. No signup, no email, no watermark.

**It is not a diagnostic.** The other two tools end in a finding about the
visitor's own website; this one is a top-of-funnel keyword play on
"youtube transcript generator" and the conversion is the `CTAFooter`. That
framing is what keeps the build small — see architecture §1.

Two consequences worth flagging up front, because they break from the pattern
the other two set: this ships **indexed** where they ship `noindex`, and it
carries **FAQ JSON-LD** from launch.

---

## How it works

Two plain fetches. No npm package, no headless browser, no API key of ours.

```
POST youtubei/v1/player  { videoId, context.client = { clientName: 'IOS', … } }
  → playabilityStatus.status
  → videoDetails { title, author, lengthSeconds }
  → captions.playerCaptionsTracklistRenderer.captionTracks[]

GET  <track.baseUrl>&fmt=json3
  → { events: [ { tStartMs, dDurationMs, segs: [ { utf8 } ] } ] }
```

**`clientName: 'IOS'` is load-bearing and must carry a comment saying so.**
`WEB`, `MWEB`, `ANDROID` and `TVHTML5_SIMPLY_EMBEDDED_PLAYER` all return a valid
player response with **zero** caption tracks — nothing errors, the array is
simply empty, and the tool reports "no captions" for every video on YouTube.
Architecture §3.1 has the measurements and the four response shapes the error
mapping is written against.

The YouTube Data API cannot do this — `captions.download` needs OAuth as the
video owner. There is no cleaner route to go looking for.

---

## What comes out

All four formats render client-side from the same `segments[]`, so switching
format or toggling timestamps is instant and costs no request.

| Format | Shape |
|---|---|
| Plain text | paragraphs, no times — the one people paste into an LLM |
| Timestamped | `[00:03:14] line` |
| SRT | numbered cues, `00:00:03,140 --> 00:00:06,380` |
| VTT | `WEBVTT` header, `.` decimal separator |

SRT and VTT are what make this better than the tools it competes with rather
than a copy of one, and they are a pure function over data already in hand.

---

## Order of work

| # | Step | Scope | Status |
|---|---|---|---|
| 0 | **IP spike** | the real route on staging, 20 real videos | **Outstanding — blocking launch.** Everything below is verified only from a residential IP |
| 1 | `parse-url.ts` | watch, `youtu.be`, shorts, live, embed, bare id | Done — 15 tests |
| 2 | `fetch-transcript.ts` | the two fetches, track selection, error mapping | Done — 18 tests, all six failure reasons distinct |
| 3 | `render.ts` | segments → txt, timestamped, srt, vtt | Done — 16 tests |
| 4 | The route | `POST /api/tools/youtube/transcript` + caps + cache | Done — caps verified incrementing in local D1; cache is a no-op under `next dev` (Node has no `caches.default`) and is unverified until step 0 |
| 5 | The page | idle → loading → transcript, inline failures | Done |
| 6 | Launch | indexed, sitemap entry, FAQ JSON-LD, markdown spot-check | Done except step 0. FAQ answers confirmed reaching the markdown representation via the JSON-LD harvest |

**The spike no longer needs a throwaway route.** The real one is deployable and
does the same job, so step 0 is now "deploy to staging and run twenty videos
through `/api/tools/youtube/transcript`", watching for `reason: 'blocked'` in
the logs. That is strictly better than a scratch endpoint: it measures the code
that will actually serve traffic.

Steps 2 and 5 are the bulk; everything else is wiring.

Steps 1 and 3 are pure functions and carry the vitest coverage — the same split
as `llms-txt/render.ts` against `llms-txt/generate.ts`, for the same reason:
format is testable without a network, judgement is not. `fetch-transcript.ts`
gets a thin test with an injected `fetch`, matching `lib/crawl/fetch-pages.ts`.

### Step 0 is blocking

YouTube blocks datacenter IPs, and every measurement so far was taken from a
residential connection. Workers egress from datacenter ranges. If the player
call comes back `LOGIN_REQUIRED` from a real Worker, the free version of this
tool does not exist and tier two is a paid API behind the same function
signature — roughly $0.50 a day at the global cap.

The architecture is identical either way; only the cost model moves. Full
analysis in architecture §4. **Do not skip this because the curl worked — the
curl worked from the wrong IP.**

---

## Files

```
app/(my-app)/tools/youtube-transcript-generator/page.tsx   metadata, JSON-LD, CTAFooter
app/api/tools/youtube/transcript/route.ts                  POST { url, lang? } → JSON
components/sections/youtube-transcript-tool.tsx            'use client', the whole flow
lib/tools/youtube/parse-url.ts                             URL → videoId          (pure)
lib/tools/youtube/fetch-transcript.ts                      the two fetches
lib/tools/youtube/render.ts                                segments → txt|srt|vtt (pure)
```

Route response: `{ title, channel, duration, videoId, languages[], segments[] }`.

---

## What this reuses

Nothing new at the platform level, and **no migration**.

| Existing | Reused for |
|---|---|
| `lib/tools/counters.ts` | per-IP and global daily caps, unchanged |
| `lib/tools/session.ts` | `hashIp` / `toolsSalt` only — no session row |
| `components/tools/tool-nav.tsx` | the nav on every non-hero screen |
| `components/ui/*` + `DESIGN.md` | the entire UI |
| `components/sections/cta-footer.tsx` | the conversion |
| `caches.default` | 24h transcript cache — native, no table |
| OpenNext deploy pipeline | unchanged |

Not reused, deliberately: `lib/crawl/` (nothing is crawled),
`lib/tools/models.ts` (nothing is judged), `lib/tools/site-checks.ts` (nothing
is scored), `lib/tools/sse-client.ts` (nothing is streamed),
`components/tools/crawl-log.tsx` and `score-row.tsx`.

**Nothing here needs a session row, so `db/migrations/` is untouched** — along
with the `CHECK (tool IN …)` constraint and `crawlSchema`'s `tool` enum, neither
of which is reached. Deploy day has no checklist item, which is a first for
these tools. Architecture §3.2 and §6.

---

## Limits

| Cap | Value | Key | Why |
|---|---|---|---|
| Per visitor | 10/day | `ip:youtube:<hash>` | Higher than the crawl tools' 3 — this costs us nothing and traffic is the point |
| Global | 500/day | `global-youtube` | **Protects our Worker's IP reputation.** Someone looping this does not run up a bill, they get us blocked, and then it is dead for everyone |
| Video length | ~4 hours / 2 MB of json3 | — | Bounds a runaway response, not a product limit |
| Cache | 24h on `videoId:lang` | — | Sits in front of the cap check: a cache hit costs no upstream call |

The per-visitor cap uses the existing `counterKeys.ip('youtube', hash)` shape, so
this tool has its own allowance — a visitor who ran the chatbot today still has
ten transcripts.

---

## Deliberately out of scope

- **AI summary / "turn this into a post".** One `completeJson` call away on the existing free chain, and probably the stronger hook — which is why it waits for a number rather than a hunch. It would also put the highest-traffic tool on the same OpenRouter quota as the two that convert. Architecture §3.4.
- **Translation.** We offer the tracks YouTube already has; we do not translate.
- **Speaker labels.** Not in the caption data. Would have to be inferred, which means invented.
- **Playlist or bulk export.** A different product with a different abuse profile.
- **Saved history, accounts, email gate.** The gate would cost a large share of the traffic the tool exists to earn.

---

## Decisions locked

- **v1 is the transcript only** — no model call, no diagnostic angle bolted on.
- **No email gate.** Fully free, including the download.
- **Indexed from launch** with FAQ JSON-LD, unlike the other two tools. This one is built to be found.

## Decisions still open

- **Whether it survives step 0 unassisted.** Everything above assumes the spike passes. If it does not, the paid-API tier changes the cost model from zero to roughly $0.50 a day at the global cap — a call to make with the number in hand.
- **Whether 500/day global is right.** Calibrated to protect the IP, not to measured demand. Revisit after a fortnight of real traffic.
- **Alerting on the silent failure.** Both `LOGIN_REQUIRED` and an empty `captionTracks` on every video are outages that look like normal responses. Architecture §7 argues they need an alert rather than a comment; where that alert lives is not decided.
