import { Stamp, Section } from 'epyc-website'

// Double-ringed crimson label with a Sparkle either side. Defaults its own
// copy to "OUR SERVICES".
export function Default() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <Stamp />
    </Section>
  )
}

export function CustomLabel() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Stamp>OUR PROCESS</Stamp>
        <Stamp>WHY EPYC</Stamp>
      </div>
    </Section>
  )
}
