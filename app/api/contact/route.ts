import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { contactSchema } from '@/lib/contact/schema'

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

  const { env } = getCloudflareContext()

  // D1 is the durable record and the only copy we control — the webhook path
  // below depends on n8n staying up. A failure here must fail the request
  // rather than show the visitor a success screen for a lost enquiry.
  await env.DB.prepare(
    'INSERT INTO contact_submissions (name, email, budget, details, source) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(data.name, data.email, data.budget, data.details, data.source)
    .run()

  // Hand the submission to the webhook background job (Cloudflare Queue —
  // consumed by workers/contact-webhook). A queue failure must not fail the
  // request: the enquiry is already persisted to D1 above.
  //
  // `table` rides along because two forms now share this queue — it is how the
  // webhook consumer tells a contact enquiry from a workshop request.
  try {
    await env.CONTACT_QUEUE.send({ table: 'contact_submissions', ...data })
  } catch (err) {
    console.error('contact webhook enqueue failed', err)
  }

  return NextResponse.json({ ok: true })
}
