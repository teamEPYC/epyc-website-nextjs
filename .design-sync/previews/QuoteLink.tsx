import { QuoteLink, Section } from 'epyc-website'

// Inline link for cream-on-dark copy — it deliberately stays cream rather than
// taking a link colour, so it only reads correctly inside a dark Section.
export function InAQuote() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <blockquote
        style={{
          margin: 0,
          maxWidth: 560,
          fontFamily: 'var(--font-norms-serif, serif)',
          color: 'rgba(247,239,221,0.9)',
          lineHeight: 1.6,
        }}
      >
        Honestly, I never worked with a better partner before. Read the{' '}
        <QuoteLink href="/case-study/gokwik">GoKwik case study</QuoteLink> for
        the full story, or see{' '}
        <QuoteLink href="https://epyc.in">epyc.in</QuoteLink> for more.
      </blockquote>
    </Section>
  )
}

export function Standalone() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <QuoteLink href="/projects">See all our work</QuoteLink>
    </Section>
  )
}
