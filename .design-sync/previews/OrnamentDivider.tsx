import { OrnamentDivider, Section } from 'epyc-website'

// The decorative rule used above and below testimonial quotes. Rotating it
// 180° is the established way to mirror it under the quote.
export function Default() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <OrnamentDivider />
    </Section>
  )
}

export function OnInk() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <OrnamentDivider className="text-sand/60" />
    </Section>
  )
}

export function FramingAQuote() {
  return (
    <Section tone="ink" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <OrnamentDivider className="text-sand/60" />
        <blockquote
          style={{
            margin: 0,
            fontFamily: 'var(--font-norms-serif, serif)',
            color: 'rgba(247,239,221,0.9)',
          }}
        >
          The experience working with the EPYC team has been excellent.
        </blockquote>
        <OrnamentDivider className="rotate-180 text-sand/60" />
      </div>
    </Section>
  )
}
