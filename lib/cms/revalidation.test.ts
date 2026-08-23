import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { parseRevalidationEvent, pathsForEvent, tagsForEvent, verifyWebhookSignature } from './revalidation'

describe('CMS revalidation', () => {
  it('maps only known collections to application-owned paths', () => {
    expect(pathsForEvent({ eventId: '1', collection: 'blogs', action: 'publish', slug: 'hello-world' })).toEqual([
      '/blog', '/blog/hello-world', '/sitemap.xml',
    ])
    expect(pathsForEvent({ eventId: '2', collection: 'projects', action: 'publish', slug: 'ignored' })).toEqual(['/projects'])
  })

  it('purges the provider fetch tag alongside the paths', () => {
    expect(tagsForEvent({ eventId: '1', collection: 'gallery', action: 'publish' })).toEqual(['cms:gallery'])
  })

  it('accepts the punctuation that appears in real slugs', () => {
    expect(parseRevalidationEvent({ eventId: '1', collection: 'projects', action: 'publish', slug: 'breathewellbeing.in' })?.slug).toBe('breathewellbeing.in')
    expect(parseRevalidationEvent({ eventId: '1', collection: 'gallery', action: 'publish', slug: 'epyc-merchandise-tshirt-concept-design-(green-variant)' })).not.toBeNull()
  })

  it('still refuses anything that could escape the collection route', () => {
    for (const slug of ['../admin', 'a/b', 'a..b', 'a b', '%2e%2e', '/etc/passwd', '-leading-hyphen']) {
      expect(parseRevalidationEvent({ eventId: '1', collection: 'blogs', action: 'publish', slug })).toBeNull()
    }
  })

  it('rejects arbitrary paths and malformed events', () => {
    expect(parseRevalidationEvent({ eventId: '1', collection: 'blogs', action: 'publish', slug: '../admin' })).toBeNull()
    expect(parseRevalidationEvent({ eventId: '1', collection: 'unknown', action: 'publish' })).toBeNull()
    expect(parseRevalidationEvent({ eventId: '1', collection: 'blogs', action: 'execute' })).toBeNull()
  })

  it('verifies HMAC signatures', async () => {
    const body = JSON.stringify({ eventId: '1', collection: 'blogs', action: 'publish' })
    const signature = createHmac('sha256', 'secret').update(body).digest('hex')
    await expect(verifyWebhookSignature(body, `sha256=${signature}`, 'secret')).resolves.toBe(true)
    await expect(verifyWebhookSignature(body, signature.replace(/^./, '0'), 'secret')).resolves.toBe(false)
  })
})
