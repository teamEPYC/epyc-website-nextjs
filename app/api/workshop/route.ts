import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { workshopSchema } from '@/lib/workshop/schema'

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = workshopSchema.safeParse(json)

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

  // Awaited, so a write failure fails the request rather than showing the
  // visitor a success screen for a lost request. Same `DB` binding as
  // app/api/contact/route.ts — one database, two tables.
  //
  // No queue/webhook here: unlike contact, workshop requests have no downstream
  // consumer yet, so nobody is notified when one arrives. Add one alongside
  // workers/contact-webhook before this page goes live.
  await env.DB.prepare(
    'INSERT INTO training_submissions (name, email, company, role, format) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(data.name, data.email, data.company, data.role, data.format)
    .run()

  return NextResponse.json({ ok: true })
}
