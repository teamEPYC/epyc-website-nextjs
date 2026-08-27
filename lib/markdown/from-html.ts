// Dependency-free HTML → Markdown converter.
//
// Used for two inputs: CMS rich-text `content` (a small, predictable tag set)
// and full rendered pages fetched from this app (see `app/md/[[...path]]/route.ts`).
// A DOM-based converter (turndown et al.) needs a DOM shim that does not exist in
// the Workers runtime, so this walks the tag stream positionally instead: opening
// tags emit their markdown prefix, closing tags emit the suffix. No tree is built,
// which is why the output tolerates the unbalanced markup real pages contain.

export type ConvertOptions = {
  /** Absolute origin used to expand root-relative `href`/`src` values. */
  baseUrl?: string
}

/** Tags whose entire subtree is dropped — scripts, styles, and inline SVG. */
const SKIP_TAGS = new Set([
  'script',
  'style',
  'svg',
  'noscript',
  'template',
  'head',
  'iframe',
  'canvas',
  'select',
  'textarea',
])

const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'div',
  'dl',
  'dd',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'header',
  'hgroup',
  'main',
  'nav',
  'p',
  'section',
  'table',
])

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  copy: '©',
  reg: '®',
  trade: '™',
  deg: '°',
  times: '×',
  rarr: '→',
  larr: '←',
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body: string) => {
    if (body.startsWith('#')) {
      const code =
        body.startsWith('#x') || body.startsWith('#X')
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match
    }
    return ENTITIES[body.toLowerCase()] ?? match
  })
}

function readAttribute(rawAttrs: string, name: string): string | undefined {
  const match = rawAttrs.match(
    new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'),
  )
  if (!match) return undefined
  const value = match[2] ?? match[3] ?? match[4] ?? ''
  return decodeEntities(value).trim() || undefined
}

function absolutise(url: string | undefined, baseUrl: string | undefined): string | undefined {
  if (!url || !baseUrl) return url
  if (url.startsWith('//') || !url.startsWith('/')) return url
  return `${baseUrl.replace(/\/+$/, '')}${url}`
}

type ListFrame = { ordered: boolean; index: number }
type Buffer = { chunks: string[]; suffix: string }

class MarkdownWriter {
  private buffers: Buffer[] = [{ chunks: [], suffix: '' }]
  private lists: ListFrame[] = []
  private quoteDepth = 0
  private preformatted = false
  private linkHrefs: (string | undefined)[] = []
  private tableCells: string[] | null = null
  private tableRowIsHeader = false

  constructor(private readonly options: ConvertOptions = {}) {}

  private get buffer(): Buffer {
    return this.buffers[this.buffers.length - 1]
  }

  private raw(value: string) {
    if (!value) return
    const buffer = this.buffer
    buffer.chunks.push(value)
    // A short rolling suffix is enough to answer "how many line breaks are
    // already here?" without re-joining the whole document on every tag.
    buffer.suffix = (buffer.suffix + value).slice(-32)
  }

  /** Line breaks already at the end of the current buffer, ignoring quote marks. */
  private trailingBreaks(): number {
    const trailing = /(?:[ \t>]*\n)*[ \t>]*$/.exec(this.buffer.suffix)?.[0] ?? ''
    return (trailing.match(/\n/g) ?? []).length
  }

  private newline(count: 1 | 2) {
    if (this.buffer.chunks.length === 0) return
    const existing = this.trailingBreaks()
    if (existing >= count) return
    const prefix = this.quoteDepth > 0 ? '> '.repeat(this.quoteDepth) : ''
    for (let i = existing; i < count; i += 1) {
      this.raw(i === count - 1 ? `\n${prefix}` : '\n')
    }
  }

  /**
   * The last block inside a blockquote leaves a `> ` marker waiting for content
   * that never comes. Left in place it prefixes whatever follows the quote.
   */
  private dropTrailingQuoteMarker() {
    const { chunks } = this.buffer
    while (chunks.length > 0 && /^\n?(?:> )+$/.test(chunks[chunks.length - 1])) {
      const dropped = chunks.pop() as string
      if (dropped.startsWith('\n')) chunks.push('\n')
      else break
    }
    this.buffer.suffix = chunks.slice(-8).join('').slice(-32)
  }

  private pushBuffer() {
    this.buffers.push({ chunks: [], suffix: '' })
  }

  private popBuffer(): string {
    const buffer = this.buffers.pop()
    return buffer ? buffer.chunks.join('') : ''
  }

  text(value: string) {
    if (this.preformatted) {
      this.raw(value)
      return
    }
    const collapsed = decodeEntities(value).replace(/\s+/g, ' ')
    if (!collapsed.trim()) {
      // Keep a single separating space between inline elements, never indent a
      // fresh line.
      if (collapsed && this.buffer.suffix && !/[\s>]$/.test(this.buffer.suffix)) this.raw(' ')
      return
    }
    this.raw(this.trailingBreaks() > 0 || this.buffer.chunks.length === 0 ? collapsed.trimStart() : collapsed)
  }

  openTag(tag: string, attrs: string) {
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        this.newline(2)
        this.raw(`${'#'.repeat(Number(tag[1]))} `)
        return
      case 'br':
        this.newline(1)
        return
      case 'hr':
        this.newline(2)
        this.raw('---')
        this.newline(2)
        return
      case 'ul':
      case 'ol':
        this.newline(this.lists.length > 0 ? 1 : 2)
        this.lists.push({ ordered: tag === 'ol', index: 0 })
        return
      case 'li': {
        const frame = this.lists[this.lists.length - 1]
        this.newline(1)
        const indent = '  '.repeat(Math.max(0, this.lists.length - 1))
        if (frame?.ordered) {
          frame.index += 1
          this.raw(`${indent}${frame.index}. `)
        } else {
          this.raw(`${indent}- `)
        }
        return
      }
      case 'blockquote':
        this.newline(2)
        this.quoteDepth += 1
        this.raw('> ')
        return
      case 'pre':
        this.newline(2)
        this.raw('```\n')
        this.preformatted = true
        return
      case 'code':
        if (!this.preformatted) this.raw('`')
        return
      case 'strong':
      case 'b':
        this.raw('**')
        return
      case 'em':
      case 'i':
        this.raw('*')
        return
      case 'del':
      case 's':
        this.raw('~~')
        return
      case 'a':
        // Link content is buffered: card-shaped links wrap headings and images,
        // which cannot sit inside `[...]`. See `closeTag`.
        this.linkHrefs.push(absolutise(readAttribute(attrs, 'href'), this.options.baseUrl))
        this.pushBuffer()
        return
      case 'img': {
        const src = absolutise(readAttribute(attrs, 'src'), this.options.baseUrl)
        const alt = readAttribute(attrs, 'alt')
        // An image with no alt text is decorative — it costs an agent tokens and
        // tells it nothing.
        if (src && alt) this.raw(`![${alt}](${src})`)
        return
      }
      case 'tr':
        this.tableCells = []
        this.tableRowIsHeader = false
        return
      case 'th':
      case 'td':
        this.tableRowIsHeader = this.tableRowIsHeader || tag === 'th'
        this.tableCells?.push('')
        return
      default:
        if (BLOCK_TAGS.has(tag)) this.newline(2)
    }
  }

  closeTag(tag: string) {
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        this.newline(2)
        return
      case 'ul':
      case 'ol':
        this.lists.pop()
        this.newline(this.lists.length > 0 ? 1 : 2)
        return
      case 'blockquote':
        this.quoteDepth = Math.max(0, this.quoteDepth - 1)
        this.dropTrailingQuoteMarker()
        this.newline(2)
        return
      case 'pre':
        this.preformatted = false
        this.raw('\n```')
        this.newline(2)
        return
      case 'code':
        if (!this.preformatted) this.raw('`')
        return
      case 'strong':
      case 'b':
        this.raw('**')
        return
      case 'em':
      case 'i':
        this.raw('*')
        return
      case 'del':
      case 's':
        this.raw('~~')
        return
      case 'a': {
        const href = this.linkHrefs.pop()
        const inner = this.popBuffer().trim()
        if (!href) {
          this.raw(inner)
          return
        }
        if (!inner) return
        if (inner.includes('\n')) {
          // Multi-block link (a project card): keep the blocks, then point at the
          // destination on its own line.
          this.newline(2)
          this.raw(inner)
          this.newline(2)
          this.raw(`[Open](${href})`)
          this.newline(2)
        } else {
          // Buttons sit side by side in the markup with no whitespace between
          // them; without this their labels would run together.
          if (/\)$/.test(this.buffer.suffix)) this.raw(' ')
          this.raw(`[${inner}](${href})`)
        }
        return
      }
      case 'tr': {
        const cells = this.tableCells
        this.tableCells = null
        if (!cells || cells.length === 0) return
        this.newline(1)
        this.raw(`| ${cells.map((cell) => cell.trim().replace(/\|/g, '\\|') || ' ').join(' | ')} |`)
        if (this.tableRowIsHeader) {
          this.newline(1)
          this.raw(`| ${cells.map(() => '---').join(' | ')} |`)
        }
        return
      }
      case 'table':
        this.newline(2)
        return
      default:
        if (BLOCK_TAGS.has(tag)) this.newline(2)
    }
  }

  /** Table cell text is buffered so a row can be emitted as one pipe line. */
  cellText(value: string): boolean {
    if (!this.isBufferingCell() || !this.tableCells) return false
    this.tableCells[this.tableCells.length - 1] += decodeEntities(value).replace(/\s+/g, ' ')
    return true
  }

  isBufferingCell(): boolean {
    return Boolean(this.tableCells && this.tableCells.length > 0)
  }

  toString(): string {
    // Truncated or unbalanced markup can leave an <a> open — flush its buffered
    // content rather than dropping it.
    while (this.buffers.length > 1) {
      const inner = this.popBuffer().trim()
      const href = this.linkHrefs.pop()
      if (!inner) continue
      this.raw(href && !inner.includes('\n') ? `[${inner}](${href})` : inner)
    }
    return this.buffer.chunks.join('')
  }
}

const TAG_PATTERN =
  /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!doctype[^>]*>|<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)\/?>/gi

const IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)]*)\)/g

/**
 * A run of three or more images with nothing between them is a logo wall or a
 * marquee. Their URLs are worth nothing to a reader; their alt text is the
 * content, and listing it costs a fraction of the tokens.
 */
function compressImageWalls(markdown: string): string {
  return markdown.replace(/(?:!\[[^\]]*\]\([^)]*\)\s*){3,}/g, (run) => {
    // Marquees repeat their logo set to fake an infinite scroll, so dedupe.
    const alts = [
      ...new Set([...run.matchAll(IMAGE_PATTERN)].map(([, alt]) => alt.trim()).filter(Boolean)),
    ]
    if (alts.length < 3) return run
    return `Images: ${alts.join(', ')}\n\n`
  })
}

function tidy(markdown: string): string {
  return compressImageWalls(markdown)
    .replace(/!?\[\s*\]\([^)]*\)/g, '') // icon-only links and alt-less images
    .replace(/[ \t]+$/gm, '')
    .replace(/^(?:> )+$/gm, '')
    // `SectionHeading` renders decorative slashes around its label ("/ FAQs /").
    .replace(/^(#{1,6} )\/\s*(.*?)\s*\/$/gm, '$1$2')
    .replace(/(^|\n)#{1,6} (?=\n|$)/g, '$1') // headings emptied by skipped subtrees
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function htmlToMarkdown(html: string, options: ConvertOptions = {}): string {
  if (!html) return ''

  const writer = new MarkdownWriter(options)
  let skipTag: string | null = null
  let skipDepth = 0
  let cursor = 0

  TAG_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TAG_PATTERN.exec(html)) !== null) {
    const between = html.slice(cursor, match.index)
    cursor = match.index + match[0].length

    if (!skipTag && between) {
      if (!writer.cellText(between)) writer.text(between)
    }

    const tag = match[1]?.toLowerCase()
    if (!tag) continue // comment / doctype / CDATA
    const isClosing = match[0].startsWith('</')

    if (skipTag) {
      if (tag !== skipTag) continue
      if (isClosing) {
        skipDepth -= 1
        if (skipDepth === 0) skipTag = null
      } else if (!match[0].endsWith('/>')) {
        skipDepth += 1
      }
      continue
    }

    if (!isClosing && SKIP_TAGS.has(tag)) {
      if (!match[0].endsWith('/>')) {
        skipTag = tag
        skipDepth = 1
      }
      continue
    }

    // Cells buffer their own text, so inline tags inside a cell are dropped
    // rather than leaking into the surrounding stream.
    if (writer.isBufferingCell() && !['td', 'th', 'tr', 'table'].includes(tag)) continue

    if (isClosing) writer.closeTag(tag)
    else {
      writer.openTag(tag, match[2] ?? '')
      if (VOID_TAGS.has(tag)) continue
    }
  }

  const trailing = html.slice(cursor)
  if (!skipTag && trailing) {
    if (!writer.cellText(trailing)) writer.text(trailing)
  }

  return tidy(writer.toString())
}

/**
 * Drops runs of blocks that repeat verbatim straight after themselves.
 *
 * Responsive layouts on this site render a desktop and a mobile variant of the
 * same section and hide one with CSS. Both are in the HTML, so the naive
 * conversion emits every such section twice.
 */
export function dedupeRepeatedBlocks(markdown: string): string {
  const blocks = markdown.split(/\n{2,}/)
  const out: string[] = []

  for (let i = 0; i < blocks.length; ) {
    let consumed = 0
    // Longest run first: a repeated 9-card section must collapse as one run, not
    // as nine unrelated single-block repeats.
    const maxRun = Math.floor((blocks.length - i) / 2)
    for (let run = maxRun; run >= 1; run -= 1) {
      let identical = true
      for (let k = 0; k < run; k += 1) {
        if (blocks[i + k] !== blocks[i + run + k]) {
          identical = false
          break
        }
      }
      if (identical) {
        consumed = run
        break
      }
    }

    if (consumed > 0) {
      for (let k = 0; k < consumed; k += 1) out.push(blocks[i + k])
      i += consumed * 2
    } else {
      out.push(blocks[i])
      i += 1
    }
  }

  return out.join('\n\n')
}

/** Extracts `<body>` (falling back to the whole document) before converting. */
export function documentToMarkdown(html: string, options: ConvertOptions = {}): string {
  const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)
  return dedupeRepeatedBlocks(htmlToMarkdown(body ? body[1] : html, options))
}
