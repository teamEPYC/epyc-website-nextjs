import { FourPointStar, Section } from 'epyc-website'

// Icons paint with `currentColor`, so they inherit the surrounding text
// colour — these cells set it on the wrapper the way real usage does.
export function OnLight() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#183228' }}>
        <FourPointStar size={18} />
        <FourPointStar size={28} />
        <FourPointStar size={44} />
      </div>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#f7efdd' }}>
        <FourPointStar size={18} />
        <FourPointStar size={28} />
        <FourPointStar size={44} />
      </div>
    </Section>
  )
}

export function Crimson() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#b91646' }}>
        <FourPointStar size={18} />
        <FourPointStar size={28} />
        <FourPointStar size={44} />
      </div>
    </Section>
  )
}
