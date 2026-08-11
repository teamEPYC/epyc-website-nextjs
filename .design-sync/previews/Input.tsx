import { Input, Section } from 'epyc-website'

export function Placeholder() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Input placeholder="YOUR EMAIL HERE*" />
      </div>
    </Section>
  )
}

export function Filled() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 420 }}>
        <Input defaultValue="keshav@epyc.in" />
      </div>
    </Section>
  )
}

export function States() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <Input placeholder="DEFAULT" />
        {/* invalid sets aria-invalid; the red outline is the only error signal */}
        <Input invalid defaultValue="not-an-email" />
        <Input disabled placeholder="DISABLED" />
      </div>
    </Section>
  )
}
