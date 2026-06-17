import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// GET /api/preview?secret=<token>&url=<internal-path>&status=draft
// Called by Strapi's Preview button. Validates the shared secret, turns on
// Next.js Draft Mode (sets the __prerender_bypass cookie), then redirects to
// the requested page — which will now render Strapi draft content.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const url = searchParams.get('url')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Only allow internal redirects (single leading slash) — block open redirects
  // like `//evil.com` or `https://evil.com`.
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return new Response('Invalid url', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(url)
}
