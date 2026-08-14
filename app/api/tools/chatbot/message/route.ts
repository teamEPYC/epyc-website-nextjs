import { NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { CAPS, bumpCounter, counterKeys } from '@/lib/tools/counters'
import { mergeJudged, scoreWithModel, type Diagnosis } from '@/lib/tools/chatbot/diagnosis'
import { streamChat } from '@/lib/tools/models'
import { messageSchema } from '@/lib/tools/chatbot/schema'
import { buildMessages } from '@/lib/tools/chatbot/prompt'
import {
  getSession,
  loadPages,
  loadPagesForScoring,
  readTranscript,
  recordTurn,
  saveDiagnosis,
} from '@/lib/tools/session'

/**
 * One chat turn, streamed.
 *
 * The corpus is re-sent on every message — there is no prompt caching on these
 * models — which is affordable only because every tier is free. See
 * docs/ai-chatbot-tech.md.
 */

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = messageSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Ask a question first.' }, { status: 400 })
  }

  const { env, ctx } = getCloudflareContext()
  const db = env.DB

  const apiKey = env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set')
    return NextResponse.json({ ok: false, error: 'The assistant is unavailable.' }, { status: 503 })
  }

  const session = await getSession(db, parsed.data.sessionId)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'That session has expired.' }, { status: 404 })
  }

  // The report is the end of the conversation, not an error.
  if (session.messages_used >= CAPS.messagesPerSession) {
    return NextResponse.json(
      { ok: false, capped: true, error: 'You’ve used all your questions.' },
      { status: 409 },
    )
  }

  if (session.status !== 'ready') {
    return NextResponse.json(
      { ok: false, error: 'There is not enough on that site to chat about.' },
      { status: 409 },
    )
  }

  // Global cap, consumed before any model call is made.
  if (!(await bumpCounter(db, counterKeys.globalMessages(), CAPS.globalMessages))) {
    return NextResponse.json(
      { ok: false, capped: true, error: 'The tool is busy today. Try again tomorrow.' },
      { status: 429 },
    )
  }

  const pages = await loadPages(db, session.id)
  const history = readTranscript(session)
  const messages = buildMessages(session.host, pages, history, parsed.data.message)

  // Score the report quietly, on the first message, while the visitor is still
  // typing. By the time they reach the cap the panel renders instantly instead
  // of stalling for ten seconds at the exact moment we ask for the click.
  // Gating on message one rather than on the crawl means visitors who bounce
  // cost nothing. Failure is swallowed: the deterministic three are already
  // stored, so a failed call downgrades the report rather than breaking it.
  if (session.messages_used === 0 && !session.diagnosis_json?.includes('"answerability":{')) {
    ctx.waitUntil(
      (async () => {
        try {
          const judged = await scoreWithModel(apiKey, session.host, pages, {
            allowPaid: env.OPENROUTER_ALLOW_PAID === 'true',
          })
          const existing = session.diagnosis_json
            ? (JSON.parse(session.diagnosis_json) as Partial<Diagnosis>)
            : null
          const scoringPages = await loadPagesForScoring(db, session.id)
          await saveDiagnosis(db, session.id, mergeJudged(existing, judged, scoringPages))
        } catch (err) {
          console.error('diagnosis scoring failed', err)
        }
      })(),
    )
  }

  let result
  try {
    result = await streamChat({
      apiKey,
      messages,
      allowPaid: env.OPENROUTER_ALLOW_PAID === 'true',
    })
  } catch (err) {
    console.error('all model tiers unavailable', err)
    return NextResponse.json(
      { ok: false, error: 'I’m having trouble reaching the model. Try again shortly.' },
      { status: 503 },
    )
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

      // Which tier served this — logged so we learn how often tier 1 holds.
      send('model', { model: result.model })

      let answer = ''
      try {
        const reader = result.stream.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (!value) continue
          answer += value
          send('delta', { text: value })
        }
      } catch (err) {
        console.error('stream failed mid-answer', err)
        send('error', { message: 'That answer was cut short. Try asking again.' })
      }

      // Record even a partial answer: the count and the transcript must agree
      // with what the visitor actually saw on screen.
      try {
        const turns = [
          ...history,
          { role: 'user' as const, content: parsed.data.message },
          { role: 'assistant' as const, content: answer },
        ]
        await recordTurn(db, session.id, turns)
      } catch (err) {
        console.error('failed to record turn', err)
      }

      const used = session.messages_used + 1
      send('done', {
        messagesUsed: used,
        messagesLeft: Math.max(0, CAPS.messagesPerSession - used),
        capped: used >= CAPS.messagesPerSession,
      })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  })
}
