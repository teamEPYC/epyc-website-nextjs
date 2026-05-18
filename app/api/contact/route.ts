import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { contactSchema } from '@/lib/contact/schema'

export const runtime = 'nodejs'

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

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'submissions',
    data,
    overrideAccess: false,
  })

  return NextResponse.json({ ok: true })
}
