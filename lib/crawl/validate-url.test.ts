import { describe, expect, it } from 'vitest'
import { validateUrl } from './validate-url'

/**
 * The other place a silent bug is expensive: this function is what stands
 * between an anonymous visitor's text box and a `fetch` from our Worker.
 */

describe('validateUrl — accepts', () => {
  it('a bare domain, adding https', () => {
    const r = validateUrl('example.com')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.url).toBe('https://example.com/')
      expect(r.host).toBe('example.com')
    }
  })

  it('a full URL with a path', () => {
    const r = validateUrl('https://example.com/pricing')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.url).toBe('https://example.com/pricing')
  })

  it('http as well as https', () => {
    expect(validateUrl('http://example.com').ok).toBe(true)
  })

  it('subdomains and surrounding whitespace', () => {
    const r = validateUrl('  https://www.example.co.uk/about  ')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.host).toBe('www.example.co.uk')
  })

  it('an explicit standard port', () => {
    expect(validateUrl('https://example.com:443/').ok).toBe(true)
  })

  it('but strips the fragment, so the reuse cache does not split', () => {
    const r = validateUrl('https://example.com/about#team')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.url).toBe('https://example.com/about')
  })
})

describe('validateUrl — rejects', () => {
  it('empty input', () => {
    expect(validateUrl('   ').ok).toBe(false)
  })

  it('IPv4 literals, including cloud metadata', () => {
    expect(validateUrl('169.254.169.254').ok).toBe(false)
    expect(validateUrl('http://127.0.0.1/').ok).toBe(false)
    expect(validateUrl('https://10.0.0.5/admin').ok).toBe(false)
  })

  it('IPv6 literals', () => {
    expect(validateUrl('http://[::1]/').ok).toBe(false)
    expect(validateUrl('http://[fe80::1]/').ok).toBe(false)
  })

  it('localhost and internal suffixes', () => {
    expect(validateUrl('localhost').ok).toBe(false)
    expect(validateUrl('http://localhost:3000').ok).toBe(false)
    expect(validateUrl('printer.local').ok).toBe(false)
    expect(validateUrl('vault.internal').ok).toBe(false)
  })

  it('single-label hosts that only resolve inside a network', () => {
    expect(validateUrl('intranet').ok).toBe(false)
    expect(validateUrl('http://wiki/').ok).toBe(false)
  })

  it('non-web schemes', () => {
    expect(validateUrl('file:///etc/passwd').ok).toBe(false)
    expect(validateUrl('ftp://example.com').ok).toBe(false)
    expect(validateUrl('javascript:alert(1)').ok).toBe(false)
    expect(validateUrl('data:text/html,<h1>hi').ok).toBe(false)
  })

  it('credentials in the authority, which disguise the real host', () => {
    expect(validateUrl('https://example.com@169.254.169.254/').ok).toBe(false)
    expect(validateUrl('https://user:pass@example.com/').ok).toBe(false)
  })

  it('non-standard ports that would reach internal services', () => {
    expect(validateUrl('https://example.com:8080/').ok).toBe(false)
    expect(validateUrl('http://example.com:22/').ok).toBe(false)
  })

  it('with a reason a visitor can act on, never a raw error', () => {
    const r = validateUrl('127.0.0.1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/domain name/i)
  })
})
