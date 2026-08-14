// Content negotiation for `Accept: text/markdown` — shared by `proxy.ts` (which
// decides whether to rewrite) and `app/md/[[...path]]/route.ts` (which renders).
//
// Only requests that explicitly ask for markdown get markdown. A browser's
// `text/html,application/xhtml+xml,...,*/*;q=0.8` must never match, so `*/*`
// alone is not enough — the client has to name `text/markdown` and rank it at
// least as high as HTML.

/** Internal route that renders the markdown representation of a page. */
export const MARKDOWN_ROUTE_PREFIX = '/md'

/** Set on the self-fetch that pulls a page's HTML, so `proxy` doesn't loop. */
export const RENDER_GUARD_HEADER = 'x-epyc-markdown-render'

/**
 * Set by `proxy` when markdown is being served under the page's own URL rather
 * than under `/md/...`. Those responses must not be shared-cached: Cloudflare
 * keys its cache on the URL and ignores `Vary`, so a cached markdown copy would
 * be handed to the next browser that asks for the page.
 */
export const NEGOTIATED_HEADER = 'x-epyc-markdown-negotiated'

const MARKDOWN_TYPES = ['text/markdown', 'text/x-markdown', 'text/plain+markdown']
const HTML_TYPES = ['text/html', 'application/xhtml+xml']

type AcceptEntry = { type: string; q: number }

function parseAccept(accept: string): AcceptEntry[] {
  return accept
    .split(',')
    .map((part) => {
      const [rawType, ...params] = part.split(';')
      const type = rawType.trim().toLowerCase()
      if (!type) return null
      const qParam = params.map((p) => p.trim()).find((p) => p.toLowerCase().startsWith('q='))
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1
      return { type, q: Number.isFinite(q) ? q : 1 }
    })
    .filter((entry): entry is AcceptEntry => entry !== null)
}

function bestQuality(entries: AcceptEntry[], types: string[]): number {
  return entries
    .filter((entry) => types.includes(entry.type))
    .reduce((best, entry) => Math.max(best, entry.q), 0)
}

/** True when the client explicitly prefers markdown over HTML. */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false
  const entries = parseAccept(accept)
  const markdownQ = bestQuality(entries, MARKDOWN_TYPES)
  if (markdownQ <= 0) return false
  return markdownQ >= bestQuality(entries, HTML_TYPES)
}

const NON_NEGOTIABLE_PREFIXES = [
  '/api/',
  '/_next/',
  MARKDOWN_ROUTE_PREFIX,
  '/images/',
  '/icons/',
  '/fonts/',
  '/og/',
  '/videos/',
]

/**
 * Page routes only. Asset and API paths keep their own content types, and a
 * path with a file extension (`/robots.txt`, `/sitemap.xml`, `/favicon.ico`)
 * is already a concrete representation.
 */
export function isNegotiablePath(pathname: string): boolean {
  if (pathname === MARKDOWN_ROUTE_PREFIX) return false
  if (NON_NEGOTIABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  return !lastSegment.includes('.')
}

/** `charCount / 4` — the usual rough estimate, matching Cloudflare's header. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4))
}
