/**
 * Finding the pages worth reading.
 *
 * Everything here is pure string work — no fetching — so the awkward parts
 * (sitemap indexes, robots precedence, URL ranking) are testable without a
 * network. `fetch-pages.ts` does the I/O and calls into these.
 *
 * The spec said "fetch /sitemap.xml and take up to 20 URLs". That fails on a
 * large share of real sites for two reasons this module fixes: the standard
 * discovery path is the `Sitemap:` directive in robots.txt, and `sitemap.xml`
 * is frequently a *sitemap index* pointing at child sitemaps rather than a list
 * of pages. Parsing an index naively returns zero pages.
 */

export type RobotsRules = {
  /** Absolute URLs from `Sitemap:` directives. Order preserved. */
  sitemaps: string[]
  /** Disallowed path prefixes that apply to us. */
  disallow: string[]
}

/**
 * Parse robots.txt for the directives we honour.
 *
 * ponytail: implements the common subset, not RFC 9309 — `User-agent` grouping,
 * `Disallow`, `Allow` (as a disallow override), and `Sitemap`. No wildcard
 * expansion beyond a trailing `*`, no crawl-delay. That covers what real sites
 * use to block crawlers. If we ever see a site whose rules we misread, the
 * upgrade path is a real robots parser, not more regex here.
 */
export function parseRobots(text: string): RobotsRules {
  const sitemaps: string[] = []
  const disallow: string[] = []
  const allow: string[] = []

  // Which user-agent group we are currently inside. We obey `*` and any group
  // naming us; everything else is skipped.
  let applies = false

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0].trim()
    if (!line) continue

    const sep = line.indexOf(':')
    if (sep === -1) continue

    const field = line.slice(0, sep).trim().toLowerCase()
    const value = line.slice(sep + 1).trim()
    if (!value) continue

    // Sitemap is a global directive — it is not scoped to a user-agent group.
    if (field === 'sitemap') {
      sitemaps.push(value)
      continue
    }

    if (field === 'user-agent') {
      const ua = value.toLowerCase()
      applies = ua === '*' || ua.includes('epyc')
      continue
    }

    if (!applies) continue
    if (field === 'disallow') disallow.push(value)
    if (field === 'allow') allow.push(value)
  }

  // An `Allow` that exactly matches a `Disallow` wins, per the usual precedence.
  const overridden = new Set(allow)
  return {
    sitemaps,
    disallow: disallow.filter((d) => !overridden.has(d)),
  }
}

/** Would robots.txt let us fetch this path? `Disallow: /` blocks everything. */
export function isAllowed(pathname: string, rules: RobotsRules): boolean {
  return !rules.disallow.some((rule) => {
    if (rule === '/') return true
    // Trailing `*` is the only wildcard worth supporting in practice.
    const prefix = rule.endsWith('*') ? rule.slice(0, -1) : rule
    return prefix !== '' && pathname.startsWith(prefix)
  })
}

export type SitemapParse = {
  /** `<loc>` values found. */
  urls: string[]
  /** True when this was a `<sitemapindex>` — the URLs are child sitemaps. */
  isIndex: boolean
}

/**
 * Pull `<loc>` values out of a sitemap or sitemap index.
 *
 * ponytail: regex, not an XML parser. Sitemaps are a fixed, shallow schema and
 * we want exactly one element from them. Workers has no DOMParser, and adding
 * an XML dependency to read one tag would be the definition of over-building.
 */
export function parseSitemapXml(xml: string): SitemapParse {
  const isIndex = /<sitemapindex[\s>]/i.test(xml)
  const urls: string[] = []

  for (const match of xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)) {
    const value = decodeXmlEntities(match[1].trim())
    if (value) urls.push(value)
  }

  return { urls, isIndex }
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Slugs a buyer looks for first — these are also what the report scores. */
const PRIORITY = /(about|service|product|pricing|price|plans|contact|work|case|solution|team)/i

/**
 * Choose which pages to read, best first.
 *
 * Same-host only, shallow paths before deep ones, buyer-relevant slugs before
 * everything else, the homepage always first. Non-HTML extensions are dropped —
 * a PDF or an image is a wasted fetch out of a budget of 20.
 */
export function rankUrls(urls: string[], origin: string, limit: number): string[] {
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return []
  }

  const seen = new Set<string>()
  const candidates: { url: string; score: number }[] = []

  for (const raw of urls) {
    let u: URL
    try {
      u = new URL(raw, origin)
    } catch {
      continue
    }

    if (u.host !== host) continue
    if (u.protocol !== 'http:' && u.protocol !== 'https:') continue
    if (/\.(pdf|jpe?g|png|gif|svg|webp|avif|zip|mp4|mp3|css|js|xml|json)$/i.test(u.pathname)) continue

    u.hash = ''
    const key = u.toString()
    if (seen.has(key)) continue
    seen.add(key)

    const depth = u.pathname.split('/').filter(Boolean).length
    // Lower is better: homepage 0, priority slugs beat depth, deep pages last.
    const score = (u.pathname === '/' ? -100 : 0) + (PRIORITY.test(u.pathname) ? -10 : 0) + depth

    candidates.push({ url: key, score })
  }

  return candidates
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((c) => c.url)
}

/** Where to look for a sitemap when robots.txt names none. */
export function fallbackSitemapUrls(origin: string): string[] {
  return [new URL('/sitemap.xml', origin).toString(), new URL('/sitemap_index.xml', origin).toString()]
}
