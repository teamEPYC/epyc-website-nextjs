/**
 * Structured document → the `llms.txt` file itself.
 *
 * Pure, no I/O, no model. The convention (Answer.AI, Sept 2024) is a fixed
 * shape: H1 name, blockquote summary, H2 sections, one bullet per page reading
 * `- [Title](url): description`. `## Optional` is a reserved heading meaning
 * "drop this section if context is tight", so it always sorts last.
 *
 * Rendering is separate from generating because the model's job is judgement
 * and this file's job is format. Keeping them apart means the format is
 * testable without a network call — see render.test.ts.
 */

export type LlmsPage = {
  url: string
  title: string
  description: string
}

export type LlmsSection = {
  name: string
  pages: LlmsPage[]
}

export type LlmsTxtDoc = {
  /** The company or site name. H1. */
  name: string
  /** One line, no full stop needed. The blockquote under the H1. */
  summary: string
  /**
   * The company overview: a few factual sentences, as one paragraph between the
   * blockquote and the first `## `.
   *
   * The convention reserves exactly this slot for free-form context — any
   * markdown except a heading — and it is the half of the file that makes it
   * worth reading. A bare list of links tells an assistant which pages exist;
   * this tells it who it is talking about before it opens any of them.
   */
  overview?: string
  sections: LlmsSection[]
}

/** Reserved section name from the convention. Always rendered last. */
export const OPTIONAL_SECTION = 'Optional'

/**
 * Section order, most useful context first.
 *
 * The order a model happens to emit its sections in is not an editorial
 * decision, but the file reads as though it were. An assistant working under a
 * context limit reads top-down and may stop early, so the sections that answer
 * "who is this and what do they sell" go above the ones that answer "what else
 * is on the site". Anything the model names outside this list keeps its own
 * order, below these and above `Optional`.
 */
export const SECTION_ORDER: readonly string[] = [
  'About',
  'Services',
  'Products',
  'Pricing',
  'Work',
  'Contact',
]

function sectionRank(name: string): number {
  if (name === OPTIONAL_SECTION) return SECTION_ORDER.length + 1
  const known = SECTION_ORDER.indexOf(name)
  return known === -1 ? SECTION_ORDER.length : known
}

/**
 * Link text cannot contain unescaped brackets, and a title that arrived with a
 * newline in it would break the bullet across two lines.
 */
function linkText(title: string): string {
  return title.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim()
}

/** The separators sites put between a page title and their own name. */
const BRAND_SEPARATORS = ['|', '-', '–', '—', '·', '::', ':']

/**
 * Drop the site's own name from a page title.
 *
 * Titles come from the `<title>` tag, which almost always carries the brand —
 * "Pricing | Acme", "Acme — About". Under an H1 that already says `# Acme`,
 * repeating it on all twenty bullets is noise in a file whose whole purpose is
 * fitting into a small context window.
 *
 * Only an exact match on the name is removed, at one end or the other. A title
 * that is *nothing but* the brand keeps it — "Acme" is better link text than an
 * empty string.
 */
function trimBrand(title: string, name: string): string {
  const brand = name.trim()
  if (!brand) return title

  for (const sep of BRAND_SEPARATORS) {
    const suffix = ` ${sep} ${brand}`
    if (title.toLowerCase().endsWith(suffix.toLowerCase())) {
      return title.slice(0, -suffix.length).trim() || title
    }

    const prefix = `${brand} ${sep} `
    if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
      return title.slice(prefix.length).trim() || title
    }
  }

  return title
}

/** Descriptions live after a colon on one line, so they are flattened. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function renderLlmsTxt(doc: LlmsTxtDoc): string {
  const name = oneLine(doc.name)
  const out: string[] = [`# ${name || 'Untitled site'}`]

  const summary = oneLine(doc.summary)
  if (summary) out.push(`> ${summary}`)

  const overview = oneLine(doc.overview ?? '')
  if (overview) out.push(overview)

  // Empty sections are dropped rather than rendered as a bare heading — a
  // heading with nothing under it reads as a missing page, not an empty one.
  // `sort` is stable, so sections outside SECTION_ORDER keep the order they
  // arrived in.
  const sections = doc.sections
    .filter((s) => s.pages.length > 0)
    .sort((a, b) => sectionRank(a.name) - sectionRank(b.name))

  for (const section of sections) {
    const lines = section.pages.map((page) => {
      const title = trimBrand(linkText(page.title), name) || page.url
      const description = oneLine(page.description)
      return description
        ? `- [${title}](${page.url}): ${description}`
        : `- [${title}](${page.url})`
    })
    out.push([`## ${oneLine(section.name)}`, ...lines].join('\n'))
  }

  // Trailing newline: this is a file someone saves to their web root.
  return `${out.join('\n\n')}\n`
}
