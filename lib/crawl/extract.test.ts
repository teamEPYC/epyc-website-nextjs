import { describe, expect, it } from 'vitest'
import { EMPTY_WORD_THRESHOLD, extractPage, structureOf } from './extract'

const page = (body: string, head = '<title>Northwind Logistics</title>') =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`

describe('extractPage', () => {
  it('pulls the title', () => {
    expect(extractPage(page('<p>hi</p>')).title).toBe('Northwind Logistics')
  })

  it('drops script and style content entirely', () => {
    const html = page(`
      <script>var secret = "do not index me";</script>
      <style>.a { color: red }</style>
      <p>Freight forwarding across the UK.</p>
    `)
    const { text } = extractPage(html)
    expect(text).toContain('Freight forwarding')
    expect(text).not.toContain('secret')
    expect(text).not.toContain('color')
  })

  it('drops repeated chrome so it does not drown the real copy', () => {
    const html = page(`
      <nav>Home About Services Contact</nav>
      <p>We move freight.</p>
      <footer>Copyright 2026 Northwind</footer>
    `)
    const { text } = extractPage(html)
    expect(text).toBe('We move freight.')
  })

  it('does not fuse words across tag boundaries', () => {
    const { text } = extractPage(page('<p>freight</p><p>warehousing</p>'))
    expect(text).toBe('freight warehousing')
  })

  it('decodes entities, named and numeric', () => {
    const { text } = extractPage(page('<p>Bar&amp;Grill &mdash; caf&#233; &#x2014; 24&nbsp;hours</p>'))
    expect(text).toBe('Bar&Grill — café — 24 hours')
  })

  it('keeps headings even when they sit inside chrome', () => {
    // A heading in a <header> is still a heading for structure scoring, even
    // though the header's text is stripped from the prose.
    const { headings } = extractPage(page('<header><h1>Northwind</h1></header><h2>Services</h2>'))
    expect(headings).toEqual([
      { level: 1, text: 'Northwind' },
      { level: 2, text: 'Services' },
    ])
  })

  it('truncates to the word budget', () => {
    const long = Array.from({ length: 5000 }, () => 'word').join(' ')
    const { text, wordCount } = extractPage(page(`<p>${long}</p>`), { maxWords: 100 })
    expect(text.split(' ')).toHaveLength(100)
    // wordCount reports what was really there, not what we kept.
    expect(wordCount).toBe(5000)
  })
})

describe('empty detection — the JS-rendered site case', () => {
  it('flags a page with almost no text', () => {
    const spa = page('<div id="root"></div>')
    expect(extractPage(spa).isEmpty).toBe(true)
  })

  it('does not flag a page with real copy', () => {
    const words = Array.from({ length: EMPTY_WORD_THRESHOLD + 10 }, () => 'freight').join(' ')
    expect(extractPage(page(`<p>${words}</p>`)).isEmpty).toBe(false)
  })

  it('is not fooled by a page that is all script', () => {
    const html = page(`<div id="app"></div><script>${'x'.repeat(5000)}</script>`)
    const r = extractPage(html)
    expect(r.isEmpty).toBe(true)
    expect(r.wordCount).toBeLessThan(EMPTY_WORD_THRESHOLD)
  })
})

describe('structureOf', () => {
  it('reports nesting when several heading levels are used', () => {
    const s = structureOf(extractPage(page('<h1>A</h1><h2>B</h2><h3>C</h3>')))
    expect(s).toEqual({ h1: 1, maxDepth: 3, hasNesting: true })
  })

  it('reports div soup — no headings at all', () => {
    const s = structureOf(extractPage(page('<div><div><span>text</span></div></div>')))
    expect(s).toEqual({ h1: 0, maxDepth: 0, hasNesting: false })
  })

  it('flags a page with headings but no nesting', () => {
    const s = structureOf(extractPage(page('<h2>A</h2><h2>B</h2>')))
    expect(s.hasNesting).toBe(false)
    expect(s.h1).toBe(0)
  })
})
