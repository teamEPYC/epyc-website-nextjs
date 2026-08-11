import { ChevronRight, Section } from 'epyc-website'

// Icons paint with `currentColor`, so they inherit the surrounding text
// colour — these cells set it on the wrapper the way real usage does.
export function OnLight() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#183228' }}>
        <ChevronRight size={14} />
        <ChevronRight size={20} />
        <ChevronRight size={32} />
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#f7efdd' }}>
        <ChevronRight size={14} />
        <ChevronRight size={20} />
        <ChevronRight size={32} />
      </div>
    </Section>
  )
}

export function Crimson() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#b91646' }}>
        <ChevronRight size={14} />
        <ChevronRight size={20} />
        <ChevronRight size={32} />
      </div>
    </Section>
  )
}
