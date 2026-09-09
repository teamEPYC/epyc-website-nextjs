'use client'

import { useState } from 'react'
import type { CrawledPage } from '@/components/tools/crawl-log'
import { readSSE } from '@/lib/tools/sse-client'
import type { CrawlInput } from '@/lib/tools/schema'

/**
 * The client half of `POST /api/tools/crawl`, shared by every tool that crawls.
 *
 * The chatbot tool and the llms.txt generator send the same body, read the same
 * `status` / `page` / `error` events into the same three pieces of state, and
 * differ only in what they do on `done` — so that is the only thing the caller
 * passes in. Held here rather than copied per tool: the JSON-vs-stream failure
 * branch and the buffering in `readSSE` are the parts that would drift.
 *
 * Phase and error stay with the caller. Each tool has its own screens and its
 * own words for a failure, and threading those through here would make this a
 * template rather than a hook.
 */
export function useCrawl(tool: CrawlInput['tool']) {
  const [status, setStatus] = useState('')
  const [pages, setPages] = useState<CrawledPage[]>([])
  const [total, setTotal] = useState(0)

  async function start(
    url: string,
    handlers: {
      /** The `done` event's payload. `status` is 'ready' | 'empty' | 'failed'. */
      onDone: (data: Record<string, unknown>) => void
      onError: (message: string) => void
      force?: boolean
    },
  ) {
    const target = url.trim()
    if (!target) {
      handlers.onError('Enter a website address.')
      return
    }

    setPages([])
    setTotal(0)
    setStatus('')

    try {
      const res = await fetch('/api/tools/crawl', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: target, force: handlers.force ?? false, tool }),
      })

      // Validation and cap failures come back as plain JSON, not a stream.
      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const body = (await res.json()) as { error?: string }
        handlers.onError(body.error ?? 'Something went wrong.')
        return
      }

      await readSSE(res, (event, data) => {
        if (event === 'status') setStatus(String(data.message ?? ''))
        if (event === 'page') {
          setPages((p) => [...p, { url: String(data.url), title: String(data.title ?? '') }])
          setTotal(Number(data.total ?? 0))
        }
        if (event === 'error') handlers.onError(String(data.message ?? 'We could not read that site.'))
        if (event === 'done') handlers.onDone(data)
      })
    } catch {
      handlers.onError('We could not reach that site. Try another address.')
    }
  }

  return { status, pages, total, start }
}
