import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { timingSafeEqual } from 'node:crypto'

// Constant-time comparison so the secret can't be recovered via timing.
function secretMatches(provided: string | null): boolean {
  const expected = process.env.PREVIEW_SECRET
  if (!expected || !provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// GET /api/preview?secret=<token>&url=<internal-path>&status=draft
// Called by Strapi's Preview button. Validates the shared secret, turns on
// Next.js Draft Mode (sets the __prerender_bypass cookie), then redirects to
// the requested page — which will now render Strapi draft content.
// `status` is accepted-and-ignored: Draft Mode always serves the draft version.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const secret = requestUrl.searchParams.get('secret')
  const url = requestUrl.searchParams.get('url')

  if (!secretMatches(secret)) {
    return new Response('Invalid token', { status: 401 })
  }

  // Resolve the requested path against THIS origin and confirm it stays
  // same-origin. Blocks open redirects: `//evil.com`, `https://evil.com`,
  // and backslash tricks like `/\evil.com` all resolve to a foreign origin.
  if (!url) {
    return new Response('Invalid url', { status: 401 })
  }
  let target: URL
  try {
    target = new URL(url, requestUrl.origin)
  } catch {
    return new Response('Invalid url', { status: 401 })
  }
  if (target.origin !== requestUrl.origin) {
    return new Response('Invalid url', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  // Redirect to the relative portion only — never an absolute/foreign URL.
  redirect(`${target.pathname}${target.search}${target.hash}`)
}
