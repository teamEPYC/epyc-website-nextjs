// Markdown representation of any page route.
//
// `middleware.ts` rewrites a request carrying `Accept: text/markdown` to this route,
// so `GET /website-redesign` with that header lands on `/md/website-redesign`.
// The route is also directly addressable — `GET /md/website-redesign` returns the
// same body — which gives agents a plain URL when they cannot set headers.
//
// Two content paths:
//   1. CMS-driven routes are built from Strapi fields (`lib/markdown/sources.ts`).
//   2. Everything else is served by fetching this app's own HTML for the route
//      and converting it. New pages are therefore covered the day they ship,
//      with no per-page work.

import type { NextRequest } from 'next/server'
import { decodeEntities, documentToMarkdown } from '@/lib/markdown/from-html'
import { buildFromSource, faqSection, frontMatter } from '@/lib/markdown/sources'
import { estimateTokens, NEGOTIATED_HEADER, RENDER_GUARD_HEADER } from '@/lib/markdown/negotiate'

export const revalidate = 60

type RouteContext = { params: Promise<{ path?: string[] }> }

function readTag(html: string, pattern: RegExp): string | undefined {
  const value = pattern.exec(html)?.[1]
  return value ? decodeEntities(value).trim() || undefined : undefined
}

async function renderFromHtml(pathname: string, origin: string, request: NextRequest) {
  const response = await fetch(new URL(pathname, origin), {
    headers: {
      accept: 'text/html',
      // Tells the middleware this is the HTML fetch backing a markdown response, so it
      // does not negotiate again and recurse.
      [RENDER_GUARD_HEADER]: '1',
      'user-agent': request.headers.get('user-agent') ?? 'EPYC-markdown-renderer',
    },
    next: { revalidate: 60 },
  })

  const html = await response.text()
  if (!response.ok) {
    return {
      status: response.status,
      markdown: `# ${response.status}\n\nNo page exists at \`${pathname}\`.\n\nStart from [${origin}](${origin}/md).`,
    }
  }

  const title = readTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  const description =
    readTag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ??
    readTag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)

  return {
    status: 200,
    markdown: [
      frontMatter({ title, description, url: `${origin}${pathname}`, type: 'page' }) +
        documentToMarkdown(html, { baseUrl: origin }),
      faqSection(pathname, html),
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { path } = await params
  const pathname = `/${(path ?? []).join('/')}`
  const origin = new URL(request.url).origin

  const fromSource = await buildFromSource(pathname, origin)
  const { markdown, status } = fromSource
    ? {
        markdown: [fromSource.markdown, faqSection(pathname)].filter(Boolean).join('\n\n'),
        status: fromSource.status ?? 200,
      }
    : await renderFromHtml(pathname, origin, request)

  const body = `${markdown}\n`

  // Served under the page's own URL, a shared cache would hand this markdown to
  // the next browser asking for that page. Under /md/... the URL is unambiguous.
  const negotiated = request.headers.get(NEGOTIATED_HEADER) === '1'

  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      // Markdown and HTML are two representations of one URL — caches must key on
      // the request's Accept header or browsers get served markdown.
      vary: 'Accept',
      'x-markdown-tokens': String(estimateTokens(body)),
      // The canonical, indexable representation is the HTML page.
      'x-robots-tag': 'noindex, follow',
      link: `<${origin}${pathname}>; rel="canonical"`,
      'cache-control': negotiated
        ? 'private, max-age=0, must-revalidate'
        : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
