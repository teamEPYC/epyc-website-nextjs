import { Textarea, Section } from 'epyc-website'

export function Placeholder() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 480 }}>
        <Textarea placeholder="TELL US ABOUT YOUR PROJECT*" />
      </div>
    </Section>
  )
}

export function Filled() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 480 }}>
        <Textarea defaultValue="We're a Series B fintech replatforming our marketing site off WordPress. We need design and build, ideally shipped in eight weeks." />
      </div>
    </Section>
  )
}

export function Invalid() {
  return (
    <Section tone="beige" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 480 }}>
        <Textarea invalid placeholder="THIS FIELD IS REQUIRED*" />
      </div>
    </Section>
  )
}
