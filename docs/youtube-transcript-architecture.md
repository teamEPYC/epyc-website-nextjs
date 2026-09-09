# YouTube Transcript Generator — Architecture

**Companion doc:** [`youtube-transcript-plan.md`](./youtube-transcript-plan.md) (scope, order of work, limits, decisions)
**Predecessors:** [`ai-chatbot-architecture.md`](./ai-chatbot-architecture.md) — specified the shared tool layer · [`llms-txt-architecture.md`](./llms-txt-architecture.md) — the second consumer of it

This document explains **why the system is shaped the way it is**, what was
rejected and on what grounds, and what a third tool that uses half the shared
layer says about where that layer was cut.

---

## 1. What the thing is

Paste a YouTube URL, get the transcript. Plain text, timestamped, SRT or VTT.

**It is not a diagnostic, and that is the architectural fact everything else
follows from.** The chatbot and the llms.txt generator both end in a finding
about the visitor's own website — the giveaway exists to earn the finding, and
the finding is what converts. This tool has no finding. It is a top-of-funnel
keyword play on a term with real search volume and a page of thin competitors,
and the conversion is the `CTAFooter` like everywhere else.

Naming that honestly is what keeps the design small. A tool with no finding
needs no corpus, no scoring, no session and no model, and every one of those
absences below is downstream of it. The temptation is to bolt a diagnostic on so
it resembles its siblings; that would add a model call, a quota fight and a
schema to a tool whose entire job is to rank and be fast.

---

## 2. The system

```
Browser  /tools/youtube-transcript-generator
   │
   │ POST /api/tools/youtube/transcript   { url, lang? }      (plain JSON)
   ▼
Next.js Worker ──► caches.default  (key: videoId:lang, 24h)
   │
   │            ──► POST youtubei/v1/player   (client: IOS) ──► youtube.com
   │            ──► GET  api/timedtext?fmt=json3 ────────────►
   │
   ├──► D1  tool_counters                     (caps only — no session row)
   ▼
{ title, channel, duration, videoId, languages[], segments[] }
   │
   └──► client renders txt | timestamped | srt | vtt · copy · download
```

One round trip. Two upstream fetches. No model call, no new table, no migration,
no queue, no stream.

---

## 3. The five calls that carry this design

### 3.1 Two plain fetches against InnerTube. No dependency, and no official API.

```
POST https://www.youtube.com/youtubei/v1/player
     { videoId, context: { client: { clientName: 'IOS', clientVersion: '20.10.4' } } }
  → playabilityStatus.status
  → videoDetails { title, author, lengthSeconds }
  → captions.playerCaptionsTracklistRenderer.captionTracks[]
       { languageCode, kind: 'asr' | undefined, name, baseUrl }

GET  <baseUrl>&fmt=json3
  → { events: [ { tStartMs, dDurationMs, segs: [ { utf8 } ] } ] }
```

**`clientName: 'IOS'` is the one magic string in the build, and it is load
bearing.** Measured against `dQw4w9WgXcQ`: `WEB`, `MWEB`, `ANDROID` and
`TVHTML5_SIMPLY_EMBEDDED_PLAYER` each returned a perfectly valid player response
containing **zero** caption tracks. `IOS` returned six.

That failure mode is the dangerous one — nothing errors. The response parses,
the code finds an empty array, and the tool reports "this video has no captions"
for every video on YouTube. It needs a comment at the constant saying so, or the
next person to tidy it towards something more obvious will ship a tool that is
uniformly, quietly wrong.

**There is no official alternative to weigh this against.** The YouTube Data API
v3's `captions.download` requires OAuth as the video's *owner*. It is not a
worse option, it is not an option: it cannot serve a public tool at all. Stated
here so nobody spends an afternoon rediscovering it.

Observed response shapes, which are what the error mapping is written against:

| Video | Result |
|---|---|
| `dQw4w9WgXcQ` | `OK`, 6 tracks (`en`, `en:asr`, `de-DE`, `ja`, `pt-BR`, `es-419`) |
| `5MgBikgcWnY` | `OK`, 26 tracks |
| `jNQXAC9IVRw` | `OK`, 2 tracks — a 2005 upload still resolves |
| `aaaaaaaaaaa` | `ERROR`, reason `"This video is unavailable"` |

The `baseUrl` carries `ip=0.0.0.0&ipbits=0` among its signed params, so the
timedtext URL is not bound to the caller's address. Only the player call is
exposed to the risk in §4.

**Track order is alphabetical, not meaningful.** `captionTracks` lists
community and translated tracks sorted by language name, so "the first written
track" is not the spoken one: 5MgBikgcWnY is an English TED talk whose list
opens `ar, bn, my, zh-CN, zh-TW, hr, en, en:asr, …`, and taking the first
written entry returned Arabic to anyone who pasted it. The auto-generated track
is the usable signal — YouTube only ever produces one in the language actually
being spoken — so the spoken language is read off it and a written track in
that language is preferred where one exists. `videoDetails.defaultAudioLanguage`
would be more direct and is absent on this client; `audioTracks[].captionTrackIndices`
only moves the ASR entry to the end and is otherwise still alphabetical. Both
were checked.

### 3.2 Nothing outlives the response, so there is no session and no migration.

The chatbot needs `tool_sessions` because a corpus has to survive eight messages
and then a live embed on someone's site. The llms.txt generator needs it because
`generate` reads what `crawl` wrote in an earlier request. This tool fetches,
renders and hands over inside one request — there is no second request to hand
anything to.

So: no session row, no `tool_transcripts` table, nothing in `db/migrations/`.
`tool_counters` is already generic, so the caps cost a key string and nothing
else. The `CHECK (tool IN ('chatbot','grader','llms-txt'))` constraint and
`crawlSchema`'s `tool` enum are both untouched, because neither is reached.

**Deploy day has no checklist item**, which is a first for these tools and worth
protecting. Any future change that adds a row here should have to justify it
against that.

### 3.3 Caching is the Cache API, not a table.

The same video fetched twice is a wasted call to YouTube and a little more of
the exposure in §4. So responses are cached on `videoId:lang` for 24 hours in
`caches.default`.

The alternative — a `tool_transcripts` table — is a cache with a schema, a
pruning job, a reuse window to reason about and a migration to apply, replacing
about six lines against a native platform API.

*ponytail: `caches.default`, not D1. Ceiling: the Cache API is per-colo, so a
popular video is fetched once per Cloudflare location rather than once globally.
That is the correct trade at this volume — the cache exists to blunt repeat
traffic, not to guarantee a single global fetch. Upgrade path is KV if the
measured block rate says per-colo is not enough.*

### 3.4 No SSE, and no model call.

The crawl streams because twenty seconds of silence loses a stranger. This is
roughly 1.5 seconds behind a spinner, so `lib/tools/sse-client.ts` is not
imported and there is no second reader to maintain.

And nothing here is judged. The chatbot and the llms.txt generator both spend
the shared OpenRouter account quota — the same free-tier allowance, metered per
account rather than per model — and they already compete for it. This tool
spends none of it, which means the traffic it is built to attract cannot starve
the two tools that convert.

That is the argument against the obvious feature request. "Summarise this video
with AI" is one `completeJson` call away using the existing free chain, and it
is probably the stronger hook. It is also the thing that would put the highest-
traffic tool on the same quota as the two that earn money. It waits for a
number, not a hunch — the same gate the chatbot plan applies to the paid model.

### 3.5 Formats render on the client, from one payload.

The route returns `segments[]`. Plain text, timestamped, SRT and VTT are all
pure functions over that array, run in the browser, so switching format or
toggling timestamps is instant and costs no request.

Rendering is separated from fetching for the same reason it is in
`lib/tools/llms-txt/render.ts`: format is testable without a network, judgement
is not. `render.ts` and `parse-url.ts` are where the vitest coverage lives;
`fetch-transcript.ts` gets a thin test with an injected `fetch`, matching
`lib/crawl/fetch-pages.ts`.

SRT and VTT are what make this better than the tools it competes with rather
than a copy of one, and they cost a pure function over data already in hand.

---

## 4. The risk that decides whether this ships

**YouTube blocks datacenter IP ranges.** Every measurement in §3.1 was taken
from a residential connection. Cloudflare Workers egress from datacenter ranges,
where the player call frequently returns `LOGIN_REQUIRED` — "Sign in to confirm
you're not a bot".

This is the load-bearing assumption of the entire tool, in exactly the position
SSE-through-the-OpenNext-adapter occupied for the chatbot
(`ai-chatbot-architecture.md` §2.2), and it gets the same treatment: a
throwaway route on staging against twenty real videos, before any other step
depends on it.

| Outcome | Consequence |
|---|---|
| Passes | Build as specified. No dependencies, no per-request cost, no cost model to revisit. |
| Fails | Tier two is a paid transcript API (Supadata, youtube-transcript.io — roughly $0.001 a call) behind the same function signature. Only `fetch-transcript.ts` changes; the route, the renderers, the caching and the UI are unaffected. At the global cap that is about $0.50 a day. |

The architecture is unchanged either way, which is the point of putting the two
upstream fetches behind one function in the first place. What changes is the
cost model, and that is a decision to make with a measured block rate in hand
rather than now.

**Two second-order effects of the same risk shape the caps.** Our Worker's IP
reputation is a shared resource across every tool on the site, so the global
daily cap exists to protect it rather than to protect a budget — someone looping
this tool does not run up a bill, they get us blocked, and then the tool is dead
for everyone. And a cache hit costs no upstream call, which is why the cache
sits in front of the cap check rather than behind it.

---

## 5. Rejected alternatives, with grounds

| Rejected | Why |
|---|---|
| **YouTube Data API v3** | `captions.download` requires OAuth as the video owner. It cannot serve a public tool. Not a trade-off — it does not work. |
| **`youtube-transcript` npm package** | Wraps the same two calls in about forty lines and adds a dependency that breaks whenever YouTube moves. We need one client string and one JSON path; a package is a slower way to get them and a second thing to upgrade under pressure. |
| **`youtubei.js`** | Same objection, larger: it carries a player-signature deciphering layer for stream URLs that this tool has no use for, and that layer is the part that breaks most often. |
| **Scraping the watch page for `ytInitialPlayerResponse`** | Identical datacenter-IP exposure to the player call, with an HTML parse in front of it and more surface to break. Strictly worse than the documented-shape JSON endpoint. |
| **A paid transcript API from day one** | The correct answer *if* §4 fails, and premature before it is measured. Spending money to solve a problem we have not observed is the thing the spike exists to avoid. |
| **Cloudflare Browser Rendering** | Defeats IP blocking no better than `fetch` — the block is on the address, not the client — while adding pay-per-use cost and seconds of latency to a tool whose entire appeal is that it is instant. |
| **A `tool_transcripts` D1 table** | A cache with a schema, a pruning job, a reuse window and a migration, replacing six lines of `caches.default`. See §3.3. |
| **An email gate on the download** | Would capture leads and cost a large share of the traffic the tool exists to earn. The competitors it has to beat on this keyword are all ungated; being the one that asks for an address is how a top-of-funnel page loses. |
| **Bolting a diagnostic on so it matches its siblings** | The finding would be "your video has no captions", which is thin, and it would pull a model call and a quota fight into the one tool that does not need either. §1. |

---

## 6. What the third tool proves about the shared layer

The llms.txt generator was evidence the crawl engine generalised. This one is a
sharper test, because it uses **half** the shared layer and none of the other
half.

| Shared module | Used |
|---|---|
| `lib/tools/counters.ts` | Yes — caps, unchanged |
| `lib/tools/session.ts` | `hashIp` / `toolsSalt` only |
| `components/tools/tool-nav.tsx` | Yes |
| `components/ui/*`, `DESIGN.md` | Yes — the whole UI |
| `lib/crawl/*` | No — nothing is crawled |
| `lib/tools/models.ts` | No — nothing is judged |
| `lib/tools/site-checks.ts` | No — nothing is scored |
| `lib/tools/sse-client.ts` | No — nothing is streamed |
| `components/tools/crawl-log.tsx`, `score-row.tsx` | No |

A tool that takes the caps and the chrome while taking none of the crawl or the
scoring is the case that would have hurt if those had been fused. They were not:
`lib/crawl/` was written route-free, `site-checks.ts` was kept tool-agnostic and
separate from `chatbot/diagnosis.ts`, and the caps were built on a generic
counter rather than a per-tool mechanism. Each of those decisions pays here.

**The one thing that did not generalise, correctly.** Every tool's idle screen
is bespoke, as `llms-txt-plan.md` argued it should be — each asks a different
question and gives away a different thing. This tool's screen shares even less
than the last one did, since it takes a video URL rather than a website. Only
`ToolNav` is lifted. That is the right amount, and a shared `<ToolIdleScreen>`
taking four copy props remains the wrong idea.

---

## 7. Known risks carried

- **The IP block in §4 is not a one-time gate.** It can start failing later, from a change on YouTube's side rather than ours. The route needs a distinguishable log line for `LOGIN_REQUIRED` specifically, so the day it starts happening is visible in observability rather than inferred from a drop in usage.
- **`clientName: 'IOS'` is a moving target.** It works today; it is an internal client string with no compatibility promise. When it stops working the symptom is "every video has no captions", not an error — see §3.1. That symptom is worth an alert, not just a comment.
- **This is an undocumented internal endpoint.** Public captions on public videos, and the tool category is widely offered, but it is not a supported API and carries no uptime or stability commitment. The mitigation is the function boundary in §4, not a guarantee.
- **The cache makes the block rate look better than it is.** A cached hit never touches YouTube, so raw success rate over responses will overstate health. The measurement that matters is success rate over *upstream calls*, and it has to be counted at the fetch, not at the route.
- **A page built to rank has a different failure cost than one that is `noindex`.** The other two tools can be quietly broken for a day. This one is indexed and will accumulate links, so an outage is a ranking event. That argues for the alert above rather than for more architecture.
