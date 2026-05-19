/**
 * Polyfill MessagePort + MessageChannel as global constructors.
 *
 * Next.js's compiled server inlines undici, which at module init runs
 *   `webidl.is.MessagePort = MakeTypeAssertion(MessagePort)`
 * (undici/lib/web/webidl/index.js:540). That bare MessagePort identifier
 * resolves to a global. workerd at our compat config
 * (`compatibility_date: "2025-03-01"`, `compatibility_flags:
 * ["nodejs_compat", "global_fetch_strictly_public"]`) doesn't expose it,
 * so the module-init throws ReferenceError and every Payload-using route
 * 500s (Payload's lexical RSC entry triggers the undici import chain).
 *
 * undici only uses these inside MakeTypeAssertion — which lowers to
 * `(v) => v instanceof MessagePort` — and we never hit that code path
 * (no WebSocket handling). Empty class stubs are sufficient: they just
 * need to exist as constructors so the module-init side effect succeeds.
 *
 * Next 16's `register()` runs once at cold start, before any request
 * handler imports Payload. OpenNext preserves it through the bundle via
 * its `patchInstrumentation` plugin.
 */
export function register() {
  const g = globalThis as Record<string, unknown>
  if (typeof g.MessagePort === 'undefined') {
    g.MessagePort = class MessagePort {}
  }
  if (typeof g.MessageChannel === 'undefined') {
    g.MessageChannel = class MessageChannel {}
  }
}
