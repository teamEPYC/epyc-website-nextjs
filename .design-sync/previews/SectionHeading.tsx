import { SectionHeading, Section } from 'epyc-website'

export function WithEyebrow() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <SectionHeading tone="ink" size="h2" eyebrow="Our Work">
        Projects that moved the needle
      </SectionHeading>
    </Section>
  )
}

export function OnDark() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <SectionHeading tone="cream" size="h2">
        Built to convert. Crafted to last.
      </SectionHeading>
    </Section>
  )
}

export function Display() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <SectionHeading tone="ink" size="display">
        Design &amp; Development Studio
      </SectionHeading>
    </Section>
  )
}

export function Small() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <SectionHeading tone="ink" size="h3" eyebrow="Services">
        What we do
      </SectionHeading>
    </Section>
  )
}
