import { Reveal, Section, SectionHeading } from 'epyc-website'

export default function Preview() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <Reveal>
        <SectionHeading tone="ink" size="h3" eyebrow="Animation">
          Reveal wraps any content
        </SectionHeading>
      </Reveal>
      <Reveal delay={0.15}>
        <p style={{ marginTop: 16, fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
          Fade + 16px rise on scroll entry. Respects prefers-reduced-motion.
          Delay staggers children elegantly.
        </p>
      </Reveal>
    </Section>
  )
}
