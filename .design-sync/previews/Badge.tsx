import { Badge, Section } from 'epyc-website'

export default function Preview() {
  return (
    <div>
      <Section tone="ink" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Badge tone="cream-on-dark">5.0 on Clutch</Badge>
          <Badge tone="cream-on-dark" href="https://epyc.in">View profile</Badge>
        </div>
      </Section>
      <Section tone="beige" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Badge tone="ink-on-light">Design-first studio</Badge>
          <Badge tone="ink-on-light" href="#">Case studies</Badge>
        </div>
      </Section>
    </div>
  )
}
