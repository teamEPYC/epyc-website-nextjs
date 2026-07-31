import { Section } from 'epyc-website'

export default function Preview() {
  return (
    <div>
      <Section tone="beige">
        <p style={{ margin: 0, fontFamily: 'var(--font-rationalist, sans-serif)', color: '#183228' }}>Section — beige (default page background)</p>
      </Section>
      <Section tone="ink">
        <p style={{ margin: 0, fontFamily: 'var(--font-rationalist, sans-serif)', color: '#fff0d0' }}>Section — ink (dark green, pair with cream text)</p>
      </Section>
      <Section tone="cream">
        <p style={{ margin: 0, fontFamily: 'var(--font-rationalist, sans-serif)', color: '#183228' }}>Section — cream</p>
      </Section>
    </div>
  )
}
