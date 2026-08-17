import { describe, expect, it } from 'vitest'
import { runSiteChecks, type SitePage } from './site-checks'

/**
 * These checks are shared by every tool on the platform, so a change made for
 * one can silently break another. The behaviours locked here are the ones that
 * were wrong at least once already.
 */

const page = (over: Partial<SitePage> = {}): SitePage => ({
  url: 'https://example.com/',
  title: 'Home',
  text: 'We move freight across the UK. '.repeat(20),
  headings: [
    { level: 1, text: 'Home' },
    { level: 2, text: 'Services' },
  ],
  wordCount: 120,
  isEmpty: false,
  ...over,
})

describe('crawlability', () => {
  it('omits sitemap and robots when the crawl was not observed', () => {
    // Reporting "robots.txt not present" for a site that has one is inventing
    // a finding. When signals are unknown we say nothing about them.
    const { crawlability } = runSiteChecks([page()], {}, false)
    const labels = crawlability.checks.map((c) => c.label)

    expect(labels).toEqual(['Readable without JavaScript'])
    expect(labels).not.toContain('Sitemap')
    expect(labels).not.toContain('robots.txt')
  })

  it('reports all three when the crawl was observed', () => {
    const { crawlability } = runSiteChecks(
      [page()],
      { sitemapFound: true, robotsFound: true, robotsBlockedAll: false },
      true,
    )
    expect(crawlability.checks.map((c) => c.label)).toEqual([
      'Sitemap',
      'robots.txt',
      'Readable without JavaScript',
    ])
    expect(crawlability.verdict).toBe('pass')
  })

  it('fails when robots blocks everything', () => {
    const { crawlability } = runSiteChecks([page()], { robotsBlockedAll: true }, true)
    expect(crawlability.checks.find((c) => c.label === 'robots.txt')?.pass).toBe(false)
  })

  it('fails when nothing was readable without JavaScript', () => {
    const { crawlability } = runSiteChecks(
      [page({ isEmpty: true, wordCount: 3 })],
      { sitemapFound: true, robotsFound: true },
      true,
    )
    const readable = crawlability.checks.find((c) => c.label.startsWith('Readable'))
    expect(readable?.pass).toBe(false)
    expect(readable?.detail).toMatch(/JavaScript/)
  })
})

describe('structure', () => {
  it('passes a site with real nested headings', () => {
    expect(runSiteChecks([page(), page()], {}, true).structure.verdict).toBe('pass')
  })

  it('fails div soup', () => {
    const soup = [page({ headings: [] }), page({ headings: [] })]
    const { structure } = runSiteChecks(soup, {}, true)
    expect(structure.verdict).toBe('fail')
    expect(structure.evidence[0]).toMatch(/no headings at all/)
  })

  it('names the pages with no headings, so the finding is actionable', () => {
    const pages = [page(), page({ url: 'https://example.com/services', headings: [] })]
    const { structure } = runSiteChecks(pages, {}, true)
    expect(structure.evidence.join(' ')).toContain('/services')
  })
})

describe('specificity', () => {
  const vague = 'We are a world-class, industry-leading provider of seamless solutions. '

  it('quotes vague marketing claims from sales pages', () => {
    const { specificity } = runSiteChecks(
      [page({ text: vague.repeat(3), wordCount: 30 })],
      {},
      true,
    )
    expect(specificity.examples.length).toBeGreaterThan(0)
    expect(specificity.headline).toMatch(/vague claim/)
  })

  it('ignores blog and news pages', () => {
    // Regression: scoring epyc.in flagged a blog post that was itself mocking
    // empty language, plus article titles from the blog index. A blog post is
    // not the company describing itself.
    const { specificity } = runSiteChecks(
      [
        page({ url: 'https://example.com/blog/why-buzzwords-fail', text: vague.repeat(5) }),
        page({ url: 'https://example.com/news/launch', text: vague.repeat(5) }),
        page({ text: 'We move 400 tonnes a week from Felixstowe.', wordCount: 40 }),
      ],
      {},
      true,
    )
    expect(specificity.examples).toHaveLength(0)
    expect(specificity.verdict).toBe('pass')
  })

  it('falls back to every page when a site is nothing but blog', () => {
    // Otherwise a blog-only site scores suspiciously clean.
    const { specificity } = runSiteChecks(
      [page({ url: 'https://example.com/blog/one', text: vague.repeat(5), wordCount: 50 })],
      {},
      true,
    )
    expect(specificity.examples.length).toBeGreaterThan(0)
  })

  it('quotes on word boundaries, not mid-word', () => {
    // Regression: quotes used to arrive as "…robust solutions, instead of ",
    // cut mid-word. These are shown to a site's owner as evidence, and a
    // sloppy fragment undercuts the finding it is meant to support.
    const text = `${'padding filler '.repeat(20)}${vague}${'trailing filler '.repeat(20)}`
    const { specificity } = runSiteChecks([page({ text })], {}, true)

    expect(specificity.examples.length).toBeGreaterThan(0)

    const words = new Set(text.split(/\s+/).filter(Boolean))
    for (const example of specificity.examples) {
      const inner = example.quote.replace(/^…/, '').replace(/…$/, '').trim()
      const tokens = inner.split(/\s+/)
      // Both ends must be whole words that really appear in the source.
      expect(words.has(tokens[0])).toBe(true)
      expect(words.has(tokens[tokens.length - 1])).toBe(true)
    }
  })
})
