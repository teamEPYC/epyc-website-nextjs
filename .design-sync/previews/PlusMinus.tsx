import { PlusMinus, Section } from 'epyc-website'

// `open` is required: false renders a plus, true rotates the vertical bar onto
// the horizontal one so it reads as a minus. Both states must be shown or the
// component looks like a plain plus icon.
export function BothStates() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', color: '#183228' }}>
        <PlusMinus open={false} size={24} />
        <PlusMinus open size={24} />
      </div>
    </Section>
  )
}

export function Closed() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#183228' }}>
        <PlusMinus open={false} size={16} />
        <PlusMinus open={false} size={24} />
        <PlusMinus open={false} size={40} />
      </div>
    </Section>
  )
}

export function OpenOnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: '#f7efdd' }}>
        <PlusMinus open size={16} />
        <PlusMinus open size={24} />
        <PlusMinus open size={40} />
      </div>
    </Section>
  )
}
