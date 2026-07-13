import { SectionHeading, Section } from 'epyc-website'

export default function Preview() {
  return (
    <div>
      <Section tone="beige" style={{ padding: '32px' }}>
        <SectionHeading tone="ink" size="h2" eyebrow="Our Work">
          Projects that moved the needle
        </SectionHeading>
      </Section>
      <Section tone="ink" style={{ padding: '32px' }}>
        <SectionHeading tone="cream" size="h2">
          Built to convert. Crafted to last.
        </SectionHeading>
      </Section>
      <Section tone="beige" style={{ padding: '32px' }}>
        <SectionHeading tone="ink" size="h3" eyebrow="Services">
          What we do
        </SectionHeading>
      </Section>
      <Section tone="beige" style={{ padding: '32px' }}>
        <SectionHeading tone="ink" size="display">
          Design &amp; Development Studio
        </SectionHeading>
      </Section>
    </div>
  )
}
