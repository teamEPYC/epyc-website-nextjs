/**
 * Minimal client-side reader for our SSE routes.
 *
 * `EventSource` cannot POST, and both tool routes need a request body, so this
 * reads the response stream directly. Buffers across chunk boundaries — a
 * `data:` line is not guaranteed to arrive whole, and splitting naively drops
 * events under load.
 */
export async function readSSE(
  res: Response,
  onEvent: (event: string, data: Record<string, unknown>) => void,
): Promise<void> {
  const reader = res.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Events are separated by a blank line.
    let split: number
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, split)
      buffer = buffer.slice(split + 2)

      let event = 'message'
      let data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5).trim()
      }

      if (!data) continue
      try {
        onEvent(event, JSON.parse(data) as Record<string, unknown>)
      } catch {
        // Malformed frame — skip it rather than kill the stream.
      }
    }
  }
}
