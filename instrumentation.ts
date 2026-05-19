/**
 * Polyfill JS/Web globals that workerd doesn't expose at our compat
 * config (`compatibility_date: "2025-03-01"`, `compatibility_flags:
 * ["nodejs_compat", "global_fetch_strictly_public"]`) but that
 * libraries inlined into Next.js's compiled server reference bare at
 * module-evaluation time. Without these, Payload-using routes 500
 * with `ReferenceError: X is not defined` and never reach handler code.
 *
 * Coverage so far (each was found as a bare reference in
 * `.open-next/server-functions/default/handler.mjs` via grep):
 *
 *   - `MessagePort`        — undici/lib/web/webidl/index.js:540 runs
 *                            `webidl.is.MessagePort = MakeTypeAssertion(MessagePort)`.
 *                            Only used as `instanceof` target; empty class is fine.
 *   - `MessageChannel`     — paired with MessagePort; same treatment.
 *   - `FinalizationRegistry` — used by React 19 / caching libs to schedule
 *                              cleanup. No-op `register/unregister` is safe
 *                              because Worker isolates are short-lived.
 *   - `WeakRef`            — strong-ref masquerade: `deref()` always returns
 *                            the held value. In a request-scoped isolate
 *                            this never causes a noticeable leak; the
 *                            isolate teardown collects everything.
 *   - `SharedArrayBuffer`  — only seen in `instanceof` discriminators;
 *                            empty class makes those checks false, which
 *                            matches the Workers reality (no shared memory).
 *
 * Next 16's `register()` runs once at cold start before any request
 * handler imports route code. OpenNext's `patchInstrumentation` plugin
 * preserves this through the bundle.
 *
 * If a future deploy surfaces another `ReferenceError: X is not defined`,
 * add `X` here.
 */
export function register() {
  const g = globalThis as Record<string, unknown>

  if (typeof g.MessagePort === 'undefined') {
    g.MessagePort = class MessagePort {}
  }
  if (typeof g.MessageChannel === 'undefined') {
    g.MessageChannel = class MessageChannel {}
  }
  if (typeof g.FinalizationRegistry === 'undefined') {
    g.FinalizationRegistry = class FinalizationRegistry {
      register() {}
      unregister() {}
    }
  }
  if (typeof g.WeakRef === 'undefined') {
    g.WeakRef = class WeakRef {
      private target: unknown
      constructor(target: unknown) {
        this.target = target
      }
      deref() {
        return this.target
      }
    }
  }
  if (typeof g.SharedArrayBuffer === 'undefined') {
    g.SharedArrayBuffer = class SharedArrayBuffer {}
  }
}
