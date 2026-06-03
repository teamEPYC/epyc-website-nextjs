import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { contactSchema } from '@/lib/contact/schema'

export const runtime = 'edge'

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = contactSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { website, ...data } = parsed.data
  // Honeypot tripped — pretend success, drop on the floor.
  if (website) return NextResponse.json({ ok: true })

  const strapiRes = await fetch(`${process.env.STRAPI_URL}/api/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ data }),
  })

  if (!strapiRes.ok) {
    console.error('Strapi submission failed', strapiRes.status, await strapiRes.text().catch(() => ''))
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  // Hand the submission to the webhook background job (Cloudflare Queue —
  // consumed by workers/contact-webhook). A queue failure must not fail the
  // request: the enquiry is already persisted to Strapi above.
  try {
    await getCloudflareContext().env.CONTACT_QUEUE.send(data)
  } catch (err) {
    console.error('contact webhook enqueue failed', err)
  }

  return NextResponse.json({ ok: true })
}
