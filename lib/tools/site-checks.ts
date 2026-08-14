/**
 * Site quality checks — the parts of a report that are computed directly from
 * a crawl, with no model call.
 *
 * Shared deliberately. The AI chatbot demo uses these as three of its five
 * report dimensions; the Website Grader and the llms.txt Generator score the
 * same properties. Anything here must stay tool-agnostic: it takes crawled
 * pages plus crawl signals and returns findings, and it knows nothing about
 * chatbots, buyer questions, or sessions.
 *
 * Tool-specific scoring composes on top — see lib/tools/chatbot/diagnosis.ts.
 */

import type { Heading } from '@/lib/crawl/extract'

export type Verdict = 'pass' | 'weak' | 'fail'

export type Check = { label: string; pass: boolean; detail: string }

/** A crawled page, as much of it as scoring needs. */
export type SitePage = {
  url: string
  title: string
  text: string
  headings?: Heading[]
  wordCount?: number
  isEmpty?: boolean
}

/** What the crawl observed about the site as a whole. */
export type CrawlSignals = {
  robotsFound?: boolean
  robotsBlockedAll?: boolean
  sitemapFound?: boolean
  unreachable?: boolean
  hitDeadline?: boolean
}

export type SiteChecks = {
  structure: { verdict: Verdict; headline: string; evidence: string[] }
  crawlability: { verdict: Verdict; headline: string; checks: Check[] }
  specificity: { verdict: Verdict; headline: string; examples: { quote: string; url: string }[] }
}

/* ------------------------------------------------------------- structure */

function scoreStructure(pages: SitePage[]): SiteChecks['structure'] {
  const total = pages.length
  const noHeadings = pages.filter((p) => (p.headings?.length ?? 0) === 0)
  const noH1 = pages.filter((p) => !(p.headings ?? []).some((h) => h.level === 1))
  const flat = pages.filter((p) => new Set((p.headings ?? []).map((h) => h.level)).size <= 1)

  const evidence: string[] = []
  if (noHeadings.length) {
    evidence.push(
      `${noHeadings.length} of ${total} pages have no headings at all — the page is one undifferentiated block`,
    )
    for (const p of noHeadings.slice(0, 3)) evidence.push(`No headings: ${pathOf(p.url)}`)
  }
  if (noH1.length) evidence.push(`${noH1.length} of ${total} pages have no H1`)
  if (flat.length && flat.length !== total) {
    evidence.push(`${flat.length} of ${total} pages use only one heading level, so nothing is nested`)
  }
  if (!evidence.length) {
    evidence.push(`All ${total} pages use real, nested headings`)
  }

  const badRatio = total ? (noHeadings.length + flat.length / 2) / total : 1
  const verdict: Verdict = badRatio > 0.5 ? 'fail' : badRatio > 0.15 ? 'weak' : 'pass'

  return {
    verdict,
    headline: verdict === 'pass' ? 'Well structured' : verdict === 'weak' ? 'Weak' : 'Mostly unstructured',
    evidence,
  }
}

/* ---------------------------------------------------------- crawlability */

function scoreCrawlability(
  pages: SitePage[],
  signals: CrawlSignals,
  signalsKnown: boolean,
): SiteChecks['crawlability'] {
  const readable = pages.filter((p) => !p.isEmpty)

  // Readability is derived from the stored pages, so it is always knowable.
  const checks: Check[] = [
    {
      label: 'Readable without JavaScript',
      pass: readable.length > 0 && readable.length >= pages.length / 2,
      detail:
        readable.length === 0
          ? 'No readable text at all — the pages are built entirely by JavaScript'
          : `${readable.length} of ${pages.length} pages returned real text`,
    },
  ]

  // Sitemap and robots are only knowable from the crawl itself. Reporting
  // "not present" when we simply did not record it would be inventing a
  // finding, which is the one thing this report must never do.
  if (signalsKnown) {
    checks.unshift(
      {
        label: 'Sitemap',
        pass: Boolean(signals.sitemapFound),
        detail: signals.sitemapFound
          ? 'Found — we used it to pick which pages to read'
          : 'Not found, so we had to guess which pages matter by following links',
      },
      {
        label: 'robots.txt',
        pass: !signals.robotsBlockedAll,
        detail: signals.robotsBlockedAll
          ? 'Blocks automated readers from every page'
          : signals.robotsFound
            ? 'Present, and allows crawling'
            : 'Not present — nothing is blocked, but nothing is directed either',
      },
    )
  }

  const failed = checks.filter((c) => !c.pass).length
  const verdict: Verdict = failed === 0 ? 'pass' : failed === 1 ? 'weak' : 'fail'

  return {
    verdict,
    headline: failed === 0 ? 'Passes' : `${failed} of ${checks.length} checks failed`,
    checks,
  }
}

/* ----------------------------------------------------------- specificity */

/**
 * Marketing language that asserts quality without evidence. A claim only
 * counts against a site when nothing nearby substantiates it, so each hit is
 * quoted in context and the reader can judge.
 *
 * ponytail: a phrase list, not a model call. Ceiling: it finds stock phrases,
 * not every vague sentence, and it cannot tell a substantiated "award-winning"
 * from an empty one. If the quoted examples read weak against real sites, this
 * moves into the scoring model call as one extra field — same call, no extra
 * cost. Decide on real output, per docs/ai-chatbot-plan.md.
 */
const VAGUE = [
  'world-class', 'world class', 'industry-leading', 'industry leading', 'best-in-class',
  'best in class', 'cutting-edge', 'cutting edge', 'state-of-the-art', 'state of the art',
  'seamless', 'robust', 'innovative', 'passionate', 'one-stop', 'trusted partner',
  'end-to-end', 'tailored solutions', 'bespoke solutions', 'unparalleled', 'holistic',
  'game-changing', 'next-level', 'revolutionary', 'leading provider', 'award-winning',
  'unrivalled', 'unrivaled', 'second to none', 'market-leading', 'best possible',
]

/**
 * Editorial URLs. Excluded from Specificity because the question this
 * dimension asks is "does this company describe itself concretely" — and a
 * blog post is not the company describing itself.
 *
 * Measured against real output: scoring epyc.in flagged a blog post that was
 * itself *mocking* empty language ("ends with a slide that says 'now go be
 * innovative'") as a vague claim, alongside article titles. Every quote we
 * show is meant to be evidence the owner cannot argue with; a false positive
 * from a blog post hands them the argument.
 */
const EDITORIAL = /\/(blog|news|articles?|insights?|resources?|guides?|press|case-stud)/i

function scoreSpecificity(pages: SitePage[]): SiteChecks['specificity'] {
  const examples: { quote: string; url: string }[] = []
  let hits = 0

  const salesPages = pages.filter((p) => !EDITORIAL.test(p.url))
  // A site that is nothing but blog has no sales copy to judge; fall back to
  // everything rather than reporting a suspiciously clean score.
  const judged = salesPages.length > 0 ? salesPages : pages

  for (const page of judged) {
    const text = page.text ?? ''
    const lower = text.toLowerCase()

    for (const phrase of VAGUE) {
      let from = 0
      for (;;) {
        const at = lower.indexOf(phrase, from)
        if (at === -1) break
        hits++
        from = at + phrase.length

        if (examples.length < 6) {
          examples.push({ quote: quoteAround(text, at, phrase.length), url: page.url })
        }
      }
    }
  }

  // Density matters more than raw count — a 20-page site will say more of
  // everything. Measured over the pages we actually judged, not all of them.
  const words = judged.reduce((n, p) => n + (p.wordCount ?? 0), 0) || 1
  const per1k = (hits / words) * 1000
  const verdict: Verdict = per1k > 1.2 ? 'fail' : per1k > 0.4 ? 'weak' : 'pass'

  return {
    verdict,
    headline: hits === 0 ? 'Concrete throughout' : `${hits} vague claim${hits === 1 ? '' : 's'}`,
    examples,
  }
}

/**
 * A readable fragment around a match, so the reader sees it in context.
 *
 * Snaps to word boundaries. These quotes are shown to the site's owner as
 * evidence, and a fragment ending "…robust solutions, instead of " reads as
 * sloppy rather than damning — which undercuts the finding it is meant to
 * support.
 */
function quoteAround(text: string, at: number, length: number): string {
  let start = Math.max(0, at - 60)
  let end = Math.min(text.length, at + length + 60)

  if (start > 0) {
    const space = text.indexOf(' ', start)
    if (space !== -1 && space < at) start = space + 1
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end)
    if (space > at + length) end = space
  }

  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return `${prefix}${text.slice(start, end).trim()}${suffix}`
}

/**
 * Run every check that needs no model call.
 *
 * `signalsKnown: false` means the caller never saw the crawl — the sitemap and
 * robots checks are then omitted rather than guessed, because reporting an
 * absence we cannot vouch for is the one thing these reports must never do.
 */
export function runSiteChecks(
  pages: SitePage[],
  signals: CrawlSignals,
  signalsKnown = true,
): SiteChecks {
  return {
    structure: scoreStructure(pages),
    crawlability: scoreCrawlability(pages, signals, signalsKnown),
    specificity: scoreSpecificity(pages),
  }
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}
