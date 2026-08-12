import { Section, Container } from 'epyc-website'

const copy = {
  margin: 0,
  fontFamily: 'var(--font-rationalist, sans-serif)',
} as const

export function Beige() {
  return (
    <Section tone="beige">
      <Container>
        <p style={{ ...copy, color: '#183228' }}>
          tone=&quot;beige&quot; — the default page background
        </p>
      </Container>
    </Section>
  )
}

export function Ink() {
  return (
    <Section tone="ink">
      <Container>
        <p style={{ ...copy, color: '#f7efdd' }}>
          tone=&quot;ink&quot; — dark green; pair text with cream
        </p>
      </Container>
    </Section>
  )
}

export function Cream() {
  return (
    <Section tone="cream">
      <Container>
        <p style={{ ...copy, color: '#183228' }}>tone=&quot;cream&quot;</p>
      </Container>
    </Section>
  )
}

export function Stacked() {
  return (
    <div>
      <Section tone="beige">
        <Container>
          <p style={{ ...copy, color: '#183228' }}>beige</p>
        </Container>
      </Section>
      <Section tone="ink">
        <Container>
          <p style={{ ...copy, color: '#f7efdd' }}>ink</p>
        </Container>
      </Section>
      <Section tone="cream">
        <Container>
          <p style={{ ...copy, color: '#183228' }}>cream</p>
        </Container>
      </Section>
    </div>
  )
}
