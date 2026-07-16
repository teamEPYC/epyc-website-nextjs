/**
 * The noise + smoke overlay stack the AI-training page's dark sections share
 * (Figma "background" group): tiled noise (overlay, 30%) + smoke (hard-light,
 * 0.5 × 0.3 = 15%, pre-rotated 90° into the asset). Decorative only — sits on
 * -z-10, so the host section needs `relative isolate overflow-hidden`.
 *
 * `band` caps the smoke layer at that pixel height, matching whatever the
 * section's Figma background frame draws (they differ per section); omit it to
 * bleed the smoke over the full section. It's an inline style rather than a
 * Tailwind class because the height varies per caller.
 */
export function AiTexture({ band }: { band?: number }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay bg-[url('/images/ai-training/noise.png')] bg-[length:117px_117px]"
      />
      <div
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-[0.15] mix-blend-hard-light bg-[url('/images/ai-training/smoke-services.jpg')] bg-[length:1902px_1268px]" +
          (band ? '' : ' bottom-0')
        }
        style={band ? { height: band } : undefined}
      />
    </>
  )
}
