import { FloatingMenuButton, Section, Container } from 'epyc-website'

// Fixed to the bottom-centre of the viewport (bottom-5, left-1/2) and closed by
// default, so it appears as a small cream pill at the bottom of the card rather
// than in document flow. Expanding it is click-driven and cannot be captured
// statically.
export function DefaultLinks() {
  return (
    <Section tone="beige" style={{ padding: '32px 0', minHeight: 220 }}>
      <Container>
        <p style={{ margin: 0, fontFamily: 'var(--font-norms-serif, serif)', color: '#183228' }}>
          The floating menu pins itself to the bottom of the viewport.
        </p>
      </Container>
      <FloatingMenuButton />
    </Section>
  )
}

export function CustomLinks() {
  return (
    <Section tone="ink" style={{ padding: '32px 0', minHeight: 220 }}>
      <Container>
        <p style={{ margin: 0, fontFamily: 'var(--font-norms-serif, serif)', color: '#f7efdd' }}>
          A trimmed link set.
        </p>
      </Container>
      <FloatingMenuButton
        links={[
          { label: 'Work', href: '/projects' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
    </Section>
  )
}
