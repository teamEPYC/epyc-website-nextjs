import { EpycWordmark, Section } from 'epyc-website'

// Icons paint with `currentColor`, so they inherit the surrounding text
// colour — these cells set it on the wrapper the way real usage does.
export function OnLight() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#183228' }}>
        <EpycWordmark style={{ height: 28, width: 'auto' }} />
        <EpycWordmark style={{ height: 45, width: 'auto' }} />
        <EpycWordmark style={{ height: 64, width: 'auto' }} />
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#f7efdd' }}>
        <EpycWordmark style={{ height: 28, width: 'auto' }} />
        <EpycWordmark style={{ height: 45, width: 'auto' }} />
        <EpycWordmark style={{ height: 64, width: 'auto' }} />
      </div>
    </Section>
  )
}

export function Crimson() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#b91646' }}>
        <EpycWordmark style={{ height: 28, width: 'auto' }} />
        <EpycWordmark style={{ height: 45, width: 'auto' }} />
        <EpycWordmark style={{ height: 64, width: 'auto' }} />
      </div>
    </Section>
  )
}
