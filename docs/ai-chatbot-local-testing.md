# AI Chatbot — Testing it locally

Everything runs on your machine against a local database. Nothing here touches
staging or production.

---

## 1. Secrets

Create `.dev.vars` in the repo root. It is gitignored — never commit it.

```
OPENROUTER_API_KEY=sk-or-v1-…
TOOLS_IP_SALT=any-random-string-for-local
TOOLS_SESSIONS_PER_IP=100
```

| Key | Why |
|---|---|
| `OPENROUTER_API_KEY` | The only one you cannot invent. Get it from openrouter.ai |
| `TOOLS_IP_SALT` | **Required.** Hashes visitor IPs, verification codes, and embed manage links. Any string locally, but without it every tool route returns 503 — there is deliberately no fallback, since a known salt would make manage links forgeable and stored IP hashes reversible |
| `TOOLS_SESSIONS_PER_IP` | Local only. Without it you get 3 crawls a day, because localhost has no per-visitor IP and everything shares one counter |

**`TOOLS_SESSIONS_PER_IP` must stay unset in staging and production.** It
switches off a real limit.

Nothing is needed to preview the widget. An embed key answers any `localhost`
origin by design, on a separate 20-a-day allowance that cannot touch the live
site's 50.

> **⚠️ OpenRouter needs $10 of credits.** Without them the account allows about
> 50 free requests a day *across all models* — the free tiers share one quota,
> so the fallback chain does not help. With credits it is 1,000 a day and still
> costs nothing per message. Without this you will hit `429` within minutes.

---

## 2. Database

Apply the three migrations to the local database once:

```bash
pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --local \
  --file=db/migrations/0003_tool_sessions.sql
pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --local \
  --file=db/migrations/0004_tool_embeds.sql
pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --local \
  --file=db/migrations/0005_tool_verifications.sql
```

---

## 3. Run it

```bash
pnpm dev
```

`.dev.vars` is read at startup, so **restart after changing it**. Look for
`Using secrets defined in .dev.vars` in the output.

---

## 4. The tool

Open **http://localhost:3000/tools/ai-chatbot**

1. Paste any real website address, press **Read my site**
2. Watch the pages arrive one by one
3. Ask it questions — try one the site cannot answer, like *"what does it cost?"*
4. Click **Skip to my report**, or use all 8 questions

The report's three measured scores appear immediately. The headline
"X of 10" is scored in the background and lands within about 20 seconds.

**Sites worth trying:** `linear.app` and `stripe.com` score well; most small
agency sites score 3–5; a React SPA shows the "we could not read your site"
path.

---

## 5. The embed — where to get the code

At the bottom of the report:

1. Enter any email → **Send me a code**
2. **The code is printed in your `pnpm dev` terminal**, in a box:

   ```
   ─────────── EMAIL (not sent — no provider configured) ───────────
   To:      you@company.com
   Subject: 059052 is your EPYC verification code
   ```

   No email is actually sent — there is no provider yet. The UI says so.

   **On a deployed environment** the log is the Worker's, not your terminal:
   `pnpm exec wrangler tail --env staging --search "verification code"`, or the
   Logs tab in the Cloudflare dashboard.

   Easier for staging: set `TOOLS_REVEAL_CODES=true`, then open the browser
   console and the code is printed there as `[epyc] verification code: 059052`.
   Staging only — with it set, verifying an address proves nothing, so anyone
   who reaches the page can claim an embed key.

3. Type the 6 digits → **Verify**
4. The embed snippet appears with a copy button, and under it a **manage link**.
   That link is the only way to refresh the bot later — there is no button for
   it in the widget, because the widget is shown to the customer's visitors.
   Copy it somewhere; nothing emails it to you.

Limits while testing: 3 codes per email per day, 3 per session, 10 minute
expiry, 5 wrong attempts and the code dies.

---

## 6. Seeing the widget

Create `public/embed-test.html` (gitignored) and paste your snippet into it:

```html
<!doctype html>
<html>
  <body>
    <h1>Pretend customer site</h1>
    <!-- paste your snippet here -->
  </body>
</html>
```

Open **http://localhost:3000/embed-test.html** and hard-refresh.

A circular button appears bottom-right. Open it and ask something about the
site you crawled — it answers from those pages only.

**The `src` must point at `http://localhost:3000`.** If the snippet says
`https://epyc.in`, change it — the live site does not have this code yet.

Localhost is allowed for any key on purpose, so a customer's developer can test
before installing. Those messages come out of a separate 20-a-day bucket
(`embed-dev:<key>`), so testing can never spend the live site's 50. Any other
domain gets a `403` naming the bound host, which is the binding working.

The conversation survives page navigation — it is held in `sessionStorage` per
key, so add a second page to `embed-test.html` and the thread continues.

---

## 7. Refreshing a bot

Open the manage link from step 5. One button: **Read my site again**. It
re-reads the site, swaps the pages under the same key, and leaves the snippet on
the customer's site untouched.

Capped at 3 a day per domain. Clear `tool_counters` to reset while testing.

A recrawl that comes back empty is rejected and the old pages are kept — a site
that is down for twenty seconds must not blank a live bot.

---

## Resetting when you hit a limit

```bash
# all daily limits: crawls, messages, verification codes
pnpm exec wrangler d1 execute epyc-contact-form-aug-26-live-staging --local \
  --command "DELETE FROM tool_counters"
```

Other useful queries:

```sql
-- what has been crawled
SELECT host, status, pages_crawled, messages_used FROM tool_sessions
ORDER BY created_at DESC LIMIT 5;

-- issued embed keys
SELECT key, bound_host, email FROM tool_embeds ORDER BY created_at DESC;
```

---

## When something does not work

| Symptom | Cause |
|---|---|
| "The assistant is unavailable" | `OPENROUTER_API_KEY` missing, or dev server not restarted after adding it |
| `429` from the model | OpenRouter free quota. Add $10 of credits |
| "You've used your 3 checks" | `TOOLS_SESSIONS_PER_IP` not set, or not restarted. Or clear `tool_counters` |
| Widget does not appear | Snippet points at the wrong origin. Check the browser console for a `403` — the message names the host the key is bound to |
| "That link is no longer valid" on manage | `TOOLS_IP_SALT` changed since the key was claimed. The token is derived from it. Claim again |
| Same site returns instantly | Working as intended — crawls are reused for 24h. Use **Read my site again** to force a fresh one |
| Report says it could not be built | Old session from before a fix. Crawl again |
