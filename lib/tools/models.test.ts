import { afterEach, describe, expect, it, vi } from 'vitest'
import { completeJson, parseModelJson } from './models'

/**
 * These free models have no grammar-constrained decoding, and both callers ask
 * them to quote a website's own words back — an evidence quote in the chatbot
 * report, a name or summary in the llms.txt generator. So they emit an
 * unescaped `"` inside a string sooner or later, and the whole call dies on
 * `JSON.parse`.
 *
 * That is not theoretical: it took the llms.txt route down with
 * `Expected ',' or '}' after property value ... line 2 column 50` against a
 * real site. The recovery is to treat the tier as broken and try the next
 * model, which is what these tests pin.
 */

const ok = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseModelJson', () => {
  it('parses plain JSON', () => {
    expect(parseModelJson('{"a":1}')).toEqual({ a: 1 })
  })

  it('strips a markdown fence', () => {
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 })
  })

  it('extracts the object when the model wraps it in prose', () => {
    expect(parseModelJson('Here is the JSON:\n{"a":1}\nHope that helps.')).toEqual({ a: 1 })
  })

  it('throws rather than repair an unescaped quote', () => {
    // Guessing where the string was meant to end would put invented text into
    // a file a customer publishes. Failing is the honest outcome.
    expect(() => parseModelJson('{"name":"the "best" studio"}')).toThrow()
  })
})

describe('completeJson', () => {
  it('falls through to the next model when one returns unparseable JSON', async () => {
    const fetchMock = vi
      .fn()
      // Tier 1 emits the real-world failure: an unescaped quote mid-string.
      .mockResolvedValueOnce(ok('{\n  "name": "the "best" studio"\n}'))
      .mockResolvedValueOnce(ok('{"name":"Acme"}'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      completeJson({ apiKey: 'k', messages: [], chain: ['tier-1', 'tier-2'] }),
    ).resolves.toEqual({ name: 'Acme' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls through when a model returns no content at all', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(''))
      .mockResolvedValueOnce(ok('{"name":"Acme"}'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      completeJson({ apiKey: 'k', messages: [], chain: ['tier-1', 'tier-2'] }),
    ).resolves.toEqual({ name: 'Acme' })
  })

  it('throws once every tier has failed, naming the parse error', async () => {
    // A fresh Response per call: a body can only be read once, and real fetch
    // hands back a new one each time.
    const fetchMock = vi.fn(async () => ok('{"name":"the "best" studio"}'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      completeJson({ apiKey: 'k', messages: [], chain: ['tier-1', 'tier-2'] }),
    ).rejects.toThrow(/No usable JSON from any model/)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('still falls over on a 429, and still reports the status when nothing parsed', async () => {
    const fetchMock = vi.fn(async () => new Response('rate limited', { status: 429 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      completeJson({ apiKey: 'k', messages: [], chain: ['tier-1', 'tier-2'] }),
    ).rejects.toThrow(/No model available \(last status 429\)/)
  })
})
