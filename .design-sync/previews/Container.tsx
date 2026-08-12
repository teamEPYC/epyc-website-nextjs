import { Container, Section } from 'epyc-website'

// Container has no visual style of its own — it constrains width and applies
// the responsive gutters. The dashed outlines are preview scaffolding so the
// three widths are legible; they are not part of the component.
const outline = (color: string) => ({
  outline: `1px dashed ${color}`,
  padding: 16,
})

const label = {
  margin: 0,
  fontSize: 12,
  letterSpacing: '0.04em',
  color: '#183228',
  fontFamily: 'var(--font-inter, sans-serif)',
} as const

export function Widths() {
  return (
    <Section tone="beige">
      <Container width="outer">
        <div style={{ ...outline('#b91646'), marginBottom: 16 }}>
          <p style={label}>width=&quot;outer&quot; — 1440px max, widest shell</p>
        </div>
      </Container>
      <Container width="content">
        <div style={{ ...outline('#183228'), marginBottom: 16 }}>
          <p style={label}>width=&quot;content&quot; — 1150px max, the default page measure</p>
        </div>
      </Container>
      <Container width="prose">
        <div style={outline('#dec8a0')}>
          <p style={label}>width=&quot;prose&quot; — reading measure for long-form copy</p>
        </div>
      </Container>
    </Section>
  )
}

export function InSection() {
  return (
    <Section tone="ink">
      <Container>
        <div style={{ outline: '1px dashed rgba(247,239,221,0.5)', padding: 24 }}>
          <p
            style={{
              ...label,
              color: '#f7efdd',
            }}
          >
            The canonical pairing: Section owns vertical rhythm, Container owns
            horizontal measure and gutters.
          </p>
        </div>
      </Container>
    </Section>
  )
}
