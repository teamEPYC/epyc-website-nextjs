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
 * The file is meant to give an assistant useful context, not a list of URLs it
 * could have got from the sitemap. Four things carry that, and each is a guard
 * or an ordering rather than a longer prompt: an overview above the links, the
 * pages that matter listed first, descriptions checked against the page's own
 * words, and archive junk left out entirely.
 *
 * See docs/llms-txt-architecture.md §2.2.
 */

import { urlScore } from '../../crawl/sitemap'
import { SCORING_CHAIN, completeJson } from '../models'
import type { StoredPage } from '../session'
import { OPTIONAL_SECTION, SECTION_ORDER, type LlmsTxtDoc, type LlmsSection } from './render'

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
 * generation is a heavier call than a chat turn: the whole corpus in, up to
 * 6000 tokens out. Without this, a script rotating IPs through the generator
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

/** The overview is context, not an essay — three sentences of it at most. */
const MAX_OVERVIEW_SENTENCES = 3

/**
 * How much quote to ask for per page.
 *
 * `evidence` is never rendered — it exists so `quoted()` can check the
 * description against the page — so a full sentence per page is output we pay
 * for in the token ceiling and then throw away. Twenty pages of it is what
 * pushed the reply past `maxTokens` and truncated the JSON. A dozen words is
 * still plenty to locate in the source text.
 */
const MAX_EVIDENCE_WORDS = 12

/**
 * A description shorter than this says nothing a title did not.
 * "Our services page" is four words and zero information.
 */
const MIN_DESCRIPTION_WORDS = 5

/**
 * How many links the reserved `Optional` section may carry.
 *
 * A crawl of a content-heavy site comes back mostly blog posts, and twelve of
 * them under `## Optional` turns a map of the company into a feed. The section
 * exists so a reader under pressure can drop it, but it still costs context to
 * skip past. The pages are already rank-ordered, so this keeps the best few.
 *
 * Only `Optional` is capped: the other sections are small by construction — a
 * site does not have nine pricing pages — and trimming About or Services would
 * be cutting the pages the file exists to point at.
 */
const MAX_OPTIONAL_PAGES = 5

/**
 * Suggested, not enforced. A model given a closed list forces every page into
 * it; a model given none invents twenty sections for twenty pages. This is the
 * middle, and anything it returns outside the list is kept as long as it is
 * short.
 *
 * The list is `SECTION_ORDER` itself, so the sections we ask for are exactly
 * the ones the renderer knows how to order.
 */
const SUGGESTED_SECTIONS = [...SECTION_ORDER, OPTIONAL_SECTION]

/**
 * URL shapes that never earn a line in an llms.txt.
 *
 * Paginated archives, tag and category indexes, author pages, on-site search
 * and feeds are navigation furniture: they hold no content of their own, they
 * churn, and `/blog/page/7` is stale the week after it is written. Listing them
 * spends a reader's context on links that describe nothing — the "just a list
 * of URLs" failure this tool exists to avoid.
 *
 * They are excluded, not skipped: they are not evidence that the site fails to
 * describe itself, so counting them in the finding would inflate it.
 */
const ARCHIVE_PATH = /(^|\/)(page|tag|tags|category|categories|topic|topics|author|search|feed|rss|atom|amp)(\/|$)/i

type ModelPage = {
  url?: string
  section?: string
  description?: string
  evidence?: string
}

type ModelOutput = {
  name?: string
  summary?: string
  overview?: string
  pages?: ModelPage[]
}

export type SkippedPage = { url: string; title: string }

export type GenerateResult = {
  doc: LlmsTxtDoc
  /** Pages the model could not describe from their own text. The finding. */
  skipped: SkippedPage[]
  /**
   * URLs left out on purpose: archive furniture, duplicates, and pages trimmed
   * off the end of `Optional`. Never the finding — see `skipped`.
   */
  excluded: number
}

export async function generateLlmsTxt(
  apiKey: string,
  host: string,
  pages: StoredPage[],
  opts: { allowPaid?: boolean } = {},
): Promise<GenerateResult> {
  const { candidates, excluded } = selectPages(pages)

  let corpus = ''
  for (const page of candidates) {
    if (!page.text?.trim()) continue
    const block = `## ${page.title || 'Untitled'}\nURL: ${page.url}\n\n${page.text}`
    if (corpus.length + block.length > MAX_CORPUS_CHARS) break
    corpus += (corpus ? '\n\n---\n\n' : '') + block
  }

  const result = await completeJson<ModelOutput>({
    apiKey,
    chain: SCORING_CHAIN,
    allowPaid: opts.allowPaid,
    // 3000 was enough when a page cost a URL, a section and one sentence. It is
    // not enough now that each page also carries a quote and the document
    // carries an overview: against a real 20-page site the reply was cut at
    // ~10,500 characters, mid-array, and `JSON.parse` failed on a truncated
    // `pages` list. Every tier truncates at the same ceiling, so the fallback
    // chain cannot save it — the visitor just gets a 503.
    //
    // Truncation is silent from here: it looks exactly like a model that cannot
    // write JSON. `MAX_EVIDENCE_WORDS` below is the other half of the fix.
    // ponytail: a fixed ceiling with ~2x headroom rather than a budget computed
    // from page count. If a site ever truncates again, the honest upgrade is
    // salvaging the complete array elements out of the cut reply, not a bigger
    // number — a partial file beats an error.
    maxTokens: 6000,
    messages: [
      {
        role: 'system',
        content: `You write llms.txt files: a short, factual map of a website for an AI assistant with limited context. You work ONLY from the supplied page text and never use outside knowledge about the company, even if you recognise it. You never invent a page, a service, a claim or a number: every figure you write must appear in the supplied text, character for character. When a page's text does not say plainly what the page is for, you leave its description empty rather than guessing. Reply with JSON only. Never use a double-quote character inside a JSON string value — use a single quote if you need to quote something, so the JSON always parses.`,
      },
      {
        role: 'user',
        content: `Website: ${host}

Write an llms.txt for this site. Its reader is an AI assistant that has never heard of this company and can only read what you write, so give it context, not a list of links.

- "name": what the company calls itself, taken from the pages. Not a slogan.
- "summary": ONE line, under 25 words, saying what this company does and who for. Plain language, no marketing adjectives.
- "overview": ${MAX_OVERVIEW_SENTENCES} short sentences at most, stating only facts the pages state — what the company sells, who its customers are, how it works with them, where it operates. This is the part an assistant reads before it opens any link, so make it the most useful ${MAX_OVERVIEW_SENTENCES} sentences on the whole site. Do not repeat the summary: it is printed directly above the overview. Prefer facts that will still be true in a year — what the company does, who for, how — over anything dated or promotional: awards, current campaigns, 'new' or 'now', follower and customer counts, funding rounds, seasonal offers. No adjectives that cannot be checked ('leading', 'innovative', 'world-class'), no figure the pages do not state. Leave it empty if the site never says what it does.
- For each page, write "description": one factual sentence, under 25 words, saying what a reader finds ON THAT PAGE and why they would open it — the specific offerings, audience, or facts it names. Not a summary of the company. Do not restate the page title, and never open with filler such as 'Learn more about', 'This page', 'Welcome to' or 'Discover'. Prefer what is durable about the page over what is current on it.
- Never write the same description twice. If two pages would get the same sentence, say what makes each one different; if only one of them really has its own subject, leave the other's description empty.
- "evidence": the exact words from that page's text that your description is based on, copied verbatim — at most ${MAX_EVIDENCE_WORDS} words, just enough to find the sentence again. If the page does not plainly say what it is for, return an EMPTY description and an EMPTY evidence string. Leaving it blank is correct and expected — do not guess.
- "section": group the page by what it is for. Prefer one of ${SUGGESTED_SECTIONS.map((s) => `"${s}"`).join(', ')}. Use "${OPTIONAL_SECTION}" for blog posts, news, legal pages and anything a reader could skip — at most ${MAX_OPTIONAL_PAGES} of them, the most useful ones, since the rest will be dropped.
- Use ONLY the URLs listed in the content below. Never write a URL that does not appear there. Do not list paginated archives, tag or category indexes, or search pages.
- Numbers must be consistent with the pages and with each other: if the summary, the overview and a description all mention how many customers there are, they must all say the number the site says.

Reply with exactly this JSON shape and nothing else:
{"name":"<name>","summary":"<one line>","overview":"<up to ${MAX_OVERVIEW_SENTENCES} sentences>","pages":[{"url":"<exact url>","section":"<section>","description":"<one sentence or empty>","evidence":"<exact quote or empty>"}]}

--- WEBSITE CONTENT ---
${corpus}`,
      },
    ],
  })

  return buildDoc(host, candidates, result, excluded)
}

/**
 * Model output + the pages we actually hold → the document, and the finding.
 *
 * Pure, so every guard below is testable without a network call — the same
 * split as `render.ts`, for the same reason. `generateLlmsTxt` above is then
 * only the prompt and the fetch.
 */
export function buildDoc(
  host: string,
  candidates: StoredPage[],
  output: ModelOutput,
  excluded = 0,
): GenerateResult {
  const byUrl = new Map(candidates.map((p) => [p.url, p]))
  const corpus = candidates.map((p) => p.text ?? '').join(' ')

  // Grouping happens here, not in the model: a flat list cannot be malformed,
  // and section order is a decision we would rather make than parse.
  const sections = new Map<string, LlmsSection>()
  const described = new Set<string>()
  const seenDescriptions = new Set<string>()

  for (const entry of output.pages ?? []) {
    const url = entry.url?.trim()
    if (!url) continue

    // A page the model invented never reaches the file. This lands on someone's
    // real website; a 404 in it is worse than a missing line.
    const source = byUrl.get(url)
    if (!source || described.has(url)) continue

    const description = describe(entry, source)
    if (!description) continue

    // The same sentence twice is the file telling a reader nothing, twice. It
    // also happens to be the finding: two pages that describe identically do
    // not distinguish themselves, so the loser joins the skipped list rather
    // than getting a bullet that repeats the one above it.
    //
    // ponytail: exact match after normalising, not a similarity score. It
    // catches the copy-paste case, which is the one that actually happens.
    // Upgrade path if paraphrase duplication shows up in real output is word
    // overlap here — nothing else moves.
    const fingerprint = normalise(description)
    if (seenDescriptions.has(fingerprint)) continue
    seenDescriptions.add(fingerprint)

    described.add(url)

    const name = sectionName(entry.section)
    const section = sections.get(name) ?? { name, pages: [] }
    section.pages.push({
      url,
      // Never the model's version — we already hold the real one.
      title: source.title || '',
      description,
    })
    sections.set(name, section)
  }

  // Most useful page first inside every section, by the same ranking that chose
  // what to crawl. Model output order is arbitrary, and so is the order D1
  // hands the rows back in.
  let trimmed = 0
  for (const section of sections.values()) {
    section.pages.sort((a, b) => rankOf(a.url) - rankOf(b.url))

    if (section.name === OPTIONAL_SECTION && section.pages.length > MAX_OPTIONAL_PAGES) {
      trimmed += section.pages.length - MAX_OPTIONAL_PAGES
      section.pages = section.pages.slice(0, MAX_OPTIONAL_PAGES)
    }
  }

  // A page cut for length stays in `described`, so it never reaches the
  // finding: it was describable, we chose not to list it. `excluded` is the
  // bucket for "left out on purpose", `skipped` stays "the site never said what
  // this page was for", and the two must not blur — the finding is the number
  // this whole tool exists to report.
  const skipped = candidates
    .filter((p) => !described.has(p.url))
    .map((p) => ({ url: p.url, title: p.title || '' }))

  const claimed = clean(output.summary)
  // A summary quoting a figure the site never states is the one line of this
  // file everybody reads. It goes or it is right.
  const summary = numbersSupported(claimed, corpus) ? claimed : ''

  return {
    doc: {
      name: clean(output.name) || host,
      summary,
      overview: overviewOf(output.overview, corpus, summary),
      sections: [...sections.values()],
    },
    skipped,
    excluded: excluded + trimmed,
  }
}

/**
 * Which crawled pages are candidates for the file at all.
 *
 * Two removals, both deterministic. Archive furniture (above) carries no
 * content of its own. And `/about` and `/about/` are one page that the crawl
 * fetched twice — listing both wastes a bullet and tells a reader the site has
 * a duplicate it does not have; the better-ranked copy wins.
 *
 * Returned in rank order so the corpus itself leads with the pages that matter,
 * which is also the order the model reads them in.
 */
export function selectPages(pages: StoredPage[]): { candidates: StoredPage[]; excluded: number } {
  const ranked = [...pages].sort((a, b) => rankOf(a.url) - rankOf(b.url))
  const seen = new Set<string>()
  const candidates: StoredPage[] = []

  for (const page of ranked) {
    let path: string
    try {
      path = new URL(page.url).pathname
    } catch {
      continue
    }

    if (ARCHIVE_PATH.test(path)) continue

    const key = path.replace(/\/+$/, '').toLowerCase() || '/'
    if (seen.has(key)) continue
    seen.add(key)

    candidates.push(page)
  }

  return { candidates, excluded: pages.length - candidates.length }
}

function rankOf(url: string): number {
  try {
    return urlScore(new URL(url).pathname)
  } catch {
    return Number.MAX_SAFE_INTEGER
  }
}

/**
 * The description, if it survives every check; otherwise nothing, and the page
 * becomes part of the finding.
 *
 * Each rejection is a specific thing this kind of call does when the page it
 * was handed is thin, and each one puts text on someone's real website if it
 * gets through.
 */
function describe(entry: ModelPage, source: StoredPage): string | null {
  const description = clean(entry.description)
  const evidence = clean(entry.evidence)
  if (!description || !evidence) return null

  // The quote has to be in the page. Checking only that the field is non-empty
  // makes `evidence` a formality a model satisfies by writing a sentence it
  // likes the sound of — which is exactly the guess the empty description was
  // meant to prevent.
  if (!quoted(evidence, source.text ?? '')) return null

  // A figure the page does not state is invented, whatever the quote said.
  if (!numbersSupported(description, source.text ?? '')) return null

  const words = normalise(description)
  if (!words || words === normalise(source.title)) return null
  if (words.split(' ').length < MIN_DESCRIPTION_WORDS) return null

  return description.length > MAX_DESCRIPTION_CHARS
    ? `${description.slice(0, MAX_DESCRIPTION_CHARS).trimEnd()}…`
    : description
}

/**
 * The overview, minus any sentence quoting a figure the site never states.
 *
 * Sentence by sentence rather than all-or-nothing: one invented number should
 * cost the file that sentence, not the whole overview — which is the half of
 * this file that makes it worth more than the sitemap.
 */
function overviewOf(raw: string | undefined, corpus: string, summary: string): string {
  const text = clean(raw)
  if (!text) return ''

  const said = normalise(summary)

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && numbersSupported(sentence, corpus))
    // The summary sits three lines above, in a blockquote. Saying it again in
    // the first sentence of the overview spends the reader's attention on
    // something they have already read — and a model handed "write a summary"
    // and "write an overview" of the same site reliably opens with the summary.
    .filter((sentence) => !restates(normalise(sentence), said))
    .slice(0, MAX_OVERVIEW_SENTENCES)
    .join(' ')
}

/**
 * Does this sentence say only what the summary already said?
 *
 * Equality, or the summary swallowing the sentence whole. Deliberately not the
 * other direction: a sentence that contains the summary and goes on — "Acme
 * builds payment rails for marketplaces in India, from a team in Bengaluru" —
 * is elaboration, which is the entire job of the overview. Catching the literal
 * repeat is worth a guard; judging how much elaboration is enough is not, and
 * the prompt asks for it directly.
 */
function restates(sentence: string, summary: string): boolean {
  if (!sentence || !summary) return false
  return sentence === summary || summary.includes(sentence)
}

/**
 * Is this quote really in that page?
 *
 * Verbatim after normalising case, punctuation and whitespace — a model that
 * copied a sentence and changed a comma still copied it. Failing that, most of
 * the quote's words have to be there, because models routinely join two halves
 * of a real sentence or drop a stray word from the middle. Below that bar it is
 * not a quote, it is a paraphrase, and a paraphrase is a guess.
 */
function quoted(evidence: string, text: string): boolean {
  const needle = normalise(evidence)
  const haystack = normalise(text)
  if (!needle || !haystack) return false
  if (haystack.includes(needle)) return true

  const words = needle.split(' ').filter((w) => w.length > 2)
  if (words.length < 3) return false
  const found = words.filter((w) => haystack.includes(w)).length
  return found / words.length >= 0.8
}

/**
 * Every figure in `claim` appears in `source`.
 *
 * The cheapest possible consistency check and the one that matters: a number is
 * either on the page or it is not, and a hallucinated "300+ clients" in a file
 * a customer publishes is the failure with the longest tail. Commas are
 * stripped from both sides so "10,000" matches "10000".
 *
 * ponytail: a substring test, so a figure that appears somewhere else on the
 * page passes. That is the right way to be wrong — this is a floor under
 * invention, not a proof of relevance.
 */
function numbersSupported(claim: string, source: string): boolean {
  const haystack = source.replace(/,/g, '')
  return (claim.match(/\d[\d,.]*/g) ?? []).every((figure) =>
    haystack.includes(figure.replace(/,/g, '').replace(/\.$/, '')),
  )
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
