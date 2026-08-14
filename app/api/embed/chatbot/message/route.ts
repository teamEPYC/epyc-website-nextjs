import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import {
  consumeEmbedMessage,
  corsHeaders,
  findEmbedByKey,
  isEmbedKey,
  originAllowed,
  touchEmbed,
} from '@/lib/tools/chatbot/embed'
import { embedMessageSchema } from '@/lib/tools/chatbot/schema'
import { buildMessages } from '@/lib/tools/chatbot/prompt'
import { streamChat } from '@/lib/tools/models'
import { loadPages } from '@/lib/tools/session'

/**
 * A message to a live widget running on a customer's own site.
 *
 * Called cross-origin from their page, which is deliberate: it means the
 * `Origin` header is genuinely theirs and the key's domain binding actually
 * means something. An iframe we host would report our own origin instead.
 *
 * Binding is not airtight — a non-browser client can send any Origin it likes.
 * The per-key daily cap is what bounds that: the worst case is a fixed amount
 * of free-tier inference, not an open tap.
 */

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return new Response(null, { status: 403 })

  // The preflight cannot see the key, so it is answered permissively for the
  // requesting origin. The POST below is where binding is actually enforced.
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')

  const json = await req.json().catch(() => null)
  const parsed = embedMessageSchema.safeParse(json)
  if (!parsed.success || !isEmbedKey(parsed.data.key)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const { env } = getCloudflareContext()
  const db = env.DB

  const embed = await findEmbedByKey(db, parsed.data.key)
  if (!embed || embed.status !== 'active') {
    return NextResponse.json({ ok: false, error: 'This assistant is not available.' }, { status: 404 })
  }

  // The binding. A key minted for acme.com answers only for acme.com.
  if (!originAllowed(origin, embed.bound_host, {
    allowAny: env.TOOLS_EMBED_ALLOW_ANY_ORIGIN === 'true',
  })) {
    return NextResponse.json(
      { ok: false, error: 'This assistant is not available on this domain.' },
      { status: 403 },
    )
  }

  const cors = corsHeaders(origin!)

  const apiKey = env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set')
    return NextResponse.json(
      { ok: false, error: 'The assistant is unavailable.' },
      { status: 503, headers: cors },
    )
  }

  if (!(await consumeEmbedMessage(db, embed.key))) {
    return NextResponse.json(
      { ok: false, error: 'This assistant has reached its limit for today.' },
      { status: 429, headers: cors },
    )
  }

  const pages = await loadPages(db, embed.session_id)
  const messages = buildMessages(
    embed.bound_host,
    pages,
    parsed.data.history,
    parsed.data.message,
  )

  let result
  try {
    result = await streamChat({
      apiKey,
      messages,
      allowPaid: env.OPENROUTER_ALLOW_PAID === 'true',
    })
  } catch (err) {
    console.error('embed: all model tiers unavailable', err)
    return NextResponse.json(
      { ok: false, error: 'I’m having trouble answering right now. Please try again shortly.' },
      { status: 503, headers: cors },
    )
  }

  await touchEmbed(db, embed.key).catch(() => {})

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      try {
        const reader = result.stream.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) send('delta', { text: value })
        }
      } catch (err) {
        console.error('embed: stream failed mid-answer', err)
        send('error', { message: 'That answer was cut short.' })
      } finally {
        send('done', {})
        try {
          controller.close()
        } catch {
          // Already closed.
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...cors,
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  })
}
