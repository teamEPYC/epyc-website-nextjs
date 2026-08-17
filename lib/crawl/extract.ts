/**
 * HTML → the text an AI assistant would actually read, plus the structural
 * facts the report scores.
 *
 * One pass produces both. The report needs heading depth and word counts, and
 * crawling twice to get them would be silly.
 *
 * ponytail: string/regex extraction, not a DOM parse. Workers has no
 * DOMParser, HTMLRewriter is not available in the Node dev runtime or in
 * tests, and pulling in a parser to strip tags would be a dependency for
 * something a few replacements do. Known ceiling: malformed nesting can
 * over-strip, and content hidden by CSS still counts as text. Upgrade path if
 * that ever bites is HTMLRewriter behind this same function signature — no
 * caller changes.
 */

export type Heading = { level: number; text: string }

export type PageExtract = {
  title: string
  text: string
  headings: Heading[]
  wordCount: number
  /** True when there is too little text to answer anything — usually a JS-rendered SPA. */
  isEmpty: boolean
}

/** Below this, a page is not readable content. Drives the `empty` crawl status. */
export const EMPTY_WORD_THRESHOLD = 50

/** Elements whose contents are never page copy. */
const DROP_CONTENT = /<(script|style|noscript|template|svg|iframe|form|select)\b[^>]*>[\s\S]*?<\/\1>/gi

/** Chrome that repeats on every page and would drown the real copy. */
const DROP_CHROME = /<(nav|header|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi

export function extractPage(html: string, opts: { maxWords?: number } = {}): PageExtract {
  const maxWords = opts.maxWords ?? 3000

  const title = decodeEntities(
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim(),
  )

  // Drop <head> before anything else, or its text nodes — the <title> above
  // all — land in the prose and every page's corpus opens with its own title.
  const withoutHead = html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, ' ')

  // Headings come from the pre-chrome-stripped body: a heading inside a
  // <header> is still a heading for structure-scoring purposes.
  const body = withoutHead.replace(DROP_CONTENT, ' ')
  const headings = collectHeadings(body)

  const prose = body.replace(DROP_CHROME, ' ')
  const text = toText(prose)
  const words = text ? text.split(/\s+/) : []

  return {
    title,
    text: words.slice(0, maxWords).join(' '),
    headings,
    wordCount: words.length,
    isEmpty: words.length < EMPTY_WORD_THRESHOLD,
  }
}

function collectHeadings(html: string): Heading[] {
  const out: Heading[] = []
  for (const m of html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const text = toText(m[2])
    if (text) out.push({ level: Number(m[1]), text })
  }
  return out
}

function toText(html: string): string {
  return decodeEntities(
    html
      // Block boundaries become spaces so words don't fuse across tags.
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
}

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : whole
    }
    return NAMED[body.toLowerCase()] ?? whole
  })
}

/**
 * Structure signal for the report: are headings real and nested, or is the
 * page one undifferentiated block?
 */
export function structureOf(extract: PageExtract): {
  h1: number
  maxDepth: number
  hasNesting: boolean
} {
  const levels = extract.headings.map((h) => h.level)
  return {
    h1: levels.filter((l) => l === 1).length,
    maxDepth: levels.length ? Math.max(...levels) : 0,
    hasNesting: new Set(levels).size > 1,
  }
}
