/**
 * OpenRouter client for the free tools.
 *
 * ponytail: a direct fetch rather than the AI SDK. The plan named `ai` +
 * `@openrouter/ai-sdk-provider`, and this is a deliberate departure — we use
 * one provider, one model family, no tool calls, no attachments, and no
 * multi-provider switching, so the provider abstraction has nothing to
 * abstract. What it would add is two dependencies and a documented version
 * coupling between them. What we need instead is precise control over the
 * fallback chain, which is easier to express here than through a wrapper.
 * Ceiling: if we ever want tool calls, structured streaming, or a second
 * provider, install the SDK and replace this file — the callers only use
 * `streamChat` and `completeJson`.
 *
 * Every tier is free. Pricing and context verified 14 Aug 2026; see
 * docs/ai-chatbot-tech.md.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Tried in order. A 429 or 503 advances to the next tier.
 *
 * Lightning first because it is the fastest (~1.2s), which is the metric the
 * whole tool lives or dies on. Super second: larger, same 1M window. Ultra
 * last: slower (~6s) and a smaller window, but still six times our corpus.
 */
export const FREE_CHAIN = [
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
] as const

/** Only used when OPENROUTER_ALLOW_PAID is explicitly 'true'. Off by default. */
export const PAID_FALLBACK = 'nvidia/nemotron-3.5-lightning'

/**
 * The scoring call is judgement over the whole corpus, once per session rather
 * than eight times, so it starts on the larger model. Still free.
 */
export const SCORING_CHAIN = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3.5-lightning:free',
] as const

type CallOptions = {
  apiKey: string
  messages: ChatMessage[]
  chain?: readonly string[]
  allowPaid?: boolean
  signal?: AbortSignal
  /** Low or off — the bot answers from supplied text, it does not solve anything. */
  maxTokens?: number
  responseFormatJson?: boolean
}

/** Which tiers to try, in order. */
function tiers(opts: CallOptions): string[] {
  const chain = [...(opts.chain ?? FREE_CHAIN)]
  if (opts.allowPaid) chain.push(PAID_FALLBACK)
  return chain
}

/** Rate limited or temporarily unavailable — worth trying the next tier. */
function shouldFallOver(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504
}

async function call(model: string, opts: CallOptions, stream: boolean): Promise<Response> {
  return fetch(ENDPOINT, {
    method: 'POST',
    signal: opts.signal,
    headers: {
      authorization: `Bearer ${opts.apiKey}`,
      'content-type': 'application/json',
      // OpenRouter attributes usage to these; they are not secrets.
      'http-referer': 'https://epyc.in',
      'x-title': 'EPYC Website Diagnostic',
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      stream,
      max_tokens: opts.maxTokens ?? 700,
      temperature: 0.2,
      // `effort: 'none'` stops reasoning tokens being generated at all.
      // Measured against Lightning: with reasoning on, the model streamed its
      // entire chain of thought into `content` — "Here's a thinking process:
      // 1. Analyze User Input…" — reciting the system prompt back at the
      // visitor and then hitting the token ceiling before writing an answer.
      // `exclude` is belt-and-braces for any tier where reasoning is mandatory.
      // The job here is reading supplied text, not solving anything.
      reasoning: { effort: 'none', exclude: true },
      ...(opts.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
}

export type StreamResult = {
  /** Plain text deltas. */
  stream: ReadableStream<string>
  /** Which tier actually served it — logged so we learn how often tier 1 holds. */
  model: string
}

/**
 * Stream a reply, falling down the chain on rate limits.
 *
 * The fallback happens before any token is emitted: OpenRouter reports a 429
 * on the initial response, so a busy tier never produces a half-written answer
 * that we then abandon.
 */
export async function streamChat(opts: CallOptions): Promise<StreamResult> {
  let lastStatus = 0

  for (const model of tiers(opts)) {
    const res = await call(model, opts, true)

    if (res.ok && res.body) {
      return { stream: toTextStream(res.body), model }
    }

    lastStatus = res.status
    // Read and discard the error body so the connection is released.
    await res.text().catch(() => {})
    if (!shouldFallOver(res.status)) break
  }

  throw new Error(`No model available (last status ${lastStatus})`)
}

/** One-shot JSON response, for the report's scoring call. */
export async function completeJson<T>(opts: CallOptions): Promise<T> {
  let lastStatus = 0

  for (const model of tiers({ ...opts, chain: opts.chain ?? SCORING_CHAIN })) {
    // The report's JSON carries ten questions plus five page types — it needs
    // more room than a two-sentence chat answer.
    const res = await call(model, { ...opts, maxTokens: opts.maxTokens ?? 2000, responseFormatJson: true }, false)

    if (res.ok) {
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      const content = body.choices?.[0]?.message?.content
      if (!content) throw new Error('Model returned no content')
      return JSON.parse(stripFences(content)) as T
    }

    lastStatus = res.status
    await res.text().catch(() => {})
    if (!shouldFallOver(res.status)) break
  }

  throw new Error(`No model available (last status ${lastStatus})`)
}

/** Models sometimes wrap JSON in a markdown fence despite json_object mode. */
function stripFences(s: string): string {
  const trimmed = s.trim()
  if (!trimmed.startsWith('```')) return trimmed
  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
}

/**
 * OpenRouter streams OpenAI-shaped SSE. Turn it into plain text deltas.
 *
 * Buffers across chunk boundaries — a single `data:` line is not guaranteed to
 * arrive whole, and splitting naively drops tokens under load.
 */
function toTextStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
  const decoder = new TextDecoder()
  let buffer = ''

  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader()
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let nl: number
          while ((nl = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, nl).trim()
            buffer = buffer.slice(nl + 1)

            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (payload === '[DONE]') {
              controller.close()
              return
            }

            try {
              const parsed = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[]
              }
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) controller.enqueue(delta)
            } catch {
              // A comment or keep-alive line — ignore it rather than fail the stream.
            }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      } finally {
        reader.releaseLock()
      }
    },
  })
}
