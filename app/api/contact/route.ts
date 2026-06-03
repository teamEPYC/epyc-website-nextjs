import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { contactSchema } from '@/lib/contact/schema'

// Replicates @neondatabase/serverless HTTP transport without the package,
// avoiding esbuild/OpenNext bundling incompatibilities in Cloudflare Workers.
async function neonSql(connectionString: string, query: string, params: unknown[] = []) {
  const { hostname } = new URL(connectionString)
  const domain = hostname.slice(hostname.indexOf('.') + 1)
  const res = await fetch(`https://api.${domain}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connectionString,
      'Neon-Raw-Text-Output': 'true',
      'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query, params }),
  })
  if (!res.ok) throw new Error(`Neon error ${res.status}: ${await res.text()}`)
  return res.json()
}

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

  await neonSql(
    process.env.NEON_DATABASE_URL!,
    'INSERT INTO contact_submissions (name, email, budget, details, source) VALUES ($1, $2, $3, $4, $5)',
    [data.name, data.email, data.budget, data.details, data.source],
  )

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
