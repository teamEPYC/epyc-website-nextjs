// Content negotiation for agents.
//
// A request for a page that says `Accept: text/markdown` is rewritten to
// `/md/<path>`, which returns a formatting-stripped markdown representation of
// the same URL (see `app/md/[[...path]]/route.ts`). Browsers — which never name
// `text/markdown` — fall through untouched and keep getting HTML.
//
// Named `proxy.ts` because Next 16 renamed the `middleware` file convention.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  MARKDOWN_ROUTE_PREFIX,
  NEGOTIATED_HEADER,
  RENDER_GUARD_HEADER,
  isNegotiablePath,
  prefersMarkdown,
} from '@/lib/markdown/negotiate'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The markdown renderer fetches this app's own HTML to convert it. Negotiating
  // that request would rewrite it straight back to the renderer.
  if (request.headers.has(RENDER_GUARD_HEADER)) return NextResponse.next()

  if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.next()
  if (!isNegotiablePath(pathname)) return NextResponse.next()

  if (!prefersMarkdown(request.headers.get('accept'))) {
    // Same URL, two representations — tell caches the Accept header matters.
    const response = NextResponse.next()
    response.headers.set('Vary', 'Accept')
    return response
  }

  const target = request.nextUrl.clone()
  target.pathname = `${MARKDOWN_ROUTE_PREFIX}${pathname === '/' ? '' : pathname}`

  const forwarded = new Headers(request.headers)
  forwarded.set(NEGOTIATED_HEADER, '1')

  const response = NextResponse.rewrite(target, { request: { headers: forwarded } })
  response.headers.set('Vary', 'Accept')
  return response
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, and metadata files. Static
    // assets under /images, /icons, /fonts are additionally excluded by
    // `isNegotiablePath`, which also skips any path with a file extension.
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
