import { WebflowGlyph, Section } from 'epyc-website'

// Icons paint with `currentColor`, so they inherit the surrounding text
// colour — these cells set it on the wrapper the way real usage does.
export function OnLight() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#183228' }}>
        <WebflowGlyph style={{ height: 21, width: 'auto' }} />
        <WebflowGlyph style={{ height: 32, width: 'auto' }} />
        <WebflowGlyph style={{ height: 48, width: 'auto' }} />
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#f7efdd' }}>
        <WebflowGlyph style={{ height: 21, width: 'auto' }} />
        <WebflowGlyph style={{ height: 32, width: 'auto' }} />
        <WebflowGlyph style={{ height: 48, width: 'auto' }} />
      </div>
    </Section>
  )
}

export function Crimson() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#b91646' }}>
        <WebflowGlyph style={{ height: 21, width: 'auto' }} />
        <WebflowGlyph style={{ height: 32, width: 'auto' }} />
        <WebflowGlyph style={{ height: 48, width: 'auto' }} />
      </div>
    </Section>
  )
}
