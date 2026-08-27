# AI Chatbot — Flow & Information Wireframe

Black and white, no styling, no visual design. This shows **what information
appears on each screen** and **how the experience moves between them**,
including the paths where things go wrong.

Visual design comes later — see `docs/ai-chatbot-tech.md` → Design.
Scope and build order: `docs/ai-chatbot-plan.md`.

---

## 1. The whole flow

```
                        ┌─────────────────┐
                        │  A · PASTE URL  │
                        └────────┬────────┘
                                 │ submit
                                 ▼
                        ┌─────────────────┐
                        │  URL is checked │
                        └────────┬────────┘
              ┌──────────────────┼──────────────────┐
              │ bad address      │ ok               │ over daily limit
              ▼                  ▼                  ▼
      ┌───────────────┐  ┌─────────────────┐  ┌───────────────┐
      │ A1 · BAD URL  │  │  B · READING    │  │ A2 · COME     │
      │ (inline error)│  │     THE SITE    │  │      BACK     │
      └───────┬───────┘  └────────┬────────┘  │      TOMORROW │
              │                   │           └───────────────┘
              └──back to A        │
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │ blocked / unreachable   │ text found              │ almost no text
        ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ B1 · CANNOT     │      │   C · CHAT      │      │ E · UNREADABLE  │
│      REACH IT   │      │   (8 messages)  │      │     SITE        │
└─────────────────┘      └────────┬────────┘      └────────┬────────┘
                                  │ 8 used, or               │
                                  │ "show my report"         │ skips chat
                                  ▼                          │
                         ┌─────────────────┐                 │
                         │   D · REPORT    │◀────────────────┘
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌───────────────┐          ┌─────────────────┐
            │ Talk about a  │          │ Want this on    │
            │ rebuild       │          │ your site?      │
            │ → /contact    │          │ → F · EMAIL     │
            └───────────────┘          └─────────────────┘

   Re-crawl ("I fixed something, read it again") returns to B from D or E.
```

**The one-line version:** paste → we read → you chat → we score → two ways out.

---

## 2. A · Paste a URL

```
┌──────────────────────────────────────────────────────────────┐
│  [ EPYC logo ]                    Projects  Blog  Gallery  … │
│                                                              │
│                                                              │
│              Free · No signup · About 30 seconds             │
│                                                              │
│              Can an AI actually read your website?           │
│                                                              │
│    Paste your address. We read up to 20 pages, build a       │
│    chatbot from what we find, and show you the 10 questions  │
│    a buyer asks that your site cannot answer.                │
│                                                              │
│    ┌────────────────────────────────┐  ┌──────────────────┐  │
│    │ yourcompany.com                │  │  Read my site  → │  │
│    └────────────────────────────────┘  └──────────────────┘  │
│                                                              │
│    We only read pages your robots.txt allows.                │
│    Nothing is published anywhere.                            │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│    (01)                  (02)                  (03)          │
│    We read it            You question it       You get       │
│                                                the report    │
│    Up to 20 pages,       Eight questions to    Five scores,  │
│    the way an AI         a bot that only       each backed   │
│    assistant would.      knows your site.      by your pages.│
└──────────────────────────────────────────────────────────────┘
```

| Information shown | Source |
|---|---|
| Headline, subcopy, reassurance line | Static copy |
| Three-step explainer | Static copy |

**Actions:** type an address → submit.
**Next:** B, or A1 / A2 below.

---

### A1 · Bad address (inline, does not leave the page)

```
    ┌────────────────────────────────┐  ┌──────────────────┐
    │ 127.0.0.1                      │  │  Read my site  → │
    └────────────────────────────────┘  └──────────────────┘
      ⚠ Enter a domain name, not an IP address.
```

One line, under the field, in the visitor's language. Never a raw error.
The messages come from `lib/crawl/validate-url.ts`:

| Situation | Message |
|---|---|
| Empty | Enter a website address. |
| Not parseable | That doesn't look like a website address. |
| IP address (v4 or v6) | Enter a domain name, not an IP address. |
| `localhost`, `.local`, `.internal` | That address is not reachable from the public internet. |
| Single word, no dot | Enter a full domain, like example.com. |
| `ftp:`, `file:`, `javascript:` | Only http and https addresses can be read. |
| Credentials in the address | Addresses with login details are not accepted. |
| Unusual port | Only standard web ports can be read. |

---

### A2 · Over the daily limit

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              You've used your three checks for today         │
│                                                              │
│    The tool is free and we cap it so it stays that way.      │
│    Your checks reset at midnight UTC.                        │
│                                                              │
│              ┌──────────────────────┐                        │
│              │  Talk to us instead →│                        │
│              └──────────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

Two different caps land here, with different copy:

- **3 sessions per visitor per day** → "your three checks for today"
- **200 messages per day across everyone** → "the tool is busy today, try tomorrow"

Neither is an error. Both offer the contact route, because someone hitting the
cap is interested.

---

## 3. B · Reading the site

```
┌──────────────────────────────────────────────────────────────┐
│  northwindlogistics.com                                      │
│                                                              │
│  Reading your site                                           │
│                                                              │
│  12 of 20 pages                          about 12s left      │
│  [██████████████████░░░░░░░░░░░░░░░░░░░░]                    │
│                                                              │
│    ✓  /                                                      │
│    ✓  /about                                                 │
│    ✓  /services                                              │
│    ✓  /services/freight                                      │
│    ✓  /contact                                               │
│    ▸  /industries                             reading…       │
│                                                              │
│  Found your sitemap. Reading the pages a buyer would         │
│  land on first.                                              │
└──────────────────────────────────────────────────────────────┘
```

| Information shown | Source |
|---|---|
| Host being read | The submitted URL |
| Page count + progress | Streamed, one event per page fetched |
| Page paths, as they land | Streamed live |
| Status line | Changes: "Looking for your sitemap" → "Found your sitemap" → "No sitemap, following your links" |

**Why the list and not a spinner:** the page paths are proof we are really
reading their site, and it is the moment the visitor first believes the tool.
A spinner is indistinguishable from a hang.

**Actions:** none. It cannot be cancelled; it takes under 20 seconds by design.
**Next:** C if text was found, E if not, B1 if the site could not be reached.

---

### B1 · Cannot reach it

```
┌──────────────────────────────────────────────────────────────┐
│  We couldn't reach northwindlogistics.com                    │
│                                                              │
│  What we tried                                               │
│  ───────────────────────────────────────────────────────     │
│  robots.txt              Blocked us from every page          │
│  Homepage                No response after 20 seconds        │
│                                                              │
│  Some sites block automated readers. Search engines and      │
│  AI assistants hit the same wall we just did.                │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐                    │
│  │ Try another →  │  │ Talk to us    →  │                    │
│  └────────────────┘  └──────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

Names the specific blocker: robots disallow, timeout, DNS failure, or a
non-200. Never "something went wrong".

---

## 4. C · Chat

```
┌──────────────────────────────────────────────────────────────┐
│  CHATTING WITH                              ┌──────────────┐ │
│  northwindlogistics.com                     │ 5 of 8 left  │ │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────┐                  │
│  │ I've read 17 pages of northwind…       │  ← bot           │
│  │ Ask me anything a customer might ask.  │                  │
│  └────────────────────────────────────────┘                  │
│                                                              │
│                  ┌─────────────────────────────────────────┐ │
│         you  →   │ What exactly does this company do?      │ │
│                  └─────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────┐                  │
│  │ Northwind provides freight forwarding  │  ← bot, answers  │
│  │ and warehousing across the UK…         │                  │
│  └────────────────────────────────────────┘                  │
│                                                              │
│                  ┌─────────────────────────────────────────┐ │
│         you  →   │ What does it cost?                      │ │
│                  └─────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────┐                  │
│  │ ! NOT ON THE SITE                      │  ← bot, honest   │
│  │ I couldn't find that. There's no       │    miss. THIS is │
│  │ pricing page, and the services pages   │    the product.  │
│  │ describe what's offered without        │                  │
│  │ naming a price or how a quote works.   │                  │
│  └────────────────────────────────────────┘                  │
│                                                              │
│  TRY ASKING                                                  │
│  ( What exactly does this company do? )                      │
│  ( Who is it for? )  ( What does it cost? )                  │
│  ( Who have they worked with before? )                       │
│                                                              │
│  ┌────────────────────────────────┐  ┌──────────────────┐    │
│  │ Ask something a customer would │  │     Send      →  │    │
│  └────────────────────────────────┘  └──────────────────┘    │
│                                                              │
│                          [ Skip to my report → ]             │
└──────────────────────────────────────────────────────────────┘
```

| Information shown | Source |
|---|---|
| Host + pages read | Session |
| Messages remaining | `8 − messages_used` |
| Bot answers | Model, from the crawled text only |
| "Not on the site" marker | Set when the bot cannot answer — the raw material of the report |
| Suggested questions | 4 of the 10 scored buyer questions |

**Actions:** type a question, click a suggested question, or skip to the report.

**Two behaviours that matter:**
- The visitor can leave for the report at any time. Never trap them at 8.
- If the model is busy, the bot shows *"one moment…"* and retries down the free
  model chain. It never shows a raw error mid-conversation.

**Next:** D, on the 8th message or on "skip to my report".

---

## 5. D · The report

```
┌──────────────────────────────────────────────────────────────┐
│  northwindlogistics.com                                      │
│                                                              │
│                          4 of 10                             │
│         buyer questions your website can answer              │
│                                                              │
│  The bot was limited by what your site says, not by the      │
│  bot. Here is what it could not find.                        │
│                                                              │
│    ✗  What does it cost, or how is pricing decided?          │
│    ✗  How long does a typical project take?                  │
│    ✗  What results have they actually produced?              │
│    ✗  What makes them different from the alternatives?       │
│    ✗  Who actually does the work?                            │
│    ✗  What happens between contact and finished work?        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  THE REST OF THE REPORT                                      │
│                                                              │
│  Coverage                              3 of 5 page types     │
│    · Missing: pricing or process                             │
│    · Missing: proof — no case studies or results             │
│                                                              │
│  Structure                                          Weak     │
│    · 9 of 17 pages have no H2 at all                         │
│    · /services is one block with 14 styled divs              │
│                                                              │
│  Crawlability                                     Passes     │
│    · Sitemap found at /sitemap.xml                           │
│    · robots.txt allows crawling                              │
│    · Text readable without JavaScript                        │
│                                                              │
│  Specificity                            11 vague claims      │
│    · "world-class service" — /about                          │
│    · "industry-leading turnaround" — /services, no number    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│      This is a content problem, not a bot problem.           │
│                                                              │
│    Every question above is one a buyer asks before they      │
│    get in touch. We rebuild sites so the answers are on      │
│    the page.                                                 │
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐    │
│  │ Talk about a rebuild │  │ Want this bot on your site?│    │
│  └──────────────────────┘  └────────────────────────────┘    │
│                                                              │
│            Fixed something? Read my site again               │
└──────────────────────────────────────────────────────────────┘
```

| Score | What it says | Evidence it shows |
|---|---|---|
| **Answerability** | "4 of 10" — the headline | The exact questions that failed |
| Coverage | How many of 5 page types exist | Names the missing ones |
| Structure | Are headings real and nested | Heading depth per page |
| Crawlability | Sitemap, robots, text without JS | Pass/fail per check + the blocker |
| Specificity | Concrete facts vs vague copy | Quotes their own words |

**Every number points at something.** No score appears without the evidence
underneath it.

**Actions:** rebuild CTA · email capture · re-crawl.
**Next:** `/contact`, F, or back to B.

---

### D1 · When the site scores well

```
│                          9 of 10                             │
│         buyer questions your website can answer              │
│                                                              │
│  Your site answers almost everything a buyer asks. That      │
│  is rare. The one gap:                                       │
│                                                              │
│    ✗  What does it cost, or how is pricing decided?          │
```

A high scorer is the most interesting visitor on the page and the current
draft has nothing gracious to say to them. The report must not read as a
failure notice when the site is good — same layout, different framing, and
the CTA shifts from "this is broken" to "you're most of the way there".

**Open question for copy.** Flagged, not solved.

---

## 6. E · Unreadable site

```
┌──────────────────────────────────────────────────────────────┐
│  northwind-app.io                                            │
│                                                              │
│  We could not read your site                                 │
│                                                              │
│  We reached your pages, but they returned almost no          │
│  readable text. Everything is drawn by JavaScript after      │
│  the page loads. An AI assistant reading your site sees      │
│  what we saw: an empty page.                                 │
│                                                              │
│  WHAT WE FOUND                                               │
│  ─────────────────────────────────────────────────────────   │
│  Sitemap                              Found — 14 URLs        │
│  robots.txt                           Allows crawling        │
│  Readable text without JavaScript     38 words / 14 pages    │
│                                                              │
│  There is nothing to chat with, and that is the finding.     │
│  Search engines, AI assistants and previews all read a       │
│  page the way we just did.                                   │
│                                                              │
│  ┌──────────────────────┐  ┌────────────────────────────┐    │
│  │ Talk about a rebuild │  │  Read my site again      → │    │
│  └──────────────────────┘  └────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**No chat is offered.** A bot with nothing to say makes EPYC look broken; this
screen makes their site look broken, which is both true and the point.

---

## 7. F · Email capture

```
┌──────────────────────────────────────────────────────────────┐
│  Want this bot on your site?                                 │
│                                                              │
│  We're building an embeddable version. Free, unlimited       │
│  messages, runs on your own site. Leave your email and       │
│  we'll tell you when it's ready.                             │
│                                                              │
│  ┌────────────────────────────────┐  ┌──────────────────┐    │
│  │ you@company.com                │  │  Notify me    →  │    │
│  └────────────────────────────────┘  └──────────────────┘    │
│                                                              │
│  ── after submit ────────────────────────────────────────    │
│  ✓ We'll be in touch. Your report stays on this page.        │
└──────────────────────────────────────────────────────────────┘
```

This capture is the phase-two gate. Its click count decides whether the
embeddable widget gets built at all, so it must be a real capture and not a
dead button.

---

## 8. What the visitor never sees

Deliberate omissions, listed so nobody adds them back by accident:

- **No account, no signup, no password.** Email is asked for once, at the end, optional.
- **No model name.** Not "powered by Nemotron". It is a diagnostic, not an AI product.
- **No raw errors, no status codes, no stack traces.** Every failure names a cause in plain words.
- **No critique from the bot.** It stays in character as their support assistant. All criticism lives in the report.
- **No score before the chat.** The conversation has to come first or the score is a claim instead of a recap.
- **No paywall, no "upgrade to see the rest".** The whole report is free.

---

## 9. Still open

1. **D1 copy — the good-site framing.** Layout is settled, wording is not.
2. **Re-crawl wait.** Re-crawling returns to B for another 20 seconds. Acceptable, or does it need a lighter treatment when only one page changed?
3. **Mid-chat model exhaustion.** If every free tier is rate-limited at once, the "one moment" state has to end somewhere. Offer the report early, or hold?
