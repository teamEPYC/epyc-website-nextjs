import { Pill, Section } from 'epyc-website'

export default function Preview() {
  return (
    <div>
      <Section tone="ink" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Pill tone="cream-on-dark">Webflow</Pill>
          <Pill tone="cream-on-dark">UI / UX</Pill>
          <Pill tone="cream-on-dark">Interactions</Pill>
        </div>
      </Section>
      <Section tone="beige" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Pill tone="ink-on-light">Design Systems</Pill>
          <Pill tone="ink-on-light">Framer</Pill>
          <Pill tone="ink-on-light">React</Pill>
        </div>
      </Section>
    </div>
  )
}
