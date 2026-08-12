import { DashedDivider, Section } from 'epyc-website'

// Full-bleed rule with a central four-lobe motif. Stroke is `text-sand` by
// default and follows currentColor, so a wrapper text-* class recolours it.
export function Default() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <DashedDivider />
    </Section>
  )
}

export function OnInk() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <DashedDivider className="text-cream/60" />
    </Section>
  )
}

export function BetweenContent() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={{ margin: 0, fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
          Separating two blocks of copy the way the marketing pages do.
        </p>
        <DashedDivider />
        <p style={{ margin: 0, fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
          The rule stretches to the full width of its container.
        </p>
      </div>
    </Section>
  )
}
