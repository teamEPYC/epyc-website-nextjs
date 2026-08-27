/**
 * Safety check for a visitor-supplied URL, before the crawler fetches it.
 *
 * This is a *syntactic* gate. It cannot resolve DNS — Workers has no resolver
 * API — so a hostname that resolves to a private address still passes here.
 * That case is covered at fetch time by the `global_fetch_strictly_public`
 * compatibility flag in wrangler.jsonc, which blocks Workers `fetch` to private
 * and internal addresses. The two together are the SSRF mitigation; neither is
 * sufficient alone, so do not remove either believing the other covers it.
 *
 * See docs/ai-chatbot-architecture.md §2.2.
 */

export type UrlCheck =
  | { ok: true; url: string; host: string }
  | { ok: false; reason: string }

/** Dotted-quad, with or without a port. Catches 127.0.0.1, 169.254.169.254, etc. */
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/

/** Suffixes that only ever name something inside a network. */
const INTERNAL_SUFFIXES = ['.local', '.localhost', '.internal', '.home.arpa', '.onion']

/** A crawl seed is a public web page, so only the web's own ports. */
const ALLOWED_PORTS = new Set(['', '80', '443'])

export function validateUrl(input: string): UrlCheck {
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, reason: 'Enter a website address.' }

  // Visitors type "example.com", not "https://example.com".
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return { ok: false, reason: "That doesn't look like a website address." }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'Only http and https addresses can be read.' }
  }

  // user:pass@host — a classic way to disguise the real host from a reader.
  if (url.username || url.password) {
    return { ok: false, reason: 'Addresses with login details are not accepted.' }
  }

  if (!ALLOWED_PORTS.has(url.port)) {
    return { ok: false, reason: 'Only standard web ports can be read.' }
  }

  const host = url.hostname.toLowerCase()

  // URL wraps IPv6 literals in brackets — [::1], [fe80::1].
  if (host.startsWith('[')) {
    return { ok: false, reason: 'Enter a domain name, not an IP address.' }
  }

  if (IPV4.test(host)) {
    return { ok: false, reason: 'Enter a domain name, not an IP address.' }
  }

  if (host === 'localhost' || INTERNAL_SUFFIXES.some((s) => host.endsWith(s))) {
    return { ok: false, reason: 'That address is not reachable from the public internet.' }
  }

  // Single-label hosts ("intranet", "wiki") only resolve inside a network.
  if (!host.includes('.')) {
    return { ok: false, reason: 'Enter a full domain, like example.com.' }
  }

  // Fragments are meaningless to a crawler and would split the reuse cache.
  url.hash = ''

  return { ok: true, url: url.toString(), host }
}
