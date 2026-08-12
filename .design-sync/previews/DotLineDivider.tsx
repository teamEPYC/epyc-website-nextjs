import { DotLineDivider, Section } from 'epyc-website'

// Crimson hairline capped with rotated square dots. `variant="split"` opens a
// gap in the middle of the rule.
export function Single() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <DotLineDivider />
    </Section>
  )
}

export function Split() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <DotLineDivider variant="split" />
    </Section>
  )
}

export function OnInk() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <DotLineDivider />
        <DotLineDivider variant="split" />
      </div>
    </Section>
  )
}
