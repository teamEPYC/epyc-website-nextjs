import { describe, expect, it } from 'vitest'
import { isEmbedKey, isLocalOrigin, originAllowed } from './embed'

/**
 * The origin check is what stops a public key answering on someone else's site.
 * It is not a hard security boundary — `Origin` is forgeable from any non-browser
 * client, which is what the daily cap is for — but it is the only thing standing
 * between a copied key and a working bot, so its edges are worth pinning down.
 *
 * The cases that matter most are the hosting suffixes: label stripping here
 * would hand one key authority over every site on `vercel.app`.
 */

describe('originAllowed', () => {
  it('accepts the exact bound host and its www form', () => {
    expect(originAllowed('https://acme.com', 'acme.com')).toBe(true)
    expect(originAllowed('https://www.acme.com', 'acme.com')).toBe(true)
    expect(originAllowed('https://acme.com', 'www.acme.com')).toBe(true)
  })

  it('ignores the port and is case insensitive', () => {
    expect(originAllowed('https://ACME.com:443', 'acme.com')).toBe(true)
  })

  it('rejects a different site', () => {
    expect(originAllowed('https://evil.com', 'acme.com')).toBe(false)
    expect(originAllowed('https://acme.com.evil.com', 'acme.com')).toBe(false)
    expect(originAllowed('https://notacme.com', 'acme.com')).toBe(false)
  })

  it('rejects subdomains of the bound host', () => {
    // Deliberate: allowing these means allowing them for a bound host that is
    // itself a hosting suffix. See the sibling case below.
    expect(originAllowed('https://staging.acme.com', 'acme.com')).toBe(false)
  })

  it('never lets one tenant of a hosting suffix answer for another', () => {
    expect(originAllowed('https://someone-else.vercel.app', 'mine.vercel.app')).toBe(false)
    expect(originAllowed('https://vercel.app', 'mine.vercel.app')).toBe(false)
    expect(originAllowed('https://other.myshopify.com', 'shop.myshopify.com')).toBe(false)
    expect(originAllowed('https://victim.github.io', 'github.io')).toBe(false)
  })

  it('accepts the bound tenant of a hosting suffix', () => {
    expect(originAllowed('https://mine.vercel.app', 'mine.vercel.app')).toBe(true)
  })

  it('rejects a missing or unusable Origin', () => {
    expect(originAllowed(null, 'acme.com')).toBe(false)
    expect(originAllowed('', 'acme.com')).toBe(false)
    expect(originAllowed('null', 'acme.com')).toBe(false)
    expect(originAllowed('file:///tmp/x.html', 'acme.com')).toBe(false)
    expect(originAllowed('javascript:alert(1)', 'acme.com')).toBe(false)
  })

  it('accepts localhost on any port, for any key', () => {
    expect(originAllowed('http://localhost:3000', 'acme.com')).toBe(true)
    expect(originAllowed('http://127.0.0.1:8788', 'acme.com')).toBe(true)
    expect(originAllowed('http://[::1]:3000', 'acme.com')).toBe(true)
  })

  it('does not accept a hostname that merely contains localhost', () => {
    expect(originAllowed('https://localhost.evil.com', 'acme.com')).toBe(false)
    expect(originAllowed('https://notlocalhost', 'acme.com')).toBe(false)
  })
})

describe('isLocalOrigin', () => {
  it('separates dev traffic from live traffic, so the two caps cannot blur', () => {
    expect(isLocalOrigin('http://localhost:5173')).toBe(true)
    expect(isLocalOrigin('https://acme.com')).toBe(false)
    expect(isLocalOrigin(null)).toBe(false)
  })
})

describe('isEmbedKey', () => {
  it('accepts a minted key and rejects near misses', () => {
    expect(isEmbedKey('ek_live_' + 'a'.repeat(32))).toBe(true)
    expect(isEmbedKey('ek_live_' + 'a'.repeat(31))).toBe(false)
    expect(isEmbedKey('ek_test_' + 'a'.repeat(32))).toBe(false)
    expect(isEmbedKey('ek_live_' + 'Z'.repeat(32))).toBe(false)
  })
})
