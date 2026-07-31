import { Container, Section } from 'epyc-website'

export default function Preview() {
  return (
    <Section tone="beige">
      <Container width="content">
        <div style={{ outline: '1px dashed #183228', padding: 16, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#183228', fontFamily: 'var(--font-inter, sans-serif)' }}>Container width="content" — 1150px max, 16/24/60px gutters</p>
        </div>
      </Container>
      <Container width="outer">
        <div style={{ outline: '1px dashed #b91646', padding: 16, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#183228', fontFamily: 'var(--font-inter, sans-serif)' }}>Container width="outer" — 1440px max</p>
        </div>
      </Container>
      <Container width="prose">
        <div style={{ outline: '1px dashed #dec8a0', padding: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#183228', fontFamily: 'var(--font-inter, sans-serif)' }}>Container width="prose" — reading width</p>
        </div>
      </Container>
    </Section>
  )
}
