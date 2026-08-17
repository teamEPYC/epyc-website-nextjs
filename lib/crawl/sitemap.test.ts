import { describe, expect, it } from 'vitest'
import {
  isAllowed,
  parseRobots,
  parseSitemapXml,
  rankUrls,
} from './sitemap'

describe('parseRobots', () => {
  it('reads Sitemap directives regardless of user-agent group', () => {
    const r = parseRobots(`
      Sitemap: https://example.com/sitemap_index.xml
      User-agent: *
      Disallow: /admin
      Sitemap: https://example.com/news-sitemap.xml
    `)
    expect(r.sitemaps).toEqual([
      'https://example.com/sitemap_index.xml',
      'https://example.com/news-sitemap.xml',
    ])
  })

  it('only applies rules from groups that cover us', () => {
    const r = parseRobots(`
      User-agent: AhrefsBot
      Disallow: /

      User-agent: *
      Disallow: /cart
    `)
    // The blanket Disallow belongs to AhrefsBot, not to us.
    expect(r.disallow).toEqual(['/cart'])
    expect(isAllowed('/pricing', r)).toBe(true)
  })

  it('ignores comments and blank lines', () => {
    const r = parseRobots(`
      # a comment
      User-agent: *   # trailing comment
      Disallow: /private
    `)
    expect(r.disallow).toEqual(['/private'])
  })

  it('lets an exact Allow override a Disallow', () => {
    const r = parseRobots(`
      User-agent: *
      Disallow: /docs
      Allow: /docs
    `)
    expect(isAllowed('/docs/intro', r)).toBe(true)
  })
})

describe('isAllowed', () => {
  const blockAll = parseRobots('User-agent: *\nDisallow: /')
  const blockSome = parseRobots('User-agent: *\nDisallow: /admin\nDisallow: /tmp*')

  it('treats Disallow: / as blocking everything', () => {
    expect(isAllowed('/', blockAll)).toBe(false)
    expect(isAllowed('/about', blockAll)).toBe(false)
  })

  it('blocks by prefix and trailing wildcard', () => {
    expect(isAllowed('/admin/users', blockSome)).toBe(false)
    expect(isAllowed('/tmpfiles/x', blockSome)).toBe(false)
    expect(isAllowed('/about', blockSome)).toBe(true)
  })

  it('allows everything when there are no rules', () => {
    expect(isAllowed('/anything', parseRobots(''))).toBe(true)
  })
})

describe('parseSitemapXml', () => {
  it('detects a sitemap index — the case the spec got wrong', () => {
    // WordPress/Yoast and Shopify serve this shape. Reading it as a page list
    // yields zero pages, so the tool would silently fail on those sites.
    const r = parseSitemapXml(`<?xml version="1.0"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://example.com/post-sitemap.xml</loc></sitemap>
        <sitemap><loc>https://example.com/page-sitemap.xml</loc></sitemap>
      </sitemapindex>`)
    expect(r.isIndex).toBe(true)
    expect(r.urls).toHaveLength(2)
  })

  it('reads a plain urlset as pages', () => {
    const r = parseSitemapXml(`<urlset>
        <url><loc>https://example.com/</loc></url>
        <url><loc>https://example.com/about</loc></url>
      </urlset>`)
    expect(r.isIndex).toBe(false)
    expect(r.urls).toEqual(['https://example.com/', 'https://example.com/about'])
  })

  it('handles entities and whitespace inside loc', () => {
    const r = parseSitemapXml('<urlset><url><loc>\n  https://example.com/a?x=1&amp;y=2\n</loc></url></urlset>')
    expect(r.urls).toEqual(['https://example.com/a?x=1&y=2'])
  })

  it('returns nothing for junk rather than throwing', () => {
    expect(parseSitemapXml('<html><body>404</body></html>').urls).toEqual([])
  })
})

describe('rankUrls', () => {
  const origin = 'https://example.com'

  it('puts the homepage first and buyer-relevant pages next', () => {
    const ranked = rankUrls(
      [
        'https://example.com/blog/2024/some-post',
        'https://example.com/pricing',
        'https://example.com/',
        'https://example.com/careers/engineering/backend',
      ],
      origin,
      10,
    )
    expect(ranked[0]).toBe('https://example.com/')
    expect(ranked[1]).toBe('https://example.com/pricing')
  })

  it('drops other hosts', () => {
    const ranked = rankUrls(['https://example.com/a', 'https://evil.com/b'], origin, 10)
    expect(ranked).toEqual(['https://example.com/a'])
  })

  it('drops non-HTML files that would waste the page budget', () => {
    const ranked = rankUrls(
      ['https://example.com/brochure.pdf', 'https://example.com/logo.svg', 'https://example.com/about'],
      origin,
      10,
    )
    expect(ranked).toEqual(['https://example.com/about'])
  })

  it('deduplicates, ignoring fragments', () => {
    const ranked = rankUrls(
      ['https://example.com/about', 'https://example.com/about#team', 'https://example.com/about'],
      origin,
      10,
    )
    expect(ranked).toHaveLength(1)
  })

  it('respects the limit', () => {
    const many = Array.from({ length: 50 }, (_, i) => `https://example.com/p${i}`)
    expect(rankUrls(many, origin, 20)).toHaveLength(20)
  })

  it('resolves relative URLs against the origin', () => {
    expect(rankUrls(['/about'], origin, 5)).toEqual(['https://example.com/about'])
  })
})
