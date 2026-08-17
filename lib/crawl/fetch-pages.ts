/**
 * The crawl itself: robots → sitemap → pages → text.
 *
 * Runs inline in the route handler rather than in a queue and a second worker,
 * so `global_fetch_strictly_public` (set in wrangler.jsonc) applies to every
 * fetch here. See docs/ai-chatbot-architecture.md §2.2.
 *
 * Every limit in docs/ai-chatbot-plan.md is enforced in this file except the
 * per-visitor and global daily counts, which are checked by the route before
 * it calls in.
 */

import { extractPage, type PageExtract } from './extract'
import {
  fallbackSitemapUrls,
  isAllowed,
  parseRobots,
  parseSitemapXml,
  rankUrls,
  type RobotsRules,
} from './sitemap'
import { validateUrl } from './validate-url'

export const LIMITS = {
  /** Pages read per site. */
  maxPages: 20,
  /** Per page, then we stop reading that response. */
  maxBytes: 500_000,
  /** Whole crawl. We return what we have rather than hanging on one slow host. */
  deadlineMs: 20_000,
  /** Per single request. */
  requestTimeoutMs: 8_000,
  /**
   * Sitemaps get longer, because they are worth more: one sitemap yields up to
   * 20 ranked URLs, where failing over to link-following yields whatever the
   * homepage happens to link to. Measured against real sites — epyc.in's own
   * sitemap is server-rendered from a CMS and answers in 0.6s warm but over
   * 20s cold, and that variance is normal for CMS-driven sitemaps.
   */
  sitemapTimeoutMs: 12_000,
  /** In flight at once against one host. We are a guest on their server. */
  concurrency: 5,
  /** Redirect hops followed, each re-validated. */
  maxRedirects: 3,
  /** Words kept per page. */
  maxWordsPerPage: 3_000,
} as const

/**
 * Identifies us and gives them somewhere to complain. An anonymous scraper
 * gets blocked, and once blocked it is blocked for every future visitor.
 */
const USER_AGENT = 'EPYCBot/1.0 (+https://epyc.in/tools/ai-chatbot)'

export type CrawledPage = PageExtract & { url: string }

export type CrawlProgress =
  | { type: 'status'; message: string }
  | { type: 'page'; url: string; title: string; done: number; total: number }

export type CrawlResult = {
  pages: CrawledPage[]
  /** Report inputs that are only knowable during the crawl. */
  signals: {
    robotsFound: boolean
    robotsBlockedAll: boolean
    sitemapFound: boolean
    /** True when we never got a usable response from the host at all. */
    unreachable: boolean
    /** Set when the wall-clock deadline cut the crawl short. */
    hitDeadline: boolean
  }
}

type CrawlOptions = {
  onProgress?: (p: CrawlProgress) => void
  /** Injectable for tests. */
  fetchImpl?: typeof fetch
  now?: () => number
}

export async function crawlSite(seed: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  const doFetch = opts.fetchImpl ?? fetch
  const now = opts.now ?? (() => Date.now())
  const started = now()
  const timeLeft = () => LIMITS.deadlineMs - (now() - started)
  const report = (p: CrawlProgress) => opts.onProgress?.(p)

  const checked = validateUrl(seed)
  if (!checked.ok) throw new Error(checked.reason)
  const origin = new URL(checked.url).origin

  const signals: CrawlResult['signals'] = {
    robotsFound: false,
    robotsBlockedAll: false,
    sitemapFound: false,
    unreachable: false,
    hitDeadline: false,
  }

  // 1. robots.txt — both for permission and for where the sitemap lives.
  report({ type: 'status', message: 'Checking what we’re allowed to read' })
  let rules: RobotsRules = { sitemaps: [], disallow: [] }
  const robotsBody = await fetchText(new URL('/robots.txt', origin).toString(), doFetch, timeLeft())
  if (robotsBody !== null) {
    signals.robotsFound = true
    rules = parseRobots(robotsBody)
    signals.robotsBlockedAll = !isAllowed('/', rules)
  }
  if (signals.robotsBlockedAll) return { pages: [], signals }

  // 2. Sitemap — robots' directive first, then the conventional locations.
  report({ type: 'status', message: 'Looking for your sitemap' })
  const candidates = rules.sitemaps.length ? rules.sitemaps : fallbackSitemapUrls(origin)
  let pageUrls = await collectFromSitemaps(candidates, origin, doFetch, timeLeft)
  signals.sitemapFound = pageUrls.length > 0

  // 3. No sitemap — follow the homepage's own links, one level deep.
  if (!signals.sitemapFound) {
    report({ type: 'status', message: 'No sitemap. Following your links instead' })
    const home = await fetchText(checked.url, doFetch, timeLeft())
    if (home === null) {
      signals.unreachable = true
      return { pages: [], signals }
    }
    pageUrls = rankUrls([checked.url, ...linksIn(home, origin)], origin, LIMITS.maxPages)
  } else {
    report({ type: 'status', message: 'Found your sitemap' })
  }

  // Never fetch what robots told us not to.
  const allowed = pageUrls.filter((u) => isAllowed(new URL(u).pathname, rules))
  const queue = allowed.slice(0, LIMITS.maxPages)
  const total = queue.length
  const pages: CrawledPage[] = []

  // 4. Fetch, a few at a time, until the queue empties or time runs out.
  let cursor = 0
  const worker = async () => {
    while (cursor < queue.length) {
      if (timeLeft() <= 0) {
        signals.hitDeadline = true
        return
      }
      const url = queue[cursor++]
      const html = await fetchText(url, doFetch, Math.min(LIMITS.requestTimeoutMs, timeLeft()))
      if (html === null) continue

      const extracted = extractPage(html, { maxWords: LIMITS.maxWordsPerPage })
      pages.push({ ...extracted, url })
      report({ type: 'page', url, title: extracted.title, done: pages.length, total })
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(LIMITS.concurrency, queue.length) }, () => worker()),
  )

  // The deadline can also be blown by the discovery phase before any page is
  // queued — a slow sitemap is the usual culprit. Checking only inside the
  // worker loop misses that, and the route would report a clean run that took
  // longer than the cap it promises.
  if (timeLeft() <= 0) signals.hitDeadline = true
  if (pages.length === 0) signals.unreachable = true
  return { pages, signals }
}

/** Follow one level of sitemap index, which is what most real sitemaps are. */
async function collectFromSitemaps(
  candidates: string[],
  origin: string,
  doFetch: typeof fetch,
  timeLeft: () => number,
): Promise<string[]> {
  const found: string[] = []

  for (const candidate of candidates) {
    if (timeLeft() <= 0) break
    const xml = await fetchText(candidate, doFetch, Math.min(LIMITS.sitemapTimeoutMs, timeLeft()))
    if (!xml) continue

    const parsed = parseSitemapXml(xml)
    if (!parsed.isIndex) {
      found.push(...parsed.urls)
    } else {
      // One level down only — deep indexes are not worth the request budget.
      for (const child of parsed.urls.slice(0, 3)) {
        if (timeLeft() <= 0) break
        const childXml = await fetchText(
          child,
          doFetch,
          Math.min(LIMITS.sitemapTimeoutMs, timeLeft()),
        )
        if (childXml) found.push(...parseSitemapXml(childXml).urls)
      }
    }
    if (found.length) break
  }

  return rankUrls(found, origin, LIMITS.maxPages)
}

/** Same-host hrefs from a page, for the no-sitemap path. */
function linksIn(html: string, origin: string): string[] {
  const out: string[] = []
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) out.push(m[1])
  return rankUrls(out, origin, LIMITS.maxPages * 2)
}

/**
 * Fetch a URL as text, or `null` if it is not usable.
 *
 * Enforces the timeout, the byte cap, the redirect cap, and HTML-only. Every
 * redirect hop is re-validated: a public URL is allowed to redirect to
 * `127.0.0.1`, and `global_fetch_strictly_public` is the backstop rather than
 * the only check.
 */
async function fetchText(
  url: string,
  doFetch: typeof fetch,
  budgetMs: number,
): Promise<string | null> {
  if (budgetMs <= 0) return null

  // The budget covers the whole chain, not each hop. Re-arming the full timeout
  // per redirect let one page take (maxRedirects + 1) × budgetMs — up to 32s
  // against a 20s crawl deadline, which is the wall-clock cap the route
  // promises. The caller still decides the size of the budget; a sitemap is
  // worth waiting longer for than a page.
  const deadline = Date.now() + budgetMs

  let current = url
  for (let hop = 0; hop <= LIMITS.maxRedirects; hop++) {
    const checked = validateUrl(current)
    if (!checked.ok) return null

    const remaining = deadline - Date.now()
    if (remaining <= 0) return null

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), remaining)

    try {
      const res = await doFetch(checked.url, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,text/xml' },
      })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) return null
        current = new URL(location, checked.url).toString()
        continue
      }

      if (!res.ok) return null

      const type = res.headers.get('content-type') ?? ''
      if (type && !/text\/html|xml|text\/plain/i.test(type)) return null

      // Inside the try, and before clearTimeout: the budget has to cover
      // reading the body, not just receiving the headers. A server that sends
      // headers instantly and then trickles bytes would otherwise hang here
      // with nothing to stop it.
      return await readCapped(res)
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  return null
}

/** Read a body up to the byte cap, then stop pulling. */
async function readCapped(res: Response): Promise<string | null> {
  const reader = res.body?.getReader()
  if (!reader) return null

  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      size += value.byteLength
      chunks.push(value)
      if (size >= LIMITS.maxBytes) break
    }
  } catch {
    return null
  } finally {
    await reader.cancel().catch(() => {})
  }

  const buffer = new Uint8Array(size)
  let offset = 0
  for (const c of chunks) {
    buffer.set(c, offset)
    offset += c.byteLength
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(buffer)
}
