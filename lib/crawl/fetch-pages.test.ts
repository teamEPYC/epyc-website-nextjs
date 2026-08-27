import { describe, expect, it } from 'vitest'
import { crawlSite, type CrawlProgress } from './fetch-pages'

/**
 * The orchestration is where the bugs hide — robots before sitemap, sitemap
 * index one level down, Disallow actually honoured. A fake fetch lets all of
 * that be tested without a network.
 */

type Routes = Record<string, { body?: string; status?: number; type?: string; location?: string }>

function fakeFetch(routes: Routes) {
  const calls: string[] = []
  const impl = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push(url)
    const route = routes[url]
    if (!route) return new Response('not found', { status: 404 })
    if (route.location) {
      return new Response(null, { status: 301, headers: { location: route.location } })
    }
    return new Response(route.body ?? '', {
      status: route.status ?? 200,
      headers: { 'content-type': route.type ?? 'text/html' },
    })
  }) as unknown as typeof fetch
  return { impl, calls }
}

const html = (body: string, title = 'Page') =>
  `<!doctype html><html><head><title>${title}</title></head><body>${body}</body></html>`

/** Enough words that the page is not flagged empty. */
const copy = (word: string) => `<p>${Array.from({ length: 80 }, () => word).join(' ')}</p>`

describe('crawlSite', () => {
  it('takes the sitemap from robots.txt and follows a sitemap index one level', () => {
    const { impl, calls } = fakeFetch({
      'https://example.com/robots.txt': {
        body: 'User-agent: *\nDisallow: /admin\nSitemap: https://example.com/sitemap_index.xml',
        type: 'text/plain',
      },
      'https://example.com/sitemap_index.xml': {
        body: '<sitemapindex><sitemap><loc>https://example.com/pages.xml</loc></sitemap></sitemapindex>',
        type: 'application/xml',
      },
      'https://example.com/pages.xml': {
        body: '<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/pricing</loc></url></urlset>',
        type: 'application/xml',
      },
      'https://example.com/': { body: html(copy('home')) },
      'https://example.com/pricing': { body: html(copy('pricing'), 'Pricing') },
    })

    return crawlSite('example.com', { fetchImpl: impl }).then((r) => {
      expect(r.signals.robotsFound).toBe(true)
      expect(r.signals.sitemapFound).toBe(true)
      expect(r.pages.map((p) => p.url).sort()).toEqual([
        'https://example.com/',
        'https://example.com/pricing',
      ])
      // The conventional guess is never made when robots names one.
      expect(calls).not.toContain('https://example.com/sitemap.xml')
    })
  })

  it('stops immediately when robots disallows everything', async () => {
    const { impl, calls } = fakeFetch({
      'https://example.com/robots.txt': { body: 'User-agent: *\nDisallow: /', type: 'text/plain' },
      'https://example.com/': { body: html(copy('home')) },
    })

    const r = await crawlSite('example.com', { fetchImpl: impl })
    expect(r.signals.robotsBlockedAll).toBe(true)
    expect(r.pages).toEqual([])
    // and we did not fetch a single page anyway
    expect(calls).toEqual(['https://example.com/robots.txt'])
  })

  it('never fetches a disallowed path that the sitemap lists', async () => {
    const { impl, calls } = fakeFetch({
      'https://example.com/robots.txt': {
        body: 'User-agent: *\nDisallow: /private\nSitemap: https://example.com/s.xml',
        type: 'text/plain',
      },
      'https://example.com/s.xml': {
        body: '<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/private/secret</loc></url></urlset>',
        type: 'application/xml',
      },
      'https://example.com/': { body: html(copy('home')) },
      'https://example.com/private/secret': { body: html(copy('secret')) },
    })

    const r = await crawlSite('example.com', { fetchImpl: impl })
    expect(calls).not.toContain('https://example.com/private/secret')
    expect(r.pages).toHaveLength(1)
  })

  it('falls back to following homepage links when there is no sitemap', async () => {
    const { impl } = fakeFetch({
      'https://example.com/': {
        body: html(`<a href="/about">About</a><a href="/pricing">Pricing</a>${copy('home')}`),
      },
      'https://example.com/about': { body: html(copy('about'), 'About') },
      'https://example.com/pricing': { body: html(copy('pricing'), 'Pricing') },
    })

    const r = await crawlSite('example.com', { fetchImpl: impl })
    expect(r.signals.sitemapFound).toBe(false)
    expect(r.pages.length).toBeGreaterThanOrEqual(2)
  })

  it('reports progress per page, for the live log', async () => {
    const { impl } = fakeFetch({
      'https://example.com/robots.txt': { body: 'Sitemap: https://example.com/s.xml', type: 'text/plain' },
      'https://example.com/s.xml': {
        body: '<urlset><url><loc>https://example.com/</loc></url></urlset>',
        type: 'application/xml',
      },
      'https://example.com/': { body: html(copy('home'), 'Home') },
    })

    const events: CrawlProgress[] = []
    await crawlSite('example.com', { fetchImpl: impl, onProgress: (p) => events.push(p) })

    expect(events.some((e) => e.type === 'status')).toBe(true)
    const pageEvents = events.filter((e) => e.type === 'page')
    expect(pageEvents).toHaveLength(1)
    expect(pageEvents[0]).toMatchObject({ url: 'https://example.com/', title: 'Home', done: 1 })
  })

  it('flags an unreadable site rather than returning nothing silently', async () => {
    const { impl } = fakeFetch({
      'https://example.com/': { body: html('<div id="root"></div>') },
    })

    const r = await crawlSite('example.com', { fetchImpl: impl })
    // The page was reachable but has no readable text — the E screen, not an error.
    expect(r.pages.every((p) => p.isEmpty)).toBe(true)
  })

  it('re-validates redirect targets, so a public URL cannot bounce us inward', async () => {
    const { impl, calls } = fakeFetch({
      'https://example.com/robots.txt': { body: 'Sitemap: https://example.com/s.xml', type: 'text/plain' },
      'https://example.com/s.xml': {
        body: '<urlset><url><loc>https://example.com/</loc></url></urlset>',
        type: 'application/xml',
      },
      'https://example.com/': { location: 'http://169.254.169.254/latest/meta-data/' },
    })

    const r = await crawlSite('example.com', { fetchImpl: impl })
    expect(calls).not.toContain('http://169.254.169.254/latest/meta-data/')
    expect(r.pages).toEqual([])
  })

  it('rejects an unsafe seed before any request is made', async () => {
    const { impl, calls } = fakeFetch({})
    await expect(crawlSite('http://127.0.0.1/', { fetchImpl: impl })).rejects.toThrow(/IP address/i)
    expect(calls).toEqual([])
  })

  it('stops at the wall-clock deadline and keeps what it has', async () => {
    const routes: Routes = {
      'https://example.com/robots.txt': { body: 'Sitemap: https://example.com/s.xml', type: 'text/plain' },
      'https://example.com/s.xml': {
        body: `<urlset>${Array.from({ length: 20 }, (_, i) => `<url><loc>https://example.com/p${i}</loc></url>`).join('')}</urlset>`,
        type: 'application/xml',
      },
    }
    for (let i = 0; i < 20; i++) routes[`https://example.com/p${i}`] = { body: html(copy('x')) }

    const { impl } = fakeFetch(routes)
    // Clock jumps 3s per call — the 20s budget runs out partway through.
    let t = 0
    const r = await crawlSite('example.com', { fetchImpl: impl, now: () => (t += 3_000) })

    expect(r.signals.hitDeadline).toBe(true)
    expect(r.pages.length).toBeLessThan(20)
  })
})
