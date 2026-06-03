import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
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

  const sql = neon(process.env.NEON_DATABASE_URL!)
  await sql`
    INSERT INTO contact_submissions (name, email, budget, details, source)
    VALUES (${data.name}, ${data.email}, ${data.budget}, ${data.details}, ${data.source})
  `

  // Hand the submission to the webhook background job (Cloudflare Queue —
  // consumed by workers/contact-webhook). A queue failure must not fail the
  // request: the enquiry is already persisted to Neon above.
  try {
    await getCloudflareContext().env.CONTACT_QUEUE.send(data)
  } catch (err) {
    console.error('contact webhook enqueue failed', err)
  }

  return NextResponse.json({ ok: true })
}
