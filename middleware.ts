// Content negotiation for agents.
//
// A request for a page that says `Accept: text/markdown` is rewritten to
// `/md/<path>`, which returns a formatting-stripped markdown representation of
// the same URL (see `app/md/[[...path]]/route.ts`). Browsers — which never name
// `text/markdown` — fall through untouched and keep getting HTML.
//
// DO NOT rename this to `proxy.ts`. Next 16 renamed the convention and logs a
// deprecation warning for `middleware.ts`, but a `proxy.ts` file *always* runs on
// the Node.js runtime — Next rejects any `runtime` config on it outright
// ("Proxy always runs on Node.js runtime"). `@opennextjs/cloudflare` hard-fails
// the build on Node middleware ("Node.js middleware is not currently supported"),
// so naming this `proxy.ts` breaks production deploys. `middleware.ts` with no
// `runtime` key resolves to the edge runtime, which is what the adapter needs.
// Any explicit `runtime` here is also rejected, so there is nothing to add.
// If Next drops `middleware.ts`, this negotiation has to move into the Worker.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  MARKDOWN_ROUTE_PREFIX,
  NEGOTIATED_HEADER,
  RENDER_GUARD_HEADER,
  isNegotiablePath,
  prefersMarkdown,
} from '@/lib/markdown/negotiate'

export function middleware(request: NextRequest) {
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
