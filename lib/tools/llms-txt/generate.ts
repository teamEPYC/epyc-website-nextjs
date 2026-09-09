/**
 * The one model call: corpus in, a described map of the site out.
 *
 * The model supplies judgement — what this company is, what each page is for,
 * which section a page belongs in. It supplies nothing we already hold: titles
 * and URLs come from `tool_pages`, and a URL it invents is discarded.
 *
 * The guard that matters is `evidence`. A description with nothing quoted
 * behind it is dropped, and the dropped pages are the report. A tool whose
 * pitch is "your pages do not say plainly what they are" cannot ship a model
 * that writes the missing sentence out of a URL slug — that would manufacture
 * the copy that disproves its own finding.
 *
 * See docs/llms-txt-architecture.md §2.2.
 */

import { SCORING_CHAIN, completeJson } from '../models'
import type { StoredPage } from '../session'
import { OPTIONAL_SECTION, type LlmsTxtDoc, type LlmsSection } from './render'

/** Same ceiling as the chatbot's scoring call — well inside a 1M window. */
const MAX_CORPUS_CHARS = 300_000

/**
 * Regenerations of one session's file per day.
 *
 * The real bound is upstream: three sessions per visitor per day. This only
 * stops a client re-POSTing the same session id in a loop.
 */
export const GENERATIONS_PER_SESSION = 3

/**
 * Generations per day across everyone. Key: `global-llms-txt`.
 *
 * Per-visitor limits do not protect a shared account quota. OpenRouter meters
 * free usage per *account*, not per model (docs/ai-chatbot-plan.md → Checks
 * first, #1), so the chatbot and this tool spend the same allowance — and one
 * generation is a heavier call than a chat turn: the whole corpus in, 3000
 * tokens out. Without this, a script rotating IPs through the generator
 * exhausts the quota and takes the chatbot down with it.
 *
 * Its own key rather than sharing the chatbot's `global-messages`: the quota is
 * shared but the diagnosis should not be, and neither tool should be able to
 * starve the other outright. 100 here plus the chatbot's 200 stays inside the
 * ~1000 requests/day the funded account allows.
 */
export const GLOBAL_GENERATIONS_PER_DAY = 100

/** Long enough to be useful in a context-limited file, short enough to stay one line. */
const MAX_DESCRIPTION_CHARS = 200

/**
 * Suggested, not enforced. A model given a closed list forces every page into
 * it; a model given none invents twenty sections for twenty pages. This is the
 * middle, and anything it returns outside the list is kept as long as it is
 * short.
 */
const SUGGESTED_SECTIONS = [
  'Services',
  'Products',
  'Work',
  'About',
  'Pricing',
  'Contact',
  OPTIONAL_SECTION,
] as const

type ModelPage = {
  url?: string
  section?: string
  description?: string
  evidence?: string
}

type ModelOutput = {
  name?: string
  summary?: string
  pages?: ModelPage[]
}

export type SkippedPage = { url: string; title: string }

export type GenerateResult = {
  doc: LlmsTxtDoc
  /** Pages the model could not describe from their own text. The finding. */
  skipped: SkippedPage[]
}

export async function generateLlmsTxt(
  apiKey: string,
  host: string,
  pages: StoredPage[],
  opts: { allowPaid?: boolean } = {},
): Promise<GenerateResult> {
  const byUrl = new Map(pages.map((p) => [p.url, p]))

  let corpus = ''
  for (const page of pages) {
    if (!page.text?.trim()) continue
    const block = `## ${page.title || 'Untitled'}\nURL: ${page.url}\n\n${page.text}`
    if (corpus.length + block.length > MAX_CORPUS_CHARS) break
    corpus += (corpus ? '\n\n---\n\n' : '') + block
  }

  const result = await completeJson<ModelOutput>({
    apiKey,
    chain: SCORING_CHAIN,
    allowPaid: opts.allowPaid,
    maxTokens: 3000,
    messages: [
      {
        role: 'system',
        content: `You write llms.txt files: a short, factual map of a website for an AI assistant with limited context. You work ONLY from the supplied page text and never use outside knowledge about the company, even if you recognise it. You never invent a page, a service, a claim or a number. When a page's text does not say plainly what the page is for, you leave its description empty rather than guessing. Reply with JSON only. Never use a double-quote character inside a JSON string value — use a single quote if you need to quote something, so the JSON always parses.`,
      },
      {
        role: 'user',
        content: `Website: ${host}

Write an llms.txt for this site.

- "name": what the company calls itself, taken from the pages. Not a slogan.
- "summary": ONE line, under 25 words, saying what this company does and who for. Plain language, no marketing adjectives.
- For each page, write "description": one factual sentence, under 25 words, saying what a reader finds on that page. Not a summary of the company — a description of THAT page.
- "evidence": the exact words from that page's text that your description is based on. If the page does not plainly say what it is for, return an EMPTY description and an EMPTY evidence string. Leaving it blank is correct and expected — do not guess.
- "section": group the page. Prefer one of ${SUGGESTED_SECTIONS.map((s) => `"${s}"`).join(', ')}. Use "${OPTIONAL_SECTION}" for blog posts, news, legal pages and anything a reader could skip.
- Use ONLY the URLs listed in the content below. Never write a URL that does not appear there.

Reply with exactly this JSON shape and nothing else:
{"name":"<name>","summary":"<one line>","pages":[{"url":"<exact url>","section":"<section>","description":"<one sentence or empty>","evidence":"<exact quote or empty>"}]}

--- WEBSITE CONTENT ---
${corpus}`,
      },
    ],
  })

  // Grouping happens here, not in the model: a flat list cannot be malformed,
  // and section order is a decision we would rather make than parse.
  const sections = new Map<string, LlmsSection>()
  const described = new Set<string>()

  for (const entry of result.pages ?? []) {
    const url = entry.url?.trim()
    if (!url) continue

    // A page the model invented never reaches the file. This lands on someone's
    // real website; a 404 in it is worse than a missing line.
    const source = byUrl.get(url)
    if (!source || described.has(url)) continue

    const description = entry.description?.trim()
    const evidence = entry.evidence?.trim()
    if (!description || !evidence) continue

    described.add(url)

    const name = sectionName(entry.section)
    const section = sections.get(name) ?? { name, pages: [] }
    section.pages.push({
      url,
      // Never the model's version — we already hold the real one.
      title: source.title || '',
      description:
        description.length > MAX_DESCRIPTION_CHARS
          ? `${description.slice(0, MAX_DESCRIPTION_CHARS).trimEnd()}…`
          : description,
    })
    sections.set(name, section)
  }

  const skipped = pages
    .filter((p) => !described.has(p.url))
    .map((p) => ({ url: p.url, title: p.title || '' }))

  return {
    doc: {
      name: clean(result.name) || host,
      summary: clean(result.summary),
      sections: [...sections.values()],
    },
    skipped,
  }
}

/** Free-form, but bounded — a section heading is two or three words. */
function sectionName(raw: string | undefined): string {
  const name = clean(raw)
  if (!name || name.length > 40) return OPTIONAL_SECTION
  return name
}

function clean(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}
