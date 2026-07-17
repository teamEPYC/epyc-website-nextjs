import { NextResponse } from 'next/server'
import { workshopSchema } from '@/lib/workshop/schema'

// Replicates @neondatabase/serverless HTTP transport without the package,
// avoiding esbuild/OpenNext bundling incompatibilities in Cloudflare Workers.
// Same transport as app/api/contact/route.ts.
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

  // No queue/webhook here: unlike contact, workshop requests have no
  // downstream consumer yet. Add one alongside workers/contact-webhook if
  // notifications are needed.
  await neonSql(
    process.env.NEON_DATABASE_URL!,
    'INSERT INTO training_submissions (name, email, company, role, format) VALUES ($1, $2, $3, $4, $5)',
    [data.name, data.email, data.company, data.role, data.format],
  )

  return NextResponse.json({ ok: true })
}
